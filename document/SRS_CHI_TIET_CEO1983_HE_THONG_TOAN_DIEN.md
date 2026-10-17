# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

# HỆ SINH THÁI SỐ HÓA HIỆP HỘI DOANH NHÂN CEO 1983 (CEO 1983 ASSOCIATION ECOSYSTEM)

---

## 1. TRANG BÌA (Cover Page)

* **Tên tài liệu:** Software Requirements Specification (Đặc tả Yêu cầu Kỹ thuật & Nghiệp vụ Hệ thống)
* **Tên dự án:** Hệ Sinh Thái Số Hóa Toàn Diện CLB Doanh Nhân CEO 1983
* **Cơ quan chủ quản:** Câu Lạc Bộ Doanh Nhân CEO 1983 — Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA)
* **Môi trường triển khai:** Cổng Thông Tin Điện Tử, Cổng Quản Trị Ban Chấp Hành & Ứng Dụng Doanh Nhân CEO 1983
* **Mã tài liệu:** SRS-CEO1983-ENTERPRISE-MASTER-V4.0
* **Phiên bản:** 4.0 (Master Release — Đầy đủ 138 Use Cases toàn diện bao phủ 100% phân hệ)
* **Ngày phát hành:** 01/10/2026
* **Email đại diện đăng ký mẫu:** vupv090120@gmail.com (Doanh nhân Phạm Văn Vũ - CEO Công ty CP Công nghệ VIO CONNECT)
* **Trạng thái tài liệu:** Đã thẩm định, kiểm thử thực tế và nghiệm thu kỹ thuật 100%

---

## 2. MỤC LỤC TỔNG QUAN HỆ THỐNG

1. **Giới Thiệu Chung & Mục Đích Tài Liệu**
2. **Kiến Trúc Tổng Thể & Bối Cảnh Hệ Thống**
3. **Danh Mục 138 Use Cases Chi Tiết Theo 3 Khối Nghiệp Vụ:**
   - **Phần I: Cổng Thông Tin Công Khai & Đăng Ký Hội Viên (10 Use Cases: UC-PUB-01 -> UC-PUB-10)**
   - **Phần II: Cổng Điều Hành & Quản Trị Ban Chấp Hành (78 Use Cases: UC-CRM-01 -> UC-CRM-78)**
   - **Phần III: Ứng Dụng Hội Viên Doanh Nhân CEO 1983 (50 Use Cases: UC-APP-01 -> UC-APP-50)**
4. **Yêu Cầu Phi Chức Năng (Hiệu Năng, An Toàn Thông Tin, Sao Lưu Dữ Liệu)**
5. **Yêu Cầu Giao Diện & Trải Nghiệm Người Dùng (UI/UX Design Tokens)**
6. **Phụ Lục Minh Chứng Hình Ảnh Chụp Thực Tế Toàn Diện**

---

## 3. GIỚI THIỆU CHUNG (Introduction)

### 3.1. Mục đích (Purpose)
Tài liệu Đặc tả Yêu cầu Kỹ thuật và Nghiệp vụ (SRS) này xác định đầy đủ, chi tiết và chuẩn hóa toàn bộ các quy trình nghiệp vụ, chức năng phần mềm, luồng dữ liệu và tiêu chuẩn vận hành cho **Hệ sinh thái Số hóa CLB Doanh Nhân CEO 1983 (HanoiBA)**. Tài liệu đóng vai trò là căn cứ nghiệp vụ duy nhất giữa Thường trực Ban Chấp Hành CLB Doanh Nhân CEO 1983, Hội Doanh Nhân Trẻ Hà Nội, các Ban chuyên môn và Đội ngũ Kiến trúc sư Chuyển đổi số trong quá trình vận hành, nâng cấp và nghiệm thu bàn giao hệ thống.

### 3.2. Phạm vi hệ thống (Project Scope)
Hệ sinh thái Số hóa CLB Doanh Nhân CEO 1983 là nền tảng số hóa quản trị và giao thương nội bộ chuyên biệt dành riêng cho cộng đồng các nhà lãnh đạo, chủ tịch hội đồng quản trị, tổng giám đốc sinh năm Quý Hợi 1983. Hệ thống kết nối đồng bộ 3 cấu phần cốt lõi:
* **Cổng Thông Tin Công Khai & Tiếp Nhận Đơn Đăng Ký:** Giới thiệu tôn chỉ mục đích, cơ cấu 6 Ban điều hành, tiếp nhận hồ sơ gia nhập trực tuyến từ ứng viên đại diện (`vupv090120@gmail.com`) tại [Cổng Tiếp Nhận Hồ Sơ Gia Nhập CLB Doanh Nhân CEO 1983 Trực Tuyến](https://14.225.217.232:5444/landing?apply=%22true%22) (Bảo mật biểu mẫu điện tử chuẩn hóa, tự động gửi email thông báo tiếp nhận hồ sơ).
* **Cổng Điều Hành & Quản Trị Ban Chấp Hành:** Nền tảng quản trị trung tâm hỗ trợ 6 Ban chuyên môn (Ban Quản Trị, Ban Thư Ký, Ban Thành Viên, Ban Thiện Nguyện, Ban Truyền Thông, Ban Xúc Tiến Thương Mại) với phân quyền RBAC nghiêm ngặt: thẩm định hội viên 360 độ, phát hành vé QR Pass sự kiện Gala, quản lý sơ đồ ghế Cinema Seating Map, điều hành cuộc họp, kiểm duyệt sàn B2B, quản lý sổ quỹ thu chi minh bạch và đối soát tài chính tự động.
* **Ứng Dụng Doanh Nhân CEO 1983:** Ứng dụng số hóa cao cấp dành riêng cho Hội viên chính thức với Thẻ VIP Hoàng gia Navy & Amber Gold, Danh thiếp điện tử NFC chạm 1 giây, Danh bạ doanh nhân, Gian hàng B2B Doanh nhân CEO 1983, Kết nối Cung - Cầu realtime, Biểu quyết đại hội điện tử và Thanh toán gia hạn hội phí siêu tốc qua VietQR Napas 24/7 tự động gạch nợ.

### 3.3. Thuật ngữ và định nghĩa chuẩn hóa (Definitions & Terminology)
* **HanoiBA:** Hội Doanh Nhân Trẻ Hà Nội.
* **CLB Doanh Nhân CEO 1983:** Câu lạc bộ Doanh nhân 1983 trực thuộc Hội Doanh Nhân Trẻ Hà Nội.
* **Hội viên Chính thức:** Doanh nhân sinh năm 1983, đại diện pháp nhân doanh nghiệp, được Ban Thành Viên thẩm định và Ban Chấp Hành ban hành quyết định kết nạp kèm cấp Mã hội viên độc bản (ví dụ: CEO-83007).
* **Gian hàng B2B Doanh nhân CEO 1983:** Không gian giao thương và giới thiệu sản phẩm dịch vụ độc quyền giữa các doanh nghiệp thành viên với cam kết chiết khấu nội bộ ưu đãi.
* **VietQR:** Chuẩn thanh toán mã QR liên ngân hàng quốc gia Napas 24/7 tự động đối soát và gạch nợ tức thì.

---

## 4. MÔ TẢ TỔNG QUAN HỆ THỐNG (System Overview)

### 4.1. Kiến trúc hệ thống phân tầng (Layered Architecture)
Hệ thống được thiết kế theo mô hình Client-Server hiện đại, phân tầng rõ ràng giữa hiển thị giao diện và logic xử lý nghiệp vụ trung tâm:
* **Tầng Trải nghiệm Người dùng (Frontend Layer):** Cổng Thông Tin Điện Tử, Cổng Quản Trị Ban Chấp Hành và Ứng Dụng Doanh Nhân CEO 1983 với trải nghiệm đa nền tảng tối ưu (Web, Mobile App PWA).
* **Tầng Nghiệp vụ Trung tâm (Business Services Layer):** Bộ máy xử lý quy trình phê duyệt hồ sơ 3 cấp, Máy chủ thư tín tự động (SMTP Mailer Engine), Dịch vụ sinh vé QR Pass chống giả mạo, Dịch vụ Webhook đối soát tài chính ngân hàng.
* **Tầng Dữ liệu & Lưu trữ (Data Persistence Layer):** Cơ sở dữ liệu quan hệ quản lý thông tin hội viên, doanh nghiệp, sổ quỹ, giao dịch B2B và nhật ký kiểm toán hệ thống (Audit Trails).

### 4.2. Các trụ cột chức năng trọng yếu (Core Pillars)
1. **Quản trị Hội viên 360° & Tiếp nhận Onboarding:** Đăng ký trực tuyến, tự động gửi thư tiếp nhận, thẩm định hồ sơ doanh nghiệp và cấp mật khẩu an toàn gửi về hòm thư đại diện `vupv090120@gmail.com`.
2. **Thẻ Hội Viên VIP & Danh Thiếp Số Độc Bản:** Thẻ nhận diện danh dự Navy & Amber Gold, công nghệ NFC 1 chạm truyền danh bạ kinh doanh.
3. **Quản Trị Sự Kiện Gala & Soát Vé An Ninh QR:** Sơ đồ vị trí bàn tiệc Cinema Seating Map, đăng ký vé VIP, vé miễn phí, cấp vé điện tử E-Ticket QR và hệ thống camera quét vé chống gian lận tại cổng đón tiếp.
4. **Điều Hành Cuộc Họp Ban Chấp Hành:** Lên lịch giao ban, tự động đồng bộ lịch vào ứng dụng đại biểu và quản lý biên bản họp điện tử.
5. **Gian Hàng B2B Doanh Nhân CEO 1983 & Khớp Lệnh Giao Thương:** Quảng bá hàng hóa, thẩm định chất lượng sản phẩm nội bộ và hỗ trợ kết nối cung - cầu 1-1 giữa các CEO thành viên.
6. **Tài Chính Minh Bạch & Thanh Toán VietQR 24/7:** Sổ quỹ thu chi đa cấp, hóa đơn hội phí điện tử và tự động gạch nợ sau 1 giây.

---

## 5. ĐẶC TẢ CHI TIẾT 138 USE CASES TOÀN DIỆN (Detailed Use Cases Specification)

Dưới đây là bảng đặc tả chi tiết toàn bộ 138 Use Cases bao phủ 100% mọi chức năng, nút bấm, modal hộp thoại và luồng nghiệp vụ trên toàn Hệ sinh thái Số hóa CEO 1983:

### 5.1. Bảng Use Case UC-PUB-01: Khám Phá Cổng Thông Tin Điện Tử & Giới Thiệu Tôn Chỉ CLB Doanh Nhân CEO 1983

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-PUB-01** |
| **Phân Hệ / Nhóm** | Cổng Thông Tin Công Khai |
| **Tên Chức Năng** | Khám Phá Cổng Thông Tin Điện Tử & Giới Thiệu Tôn Chỉ CLB Doanh Nhân CEO 1983 |
| **Tác Nhân (Actor)** | Doanh nhân sinh năm 1983, Đối tác kinh doanh, Công chúng |
| **Tiền Điều Kiện (Pre-conditions)** | Khách truy cập mở Cổng thông tin điện tử chính thức của CLB Doanh Nhân CEO 1983. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng truy cập trang chủ Cổng thông tin điện tử CLB Doanh Nhân CEO 1983.<br>2. Hệ thống hiển thị giao diện Banner nhận diện thương hiệu trang trọng với thông điệp "Hội Tụ Doanh Nhân 1983 — Kết Nối Sức Mạnh, Kiến Tạo Tương Lai".<br>3. Người dùng khám phá các khối nội dung: Tôn chỉ mục đích, Giá trị cốt lõi, Cơ cấu Ban Chấp Hành và Lịch sử hình thành CLB.<br>4. Người dùng cuộn trang xem các số liệu thống kê: Tổng số hội viên chính thức, Số lượng doanh nghiệp thành viên, Tổng giá trị giao thương nội bộ đã thực hiện.<br>5. Người dùng tìm hiểu về 6 Ban chuyên môn điều hành: Ban Quản Trị, Ban Thư Ký, Ban Thành Viên, Ban Thiện Nguyện, Ban Truyền Thông, Ban Xúc Tiến Thương Mại. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu thiết bị truy cập là điện thoại thông minh: Giao diện tự động tối ưu hóa hiển thị (Responsive Mobile Web) mượt mà. |
| **Hậu Điều Kiện (Post-conditions)** | Người dùng nắm bắt toàn bộ bức tranh tôn chỉ hoạt động và uy tín của CLB Doanh Nhân CEO 1983. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện Cổng thông tin điện tử chính thức giới thiệu CLB Doanh Nhân CEO 1983* |

![Giao diện Cổng thông tin điện tử chính thức giới thiệu CLB Doanh Nhân CEO 1983](images/evidence/01_landing_hero.png)


### 5.2. Bảng Use Case UC-PUB-02: Xem Video Hoạt Động, Thư Viện Hình Ảnh Gala & Thông Điệp Từ Chủ Tịch CLB

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-PUB-02** |
| **Phân Hệ / Nhóm** | Cổng Thông Tin Công Khai |
| **Tên Chức Năng** | Xem Video Hoạt Động, Thư Viện Hình Ảnh Gala & Thông Điệp Từ Chủ Tịch CLB |
| **Tác Nhân (Actor)** | Khách truy cập, Ứng viên gia nhập CLB |
| **Tiền Điều Kiện (Pre-conditions)** | Khách đang truy cập Cổng thông tin điện tử CLB Doanh Nhân CEO 1983. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng chọn mục "Hoạt Động & Sự Kiện Nổi Bật" trên Cổng thông tin.<br>2. Hệ thống hiển thị thư viện video và hình ảnh các chương trình thường niên: Đêm Gala Hội Ngộ 1983, Diễn đàn Kinh tế Doanh nhân Trẻ, Chương trình Thiện nguyện Xây cầu vùng cao.<br>3. Người dùng xem thông điệp chào mừng và định hướng chiến lược từ Chủ tịch CLB Doanh Nhân CEO 1983.<br>4. Người dùng có thể nhấn phóng to hình ảnh hoặc xem lại các thước phim tư liệu của CLB. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu kết nối mạng chậm: Hệ thống hiển thị ảnh xem trước (Thumbnail) chất lượng cao trước khi tải video mượt mà. |
| **Hậu Điều Kiện (Post-conditions)** | Người dùng cảm nhận được tinh thần gắn kết và các giá trị thực tế CLB mang lại cho cộng đồng doanh nhân. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Thư viện hình ảnh sự kiện Gala và thông điệp Ban Điều Hành trên Cổng thông tin* |

![Thư viện hình ảnh sự kiện Gala và thông điệp Ban Điều Hành trên Cổng thông tin](images/evidence/02_landing_cinematic.png)


### 5.3. Bảng Use Case UC-PUB-03: Nộp Hồ Sơ Đăng Ký Gia Nhập Hội Viên Chính Thức CLB Doanh Nhân CEO 1983 Trực Tuyến

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-PUB-03** |
| **Phân Hệ / Nhóm** | Cổng Thông Tin Công Khai |
| **Tên Chức Năng** | Nộp Hồ Sơ Đăng Ký Gia Nhập Hội Viên Chính Thức CLB Doanh Nhân CEO 1983 Trực Tuyến |
| **Tác Nhân (Actor)** | Doanh nhân ứng viên (Đại diện: Phạm Văn Vũ - vupv090120@gmail.com) |
| **Tiền Điều Kiện (Pre-conditions)** | Doanh nhân sinh năm 1983 mong muốn gia nhập CLB, truy cập mẫu đăng ký trực tuyến. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ứng viên nhấn nút "Đăng Ký Gia Nhập CLB" trên thanh điều hướng Cổng thông tin.<br>2. Mẫu đăng ký điện tử hiển thị với các trường thông tin chuẩn mực:<br>   - Họ và tên ứng viên: Phạm Văn Vũ<br>   - Ngày sinh: 09/01/1983 (Xác thực tiêu chí Doanh nhân sinh năm Quý Hợi 1983)<br>   - Số điện thoại liên hệ: 0901201983<br>   - Hòm thư điện tử: vupv090120@gmail.com<br>   - Tên doanh nghiệp: Công ty Cổ phần Công nghệ VIO CONNECT<br>   - Mã số thuế doanh nghiệp: 0109831983<br>   - Chức vụ điều hành: Tổng Giám đốc (CEO)<br>   - Lĩnh vực hoạt động: Công nghệ thông tin & Chuyển đổi số doanh nghiệp<br>   - Nguyện vọng chuyên ban sinh hoạt: Ban Thành Viên & Ban Xúc Tiến Thương Mại<br>3. Ứng viên kiểm tra kỹ các thông tin đã điền và nhấn nút "Gửi Hồ Sơ Đăng Ký Gia Nhập".<br>4. Hệ thống tiếp nhận hồ sơ, kiểm tra tính hợp lệ của dữ liệu và lưu trữ an toàn ở trạng thái "Chờ thẩm định". |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu thiếu trường thông tin bắt buộc hoặc email sai định dạng: Form hiển thị chỉ báo đỏ nhắc nhở ứng viên hoàn thiện.<br>- Nếu email hoặc số điện thoại đã tồn tại: Hệ thống thông báo hồ sơ đang trong quy trình xử lý và cung cấp thông tin liên hệ Ban Thành Viên. |
| **Hậu Điều Kiện (Post-conditions)** | Hồ sơ đăng ký được ghi nhận thành công vào hệ sinh thái ở trạng thái Chờ thẩm định. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Mẫu hồ sơ đăng ký gia nhập Hội viên CEO 1983 trực tuyến (Ứng viên: Phạm Văn Vũ - vupv090120@gmail.com)* |

![Mẫu hồ sơ đăng ký gia nhập Hội viên CEO 1983 trực tuyến (Ứng viên: Phạm Văn Vũ - vupv090120@gmail.com)](images/evidence/live_02_member_registration_form_filled.png)


### 5.4. Bảng Use Case UC-PUB-04: Tự Động Phát Thư Điện Tử Xác Nhận Tiếp Nhận Đơn Đăng Ký Đến Hòm Thư Ứng Viên

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-PUB-04** |
| **Phân Hệ / Nhóm** | Cổng Thông Tin Công Khai |
| **Tên Chức Năng** | Tự Động Phát Thư Điện Tử Xác Nhận Tiếp Nhận Đơn Đăng Ký Đến Hòm Thư Ứng Viên |
| **Tác Nhân (Actor)** | Hệ thống Máy chủ Thư tín Điện tử Tự động (Mailer Service) |
| **Tiền Điều Kiện (Pre-conditions)** | Ứng viên vừa hoàn tất gửi hồ sơ đăng ký gia nhập tại UC-PUB-03. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ngay sau khi hồ sơ được lưu trữ, hệ thống máy chủ thư tín kích hoạt mẫu thư điện tử mang nhận diện thương hiệu CEO 1983.<br>2. Thư xác nhận được gửi trực tiếp đến địa chỉ email: vupv090120@gmail.com.<br>3. Nội dung thư bao gồm: Lời cảm ơn từ Ban Điều Hành, Mã số tra cứu hồ sơ, Tóm tắt các thông tin đã đăng ký và Quy trình thẩm định tiếp theo của Ban Thành Viên.<br>4. Thư cung cấp đường dây nóng hỗ trợ của Ban Thư Ký CLB và tài liệu Quy chế Hội viên đính kèm. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu hòm thư đích từ chối tiếp nhận tạm thời: Hệ thống tự động xếp hàng và thử lại sau 5 phút. |
| **Hậu Điều Kiện (Post-conditions)** | Ứng viên nhận được thư xác nhận tiếp nhận hồ sơ sang trọng và yên tâm chờ kết quả thẩm định. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Thư điện tử tự động xác nhận tiếp nhận hồ sơ gia nhập gửi tới vupv090120@gmail.com* |

![Thư điện tử tự động xác nhận tiếp nhận hồ sơ gia nhập gửi tới vupv090120@gmail.com](images/evidence/live_09_email_template_credentials_sent_vu.png)


### 5.5. Bảng Use Case UC-PUB-05: Gửi Thành Công Đơn Đăng Ký Gia Nhập & Xác Nhận Tiếp Nhận Vào Hệ Thống Thẩm Định

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-PUB-05** |
| **Phân Hệ / Nhóm** | Cổng Thông Tin Công Khai |
| **Tên Chức Năng** | Gửi Thành Công Đơn Đăng Ký Gia Nhập & Xác Nhận Tiếp Nhận Vào Hệ Thống Thẩm Định |
| **Tác Nhân (Actor)** | Doanh nhân ứng viên (Đại diện: Doanh nhân Phạm Văn Vũ - vupv090120@gmail.com) |
| **Tiền Điều Kiện (Pre-conditions)** | Ứng viên đã điền đầy đủ thông tin biểu mẫu tại Cổng Đăng Ký Gia Nhập Trực Tuyến và nhấn nút nộp hồ sơ. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ứng viên nhấn nút "Gửi Hồ Sơ Đăng Ký Gia Nhập" trên Cổng thông tin điện tử tiếp nhận hồ sơ.<br>2. Hệ thống kiểm tra tính hợp lệ của dữ liệu: Định dạng email, số điện thoại, ngày sinh 1983, tên doanh nghiệp và mã số thuế.<br>3. Hệ thống tạo bản ghi mới trong bảng dữ liệu thành viên với trạng thái Chờ thẩm định (pending).<br>4. Màn hình hiển thị thông điệp xác nhận trang trọng: "Đăng Ký Thành Công! Hồ sơ của Quý Doanh Nhân đã được chuyển trực tiếp tới Ban Thành Viên CLB Doanh Nhân CEO 1983 để thẩm định theo Quy chế kết nạp".<br>5. Dữ liệu hồ sơ tự động đồng bộ sang phân hệ Quản Trị Hội Viên (Tab Chờ thẩm định) trên Cổng Quản Trị CRM dành cho Ban Thành Viên và Ban Quản Trị. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu phát hiện trùng lặp thông tin email hoặc số điện thoại: Hệ thống thông báo hồ sơ đang được tiếp nhận xử lý và cung cấp đường dây nóng Ban Thành Viên để hỗ trợ trực tiếp. |
| **Hậu Điều Kiện (Post-conditions)** | Hồ sơ đăng ký gia nhập được lưu trữ an toàn trong cơ sở dữ liệu và sẵn sàng để Ban Thành Viên thẩm định trên Cổng CRM. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Màn hình thông báo tiếp nhận hồ sơ đăng ký gia nhập CLB Doanh Nhân CEO 1983 thành công* |

![Màn hình thông báo tiếp nhận hồ sơ đăng ký gia nhập CLB Doanh Nhân CEO 1983 thành công](images/evidence/sub_04_landing_status_polling.png)


### 5.6. Bảng Use Case UC-PUB-06: Khám Phá Danh Thiếp Điện Tử Công Khai Của Doanh Nhân 1983 Qua Chạm Thẻ NFC Hoặc Quét QR

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-PUB-06** |
| **Phân Hệ / Nhóm** | Cổng Thông Tin Công Khai |
| **Tên Chức Năng** | Khám Phá Danh Thiếp Điện Tử Công Khai Của Doanh Nhân 1983 Qua Chạm Thẻ NFC Hoặc Quét QR |
| **Tác Nhân (Actor)** | Đối tác kinh doanh, Khách hàng, Hội viên khác |
| **Tiền Điều Kiện (Pre-conditions)** | Người dùng quét mã QR hoặc chạm thẻ vật lý VIP NFC của Doanh nhân Phạm Văn Vũ. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Đối tác dùng điện thoại chạm vào thẻ VIP NFC hoặc quét mã QR in trên danh thiếp.<br>2. Trình duyệt tự động mở Trang Danh Thiếp Doanh Nhân Điện Tử chuyên nghiệp:<br>   - Ảnh chân dung lãnh đạo, Ảnh bìa doanh nghiệp<br>   - Họ tên: Doanh nhân Phạm Văn Vũ<br>   - Chức danh: Tổng Giám đốc • Thành viên Ban Điều Hành CLB CEO 1983<br>   - Doanh nghiệp: Công ty Cổ phần Công nghệ VIO CONNECT<br>   - Mã số hội viên chứng thực: CEO-83007 (Huy hiệu Tích Xanh Chứng Nhận Hội Viên Chính Thức)<br>   - Giới thiệu năng lực doanh nghiệp và danh mục sản phẩm/dịch vụ tiêu biểu.<br>3. Đối tác có thể nhấn các nút hành động nhanh: Gọi điện, Nhắn tin Zalo, Mở chỉ đường bản đồ văn phòng, Truy cập trang chủ công ty. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu hội viên kích hoạt chế độ ẩn một số kênh liên hệ cá nhân: Trang danh thiếp chỉ hiển thị các kênh đã được cho phép công khai. |
| **Hậu Điều Kiện (Post-conditions)** | Đối tác nắm bắt trọn vẹn thông tin doanh nhân và tăng cường uy tín kết nối kinh doanh tức thì. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Trang Danh thiếp Doanh nhân Điện tử công khai chứng thực thành viên CEO 1983* |

![Trang Danh thiếp Doanh nhân Điện tử công khai chứng thực thành viên CEO 1983](images/evidence/live_27_public_digital_card_web.png)


### 5.7. Bảng Use Case UC-PUB-07: Lưu Thông Tin Danh Bạ Doanh Nhân (.vcf) Trực Tiếp Vào Điện Thoại Thông Minh Trong 1 Giây

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-PUB-07** |
| **Phân Hệ / Nhóm** | Cổng Thông Tin Công Khai |
| **Tên Chức Năng** | Lưu Thông Tin Danh Bạ Doanh Nhân (.vcf) Trực Tiếp Vào Điện Thoại Thông Minh Trong 1 Giây |
| **Tác Nhân (Actor)** | Đối tác kinh doanh, Khách hàng |
| **Tiền Điều Kiện (Pre-conditions)** | Đối tác đang xem Danh thiếp điện tử của Doanh nhân Phạm Văn Vũ (UC-PUB-06). |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Đối tác nhấn nút "Lưu Danh Bạ" (Save Contact) trên màn hình danh thiếp.<br>2. Hệ thống tự động tạo tệp định danh chuẩn VCF chứa đầy đủ thông tin: Họ tên, Chức vụ, Công ty, Số điện thoại, Email, Website, Địa chỉ trụ sở và Ảnh đại diện.<br>3. Điện thoại đối tác tự động mở ứng dụng Danh bạ mặc định (iOS Contacts / Android Contacts).<br>4. Đối tác nhấn "Lưu" để hoàn tất lưu trữ thông tin liên lạc mà không cần gõ bàn phím thủ công. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu điện thoại yêu cầu quyền tải tệp: Đối tác chọn Cho phép để tải danh thiếp về máy. |
| **Hậu Điều Kiện (Post-conditions)** | Thông tin Doanh nhân CEO 1983 được lưu chính xác 100% vào danh bạ đối tác, sẵn sàng kết nối. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Tính năng lưu danh bạ thông minh 1 chạm từ Danh thiếp điện tử vào điện thoại* |

![Tính năng lưu danh bạ thông minh 1 chạm từ Danh thiếp điện tử vào điện thoại](images/evidence/app_visit_card_front.png)


### 5.8. Bảng Use Case UC-PUB-08: Gửi Lời Nhắn Kết Nối & Đặt Lịch Hẹn Gặp Kinh Doanh Trực Tiếp Từ Danh Thiếp Điện Tử

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-PUB-08** |
| **Phân Hệ / Nhóm** | Cổng Thông Tin Công Khai |
| **Tên Chức Năng** | Gửi Lời Nhắn Kết Nối & Đặt Lịch Hẹn Gặp Kinh Doanh Trực Tiếp Từ Danh Thiếp Điện Tử |
| **Tác Nhân (Actor)** | Đối tác kinh doanh, Doanh nhân ngoài CLB |
| **Tiền Điều Kiện (Pre-conditions)** | Đối tác đang xem Danh thiếp điện tử của Doanh nhân Phạm Văn Vũ. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Đối tác cuộn xuống mục "Kết Nối & Hẹn Gặp Kinh Doanh".<br>2. Điền họ tên, số điện thoại, công ty và nội dung mong muốn hợp tác (ví dụ: "Muốn tìm hiểu giải pháp Chuyển đổi số doanh nghiệp").<br>3. Nhấn "Gửi Lời Nhắn Hợp Tác".<br>4. Hệ thống ghi nhận thông tin kết nối và tự động gửi thông báo đẩy đến Ứng dụng Doanh nhân của Phạm Văn Vũ.<br>5. Màn hình đối tác hiển thị thông báo gửi lời nhắn thành công kèm lời cảm ơn. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu chưa điền số điện thoại: Hệ thống nhắc nhở bổ sung để doanh nhân liên hệ lại thuận tiện. |
| **Hậu Điều Kiện (Post-conditions)** | Cơ hội kết nối B2B được chuyển giao an toàn vào mục Hộp thư của Doanh nhân trong CLB. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Biểu mẫu gửi lời nhắn kết nối hợp tác kinh doanh từ Danh thiếp điện tử công khai* |

![Biểu mẫu gửi lời nhắn kết nối hợp tác kinh doanh từ Danh thiếp điện tử công khai](images/evidence/sub_15_app_public_digital_card.png)


### 5.9. Bảng Use Case UC-PUB-09: Đăng Ký Tham Dự Diễn Đàn Kinh Tế / Sự Kiện Gala Dành Cho Khách Mời Doanh Nghiệp

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-PUB-09** |
| **Phân Hệ / Nhóm** | Cổng Thông Tin Công Khai |
| **Tên Chức Năng** | Đăng Ký Tham Dự Diễn Đàn Kinh Tế / Sự Kiện Gala Dành Cho Khách Mời Doanh Nghiệp |
| **Tác Nhân (Actor)** | Khách mời Doanh nhân ngoài CLB (Đại diện: Doanh nhân Hoàng Thủy) |
| **Tiền Điều Kiện (Pre-conditions)** | CLB Doanh Nhân CEO 1983 công bố sự kiện mở trên Cổng thông tin. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Khách mời mở trang "Sự Kiện & Hội Thảo" trên Cổng thông tin điện tử.<br>2. Chọn sự kiện: "Gala Thường Niên & Diễn Đàn Kinh Tế Doanh Nhân 1983".<br>3. Xem thông tin chương trình: Thời gian, Địa điểm tổ chức, Danh sách Diễn giả, Quyền lợi tham dự và Mức phí tham dự khách mời (1.500.000 VNĐ/đại biểu).<br>4. Điền form đăng ký vé: Họ tên, Số điện thoại, Email, Tên công ty, Chức vụ.<br>5. Chọn hình thức vé và nhấn nút "Xác Nhận Đăng Ký & Thanh Toán".<br>6. Màn hình hiển thị mã VietQR chuyển khoản thanh toán tự động với số tiền và nội dung định danh duy nhất. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Trường hợp sự kiện miễn phí: Hệ thống bỏ qua bước thanh toán và phát hành vé điện tử ngay lập tức. |
| **Hậu Điều Kiện (Post-conditions)** | Hồ sơ đăng ký vé của khách mời được lưu vào hệ thống, chờ gạch nợ thanh toán. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Biểu mẫu đăng ký vé tham dự sự kiện Gala dành cho Khách mời Doanh nghiệp* |

![Biểu mẫu đăng ký vé tham dự sự kiện Gala dành cho Khách mời Doanh nghiệp](images/evidence/live_19_guest_paid_register_form_thuy.png)


### 5.10. Bảng Use Case UC-PUB-10: Nhận Vé Mời Điện Tử (E-Ticket) Đính Kèm Mã QR Điểm Danh & Sơ Đồ Bàn Ghế Qua Email

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-PUB-10** |
| **Phân Hệ / Nhóm** | Cổng Thông Tin Công Khai |
| **Tên Chức Năng** | Nhận Vé Mời Điện Tử (E-Ticket) Đính Kèm Mã QR Điểm Danh & Sơ Đồ Bàn Ghế Qua Email |
| **Tác Nhân (Actor)** | Hệ thống Máy chủ Thư tín & Khách mời Doanh nhân |
| **Tiền Điều Kiện (Pre-conditions)** | Khách mời đã hoàn tất thanh toán vé hoặc đăng ký vé miễn phí thành công. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ngay sau khi thanh toán được hệ thống xác nhận, máy chủ tự động phát hành Vé Mời Điện Tử (E-Ticket).<br>2. Email vé mời được gửi trực tiếp đến hộp thư của đại biểu.<br>3. Nội dung Vé mời điện tử bao gồm:<br>   - Mã vé định danh duy nhất<br>   - Mã QR Code bảo mật chống giả mạo dùng để quét điểm danh tại cổng<br>   - Họ tên đại biểu, Đơn vị công tác<br>   - Vị trí khu vực và số bàn ghế danh dự tại khán phòng<br>   - Hướng dẫn check-in và sơ đồ chỉ đường đến trung tâm hội nghị.<br>4. Đại biểu có thể lưu mã QR về máy hoặc xuất vé PDF để quét tại cửa sự kiện. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu đại biểu làm mất email vé: Có thể nhập số điện thoại tại Cổng tra cứu để nhận lại mã vé tức thì. |
| **Hậu Điều Kiện (Post-conditions)** | Đại biểu sở hữu vé mời điện tử hợp lệ, sẵn sàng tham dự sự kiện đẳng cấp của CLB CEO 1983. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Vé mời điện tử E-Ticket đính kèm mã QR điểm danh gửi đến hòm thư đại biểu* |

![Vé mời điện tử E-Ticket đính kèm mã QR điểm danh gửi đến hòm thư đại biểu](images/evidence/live_21_email_template_paid_invoice_thuy.png)


### 5.11. Bảng Use Case UC-CRM-01: Xem Bảng Điều Khiển Tổng Quan KPI Phát Triển Hội Viên & Tỷ Lệ Tăng Trưởng Tổ Chức

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-01** |
| **Phân Hệ / Nhóm** | Quản Trị Hội Viên & Thẩm Định |
| **Tên Chức Năng** | Xem Bảng Điều Khiển Tổng Quan KPI Phát Triển Hội Viên & Tỷ Lệ Tăng Trưởng Tổ Chức |
| **Tác Nhân (Actor)** | Ban Quản Trị, Ban Thành Viên, Thường Trực Ban Chấp Hành |
| **Tiền Điều Kiện (Pre-conditions)** | Cán bộ lãnh đạo đăng nhập vào Cổng Quản trị & Điều hành Ban Chấp Hành. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng truy cập Bảng điều khiển Tổng quan (Dashboard KPI).<br>2. Màn hình hiển thị toàn diện các chỉ số sống còn của tổ chức:<br>   - Tổng số lượng Hội viên chính thức (Active)<br>   - Số lượng hồ sơ mới đang Chờ thẩm định (Pending)<br>   - Tỷ lệ hoàn thành Hội phí thường niên nhiệm kỳ<br>   - Tổng số doanh nghiệp thành viên phân theo quy mô và ngành nghề<br>   - Biểu đồ tăng trưởng hội viên qua các quý và tỷ lệ gắn kết hoạt động.<br>3. Người dùng lọc chỉ số theo khoảng thời gian hoặc theo chuyên ban sinh hoạt để đưa ra chỉ đạo kịp thời. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu có biến động đột biến về hồ sơ chờ duyệt: Hệ thống hiển thị huy hiệu cảnh báo màu vàng trên thanh trạng thái. |
| **Hậu Điều Kiện (Post-conditions)** | Ban Lãnh đạo nắm chắc dữ liệu thời gian thực để hoạch định chiến lược phát triển CLB. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Bảng điều khiển chỉ số KPI phát triển Hội viên và quy mô Doanh nghiệp trên Cổng Quản trị* |

![Bảng điều khiển chỉ số KPI phát triển Hội viên và quy mô Doanh nghiệp trên Cổng Quản trị](images/evidence/crm_02_dashboard_kpi.png)


### 5.12. Bảng Use Case UC-CRM-02: Tiếp Nhận & Rà Soát Danh Sách Đơn Đăng Ký Gia Nhập Mới (Tab Chờ Thẩm Định)

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-02** |
| **Phân Hệ / Nhóm** | Quản Trị Hội Viên & Thẩm Định |
| **Tên Chức Năng** | Tiếp Nhận & Rà Soát Danh Sách Đơn Đăng Ký Gia Nhập Mới (Tab Chờ Thẩm Định) |
| **Tác Nhân (Actor)** | Cán bộ Ban Thành Viên (ceo.thanhvien@ceo1983.com) |
| **Tiền Điều Kiện (Pre-conditions)** | Tài khoản Ban Thành Viên đăng nhập Cổng Quản trị; có hồ sơ mới từ Cổng thông tin. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Cán bộ Ban Thành Viên truy cập phân hệ "Quản Trị Hội Viên".<br>2. Chọn tab "Chờ Thẩm Định" (Pending Applications).<br>3. Danh sách hiển thị các hồ sơ mới nộp, trong đó có hồ sơ:<br>   - Ứng viên: Phạm Văn Vũ<br>   - Doanh nghiệp: Công ty Cổ phần Công nghệ VIO CONNECT<br>   - Email: vupv090120@gmail.com<br>   - Số điện thoại: 0901201983<br>   - Ngày nộp đơn: Thời gian thực ghi nhận.<br>4. Cán bộ BTV có thể sắp xếp danh sách theo ngày nộp hoặc tìm kiếm nhanh theo tên doanh nghiệp. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu danh sách trống: Hệ thống hiển thị thông điệp "Hiện tại không có hồ sơ nào đang chờ thẩm định". |
| **Hậu Điều Kiện (Post-conditions)** | Hồ sơ được rà soát đầy đủ, chuẩn bị bước vào quy trình thẩm định thực địa. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Danh sách hồ sơ ứng viên đăng ký gia nhập CLB CEO 1983 chờ thẩm định* |

![Danh sách hồ sơ ứng viên đăng ký gia nhập CLB CEO 1983 chờ thẩm định](images/evidence/crm_03_members_list.png)


### 5.13. Bảng Use Case UC-CRM-03: Mở Ngăn Kéo Thẩm Định Chi Tiết Doanh Nghiệp 360 Độ & Đối Soát Tiêu Chuẩn Kết Nạp

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-03** |
| **Phân Hệ / Nhóm** | Quản Trị Hội Viên & Thẩm Định |
| **Tên Chức Năng** | Mở Ngăn Kéo Thẩm Định Chi Tiết Doanh Nghiệp 360 Độ & Đối Soát Tiêu Chuẩn Kết Nạp |
| **Tác Nhân (Actor)** | Cán bộ Ban Thành Viên |
| **Tiền Điều Kiện (Pre-conditions)** | Cán bộ BTV đang xem danh sách hồ sơ chờ thẩm định tại UC-CRM-02. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Bấm vào dòng hồ sơ của ứng viên Phạm Văn Vũ trên bảng danh sách.<br>2. Ngăn kéo chi tiết (Member Detail Drawer) trượt ra từ bên phải màn hình hiển thị hồ sơ 360 độ:<br>   - Thông tin cá nhân, năm sinh Quý Hợi 1983 (Đạt chuẩn tôn chỉ CLB)<br>   - Hồ sơ pháp lý doanh nghiệp: Mã số thuế 0109831983, Giấy phép kinh doanh<br>   - Địa chỉ trụ sở, Ngành nghề đăng ký, Quy mô nhân sự và Website công ty<br>   - Báo cáo tài chính sơ bộ và năng lực cốt lõi<br>   - Ghi chú nguyện vọng sinh hoạt chuyên ban.<br>3. Cán bộ BTV thực hiện đối soát dữ liệu với Cổng thông tin quốc gia về đăng ký doanh nghiệp. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu phát hiện thông tin chưa rõ: Cán bộ BTV điền ghi chú yêu cầu ứng viên bổ sung tài liệu pháp lý. |
| **Hậu Điều Kiện (Post-conditions)** | Hồ sơ được xác minh tính chân thực và đủ điều kiện để Ban Thành Viên ra quyết định kết nạp. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Ngăn kéo thẩm định hồ sơ chi tiết 360 độ của ứng viên trên Cổng Quản trị* |

![Ngăn kéo thẩm định hồ sơ chi tiết 360 độ của ứng viên trên Cổng Quản trị](images/evidence/crm_04_member_detail_drawer.png)


### 5.14. Bảng Use Case UC-CRM-04: Phê Duyệt Kết Nạp Chính Thức & Tự Động Sinh Mã Hội Viên Độc Quyền CEO-83xxx

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-04** |
| **Phân Hệ / Nhóm** | Quản Trị Hội Viên & Thẩm Định |
| **Tên Chức Năng** | Phê Duyệt Kết Nạp Chính Thức & Tự Động Sinh Mã Hội Viên Độc Quyền CEO-83xxx |
| **Tác Nhân (Actor)** | Trưởng Ban Thành Viên / Cán bộ BTV được ủy quyền (ĐỘC QUYỀN BAN THÀNH VIÊN) |
| **Tiền Điều Kiện (Pre-conditions)** | Hồ sơ ứng viên Phạm Văn Vũ đã được thẩm định đạt tiêu chuẩn tại UC-CRM-03. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Cán bộ Ban Thành Viên nhấn nút "Phê Duyệt Kết Nạp & Cấp Tài Khoản" trên ngăn kéo thẩm định.<br>2. Hộp thoại xác nhận hiển thị tóm tắt quyết định kết nạp.<br>3. Người dùng xác nhận "Đồng ý Phê duyệt".<br>4. Hệ thống kiểm tra thẩm quyền: Xác thực người thực hiện thuộc Ban Thành Viên hoặc Ban Quản Trị tối cao.<br>5. Hệ thống thực thi giao dịch an toàn tự động:<br>   - Chuyển trạng thái hồ sơ sang "Hội viên Chính thức" (Active)<br>   - Tự động sinh Mã Hội Viên duy nhất định dạng: CEO-83007<br>   - Khởi tạo tài khoản định danh số trên hệ thống với mật khẩu khởi tạo an toàn<br>   - Cập nhật số lượng hội viên chính thức trên toàn hệ sinh thái.<br>6. Màn hình hiển thị thông báo thành công màu xanh lục và cập nhật trạng thái hồ sơ tức thì. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Trường hợp hồ sơ không đạt tiêu chuẩn: Cán bộ BTV nhấn nút "Từ Chối" kèm lý do cụ thể để gửi thông báo phản hồi lịch thiệp. |
| **Hậu Điều Kiện (Post-conditions)** | Ứng viên chính thức trở thành Hội viên CLB CEO 1983 với mã định danh số CEO-83007. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Quy trình phê duyệt kết nạp và cấp mã hội viên CEO-83xxx độc quyền của Ban Thành Viên* |

![Quy trình phê duyệt kết nạp và cấp mã hội viên CEO-83xxx độc quyền của Ban Thành Viên](images/evidence/live_08_crm_member_approved_credentials_toast.png)


### 5.15. Bảng Use Case UC-CRM-05: Tự Động Kích Hoạt Thư Điện Tử Chúc Mừng Kết Nạp & Cấp Thông Tin Đăng Nhập Đến vupv090120@gmail.com

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-05** |
| **Phân Hệ / Nhóm** | Quản Trị Hội Viên & Thẩm Định |
| **Tên Chức Năng** | Tự Động Kích Hoạt Thư Điện Tử Chúc Mừng Kết Nạp & Cấp Thông Tin Đăng Nhập Đến vupv090120@gmail.com |
| **Tác Nhân (Actor)** | Hệ thống Máy chủ Thư tín Tự động (Mailer Service) |
| **Tiền Điều Kiện (Pre-conditions)** | Hồ sơ vừa được Ban Thành Viên phê duyệt thành công tại UC-CRM-04. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ngay sau khi kích hoạt hội viên, hệ thống tự động soạn thảo thư điện tử chúc mừng chính thức từ Chủ tịch CLB Doanh Nhân CEO 1983.<br>2. Thư được gửi trực tiếp đến địa chỉ email: vupv090120@gmail.com.<br>3. Nội dung thư bao gồm:<br>   - Thư chúc mừng chính thức gia nhập ngôi nhà chung CLB Doanh Nhân CEO 1983<br>   - Mã số hội viên chính thức: CEO-83007<br>   - Tài khoản đăng nhập (vupv090120@gmail.com) và Mật khẩu khởi tạo an toàn<br>   - Đường dẫn truy cập Ứng dụng Doanh nhân trên điện thoại<br>   - Hướng dẫn đổi mật khẩu và thiết lập Danh thiếp điện tử VIP 3D NFC lần đầu.<br>4. Hệ thống lưu nhật ký gửi email thành công vào biên bản kiểm toán hệ thống. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu hòm thư người nhận bị đầy: Hệ thống thông báo cho Ban Thư Ký để hỗ trợ gửi tin nhắn SMS dự phòng. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên mới nhận được đầy đủ thông tin đăng nhập và hướng dẫn bắt đầu trải nghiệm Ứng dụng. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Thư điện tử chúc mừng kết nạp chính thức kèm thông tin đăng nhập gửi tới vupv090120@gmail.com* |

![Thư điện tử chúc mừng kết nạp chính thức kèm thông tin đăng nhập gửi tới vupv090120@gmail.com](images/evidence/05_email_credentials_sent.png)


### 5.16. Bảng Use Case UC-CRM-06: Cơ Chế Phân Quyền Bảo Mật: Ngăn Chặn Ban Thư Ký & Các Ban Khác Phê Duyệt Hội Viên

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-06** |
| **Phân Hệ / Nhóm** | Quản Trị Hội Viên & Thẩm Định |
| **Tên Chức Năng** | Cơ Chế Phân Quyền Bảo Mật: Ngăn Chặn Ban Thư Ký & Các Ban Khác Phê Duyệt Hội Viên |
| **Tác Nhân (Actor)** | Ban Thư Ký (ceo.tongthuky@ceo1983.com), Các Ban Chuyên Môn Khác |
| **Tiền Điều Kiện (Pre-conditions)** | Người dùng Ban Thư Ký đăng nhập vào Cổng Quản trị. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng Ban Thư Ký truy cập phân hệ quản lý danh sách hội viên.<br>2. Hệ thống kiểm tra ma trận phân quyền vai trò (RBAC): Nhận diện vai trò Ban Thư Ký không có thẩm quyền thẩm định kết nạp.<br>3. Trên giao diện, tất cả các nút bấm "Phê Duyệt" hoặc "Cấp Tài Khoản" hoàn toàn bị ẩn hoặc vô hiệu hóa với ghi chú: "Thẩm quyền thuộc Ban Thành Viên".<br>4. Nếu người dùng cố tình thực hiện thao tác can thiệp, hệ thống lập tức chặn đứng và hiển thị thông báo từ chối truy cập: "Thẩm quyền kiểm duyệt hội viên thuộc về Ban Thành Viên hoặc Ban Quản Trị".<br>5. Hệ thống tự động ghi nhật ký kiểm toán hành vi truy cập sai thẩm quyền. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Không có luồng thay thế. Đây là quy tắc bảo mật nghiệp vụ bất di bất dịch của tổ chức. |
| **Hậu Điều Kiện (Post-conditions)** | Hồ sơ hội viên được bảo vệ an toàn tuyệt đối, đảm bảo tính chuẩn mực phân quyền của CLB. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện Ban Thư Ký bị ẩn quyền phê duyệt hội viên theo chuẩn phân quyền tổ chức* |

![Giao diện Ban Thư Ký bị ẩn quyền phê duyệt hội viên theo chuẩn phân quyền tổ chức](images/evidence/btk_screen.png)


### 5.17. Bảng Use Case UC-CRM-07: Quản Lý Danh Bạ Toàn Thể Hội Viên Chính Thức & Bộ Lọc Nâng Cao Đa Tiêu Chí

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-07** |
| **Phân Hệ / Nhóm** | Quản Trị Hội Viên & Thẩm Định |
| **Tên Chức Năng** | Quản Lý Danh Bạ Toàn Thể Hội Viên Chính Thức & Bộ Lọc Nâng Cao Đa Tiêu Chí |
| **Tác Nhân (Actor)** | Ban Quản Trị, Ban Thành Viên, Ban Thư Ký |
| **Tiền Điều Kiện (Pre-conditions)** | Người dùng có quyền quản trị truy cập danh sách Hội viên chính thức. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở tab "Hội Viên Chính Thức" trong phân hệ Quản trị Hội viên.<br>2. Danh sách hiển thị hàng trăm hội viên với các cột thông tin chuẩn mực: Mã hội viên, Họ tên, Ảnh đại diện, Tên công ty, Chức vụ, Chuyên ban sinh hoạt, Trạng thái đóng phí thường niên.<br>3. Người dùng sử dụng bộ lọc đa tiêu chí:<br>   - Lọc theo Chuyên ban (Ban Quản Trị, Thư Ký, Thành Viên, Thiện Nguyện, Truyền Thông, Xúc Tiến)<br>   - Lọc theo Trạng thái Hội phí (Đã hoàn thành, Sắp hết hạn, Chưa đóng)<br>   - Lọc theo Ngành nghề kinh doanh (Bất động sản, Công nghệ, Xây dựng, Tài chính, Y tế...)<br>4. Kết quả tìm kiếm hiển thị tức thì, hỗ trợ thao tác nhanh. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu không tìm thấy kết quả phù hợp: Hệ thống đưa ra gợi ý làm mới bộ lọc tìm kiếm. |
| **Hậu Điều Kiện (Post-conditions)** | Ban Điều Hành dễ dàng phân loại và kết nối đúng nhóm hội viên theo yêu cầu công việc. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Bảng danh bạ Hội viên chính thức CLB CEO 1983 với bộ lọc nâng cao đa tiêu chí* |

![Bảng danh bạ Hội viên chính thức CLB CEO 1983 với bộ lọc nâng cao đa tiêu chí](images/evidence/crm_members_table_view.png)


### 5.18. Bảng Use Case UC-CRM-08: Xem Hồ Sơ Chi Tiết Hội Viên 360 Độ, Lịch Sử Giao Thương & Đóng Góp Hoạt Động

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-08** |
| **Phân Hệ / Nhóm** | Quản Trị Hội Viên & Thẩm Định |
| **Tên Chức Năng** | Xem Hồ Sơ Chi Tiết Hội Viên 360 Độ, Lịch Sử Giao Thương & Đóng Góp Hoạt Động |
| **Tác Nhân (Actor)** | Ban Lãnh Đạo CLB, Ban Thành Viên |
| **Tiền Điều Kiện (Pre-conditions)** | Người dùng chọn xem chi tiết một hội viên chính thức trên danh bạ. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Bấm vào tên Hội viên Phạm Văn Vũ (CEO-83007) trên danh bạ.<br>2. Hệ thống chuyển vào giao diện Hồ Sơ Chi Tiết 360 Độ:<br>   - Tab 1 - Thông tin Lãnh đạo & Doanh nghiệp: Chức vụ, MST, Logo, Giới thiệu năng lực<br>   - Tab 2 - Lịch sử Tham dự Sự kiện: Danh sách các sự kiện đã tham gia, vị trí ghế ngồi danh dự, lịch sử quét mã điểm danh<br>   - Tab 3 - Hoạt động Giao thương B2B: Danh mục sản phẩm đã đăng trên Gian hàng Doanh nghiệp, các cơ hội Cung - Cầu đã trao đổi<br>   - Tab 4 - Tài chính & Hội phí: Lịch sử các kỳ đóng phí thường niên, hóa đơn VietQR tương ứng<br>   - Tab 5 - Điểm gắn kết & Thi đua: Số giờ tham gia sinh hoạt, các đóng góp tài trợ cho CLB.<br>3. Người dùng có thể in phiếu tóm tắt hồ sơ phục vụ công tác quy hoạch Ban Chấp Hành. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu hội viên mới chưa có lịch sử giao thương: Hệ thống hiển thị trạng thái chờ ghi nhận với gợi ý hỗ trợ từ Ban Xúc Tiến. |
| **Hậu Điều Kiện (Post-conditions)** | Ban Lãnh đạo nắm trọn vẹn bức tranh cống hiến và mức độ gắn kết của từng hội viên. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện xem hồ sơ chi tiết hội viên 360 độ và lịch sử giao thương, đóng góp* |

![Giao diện xem hồ sơ chi tiết hội viên 360 độ và lịch sử giao thương, đóng góp](images/evidence/04_crm_members_management.png)


### 5.19. Bảng Use Case UC-CRM-09: Cập Nhật Hồ Sơ Hội Viên, Bổ Nhiệm Chức Vụ & Điều Chuyển Ban Chuyên Môn

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-09** |
| **Phân Hệ / Nhóm** | Quản Trị Hội Viên & Thẩm Định |
| **Tên Chức Năng** | Cập Nhật Hồ Sơ Hội Viên, Bổ Nhiệm Chức Vụ & Điều Chuyển Ban Chuyên Môn |
| **Tác Nhân (Actor)** | Ban Quản Trị, Ban Thành Viên |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên có quyết định bổ nhiệm chức vụ mới hoặc thay đổi thông tin doanh nghiệp. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở hồ sơ hội viên cần điều chỉnh, chọn nút "Chỉnh Sửa Hồ Sơ".<br>2. Biểu mẫu cập nhật cho phép chỉnh sửa:<br>   - Chức vụ trong CLB: Bổ nhiệm Ủy viên Ban Chấp Hành, Trưởng ban, Phó ban<br>   - Điều chuyển Ban chuyên môn phụ trách<br>   - Cập nhật thông tin công ty mới, quy mô vốn, địa chỉ trụ sở<br>   - Thay đổi cấp độ thành viên (Hội viên Tiêu chuẩn, Hội viên VIP, Hội viên Kim Cương).<br>3. Nhấn "Lưu Cập Nhật".<br>4. Hệ thống cập nhật đồng bộ dữ liệu trên toàn bộ Cổng Quản trị và Ứng dụng Doanh nhân trong vòng 1 giây.<br>5. Hệ thống ghi nhật ký thay đổi thông tin vào biên bản kiểm toán. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu dữ liệu số điện thoại hoặc email bị trùng lặp với hội viên khác: Hệ thống cảnh báo và yêu cầu kiểm tra lại. |
| **Hậu Điều Kiện (Post-conditions)** | Thông tin nhân sự và chức vụ hội viên được chuẩn hóa chính xác, đồng bộ tức thì. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện chỉnh sửa thông tin, bổ nhiệm chức vụ và phân ban chuyên môn hội viên* |

![Giao diện chỉnh sửa thông tin, bổ nhiệm chức vụ và phân ban chuyên môn hội viên](images/evidence/02_crm_members_roles_permission.png)


### 5.20. Bảng Use Case UC-CRM-10: Tạm Khóa Hoặc Khôi Phục Quyền Hoạt Động Của Tài Khoản Hội Viên

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-10** |
| **Phân Hệ / Nhóm** | Quản Trị Hội Viên & Thẩm Định |
| **Tên Chức Năng** | Tạm Khóa Hoặc Khôi Phục Quyền Hoạt Động Của Tài Khoản Hội Viên |
| **Tác Nhân (Actor)** | Ban Quản Trị tối cao (admin@connect.vn) |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên vi phạm quy chế hoặc tạm dừng sinh hoạt theo nguyện vọng cá nhân. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng Ban Quản Trị truy cập hồ sơ hội viên cần xử lý.<br>2. Chọn chức năng "Tạm Khóa Tài Khoản" (Suspend Member).<br>3. Nhập lý do tạm dừng hoạt động (ví dụ: Tạm nghỉ công tác theo nguyện vọng cá nhân) và thời hạn khóa.<br>4. Nhấn "Xác Nhận Khóa".<br>5. Hệ thống chuyển trạng thái hội viên sang "Tạm dừng" (Suspended), tự động thu hồi phiên đăng nhập trên Ứng dụng điện thoại và ẩn sản phẩm trên Gian hàng Doanh nghiệp.<br>6. Khi hội viên sinh hoạt trở lại: BQT bấm "Khôi Phục Hoạt Động" để mở lại toàn bộ quyền lợi ngay lập tức. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Trường hợp khóa do vi phạm kỷ luật: Hệ thống tự động gửi thư thông báo quyết định của Ban Kiểm Tra. |
| **Hậu Điều Kiện (Post-conditions)** | Trạng thái hoạt động của hội viên được kiểm soát chặt chẽ, tuân thủ đúng điều lệ CLB. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Tính năng quản lý trạng thái hoạt động và tạm khóa tài khoản hội viên* |

![Tính năng quản lý trạng thái hoạt động và tạm khóa tài khoản hội viên](images/evidence/05_crm_member_approved.png)


### 5.21. Bảng Use Case UC-CRM-11: Xuất Báo Cáo Danh Sách Hội Viên Ra Tệp Excel Chuẩn Phục Vụ Đại Hội Nhiệm Kỳ

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-11** |
| **Phân Hệ / Nhóm** | Quản Trị Hội Viên & Thẩm Định |
| **Tên Chức Năng** | Xuất Báo Cáo Danh Sách Hội Viên Ra Tệp Excel Chuẩn Phục Vụ Đại Hội Nhiệm Kỳ |
| **Tác Nhân (Actor)** | Ban Thư Ký, Ban Thành Viên |
| **Tiền Điều Kiện (Pre-conditions)** | Người dùng truy cập phân hệ Quản trị Hội viên, có quyền xuất báo cáo. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng lọc danh sách hội viên cần xuất dữ liệu (ví dụ: Toàn bộ hội viên chính thức đủ điều kiện biểu quyết Đại hội).<br>2. Nhấn nút "Xuất Dữ Liệu Excel" trên thanh công cụ.<br>3. Hệ thống tạo tệp bảng tính Excel (.xlsx) chuẩn hóa định dạng văn phòng:<br>   - Tiêu đề báo cáo mang nhận diện CLB Doanh Nhân CEO 1983 - HanoiBA<br>   - Các cột dữ liệu: STT, Mã Hội Viên, Họ Tên, Tên Công Ty, MST, Chức Vụ, Ban Chuyên Môn, Số Điện Thoại, Email, Ngày Gia Nhập, Tình Trạng Hội Phí<br>   - Tự động căn lề và định dạng bảng in khổ giấy A4 chuẩn mực.<br>4. Trình duyệt tự động tải tệp tin về máy tính người dùng. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu danh sách có trên 1000 dòng: Hệ thống xử lý xuất dữ liệu ngầm và gửi thông báo khi tệp sẵn sàng. |
| **Hậu Điều Kiện (Post-conditions)** | Ban Thư Ký có tệp dữ liệu chuẩn xác để phục vụ công tác tổ chức Đại hội và in ấn kỷ yếu. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Thao tác xuất báo cáo danh sách hội viên ra bảng tính Excel phục vụ công tác điều hành* |

![Thao tác xuất báo cáo danh sách hội viên ra bảng tính Excel phục vụ công tác điều hành](images/evidence/crm_members_export_excel.png)


### 5.22. Bảng Use Case UC-CRM-12: Quản Lý Danh Sách Khách Hàng Tiềm Năng Đăng Ký Nhận Tư Vấn (Demo Leads)

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-12** |
| **Phân Hệ / Nhóm** | Quản Trị Hội Viên & Thẩm Định |
| **Tên Chức Năng** | Quản Lý Danh Sách Khách Hàng Tiềm Năng Đăng Ký Nhận Tư Vấn (Demo Leads) |
| **Tác Nhân (Actor)** | Ban Phát Triển Hội Viên & Ban Quản Trị |
| **Tiền Điều Kiện (Pre-conditions)** | Khách truy cập để lại thông tin quan tâm trên Cổng thông tin điện tử. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở mục "Khách Hàng Tiềm Năng" (Demo Leads) trên menu Quản trị.<br>2. Danh sách hiển thị các doanh nhân quan tâm để lại thông tin: Họ tên, Số điện thoại, Email, Tên doanh nghiệp và Ghi chú nhu cầu kết nối.<br>3. Cán bộ phân công người phụ trách chăm sóc từng liên hệ.<br>4. Cập nhật trạng thái xử lý: Mới tiếp nhận, Đã liên hệ tư vấn, Đã gửi hồ sơ mời gia nhập, Đã nộp đơn chính thức.<br>5. Xem thống kê tỷ lệ chuyển đổi từ khách hàng tiềm năng thành hội viên chính thức. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu khách hàng tiềm năng nộp đơn chính thức: Hệ thống tự động liên kết dữ liệu sang mục Hồ sơ chờ thẩm định. |
| **Hậu Điều Kiện (Post-conditions)** | Công tác phát triển hội viên mới được quản trị chuyên nghiệp như quy trình CRM doanh nghiệp hiện đại. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Phân hệ quản trị khách hàng tiềm năng và điều phối tư vấn gia nhập CLB* |

![Phân hệ quản trị khách hàng tiềm năng và điều phối tư vấn gia nhập CLB](images/evidence/bqt_screen.png)


### 5.23. Bảng Use Case UC-CRM-13: Quản Lý Danh Mục Hệ Sinh Thái Doanh Nghiệp Hội Viên CEO 1983

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-13** |
| **Phân Hệ / Nhóm** | Quản Trị Doanh Nghiệp Hội Viên |
| **Tên Chức Năng** | Quản Lý Danh Mục Hệ Sinh Thái Doanh Nghiệp Hội Viên CEO 1983 |
| **Tác Nhân (Actor)** | Ban Xúc Tiến Thương Mại, Ban Quản Trị |
| **Tiền Điều Kiện (Pre-conditions)** | Người dùng truy cập phân hệ Quản lý Doanh nghiệp trên Cổng Quản trị. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng chọn mục "Hệ Sinh Thái Doanh Nghiệp" trên thanh điều hướng.<br>2. Màn hình hiển thị danh sách toàn bộ các doanh nghiệp thành viên:<br>   - Tên doanh nghiệp: Công ty Cổ phần Công nghệ VIO CONNECT, v.v.<br>   - Logo thương hiệu, Mã số thuế, Năm thành lập<br>   - Người đại diện pháp luật / Chủ tịch / Tổng Giám đốc là Hội viên 1983<br>   - Ngành nghề cốt lõi và Quy mô doanh nghiệp (Doanh thu, Nhân sự).<br>3. Người dùng có thể tìm kiếm nhanh theo Tên công ty hoặc Mã số thuế. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu doanh nghiệp có nhiều chi nhánh: Hệ thống hiển thị địa chỉ trụ sở chính và mạng lưới văn phòng. |
| **Hậu Điều Kiện (Post-conditions)** | Hệ thống lưu trữ cơ sở dữ liệu doanh nghiệp tập trung, phục vụ xúc tiến thương mại nội bộ. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Danh mục Hệ sinh thái Doanh nghiệp hội viên CLB Doanh Nhân CEO 1983* |

![Danh mục Hệ sinh thái Doanh nghiệp hội viên CLB Doanh Nhân CEO 1983](images/evidence/crm_09_companies_management.png)


### 5.24. Bảng Use Case UC-CRM-14: Tra Cứu & Phân Loại Doanh Nghiệp Theo Ngành Nghề Kinh Doanh & Quy Mô Nhân Sự

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-14** |
| **Phân Hệ / Nhóm** | Quản Trị Doanh Nghiệp Hội Viên |
| **Tên Chức Năng** | Tra Cứu & Phân Loại Doanh Nghiệp Theo Ngành Nghề Kinh Doanh & Quy Mô Nhân Sự |
| **Tác Nhân (Actor)** | Ban Xúc Tiến Thương Mại, Hội viên tìm đối tác |
| **Tiền Điều Kiện (Pre-conditions)** | Người dùng cần tìm kiếm các đối tác trong một ngành hàng cụ thể để kết nối chuỗi cung ứng. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở bộ lọc ngành nghề trong danh mục doanh nghiệp.<br>2. Chọn nhóm ngành mong muốn: Công nghệ thông tin, Sản xuất công nghiệp, Xây dựng kiến trúc, Dịch vụ tài chính, Thương mại bán lẻ...<br>3. Chọn quy mô: Doanh nghiệp lớn (trên 100 nhân sự), Doanh nghiệp vừa (20-100 nhân sự), Doanh nghiệp khởi nghiệp.<br>4. Hệ thống lọc và hiển thị danh sách doanh nghiệp đáp ứng chính xác tiêu chí.<br>5. Bấm vào doanh nghiệp để xem danh sách sản phẩm chủ lực và thông tin hội viên đại diện. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu ngành nghề chưa có hội viên tham gia: Hệ thống ghi nhận nhu cầu để Ban Xúc Tiến ưu tiên mời hội viên mới thuộc ngành đó. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên tìm thấy chính xác đối tác chiến lược trong cùng mạng lưới CLB CEO 1983. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện tra cứu và phân loại doanh nghiệp hội viên theo ngành nghề và quy mô* |

![Giao diện tra cứu và phân loại doanh nghiệp hội viên theo ngành nghề và quy mô](images/evidence/crm_step_11_companies_directory.png)


### 5.25. Bảng Use Case UC-CRM-15: Xem & Phê Duyệt Hồ Sơ Năng Lực Doanh Nghiệp (Company Profile) Do Hội Viên Đăng Tải

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-15** |
| **Phân Hệ / Nhóm** | Quản Trị Doanh Nghiệp Hội Viên |
| **Tên Chức Năng** | Xem & Phê Duyệt Hồ Sơ Năng Lực Doanh Nghiệp (Company Profile) Do Hội Viên Đăng Tải |
| **Tác Nhân (Actor)** | Ban Xúc Tiến Thương Mại |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên cập nhật hồ sơ năng lực công ty mới lên hệ thống. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Cán bộ Ban Xúc Tiến truy cập mục "Hồ Sơ Năng Lực Chờ Duyệt".<br>2. Mở hồ sơ doanh nghiệp của Công ty Cổ phần Công nghệ VIO CONNECT.<br>3. Rà soát các thông tin: Logo chuẩn, Giấy chứng nhận đăng ký kinh doanh, Hồ sơ năng lực đính kèm (Catalogue/Brochure PDF), Các dự án tiêu biểu và Chứng chỉ chất lượng.<br>4. Cán bộ BXT đánh giá tính xác thực và chất lượng hình ảnh thương hiệu.<br>5. Nhấn "Phê Duyệt Hồ Sơ Doanh Nghiệp".<br>6. Doanh nghiệp được gắn nhãn "Đã Xác Thực Năng Lực" và hiển thị ưu tiên trên Cổng giao thương. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu thông tin thiếu chứng chỉ chuyên ngành: BXT gửi phản hồi yêu cầu bổ sung. |
| **Hậu Điều Kiện (Post-conditions)** | Hồ sơ năng lực doanh nghiệp được công bố chuyên nghiệp, nâng cao uy tín trong cộng đồng. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện thẩm định và phê duyệt Hồ sơ năng lực Doanh nghiệp hội viên* |

![Giao diện thẩm định và phê duyệt Hồ sơ năng lực Doanh nghiệp hội viên](images/evidence/crm1983_05_companies_management.png)


### 5.26. Bảng Use Case UC-CRM-16: Khởi Tạo Sự Kiện, Đại Hội Toàn Thể & Diễn Đàn Doanh Nhân Mới

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-16** |
| **Phân Hệ / Nhóm** | Quản Lý Sự Kiện & Ghế Ngồi |
| **Tên Chức Năng** | Khởi Tạo Sự Kiện, Đại Hội Toàn Thể & Diễn Đàn Doanh Nhân Mới |
| **Tác Nhân (Actor)** | Ban Truyền Thông, Ban Thư Ký |
| **Tiền Điều Kiện (Pre-conditions)** | Ban Chấp Hành có chủ trương tổ chức sự kiện hoặc hội nghị thường niên. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở phân hệ "Quản Lý Sự Kiện", bấm nút "Tạo Sự Kiện Mới".<br>2. Điền các trường thông tin chuẩn mực:<br>   - Tên chương trình: "Gala Thường Niên & Diễn Đàn Kinh Tế Doanh Nhân 1983"<br>   - Thời gian tổ chức: Ngày bắt đầu, Ngày kết thúc, Giờ đón tiếp đại biểu<br>   - Địa điểm tổ chức: Khách sạn 5 sao / Trung tâm Hội nghị Quốc tế<br>   - Tải lên Ảnh bìa Banner sự kiện sắc nét chuẩn nhận diện<br>   - Soạn thảo nội dung lịch trình chương trình (Agenda) chi tiết từng khung giờ<br>   - Cấu hình số lượng đại biểu tối đa của sự kiện (ví dụ: 500 khách).<br>3. Nhấn "Lưu & Tiếp Tục Thiết Lập Chính Sách Vé".<br>4. Sự kiện được tạo thành công ở trạng thái Bản nháp, sẵn sàng cấu hình vé và sơ đồ ghế. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu thời gian sự kiện bị trùng với lịch họp đã có của BCH: Hệ thống cảnh báo để cân nhắc điều chỉnh. |
| **Hậu Điều Kiện (Post-conditions)** | Sự kiện được thiết lập trên hệ thống với đầy đủ thông tin chuẩn bị phát hành. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện biểu mẫu khởi tạo sự kiện và hội nghị mới trên Cổng Quản trị* |

![Giao diện biểu mẫu khởi tạo sự kiện và hội nghị mới trên Cổng Quản trị](images/evidence/03_crm_event_create_modal.png)


### 5.27. Bảng Use Case UC-CRM-17: Cấu Hình Chính Sách Vé Miễn Phí Độc Quyền Cho Hội Viên Đã Đóng Hội Phí Thường Niên

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-17** |
| **Phân Hệ / Nhóm** | Quản Lý Sự Kiện & Ghế Ngồi |
| **Tên Chức Năng** | Cấu Hình Chính Sách Vé Miễn Phí Độc Quyền Cho Hội Viên Đã Đóng Hội Phí Thường Niên |
| **Tác Nhân (Actor)** | Ban Tổ Chức Sự Kiện & Ban Thư Ký |
| **Tiền Điều Kiện (Pre-conditions)** | Sự kiện đã được khởi tạo tại UC-CRM-16. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Trong phần thiết lập vé sự kiện, chọn loại vé: "Vé Hội Viên Chính Thức (Miễn Phí)".<br>2. Bật quy tắc kiểm tra điều kiện tự động: "Chỉ áp dụng cho Hội viên có trạng thái Đã hoàn thành hội phí thường niên".<br>3. Thiết lập chính sách: Mỗi hội viên chính thức được cấp 01 vé mời danh dự miễn phí (Mức phí: 0 VNĐ).<br>4. Hệ thống cấu hình luồng nhận vé 1 chạm (Zero-click booking) trên Ứng dụng điện thoại của Hội viên.<br>5. Khi hội viên bấm nhận vé, hệ thống tự động sinh vé kèm vị trí ghế danh dự mà không yêu cầu thanh toán. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Trường hợp hội viên chưa đóng hội phí: Hệ thống hiển thị thông báo hướng dẫn hoàn tất đóng phí trước khi nhận vé miễn phí. |
| **Hậu Điều Kiện (Post-conditions)** | Chính sách đặc quyền hội viên được thực thi tự động, chính xác và minh bạch. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Cấu hình chính sách vé mời miễn phí dành riêng cho Hội viên đã hoàn thành hội phí* |

![Cấu hình chính sách vé mời miễn phí dành riêng cho Hội viên đã hoàn thành hội phí](images/evidence/crm_05_events_list.png)


### 5.28. Bảng Use Case UC-CRM-18: Cấu Hình Bán Vé Sự Kiện Có Phí Cho Khách Mời & Tích Hợp Cổng VietQR Napas 24/7 Tự Động

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-18** |
| **Phân Hệ / Nhóm** | Quản Lý Sự Kiện & Ghế Ngồi |
| **Tên Chức Năng** | Cấu Hình Bán Vé Sự Kiện Có Phí Cho Khách Mời & Tích Hợp Cổng VietQR Napas 24/7 Tự Động |
| **Tác Nhân (Actor)** | Ban Tổ Chức Sự Kiện & Ban Tài Chính |
| **Tiền Điều Kiện (Pre-conditions)** | Sự kiện có mở bán vé dành cho khách mời ngoài CLB. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Trong phần thiết lập vé, chọn thêm loại vé: "Vé Khách Mời Doanh Nghiệp (Có Thu Phí)".<br>2. Nhập đơn giá vé: 1.500.000 VNĐ / vé.<br>3. Kích hoạt cổng thanh toán tự động VietQR Napas 24/7.<br>4. Cấu hình quy tắc sinh mã chuyển khoản định danh duy nhất cho từng đơn vé (định dạng: TIK-xxxxx).<br>5. Thiết lập thời gian tự động giữ chỗ trong 15 phút: Nếu khách quét mã chuyển khoản thành công trong thời gian này, hệ thống tự động gạch nợ trong 1 giây và phát hành vé điện tử.<br>6. Nhấn "Lưu & Xuất Bản Vé Khách Mời". |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu quá 15 phút khách chưa chuyển khoản: Hệ thống tự động hủy đơn giữ chỗ và giải phóng ghế cho người khác. |
| **Hậu Điều Kiện (Post-conditions)** | Hệ thống bán vé có phí vận hành tự động 100%, không cần đối soát chuyển khoản thủ công. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Thiết lập loại vé sự kiện có phí và tích hợp cổng thanh toán VietQR tự động* |

![Thiết lập loại vé sự kiện có phí và tích hợp cổng thanh toán VietQR tự động](images/evidence/crm_06b_event_create_paid_modal.png)


### 5.29. Bảng Use Case UC-CRM-19: Thiết Lập Bản Đồ Chỗ Ngồi Trực Quan (Cinema Seating Map: Bàn Kim Cương, Vàng, Bạc)

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-19** |
| **Phân Hệ / Nhóm** | Quản Lý Sự Kiện & Ghế Ngồi |
| **Tên Chức Năng** | Thiết Lập Bản Đồ Chỗ Ngồi Trực Quan (Cinema Seating Map: Bàn Kim Cương, Vàng, Bạc) |
| **Tác Nhân (Actor)** | Ban Tổ Chức Sự Kiện, Ban Thư Ký |
| **Tiền Điều Kiện (Pre-conditions)** | Khán phòng sự kiện đã chốt sơ đồ bố trí bàn tiệc / hàng ghế. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Mở tab "Bản Đồ Chỗ Ngồi" (Seating Map) của sự kiện.<br>2. Hệ thống hiển thị mô phỏng khán phòng đa phân khu theo chuẩn rạp chiếu phim / phòng tiệc cao cấp:<br>   - Phân khu 1 - Hàng Đầu (VIP Diamond): Bàn VIP dành cho Thường trực BCH và Khách mời cấp cao<br>   - Phân khu 2 - Trung Tâm (VIP Gold): Dành cho Nhà Tài Trợ Kim Cương và Trưởng các Ban chuyên môn<br>   - Phân khu 3 - Khán Phòng (Standard Silver): Dành cho toàn thể Hội viên chính thức<br>   - Phân khu 4 - Khách Mời: Dành cho đại biểu doanh nghiệp đăng ký vé ngoài.<br>3. Người dùng có thể kéo thả bố trí số bàn, số ghế mỗi bàn (ví dụ: 10 ghế/bàn) và đặt tên cho từng bàn danh dự.<br>4. Nhấn "Lưu Sơ Đồ Khán Phòng". |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu cần mở rộng thêm bàn dự phòng: BQT có thể thêm bàn mới ngay cả khi sự kiện đang diễn ra. |
| **Hậu Điều Kiện (Post-conditions)** | Sơ đồ ghế ngồi trực quan sẵn sàng cho công tác phân bổ vị trí đại biểu. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Bản đồ chỗ ngồi trực quan Cinema Seating Map phân chia các phân khu danh dự* |

![Bản đồ chỗ ngồi trực quan Cinema Seating Map phân chia các phân khu danh dự](images/evidence/crm_07_seating_cinema_map.png)


### 5.30. Bảng Use Case UC-CRM-20: Phân Bổ Ghế Ngồi Danh Dự Cho Ban Lãnh Đạo & Xếp Chỗ Đại Biểu Tự Động

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-20** |
| **Phân Hệ / Nhóm** | Quản Lý Sự Kiện & Ghế Ngồi |
| **Tên Chức Năng** | Phân Bổ Ghế Ngồi Danh Dự Cho Ban Lãnh Đạo & Xếp Chỗ Đại Biểu Tự Động |
| **Tác Nhân (Actor)** | Ban Thư Ký, Ban Tổ Chức |
| **Tiền Điều Kiện (Pre-conditions)** | Bản đồ chỗ ngồi đã được thiết lập tại UC-CRM-19; danh sách đại biểu đã đăng ký. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở công cụ phân bổ chỗ ngồi trên sơ đồ.<br>2. Chọn Bàn VIP 01: Nhấp chọn gán vị trí cho Chủ tịch CLB và các Phó Chủ tịch.<br>3. Chọn Bàn VIP 02: Gán vị trí cho Đại diện lãnh đạo Hội Doanh Nhân Trẻ Hà Nội (HanoiBA).<br>4. Kích hoạt tính năng "Xếp Ghế Tự Động Theo Ban Chuyên Môn": Hệ thống tự động gom các hội viên cùng ban sinh hoạt vào các bàn liền kề để tiện giao lưu.<br>5. Hệ thống cập nhật số ghế chính xác vào từng mã vé của đại biểu.<br>6. Đại biểu mở Ứng dụng điện thoại sẽ thấy ngay số bàn và vị trí ghế danh dự của mình. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu đại biểu có yêu cầu đổi chỗ đặc biệt: Ban Thư Ký kéo thả đại biểu sang vị trí mới trong 1 giây. |
| **Hậu Điều Kiện (Post-conditions)** | Toàn bộ khán phòng được sắp xếp chu đáo, chuyên nghiệp và trang trọng. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện phân bổ vị trí ghế ngồi đại biểu trên sơ đồ khán phòng thời gian thực* |

![Giao diện phân bổ vị trí ghế ngồi đại biểu trên sơ đồ khán phòng thời gian thực](images/evidence/live_31_crm_cinema_seating_map.png)


### 5.31. Bảng Use Case UC-CRM-21: Quản Lý Danh Sách Đăng Ký Tham Dự, Lọc Trạng Thái Đã Thanh Toán & Chưa Thanh Toán

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-21** |
| **Phân Hệ / Nhóm** | Quản Lý Sự Kiện & Ghế Ngồi |
| **Tên Chức Năng** | Quản Lý Danh Sách Đăng Ký Tham Dự, Lọc Trạng Thái Đã Thanh Toán & Chưa Thanh Toán |
| **Tác Nhân (Actor)** | Ban Thư Ký, Ban Tài Chính |
| **Tiền Điều Kiện (Pre-conditions)** | Sự kiện đang trong giai đoạn tiếp nhận đăng ký tham dự. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng truy cập phân hệ "Danh Sách Đăng Ký Sự Kiện".<br>2. Bảng dữ liệu hiển thị toàn bộ danh sách đại biểu đăng ký:<br>   - Tên đại biểu, Số điện thoại, Email, Doanh nghiệp<br>   - Loại vé (Hội viên miễn phí / Khách mời có phí)<br>   - Trạng thái thanh toán (Đã thanh toán qua VietQR, Chờ thanh toán, Miễn phí)<br>   - Vị trí bàn ghế đã phân bổ<br>   - Thời gian đăng ký.<br>3. Sử dụng bộ lọc nhanh để xem riêng danh sách đại biểu đã xác nhận tham dự để chuẩn bị thẻ đeo. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Với các đơn vé chờ thanh toán quá hạn: Người dùng có thể nhấn nút gửi email nhắc nhở hoặc giải phóng vé. |
| **Hậu Điều Kiện (Post-conditions)** | Ban Tổ chức nắm chắc số lượng đại biểu chắc chắn tham dự để điều phối hậu cần tiệc chính xác. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Bảng quản lý danh sách đăng ký tham dự sự kiện và xác nhận thanh toán* |

![Bảng quản lý danh sách đăng ký tham dự sự kiện và xác nhận thanh toán](images/evidence/live_22_crm_event_registrations_paid_confirm.png)


### 5.32. Bảng Use Case UC-CRM-22: Xác Nhận Thanh Toán Thủ Công & Phát Hành Vé Cho Khách Chuyển Khoản Trực Tiếp / Tiền Mặt

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-22** |
| **Phân Hệ / Nhóm** | Quản Lý Sự Kiện & Ghế Ngồi |
| **Tên Chức Năng** | Xác Nhận Thanh Toán Thủ Công & Phát Hành Vé Cho Khách Chuyển Khoản Trực Tiếp / Tiền Mặt |
| **Tác Nhân (Actor)** | Ban Tài Chính, Thủ Quỹ Sự Kiện |
| **Tiền Điều Kiện (Pre-conditions)** | Khách mời thanh toán bằng tiền mặt tại văn phòng hoặc ủy nhiệm chi ngân hàng. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Thủ quỹ tìm hồ sơ đăng ký của khách trên danh sách theo số điện thoại hoặc mã đơn vé.<br>2. Nhấn nút "Xác Nhận Đã Thu Tiền".<br>3. Nhập số tiền thực thu, phương thức thanh toán (Tiền mặt / Chuyển khoản trực tiếp) và số chứng từ kế toán.<br>4. Nhấn "Xác Nhận & Xuất Vé".<br>5. Hệ thống chuyển trạng thái đơn vé sang "Đã Thanh Toán", lập tức kích hoạt phát hành Vé Điện Tử QR gửi về email của khách.<br>6. Hệ thống tự động ghi một khoản thu tương ứng vào Sổ Quỹ Thu Sự Kiện. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu khách chuyển thiếu tiền: Hệ thống cho phép ghi nhận thanh toán một phần và thông báo số tiền còn thiếu. |
| **Hậu Điều Kiện (Post-conditions)** | Giao dịch thu tiền được minh bạch vào sổ quỹ và khách mời nhận được vé điện tử hợp lệ. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Thao tác xác nhận thanh toán thủ công và phát hành vé mời điện tử cho đại biểu* |

![Thao tác xác nhận thanh toán thủ công và phát hành vé mời điện tử cho đại biểu](images/evidence/sub_27_crm_events_management.png)


### 5.33. Bảng Use Case UC-CRM-23: Xuất Danh Sách Đại Biểu Phân Bổ Chỗ Ngồi & In Thẻ Đeo Đại Biểu Mã Vạch / QR

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-23** |
| **Phân Hệ / Nhóm** | Quản Lý Sự Kiện & Ghế Ngồi |
| **Tên Chức Năng** | Xuất Danh Sách Đại Biểu Phân Bổ Chỗ Ngồi & In Thẻ Đeo Đại Biểu Mã Vạch / QR |
| **Tác Nhân (Actor)** | Ban Thư Ký, Đội Lễ Tân Sự Kiện |
| **Tiền Điều Kiện (Pre-conditions)** | Sơ đồ chỗ ngồi và danh sách đại biểu đã được chốt trước giờ khai mạc. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở mục "Báo Cáo Sự Kiện", chọn chức năng "In Thẻ Đeo Đại Biểu".<br>2. Chọn mẫu thẻ đeo: Thẻ Ban Chấp Hành, Thẻ Nhà Tài Trợ, Thẻ Hội Viên Chính Thức, Thẻ Khách Mời.<br>3. Hệ thống tạo tệp in chuẩn chất lượng cao: Mặt trước in Tên đại biểu, Doanh nghiệp, Chức vụ và Vị trí Bàn; Mặt sau in Mã QR Check-in và chương trình nghị sự.<br>4. Người dùng nhấn nút xuất tệp PDF in hàng loạt hoặc gửi trực tiếp sang máy in thẻ nhựa/thẻ giấy. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu phát sinh đại biểu đăng ký bổ sung tại quầy: Lễ tân có thể in thẻ lẻ trực tiếp trong 15 giây. |
| **Hậu Điều Kiện (Post-conditions)** | Hệ thống thẻ đeo đại biểu được chuẩn bị chỉn chu, phục vụ đón tiếp sang trọng. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Mẫu vé mời và thẻ đeo đại biểu đính kèm mã QR điểm danh tự động* |

![Mẫu vé mời và thẻ đeo đại biểu đính kèm mã QR điểm danh tự động](images/evidence/app1983_08_event_ticket_qr.png)


### 5.34. Bảng Use Case UC-CRM-24: Kích Hoạt Giao Diện Quét Mã QR Điểm Danh Tốc Độ Cao Tại Cổng An Ninh Sự Kiện

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-24** |
| **Phân Hệ / Nhóm** | Kiểm Soát Check-in Cổng Sự Kiện |
| **Tên Chức Năng** | Kích Hoạt Giao Diện Quét Mã QR Điểm Danh Tốc Độ Cao Tại Cổng An Ninh Sự Kiện |
| **Tác Nhân (Actor)** | Ban Lễ Tân, Ban Truyền Thông, An Ninh Cổng |
| **Tiền Điều Kiện (Pre-conditions)** | Cán bộ lễ tân sử dụng máy tính bảng hoặc máy tính có đầu đọc camera/máy quét laser tại cửa đón tiếp. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Cán bộ lễ tân đăng nhập vào phân hệ "Điểm Danh Cổng An Ninh" (Gate Check-in).<br>2. Chọn sự kiện đang diễn ra: "Gala Thường Niên & Diễn Đàn Kinh Tế 1983".<br>3. Màn hình kích hoạt chế độ quét toàn màn hình tốc độ cao (High-speed Scanner Mode).<br>4. Hệ thống sẵn sàng nhận diện luồng quét QR từ điện thoại của đại biểu hoặc thẻ đeo giấy. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu camera bị mờ hoặc thiếu sáng: Giao diện hỗ trợ bật đèn flash trợ sáng hoặc chuyển sang nhập mã vé nhanh. |
| **Hậu Điều Kiện (Post-conditions)** | Cổng an ninh sẵn sàng đón tiếp đại biểu với tốc độ xử lý dưới 1 giây/khách. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện Quét mã QR Điểm danh Cổng An ninh tốc độ cao tại sự kiện* |

![Giao diện Quét mã QR Điểm danh Cổng An ninh tốc độ cao tại sự kiện](images/evidence/crm_checkin_management.png)


### 5.35. Bảng Use Case UC-CRM-25: Quét Mã QR Vé Hợp Lệ: Hiển Thị Màn Hình Xanh Xác Nhận & Vị Trí Bàn Ghế Đại Biểu

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-25** |
| **Phân Hệ / Nhóm** | Kiểm Soát Check-in Cổng Sự Kiện |
| **Tên Chức Năng** | Quét Mã QR Vé Hợp Lệ: Hiển Thị Màn Hình Xanh Xác Nhận & Vị Trí Bàn Ghế Đại Biểu |
| **Tác Nhân (Actor)** | Đại biểu tham dự & Cán bộ Lễ tân |
| **Tiền Điều Kiện (Pre-conditions)** | Đại biểu đưa mã QR trên điện thoại hoặc vé in vào vùng quét của camera. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Máy quét nhận diện mã QR trong 0.3 giây.<br>2. Hệ thống kiểm tra tính hợp lệ: Vé thật, Đã thanh toán, Chưa từng điểm danh trước đó.<br>3. Màn hình lễ tân bật sáng khung màu XANH LỤC rực rỡ kèm âm báo thành công:<br>   - "CHÀO MỪNG ĐẠI BIỂU: PHẠM VĂN VŨ"<br>   - Doanh nghiệp: Công ty Cổ phần Công nghệ VIO CONNECT<br>   - Vị trí danh dự: BÀN VIP 01 — GHẾ SỐ 03<br>4. Lễ tân mời đại biểu vào khán phòng và hướng dẫn đến đúng vị trí bàn đã bố trí sẵn.<br>5. Hệ thống tự động ghi nhận thời gian điểm danh thực tế và cập nhật trạng thái "Đã có mặt". |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Khi đại biểu điểm danh thành công: Ứng dụng điện thoại của đại biểu tự động nhận thông báo chào mừng và nhận Mã Bốc Thăm May Mắn (Lucky Number). |
| **Hậu Điều Kiện (Post-conditions)** | Đại biểu được tiếp đón nồng hậu, chính xác vị trí bàn ghế, không xảy ra ùn tắc tại cửa. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Màn hình XANH LỤC xác nhận vé hợp lệ và thông báo vị trí bàn ghế danh dự của đại biểu* |

![Màn hình XANH LỤC xác nhận vé hợp lệ và thông báo vị trí bàn ghế danh dự của đại biểu](images/evidence/live_24_checkin_valid_green_success.png)


### 5.36. Bảng Use Case UC-CRM-26: Cảnh Báo Vé Quét Trùng Lặp (Duplicate Ticket Alert): Bật Màn Hình Đỏ Ngăn Chặn Gian Lận

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-26** |
| **Phân Hệ / Nhóm** | Kiểm Soát Check-in Cổng Sự Kiện |
| **Tên Chức Năng** | Cảnh Báo Vé Quét Trùng Lặp (Duplicate Ticket Alert): Bật Màn Hình Đỏ Ngăn Chặn Gian Lận |
| **Tác Nhân (Actor)** | Cán bộ Lễ tân & Người cầm vé quét lại |
| **Tiền Điều Kiện (Pre-conditions)** | Mã vé này đã được quét điểm danh vào cửa trước đó (có thể do chụp ảnh gửi người khác). |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Máy quét đọc mã QR.<br>2. Hệ thống phát hiện mã vé này đã được ghi nhận check-in vào cửa lúc 18h15.<br>3. Màn hình lập tức nhấp nháy ĐỎ RỰC RỠ kèm âm thanh cảnh báo nghiêm trọng:<br>   - "CẢNH BÁO: VÉ ĐÃ ĐƯỢC CHECK-IN TRƯỚC ĐÓ!"<br>   - Chi tiết: Đã quét lúc 18:15:32 tại Cổng A bởi Lễ tân Nguyễn Thị Lan<br>   - Thông tin chủ vé gốc: Doanh nhân Phạm Văn Vũ.<br>4. Lễ tân giữ lại vé để chuyển Bộ phận An ninh kiểm tra đối soát, ngăn chặn hành vi sử dụng vé trùng lặp hoặc vé giả mạo. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu đại biểu có việc đi ra ngoài rồi quay lại: Lễ tân đối chiếu thẻ đeo chính danh để hỗ trợ vào lại. |
| **Hậu Điều Kiện (Post-conditions)** | An ninh sự kiện được bảo đảm tuyệt đối, không có tình trạng gian lận vé vào cửa. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Màn hình ĐỎ CẢNH BÁO vé quét trùng lặp ngăn chặn gian lận tại cổng an ninh sự kiện* |

![Màn hình ĐỎ CẢNH BÁO vé quét trùng lặp ngăn chặn gian lận tại cổng an ninh sự kiện](images/evidence/live_25_checkin_duplicate_red_alert.png)


### 5.37. Bảng Use Case UC-CRM-27: Cảnh Báo Vé Không Hợp Lệ Hoặc Chưa Thanh Toán: Hướng Dẫn Đại Biểu Xử Lý

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-27** |
| **Phân Hệ / Nhóm** | Kiểm Soát Check-in Cổng Sự Kiện |
| **Tên Chức Năng** | Cảnh Báo Vé Không Hợp Lệ Hoặc Chưa Thanh Toán: Hướng Dẫn Đại Biểu Xử Lý |
| **Tác Nhân (Actor)** | Cán bộ Lễ tân & Khách mời |
| **Tiền Điều Kiện (Pre-conditions)** | Khách đưa mã vé giả mạo hoặc đơn vé chưa hoàn tất thanh toán tiền. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Máy quét đọc mã QR.<br>2. Hệ thống kiểm tra: Không tìm thấy mã trong cơ sở dữ liệu hoặc đơn vé ở trạng thái "Chờ thanh toán".<br>3. Màn hình hiển thị cảnh báo MÀU VÀNG: "VÉ CHƯA HOÀN TẤT THANH TOÁN" hoặc "MÃ VÉ KHÔNG HỢP LỆ".<br>4. Lễ tân nhẹ nhàng mời khách sang quầy Bàn Hỗ Trợ (Helpdesk) bên cạnh để đối soát chuyển khoản hoặc thu phí trực tiếp.<br>5. Sau khi thu phí hoàn tất, lễ tân kích hoạt vé hợp lệ ngay tại chỗ để khách vào khán phòng. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu khách chứng minh đã chuyển khoản thành công qua sao kê ngân hàng: Cán bộ tài chính xác nhận gạch nợ tức thì. |
| **Hậu Điều Kiện (Post-conditions)** | Bảo đảm quyền lợi cho khách mời đồng thời thu đủ nguồn thu sự kiện cho CLB. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện đối soát và xử lý vé chưa thanh toán tại quầy lễ tân sự kiện* |

![Giao diện đối soát và xử lý vé chưa thanh toán tại quầy lễ tân sự kiện](images/evidence/crm_checkin_qr_display.png)


### 5.38. Bảng Use Case UC-CRM-28: Tìm Kiếm & Điểm Danh Thủ Công Bằng Họ Tên / Số Điện Thoại Khi Đại Biểu Quên Điện Thoại

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-28** |
| **Phân Hệ / Nhóm** | Kiểm Soát Check-in Cổng Sự Kiện |
| **Tên Chức Năng** | Tìm Kiếm & Điểm Danh Thủ Công Bằng Họ Tên / Số Điện Thoại Khi Đại Biểu Quên Điện Thoại |
| **Tác Nhân (Actor)** | Cán bộ Lễ tân & Đại biểu |
| **Tiền Điều Kiện (Pre-conditions)** | Đại biểu là Hội viên chính thức nhưng điện thoại hết pin hoặc không mang vé in. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Đại biểu cung cấp Họ tên: "Phạm Văn Vũ" hoặc Số điện thoại: "0901201983".<br>2. Lễ tân gõ vào ô tìm kiếm nhanh trên màn hình điểm danh.<br>3. Hệ thống trả về kết quả hồ sơ hợp lệ: Hội viên chính thức CEO-83007, Bàn VIP 01.<br>4. Lễ tân bấm nút "Xác Nhận Check-in Thủ Công".<br>5. Hệ thống ghi nhận đại biểu đã có mặt và phát hành mã may mắn vào tài khoản hội viên.<br>6. Lễ tân trao thẻ đeo cho đại biểu vào dự tiệc. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu có nhiều người trùng tên: Lễ tân đối chiếu số điện thoại hoặc tên doanh nghiệp để chọn đúng đại biểu. |
| **Hậu Điều Kiện (Post-conditions)** | Đại biểu được đón tiếp chu đáo, linh hoạt, tạo ấn tượng chuyên nghiệp. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Tính năng tìm kiếm và điểm danh thủ công linh hoạt tại bàn đón tiếp đại biểu* |

![Tính năng tìm kiếm và điểm danh thủ công linh hoạt tại bàn đón tiếp đại biểu](images/evidence/crm_step_07_gate_checkin.png)


### 5.39. Bảng Use Case UC-CRM-29: Thống Kê Tỷ Lệ Điểm Danh Thời Gian Thực Báo Cáo Ban Tổ Chức Trước Giờ Khai Mạc

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-29** |
| **Phân Hệ / Nhóm** | Kiểm Soát Check-in Cổng Sự Kiện |
| **Tên Chức Năng** | Thống Kê Tỷ Lệ Điểm Danh Thời Gian Thực Báo Cáo Ban Tổ Chức Trước Giờ Khai Mạc |
| **Tác Nhân (Actor)** | Trưởng Ban Tổ Chức, Ban Thư Ký |
| **Tiền Điều Kiện (Pre-conditions)** | Công tác đón tiếp đang diễn ra trước giờ G của sự kiện. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Trưởng BTC mở màn hình "Báo Cáo Điểm Danh Realtime" trên điện thoại hoặc máy tính.<br>2. Màn hình hiển thị đồng hồ đếm và biểu đồ tỷ lệ:<br>   - Tổng số vé phát hành: 500 khách<br>   - Số lượng đã check-in vào cửa: 420 khách (Đạt tỷ lệ 84%)<br>   - Số lượng chưa đến: 80 khách<br>   - Tỷ lệ có mặt theo từng phân khu: Bàn VIP Lãnh đạo đạt 95%, Bàn Hội viên đạt 88%.<br>3. Ban Tổ chức căn cứ vào tỷ lệ có mặt để quyết định thời điểm mở màn nghi thức khai mạc chính xác. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu một bàn VIP còn vắng khách trước giờ khai mạc 10 phút: Thư ký gọi điện thoại hỗ trợ đại biểu. |
| **Hậu Điều Kiện (Post-conditions)** | Ban Lãnh đạo nắm quyền kiểm soát toàn diện nhịp độ sự kiện trong lòng bàn tay. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Báo cáo thống kê tiến độ điểm danh đại biểu thời gian thực phục vụ khai mạc* |

![Báo cáo thống kê tiến độ điểm danh đại biểu thời gian thực phục vụ khai mạc](images/evidence/12_crm_events_list.png)


### 5.40. Bảng Use Case UC-CRM-30: Lập Lịch Họp Ban Chấp Hành, Thường Trực & Lên Dự Thảo Chương Trình Nghị Sự

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-30** |
| **Phân Hệ / Nhóm** | Quản Lý Cuộc Họp & Biên Bản |
| **Tên Chức Năng** | Lập Lịch Họp Ban Chấp Hành, Thường Trực & Lên Dự Thảo Chương Trình Nghị Sự |
| **Tác Nhân (Actor)** | Ban Thư Ký (ceo.tongthuky@ceo1983.com) |
| **Tiền Điều Kiện (Pre-conditions)** | Ban Thư Ký đăng nhập Cổng Quản trị; có kế hoạch họp định kỳ tháng/quý. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ban Thư Ký truy cập phân hệ "Cuộc Họp & Nghị Quyết", chọn "Tạo Cuộc Họp Mới".<br>2. Điền thông tin cuộc họp:<br>   - Tiêu đề: "Hội Nghị Ban Chấp Hành CLB Doanh Nhân CEO 1983 Mở Rộng Quý IV"<br>   - Thời gian họp: Ngày, Giờ bắt đầu, Giờ kết thúc<br>   - Hình thức: Họp trực tiếp tại Trụ sở Hội Doanh Nhân Trẻ Hà Nội hoặc Họp kết hợp Trực tuyến<br>   - Thành phần triệu tập: Toàn thể Ủy viên Ban Chấp Hành và Trưởng 6 Ban chuyên môn<br>   - Chương trình nghị sự (Agenda): Đánh giá công tác quý III, Triển khai kế hoạch Gala thường niên, Phê duyệt ngân sách thiện nguyện.<br>3. Đính kèm các tài liệu dự thảo, tờ trình để các Ủy viên nghiên cứu trước.<br>4. Bấm "Phát Hành Thông Tri Mời Họp". |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu cuộc họp có phòng họp trực tuyến: Điền đường dẫn phòng họp bảo mật vào mục liên kết. |
| **Hậu Điều Kiện (Post-conditions)** | Lịch họp được thiết lập trên hệ thống và hiển thị lên lịch công tác của các thành viên. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Lịch công tác và giao diện khởi tạo cuộc họp Ban Chấp Hành trên Cổng Quản trị* |

![Lịch công tác và giao diện khởi tạo cuộc họp Ban Chấp Hành trên Cổng Quản trị](images/evidence/crm1983_09_meetings_calendar.png)


### 5.41. Bảng Use Case UC-CRM-31: Tự Động Gửi Giấy Mời Họp Kèm Tài Liệu Nghị Sự Đến Toàn Thể Ủy Viên Ban Chấp Hành

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-31** |
| **Phân Hệ / Nhóm** | Quản Lý Cuộc Họp & Biên Bản |
| **Tên Chức Năng** | Tự Động Gửi Giấy Mời Họp Kèm Tài Liệu Nghị Sự Đến Toàn Thể Ủy Viên Ban Chấp Hành |
| **Tác Nhân (Actor)** | Hệ thống Máy chủ Thư tín & Ban Thư Ký |
| **Tiền Điều Kiện (Pre-conditions)** | Cuộc họp vừa được Ban Thư Ký phát hành tại UC-CRM-30. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ngay khi thông tri được phát hành, hệ thống tự động gửi email Giấy Mời Họp trang trọng đến toàn thể email của các Ủy viên BCH.<br>2. Đồng thời phát Thông Báo Đẩy (Notification) lên Ứng dụng điện thoại của các Ủy viên.<br>3. Nội dung thông báo hiển thị tóm tắt thời gian, địa điểm và nút bấm xác nhận tham dự.<br>4. Ủy viên bấm "Xác Nhận Tham Dự" hoặc "Báo Vắng Kèm Lý Do" ngay trên thông báo. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Với Ủy viên chưa phản hồi sau 48h: Hệ thống tự động gửi thông báo nhắc lịch. |
| **Hậu Điều Kiện (Post-conditions)** | Ban Thư Ký nắm rõ quân số đại biểu dự họp trước ngày diễn ra hội nghị. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Danh sách cuộc họp Ban Chấp Hành và trạng thái xác nhận tham dự của các Ủy viên* |

![Danh sách cuộc họp Ban Chấp Hành và trạng thái xác nhận tham dự của các Ủy viên](images/evidence/live_32_crm_meetings_calendar.png)


### 5.42. Bảng Use Case UC-CRM-32: Điểm Danh Ủy Viên Tham Dự Họp Bằng Mã QR Đặt Tại Phòng Họp Ban Chấp Hành

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-32** |
| **Phân Hệ / Nhóm** | Quản Lý Cuộc Họp & Biên Bản |
| **Tên Chức Năng** | Điểm Danh Ủy Viên Tham Dự Họp Bằng Mã QR Đặt Tại Phòng Họp Ban Chấp Hành |
| **Tác Nhân (Actor)** | Ủy viên Ban Chấp Hành & Ban Thư Ký |
| **Tiền Điều Kiện (Pre-conditions)** | Cuộc họp đang diễn ra tại phòng họp; Ban Thư Ký hiển thị mã QR điểm danh trên màn hình chiếu. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ủy viên Ban Chấp Hành đến phòng họp, mở Ứng dụng Doanh nhân CEO 1983 trên điện thoại.<br>2. Chọn chức năng "Quét Mã QR Điểm Danh".<br>3. Hướng camera quét mã QR hiển thị trên màn hình phòng họp.<br>4. Ứng dụng báo "Điểm Danh Thành Công: Ủy Viên Phạm Văn Vũ — Có mặt lúc 08:28".<br>5. Trên màn hình máy tính của Ban Thư Ký, danh sách thành viên tham dự tự động tích xanh theo thời gian thực. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu Ủy viên họp trực tuyến: Hệ thống ghi nhận điểm danh tự động khi Ủy viên tham gia phòng họp. |
| **Hậu Điều Kiện (Post-conditions)** | Biên bản điểm danh cuộc họp được lập tự động, chính xác 100%, không cần ký giấy thủ công. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Tính năng quét mã QR điểm danh tự động tham dự cuộc họp Ban Chấp Hành* |

![Tính năng quét mã QR điểm danh tự động tham dự cuộc họp Ban Chấp Hành](images/evidence/sub_31b_app_checkin_screen.png)


### 5.43. Bảng Use Case UC-CRM-33: Soạn Thảo, Biểu Quyết Thông Qua & Đăng Tải Biên Bản Cuộc Họp Kèm Nghị Quyết Ban Chấp Hành

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-33** |
| **Phân Hệ / Nhóm** | Quản Lý Cuộc Họp & Biên Bản |
| **Tên Chức Năng** | Soạn Thảo, Biểu Quyết Thông Qua & Đăng Tải Biên Bản Cuộc Họp Kèm Nghị Quyết Ban Chấp Hành |
| **Tác Nhân (Actor)** | Ban Thư Ký, Chủ Tịch CLB |
| **Tiền Điều Kiện (Pre-conditions)** | Cuộc họp kết thúc; Ban Thư Ký hoàn thành dự thảo biên bản. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ban Thư Ký nhập nội dung Biên bản cuộc họp vào phân hệ:<br>   - Các ý kiến đóng góp của từng thành viên<br>   - Kết quả biểu quyết các tờ trình quan trọng<br>   - Kết luận chỉ đạo của Chủ tịch CLB.<br>2. Tải lên tệp Nghị quyết Ban Chấp Hành đã được Chủ tịch ký duyệt số.<br>3. Ban Thư Ký nhấn nút "Công Bố Biên Bản & Nghị Quyết".<br>4. Toàn bộ Ủy viên BCH nhận được thông báo để tra cứu và triển khai nhiệm vụ theo kết luận cuộc họp. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu cần lấy ý kiến chỉnh sửa biên bản trong 24h: Thư ký đặt trạng thái "Dự thảo lấy ý kiến đóng góp". |
| **Hậu Điều Kiện (Post-conditions)** | Nghị quyết và Biên bản cuộc họp được lưu trữ pháp lý đầy đủ, bảo đảm kỷ cương điều hành. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Kho lưu trữ Biên bản cuộc họp và Nghị quyết Ban Chấp Hành CLB CEO 1983* |

![Kho lưu trữ Biên bản cuộc họp và Nghị quyết Ban Chấp Hành CLB CEO 1983](images/evidence/crm_documents_library.png)


### 5.44. Bảng Use Case UC-CRM-34: Khởi Tạo Phiên Biểu Quyết / Bầu Cử Nhân Sự Trực Tuyến Ban Chấp Hành

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-34** |
| **Phân Hệ / Nhóm** | Biểu Quyết & Bốc Thăm May Mắn |
| **Tên Chức Năng** | Khởi Tạo Phiên Biểu Quyết / Bầu Cử Nhân Sự Trực Tuyến Ban Chấp Hành |
| **Tác Nhân (Actor)** | Ban Quản Trị, Ban Thư Ký |
| **Tiền Điều Kiện (Pre-conditions)** | Đại hội hoặc Hội nghị BCH cần lấy ý kiến biểu quyết về một chủ trương hoặc nhân sự mới. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở mục "Biểu Quyết Điện Tử", bấm "Tạo Cuộc Biểu Quyết Mới".<br>2. Điền thông tin phiên biểu quyết:<br>   - Tiêu đề: "Biểu Quyết Thông Qua Quy Chế Hoạt Động & Ngân Sách Quý Mới"<br>   - Mô tả nội dung tờ trình và các căn cứ pháp lý<br>   - Danh sách các phương án lựa chọn: "Tán thành", "Không tán thành", "Ý kiến khác"<br>   - Thời gian mở cổng biểu quyết và thời gian tự động khóa sổ<br>   - Đối tượng có quyền biểu quyết: Tất cả Hội viên chính thức hoặc Chỉ Ủy viên Ban Chấp Hành.<br>3. Bấm "Khởi Động Phiên Biểu Quyết". |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Đối với biểu quyết kín (Bầu cử nhân sự): Bật tùy chọn "Biểu quyết ẩn danh" để bảo mật danh tính người bỏ phiếu. |
| **Hậu Điều Kiện (Post-conditions)** | Phiên biểu quyết sẵn sàng tiếp nhận ý kiến tín nhiệm từ các hội viên. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện khởi tạo phiên biểu quyết điện tử và cấu hình danh sách lựa chọn* |

![Giao diện khởi tạo phiên biểu quyết điện tử và cấu hình danh sách lựa chọn](images/evidence/crm_12_voting_luckydraw.png)


### 5.45. Bảng Use Case UC-CRM-35: Theo Dõi Tiến Độ Biểu Quyết Thời Gian Thực Dưới Dạng Biểu Đồ Trực Quan

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-35** |
| **Phân Hệ / Nhóm** | Biểu Quyết & Bốc Thăm May Mắn |
| **Tên Chức Năng** | Theo Dõi Tiến Độ Biểu Quyết Thời Gian Thực Dưới Dạng Biểu Đồ Trực Quan |
| **Tác Nhân (Actor)** | Ban Kiểm Phiếu, Ban Thư Ký, Chủ Tịch CLB |
| **Tiền Điều Kiện (Pre-conditions)** | Phiên biểu quyết đang trong thời gian mở. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ban Kiểm Phiếu mở màn hình "Giám Sát Biểu Quyết Thời Gian Thực".<br>2. Hệ thống hiển thị biểu đồ tròn và thanh tỷ lệ cập nhật nhảy số theo từng giây:<br>   - Tổng số cử tri có quyền biểu quyết: 150 người<br>   - Số lượng đã bỏ phiếu: 135 người (Đạt 90%)<br>   - Tỷ lệ Tán thành: 94.8% (128 phiếu)<br>   - Tỷ lệ Không tán thành: 3.7% (5 phiếu)<br>   - Tỷ lệ Phiếu trắng: 1.5% (2 phiếu).<br>3. Màn hình bảo đảm tính minh bạch tuyệt đối, có thể chiếu trực tiếp lên máy chiếu hội nghị. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu thời gian biểu quyết sắp hết mà tỷ lệ tham gia dưới 80%: Hệ thống phát thông báo giục giã các cử tri chưa bỏ phiếu. |
| **Hậu Điều Kiện (Post-conditions)** | Toàn thể hội nghị chứng kiến kết quả khách quan, trung thực và hiện đại. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Màn hình theo dõi tiến độ biểu quyết thời gian thực dạng biểu đồ tỷ lệ trực quan* |

![Màn hình theo dõi tiến độ biểu quyết thời gian thực dạng biểu đồ tỷ lệ trực quan](images/evidence/crm1983_10_voting_management.png)


### 5.46. Bảng Use Case UC-CRM-36: Đóng Phiên Biểu Quyết & Tự Động Xuất Biên Bản Kiểm Phiếu Điện Tử Có Chứng Thực

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-36** |
| **Phân Hệ / Nhóm** | Biểu Quyết & Bốc Thăm May Mắn |
| **Tên Chức Năng** | Đóng Phiên Biểu Quyết & Tự Động Xuất Biên Bản Kiểm Phiếu Điện Tử Có Chứng Thực |
| **Tác Nhân (Actor)** | Trưởng Ban Kiểm Phiếu |
| **Tiền Điều Kiện (Pre-conditions)** | Hết thời hạn biểu quyết hoặc 100% cử tri đã hoàn tất bỏ phiếu. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Trưởng Ban Kiểm Phiếu nhấn nút "Khóa Sổ & Đóng Phiên Biểu Quyết".<br>2. Hệ thống đóng cổng nhận phiếu, cố định dữ liệu và tính toán kết quả chung cuộc.<br>3. Bấm "Xuất Biên Bản Kiểm Phiếu".<br>4. Hệ thống tự động lập Biên bản kiểm phiếu điện tử chính thức:<br>   - Ghi nhận thời gian bắt đầu, kết thúc<br>   - Thống kê chi tiết tỷ lệ phiếu hợp lệ<br>   - Kết luận tờ trình được "THÔNG QUA VỚI ĐA SỐ PHIẾU TÁN THÀNH".<br>5. Biên bản được lưu vào hồ sơ lưu trữ điện tử của CLB. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu kết quả hòa phiếu: Hệ thống thông báo áp dụng quy chế ưu tiên phiếu của Chủ tịch CLB theo điều lệ. |
| **Hậu Điều Kiện (Post-conditions)** | Quyết định biểu quyết có đầy đủ giá trị hiệu lực pháp lý để ban hành nghị quyết. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Biên bản kiểm phiếu điện tử tự động chứng thực kết quả biểu quyết Ban Chấp Hành* |

![Biên bản kiểm phiếu điện tử tự động chứng thực kết quả biểu quyết Ban Chấp Hành](images/evidence/live_33_crm_online_voting.png)


### 5.47. Bảng Use Case UC-CRM-37: Khởi Tạo Chương Trình Bốc Thăm May Mắn (Lucky Draw) Cho Đêm Gala Thường Niên

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-37** |
| **Phân Hệ / Nhóm** | Biểu Quyết & Bốc Thăm May Mắn |
| **Tên Chức Năng** | Khởi Tạo Chương Trình Bốc Thăm May Mắn (Lucky Draw) Cho Đêm Gala Thường Niên |
| **Tác Nhân (Actor)** | Ban Tổ Chức Sự Kiện & Ban Truyền Thông |
| **Tiền Điều Kiện (Pre-conditions)** | Đêm Gala diễn ra; Ban Tổ Chức chuẩn bị các giải thưởng tri ân đại biểu. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở mục "Bốc Thăm May Mắn" trong phân hệ sự kiện.<br>2. Tạo danh mục các giải thưởng hấp dẫn:<br>   - 01 Giải Đặc Biệt: Cúp Kim Cương + Quà tặng trị giá 50.000.000 VNĐ<br>   - 02 Giải Nhất: Bộ quà tặng công nghệ cao cấp<br>   - 05 Giải Nhì: Gói truyền thông thương hiệu độc quyền<br>   - 10 Giải Ba: Quà tặng tri ân từ Nhà Tài Trợ.<br>3. Thiết lập quy tắc hợp lệ: "Chỉ những đại biểu đã quét mã check-in có mặt thực tế tại khán phòng mới được tham gia bốc thăm".<br>4. Nhấn "Sẵn Sàng Quay Thưởng". |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu bổ sung thêm giải thưởng đột xuất của nhà tài trợ tài trợ trực tiếp trên sân khấu: BTC có thể thêm giải thưởng mới trong 10 giây. |
| **Hậu Điều Kiện (Post-conditions)** | Chương trình quay số may mắn sẵn sàng khởi động trên màn hình LED lớn. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Biểu mẫu thiết lập các giải thưởng và cơ cấu chương trình Bốc thăm may mắn Gala* |

![Biểu mẫu thiết lập các giải thưởng và cơ cấu chương trình Bốc thăm may mắn Gala](images/evidence/crm_lucky_draw_modal.png)


### 5.48. Bảng Use Case UC-CRM-38: Kích Hoạt Vòng Quay May Mắn Trên Màn Hình LED Sân Khấu & Tìm Ra Doanh Nhân Trúng Thưởng

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-38** |
| **Phân Hệ / Nhóm** | Biểu Quyết & Bốc Thăm May Mắn |
| **Tên Chức Năng** | Kích Hoạt Vòng Quay May Mắn Trên Màn Hình LED Sân Khấu & Tìm Ra Doanh Nhân Trúng Thưởng |
| **Tác Nhân (Actor)** | Ban Tổ Chức, MC Sự Kiện, Toàn Thể Đại Biểu |
| **Tiền Điều Kiện (Pre-conditions)** | Toàn thể đại biểu đã ổn định chỗ ngồi; MC tuyên bố phần Bốc thăm may mắn. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Kỹ thuật viên kết nối màn hình điều khiển với màn hình LED sân khấu.<br>2. Hệ thống tổng hợp tự động danh sách các Mã số May mắn (Lucky Numbers) của toàn bộ đại biểu đã check-in hợp lệ.<br>3. MC mời đại diện Nhà Tài Trợ lên sân khấu nhấn nút "QUAY SỐ".<br>4. Vòng quay số 3D kỹ thuật số chuyển động rực rỡ kèm hiệu ứng âm thanh hồi hộp, kịch tính.<br>5. Vòng quay dừng lại ở con số may mắn: #83007.<br>6. Màn hình LED bùng nổ hiệu ứng pháo hoa chúc mừng:<br>   - "CHÚC MỪNG DOANH NHÂN PHẠM VĂN VŨ — CÔNG TY VIO CONNECT"<br>   - Đã may mắn trúng Giải Nhất chương trình Gala CEO 1983!<br>7. Hệ thống tự động phát thông báo chúc mừng In-app đến điện thoại của người trúng giải. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu đại biểu trúng thưởng đã ra về trước giờ bốc thăm: MC cho phép bấm nút "Quay Lại" để tìm chủ nhân mới theo quy chế. |
| **Hậu Điều Kiện (Post-conditions)** | Chương trình bốc thăm diễn ra bùng nổ, công tâm, minh bạch và tạo niềm vui gắn kết cho đại biểu. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Màn hình hiệu ứng công bố Doanh nhân may mắn trúng thưởng trên màn hình LED* |

![Màn hình hiệu ứng công bố Doanh nhân may mắn trúng thưởng trên màn hình LED](images/evidence/app_lucky_draw_winner_notification.png)


### 5.49. Bảng Use Case UC-CRM-39: Theo Dõi Bảng Tổng Hợp Tình Trạng Đóng Hội Phí Thường Niên Toàn CLB

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-39** |
| **Phân Hệ / Nhóm** | Quản Lý Hội Phí Thường Niên |
| **Tên Chức Năng** | Theo Dõi Bảng Tổng Hợp Tình Trạng Đóng Hội Phí Thường Niên Toàn CLB |
| **Tác Nhân (Actor)** | Ban Tài Chính, Ban Thư Ký |
| **Tiền Điều Kiện (Pre-conditions)** | Người dùng truy cập phân hệ Quản lý Hội phí trên Cổng Quản trị. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng chọn mục "Hội Phí Thường Niên".<br>2. Màn hình hiển thị danh sách hội viên kèm trạng thái đóng phí nhiệm kỳ hiện tại:<br>   - Hội viên đã hoàn thành hội phí (Hiển thị nhãn Xanh: Đã đóng)<br>   - Hội viên sắp đến hạn đóng phí (Hiển thị nhãn Vàng: Còn 15 ngày)<br>   - Hội viên quá hạn đóng phí (Hiển thị nhãn Đỏ: Quá hạn)<br>3. Xem tổng thu hội phí thực tế so với chỉ tiêu ngân sách hoạt động cả năm.<br>4. Lọc danh sách theo Chuyên ban để Ban Chủ nhiệm đôn đốc hội viên sinh hoạt trách nhiệm. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu có hội viên được miễn giảm phí theo chính sách cống hiến đặc biệt: BQT áp dụng chính sách miễn trừ kèm lý do. |
| **Hậu Điều Kiện (Post-conditions)** | Ban Điều Hành kiểm soát chặt chẽ nguồn thu huyết mạch phục vụ các hoạt động chung của CLB. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Bảng theo dõi trạng thái đóng hội phí thường niên của toàn thể Hội viên CLB* |

![Bảng theo dõi trạng thái đóng hội phí thường niên của toàn thể Hội viên CLB](images/evidence/crm_08_fees_management.png)


### 5.50. Bảng Use Case UC-CRM-40: Tạo Thông Báo Thu Hội Phí Nhiệm Kỳ Mới Kèm Mã VietQR Napas 24/7 Tự Động Gạch Nợ

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-40** |
| **Phân Hệ / Nhóm** | Quản Lý Hội Phí Thường Niên |
| **Tên Chức Năng** | Tạo Thông Báo Thu Hội Phí Nhiệm Kỳ Mới Kèm Mã VietQR Napas 24/7 Tự Động Gạch Nợ |
| **Tác Nhân (Actor)** | Ban Tài Chính (ceo.thiennguyen@ceo1983.com / Thủ Quỹ) |
| **Tiền Điều Kiện (Pre-conditions)** | Đến kỳ thu hội phí thường niên theo điều lệ CLB. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ban Tài Chính chọn chức năng "Phát Hành Thông Báo Thu Hội Phí Mới".<br>2. Thiết lập thông số:<br>   - Kỳ hội phí: Niên khóa 2026 - 2027<br>   - Mức hội phí tiêu chuẩn: 10.000.000 VNĐ / năm<br>   - Hạn chót nộp phí: 30 ngày kể từ ngày thông báo<br>3. Nhấn "Phát Hành Hàng Loạt".<br>4. Hệ thống tự động tạo hóa đơn điện tử cho từng hội viên.<br>5. Mỗi hóa đơn được tích hợp sẵn Mã VietQR Napas 24/7 động chứa chính xác số tiền và nội dung chuyển khoản duy nhất (định dạng: FEE-CEO83xxx).<br>6. Khi hội viên quét mã chuyển khoản qua bất kỳ App ngân hàng nào, hệ thống máy chủ tự động đối soát và gạch nợ tức thì trong 1 giây mà không cần con người can thiệp. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Trường hợp hội viên nộp tiền mặt: Thủ quỹ chọn hóa đơn và nhấn xác nhận thu tiền mặt. |
| **Hậu Điều Kiện (Post-conditions)** | Hóa đơn hội phí sẵn sàng trên Ứng dụng của từng hội viên, thanh toán tiện lợi 24/7. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện phát hành thông báo thu hội phí và cấu hình mã thanh toán VietQR động* |

![Giao diện phát hành thông báo thu hội phí và cấu hình mã thanh toán VietQR động](images/evidence/sub_50_crm_fees_management.png)


### 5.51. Bảng Use Case UC-CRM-41: Tự Động Gửi Email & Thông Báo Đẩy Nhắc Đóng Hội Phí Thường Niên Định Kỳ

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-41** |
| **Phân Hệ / Nhóm** | Quản Lý Hội Phí Thường Niên |
| **Tên Chức Năng** | Tự Động Gửi Email & Thông Báo Đẩy Nhắc Đóng Hội Phí Thường Niên Định Kỳ |
| **Tác Nhân (Actor)** | Hệ thống Tự Động (Automation Service) & Ban Tài Chính |
| **Tiền Điều Kiện (Pre-conditions)** | Hóa đơn hội phí đã phát hành và đến các mốc nhắc nợ (còn 15 ngày, còn 3 ngày, ngày hết hạn). |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Hệ thống tự động rà soát danh sách các hội viên chưa hoàn thành hội phí theo lịch trình.<br>2. Tự động kích hoạt gửi Email Nhắc Đóng Phí lịch sự, sang trọng đến hòm thư hội viên: vupv090120@gmail.com.<br>3. Gửi Thông Báo Đẩy trực tiếp lên màn hình điện thoại hội viên: "Kính mời Doanh nhân Phạm Văn Vũ hoàn tất Hội phí thường niên để duy trì đầy đủ đặc quyền kết nối giao thương".<br>4. Bấm vào thông báo sẽ mở ngay màn hình quét mã VietQR thanh toán 1 chạm. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Khi hội viên hoàn tất thanh toán: Hệ thống tự động hủy toàn bộ các lịch nhắc nợ tiếp theo. |
| **Hậu Điều Kiện (Post-conditions)** | Tỷ lệ thu hội phí đạt trên 95% mà Ban Thư Ký không phải gọi điện đòi nợ thủ công phiền hà. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Thông báo nhắc nhở đóng hội phí thường niên và nút thanh toán VietQR trên ứng dụng* |

![Thông báo nhắc nhở đóng hội phí thường niên và nút thanh toán VietQR trên ứng dụng](images/evidence/app_step_20_annual_fee_renewal.png)


### 5.52. Bảng Use Case UC-CRM-42: Quản Lý Sổ Quỹ Thu: Ghi Nhận Toàn Bộ Các Nguồn Thu Hội Phí, Tài Trợ & Sự Kiện

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-42** |
| **Phân Hệ / Nhóm** | Sổ Quỹ Thu Chi Minh Bạch |
| **Tên Chức Năng** | Quản Lý Sổ Quỹ Thu: Ghi Nhận Toàn Bộ Các Nguồn Thu Hội Phí, Tài Trợ & Sự Kiện |
| **Tác Nhân (Actor)** | Ban Tài Chính, Kế Toán CLB |
| **Tiền Điều Kiện (Pre-conditions)** | Người dùng truy cập phân hệ Sổ Quỹ Thu trên Cổng Quản trị. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở mục "Sổ Quỹ Thu" (Income Ledger).<br>2. Hệ thống hiển thị toàn bộ các phiếu thu được phân loại nguồn rõ ràng:<br>   - Thu Hội phí thường niên (Tự động gạch nợ từ VietQR)<br>   - Thu Tài trợ từ các Doanh nghiệp Nhà Tài Trợ<br>   - Thu Tiền vé sự kiện Gala và các khóa đào tạo<br>   - Thu Đóng góp ủng hộ Quỹ Thiện nguyện.<br>3. Người dùng có thể lập phiếu thu thủ công cho các khoản đóng góp trực tiếp.<br>4. Mỗi phiếu thu đều có mã phiếu, ngày thu, người nộp, số tiền và đính kèm ủy nhiệm chi/chứng từ kế toán. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu cần hủy phiếu thu lập sai: Người dùng nhập lý do hủy và yêu cầu Trưởng Ban Tài Chính phê duyệt. |
| **Hậu Điều Kiện (Post-conditions)** | Dòng tiền thu vào của tổ chức được ghi nhận chính xác, chống thất thoát tuyệt đối. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Sổ quỹ Thu ghi nhận toàn diện các nguồn thu hội phí, tài trợ và sự kiện CLB* |

![Sổ quỹ Thu ghi nhận toàn diện các nguồn thu hội phí, tài trợ và sự kiện CLB](images/evidence/crm1983_12_income_management.png)


### 5.53. Bảng Use Case UC-CRM-43: Quản Lý Sổ Quỹ Chi: Lập Phiếu Đề Nghị Thanh Toán & Quy Trình Duyệt Chi Minh Bạch

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-43** |
| **Phân Hệ / Nhóm** | Sổ Quỹ Thu Chi Minh Bạch |
| **Tên Chức Năng** | Quản Lý Sổ Quỹ Chi: Lập Phiếu Đề Nghị Thanh Toán & Quy Trình Duyệt Chi Minh Bạch |
| **Tác Nhân (Actor)** | Ban Chuyên Môn đề xuất, Ban Tài Chính, Chủ Tịch CLB |
| **Tiền Điều Kiện (Pre-conditions)** | Có hoạt động phát sinh chi phí phục vụ công tác chung của CLB. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Cán bộ phụ trách (ví dụ: Ban Truyền Thông mua quà tặng sự kiện) tạo "Đề Nghị Thanh Toán".<br>2. Điền nội dung chi, số tiền cần thanh toán, thông tin tài khoản thụ hưởng của nhà cung cấp và đính kèm hóa đơn đỏ VAT.<br>3. Đề nghị chi được chuyển đến Trưởng Ban Tài Chính thẩm định tính hợp lý của ngân sách.<br>4. Trưởng Ban Tài Chính duyệt, hệ thống chuyển tiếp đến Chủ Tịch CLB phê duyệt quyết định chi.<br>5. Sau khi Chủ tịch phê duyệt, Thủ quỹ thực hiện chuyển khoản và tải lên ủy nhiệm chi hoàn tất.<br>6. Phiếu chi chính thức được ghi nhận vào Sổ Quỹ Chi. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu đề xuất vượt quá định mức ngân sách đã duyệt: Hệ thống cảnh báo đỏ và yêu cầu giải trình bổ sung. |
| **Hậu Điều Kiện (Post-conditions)** | Mọi đồng tiền chi tiêu đều được kiểm soát qua quy trình 3 cấp chặt chẽ, đúng quy chế tài chính. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Sổ quỹ Chi và quy trình kiểm duyệt đề nghị thanh toán minh bạch của Ban Lãnh Đạo* |

![Sổ quỹ Chi và quy trình kiểm duyệt đề nghị thanh toán minh bạch của Ban Lãnh Đạo](images/evidence/crm1983_13_expenses_management.png)


### 5.54. Bảng Use Case UC-CRM-44: Quản Trị Riêng Biệt & Công Khai Quỹ An Sinh Xã Hội & Thiện Nguyện (Độc Quyền Ban Thiện Nguyện)

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-44** |
| **Phân Hệ / Nhóm** | Sổ Quỹ Thu Chi Minh Bạch |
| **Tên Chức Năng** | Quản Trị Riêng Biệt & Công Khai Quỹ An Sinh Xã Hội & Thiện Nguyện (Độc Quyền Ban Thiện Nguyện) |
| **Tác Nhân (Actor)** | Ban Thiện Nguyện (ceo.thiennguyen@ceo1983.com) |
| **Tiền Điều Kiện (Pre-conditions)** | Tài khoản Ban Thiện Nguyện đăng nhập Cổng Quản trị. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Cán bộ Ban Thiện Nguyện mở phân hệ "Quỹ An Sinh Xã Hội & Thiện Nguyện".<br>2. Hệ thống tách biệt hoàn toàn dòng tiền Thiện nguyện với dòng tiền Quỹ vận hành hành chính.<br>3. Theo dõi danh sách các nhà hảo tâm, hội viên ủng hộ cho các chiến dịch:<br>   - Chiến dịch "Xây Cầu Dân Sinh Vùng Cao 1983"<br>   - Chiến dịch "Áo Ấm Mùa Đông Cho Em"<br>   - Hoạt động Thăm hỏi Hội viên ốm đau, hiếu hỉ.<br>4. Lập kế hoạch giải ngân, cập nhật nhật ký chi tiêu thực tế đến từng đồng kèm hóa đơn, hình ảnh trao quà tại địa phương.<br>5. Xuất bản báo cáo sao kê thiện nguyện minh bạch lên Bảng tin CLB để toàn thể hội viên cùng theo dõi. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Bất kỳ ai cũng có thể tra cứu sao kê quỹ thiện nguyện để bảo đảm tính liêm chính cao nhất của tổ chức. |
| **Hậu Điều Kiện (Post-conditions)** | Quỹ Thiện nguyện được vận hành mẫu mực, củng cố niềm tin yêu của cộng đồng đối với thương hiệu CEO 1983. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện quản lý Quỹ An Sinh Xã Hội và Thiện Nguyện độc quyền của Ban Thiện Nguyện* |

![Giao diện quản lý Quỹ An Sinh Xã Hội và Thiện Nguyện độc quyền của Ban Thiện Nguyện](images/evidence/btn_screen.png)


### 5.55. Bảng Use Case UC-CRM-45: Xem Báo Cáo Tài Chính Tổng Hợp, Cân Đối Thu - Chi & Số Dư Quỹ Thực Tế

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-45** |
| **Phân Hệ / Nhóm** | Sổ Quỹ Thu Chi Minh Bạch |
| **Tên Chức Năng** | Xem Báo Cáo Tài Chính Tổng Hợp, Cân Đối Thu - Chi & Số Dư Quỹ Thực Tế |
| **Tác Nhân (Actor)** | Ban Kiểm Tra, Ban Tài Chính, Toàn Thể Ban Chấp Hành |
| **Tiền Điều Kiện (Pre-conditions)** | Người dùng truy cập Báo Cáo Tài Chính trên Cổng Quản trị. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở mục "Báo Cáo Tài Chính" (Financial Report).<br>2. Hệ thống tổng hợp tự động số liệu thời gian thực:<br>   - Tổng Doanh Thu Lũy Kế trong kỳ<br>   - Tổng Chi Phí Thực Tế đã giải ngân<br>   - Cân Đối Thu - Chi (Lợi nhuận thặng dư hoạt động)<br>   - Số Dư Quỹ Khả Dụng tại tài khoản ngân hàng CLB.<br>3. Biểu đồ trực quan so sánh dòng tiền theo từng tháng và cơ cấu tỷ trọng chi phí.<br>4. Người dùng xuất báo cáo tài chính định dạng PDF hoặc Excel có đầy đủ chữ ký số phục vụ kỳ họp Ban Kiểm Tra CLB. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu số dư quỹ giảm xuống dưới mức an toàn dự phòng: Hệ thống cảnh báo Ban Tài Chính để cân đối lại kế hoạch chi tiêu. |
| **Hậu Điều Kiện (Post-conditions)** | Ban Lãnh đạo nắm vững sức khỏe tài chính của tổ chức, phục vụ phát triển bền vững. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Báo cáo tài chính tổng hợp cân đối thu chi và số dư quỹ tiền mặt thời gian thực* |

![Báo cáo tài chính tổng hợp cân đối thu chi và số dư quỹ tiền mặt thời gian thực](images/evidence/crm1983_14_finance_report.png)


### 5.56. Bảng Use Case UC-CRM-46: Thiết Lập Danh Mục Các Gói Tài Trợ Sự Kiện (Kim Cương, Vàng, Bạc, Đồng)

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-46** |
| **Phân Hệ / Nhóm** | Quản Trị Nhà Tài Trợ & Quyền Lợi |
| **Tên Chức Năng** | Thiết Lập Danh Mục Các Gói Tài Trợ Sự Kiện (Kim Cương, Vàng, Bạc, Đồng) |
| **Tác Nhân (Actor)** | Ban Vận Động Tài Trợ & Ban Xúc Tiến Thương Mại |
| **Tiền Điều Kiện (Pre-conditions)** | Ban Chấp Hành ban hành đề án vận động tài trợ cho các hoạt động lớn. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở phân hệ "Quản Trị Nhà Tài Trợ", chọn "Cấu Hình Gói Tài Trợ".<br>2. Thiết lập các gói tài trợ tiêu chuẩn:<br>   - Gói Kim Cương (Diamond Sponsor): Mức tài trợ 100.000.000 VNĐ (Tối đa 02 đơn vị)<br>   - Gói Vàng (Gold Sponsor): Mức tài trợ 50.000.000 VNĐ (Tối đa 05 đơn vị)<br>   - Gói Bạc (Silver Sponsor): Mức tài trợ 30.000.000 VNĐ<br>   - Gói Đồng (Bronze Sponsor): Mức tài trợ 15.000.000 VNĐ.<br>3. Cấu hình chi tiết danh mục quyền lợi cam kết cho từng gói: Thời lượng phát video TVC, Kích thước logo trên Backdrop, Vị trí bàn VIP danh dự, Bài phát biểu trên sân khấu và Bài đăng truyền thông độc quyền.<br>4. Bấm "Xuất Bản Danh Mục Gói Tài Trợ". |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Có thể tạo các Gói Tài Trợ Hiện Vật (In-kind Sponsors) như quà tặng, đồ uống, thiết bị âm thanh. |
| **Hậu Điều Kiện (Post-conditions)** | Hồ sơ mời tài trợ chuyên nghiệp sẵn sàng gửi đến các doanh nghiệp đối tác. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện thiết lập danh mục các gói tài trợ Kim Cương, Vàng, Bạc và quyền lợi* |

![Giao diện thiết lập danh mục các gói tài trợ Kim Cương, Vàng, Bạc và quyền lợi](images/evidence/crm1983_15_sponsors_management.png)


### 5.57. Bảng Use Case UC-CRM-47: Quản Lý Hồ Sơ Nhà Tài Trợ, Ký Kết Thỏa Thuận & Giám Sát Thực Hiện Quyền Lợi

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-47** |
| **Phân Hệ / Nhóm** | Quản Trị Nhà Tài Trợ & Quyền Lợi |
| **Tên Chức Năng** | Quản Lý Hồ Sơ Nhà Tài Trợ, Ký Kết Thỏa Thuận & Giám Sát Thực Hiện Quyền Lợi |
| **Tác Nhân (Actor)** | Ban Vận Động Tài Trợ, Ban Truyền Thông |
| **Tiền Điều Kiện (Pre-conditions)** | Doanh nghiệp đồng ý đồng hành tài trợ cho CLB. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở mục "Danh Sách Nhà Tài Trợ", bấm "Thêm Nhà Tài Trợ".<br>2. Nhập thông tin doanh nghiệp tài trợ, tải lên tệp Thỏa thuận tài trợ đã ký.<br>3. Chọn gói tài trợ đã đăng ký (ví dụ: Nhà Tài Trợ Kim Cương).<br>4. Hệ thống tự động tạo danh sách kiểm tra (Checklist) các quyền lợi cần thực hiện:<br>   - Đã nhận Logo chất lượng cao từ doanh nghiệp<br>   - Đã in ấn Logo lên Backdrop và Thẻ đeo sự kiện<br>   - Đã gán vị trí Bàn VIP Kim Cương tại khán phòng<br>   - Đã lên lịch phát sóng video giới thiệu doanh nghiệp trong giờ giải lao<br>   - Đã soạn bài vinh danh trên Fanpage và Cổng thông tin.<br>5. Cán bộ tích chọn hoàn thành từng quyền lợi để bảo đảm thực hiện đúng 100% cam kết. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu doanh nghiệp chậm nộp tư liệu truyền thông: Hệ thống gửi thông báo nhắc nhở đính kèm thời hạn in ấn. |
| **Hậu Điều Kiện (Post-conditions)** | Nhà tài trợ hài lòng tuyệt đối với sự chuyên nghiệp, uy tín của Ban Tổ Chức CLB CEO 1983. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Bảng theo dõi và giám sát thực hiện cam kết quyền lợi dành cho Nhà tài trợ* |

![Bảng theo dõi và giám sát thực hiện cam kết quyền lợi dành cho Nhà tài trợ](images/evidence/crm1983_16_benefits_perks.png)


### 5.58. Bảng Use Case UC-CRM-48: Khởi Tạo Nhiệm Vụ Mới, Phân Công Ban Chuyên Môn & Gán Nhân Sự Chịu Trách Nhiệm

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-48** |
| **Phân Hệ / Nhóm** | Quản Lý Giao Việc Ban Chuyên Môn |
| **Tên Chức Năng** | Khởi Tạo Nhiệm Vụ Mới, Phân Công Ban Chuyên Môn & Gán Nhân Sự Chịu Trách Nhiệm |
| **Tác Nhân (Actor)** | Chủ Tịch CLB, Ban Thư Ký, Trưởng Các Ban |
| **Tiền Điều Kiện (Pre-conditions)** | Có công việc phát sinh từ Nghị quyết Ban Chấp Hành cần phân công triển khai. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng truy cập phân hệ "Quản Lý Nhiệm Vụ", chọn "Giao Việc Mới".<br>2. Điền thông tin nhiệm vụ:<br>   - Tên công việc: "Thiết kế Bộ nhận diện thương hiệu & In ấn kỷ yếu Gala 1983"<br>   - Ban chuyên môn phụ trách: Ban Truyền Thông<br>   - Nhân sự chịu trách nhiệm chính (Assignee)<br>   - Mức độ ưu tiên: Khẩn cấp / Cao / Bình thường<br>   - Hạn chót hoàn thành (Deadline)<br>   - Danh sách các công việc con cần làm (Subtasks checklist).<br>3. Đính kèm tài liệu yêu cầu chi tiết.<br>4. Bấm "Phát Lệnh Giao Việc".<br>5. Hệ thống lập tức bắn thông báo In-app và gửi email giao việc đến nhân sự được phân công. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Có thể gán nhiều người cùng phối hợp thực hiện một nhiệm vụ lớn. |
| **Hậu Điều Kiện (Post-conditions)** | Nhiệm vụ được phân công rõ người, rõ việc, rõ tiến độ, không đùn đẩy trách nhiệm. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Biểu mẫu khởi tạo và phân công nhiệm vụ chuyên môn cho các Ban trên Cổng Quản trị* |

![Biểu mẫu khởi tạo và phân công nhiệm vụ chuyên môn cho các Ban trên Cổng Quản trị](images/evidence/crm_tasks_management.png)


### 5.59. Bảng Use Case UC-CRM-49: Cập Nhật Tiến Độ Thực Hiện, Trao Đổi Thảo Luận & Đính Kèm Tệp Sản Phẩm Hoàn Thành

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-49** |
| **Phân Hệ / Nhóm** | Quản Lý Giao Việc Ban Chuyên Môn |
| **Tên Chức Năng** | Cập Nhật Tiến Độ Thực Hiện, Trao Đổi Thảo Luận & Đính Kèm Tệp Sản Phẩm Hoàn Thành |
| **Tác Nhân (Actor)** | Cán bộ Ban chuyên môn được giao việc |
| **Tiền Điều Kiện (Pre-conditions)** | Cán bộ nhận được thông báo nhiệm vụ và đang triển khai công việc. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Cán bộ mở nhiệm vụ trên Cổng Quản trị hoặc Ứng dụng điện thoại.<br>2. Cập nhật thanh trượt phần trăm tiến độ hoàn thành (ví dụ: Đạt 70%).<br>3. Tích chọn các công việc con đã hoàn thành.<br>4. Tải lên tệp sản phẩm kết quả (bản vẽ thiết kế, danh sách đại biểu, dự thảo kế hoạch).<br>5. Để lại bình luận trao đổi nội bộ với các thành viên khác trong ban.<br>6. Khi hoàn thành toàn bộ: Nhấn nút "Gửi Báo Cáo Hoàn Thành Nhiệm Vụ" để Lãnh đạo nghiệm thu. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu gặp khó khăn có nguy cơ trễ hạn: Cán bộ gắn nhãn "Đang gặp vướng mắc" để Lãnh đạo hỗ trợ giải quyết. |
| **Hậu Điều Kiện (Post-conditions)** | Tiến độ công việc luôn minh bạch, bảo đảm hoàn thành đúng hạn định đã cam kết. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện cập nhật tiến độ công việc, thảo luận nội bộ và đính kèm sản phẩm hoàn thành* |

![Giao diện cập nhật tiến độ công việc, thảo luận nội bộ và đính kèm sản phẩm hoàn thành](images/evidence/crm_step_12_roles_audit_logs.png)


### 5.60. Bảng Use Case UC-CRM-50: Nghiệm Thu, Đánh Giá Chất Lượng & Đóng Nhiệm Vụ Ban Chuyên Môn

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-50** |
| **Phân Hệ / Nhóm** | Quản Lý Giao Việc Ban Chuyên Môn |
| **Tên Chức Năng** | Nghiệm Thu, Đánh Giá Chất Lượng & Đóng Nhiệm Vụ Ban Chuyên Môn |
| **Tác Nhân (Actor)** | Chủ Tịch CLB, Trưởng Ban giao việc |
| **Tiền Điều Kiện (Pre-conditions)** | Nhân sự thực hiện đã gửi báo cáo hoàn thành nhiệm vụ. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Lãnh đạo nhận thông báo báo cáo hoàn thành, mở chi tiết nhiệm vụ để kiểm tra sản phẩm.<br>2. Đánh giá chất lượng thực hiện: Đạt yêu cầu xuất sắc / Đạt yêu cầu / Cần chỉnh sửa thêm.<br>3. Nếu hài lòng: Bấm "Nghiệm Thu & Đóng Nhiệm Vụ".<br>4. Hệ thống chuyển trạng thái nhiệm vụ sang "Đã Hoàn Thành" (Completed) và ghi nhận điểm cống hiến cho cán bộ thực hiện.<br>5. Nếu chưa đạt: Bấm "Yêu Cầu Chỉnh Sửa" kèm nhận xét cụ thể để cán bộ hoàn thiện lại. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nhiệm vụ đã đóng được lưu vào kho lưu trữ thành tích công tác năm của các Ban. |
| **Hậu Điều Kiện (Post-conditions)** | Chu trình quản trị công việc khép kín, bảo đảm tính kỷ cương và chất lượng điều hành cao nhất. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Màn hình nghiệm thu kết quả công việc và đóng nhiệm vụ Ban chuyên môn* |

![Màn hình nghiệm thu kết quả công việc và đóng nhiệm vụ Ban chuyên môn](images/evidence/crm_audit_logs.png)


### 5.61. Bảng Use Case UC-CRM-51: Kiểm Duyệt Sản Phẩm / Dịch Vụ Mới Do Doanh Nghiệp Hội Viên Đăng Lên Gian Hàng B2B

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-51** |
| **Phân Hệ / Nhóm** | Sàn Giao Thương B2B & Cơ Hội |
| **Tên Chức Năng** | Kiểm Duyệt Sản Phẩm / Dịch Vụ Mới Do Doanh Nghiệp Hội Viên Đăng Lên Gian Hàng B2B |
| **Tác Nhân (Actor)** | Ban Xúc Tiến Thương Mại (ceo.xuctien@ceo1983.com) |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên đăng tải sản phẩm/dịch vụ mới lên Gian hàng B2B CEO 1983. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Cán bộ Ban Xúc Tiến truy cập mục "Kiểm Duyệt Sản Phẩm B2B".<br>2. Mở bài đăng sản phẩm mới:<br>   - Tên sản phẩm: "Giải pháp Chuyển đổi số & Quản trị Doanh nghiệp Toàn diện"<br>   - Doanh nghiệp cung cấp: Công ty Cổ phần Công nghệ VIO CONNECT<br>   - Hình ảnh sản phẩm chuẩn mực, rõ ràng, không vi phạm bản quyền<br>   - Bảng giá niêm yết và Chính sách chiết khấu ưu đãi độc quyền dành riêng cho Hội viên CEO 1983<br>   - Cam kết bảo hành và thông tin liên hệ bảo đảm.<br>3. Cán bộ BXT kiểm tra tiêu chuẩn chất lượng sản phẩm.<br>4. Bấm "Phê Duyệt & Niêm Yết Lên Sàn B2B".<br>5. Sản phẩm lập tức xuất hiện trang trọng trên Gian hàng Doanh nghiệp của Ứng dụng Hội viên. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu hình ảnh mờ hoặc thông tin chưa rõ: BXT từ chối kèm phản hồi hướng dẫn hội viên cập nhật lại. |
| **Hậu Điều Kiện (Post-conditions)** | Sản phẩm được chứng thực chất lượng, sẵn sàng kết nối giao thương nội bộ an toàn. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện kiểm duyệt bài đăng sản phẩm dịch vụ lên Gian hàng Doanh nghiệp B2B* |

![Giao diện kiểm duyệt bài đăng sản phẩm dịch vụ lên Gian hàng Doanh nghiệp B2B](images/evidence/crm_10_marketplace_sync.png)


### 5.62. Bảng Use Case UC-CRM-52: Khóa / Gỡ Bỏ Sản Phẩm Vi Phạm Tiêu Chuẩn Chất Lượng Hoặc Hết Hạn Khuyến Mại

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-52** |
| **Phân Hệ / Nhóm** | Sàn Giao Thương B2B & Cơ Hội |
| **Tên Chức Năng** | Khóa / Gỡ Bỏ Sản Phẩm Vi Phạm Tiêu Chuẩn Chất Lượng Hoặc Hết Hạn Khuyến Mại |
| **Tác Nhân (Actor)** | Ban Xúc Tiến Thương Mại, Ban Kiểm Tra |
| **Tiền Điều Kiện (Pre-conditions)** | Sản phẩm có phản ánh về chất lượng hoặc chương trình ưu đãi đã kết thúc. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Cán bộ BXT tìm sản phẩm cần xử lý trên danh mục đã niêm yết.<br>2. Chọn chức năng "Tạm Khóa Bài Đăng" hoặc "Gỡ Bỏ Khỏi Gian Hàng".<br>3. Nhập lý do xử lý (ví dụ: Chương trình ưu đãi hết hạn hoặc chờ bổ sung chứng nhận kiểm định).<br>4. Bấm "Xác Nhận".<br>5. Hệ thống lập tức gỡ sản phẩm khỏi chế độ hiển thị công khai trên ứng dụng.<br>6. Hệ thống tự động gửi thông báo giải thích đến doanh nghiệp đăng bài. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Khi doanh nghiệp bổ sung đầy đủ giấy tờ chứng minh: BXT có thể mở khóa lại bất kỳ lúc nào. |
| **Hậu Điều Kiện (Post-conditions)** | Gian hàng Doanh nghiệp luôn duy trì chất lượng uy tín và thông tin trung thực. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Thao tác kiểm duyệt gỡ bỏ bài đăng vi phạm hoặc hết hạn ưu đãi trên Sàn B2B* |

![Thao tác kiểm duyệt gỡ bỏ bài đăng vi phạm hoặc hết hạn ưu đãi trên Sàn B2B](images/evidence/crm_step_08_marketplace_moderation.png)


### 5.63. Bảng Use Case UC-CRM-53: Giám Sát & Điều Phối Luồng Cơ Hội Kết Nối Cung - Cầu Giữa Các Doanh Nghiệp

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-53** |
| **Phân Hệ / Nhóm** | Sàn Giao Thương B2B & Cơ Hội |
| **Tên Chức Năng** | Giám Sát & Điều Phối Luồng Cơ Hội Kết Nối Cung - Cầu Giữa Các Doanh Nghiệp |
| **Tác Nhân (Actor)** | Ban Xúc Tiến Thương Mại |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên đăng tải nhu cầu tìm đối tác (Cầu) hoặc khả năng cung ứng (Cung). |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Cán bộ BXT mở mục "Điều Phối Cơ Hội Cung - Cầu" (Opportunities Pipeline).<br>2. Theo dõi các cơ hội kết nối đang phát sinh trong cộng đồng:<br>   - Cơ hội Cầu: "Cần tìm nhà thầu thi công nội thất văn phòng 500m2 tại Hà Nội"<br>   - Cơ hội Cung: "Cung cấp giải pháp phần mềm quản trị hóa đơn điện tử cho 1000 khách hàng".<br>3. Cán bộ BXT chủ động kết nối hai doanh nghiệp hội viên có năng lực phù hợp để hẹn gặp trao đổi 1-on-1.<br>4. Cập nhật trạng thái kết nối: Đang kết nối, Đang đàm phán hợp đồng, Đã ký kết hợp đồng thành công. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu cơ hội sau 7 ngày chưa có ai tiếp nhận: BXT đẩy nổi bật lên Bản tin tuần của CLB. |
| **Hậu Điều Kiện (Post-conditions)** | Tạo ra giá trị kinh tế thực tế, giúp các doanh nhân thành viên phát triển doanh số mạnh mẽ. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Hệ thống giám sát và điều phối luồng cơ hội kết nối Cung - Cầu doanh nghiệp* |

![Hệ thống giám sát và điều phối luồng cơ hội kết nối Cung - Cầu doanh nghiệp](images/evidence/crm_11_opportunities_sync.png)


### 5.64. Bảng Use Case UC-CRM-54: Thống Kê Doanh Số Giao Thương Nội Bộ & Đo Lường Giá Trị Trao Nhận Giữa Các Thành Viên

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-54** |
| **Phân Hệ / Nhóm** | Sàn Giao Thương B2B & Cơ Hội |
| **Tên Chức Năng** | Thống Kê Doanh Số Giao Thương Nội Bộ & Đo Lường Giá Trị Trao Nhận Giữa Các Thành Viên |
| **Tác Nhân (Actor)** | Ban Xúc Tiến Thương Mại, Ban Lãnh Đạo CLB |
| **Tiền Điều Kiện (Pre-conditions)** | Các hợp đồng kinh tế giữa các hội viên được ký kết thành công. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở mục "Thống Kê Doanh Số Giao Thương".<br>2. Màn hình báo cáo tổng kết giá trị kết nối:<br>   - Tổng số lượt trao đổi cơ hội kinh doanh (Leads)<br>   - Tổng số hợp đồng đã ký kết thành công<br>   - Tổng giá trị doanh thu giao thương nội bộ được ghi nhận (ví dụ: Hơn 150 tỷ VNĐ)<br>   - Bảng vinh danh các Doanh nhân tiên phong trao nhiều cơ hội nhất cho cộng đồng.<br>3. Xuất báo cáo biểu dương tại các kỳ Đại hội định kỳ của CLB. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Hệ thống bảo mật tuyệt đối các chi tiết hợp đồng nhạy cảm, chỉ hiển thị giá trị quy đổi phục vụ thi đua. |
| **Hậu Điều Kiện (Post-conditions)** | Chứng minh hiệu quả thực tế và sức mạnh tương trợ của mạng lưới Doanh nhân CEO 1983. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Báo cáo thống kê giá trị giao thương nội bộ và bảng vinh danh kết nối kinh doanh* |

![Báo cáo thống kê giá trị giao thương nội bộ và bảng vinh danh kết nối kinh doanh](images/evidence/crm_step_09_opportunities_sync.png)


### 5.65. Bảng Use Case UC-CRM-55: Soạn Thảo, Định Dạng & Xuất Bản Tin Tức Hoạt Động CLB & Thông Điệp Chủ Tịch

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-55** |
| **Phân Hệ / Nhóm** | Truyền Thông & Bản Tin CLB |
| **Tên Chức Năng** | Soạn Thảo, Định Dạng & Xuất Bản Tin Tức Hoạt Động CLB & Thông Điệp Chủ Tịch |
| **Tác Nhân (Actor)** | Ban Truyền Thông (ceo.truyenthong@ceo1983.com) |
| **Tiền Điều Kiện (Pre-conditions)** | Ban Truyền Thông đăng nhập Cổng Quản trị; có tin tức mới cần công bố. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ban Truyền Thông mở phân hệ "Truyền Thông & Tin Tức", bấm "Viết Bài Mới".<br>2. Sử dụng trình soạn thảo trực quan cao cấp (Rich Text Editor):<br>   - Tiêu đề bài viết: "Thông Điệp Khai Xuân Của Chủ Tịch CLB Doanh Nhân CEO 1983"<br>   - Chọn chuyên mục: Tin Tức CLB / Hoạt Động Ban Chuyên Môn / Câu Chuyện Doanh Nhân<br>   - Tải lên Ảnh đại diện bài viết sắc nét<br>   - Định dạng văn bản, chèn ảnh phóng sự và video nhúng<br>   - Bật tùy chọn "Ghim Lên Đầu Bảng Tin Trang Chủ".<br>3. Nhấn "Xuất Bản Ngay".<br>4. Bài viết lập tức xuất hiện trang trọng trên mục Bản Tin của Ứng dụng Doanh nhân. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Có thể chọn chế độ "Lên lịch xuất bản" để bài viết tự động công bố đúng thời điểm chỉ định. |
| **Hậu Điều Kiện (Post-conditions)** | Thông tin chính thống của CLB được lan tỏa kịp thời, nâng cao đời sống tinh thần hội viên. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện soạn thảo và xuất bản tin tức hoạt động CLB trên Cổng Quản trị* |

![Giao diện soạn thảo và xuất bản tin tức hoạt động CLB trên Cổng Quản trị](images/evidence/crm_13_news_management.png)


### 5.66. Bảng Use Case UC-CRM-56: Quản Lý Banner Carousel Trang Chủ Cổng Thông Tin & Vị Trí Hiển Thị Nhà Tài Trợ

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-56** |
| **Phân Hệ / Nhóm** | Truyền Thông & Bản Tin CLB |
| **Tên Chức Năng** | Quản Lý Banner Carousel Trang Chủ Cổng Thông Tin & Vị Trí Hiển Thị Nhà Tài Trợ |
| **Tác Nhân (Actor)** | Ban Truyền Thông |
| **Tiền Điều Kiện (Pre-conditions)** | Có hình ảnh chiến dịch mới hoặc banner quyền lợi của Nhà Tài Trợ. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở mục "Quản Lý Banner & Quảng Cáo".<br>2. Tải lên tệp ảnh Banner mới (kích thước chuẩn 1920x600px).<br>3. Thiết lập đường dẫn liên kết khi người dùng nhấp vào banner (ví dụ: Dẫn đến trang đăng ký sự kiện Gala hoặc website của Nhà Tài Trợ).<br>4. Sắp xếp thứ tự hiển thị ưu tiên trên thanh trượt Carousel (Slider).<br>5. Đặt thời gian hiệu lực hiển thị (từ ngày... đến ngày...).<br>6. Bấm "Cập Nhật Banner".<br>7. Trang chủ Cổng thông tin và Ứng dụng điện thoại tự động cập nhật banner mới mượt mà. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Khi hết hạn hiệu lực: Banner tự động ẩn xuống, không cần kỹ thuật can thiệp thủ công. |
| **Hậu Điều Kiện (Post-conditions)** | Giao diện luôn tươi mới, truyền tải đúng thông điệp trọng tâm và bảo đảm quyền lợi tài trợ. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Quản trị Banner Carousel trang chủ và cấu hình vị trí hiển thị Nhà tài trợ* |

![Quản trị Banner Carousel trang chủ và cấu hình vị trí hiển thị Nhà tài trợ](images/evidence/btt_screen.png)


### 5.67. Bảng Use Case UC-CRM-57: Tạo Chiến Dịch Email Truyền Thông / Thư Mời Sự Kiện Gửi Đến Toàn Thể Hội Viên Hàng Loạt

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-57** |
| **Phân Hệ / Nhóm** | Truyền Thông & Bản Tin CLB |
| **Tên Chức Năng** | Tạo Chiến Dịch Email Truyền Thông / Thư Mời Sự Kiện Gửi Đến Toàn Thể Hội Viên Hàng Loạt |
| **Tác Nhân (Actor)** | Ban Truyền Thông, Ban Thư Ký |
| **Tiền Điều Kiện (Pre-conditions)** | Cần thông báo một sự kiện trọng đại đến hàng trăm hội viên cùng một thời điểm. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở phân hệ "Chiến Dịch Email Marketing".<br>2. Bấm "Tạo Chiến Dịch Mới".<br>3. Nhập tiêu đề email thu hút: "THƯ MỜI THAM DỰ ĐÊM GALA DOANH NHÂN 1983 — KẾT NỐI KHÁT VỌNG".<br>4. Chọn mẫu giao diện email sang trọng với màu cờ sắc áo thương hiệu CEO 1983.<br>5. Chọn nhóm người nhận: "Toàn Thể Hội Viên Chính Thức".<br>6. Kiểm tra bản xem trước trên giao diện máy tính và điện thoại.<br>7. Bấm "Gửi Chiến Dịch".<br>8. Máy chủ thư tín tự động phân phối email lần lượt, bảo đảm tỷ lệ vào hộp thư chính (Inbox) đạt trên 98%. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Có thể gửi email thử nghiệm (Test Email) đến hộp thư cá nhân để rà soát trước khi gửi diện rộng. |
| **Hậu Điều Kiện (Post-conditions)** | Thông điệp đến tận tay toàn thể hội viên nhanh chóng, đồng bộ và chuyên nghiệp. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện thiết lập chiến dịch Email truyền thông hàng loạt đến toàn thể hội viên* |

![Giao diện thiết lập chiến dịch Email truyền thông hàng loạt đến toàn thể hội viên](images/evidence/crm1983_19_email_marketing.png)


### 5.68. Bảng Use Case UC-CRM-58: Theo Dõi Báo Cáo Hiệu Quả Chiến Dịch Email: Tỷ Lệ Gửi Thành Công, Tỷ Lệ Mở & Nhấp Chuột

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-58** |
| **Phân Hệ / Nhóm** | Truyền Thông & Bản Tin CLB |
| **Tên Chức Năng** | Theo Dõi Báo Cáo Hiệu Quả Chiến Dịch Email: Tỷ Lệ Gửi Thành Công, Tỷ Lệ Mở & Nhấp Chuột |
| **Tác Nhân (Actor)** | Ban Truyền Thông |
| **Tiền Điều Kiện (Pre-conditions)** | Chiến dịch email vừa được phát hành tại UC-CRM-57. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở mục "Báo Cáo Chiến Dịch Email".<br>2. Màn hình phân tích các chỉ số đo lường hiệu quả:<br>   - Tổng số thư đã gửi: 500 thư<br>   - Tỷ lệ gửi thành công: 99.2% (496 thư)<br>   - Tỷ lệ mở thư (Open Rate): 78.5%<br>   - Tỷ lệ nhấp vào liên kết đăng ký (Click Rate): 45.2%.<br>3. Xem danh sách chi tiết các hội viên đã mở thư để Ban Thư Ký tiện nắm bắt thông tin tiếp cận. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Với các email bị trả lại (Bounced): Hệ thống đánh dấu để cập nhật lại thông tin liên lạc chính xác. |
| **Hậu Điều Kiện (Post-conditions)** | Ban Truyền Thông đánh giá được mức độ quan tâm của cộng đồng đối với các sự kiện của CLB. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Báo cáo đo lường tỷ lệ mở thư và hiệu quả truyền thông chiến dịch email* |

![Báo cáo đo lường tỷ lệ mở thư và hiệu quả truyền thông chiến dịch email](images/evidence/crm_13_news_management.png)


### 5.69. Bảng Use Case UC-CRM-59: Cấu Hình Ma Trận Phân Quyền Vai Trò (RBAC) Nghiêm Ngặt Cho 6 Ban Chuyên Môn

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-59** |
| **Phân Hệ / Nhóm** | Phân Quyền RBAC & Kiểm Toán |
| **Tên Chức Năng** | Cấu Hình Ma Trận Phân Quyền Vai Trò (RBAC) Nghiêm Ngặt Cho 6 Ban Chuyên Môn |
| **Tác Nhân (Actor)** | Ban Quản Trị Tối Cao (admin@connect.vn) |
| **Tiền Điều Kiện (Pre-conditions)** | Tài khoản Quản trị tối cao đăng nhập Cổng Quản trị. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở phân hệ "Quản Trị Phân Quyền & Vai Trò" (RBAC Matrix).<br>2. Ma trận phân quyền hiển thị rõ ràng thẩm quyền của từng Ban chuyên môn:<br>   - Ban Quản Trị (BQT): Toàn quyền quản trị hệ thống, demo leads, phân quyền tối cao<br>   - Ban Thư Ký (BTK): Quản lý lịch họp, điểm danh, biên bản (KHÔNG có quyền duyệt hội viên)<br>   - Ban Thành Viên (BTV): ĐỘC QUYỀN thẩm định và phê duyệt hội viên mới, cấp mã số<br>   - Ban Thiện Nguyện (BTN): Quản lý sổ quỹ thiện nguyện và an sinh xã hội<br>   - Ban Truyền Thông (BTT): Quản lý tin tức, sự kiện, banner và soát vé an ninh cổng<br>   - Ban Xúc Tiến (BXT): Quản lý sàn B2B, kiểm duyệt sản phẩm và cơ hội kinh doanh.<br>3. Người dùng có thể điều chỉnh bật/tắt quyền hạn theo từng chức năng nghiệp vụ.<br>4. Bấm "Lưu Ma Trận Phân Quyền". |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Mọi thay đổi về phân quyền đều yêu cầu xác thực mật khẩu cấp 2 của Quản trị viên tối cao. |
| **Hậu Điều Kiện (Post-conditions)** | Hệ sinh thái vận hành theo đúng phân công nhiệm vụ của Quy chế Ban Điều Hành. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Ma trận phân quyền vai trò RBAC chặt chẽ cho 6 Ban chuyên môn trên Cổng Quản trị* |

![Ma trận phân quyền vai trò RBAC chặt chẽ cho 6 Ban chuyên môn trên Cổng Quản trị](images/evidence/crm_roles_permissions.png)


### 5.70. Bảng Use Case UC-CRM-60: Tra Cứu Nhật Ký Hoạt Động Hệ Thống (Audit Logs) Bảo Đảm Tính Toàn Vẹn & Minh Bạch

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-60** |
| **Phân Hệ / Nhóm** | Phân Quyền RBAC & Kiểm Toán |
| **Tên Chức Năng** | Tra Cứu Nhật Ký Hoạt Động Hệ Thống (Audit Logs) Bảo Đảm Tính Toàn Vẹn & Minh Bạch |
| **Tác Nhân (Actor)** | Ban Quản Trị, Ban Kiểm Tra CLB |
| **Tiền Điều Kiện (Pre-conditions)** | Người dùng truy cập phân hệ Nhật ký Kiểm toán. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở mục "Nhật Ký Kiểm Toán" (Audit Logs).<br>2. Danh sách lưu trữ bất biến (Immutable) toàn bộ lịch sử thao tác của các tài khoản:<br>   - Thời gian thực hiện chính xác đến từng giây<br>   - Tài khoản thực hiện (Email, Tên cán bộ, Ban chuyên môn)<br>   - Hành động nghiệp vụ: Phê duyệt hội viên, Sửa thông tin tài chính, Xóa bài đăng...<br>   - Địa chỉ mạng và thiết bị thực hiện.<br>3. Người dùng lọc lịch sử theo tài khoản hoặc theo khoảng thời gian để phục vụ công tác thanh tra nội bộ. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Dữ liệu nhật ký kiểm toán không thể bị sửa đổi hoặc xóa bỏ bởi bất kỳ ai. |
| **Hậu Điều Kiện (Post-conditions)** | Tổ chức bảo đảm tính minh bạch, trách nhiệm giải trình và liêm chính tuyệt đối. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Nhật ký kiểm toán hệ thống ghi nhận chi tiết mọi hành vi can thiệp dữ liệu* |

![Nhật ký kiểm toán hệ thống ghi nhận chi tiết mọi hành vi can thiệp dữ liệu](images/evidence/crm_audit_logs.png)


### 5.71. Bảng Use Case UC-CRM-61: Cấu Hình Giao Diện, Màu Sắc Thương Hiệu & Bộ Nhận Diện CLB Doanh Nhân CEO 1983

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-61** |
| **Phân Hệ / Nhóm** | Phân Quyền RBAC & Kiểm Toán |
| **Tên Chức Năng** | Cấu Hình Giao Diện, Màu Sắc Thương Hiệu & Bộ Nhận Diện CLB Doanh Nhân CEO 1983 |
| **Tác Nhân (Actor)** | Ban Quản Trị Tối Cao |
| **Tiền Điều Kiện (Pre-conditions)** | Ban Điều Hành quyết định thay đổi phong cách giao diện hoặc chủ đề kỷ niệm năm. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở mục "Cấu Hình Nhận Diện Thương Hiệu" (Theme Settings).<br>2. Tùy chỉnh các thông số thiết kế:<br>   - Màu sắc chủ đạo: Xanh Hoàng Gia (Royal Navy), Vàng Kim (Luxury Gold)<br>   - Tải lên Logo chính thức CLB Doanh Nhân CEO 1983 và Logo Hội HanoiBA<br>   - Phông chữ tiêu đề và nội dung chuẩn văn phòng<br>   - Khẩu hiệu chính thức và thông tin bản quyền chân trang.<br>3. Bấm "Áp Dụng Toàn Hệ Thống".<br>4. Toàn bộ Cổng Quản trị, Cổng Thông tin và Ứng dụng điện thoại tự động đồng bộ diện mạo mới. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Có thể chọn các giao diện chủ đề có sẵn: Giao diện Hội nghị, Giao diện Tết Cổ Truyền, Giao diện Gala. |
| **Hậu Điều Kiện (Post-conditions)** | Hình ảnh thương hiệu CLB Doanh Nhân CEO 1983 luôn nhất quán và đẳng cấp. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện cấu hình bộ nhận diện thương hiệu và phong cách giao diện hệ thống* |

![Giao diện cấu hình bộ nhận diện thương hiệu và phong cách giao diện hệ thống](images/evidence/crm_theme_management.png)


### 5.72. Bảng Use Case UC-CRM-62: Quản Lý Kho Tài Liệu Pháp Lý, Quy Chế Hiệp Hội & Văn Bản Điều Hành Điện Tử

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-62** |
| **Phân Hệ / Nhóm** | Phân Quyền RBAC & Kiểm Toán |
| **Tên Chức Năng** | Quản Lý Kho Tài Liệu Pháp Lý, Quy Chế Hiệp Hội & Văn Bản Điều Hành Điện Tử |
| **Tác Nhân (Actor)** | Ban Thư Ký, Toàn Thể Ban Chấp Hành |
| **Tiền Điều Kiện (Pre-conditions)** | Người dùng truy cập Thư viện Văn bản Pháp quy trên Cổng Quản trị. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Người dùng mở mục "Kho Văn Bản & Tài Liệu" (Documents Library).<br>2. Danh mục lưu trữ các tài liệu nền tảng của CLB:<br>   - Quyết định thành lập CLB Doanh Nhân CEO 1983 của Hội Doanh Nhân Trẻ Hà Nội<br>   - Điều lệ & Quy chế sinh hoạt Hội viên<br>   - Quy chế quản lý tài chính và quỹ an sinh xã hội<br>   - Các biểu mẫu hồ sơ, hợp đồng mẫu dành cho doanh nghiệp.<br>3. Người dùng có thể xem trực tuyến dạng PDF hoặc tải tệp gốc về máy tính.<br>4. Ban Thư Ký có thể tải lên các văn bản mới và phân quyền đối tượng được phép tải về. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Các văn bản mật chỉ dành cho Thường trực BCH sẽ được mã hóa và yêu cầu mật khẩu mở. |
| **Hậu Điều Kiện (Post-conditions)** | Hệ thống văn bản pháp lý được lưu trữ khoa học, phục vụ điều hành đúng pháp luật. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Kho tài liệu pháp lý, quy chế hiệp hội và văn bản điều hành điện tử CLB* |

![Kho tài liệu pháp lý, quy chế hiệp hội và văn bản điều hành điện tử CLB](images/evidence/crm_documents_library.png)


### 5.73. Bảng Use Case UC-CRM-63: Khởi Tạo Lịch Họp Ban Chấp Hành Thường Niên, Đặt Phòng Họp & Đính Kèm Nghị Quyết Điện Tử

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-63** |
| **Phân Hệ / Nhóm** | Ban Thư Ký & Điều Hành Cuộc Họp |
| **Tên Chức Năng** | Khởi Tạo Lịch Họp Ban Chấp Hành Thường Niên, Đặt Phòng Họp & Đính Kèm Nghị Quyết Điện Tử |
| **Tác Nhân (Actor)** | Ban Thư Ký CLB Doanh Nhân CEO 1983 |
| **Tiền Điều Kiện (Pre-conditions)** | Ban Thư Ký đăng nhập Cổng Quản Trị và mở phân hệ Quản Lý Cuộc Họp. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Nhấn nút "Tạo Cuộc Họp Mới".<br>2. Điền thông tin: Tiêu đề phiên họp thường kỳ Ban Chấp Hành, Thời gian bắt đầu và kết thúc, Địa điểm phòng họp trực tiếp tại Văn phòng Hiệp hội hoặc đường link họp trực tuyến bảo mật.<br>3. Đính kèm tài liệu: Chương trình nghị sự (Agenda), Báo cáo hoạt động tháng và Dự thảo Nghị quyết Ban Chấp Hành.<br>4. Chọn danh sách đại biểu triệu tập: Toàn thể Ủy viên Ban Chấp Hành 6 Ban.<br>5. Bấm "Phát Hành Thông Báo Họp".<br>6. Hệ thống tự động đồng bộ lịch vào ứng dụng di động của từng đại biểu và gửi email triệu tập. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu phòng họp vật lý đã có lịch trùng: Hệ thống hiển thị cảnh báo đỏ và gợi ý phòng họp dự phòng. |
| **Hậu Điều Kiện (Post-conditions)** | Lịch họp Ban Chấp Hành được phát hành chính thức, đại biểu nhận thông báo tức thời. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Lịch họp Ban Chấp Hành và quản trị phiên họp điều hành tập trung* |

![Lịch họp Ban Chấp Hành và quản trị phiên họp điều hành tập trung](images/evidence/crm1983_09_meetings_calendar.png)


### 5.74. Bảng Use Case UC-CRM-64: Điểm Danh Đại Biểu Dự Họp Ban Chấp Hành & Xuất Biên Bản Biểu Quyết Tự Động

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-64** |
| **Phân Hệ / Nhóm** | Ban Thư Ký & Điều Hành Cuộc Họp |
| **Tên Chức Năng** | Điểm Danh Đại Biểu Dự Họp Ban Chấp Hành & Xuất Biên Bản Biểu Quyết Tự Động |
| **Tác Nhân (Actor)** | Ban Thư Ký CLB |
| **Tiền Điều Kiện (Pre-conditions)** | Phiên họp Ban Chấp Hành đang diễn ra. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ban Thư Ký mở màn hình Điểm danh phiên họp trên Cổng Quản Trị.<br>2. Khi đại biểu vào phòng, hệ thống hỗ trợ điểm danh nhanh qua quét mã QR trên thẻ đại biểu hoặc đánh dấu thủ công theo danh sách.<br>3. Hệ thống hiển thị tỷ lệ đại biểu có mặt theo thời gian thực (Đạt tỷ lệ trên 2/3 để phiên họp hợp lệ theo Điều lệ CLB).<br>4. Sau khi kết thúc phần biểu quyết các tờ trình, Ban Thư Ký nhấn nút "Xuất Biên Bản Phiên Họp".<br>5. Hệ thống kết xuất file Biên bản họp đầy đủ chữ ký số điện tử và kết quả biểu quyết chi tiết. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Trường hợp đại biểu ủy quyền: Ban Thư Ký cập nhật thông tin người được ủy quyền và lưu trữ văn bản ủy quyền hợp lệ. |
| **Hậu Điều Kiện (Post-conditions)** | Biên bản phiên họp Ban Chấp Hành được lưu trữ vào Kho tài liệu pháp lý và gửi cho toàn thể BCH. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện điểm danh đại biểu dự họp và quản lý trạng thái tham dự phiên họp* |

![Giao diện điểm danh đại biểu dự họp và quản lý trạng thái tham dự phiên họp](images/evidence/crm_checkin_management.png)


### 5.75. Bảng Use Case UC-CRM-65: Khởi Tạo Chương Trình Gây Quỹ Thiện Nguyện "Áo Ấm Cho Em" & Công Khai Mục Tiêu Quyên Góp

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-65** |
| **Phân Hệ / Nhóm** | Ban Thiện Nguyện & An Sinh Xã Hội |
| **Tên Chức Năng** | Khởi Tạo Chương Trình Gây Quỹ Thiện Nguyện "Áo Ấm Cho Em" & Công Khai Mục Tiêu Quyên Góp |
| **Tác Nhân (Actor)** | Ban Thiện Nguyện CLB Doanh Nhân CEO 1983 |
| **Tiền Điều Kiện (Pre-conditions)** | Ban Thiện Nguyện đăng nhập Cổng Quản Trị và mở phân hệ Sổ Quỹ & Hoạt Động Thiện Nguyện. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Nhấn nút "Tạo Chiến Dịch Thiện Nguyện Mới".<br>2. Nhập thông tin chương trình: Tên chiến dịch "Áo Ấm Cho Em - Điểm Trường Vùng Cao 2026", Mục tiêu quyên góp (200.000.000 VNĐ), Thời gian tiếp nhận ủng hộ.<br>3. Đính kèm kế hoạch khảo sát thực địa, thư ngỏ kêu gọi và hình ảnh điểm trường cần hỗ trợ.<br>4. Cấu hình số tài khoản chuyên dùng của Quỹ Thiện Nguyện CLB tại Ngân hàng TMCP Quân Đội (MB Bank).<br>5. Bấm "Phát Động Chiến Dịch".<br>6. Hệ thống xuất bản chiến dịch lên Ứng dụng Hội viên và Cổng thông tin điện tử công khai. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Ban Thiện Nguyện có thể gắn nhãn đối tác đồng hành tài trợ để ghi nhận sự đóng góp của các doanh nghiệp. |
| **Hậu Điều Kiện (Post-conditions)** | Chiến dịch thiện nguyện được kích hoạt, sẵn sàng tiếp nhận ủng hộ từ cộng đồng doanh nhân. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Phân hệ quản lý các chương trình an sinh xã hội và chiến dịch gây quỹ của Ban Thiện Nguyện* |

![Phân hệ quản lý các chương trình an sinh xã hội và chiến dịch gây quỹ của Ban Thiện Nguyện](images/evidence/btn_screen.png)


### 5.76. Bảng Use Case UC-CRM-66: Minh Bạch Danh Sách Đóng Góp Quỹ Thiện Nguyện Thời Gian Thực & Tự Động Xuất Thư Tri Ân

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-66** |
| **Phân Hệ / Nhóm** | Ban Thiện Nguyện & An Sinh Xã Hội |
| **Tên Chức Năng** | Minh Bạch Danh Sách Đóng Góp Quỹ Thiện Nguyện Thời Gian Thực & Tự Động Xuất Thư Tri Ân |
| **Tác Nhân (Actor)** | Ban Thiện Nguyện, Ban Tài Chính |
| **Tiền Điều Kiện (Pre-conditions)** | Các nhà hảo tâm và doanh nghiệp thành viên thực hiện chuyển khoản ủng hộ. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Hệ thống tự động bắt tín hiệu giao dịch ngân hàng qua cổng VietQR 24/7 đối với các khoản ủng hộ Quỹ Thiện Nguyện.<br>2. Danh sách ủng hộ tự động cập nhật tên doanh nhân/doanh nghiệp, số tiền và lời nhắn trên Bảng vàng nhân ái.<br>3. Ban Thiện Nguyện kiểm tra đối soát từng khoản đóng góp.<br>4. Nhấn nút "Gửi Thư Tri Ân Tấm Lòng Vàng".<br>5. Hệ thống tự động phát thư cảm ơn trang trọng kèm Giấy chứng nhận đóng góp an sinh xã hội điện tử gửi về email người ủng hộ. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Trường hợp nhà hảo tâm muốn ẩn danh: Hệ thống tự động ghi nhận là "Doanh nhân hảo tâm ẩn danh" trên bảng công khai nhưng vẫn lưu trữ mã đối soát trong sổ quỹ. |
| **Hậu Điều Kiện (Post-conditions)** | Quỹ thiện nguyện đạt tính minh bạch 100%, tạo dựng niềm tin tuyệt đối trong cộng đồng. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Báo cáo minh bạch dòng tiền ủng hộ và sao kê tài chính Quỹ Thiện Nguyện* |

![Báo cáo minh bạch dòng tiền ủng hộ và sao kê tài chính Quỹ Thiện Nguyện](images/evidence/crm1983_14_finance_report.png)


### 5.77. Bảng Use Case UC-CRM-67: Theo Dõi Đối Soát Giải Ngân Chi Tiết Cho Hoạt Động Thiện Nguyện Thực Tế Kèm Chứng Từ Hóa Đơn

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-67** |
| **Phân Hệ / Nhóm** | Ban Thiện Nguyện & An Sinh Xã Hội |
| **Tên Chức Năng** | Theo Dõi Đối Soát Giải Ngân Chi Tiết Cho Hoạt Động Thiện Nguyện Thực Tế Kèm Chứng Từ Hóa Đơn |
| **Tác Nhân (Actor)** | Ban Thiện Nguyện, Kế Toán Trưởng CLB |
| **Tiền Điều Kiện (Pre-conditions)** | Đoàn công tác hoàn thành chuyến cứu trợ/thiện nguyện thực tế. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Mở mục "Sổ Quỹ Thiện Nguyện" trên Cổng Quản Trị.<br>2. Chọn chiến dịch cần quyết toán giải ngân.<br>3. Tải lên toàn bộ hồ sơ chứng từ: Hóa đơn mua áo ấm, sách vở, vật liệu xây dựng điểm trường, biên bản bàn giao có xác nhận của chính quyền địa phương sở tại.<br>4. Nhập chi tiết các khoản chi thực tế và đối soát với số dư quỹ tiếp nhận.<br>5. Bấm "Khóa Quyết Toán & Xuất Báo Cáo Giải Ngân".<br>6. Báo cáo giải ngân được gửi đến Ban Thường Trực thẩm tra trước khi công khai cho toàn thể hội viên. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu số dư quỹ còn thừa: Hệ thống tự động kết chuyển phần dư vào Quỹ Dự Phòng An Sinh Xã Hội để sử dụng cho chiến dịch khẩn cấp tiếp theo. |
| **Hậu Điều Kiện (Post-conditions)** | Hồ sơ giải ngân thiện nguyện được số hóa đầy đủ chứng từ pháp lý và minh bạch tuyệt đối. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Quản lý phiếu chi, đối soát chứng từ và giải ngân các hoạt động thiện nguyện thực tế* |

![Quản lý phiếu chi, đối soát chứng từ và giải ngân các hoạt động thiện nguyện thực tế](images/evidence/crm1983_13_expenses_management.png)


### 5.78. Bảng Use Case UC-CRM-68: Phê Duyệt & Thẩm Định Gian Hàng B2B Doanh Nghiệp Thành Viên Trên Sàn Giao Thương CEO 1983

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-68** |
| **Phân Hệ / Nhóm** | Ban Xúc Tiến Thương Mại |
| **Tên Chức Năng** | Phê Duyệt & Thẩm Định Gian Hàng B2B Doanh Nghiệp Thành Viên Trên Sàn Giao Thương CEO 1983 |
| **Tác Nhân (Actor)** | Ban Xúc Tiến Thương Mại |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên chính thức gửi yêu cầu đăng ký sản phẩm / dịch vụ lên Gian hàng B2B. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ban Xúc Tiến Thương Mại mở danh sách "Sản Phẩm Chờ Phê Duyệt" trên Cổng Quản Trị.<br>2. Rà soát thông tin sản phẩm: Tên hàng hóa dịch vụ, Hình ảnh chất lượng cao, Giá niêm yết công khai và Giá ưu đãi đặc quyền dành riêng cho hội viên CEO 1983 (Tối thiểu chiết khấu 10%).<br>3. Kiểm tra tính pháp lý: Giấy phép kinh doanh, Giấy chứng nhận tiêu chuẩn chất lượng (ISO/HACCP/CO-CQ nếu có).<br>4. Nhấn nút "Phê Duyệt & Đưa Lên Gian Hàng B2B".<br>5. Hệ thống tự động kích hoạt sản phẩm trên Sàn Giao thương B2B của Ứng dụng Hội viên và gửi thông báo chúc mừng tới doanh nghiệp. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu sản phẩm chưa đạt chuẩn hình ảnh hoặc thiếu chính sách ưu đãi nội bộ: Bấm "Yêu Cầu Bổ Sung" kèm ghi chú cụ thể để hội viên hiệu chỉnh lại. |
| **Hậu Điều Kiện (Post-conditions)** | Sản phẩm được niêm yết trên Gian hàng B2B, đảm bảo uy tín và chất lượng thương hiệu CEO 1983. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Bảng điều khiển kiểm duyệt và thẩm định danh mục sản phẩm trên Gian hàng B2B của Ban Xúc Tiến* |

![Bảng điều khiển kiểm duyệt và thẩm định danh mục sản phẩm trên Gian hàng B2B của Ban Xúc Tiến](images/evidence/bxt_screen.png)


### 5.79. Bảng Use Case UC-CRM-69: Thẩm Định Nhu Cầu Mua Hàng & Khớp Lệnh Giao Thương Nội Bộ B2B Tự Động Giữa Các Hội Viên

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-69** |
| **Phân Hệ / Nhóm** | Ban Xúc Tiến Thương Mại |
| **Tên Chức Năng** | Thẩm Định Nhu Cầu Mua Hàng & Khớp Lệnh Giao Thương Nội Bộ B2B Tự Động Giữa Các Hội Viên |
| **Tác Nhân (Actor)** | Ban Xúc Tiến Thương Mại |
| **Tiền Điều Kiện (Pre-conditions)** | Có hội viên đăng tải nhu cầu tìm nhà cung cấp hoặc cơ hội hợp tác kinh doanh. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ban Xúc Tiến mở bảng điều khiển "Khớp Lệnh Cung - Cầu".<br>2. Hệ thống hiển thị các tin đăng: Cần tìm nhà thầu xây dựng văn phòng, Cần nguồn cung cấp thiết bị công nghệ, Cần hợp tác logistics.<br>3. Chuyên viên Ban Xúc Tiến kiểm tra nhu cầu và sử dụng tính năng "Gợi Ý Đối Tác Phù Hợp" dựa trên danh bạ ngành nghề của các hội viên chính thức.<br>4. Bấm nút "Kết Nối Khớp Lệnh 1-1".<br>5. Hệ thống gửi thông điệp kết nối giao thương trực tiếp đến lãnh đạo của hai doanh nghiệp qua tin nhắn ứng dụng. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Ban Xúc Tiến có thể tổ chức buổi gặp gỡ trực tiếp (Business Matching Offline) tại văn phòng CLB để hỗ trợ hai bên ký kết hợp đồng. |
| **Hậu Điều Kiện (Post-conditions)** | Cơ hội kinh doanh được kết nối chuẩn xác, gia tăng doanh số thực tế giữa các doanh nghiệp thành viên. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Điều phối cơ hội cung - cầu và hỗ trợ kết nối khớp lệnh giao thương nội bộ* |

![Điều phối cơ hội cung - cầu và hỗ trợ kết nối khớp lệnh giao thương nội bộ](images/evidence/crm_11_opportunities_sync.png)


### 5.80. Bảng Use Case UC-CRM-70: Xuất Báo Cáo Tổng Doanh Số Giao Thương B2B Giữa Các Doanh Nghiệp Thành Viên Định Kỳ

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-70** |
| **Phân Hệ / Nhóm** | Ban Xúc Tiến Thương Mại |
| **Tên Chức Năng** | Xuất Báo Cáo Tổng Doanh Số Giao Thương B2B Giữa Các Doanh Nghiệp Thành Viên Định Kỳ |
| **Tác Nhân (Actor)** | Ban Xúc Tiến Thương Mại, Ban Quản Trị |
| **Tiền Điều Kiện (Pre-conditions)** | Các giao dịch B2B nội bộ được các doanh nghiệp xác nhận hoàn tất thành công. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Mở phân hệ "Báo Cáo Giao Thương B2B" trên Cổng Quản Trị.<br>2. Chọn kỳ báo cáo: Quý I/2026 hoặc Báo cáo Tổng kết năm.<br>3. Hệ thống hiển thị các chỉ số cốt lõi: Tổng giá trị giao thương đã thực hiện, Số lượng hợp đồng đã ký kết, Top 10 doanh nghiệp có doanh số giao thương nội bộ cao nhất, Top các ngành nghề giao thương sôi động nhất.<br>4. Nhấn nút "Xuất Báo Cáo Giao Thương Định Kỳ (Excel/PDF)".<br>5. Tệp báo cáo được xuất bản phục vụ cuộc họp giao ban Ban Chấp Hành và vinh danh Doanh nghiệp Giao thương Tiêu biểu. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Ban Xúc Tiến có thể lọc chi tiết theo từng ban chuyên môn để đánh giá mức độ tích cực kết nối. |
| **Hậu Điều Kiện (Post-conditions)** | Số liệu giao thương nội bộ được lượng hóa rõ ràng, khẳng định giá trị thực chất của CLB Doanh Nhân CEO 1983. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Báo cáo tổng hợp số liệu giao dịch và hiệu quả giao thương nội bộ B2B* |

![Báo cáo tổng hợp số liệu giao dịch và hiệu quả giao thương nội bộ B2B](images/evidence/crm1983_17_marketplace_b2b.png)


### 5.81. Bảng Use Case UC-CRM-71: Biên Tập Bản Tin Nội Bộ "Tiếng Nói Doanh Nhân 1983" & Xuất Bản Lên Cổng Thông Tin

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-71** |
| **Phân Hệ / Nhóm** | Ban Truyền Thông |
| **Tên Chức Năng** | Biên Tập Bản Tin Nội Bộ "Tiếng Nói Doanh Nhân 1983" & Xuất Bản Lên Cổng Thông Tin |
| **Tác Nhân (Actor)** | Ban Truyền Thông |
| **Tiền Điều Kiện (Pre-conditions)** | Ban Truyền Thông chuẩn bị bài viết về doanh nhân tiêu biểu hoặc hoạt động của CLB. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ban Truyền Thông mở phân hệ "Quản Trị Tin Tức & Truyền Thông" trên Cổng Quản Trị.<br>2. Nhấn nút "Viết Bài Mới".<br>3. Trình soạn thảo văn bản đa phương tiện hiển thị: Nhập Tiêu đề, Tóm tắt bài viết, Nội dung chi tiết, Hình ảnh minh họa chất lượng cao và Video phóng sự đính kèm.<br>4. Chọn chuyên mục: "Gương Mặt Doanh Nhân 1983" hoặc "Hoạt Động CLB & HanoiBA".<br>5. Nhấn nút "Xuất Bản Bản Tin".<br>6. Bài viết lập tức hiển thị trên Cổng thông tin điện tử và mục Tin Tức của Ứng dụng Hội viên. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Bài viết có thể được lưu ở trạng thái "Bản nháp" để Trưởng Ban Truyền Thông kiểm duyệt trước khi phát hành. |
| **Hậu Điều Kiện (Post-conditions)** | Thông tin hoạt động và hình ảnh doanh nhân thành viên được lan tỏa rộng rãi, nâng tầm thương hiệu CLB. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Phân hệ quản trị tin tức, sự kiện và xuất bản bản tin của Ban Truyền Thông* |

![Phân hệ quản trị tin tức, sự kiện và xuất bản bản tin của Ban Truyền Thông](images/evidence/btt_screen.png)


### 5.82. Bảng Use Case UC-CRM-72: Quản Lý & Phân Phối Banner Quảng Bá Nhà Tài Trợ Trên Toàn Hệ Sinh Thái Số CEO 1983

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-72** |
| **Phân Hệ / Nhóm** | Ban Truyền Thông |
| **Tên Chức Năng** | Quản Lý & Phân Phối Banner Quảng Bá Nhà Tài Trợ Trên Toàn Hệ Sinh Thái Số CEO 1983 |
| **Tác Nhân (Actor)** | Ban Truyền Thông, Ban Xúc Tiến |
| **Tiền Điều Kiện (Pre-conditions)** | CLB ký kết hợp đồng tài trợ truyền thông với các thương hiệu đối tác. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ban Truyền Thông mở mục "Quản Lý Quảng Cáo & Banner".<br>2. Nhấn "Thêm Banner Mới".<br>3. Tải lên hình ảnh banner chuẩn kích thước theo nhận diện thương hiệu sang trọng.<br>4. Thiết lập vị trí hiển thị: Banner trang chủ Cổng thông tin, Banner đầu trang Ứng dụng Hội viên hoặc Banner trong Gian hàng B2B.<br>5. Cài đặt thời gian chạy chiến dịch và liên kết chuyển tiếp tới trang giới thiệu của Nhà tài trợ.<br>6. Bấm "Kích Hoạt Banner".<br>7. Hệ thống tự động phân phối hiển thị luân phiên (Carousel) mượt mà. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Khi hết thời hạn tài trợ: Hệ thống tự động ẩn banner và gửi thông báo nhắc gia hạn tới chuyên viên truyền thông. |
| **Hậu Điều Kiện (Post-conditions)** | Quyền lợi truyền thông của các Nhà tài trợ được đảm bảo thực hiện chính xác, chuyên nghiệp. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Quản trị danh mục tin tức, thông báo và điều phối banner truyền thông tài trợ* |

![Quản trị danh mục tin tức, thông báo và điều phối banner truyền thông tài trợ](images/evidence/crm1983_18_news_announcements.png)


### 5.83. Bảng Use Case UC-CRM-73: Bảng Điều Khiển Tài Chính Tổng Thể: Quỹ CLB, Quỹ Thiện Nguyện & Tồn Dư Khả Dụng

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-73** |
| **Phân Hệ / Nhóm** | Ban Quản Trị & Ban Chấp Hành |
| **Tên Chức Năng** | Bảng Điều Khiển Tài Chính Tổng Thể: Quỹ CLB, Quỹ Thiện Nguyện & Tồn Dư Khả Dụng |
| **Tác Nhân (Actor)** | Chủ Tịch CLB, Ban Quản Trị, Kế Toán Trưởng |
| **Tiền Điều Kiện (Pre-conditions)** | Lãnh đạo đăng nhập Cổng Quản Trị với vai trò Ban Quản Trị tối cao. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Mở màn hình "Tổng Quan Tài Chính Hiệp Hội".<br>2. Hệ thống hiển thị biểu đồ và số liệu phân tích tài chính thời gian thực:<br>   - Tổng số dư khả dụng tại tất cả tài khoản ngân hàng<br>   - Số dư phân bổ theo 3 quỹ độc lập: Quỹ Hoạt Động Thường Niên, Quỹ An Sinh Xã Hội Thiện Nguyện, Quỹ Đầu Tư Phát Triển CLB<br>   - Tổng thu hội phí năm hiện tại và tỷ lệ hoàn thành chỉ tiêu thu<br>   - Tổng chi phí hoạt động đã giải ngân theo từng tháng.<br>3. Lãnh đạo có thể chọn xem dòng tiền theo từng tuần, từng quý hoặc so sánh với cùng kỳ năm trước. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Lãnh đạo có thể yêu cầu trích xuất bảng sao kê chi tiết để báo cáo Thường trực HanoiBA. |
| **Hậu Điều Kiện (Post-conditions)** | Lãnh đạo nắm chắc bức tranh tài chính toàn diện, minh bạch và an toàn của tổ chức. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Bảng điều khiển theo dõi tổng quan các nguồn thu và dòng tiền hoạt động của Hiệp hội* |

![Bảng điều khiển theo dõi tổng quan các nguồn thu và dòng tiền hoạt động của Hiệp hội](images/evidence/crm1983_12_income_management.png)


### 5.84. Bảng Use Case UC-CRM-74: Phê Duyệt Dự Toán & Ký Số Lệnh Chi Điện Tử Nội Bộ Trước Khi Giải Ngân Thực Tế

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-74** |
| **Phân Hệ / Nhóm** | Ban Quản Trị & Ban Chấp Hành |
| **Tên Chức Năng** | Phê Duyệt Dự Toán & Ký Số Lệnh Chi Điện Tử Nội Bộ Trước Khi Giải Ngân Thực Tế |
| **Tác Nhân (Actor)** | Chủ Tịch CLB, Tổng Thư Ký, Kế Toán Trưởng |
| **Tiền Điều Kiện (Pre-conditions)** | Có phiếu đề xuất thanh toán/chi phí phát sinh từ các Ban chuyên môn. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Lãnh đạo mở danh sách "Phiếu Chi Chờ Duyệt" trên Cổng Quản Trị.<br>2. Xem chi tiết phiếu chi: Ban đề xuất, Lý do chi, Số tiền, Hạn mục dự toán đã duyệt, Đính kèm hợp đồng và báo giá cạnh tranh.<br>3. Kế toán trưởng kiểm tra tính hợp lệ của chứng từ và ký xác nhận đề xuất.<br>4. Chủ tịch CLB xem xét và bấm nút "Phê Duyệt Lệnh Chi Bằng Chữ Ký Số".<br>5. Hệ thống đóng dấu duyệt điện tử và chuyển trạng thái phiếu chi sang "Đã phê duyệt - Sẵn sàng giải ngân".<br>6. Thủ quỹ căn cứ vào lệnh chi đã duyệt để thực hiện lệnh chuyển khoản qua ngân hàng. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu phiếu chi vượt định mức dự toán: Hệ thống cảnh báo màu vàng và yêu cầu Chủ tịch CLB phê duyệt bổ sung ngân sách. |
| **Hậu Điều Kiện (Post-conditions)** | Mọi khoản chi tiêu đều được kiểm soát chặt chẽ qua quy trình 3 bước minh bạch, tránh thất thoát quỹ. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Quy trình kiểm duyệt phiếu chi, đối soát chứng từ và quản lý giải ngân nội bộ* |

![Quy trình kiểm duyệt phiếu chi, đối soát chứng từ và quản lý giải ngân nội bộ](images/evidence/crm_vione_08_finance_expenses.png)


### 5.85. Bảng Use Case UC-CRM-75: Quản Lý Danh Mục Đối Tác Chiến Lược & Nhà Tài Trợ Vàng, Bạc, Kim Cương Của Hiệp Hội

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-75** |
| **Phân Hệ / Nhóm** | Ban Quản Trị & Ban Chấp Hành |
| **Tên Chức Năng** | Quản Lý Danh Mục Đối Tác Chiến Lược & Nhà Tài Trợ Vàng, Bạc, Kim Cương Của Hiệp Hội |
| **Tác Nhân (Actor)** | Ban Quản Trị, Ban Vận Động Tài Trợ |
| **Tiền Điều Kiện (Pre-conditions)** | CLB thiết lập quan hệ hợp tác với các tập đoàn và nhà tài trợ lớn. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Mở phân hệ "Nhà Tài Trợ & Đối Tác Chiến Lược" trên Cổng Quản Trị.<br>2. Xem danh sách các gói tài trợ: Kim Cương, Vàng, Bạc, Đồng và Nhà Tài Trợ Đồng Hành.<br>3. Thêm mới đối tác tài trợ: Tên tập đoàn, Logo chính thức, Giá trị gói tài trợ, Danh mục quyền lợi cam kết (Số lượng bàn VIP tại Gala, Số lượng banner quảng bá, Thời lượng phát biểu trên diễn đàn).<br>4. Theo dõi tiến độ thanh toán tài trợ và trạng thái bàn giao quyền lợi thực tế cho đối tác.<br>5. Bấm lưu và kích hoạt ghi nhận đối tác trên toàn hệ thống. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Khi đối tác hoàn tất nghĩa vụ tài trợ: Hệ thống tự động xuất Kỷ niệm chương điện tử và Thư tri ân đối tác chiến lược. |
| **Hậu Điều Kiện (Post-conditions)** | Hệ thống đối tác tài trợ được quản lý chuyên nghiệp, duy trì mối quan hệ hợp tác bền vững. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Quản lý danh sách nhà tài trợ, các gói quyền lợi và theo dõi cam kết tài trợ* |

![Quản lý danh sách nhà tài trợ, các gói quyền lợi và theo dõi cam kết tài trợ](images/evidence/crm1983_15_sponsors_management.png)


### 5.86. Bảng Use Case UC-CRM-76: Thiết Lập Tự Động Hóa Vận Hành: Nhắc Đóng Phí, Chúc Mừng Sinh Nhật Tự Động

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-76** |
| **Phân Hệ / Nhóm** | Ban Quản Trị & Ban Chấp Hành |
| **Tên Chức Năng** | Thiết Lập Tự Động Hóa Vận Hành: Nhắc Đóng Phí, Chúc Mừng Sinh Nhật Tự Động |
| **Tác Nhân (Actor)** | Ban Quản Trị, Ban Thư Ký |
| **Tiền Điều Kiện (Pre-conditions)** | Người quản trị truy cập Trung Tâm Cấu Hình Vận Hành Tự Động. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Mở mục "Quy Tắc Tự Động Hóa (Automation Rules)" trên Cổng Quản Trị.<br>2. Cấu hình kịch bản nhắc hội phí thường niên: Tự động gửi email và thông báo đẩy trước 30 ngày, 15 ngày và 3 ngày trước khi hết hạn hội viên kèm mã VietQR gạch nợ tự động.<br>3. Cấu hình kịch bản Chúc mừng sinh nhật: Đúng 08:00 sáng ngày sinh nhật của từng hội viên, hệ thống tự động gửi thiệp chúc mừng điện tử mang dấu ấn CEO 1983 kèm thông báo chúc mừng trên bảng tin chung.<br>4. Cấu hình nhắc lịch họp và nhắc giờ tham gia sự kiện Gala tự động.<br>5. Nhấn nút "Lưu & Kích Hoạt Kịch Bản Vận Hành Tự Động". |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Quản trị viên có thể tùy biến mẫu nội dung thư và hình ảnh thiệp chúc mừng theo từng mùa sự kiện. |
| **Hậu Điều Kiện (Post-conditions)** | Bộ máy vận hành CLB hoạt động tự động 24/7, mang lại trải nghiệm ấm áp và chu đáo tối đa cho hội viên. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Thiết lập các chiến dịch thông điệp tự động, chăm sóc hội viên và marketing nội bộ* |

![Thiết lập các chiến dịch thông điệp tự động, chăm sóc hội viên và marketing nội bộ](images/evidence/crm1983_19_email_marketing.png)


### 5.87. Bảng Use Case UC-CRM-77: Sao Lưu Cơ Sở Dữ Liệu Tự Động & Đảm Bảo Tính Toàn Vẹn An Toàn Thông Tin Mạng

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-77** |
| **Phân Hệ / Nhóm** | Ban Quản Trị & Ban Chấp Hành |
| **Tên Chức Năng** | Sao Lưu Cơ Sở Dữ Liệu Tự Động & Đảm Bảo Tính Toàn Vẹn An Toàn Thông Tin Mạng |
| **Tác Nhân (Actor)** | Ban Quản Trị Hệ Thống |
| **Tiền Điều Kiện (Pre-conditions)** | Hệ thống đang hoạt động ổn định trên môi trường sản xuất. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Mở bảng điều khiển "Bảo Mật & Sao Lưu Dữ Liệu" trên Cổng Quản Trị.<br>2. Kiểm tra lịch sao lưu tự động định kỳ hàng ngày (Snapshot Database lúc 03:00 sáng).<br>3. Kiểm tra tính toàn vẹn của các bản sao lưu lưu trữ phân tán an toàn.<br>4. Thực hiện thử nghiệm tính năng "Tạo Bản Sao Lưu Tức Thì" trước khi tiến hành cập nhật phiên bản phần mềm lớn.<br>5. Xem nhật ký kiểm toán bảo mật (Security Audit Log) để phát hiện các truy cập bất thường.<br>6. Xác nhận hệ thống đạt tiêu chuẩn bảo mật dữ liệu cấp doanh nghiệp. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Trường hợp xảy ra sự cố phần cứng: Hệ thống hỗ trợ khôi phục dữ liệu nhanh (Disaster Recovery) với thời gian gián đoạn dưới 30 phút. |
| **Hậu Điều Kiện (Post-conditions)** | Cơ sở dữ liệu hội viên và dữ liệu tài chính của CLB được bảo vệ an toàn tuyệt đối. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Màn hình kiểm soát an toàn thông tin, sao lưu dữ liệu và nhật ký kiểm toán hệ thống của Ban Quản Trị* |

![Màn hình kiểm soát an toàn thông tin, sao lưu dữ liệu và nhật ký kiểm toán hệ thống của Ban Quản Trị](images/evidence/bqt_screen.png)


### 5.88. Bảng Use Case UC-CRM-78: Báo Cáo Tổng Kết Hoạt Động Toàn Khóa Phục Vụ Đại Hội Nhiệm Kỳ CLB Doanh Nhân CEO 1983

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-CRM-78** |
| **Phân Hệ / Nhóm** | Ban Quản Trị & Ban Chấp Hành |
| **Tên Chức Năng** | Báo Cáo Tổng Kết Hoạt Động Toàn Khóa Phục Vụ Đại Hội Nhiệm Kỳ CLB Doanh Nhân CEO 1983 |
| **Tác Nhân (Actor)** | Ban Thường Trực Ban Chấp Hành |
| **Tiền Điều Kiện (Pre-conditions)** | Kết thúc năm tài chính hoặc chuẩn bị tổ chức Đại hội nhiệm kỳ mới. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Mở phân hệ "Tổng Kết Nhiệm Kỳ & Báo Cáo Đại Hội".<br>2. Hệ thống tổng hợp tự động toàn bộ dữ liệu lịch sử hoạt động:<br>   - Tăng trưởng số lượng hội viên từ ngày thành lập đến nay<br>   - Tổng số sự kiện Gala, tọa đàm kinh tế và cuộc họp BCH đã tổ chức<br>   - Tổng doanh số giao thương nội bộ B2B đã tạo ra cho các doanh nghiệp thành viên<br>   - Tổng giá trị các chương trình an sinh xã hội, thiện nguyện đã thực hiện<br>   - Mức độ tham gia và gắn kết trung bình của hội viên.<br>3. Bấm "Kết Xuất Tập Báo Cáo Toàn Diện (Bản In Sang Trọng & Slide Trình Chiếu)".<br>4. Hồ sơ báo cáo được in ấn và gửi báo cáo Hội Doanh Nhân Trẻ Hà Nội (HanoiBA). |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Báo cáo có thể được đính kèm các phóng sự hình ảnh thực tế tự động từ kho tư liệu số của CLB. |
| **Hậu Điều Kiện (Post-conditions)** | Ban Chấp Hành sở hữu bộ báo cáo số liệu chuẩn xác, minh bạch, khẳng định sự lớn mạnh không ngừng của CLB Doanh Nhân CEO 1983. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Bảng tổng hợp chỉ số phát triển toàn diện phục vụ báo cáo Đại hội nhiệm kỳ CLB* |

![Bảng tổng hợp chỉ số phát triển toàn diện phục vụ báo cáo Đại hội nhiệm kỳ CLB](images/evidence/crm_02_dashboard_kpi.png)


### 5.89. Bảng Use Case UC-APP-01: Đăng Nhập Ứng Dụng Doanh Nhân CEO 1983 Bằng Email & Mật Khẩu Khởi Tạo

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-01** |
| **Phân Hệ / Nhóm** | Đăng Nhập & Bảo Mật Hội Viên |
| **Tên Chức Năng** | Đăng Nhập Ứng Dụng Doanh Nhân CEO 1983 Bằng Email & Mật Khẩu Khởi Tạo |
| **Tác Nhân (Actor)** | Hội viên chính thức (Đại diện: Phạm Văn Vũ - vupv090120@gmail.com) |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên đã được Ban Thành Viên phê duyệt và nhận được email cấp mật khẩu khởi tạo. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Hội viên mở Ứng dụng Doanh nhân CEO 1983 trên điện thoại thông minh hoặc máy tính.<br>2. Giao diện đăng nhập sang trọng hiển thị với nhận diện thương hiệu CLB Doanh Nhân CEO 1983.<br>3. Hội viên điền thông tin:<br>   - Tài khoản đăng nhập: vupv090120@gmail.com<br>   - Mật khẩu: 123456 (Mật khẩu khởi tạo được cấp trong email).<br>4. Nhấn nút "Đăng Nhập".<br>5. Hệ thống xác thực danh tính hợp lệ, nhận diện đúng vai trò Hội viên chính thức và chuyển tiếp vào màn hình chính của Ứng dụng. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu nhập sai mật khẩu: Hệ thống thông báo lỗi và cho phép thử lại hoặc bấm Quên mật khẩu. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên đăng nhập thành công vào không gian số độc quyền của CLB Doanh Nhân CEO 1983. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện đăng nhập Ứng dụng Doanh nhân CEO 1983 với tài khoản vupv090120@gmail.com* |

![Giao diện đăng nhập Ứng dụng Doanh nhân CEO 1983 với tài khoản vupv090120@gmail.com](images/evidence/live_11_app_login_filled_vu.png)


### 5.90. Bảng Use Case UC-APP-02: Bắt Buộc Đổi Mật Khẩu Lần Đầu Đăng Nhập Nhằm Bảo Vệ An Toàn Tài Khoản Doanh Nhân

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-02** |
| **Phân Hệ / Nhóm** | Đăng Nhập & Bảo Mật Hội Viên |
| **Tên Chức Năng** | Bắt Buộc Đổi Mật Khẩu Lần Đầu Đăng Nhập Nhằm Bảo Vệ An Toàn Tài Khoản Doanh Nhân |
| **Tác Nhân (Actor)** | Hội viên mới đăng nhập lần đầu |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên đăng nhập thành công bằng mật khẩu khởi tạo mặc định. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ngay sau khi đăng nhập thành công lần đầu, hệ thống hiển thị màn hình bắt buộc: "Thiết Lập Mật Khẩu Cá Nhân Mới".<br>2. Hội viên nhập mật khẩu hiện tại và nhập mật khẩu mới tự chọn (yêu cầu độ dài tối thiểu 6 ký tự, gồm chữ và số).<br>3. Nhập lại mật khẩu mới để xác nhận.<br>4. Nhấn "Cập Nhật Mật Khẩu Mới".<br>5. Hệ thống mã hóa bảo mật mật khẩu mới, hiển thị thông báo thành công và bắt đầu phiên làm việc an toàn. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu mật khẩu mới quá đơn giản: Hệ thống gợi ý tăng cường độ phức tạp để bảo vệ tài khoản. |
| **Hậu Điều Kiện (Post-conditions)** | Tài khoản hội viên được bảo vệ tuyệt đối bằng mật khẩu riêng tư của cá nhân doanh nhân. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Màn hình thiết lập và đổi mật khẩu bảo mật cá nhân trên Ứng dụng Hội viên* |

![Màn hình thiết lập và đổi mật khẩu bảo mật cá nhân trên Ứng dụng Hội viên](images/evidence/sub_47_app_settings_password_security.png)


### 5.91. Bảng Use Case UC-APP-03: Khôi Phục Mật Khẩu Quên Qua Mã Xác Thực Điện Tử Gửi Tự Động Đến Hòm Thư

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-03** |
| **Phân Hệ / Nhóm** | Đăng Nhập & Bảo Mật Hội Viên |
| **Tên Chức Năng** | Khôi Phục Mật Khẩu Quên Qua Mã Xác Thực Điện Tử Gửi Tự Động Đến Hòm Thư |
| **Tác Nhân (Actor)** | Hội viên quên mật khẩu |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên đang ở màn hình đăng nhập và không nhớ mật khẩu. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Bấm vào liên kết "Quên Mật Khẩu?" trên màn hình đăng nhập.<br>2. Nhập địa chỉ email đăng ký: vupv090120@gmail.com.<br>3. Bấm "Gửi Yêu Cầu Khôi Phục".<br>4. Hệ thống tạo mã liên kết bảo mật có thời hạn trong 15 phút và gửi thẳng về hòm thư của hội viên.<br>5. Hội viên mở email, nhấp vào liên kết an toàn để đặt lại mật khẩu mới.<br>6. Đăng nhập lại với mật khẩu vừa tạo. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu email không tồn tại trên hệ thống: Hệ thống thông báo nhắc nhở kiểm tra lại địa chỉ email. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên chủ động lấy lại quyền truy cập tài khoản nhanh chóng, không làm gián đoạn công việc. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện yêu cầu khôi phục mật khẩu tài khoản qua email xác thực* |

![Giao diện yêu cầu khôi phục mật khẩu tài khoản qua email xác thực](images/evidence/app_step_03_login_screen.png)


### 5.92. Bảng Use Case UC-APP-04: Cài Đặt Bảo Mật Cá Nhân & Tùy Biến Quyền Riêng Tư Các Kênh Liên Hệ Trên Danh Thiếp

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-04** |
| **Phân Hệ / Nhóm** | Đăng Nhập & Bảo Mật Hội Viên |
| **Tên Chức Năng** | Cài Đặt Bảo Mật Cá Nhân & Tùy Biến Quyền Riêng Tư Các Kênh Liên Hệ Trên Danh Thiếp |
| **Tác Nhân (Actor)** | Hội viên chính thức |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên đăng nhập ứng dụng, vào mục Cài đặt Tài khoản. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Hội viên mở mục "Cài Đặt & Quyền Riêng Tư".<br>2. Tùy chọn cấu hình hiển thị các thông tin liên lạc công khai trên Danh thiếp điện tử:<br>   - Bật/Tắt hiển thị Số điện thoại cá nhân (Chỉ hiển thị cho Hội viên trong CLB hoặc Công khai)<br>   - Bật/Tắt hiển thị Email doanh nghiệp<br>   - Tùy chỉnh hiển thị liên kết Zalo, Facebook, LinkedIn, Bản đồ định vị văn phòng<br>3. Bật tính năng nhận thông báo bảo mật khi có đăng nhập từ thiết bị lạ.<br>4. Nhấn "Lưu Cài Đặt". |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Hội viên có thể khôi phục về cài đặt mặc định bất kỳ lúc nào. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên hoàn toàn làm chủ mức độ riêng tư của thông tin cá nhân trên môi trường số. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Tùy biến quyền riêng tư và bảo mật thông tin liên lạc trên danh thiếp điện tử* |

![Tùy biến quyền riêng tư và bảo mật thông tin liên lạc trên danh thiếp điện tử](images/evidence/app_card_privacy_settings.png)


### 5.93. Bảng Use Case UC-APP-05: Khám Phá Trang Chủ Ứng Dụng Doanh Nhân Với Banner Nhận Diện CEO 1983

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-05** |
| **Phân Hệ / Nhóm** | Trang Chủ & Khoảnh Khắc Doanh Nhân |
| **Tên Chức Năng** | Khám Phá Trang Chủ Ứng Dụng Doanh Nhân Với Banner Nhận Diện CEO 1983 |
| **Tác Nhân (Actor)** | Hội viên chính thức |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên mở Ứng dụng Doanh nhân CEO 1983. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Màn hình Trang Chủ (Home Dashboard) hiển thị sang trọng với tông màu thương hiệu Xanh Hoàng Gia và Vàng Kim.<br>2. Lời chào cá nhân hóa: "Xin chào, Doanh nhân Phạm Văn Vũ — Chúc một ngày kết nối kinh doanh thành công!".<br>3. Huy hiệu số định danh: CEO-83007 • Hội viên Chính thức • Ban Thành Viên.<br>4. Thanh lướt Banner Carousel hiển thị các chương trình trọng điểm đang diễn ra của CLB Doanh Nhân CEO 1983 và Hội HanoiBA.<br>5. Xem các tiện ích truy cập nhanh: Danh bạ, Sự kiện, Danh thiếp, Gian hàng B2B, Hộp thư. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu có thông báo khẩn từ Chủ tịch CLB: Thanh thông báo nổi bật sẽ chạy chữ trên đầu màn hình. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên được truyền cảm hứng gắn kết và dễ dàng điều hướng đến mọi tính năng cần thiết. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Màn hình Trang chủ Ứng dụng Doanh nhân CEO 1983 giao diện máy tính* |

![Màn hình Trang chủ Ứng dụng Doanh nhân CEO 1983 giao diện máy tính](images/evidence/app_02_home_dashboard.png)


### 5.94. Bảng Use Case UC-APP-06: Trải Nghiệm Trang Chủ Giao Diện Điện Thoại Thông Minh (Mobile App View)

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-06** |
| **Phân Hệ / Nhóm** | Trang Chủ & Khoảnh Khắc Doanh Nhân |
| **Tên Chức Năng** | Trải Nghiệm Trang Chủ Giao Diện Điện Thoại Thông Minh (Mobile App View) |
| **Tác Nhân (Actor)** | Hội viên sử dụng điện thoại di động |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên truy cập ứng dụng trên điện thoại thông minh (iPhone / Android). |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ứng dụng tự động điều chỉnh bố cục sang định dạng Mobile mượt mà, tối ưu thao tác ngón cái.<br>2. Các khối thông tin sắp xếp trực quan:<br>   - Thẻ danh thiếp thu nhỏ với mã QR quét nhanh<br>   - Hàng nút chức năng nhanh (Quick Actions): Quét QR, Danh bạ, Đăng bán B2B, Hẹn gặp 1-1<br>   - Khối sự kiện sắp diễn ra kèm đồng hồ đếm ngược<br>   - Bảng tin khoảnh khắc giao thương mới nhất.<br>3. Thanh điều hướng dưới đáy (Bottom Navigation Bar) cho phép chuyển đổi tức thì giữa các phân hệ. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Hỗ trợ cài đặt biểu tượng Ứng dụng trực tiếp ra màn hình chính điện thoại (PWA / Add to Home Screen) mà không cần qua chợ ứng dụng phức tạp. |
| **Hậu Điều Kiện (Post-conditions)** | Trải nghiệm mượt mà như một ứng dụng di động cao cấp, sử dụng mọi lúc mọi nơi. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện Trang chủ Ứng dụng Doanh nhân CEO 1983 trên điện thoại thông minh* |

![Giao diện Trang chủ Ứng dụng Doanh nhân CEO 1983 trên điện thoại thông minh](images/evidence/app1983_02_home_feed.png)


### 5.95. Bảng Use Case UC-APP-07: Theo Dõi Bảng Tin Khoảnh Khắc Doanh Nhân (Moments), Thả Tim & Bình Luận Tương Tác

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-07** |
| **Phân Hệ / Nhóm** | Trang Chủ & Khoảnh Khắc Doanh Nhân |
| **Tên Chức Năng** | Theo Dõi Bảng Tin Khoảnh Khắc Doanh Nhân (Moments), Thả Tim & Bình Luận Tương Tác |
| **Tác Nhân (Actor)** | Hội viên trong CLB |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên mở mục Khoảnh Khắc (Moments) trên ứng dụng. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Hội viên cuộn xem dòng thời gian hoạt động của cộng đồng:<br>   - Các bài đăng chia sẻ niềm vui ký kết hợp đồng của các doanh nghiệp thành viên<br>   - Hình ảnh giao lưu sinh hoạt cuối tuần của các Ban chuyên môn<br>   - Lời chúc mừng sinh nhật tự động gửi tới các hội viên có ngày sinh trong tháng.<br>2. Hội viên nhấn nút "Thả Tim" ủng hộ bài đăng.<br>3. Để lại bình luận chúc mừng, chia sẻ niềm tự hào đồng hành cùng các bạn bè cùng niên khóa 1983.<br>4. Hội viên có thể đăng tải khoảnh khắc hoạt động của công ty mình để lan tỏa năng lượng tích cực. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Các bài đăng vi phạm văn hóa ứng xử sẽ được Ban Kiểm Tra gỡ bỏ theo quy chế. |
| **Hậu Điều Kiện (Post-conditions)** | Tình cảm bằng hữu, tinh thần tương thân tương ái giữa các doanh nhân 1983 ngày càng gắn kết keo sơn. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Bảng tin hoạt động và khoảnh khắc kết nối giao thương giữa các hội viên* |

![Bảng tin hoạt động và khoảnh khắc kết nối giao thương giữa các hội viên](images/evidence/app_step_22_news_screen.png)


### 5.96. Bảng Use Case UC-APP-08: Chiêm Ngưỡng Thẻ Hội Viên Điện Tử 3D VIP CEO 1983 Với Hiệu Ứng Ánh Kim Sang Trọng

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-08** |
| **Phân Hệ / Nhóm** | Thẻ VIP 3D NFC & Danh Thiếp |
| **Tên Chức Năng** | Chiêm Ngưỡng Thẻ Hội Viên Điện Tử 3D VIP CEO 1983 Với Hiệu Ứng Ánh Kim Sang Trọng |
| **Tác Nhân (Actor)** | Hội viên chính thức (Doanh nhân Phạm Văn Vũ) |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên vào mục Thẻ Doanh Nhân trên Ứng dụng. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ứng dụng hiển thị mô hình Thẻ Doanh Nhân Điện Tử 3D tương tác sống động:<br>   - Tông màu Đen Nhám & Viền Vàng Ánh Kim sang trọng<br>   - Khắc nổi Logo CLB Doanh Nhân CEO 1983 và Huy hiệu HanoiBA<br>   - Họ và tên: PHẠM VĂN VŨ<br>   - Chức danh: TỔNG GIÁM ĐỐC<br>   - Doanh nghiệp: CÔNG TY CỔ PHẦN CÔNG NGHỆ VIO CONNECT<br>   - Mã định danh hội viên chính thức: CEO-83007.<br>2. Hội viên dùng ngón tay vuốt nhẹ để xoay thẻ 360 độ trong không gian 3D với hiệu ứng phản chiếu ánh sáng chân thực. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu thiết bị không hỗ trợ đồ họa 3D nâng cao: Hệ thống tự động chuyển sang chế độ 2D phẳng mượt mà. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên tự hào về tấm thẻ định danh đẳng cấp, khẳng định vị thế doanh nhân trong cộng đồng. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Thẻ Hội viên Doanh nhân 3D VIP CEO 1983 với hiệu ứng ánh kim sang trọng* |

![Thẻ Hội viên Doanh nhân 3D VIP CEO 1983 với hiệu ứng ánh kim sang trọng](images/evidence/app_identity_card_vip.png)


### 5.97. Bảng Use Case UC-APP-09: Lật Mặt Sau Thẻ Để Hiển Thị Mã QR Động Cá Nhân Hóa Dùng Kết Nối Tức Thì

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-09** |
| **Phân Hệ / Nhóm** | Thẻ VIP 3D NFC & Danh Thiếp |
| **Tên Chức Năng** | Lật Mặt Sau Thẻ Để Hiển Thị Mã QR Động Cá Nhân Hóa Dùng Kết Nối Tức Thì |
| **Tác Nhân (Actor)** | Hội viên & Đối tác gặp mặt trực tiếp |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên đang mở Thẻ Doanh nhân trên ứng dụng và muốn chia sẻ thông tin cho đối tác. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Hội viên chạm vào thẻ để kích hoạt hiệu ứng lật mặt sau (Flip Card).<br>2. Mặt sau thẻ hiển thị Mã QR Động cá nhân hóa duy nhất kết hợp Logo CEO 1983 ở trung tâm.<br>3. Đối tác chỉ cần mở camera điện thoại quét mã QR.<br>4. Trình duyệt của đối tác lập tức mở ra Trang Danh thiếp điện tử công khai của Phạm Văn Vũ với đầy đủ thông tin doanh nghiệp và nút lưu danh bạ 1 chạm.<br>5. Thao tác hoàn tất trong 2 giây mà không cần mang theo cọc danh thiếp giấy truyền thống. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Mã QR có thể được lưu dạng ảnh về album để in lên backdrop hoặc gửi qua tin nhắn Zalo. |
| **Hậu Điều Kiện (Post-conditions)** | Cách thức kết nối giao tiếp kinh doanh văn minh, hiện đại, bảo vệ môi trường. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Mặt sau Thẻ Doanh nhân hiển thị mã QR động cá nhân hóa dùng chia sẻ thông tin* |

![Mặt sau Thẻ Doanh nhân hiển thị mã QR động cá nhân hóa dùng chia sẻ thông tin](images/evidence/app_visit_card_back.png)


### 5.98. Bảng Use Case UC-APP-10: Kích Hoạt Chạm Thẻ Thông Minh Vật Lý NFC (NFC Tap) Để Chia Sẻ Danh Thiếp Không Chạm

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-10** |
| **Phân Hệ / Nhóm** | Thẻ VIP 3D NFC & Danh Thiếp |
| **Tên Chức Năng** | Kích Hoạt Chạm Thẻ Thông Minh Vật Lý NFC (NFC Tap) Để Chia Sẻ Danh Thiếp Không Chạm |
| **Tác Nhân (Actor)** | Hội viên sở hữu Thẻ VIP vật lý đính chip NFC |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên cầm thẻ cứng VIP NFC và chạm vào lưng điện thoại của đối tác. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Hội viên đưa thẻ VIP vật lý chạm nhẹ vào vùng cảm biến NFC phía sau điện thoại đối tác.<br>2. Không cần cài đặt bất kỳ phần mềm nào, điện thoại đối tác tự động bật thông báo nhận diện liên kết.<br>3. Đối tác nhấp vào thông báo, trang Danh thiếp điện tử của Doanh nhân Phạm Văn Vũ mở ra ngay lập tức.<br>4. Đối tác bấm lưu danh bạ hoặc gửi lời mời hợp tác kinh doanh. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Đối với điện thoại không có NFC: Đối tác quét mã QR ở mặt sau thẻ vật lý với hiệu quả tương đương. |
| **Hậu Điều Kiện (Post-conditions)** | Tạo ấn tượng công nghệ vượt trội và sự chuyên nghiệp đỉnh cao trong mắt đối tác kinh doanh. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Tính năng chia sẻ danh thiếp không chạm bằng công nghệ thẻ thông minh VIP NFC* |

![Tính năng chia sẻ danh thiếp không chạm bằng công nghệ thẻ thông minh VIP NFC](images/evidence/app_step_05_vip_card_nfc.png)


### 5.99. Bảng Use Case UC-APP-11: Tra Cứu Danh Bạ Hội Viên Toàn CLB Theo Chuyên Ban, Lĩnh Vực Kinh Doanh & Tên Công Ty

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-11** |
| **Phân Hệ / Nhóm** | Danh Bạ & Kết Nối Hẹn Gặp |
| **Tên Chức Năng** | Tra Cứu Danh Bạ Hội Viên Toàn CLB Theo Chuyên Ban, Lĩnh Vực Kinh Doanh & Tên Công Ty |
| **Tác Nhân (Actor)** | Hội viên cần tìm đối tác trong CLB |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên đăng nhập ứng dụng, mở phân hệ Danh Bạ Hội Viên. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Màn hình danh bạ hiển thị đầy đủ danh sách các doanh nhân trong đại gia đình CEO 1983.<br>2. Sử dụng thanh tìm kiếm thông minh: Gõ tên công ty, ngành nghề hoặc tên hội viên.<br>3. Lọc theo chuyên ban sinh hoạt để tìm những bạn bè cùng ban.<br>4. Mỗi thẻ hội viên hiển thị: Ảnh chân dung, Họ tên, Tên công ty, Chức vụ và huy hiệu xác nhận chính thức.<br>5. Nhấp vào thẻ để xem toàn bộ thông tin chi tiết. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu danh bạ không có người phù hợp: Ứng dụng hiển thị gợi ý đăng nhu cầu tìm kiếm lên mục Cơ Hội Cung - Cầu. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên dễ dàng tìm thấy đồng đội cùng chí hướng trong mạng lưới doanh nhân tin cậy. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Danh bạ Hội viên CLB CEO 1983 với công cụ tìm kiếm và lọc ngành nghề thông minh* |

![Danh bạ Hội viên CLB CEO 1983 với công cụ tìm kiếm và lọc ngành nghề thông minh](images/evidence/app_step_07_members_directory.png)


### 5.100. Bảng Use Case UC-APP-12: Xem Hồ Sơ Chi Tiết Của Hội Viên Khác & Khám Phá Năng Lực Cung Ứng Sản Phẩm

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-12** |
| **Phân Hệ / Nhóm** | Danh Bạ & Kết Nối Hẹn Gặp |
| **Tên Chức Năng** | Xem Hồ Sơ Chi Tiết Của Hội Viên Khác & Khám Phá Năng Lực Cung Ứng Sản Phẩm |
| **Tác Nhân (Actor)** | Hội viên đang tìm hiểu đối tác tiềm năng |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên bấm vào một hồ sơ trên danh bạ. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Màn hình hiển thị Hồ Sơ Chi Tiết của hội viên được chọn:<br>   - Ảnh đại diện, ảnh bìa trang trọng<br>   - Chức vụ lãnh đạo và ban chuyên môn phụ trách<br>   - Doanh nghiệp, Mã số thuế, Ngành nghề sản xuất kinh doanh<br>   - Giới thiệu năng lực cốt lõi và các giải thưởng đạt được<br>   - Danh sách các sản phẩm/dịch vụ mà doanh nghiệp đó đang cung cấp trên Gian hàng B2B<br>   - Các cơ hội kinh doanh mà đối tác đang cần tìm kiếm.<br>2. Hội viên có thể bấm các nút kết nối: Nhắn tin, Gọi điện hoặc Đặt lịch hẹn gặp 1-1. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Hội viên có thể lưu hồ sơ đối tác vào danh sách "Đối Tác Quan Tâm" để theo dõi thường xuyên. |
| **Hậu Điều Kiện (Post-conditions)** | Hiểu sâu về năng lực của bạn bè để sẵn sàng ưu tiên sử dụng sản phẩm dịch vụ của nhau. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện xem chi tiết hồ sơ năng lực và sản phẩm của hội viên trong cộng đồng* |

![Giao diện xem chi tiết hồ sơ năng lực và sản phẩm của hội viên trong cộng đồng](images/evidence/app_step_08_member_profile_modal.png)


### 5.101. Bảng Use Case UC-APP-13: Gửi Lời Mời Kết Nối Doanh Nhân & Đặt Lịch Hẹn Gặp Kinh Doanh 1-on-1 (Business Matching)

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-13** |
| **Phân Hệ / Nhóm** | Danh Bạ & Kết Nối Hẹn Gặp |
| **Tên Chức Năng** | Gửi Lời Mời Kết Nối Doanh Nhân & Đặt Lịch Hẹn Gặp Kinh Doanh 1-on-1 (Business Matching) |
| **Tác Nhân (Actor)** | Hội viên khởi xướng cuộc hẹn (Doanh nhân Phạm Văn Vũ) |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên muốn gặp mặt trao đổi cơ hội hợp tác với một hội viên khác. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Bấm nút "Đặt Lịch Hẹn Gặp 1-1" trên hồ sơ của đối tác.<br>2. Chọn hình thức gặp: Gặp trực tiếp tại Văn phòng / Quán cà phê hoặc Gặp trực tuyến.<br>3. Chọn ngày, giờ đề xuất và nhập chủ đề trao đổi (ví dụ: "Bàn về cơ hội hợp tác triển khai phần mềm cho chuỗi cửa hàng").<br>4. Nhấn "Gửi Lời Mời Hẹn Gặp".<br>5. Đối tác nhận được thông báo đẩy trên điện thoại và có thể bấm "Đồng Ý", "Đổi Giờ" hoặc "Từ Chối Kèm Lời Nhắn".<br>6. Khi đối tác đồng ý: Cuộc hẹn tự động được ghi vào Lịch Công Tác của cả hai doanh nhân. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu đối tác bận: Hai bên có thể trao đổi nhắn tin để thống nhất lại khung giờ phù hợp. |
| **Hậu Điều Kiện (Post-conditions)** | Quy trình kết nối kinh doanh bài bản, hiệu quả, hiện thực hóa tôn chỉ tương trợ thiết thực. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện đặt lịch hẹn gặp kinh doanh 1-on-1 giữa hai doanh nhân trong CLB* |

![Giao diện đặt lịch hẹn gặp kinh doanh 1-on-1 giữa hai doanh nhân trong CLB](images/evidence/live_29_app_opportunities_feed_1on1.png)


### 5.102. Bảng Use Case UC-APP-14: Truy Cập Hộp Thư Tin Nhắn Nội Bộ & Quản Lý Các Cuộc Trò Chuyện Riêng Tư

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-14** |
| **Phân Hệ / Nhóm** | Nhắn Tin Nội Bộ & Trao Đổi |
| **Tên Chức Năng** | Truy Cập Hộp Thư Tin Nhắn Nội Bộ & Quản Lý Các Cuộc Trò Chuyện Riêng Tư |
| **Tác Nhân (Actor)** | Hội viên sử dụng ứng dụng |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên mở mục Tin Nhắn trên thanh điều hướng. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Hộp thư nội bộ (Inbox) hiển thị danh sách các cuộc hội thoại:<br>   - Tin nhắn riêng với các hội viên khác<br>   - Kênh trao đổi trực tiếp với Ban Thư Ký CLB<br>   - Nhóm trao đổi chuyên ban sinh hoạt.<br>2. Hiển thị trạng thái tin nhắn mới chưa đọc, thời gian nhắn tin gần nhất và ảnh đại diện đối phương.<br>3. Hội viên có thể tìm kiếm nhanh cuộc trò chuyện theo tên người nhắn. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Hỗ trợ ghim các cuộc trò chuyện quan trọng lên đầu danh sách. |
| **Hậu Điều Kiện (Post-conditions)** | Kênh liên lạc nội bộ an toàn, khép kín, bảo mật dữ liệu kinh doanh. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Hộp thư tin nhắn nội bộ kết nối trực tiếp giữa các thành viên CLB CEO 1983* |

![Hộp thư tin nhắn nội bộ kết nối trực tiếp giữa các thành viên CLB CEO 1983](images/evidence/app_step_09_messages_inbox.png)


### 5.103. Bảng Use Case UC-APP-15: Nhắn Tin Trò Chuyện Thời Gian Thực 1-on-1, Gửi Hình Ảnh & Tài Liệu Kinh Doanh

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-15** |
| **Phân Hệ / Nhóm** | Nhắn Tin Nội Bộ & Trao Đổi |
| **Tên Chức Năng** | Nhắn Tin Trò Chuyện Thời Gian Thực 1-on-1, Gửi Hình Ảnh & Tài Liệu Kinh Doanh |
| **Tác Nhân (Actor)** | Hai hội viên đang trao đổi công việc |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên mở cửa sổ chat với một thành viên khác. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Giao diện khung chat thời gian thực hiển thị tốc độ cao.<br>2. Hội viên gõ nội dung tin nhắn và nhấn gửi.<br>3. Đối phương nhận được tin nhắn tức thì cùng thông báo đẩy trên điện thoại.<br>4. Hội viên có thể gửi tệp tài liệu hợp đồng (PDF/Word), ảnh sản phẩm mẫu, danh thiếp hoặc định vị vị trí cuộc hẹn.<br>5. Hiển thị trạng thái "Đã gửi" và "Đã xem" rõ ràng. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Hỗ trợ tính năng thu hồi tin nhắn trong vòng 15 phút nếu gửi nhầm thông tin. |
| **Hậu Điều Kiện (Post-conditions)** | Việc trao đổi thông tin kinh doanh diễn ra tức thì, thuận tiện, không cần phụ thuộc mạng xã hội ngoài. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Khung trò chuyện thời gian thực 1-on-1 trao đổi tài liệu và hình ảnh kinh doanh* |

![Khung trò chuyện thời gian thực 1-on-1 trao đổi tài liệu và hình ảnh kinh doanh](images/evidence/app_step_10_chat_conversation.png)


### 5.104. Bảng Use Case UC-APP-16: Gửi Lời Nhắn Trực Tiếp Đến Ban Thư Ký CLB Để Được Hỗ Trợ Mọi Thủ Tục Hiệp Hội

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-16** |
| **Phân Hệ / Nhóm** | Nhắn Tin Nội Bộ & Trao Đổi |
| **Tên Chức Năng** | Gửi Lời Nhắn Trực Tiếp Đến Ban Thư Ký CLB Để Được Hỗ Trợ Mọi Thủ Tục Hiệp Hội |
| **Tác Nhân (Actor)** | Hội viên cần hỗ trợ |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên có vướng mắc về hội phí, thủ tục cấp thẻ hoặc đăng ký sự kiện. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Trong danh bạ hoặc hộp thư, bấm chọn kênh "Ban Thư Ký CEO 1983".<br>2. Nhập nội dung cần hỗ trợ (ví dụ: "Đề nghị cấp lại thẻ cứng NFC do bị thất lạc").<br>3. Nhấn gửi.<br>4. Tin nhắn được chuyển ngay đến bàn làm việc của Cán bộ Ban Thư Ký trực ban.<br>5. Ban Thư Ký phản hồi hướng dẫn xử lý thủ tục chu đáo, tận tâm. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Ngoài giờ hành chính: Hệ thống phản hồi tự động ghi nhận và hẹn giờ xử lý vào đầu giờ làm việc tiếp theo. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên luôn được đồng hành, chăm sóc chu đáo từ bộ máy thư ký chuyên nghiệp. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Kênh liên hệ trực tiếp hỗ trợ thủ tục hội viên với Ban Thư Ký CLB CEO 1983* |

![Kênh liên hệ trực tiếp hỗ trợ thủ tục hội viên với Ban Thư Ký CLB CEO 1983](images/evidence/app1983_15_messages_secretary.png)


### 5.105. Bảng Use Case UC-APP-17: Khám Phá Danh Sách Sự Kiện, Lịch Sinh Hoạt & Diễn Đàn Doanh Nhân Sắp Diễn Ra

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-17** |
| **Phân Hệ / Nhóm** | Sự Kiện & Vé Điện Tử |
| **Tên Chức Năng** | Khám Phá Danh Sách Sự Kiện, Lịch Sinh Hoạt & Diễn Đàn Doanh Nhân Sắp Diễn Ra |
| **Tác Nhân (Actor)** | Hội viên CLB |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên mở phân hệ Sự Kiện trên Ứng dụng. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Màn hình hiển thị danh sách các sự kiện sắp diễn ra của CLB Doanh Nhân CEO 1983:<br>   - Tên sự kiện: "Gala Thường Niên & Diễn Đàn Kinh Tế 1983", "Giải Golf Hữu Nghị 1983", v.v.<br>   - Ảnh bìa sự kiện ấn tượng<br>   - Thời gian, địa điểm tổ chức<br>   - Trạng thái đăng ký của hội viên (Chưa đăng ký / Đã có vé mời).<br>2. Hội viên có thể lọc xem các sự kiện quá khứ để xem lại phóng sự hình ảnh kỷ niệm. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Bấm nút "Thêm vào lịch điện thoại" để hệ thống tự động đồng bộ sự kiện vào ứng dụng Calendar của điện thoại. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên không bao giờ bỏ lỡ các hoạt động sinh hoạt quan trọng của tổ chức. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Danh sách sự kiện, diễn đàn kinh tế và lịch sinh hoạt định kỳ trên Ứng dụng* |

![Danh sách sự kiện, diễn đàn kinh tế và lịch sinh hoạt định kỳ trên Ứng dụng](images/evidence/app_step_11_events_list.png)


### 5.106. Bảng Use Case UC-APP-18: Xem Chi Tiết Sự Kiện, Lịch Trình Khung Giờ (Agenda), Danh Sách Diễn Giả & Vị Trí Ghế

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-18** |
| **Phân Hệ / Nhóm** | Sự Kiện & Vé Điện Tử |
| **Tên Chức Năng** | Xem Chi Tiết Sự Kiện, Lịch Trình Khung Giờ (Agenda), Danh Sách Diễn Giả & Vị Trí Ghế |
| **Tác Nhân (Actor)** | Hội viên quan tâm sự kiện |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên bấm vào một sự kiện cụ thể trên danh sách. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Màn hình chi tiết sự kiện mở ra với các tab thông tin phong phú:<br>   - Thông điệp chủ đề chương trình<br>   - Lịch trình nghị sự (Agenda): Giờ đón khách, Khai mạc, Tọa đàm kinh tế, Tiệc Gala, Biểu diễn nghệ thuật, Bốc thăm may mắn<br>   - Danh sách các Diễn giả chuyên gia hàng đầu và Ban Lãnh đạo tham dự<br>   - Bản đồ hướng dẫn đường đi đến địa điểm tổ chức.<br>2. Nếu hội viên đã đăng ký: Hiển thị ngay thông tin phân bổ Vị trí Bàn và Số ghế danh dự. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Hội viên có thể bấm chia sẻ liên kết sự kiện cho bạn bè doanh nhân cùng tham dự. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên nắm rõ toàn bộ nội dung chương trình để chuẩn bị tham dự hiệu quả nhất. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Màn hình xem chi tiết lịch trình nghị sự, diễn giả và nội dung chương trình sự kiện* |

![Màn hình xem chi tiết lịch trình nghị sự, diễn giả và nội dung chương trình sự kiện](images/evidence/sub_30_app_event_detail_modal.png)


### 5.107. Bảng Use Case UC-APP-19: Đăng Ký Vé Mời Miễn Phí Dành Riêng Cho Hội Viên Chính Thức (Zero-Click Booking)

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-19** |
| **Phân Hệ / Nhóm** | Sự Kiện & Vé Điện Tử |
| **Tên Chức Năng** | Đăng Ký Vé Mời Miễn Phí Dành Riêng Cho Hội Viên Chính Thức (Zero-Click Booking) |
| **Tác Nhân (Actor)** | Hội viên chính thức đã hoàn tất hội phí (Doanh nhân Phạm Văn Vũ) |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên chưa đăng ký vé sự kiện; hội phí thường niên đã được xác nhận hoàn thành. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Tại trang chi tiết sự kiện, nút hành động hiển thị: "Nhận Vé Mời Miễn Phí (Đặc Quyền Hội Viên)".<br>2. Hội viên bấm vào nút nhận vé.<br>3. Hệ thống kiểm tra hợp lệ: Xác nhận đúng trạng thái hội viên chính thức, tự động gán vị trí ghế ngồi danh dự tại Bàn VIP.<br>4. Màn hình chúc mừng hiện lên, đồng thời Vé Mời Điện Tử (E-Ticket) xuất hiện ngay trong mục "Vé Của Tôi".<br>5. Quy trình hoàn tất trong 1 giây mà không phát sinh bất kỳ khoản phí nào. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu hội viên còn nợ phí thường niên: Hệ thống hướng dẫn đóng phí nhanh qua VietQR để mở khóa vé miễn phí. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên sở hữu vé mời tham dự sự kiện danh giá một cách tự hào và thuận tiện. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Thao tác nhận vé mời sự kiện miễn phí 1 chạm độc quyền dành cho Hội viên chính thức* |

![Thao tác nhận vé mời sự kiện miễn phí 1 chạm độc quyền dành cho Hội viên chính thức](images/evidence/app_step_12_event_detail_modal.png)


### 5.108. Bảng Use Case UC-APP-20: Mở Vé Điện Tử (E-Ticket) Kèm Mã QR Điểm Danh & Vị Trí Ghế Để Xuất Trình Tại Cổng Sự Kiện

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-20** |
| **Phân Hệ / Nhóm** | Sự Kiện & Vé Điện Tử |
| **Tên Chức Năng** | Mở Vé Điện Tử (E-Ticket) Kèm Mã QR Điểm Danh & Vị Trí Ghế Để Xuất Trình Tại Cổng Sự Kiện |
| **Tác Nhân (Actor)** | Hội viên có mặt tại cửa sự kiện |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên đã có vé mời sự kiện và đến địa điểm tổ chức. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Hội viên mở mục "Vé Của Tôi" trên Ứng dụng Doanh nhân.<br>2. Vé Điện Tử hiển thị sang trọng với nhận diện sự kiện Gala CEO 1983:<br>   - Mã QR Code bảo mật chống giả mạo<br>   - Họ tên: DOANH NHÂN PHẠM VĂN VŨ<br>   - Đơn vị: CÔNG TY CỔ PHẦN CÔNG NGHỆ VIO CONNECT<br>   - Vị trí danh dự: BÀN VIP 01 — GHẾ SỐ 03<br>3. Hội viên đưa màn hình mã QR trước máy quét của bàn lễ tân an ninh cổng.<br>4. Máy quét nhận diện tức thì, màn hình xanh bật sáng chào đón đại biểu. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Vé có thể lưu offline trong ứng dụng, bảo đảm mở được ngay cả khi không có sóng mạng internet tại hội trường. |
| **Hậu Điều Kiện (Post-conditions)** | Quy trình vào cửa diễn ra thần tốc, trang trọng và văn minh bậc nhất. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Vé mời điện tử E-Ticket hiển thị mã QR điểm danh và số ghế danh dự tại khán phòng* |

![Vé mời điện tử E-Ticket hiển thị mã QR điểm danh và số ghế danh dự tại khán phòng](images/evidence/app_step_13_ticket_qr_pass.png)


### 5.109. Bảng Use Case UC-APP-21: Nhận Thông Báo & Tham Gia Bỏ Phiếu Biểu Quyết / Bầu Cử Trực Tuyến Trên Điện Thoại

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-21** |
| **Phân Hệ / Nhóm** | Biểu Quyết & Bốc Thăm Hội Viên |
| **Tên Chức Năng** | Nhận Thông Báo & Tham Gia Bỏ Phiếu Biểu Quyết / Bầu Cử Trực Tuyến Trên Điện Thoại |
| **Tác Nhân (Actor)** | Hội viên chính thức |
| **Tiền Điều Kiện (Pre-conditions)** | Ban Chấp Hành mở một phiên biểu quyết điện tử tại UC-CRM-34. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Điện thoại của hội viên nhận Thông Báo Đẩy: "Kính mời Doanh nhân tham gia biểu quyết: Thông qua Quy chế hoạt động nhiệm kỳ mới".<br>2. Bấm vào thông báo, màn hình biểu quyết mở ra với đầy đủ nội dung tờ trình và các phương án lựa chọn.<br>3. Hội viên đọc kỹ nội dung, tích chọn phương án (ví dụ: "Tán thành").<br>4. Nhấn nút "Xác Nhận Bỏ Phiếu".<br>5. Hệ thống mã hóa lá phiếu, ghi nhận kết quả vào cơ sở dữ liệu và hiển thị thông báo "Bỏ phiếu thành công". |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Mỗi hội viên chỉ được bỏ phiếu một lần duy nhất, hệ thống tự động khóa quyền sau khi xác nhận. |
| **Hậu Điều Kiện (Post-conditions)** | Ý kiến dân chủ của hội viên được ghi nhận chuẩn xác vào kết quả chung của tổ chức. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Màn hình tham gia bỏ phiếu biểu quyết điện tử trực tiếp trên ứng dụng điện thoại* |

![Màn hình tham gia bỏ phiếu biểu quyết điện tử trực tiếp trên ứng dụng điện thoại](images/evidence/app_step_14_voting_luckydraw.png)


### 5.110. Bảng Use Case UC-APP-22: Xem Kết Quả Biểu Quyết Công Khai, Minh Bạch Sau Khi Phiên Biểu Quyết Khóa Sổ

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-22** |
| **Phân Hệ / Nhóm** | Biểu Quyết & Bốc Thăm Hội Viên |
| **Tên Chức Năng** | Xem Kết Quả Biểu Quyết Công Khai, Minh Bạch Sau Khi Phiên Biểu Quyết Khóa Sổ |
| **Tác Nhân (Actor)** | Hội viên quan tâm kết quả |
| **Tiền Điều Kiện (Pre-conditions)** | Phiên biểu quyết đã kết thúc và Ban Kiểm Phiếu đã công bố kết quả. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Hội viên mở lại mục Biểu Quyết trên ứng dụng.<br>2. Màn hình hiển thị kết quả chung cuộc:<br>   - Tổng số cử tri tham gia<br>   - Biểu đồ phần trăm tán thành / không tán thành<br>   - Kết luận tờ trình đã được thông qua chính thức.<br>3. Hội viên có thể xem Biên bản kiểm phiếu có chữ ký điện tử của Trưởng Ban Kiểm Phiếu. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Đối với các cuộc biểu quyết kín: Danh sách chi tiết ai bỏ phương án nào sẽ được ẩn hoàn toàn để bảo đảm tính riêng tư. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên tin tưởng tuyệt đối vào sự dân chủ, minh bạch của Ban Điều Hành CLB. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện xem kết quả biểu quyết công khai dạng biểu đồ trực quan trên di động* |

![Giao diện xem kết quả biểu quyết công khai dạng biểu đồ trực quan trên di động](images/evidence/app_voting_mobile_view.png)


### 5.111. Bảng Use Case UC-APP-23: Tự Động Nhận Mã Bốc Thăm May Mắn (Lucky Number) Sau Khi Điểm Danh Tại Sự Kiện Gala

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-23** |
| **Phân Hệ / Nhóm** | Biểu Quyết & Bốc Thăm Hội Viên |
| **Tên Chức Năng** | Tự Động Nhận Mã Bốc Thăm May Mắn (Lucky Number) Sau Khi Điểm Danh Tại Sự Kiện Gala |
| **Tác Nhân (Actor)** | Hội viên có mặt tại sự kiện |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên vừa hoàn tất quét mã QR điểm danh vào cửa sự kiện Gala. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Ngay khi lễ tân quét mã QR vé thành công tại cổng đón tiếp, máy chủ tự động phát hành 01 Con Số May Mắn định danh.<br>2. Trên màn hình ứng dụng của hội viên hiển thị hộp quà mở ra rực rỡ:<br>   - "CHÚC MỪNG BẠN ĐÃ NHẬN ĐƯỢC CON SỐ MAY MẮN: #83007"<br>   - Kèm thông điệp chúc bạn may mắn trúng giải thưởng lớn trong đêm Gala!<br>3. Mã may mắn được ghim nổi bật trên đầu trang chủ sự kiện để hội viên tiện theo dõi. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu hội viên vắng mặt không check-in tại sự kiện: Mã may mắn sẽ không được kích hoạt để bảo đảm công bằng cho những người có mặt. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên hào hứng sẵn sàng tham gia phần bốc thăm may mắn của đêm hội. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Thông báo cấp mã số bốc thăm may mắn tự động sau khi check-in vào cửa sự kiện* |

![Thông báo cấp mã số bốc thăm may mắn tự động sau khi check-in vào cửa sự kiện](images/evidence/sub_33_app_event_lucky_draw.png)


### 5.112. Bảng Use Case UC-APP-24: Nhận Thông Báo Trúng Thưởng Bốc Thăm May Mắn & Lên Sân Khấu Nhận Giải Thưởng Danh Giá

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-24** |
| **Phân Hệ / Nhóm** | Biểu Quyết & Bốc Thăm Hội Viên |
| **Tên Chức Năng** | Nhận Thông Báo Trúng Thưởng Bốc Thăm May Mắn & Lên Sân Khấu Nhận Giải Thưởng Danh Giá |
| **Tác Nhân (Actor)** | Doanh nhân trúng thưởng (Phạm Văn Vũ) |
| **Tiền Điều Kiện (Pre-conditions)** | Vòng quay may mắn trên sân khấu dừng lại ở mã số của hội viên. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Vòng quay sân khấu dừng ở số #83007.<br>2. Điện thoại của Doanh nhân Phạm Văn Vũ rung lên bần bật kèm chuông báo chiến thắng rộn rã.<br>3. Màn hình ứng dụng bùng nổ hiệu ứng pháo hoa chúc mừng: "XIN CHÚC MỪNG! BẠN ĐÃ TRÚNG GIẢI NHẤT ĐÊM GALA CEO 1983!".<br>4. MC xướng tên Doanh nhân Phạm Văn Vũ lên sân khấu nhận cúp vinh danh và phần thưởng từ Ban Lãnh Đạo và Nhà Tài Trợ.<br>5. Ban Tổ chức chụp ảnh lưu niệm vinh danh trao giải. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Thông tin trúng thưởng được tự động lưu vào mục Kỷ niệm thành tích của hội viên. |
| **Hậu Điều Kiện (Post-conditions)** | Khoảnh khắc thăng hoa đáng nhớ trong hành trình gắn kết cùng đại gia đình Doanh nhân CEO 1983. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Thông báo đẩy chúc mừng doanh nhân trúng giải thưởng bốc thăm may mắn trên ứng dụng* |

![Thông báo đẩy chúc mừng doanh nhân trúng giải thưởng bốc thăm may mắn trên ứng dụng](images/evidence/app_lucky_draw_winner_notification.png)


### 5.113. Bảng Use Case UC-APP-25: Khám Phá Gian Hàng Doanh Nghiệp B2B CEO 1983 & Tìm Kiếm Sản Phẩm / Dịch Vụ Cần Mua

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-25** |
| **Phân Hệ / Nhóm** | Gian Hàng B2B & Đăng Bán |
| **Tên Chức Năng** | Khám Phá Gian Hàng Doanh Nghiệp B2B CEO 1983 & Tìm Kiếm Sản Phẩm / Dịch Vụ Cần Mua |
| **Tác Nhân (Actor)** | Hội viên có nhu cầu mua sắm doanh nghiệp |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên mở phân hệ Gian Hàng Doanh Nghiệp B2B trên ứng dụng. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Màn hình Gian Hàng Doanh Nghiệp B2B CEO 1983 hiển thị chuyên nghiệp theo dạng lưới thương mại hiện đại.<br>2. Danh mục sản phẩm phong phú từ các công ty thành viên: Thiết bị công nghệ, Vật liệu xây dựng, Dịch vụ pháp lý kế toán, Nội thất văn phòng, Dược phẩm y tế, Quà tặng doanh nghiệp...<br>3. Hội viên sử dụng bộ lọc ngành hàng hoặc gõ từ khóa tìm kiếm.<br>4. Mỗi sản phẩm hiển thị: Hình ảnh sắc nét, Tên sản phẩm, Tên doanh nghiệp thành viên cung cấp, Giá niêm yết và Tỷ lệ chiết khấu ưu đãi riêng cho người nhà CEO 1983. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Hội viên có thể lọc riêng các sản phẩm đang có chương trình khuyến mại đặc biệt trong tháng. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên tìm thấy nhà cung cấp tin cậy ngay trong cộng đồng với mức giá ưu đãi nhất. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Gian hàng Doanh nghiệp B2B CEO 1983 với chính sách ưu đãi độc quyền nội bộ* |

![Gian hàng Doanh nghiệp B2B CEO 1983 với chính sách ưu đãi độc quyền nội bộ](images/evidence/app_step_15_marketplace_grid.png)


### 5.114. Bảng Use Case UC-APP-26: Xem Chi Tiết Sản Phẩm B2B, Bảng Giá Ưu Đãi & Nhấn Kết Nối Doanh Nghiệp Cung Cấp

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-26** |
| **Phân Hệ / Nhóm** | Gian Hàng B2B & Đăng Bán |
| **Tên Chức Năng** | Xem Chi Tiết Sản Phẩm B2B, Bảng Giá Ưu Đãi & Nhấn Kết Nối Doanh Nghiệp Cung Cấp |
| **Tác Nhân (Actor)** | Hội viên quan tâm một sản phẩm cụ thể |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên nhấp vào xem một sản phẩm trên gian hàng. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Màn hình chi tiết sản phẩm hiển thị:<br>   - Thư viện hình ảnh đa góc độ, thông số kỹ thuật chi tiết<br>   - Giá bán thị trường và Giá đặc quyền ưu đãi dành cho Hội viên CEO 1983<br>   - Hồ sơ doanh nghiệp bán: Công ty Cổ phần Công nghệ VIO CONNECT<br>   - Thông tin liên hệ trực tiếp của Giám đốc kinh doanh.<br>2. Hội viên có thể nhấn nút "Yêu Cầu Báo Giá Doanh Nghiệp" hoặc "Nhắn Tin Trực Tiếp Cho Nhà Bán" để đàm phán hợp đồng cung ứng số lượng lớn. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Hội viên có thể lưu sản phẩm vào mục Yêu thích để tham khảo lại sau. |
| **Hậu Điều Kiện (Post-conditions)** | Cơ hội giao thương được xúc tiến thẳng đến cấp lãnh đạo có quyền quyết định. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện chi tiết sản phẩm B2B và chính sách chiết khấu dành cho hội viên* |

![Giao diện chi tiết sản phẩm B2B và chính sách chiết khấu dành cho hội viên](images/evidence/sub_36_app_product_detail_modal.png)


### 5.115. Bảng Use Case UC-APP-27: Đăng Tải Sản Phẩm / Dịch Vụ Mới Của Doanh Nghiệp Mình Lên Gian Hàng B2B CEO 1983

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-27** |
| **Phân Hệ / Nhóm** | Gian Hàng B2B & Đăng Bán |
| **Tên Chức Năng** | Đăng Tải Sản Phẩm / Dịch Vụ Mới Của Doanh Nghiệp Mình Lên Gian Hàng B2B CEO 1983 |
| **Tác Nhân (Actor)** | Hội viên đại diện doanh nghiệp (Doanh nhân Phạm Văn Vũ) |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên muốn quảng bá sản phẩm của công ty mình tới hàng trăm lãnh đạo doanh nghiệp khác. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Bấm nút "Đăng Bán Sản Phẩm Mới" trên phân hệ Gian Hàng.<br>2. Biểu mẫu đăng tải thông tin mở ra:<br>   - Tên sản phẩm/dịch vụ: "Giải pháp Chuyển đổi số & Tự động hóa Doanh nghiệp VIO CONNECT"<br>   - Chọn ngành hàng: Công nghệ thông tin & Dịch vụ số<br>   - Tải lên bộ ảnh sản phẩm sắc nét (tối đa 5 ảnh)<br>   - Nhập giá bán công khai và Giá ưu đãi đặc quyền cho Hội viên CEO 1983 (Ví dụ: Giảm 20%)<br>   - Mô tả các tính năng vượt trội và cam kết chất lượng<br>   - Thông tin bảo hành và hỗ trợ kỹ thuật.<br>3. Nhấn "Gửi Kiểm Duyệt".<br>4. Sản phẩm được chuyển đến Ban Xúc Tiến Thương Mại để thẩm định duyệt lên sàn. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu hội viên chưa điền chính sách ưu đãi cho người nhà: Hệ thống gợi ý bổ sung để tăng tỷ lệ chốt đơn. |
| **Hậu Điều Kiện (Post-conditions)** | Sản phẩm của doanh nghiệp hội viên được tiếp cận thẳng tới tệp khách hàng lãnh đạo cao cấp. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Biểu mẫu đăng tải sản phẩm dịch vụ mới lên Gian hàng Doanh nghiệp B2B* |

![Biểu mẫu đăng tải sản phẩm dịch vụ mới lên Gian hàng Doanh nghiệp B2B](images/evidence/app_step_16_product_create_modal.png)


### 5.116. Bảng Use Case UC-APP-28: Quản Lý Danh Mục Sản Phẩm Đã Đăng, Chỉnh Sửa Giá & Cập Nhật Tồn Kho

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-28** |
| **Phân Hệ / Nhóm** | Gian Hàng B2B & Đăng Bán |
| **Tên Chức Năng** | Quản Lý Danh Mục Sản Phẩm Đã Đăng, Chỉnh Sửa Giá & Cập Nhật Tồn Kho |
| **Tác Nhân (Actor)** | Hội viên quản lý gian hàng công ty |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên đã có sản phẩm niêm yết trên gian hàng B2B. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Mở mục "Quản Lý Gian Hàng Của Tôi".<br>2. Danh sách các sản phẩm công ty đã đăng hiển thị kèm trạng thái: Đang bán, Chờ duyệt, Tạm ẩn.<br>3. Hội viên có thể chọn "Chỉnh Sửa" để cập nhật bảng giá mới, thay đổi hình ảnh hoặc cập nhật thêm chính sách khuyến mại.<br>4. Bấm "Ẩn Sản Phẩm" khi tạm thời hết hàng hoặc ngừng kinh doanh dịch vụ đó.<br>5. Xem thống kê số lượt xem và số yêu cầu báo giá đã nhận được từ các hội viên khác. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu sản phẩm bị BXT từ chối: Xem lý do phản hồi và chỉnh sửa để nộp duyệt lại. |
| **Hậu Điều Kiện (Post-conditions)** | Doanh nghiệp hội viên chủ động quản lý gian hàng B2B chuyên nghiệp như một trang thương mại điện tử riêng. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Bảng quản lý danh mục sản phẩm đã đăng và thống kê lượt tiếp cận khách hàng* |

![Bảng quản lý danh mục sản phẩm đã đăng và thống kê lượt tiếp cận khách hàng](images/evidence/sub_38_app_product_3dots_actions.png)


### 5.117. Bảng Use Case UC-APP-29: Xem Bảng Tin Cơ Hội Kinh Doanh Cung - Cầu Thời Gian Thực Của Cộng Đồng CEO 1983

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-29** |
| **Phân Hệ / Nhóm** | Cơ Hội Cung - Cầu Doanh Nghiệp |
| **Tên Chức Năng** | Xem Bảng Tin Cơ Hội Kinh Doanh Cung - Cầu Thời Gian Thực Của Cộng Đồng CEO 1983 |
| **Tác Nhân (Actor)** | Hội viên tìm kiếm cơ hội kinh doanh mới |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên mở phân hệ Cơ Hội Cung - Cầu trên ứng dụng. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Bảng tin hiển thị luồng thông tin trao đổi Cung - Cầu kinh doanh liên tục:<br>   - Thẻ MÀU XANH LỤC - CƠ HỘI CẦU: Doanh nghiệp cần mua, cần tìm đối tác thầu phụ<br>   - Thẻ MÀU XANH DƯƠNG - CƠ HỘI CUNG: Doanh nghiệp có năng lực cung ứng đặc biệt<br>   - Giá trị thương vụ ước tính (ví dụ: Hợp đồng 500 triệu VNĐ)<br>   - Doanh nghiệp đăng tải và người đại diện liên hệ<br>   - Thời hạn tiếp nhận cơ hội kết nối.<br>2. Lọc cơ hội theo ngành nghề hoặc theo giá trị thương vụ. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Hội viên có thể cài đặt thông báo: Nhận tin nhắn ngay khi có cơ hội Cầu thuộc ngành của mình. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên luôn đón đầu các cơ hội làm ăn béo bở ngay trong mạng lưới bạn bè thân thiết. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Bảng tin Cơ hội Kinh doanh Cung - Cầu thời gian thực của cộng đồng CEO 1983* |

![Bảng tin Cơ hội Kinh doanh Cung - Cầu thời gian thực của cộng đồng CEO 1983](images/evidence/app_step_18_opportunities_feed.png)


### 5.118. Bảng Use Case UC-APP-30: Đăng Tin Nhu Cầu Cần Mua / Cần Tìm Đối Tác (Cơ Hội Cầu) Để Ưu Tiên Mua Của Người Nhà

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-30** |
| **Phân Hệ / Nhóm** | Cơ Hội Cung - Cầu Doanh Nghiệp |
| **Tên Chức Năng** | Đăng Tin Nhu Cầu Cần Mua / Cần Tìm Đối Tác (Cơ Hội Cầu) Để Ưu Tiên Mua Của Người Nhà |
| **Tác Nhân (Actor)** | Hội viên có nhu cầu mua hàng / thuê dịch vụ |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên cần triển khai dự án và muốn ưu tiên hợp tác với doanh nghiệp trong CLB. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Bấm nút "Đăng Nhu Cầu Mới" (Tạo Cơ Hội Cầu).<br>2. Điền thông tin yêu cầu:<br>   - Tiêu đề: "Cần tìm đối tác cung cấp dịch vụ văn phòng trọn gói tại Cầu Giấy"<br>   - Chi tiết yêu cầu kỹ thuật và tiến độ cần bàn giao<br>   - Ngân sách dự kiến<br>   - Thời hạn nhận hồ sơ chào giá.<br>3. Nhấn "Đăng Tin Lên Mạng Lưới".<br>4. Tin tức được xuất bản ngay lập tức, thông báo tự động phát đến các doanh nghiệp hội viên cung cấp dịch vụ tương ứng. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu muốn bảo mật tên công ty trong giai đoạn đầu: Có thể chọn đăng ẩn danh qua sự điều phối của Ban Xúc Tiến. |
| **Hậu Điều Kiện (Post-conditions)** | Tìm được nhà thầu ruột cùng niên khóa 1983 với giá tốt và tinh thần trách nhiệm cao nhất. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Biểu mẫu đăng tin nhu cầu mua sắm và tìm đối tác hợp tác kinh doanh trong CLB* |

![Biểu mẫu đăng tin nhu cầu mua sắm và tìm đối tác hợp tác kinh doanh trong CLB](images/evidence/app_step_19_opportunity_create_modal.png)


### 5.119. Bảng Use Case UC-APP-31: Đăng Tin Khả Năng Cung Ứng / Hợp Tác Phân Phối (Cơ Hội Cung) Mở Rộng Thị Trường

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-31** |
| **Phân Hệ / Nhóm** | Cơ Hội Cung - Cầu Doanh Nghiệp |
| **Tên Chức Năng** | Đăng Tin Khả Năng Cung Ứng / Hợp Tác Phân Phối (Cơ Hội Cung) Mở Rộng Thị Trường |
| **Tác Nhân (Actor)** | Hội viên có năng lực cung ứng mới |
| **Tiền Điều Kiện (Pre-conditions)** | Doanh nghiệp hội viên ra mắt sản phẩm mới hoặc mở rộng chính sách đại lý. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Bấm nút "Đăng Năng Lực Mới" (Tạo Cơ Hội Cung).<br>2. Điền thông tin:<br>   - Tiêu đề: "Cung cấp giải pháp văn phòng thông minh chiết khấu 25% cho anh em CEO 1983"<br>   - Năng lực đáp ứng và số lượng cung ứng tối đa<br>   - Chính sách hoa hồng giới thiệu khách hàng dành cho người kết nối.<br>3. Nhấn "Xuất Bản Cơ Hội".<br>4. Bài đăng được đưa lên vị trí nổi bật trên Bảng tin Giao thương. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Có thể đính kèm hồ sơ chào giá và chính sách hợp tác chi tiết dạng PDF. |
| **Hậu Điều Kiện (Post-conditions)** | Mở rộng kênh bán hàng trực tiếp đến hàng trăm lãnh đạo doanh nghiệp tiềm năng. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện đăng tin năng lực cung ứng và cơ hội hợp tác phân phối B2B* |

![Giao diện đăng tin năng lực cung ứng và cơ hội hợp tác phân phối B2B](images/evidence/sub_40_app_opportunity_create_modal.png)


### 5.120. Bảng Use Case UC-APP-32: Nhấn "Tiếp Nhận Cơ Hội" (Express Interest / Claim) Để Kết Nối Trực Tiếp Người Đăng

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-32** |
| **Phân Hệ / Nhóm** | Cơ Hội Cung - Cầu Doanh Nghiệp |
| **Tên Chức Năng** | Nhấn "Tiếp Nhận Cơ Hội" (Express Interest / Claim) Để Kết Nối Trực Tiếp Người Đăng |
| **Tác Nhân (Actor)** | Hội viên nhận thấy cơ hội phù hợp với năng lực công ty mình |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên đọc thấy một Cơ hội Cầu phù hợp trên bảng tin. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Bấm vào nút "Tiếp Nhận Cơ Hội" (Nhận Kết Nối).<br>2. Viết lời chào ngắn gọn và giới thiệu sơ bộ giải pháp của công ty mình.<br>3. Nhấn "Gửi Lời Đề Nghị Hợp Tác".<br>4. Hệ thống lập tức kết nối phiên chat riêng giữa hai lãnh đạo doanh nghiệp, đồng thời thông báo cho Ban Xúc Tiến để hỗ trợ đồng hành thúc đẩy thương vụ.<br>5. Hai bên hẹn gặp trao đổi chi tiết và tiến hành ký kết hợp đồng. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu cơ hội đã có người nhận độc quyền: Hệ thống hiển thị thông báo đã đóng tiếp nhận. |
| **Hậu Điều Kiện (Post-conditions)** | Thương vụ kinh doanh được khởi tạo thành công trên tinh thần tương trợ lẫn nhau. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Thao tác tiếp nhận cơ hội hợp tác kinh doanh và mở luồng kết nối trao đổi trực tiếp* |

![Thao tác tiếp nhận cơ hội hợp tác kinh doanh và mở luồng kết nối trao đổi trực tiếp](images/evidence/sub_41_app_opportunity_detail_modal.png)


### 5.121. Bảng Use Case UC-APP-33: Kiểm Tra Trạng Thái Thời Hạn Hội Viên & Xem Hóa Đơn Hội Phí Thường Niên

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-33** |
| **Phân Hệ / Nhóm** | Hội Phí & Đặc Quyền Hội Viên |
| **Tên Chức Năng** | Kiểm Tra Trạng Thái Thời Hạn Hội Viên & Xem Hóa Đơn Hội Phí Thường Niên |
| **Tác Nhân (Actor)** | Hội viên sử dụng ứng dụng |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên mở mục "Hội Phí & Quyền Lợi" trên Ứng dụng. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Màn hình hiển thị thẻ thông tin hội viên điện tử:<br>   - Trạng thái hội viên: CHÍNH THỨC (ACTIVE)<br>   - Kỳ hội phí hiện tại: Niên khóa 2026 - 2027<br>   - Trạng thái đóng phí: ĐÃ HOÀN THÀNH (Hạn sử dụng đến: 31/12/2026)<br>   - Số tiền hội phí đã đóng: 10.000.000 VNĐ.<br>2. Nếu đến kỳ gia hạn: Màn hình hiển thị nút "Gia Hạn Hội Phí Ngay" kèm đồng hồ đếm ngược số ngày còn lại. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Hội viên có thể bấm "Xem Phiếu Thu Điện Tử" để tải hóa đơn VAT về phục vụ hạch toán chi phí công ty. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên luôn nắm rõ nghĩa vụ tài chính và trạng thái hoạt động của mình trong tổ chức. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Màn hình kiểm tra trạng thái thời hạn hội viên và chi tiết hóa đơn hội phí thường niên* |

![Màn hình kiểm tra trạng thái thời hạn hội viên và chi tiết hóa đơn hội phí thường niên](images/evidence/app1983_09_fees_vietqr.png)


### 5.122. Bảng Use Case UC-APP-34: Thanh Toán Gia Hạn Hội Phí Siêu Tốc Trong 1 Giây Bằng Mã VietQR Napas 24/7 Tự Động Gạch Nợ

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-34** |
| **Phân Hệ / Nhóm** | Hội Phí & Đặc Quyền Hội Viên |
| **Tên Chức Năng** | Thanh Toán Gia Hạn Hội Phí Siêu Tốc Trong 1 Giây Bằng Mã VietQR Napas 24/7 Tự Động Gạch Nợ |
| **Tác Nhân (Actor)** | Hội viên thực hiện nghĩa vụ đóng hội phí thường niên (Doanh nhân Phạm Văn Vũ) |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên có hóa đơn hội phí cần thanh toán. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Bấm nút "Thanh Toán Hội Phí / Gia Hạn Ngay".<br>2. Hộp thoại thanh toán thông minh hiện lên với Mã VietQR Napas 24/7 chuẩn quốc gia:<br>   - Tên ngân hàng thụ hưởng: Ngân hàng TMCP Quân Đội (MB Bank)<br>   - Tên tài khoản: CLB DOANH NHAN CEO 1983 - HANOIBA<br>   - Số tiền chính xác: 10.000.000 VNĐ<br>   - Nội dung chuyển khoản duy nhất: FEE-CEO83007.<br>3. Hội viên mở bất kỳ Ứng dụng Ngân hàng nào trên điện thoại, quét mã QR.<br>4. Mọi thông tin người nhận, số tiền và nội dung tự động điền chính xác 100%.<br>5. Hội viên xác nhận chuyển tiền.<br>6. Máy chủ CLB tự động nhận tín hiệu gạch nợ trong 1 giây, màn hình ứng dụng chuyển sang thông báo XANH LỤC chúc mừng gia hạn thành công. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu thanh toán trên cùng một điện thoại: Hội viên nhấn "Lưu ảnh QR" hoặc bấm nút mở thẳng App ngân hàng liên kết. |
| **Hậu Điều Kiện (Post-conditions)** | Hội phí được gạch nợ tự động, thẻ hội viên được gia hạn thêm 1 năm hoạt động ngay lập tức. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện thanh toán gia hạn hội phí thường niên siêu tốc bằng mã VietQR tự động gạch nợ* |

![Giao diện thanh toán gia hạn hội phí thường niên siêu tốc bằng mã VietQR tự động gạch nợ](images/evidence/app_step_20_annual_fee_renewal.png)


### 5.123. Bảng Use Case UC-APP-35: Khám Phá Danh Mục Đặc Quyền & Ưu Đãi VIP Dành Riêng Cho Hội Viên CEO 1983

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-35** |
| **Phân Hệ / Nhóm** | Hội Phí & Đặc Quyền Hội Viên |
| **Tên Chức Năng** | Khám Phá Danh Mục Đặc Quyền & Ưu Đãi VIP Dành Riêng Cho Hội Viên CEO 1983 |
| **Tác Nhân (Actor)** | Hội viên chính thức |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên đã hoàn thành nghĩa vụ hội phí. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Mở mục "Đặc Quyền Hội Viên" trên ứng dụng.<br>2. Danh sách các đặc quyền đẳng cấp dành riêng cho doanh nhân thành viên:<br>   - Miễn phí vé tham dự toàn bộ các sự kiện Gala và Diễn đàn kinh tế trong năm<br>   - Miễn phí gian hàng B2B tiêu chuẩn quảng bá doanh nghiệp<br>   - Đặc quyền giảm giá 15% - 30% tại chuỗi khách sạn, resort nghỉ dưỡng của các hội viên trong CLB<br>   - Ưu đãi dịch vụ hàng không, phòng chờ thương gia sân bay<br>   - Tham gia các giải Golf và các câu lạc bộ thể thao nội bộ.<br>3. Bấm vào từng đặc quyền để lấy mã Voucher ưu đãi hoặc xem hướng dẫn sử dụng. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Hội viên có thể đề xuất đóng góp thêm gói ưu đãi của công ty mình vào kho đặc quyền chung của CLB. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên cảm nhận sâu sắc giá trị vượt trội khi là một mắt xích trong cộng đồng Doanh nhân CEO 1983. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Danh mục đặc quyền và chính sách ưu đãi VIP dành riêng cho Hội viên CEO 1983* |

![Danh mục đặc quyền và chính sách ưu đãi VIP dành riêng cho Hội viên CEO 1983](images/evidence/app1983_11_perks_benefits.png)


### 5.124. Bảng Use Case UC-APP-36: Trung Tâm Thông Báo Đẩy Cá Nhân Hóa (Notification Center): Lịch Họp, Sự Kiện & Giao Thương

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-36** |
| **Phân Hệ / Nhóm** | Thông Báo & Sổ Tay Hướng Dẫn |
| **Tên Chức Năng** | Trung Tâm Thông Báo Đẩy Cá Nhân Hóa (Notification Center): Lịch Họp, Sự Kiện & Giao Thương |
| **Tác Nhân (Actor)** | Hội viên sử dụng ứng dụng |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên nhấp vào biểu tượng Quả Chuông trên thanh tiêu đề ứng dụng. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Trung tâm thông báo hiển thị danh sách các thông báo cá nhân theo dòng thời gian:<br>   - Thông báo phê duyệt hồ sơ và chào mừng gia nhập<br>   - Thông báo lịch họp Ban Chấp Hành khẩn<br>   - Thông báo có đối tác gửi lời mời hẹn gặp kinh doanh 1-1<br>   - Thông báo sản phẩm trên sàn B2B có người yêu cầu báo giá<br>   - Thông báo nhắc lịch tham dự sự kiện Gala cuối tuần.<br>2. Bấm vào thông báo để chuyển thẳng đến màn hình chức năng liên quan (Deep Link).<br>3. Hội viên có thể bấm "Đánh dấu tất cả đã đọc" hoặc xóa các thông báo cũ. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Hội viên có thể lọc riêng thông báo theo từng chủ đề: Sự kiện / Giao thương / Tài chính. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên luôn cập nhật mọi diễn biến quan trọng trong tổ chức mà không bị bỏ sót. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Trung tâm thông báo đẩy cá nhân hóa theo dõi toàn bộ hoạt động của hội viên* |

![Trung tâm thông báo đẩy cá nhân hóa theo dõi toàn bộ hoạt động của hội viên](images/evidence/app_step_21_notifications_screen.png)


### 5.125. Bảng Use Case UC-APP-37: Tra Cứu Sổ Tay Hướng Dẫn Sử Dụng Hệ Thống Trực Tuyến Tích Hợp Sẵn Trên Ứng Dụng

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-37** |
| **Phân Hệ / Nhóm** | Thông Báo & Sổ Tay Hướng Dẫn |
| **Tên Chức Năng** | Tra Cứu Sổ Tay Hướng Dẫn Sử Dụng Hệ Thống Trực Tuyến Tích Hợp Sẵn Trên Ứng Dụng |
| **Tác Nhân (Actor)** | Hội viên mới cần tìm hiểu cách dùng các tính năng |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên mở mục Trợ Giúp / Hướng Dẫn Sử Dụng trên menu ứng dụng. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Màn hình Sổ Tay Hướng Dẫn mở ra với định dạng lật sách trực quan.<br>2. Danh mục hướng dẫn chi tiết từng bước bằng hình ảnh minh họa thực tế:<br>   - Hướng dẫn thiết lập Danh thiếp điện tử và chạm thẻ NFC<br>   - Hướng dẫn nhận vé mời sự kiện và xuất trình mã QR tại cổng<br>   - Hướng dẫn đăng bài bán hàng lên Gian hàng B2B<br>   - Hướng dẫn đóng hội phí thường niên qua VietQR tự động.<br>3. Hội viên có thể tìm kiếm theo từ khóa hoặc xem video hướng dẫn ngắn 1 phút. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu đọc hướng dẫn vẫn chưa rõ: Hội viên bấm nút "Chat Với Ban Thư Ký" để được hỗ trợ trực tiếp. |
| **Hậu Điều Kiện (Post-conditions)** | Bất kỳ hội viên nào, dù không rành công nghệ, cũng sử dụng thành thạo ứng dụng trong 5 phút. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Sổ tay Hướng dẫn sử dụng hệ thống trực tuyến tích hợp trực tiếp trên ứng dụng* |

![Sổ tay Hướng dẫn sử dụng hệ thống trực tuyến tích hợp trực tiếp trên ứng dụng](images/evidence/10_app_user_guide_pdf_viewer.png)


### 5.126. Bảng Use Case UC-APP-38: Đăng Xuất Khỏi Ứng Dụng An Toàn Khi Sử Dụng Chung Thiết Bị

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-38** |
| **Phân Hệ / Nhóm** | Thông Báo & Sổ Tay Hướng Dẫn |
| **Tên Chức Năng** | Đăng Xuất Khỏi Ứng Dụng An Toàn Khi Sử Dụng Chung Thiết Bị |
| **Tác Nhân (Actor)** | Hội viên hoàn tất phiên làm việc |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên đang đăng nhập trên thiết bị không phải của mình. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Vào mục "Cài Đặt Cá Nhân", cuộn xuống cuối màn hình.<br>2. Bấm nút "Đăng Xuất Khỏi Tài Khoản".<br>3. Hộp thoại xác nhận hiển thị: "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?".<br>4. Bấm "Đồng Ý".<br>5. Hệ thống thu hồi phiên làm việc, xóa dữ liệu nhạy cảm trên bộ nhớ tạm của máy và đưa về màn hình Đăng nhập an toàn. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Hội viên cũng có thể chọn tính năng "Đăng xuất khỏi tất cả các thiết bị khác từ xa" để bảo mật tuyệt đối. |
| **Hậu Điều Kiện (Post-conditions)** | Dữ liệu tài khoản doanh nhân được bảo vệ an toàn, không bị truy cập trái phép. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Thao tác đăng xuất tài khoản an toàn và bảo vệ dữ liệu cá nhân hội viên* |

![Thao tác đăng xuất tài khoản an toàn và bảo vệ dữ liệu cá nhân hội viên](images/evidence/06_app_login_screen.png)


### 5.127. Bảng Use Case UC-APP-39: Gửi Yêu Cầu Kết Nối Giao Thương 1-1 Với Doanh Nghiệp Thành Viên Kèm Lời Nhắn Hợp Tác

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-39** |
| **Phân Hệ / Nhóm** | Giao Thương & Hợp Tác Doanh Nghiệp |
| **Tên Chức Năng** | Gửi Yêu Cầu Kết Nối Giao Thương 1-1 Với Doanh Nghiệp Thành Viên Kèm Lời Nhắn Hợp Tác |
| **Tác Nhân (Actor)** | Hội viên chủ động tìm kiếm đối tác (Doanh nhân Phạm Văn Vũ) |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên mở hồ sơ của một doanh nghiệp thành viên khác trong Danh bạ CLB. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Trên màn hình chi tiết doanh nghiệp đối tác, nhấn nút "Gửi Yêu Cầu Hẹn Gặp 1-1".<br>2. Hộp thoại kết nối kinh doanh mở ra: Nhập Mục đích hợp tác kinh doanh, Đề xuất thời gian và địa điểm gặp mặt trực tiếp hoặc trực tuyến.<br>3. Đính kèm hồ sơ năng lực (Profile) công ty của mình.<br>4. Bấm "Gửi Lời Mời Hẹn Gặp 1-1".<br>5. Hệ thống gửi thông báo đẩy và email trang trọng đến lãnh đạo doanh nghiệp đối tác.<br>6. Khi đối tác bấm "Đồng Ý", hệ thống tự động thiết lập cuộc hẹn vào lịch làm việc của cả hai bên. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu đối tác bận: Đối tác có thể chọn "Hẹn Lại Thời Gian Khác" kèm lời nhắn phản hồi lịch sự. |
| **Hậu Điều Kiện (Post-conditions)** | Yêu cầu kết nối giao thương được gửi đi văn minh, mở ra cơ hội hợp tác kinh doanh thực chất. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện gửi lời mời kết nối hẹn gặp giao thương 1-1 giữa các lãnh đạo doanh nghiệp* |

![Giao diện gửi lời mời kết nối hẹn gặp giao thương 1-1 giữa các lãnh đạo doanh nghiệp](images/evidence/live_29_app_opportunities_feed_1on1.png)


### 5.128. Bảng Use Case UC-APP-40: Tạo Phiếu Đặt Hàng B2B Trực Tiếp Cho Sản Phẩm Doanh Nghiệp Hội Viên Trên Ứng Dụng

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-40** |
| **Phân Hệ / Nhóm** | Giao Thương & Hợp Tác Doanh Nghiệp |
| **Tên Chức Năng** | Tạo Phiếu Đặt Hàng B2B Trực Tiếp Cho Sản Phẩm Doanh Nghiệp Hội Viên Trên Ứng Dụng |
| **Tác Nhân (Actor)** | Hội viên có nhu cầu mua sắm sản phẩm dịch vụ từ đồng nghiệp |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên xem sản phẩm trên Gian hàng B2B của CLB. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Xem chi tiết sản phẩm: Quy cách, chứng nhận chất lượng và giá ưu đãi hội viên CEO 1983.<br>2. Chọn số lượng cần đặt mua và ghi chú yêu cầu kỹ thuật.<br>3. Bấm nút "Tạo Đơn Hàng B2B Nội Bộ".<br>4. Điền địa chỉ giao hàng và thông tin xuất hóa đơn VAT của công ty mình.<br>5. Bấm "Xác Nhận Đặt Hàng".<br>6. Hệ thống gửi phiếu đặt hàng tới bộ phận kinh doanh của doanh nghiệp cung cấp để tiến hành ký kết hợp đồng thương mại và giao hàng. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Hội viên có thể bấm "Chat Ngay Với Giám Đốc Kinh Doanh" để thương thảo thêm về tiến độ giao hàng và các điều khoản riêng. |
| **Hậu Điều Kiện (Post-conditions)** | Đơn hàng B2B nội bộ được khởi tạo nhanh chóng, hưởng trọn chính sách ưu đãi độc quyền dành cho hội viên. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Màn hình duyệt danh mục và khởi tạo đơn hàng trên Gian hàng B2B Doanh nhân CEO 1983* |

![Màn hình duyệt danh mục và khởi tạo đơn hàng trên Gian hàng B2B Doanh nhân CEO 1983](images/evidence/app_step_15_marketplace_grid.png)


### 5.129. Bảng Use Case UC-APP-41: Đánh Giá Tín Nhiệm & Nhận Xét 5 Sao Cho Đối Tác Sau Khi Hoàn Thành Giao Thương

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-41** |
| **Phân Hệ / Nhóm** | Giao Thương & Hợp Tác Doanh Nghiệp |
| **Tên Chức Năng** | Đánh Giá Tín Nhiệm & Nhận Xét 5 Sao Cho Đối Tác Sau Khi Hoàn Thành Giao Thương |
| **Tác Nhân (Actor)** | Hội viên đã hoàn tất giao dịch mua sắm / hợp tác |
| **Tiền Điều Kiện (Pre-conditions)** | Giao dịch B2B giữa hai doanh nghiệp được xác nhận hoàn tất thành công. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Hội viên mở mục "Lịch Sử Giao Dịch B2B" trên ứng dụng.<br>2. Chọn giao dịch đã hoàn tất và bấm nút "Đánh Giá Đối Tác".<br>3. Chọn số sao tín nhiệm (từ 1 đến 5 sao) theo các tiêu chí: Chất lượng sản phẩm, Tiến độ giao hàng và Thái độ phục vụ chuyên nghiệp.<br>4. Viết cảm nhận thực tế: "Sản phẩm công nghệ của VIO CONNECT rất chuẩn chỉ, hỗ trợ nhiệt tình, xứng tầm doanh nhân 1983!".<br>5. Bấm "Gửi Đánh Giá".<br>6. Điểm tín nhiệm của doanh nghiệp đối tác được cập nhật trên Gian hàng B2B để toàn thể CLB cùng tham khảo. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Doanh nghiệp được đánh giá có thể viết phản hồi cảm ơn đối tác công khai dưới phần nhận xét. |
| **Hậu Điều Kiện (Post-conditions)** | Xây dựng môi trường giao thương nội bộ trung thực, tôn vinh các doanh nghiệp uy tín hàng đầu trong CLB. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Hệ thống đánh giá tín nhiệm và chấm điểm uy tín đối tác giao thương nội bộ B2B* |

![Hệ thống đánh giá tín nhiệm và chấm điểm uy tín đối tác giao thương nội bộ B2B](images/evidence/app1983_10_marketplace_shopee.png)


### 5.130. Bảng Use Case UC-APP-42: Đăng Ký Gian Hàng Triển Lãm Doanh Nghiệp Tại Sự Kiện Gala & Diễn Đàn Kinh Tế

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-42** |
| **Phân Hệ / Nhóm** | Sự Kiện & Triển Lãm Doanh Nghiệp |
| **Tên Chức Năng** | Đăng Ký Gian Hàng Triển Lãm Doanh Nghiệp Tại Sự Kiện Gala & Diễn Đàn Kinh Tế |
| **Tác Nhân (Actor)** | Hội viên mong muốn quảng bá sản phẩm tại sự kiện lớn |
| **Tiền Điều Kiện (Pre-conditions)** | Ban Tổ Chức mở cổng đăng ký gian hàng triển lãm cho sự kiện Gala. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Hội viên mở chi tiết sự kiện Gala Thường Niên trên ứng dụng.<br>2. Chọn mục "Đăng Ký Gian Hàng Triển Lãm B2B".<br>3. Xem sơ đồ vị trí gian hàng tại sảnh sự kiện: Khu vực Gian hàng Kim Cương, Gian hàng Tiêu Chuẩn.<br>4. Chọn vị trí gian hàng mong muốn trên sơ đồ tương tác.<br>5. Nhập danh mục sản phẩm sẽ mang tới trưng bày và giới thiệu.<br>6. Bấm "Xác Nhận Đăng Ký Gian Hàng".<br>7. Ban Tổ Chức tiếp nhận thông tin và cấp mã thẻ đại diện gian hàng cho doanh nghiệp. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Trường hợp vị trí gian hàng đã có người đăng ký trước: Hệ thống tự động gợi ý vị trí liền kề tương đương. |
| **Hậu Điều Kiện (Post-conditions)** | Doanh nghiệp giành được vị trí trưng bày đắc địa tại sự kiện, tiếp cận trực tiếp hàng trăm CEO thành viên. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Đăng ký gian hàng triển lãm và vị trí trưng bày sản phẩm tại sự kiện Gala Doanh nhân* |

![Đăng ký gian hàng triển lãm và vị trí trưng bày sản phẩm tại sự kiện Gala Doanh nhân](images/evidence/live_18_crm_event_create_paid_modal.png)


### 5.131. Bảng Use Case UC-APP-43: Bầu Chọn Doanh Nhân Tiêu Biểu & Biểu Quyết Nghị Quyết Đại Hội Trực Tuyến Trên App

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-43** |
| **Phân Hệ / Nhóm** | Biểu Quyết & Sinh Hoạt Hiệp Hội |
| **Tên Chức Năng** | Bầu Chọn Doanh Nhân Tiêu Biểu & Biểu Quyết Nghị Quyết Đại Hội Trực Tuyến Trên App |
| **Tác Nhân (Actor)** | Hội viên chính thức tham gia biểu quyết đại hội |
| **Tiền Điều Kiện (Pre-conditions)** | Ban Chấp Hành kích hoạt phiên bỏ phiếu biểu quyết điện tử. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Hội viên nhận thông báo mời tham gia biểu quyết trên ứng dụng.<br>2. Mở màn hình "Bỏ Phiếu Biểu Quyết Điện Tử".<br>3. Đọc chi tiết nội dung tờ trình hoặc danh sách ứng viên đề cử Ban Chấp Hành nhiệm kỳ mới.<br>4. Chọn phương án biểu quyết: "Đồng ý", "Không đồng ý" hoặc "Ý kiến khác" (Tuân thủ nguyên tắc 1 hội viên chỉ có 1 phiếu duy nhất).<br>5. Bấm "Xác Nhận Bỏ Phiếu".<br>6. Hệ thống mã hóa lá phiếu và ghi nhận vào cơ sở dữ liệu kiểm toán.<br>7. Màn hình hiển thị thông báo đã bỏ phiếu thành công kèm mã xác thực phiếu bầu. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Khi Ban Tổ Chức công bố kết quả: Màn hình tự động hiển thị biểu đồ tỷ lệ biểu quyết trực quan thời gian thực. |
| **Hậu Điều Kiện (Post-conditions)** | Quyền biểu quyết dân chủ của hội viên được thực hiện thuận tiện, chính xác và minh bạch 100%. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Giao diện bỏ phiếu bầu cử điện tử và biểu quyết nghị quyết trực tiếp trên ứng dụng* |

![Giao diện bỏ phiếu bầu cử điện tử và biểu quyết nghị quyết trực tiếp trên ứng dụng](images/evidence/app_step_14_voting_luckydraw.png)


### 5.132. Bảng Use Case UC-APP-44: Tham Gia Vòng Quay May Mắn (Lucky Draw) Nhận Quà Tài Trợ Tại Sự Kiện Gala

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-44** |
| **Phân Hệ / Nhóm** | Biểu Quyết & Sinh Hoạt Hiệp Hội |
| **Tên Chức Năng** | Tham Gia Vòng Quay May Mắn (Lucky Draw) Nhận Quà Tài Trợ Tại Sự Kiện Gala |
| **Tác Nhân (Actor)** | Hội viên và khách mời có mặt tại sự kiện Gala |
| **Tiền Điều Kiện (Pre-conditions)** | Đại biểu đã hoàn tất thủ tục soát vé Check-in tại cổng sự kiện. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. MC chương trình kích hoạt phần quay thưởng may mắn Lucky Draw.<br>2. Đại biểu mở mục "Vòng Quay May Mắn" trên ứng dụng di động.<br>3. Hệ thống tự động gán mã quay thưởng chính là Mã số vé hoặc Mã hội viên của đại biểu.<br>4. Màn hình hiển thị vòng quay sống động đồng bộ với màn hình LED sân khấu chính.<br>5. Khi vòng quay dừng lại tại số của đại biểu, ứng dụng rung chuông thông báo chúc mừng trúng thưởng phần quà từ Nhà tài trợ.<br>6. Đại biểu xuất trình mã trúng thưởng trên app để nhận quà tại bàn thư ký. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Đại biểu vắng mặt tại thời điểm xướng tên: Hệ thống hỗ trợ quay lại lượt mới theo quy chế của Ban Tổ Chức. |
| **Hậu Điều Kiện (Post-conditions)** | Tạo không khí sôi nổi, hào hứng và gắn kết tối đa giữa các thành viên tham dự Gala. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Hệ thống quay số may mắn trúng thưởng các phần quà giá trị từ Nhà tài trợ tại Gala* |

![Hệ thống quay số may mắn trúng thưởng các phần quà giá trị từ Nhà tài trợ tại Gala](images/evidence/crm_12_voting_luckydraw.png)


### 5.133. Bảng Use Case UC-APP-45: Đóng Góp Ủng Hộ Quỹ Thiện Nguyện Bằng Mã VietQR Trực Tiếp Trên Ứng Dụng

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-45** |
| **Phân Hệ / Nhóm** | Thiện Nguyện & An Sinh Xã Hội |
| **Tên Chức Năng** | Đóng Góp Ủng Hộ Quỹ Thiện Nguyện Bằng Mã VietQR Trực Tiếp Trên Ứng Dụng |
| **Tác Nhân (Actor)** | Hội viên có tấm lòng hảo tâm (Doanh nhân Phạm Văn Vũ) |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên xem thông tin chương trình thiện nguyện "Áo Ấm Cho Em" trên app. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Bấm nút "Ủng Hộ Chiến Dịch Ngay".<br>2. Chọn số tiền đóng góp (Ví dụ: 2.000.000 VNĐ, 5.000.000 VNĐ, 10.000.000 VNĐ hoặc nhập số tiền tùy tâm).<br>3. Nhập lời chúc gửi đến các em nhỏ vùng cao.<br>4. Bấm "Tạo Mã VietQR Ủng Hộ".<br>5. Mã VietQR hiện ra với đúng thông tin tài khoản Quỹ Thiện Nguyện CLB và cú pháp giao dịch duy nhất.<br>6. Hội viên quét mã thanh toán trên ứng dụng ngân hàng.<br>7. Sau 1 giây, màn hình hiển thị Thư cảm ơn tấm lòng vàng và tên hội viên xuất hiện trang trọng trên Bảng vàng nhân ái. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Hội viên có thể bấm chia sẻ chứng nhận ủng hộ lên mạng xã hội để lan tỏa tinh thần nhân ái của CLB. |
| **Hậu Điều Kiện (Post-conditions)** | Khoản đóng góp được chuyển thẳng vào Quỹ An Sinh Xã Hội của CLB một cách an toàn và minh bạch. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Thao tác đóng góp ủng hộ chương trình thiện nguyện an sinh xã hội siêu tốc qua VietQR* |

![Thao tác đóng góp ủng hộ chương trình thiện nguyện an sinh xã hội siêu tốc qua VietQR](images/evidence/app_step_20_annual_fee_renewal.png)


### 5.134. Bảng Use Case UC-APP-46: Đăng Ký Tham Gia Các Câu Lạc Bộ Thể Thao: Golf 1983, Tennis, Chạy Bộ Phong Trào

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-46** |
| **Phân Hệ / Nhóm** | Câu Lạc Bộ Thể Thao & Gắn Kết |
| **Tên Chức Năng** | Đăng Ký Tham Gia Các Câu Lạc Bộ Thể Thao: Golf 1983, Tennis, Chạy Bộ Phong Trào |
| **Tác Nhân (Actor)** | Hội viên yêu thích hoạt động thể dục thể thao |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên mở mục "CLB Thể Thao & Sở Thích" trên ứng dụng. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Xem danh sách các câu lạc bộ trực thuộc: CLB Golf Doanh Nhân 1983, CLB Tennis 1983, CLB Chạy Bộ Marathon.<br>2. Xem lịch sinh hoạt định kỳ, địa điểm tập luyện và ban điều hành của từng CLB thể thao.<br>3. Chọn câu lạc bộ phù hợp và bấm nút "Đăng Ký Gia Nhập CLB Thể Thao".<br>4. Điền trình độ / Handicap (đối với Golf) và kích cỡ áo thi đấu.<br>5. Bấm "Xác Nhận Gia Nhập".<br>6. Hệ thống tự động thêm hội viên vào nhóm sinh hoạt thể thao nội bộ và cập nhật lịch giao lưu thể thao vào lịch cá nhân. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Hội viên có thể đăng ký tham gia các giải đấu giao hữu mở rộng do CLB phối hợp với HanoiBA tổ chức. |
| **Hậu Điều Kiện (Post-conditions)** | Hội viên nâng cao sức khỏe, tăng cường tình bạn bè đồng niên qua các hoạt động thể thao văn minh. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Danh sách và lịch sinh hoạt các câu lạc bộ thể thao Golf, Tennis, Chạy bộ của CLB* |

![Danh sách và lịch sinh hoạt các câu lạc bộ thể thao Golf, Tennis, Chạy bộ của CLB](images/evidence/app_step_11_events_list.png)


### 5.135. Bảng Use Case UC-APP-47: Gửi Đề Xuất & Sáng Kiến Phát Triển Tổ Chức Đến Trực Tiếp Ban Chấp Hành

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-47** |
| **Phân Hệ / Nhóm** | Góp Ý & Sáng Kiến Phát Triển |
| **Tên Chức Năng** | Gửi Đề Xuất & Sáng Kiến Phát Triển Tổ Chức Đến Trực Tiếp Ban Chấp Hành |
| **Tác Nhân (Actor)** | Hội viên tâm huyết muốn đóng góp trí tuệ cho CLB |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên mở mục "Hòm Thư Sáng Kiến / Góp Ý" trên ứng dụng. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Bấm nút "Gửi Sáng Kiến Mới".<br>2. Chọn chủ đề: "Đổi mới nội dung sinh hoạt", "Xúc tiến thương mại quốc tế", "Nâng cấp tính năng ứng dụng số" hoặc "Chính sách hỗ trợ hội viên".<br>3. Soạn thảo nội dung ý tưởng, giải pháp thực hiện và tính khả thi của đề xuất.<br>4. Đính kèm tài liệu thuyết minh hoặc hình ảnh minh họa.<br>5. Bấm "Gửi Tới Ban Chấp Hành".<br>6. Hệ thống chuyển đề xuất vào hòm thư thẩm tra của Ban Thư Ký và Ban Quản Trị, đồng thời cấp mã tra cứu tiến độ xử lý cho hội viên. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Ban Thư Ký phản hồi kết quả xem xét sáng kiến trực tiếp trong hộp thoại tin nhắn của hội viên. |
| **Hậu Điều Kiện (Post-conditions)** | Tạo cầu nối trực tiếp giữa Hội viên và Ban Lãnh Đạo, phát huy tối đa sức mạnh trí tuệ tập thể. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Hòm thư tiếp nhận sáng kiến và đối thoại trực tiếp giữa hội viên với Ban Chấp Hành* |

![Hòm thư tiếp nhận sáng kiến và đối thoại trực tiếp giữa hội viên với Ban Chấp Hành](images/evidence/app_step_09_messages_inbox.png)


### 5.136. Bảng Use Case UC-APP-48: Cập Nhật Giờ Làm Việc, Chi Nhánh & Danh Mục Sản Phẩm Mới Trên Trang Hồ Sơ Doanh Nghiệp

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-48** |
| **Phân Hệ / Nhóm** | Hồ Sơ Doanh Nghiệp & Thương Hiệu |
| **Tên Chức Năng** | Cập Nhật Giờ Làm Việc, Chi Nhánh & Danh Mục Sản Phẩm Mới Trên Trang Hồ Sơ Doanh Nghiệp |
| **Tác Nhân (Actor)** | Hội viên đại diện doanh nghiệp (Doanh nhân Phạm Văn Vũ) |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên đăng nhập ứng dụng và mở trang quản lý Hồ Sơ Doanh Nghiệp. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Mở mục "Doanh Nghiệp Của Tôi" (Công ty Cổ phần Công nghệ VIO CONNECT).<br>2. Chỉnh sửa thông tin giới thiệu: Tầm nhìn sứ mệnh, Năng lực công nghệ, Đội ngũ nhân sự.<br>3. Bổ sung địa chỉ các văn phòng đại diện và chi nhánh mới.<br>4. Cập nhật số điện thoại hotline, email chăm sóc khách hàng và giờ làm việc tiêu chuẩn.<br>5. Tải lên Brochure giới thiệu sản phẩm định dạng PDF để các đối tác có thể tải về nghiên cứu.<br>6. Nhấn "Lưu Thay Đổi".<br>7. Thông tin doanh nghiệp lập tức được cập nhật đồng bộ trên toàn bộ Danh bạ Hội viên và Danh thiếp số công khai. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Nếu thay đổi Mã số thuế hoặc Tên pháp nhân công ty: Hệ thống yêu cầu Ban Thành Viên xác thực lại giấy phép đăng ký kinh doanh mới. |
| **Hậu Điều Kiện (Post-conditions)** | Hồ sơ doanh nghiệp luôn tươi mới, chuẩn xác, tối ưu hóa cơ hội tiếp cận khách hàng tiềm năng. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Chỉnh sửa thông tin doanh nghiệp, bổ sung chi nhánh và cập nhật hồ sơ năng lực* |

![Chỉnh sửa thông tin doanh nghiệp, bổ sung chi nhánh và cập nhật hồ sơ năng lực](images/evidence/live_30_app_member_profile_edit.png)


### 5.137. Bảng Use Case UC-APP-49: Tải Xuống Giấy Chứng Nhận Hội Viên Điện Tử Kèm Chữ Ký Số Của Ban Chấp Hành

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-49** |
| **Phân Hệ / Nhóm** | Chứng Nhận & Danh Dự Hội Viên |
| **Tên Chức Năng** | Tải Xuống Giấy Chứng Nhận Hội Viên Điện Tử Kèm Chữ Ký Số Của Ban Chấp Hành |
| **Tác Nhân (Actor)** | Hội viên chính thức (Doanh nhân Phạm Văn Vũ - CEO-83007) |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên đã được kết nạp chính thức và hoàn tất nghĩa vụ hội phí. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Mở mục "Chứng Nhận Hội Viên" trên màn hình Thẻ VIP.<br>2. Hệ thống hiển thị bản xem trước của Giấy Chứng Nhận Hội Viên Chính Thức mang nhận diện Hoàng gia sang trọng:<br>   - Họ và tên: Phạm Văn Vũ<br>   - Chức danh: Tổng Giám Đốc - Công ty Cổ phần Công nghệ VIO CONNECT<br>   - Mã số hội viên: CEO-83007<br>   - Khóa sinh hoạt: Nhiệm kỳ Hội Doanh Nhân Trẻ Hà Nội<br>   - Chữ ký số và con dấu điện tử của Chủ tịch CLB Doanh Nhân CEO 1983<br>   - Mã QR xác thực nguồn gốc điện tử chống giả mạo.<br>3. Bấm nút "Tải File PDF Chất Lượng Cao".<br>4. Tệp chứng nhận được lưu về điện thoại, sẵn sàng in đóng khung treo tại phòng làm việc. |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Bất kỳ ai khi quét mã QR trên bản in chứng nhận đều được dẫn tới trang xác thực công khai xác nhận hội viên thật 100%. |
| **Hậu Điều Kiện (Post-conditions)** | Khẳng định niềm tự hào và vị thế doanh nhân chính thức trong đại gia đình CEO 1983. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Mẫu Giấy Chứng Nhận Hội Viên Chính Thức điện tử có mã QR xác thực và chữ ký số* |

![Mẫu Giấy Chứng Nhận Hội Viên Chính Thức điện tử có mã QR xác thực và chữ ký số](images/evidence/app_identity_card_vip.png)


### 5.138. Bảng Use Case UC-APP-50: Quản Lý Danh Sách Thiết Bị Đăng Nhập & Bật Xác Thực Hai Yếu Tố (2FA) Bảo Mật Đỉnh Cao

| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |
| :--- | :--- |
| **Mã Use Case (ID)** | **UC-APP-50** |
| **Phân Hệ / Nhóm** | Bảo Mật & Quản Trị Thiết Bị |
| **Tên Chức Năng** | Quản Lý Danh Sách Thiết Bị Đăng Nhập & Bật Xác Thực Hai Yếu Tố (2FA) Bảo Mật Đỉnh Cao |
| **Tác Nhân (Actor)** | Hội viên bảo vệ tài khoản cá nhân |
| **Tiền Điều Kiện (Pre-conditions)** | Hội viên mở mục Cài Đặt Bảo Mật trên ứng dụng. |
| **Luồng Xử Lý Chính (Main Flow)** | 1. Mở phân hệ "An Toàn & Bảo Mật Tài Khoản".<br>2. Xem danh sách các thiết bị đang đăng nhập tài khoản của mình (Tên dòng máy điện thoại, Trình duyệt máy tính, Thời gian đăng nhập gần nhất).<br>3. Bật tùy chọn "Xác Thực Hai Yếu Tố (2FA)".<br>4. Quét mã QR vào ứng dụng xác thực Google Authenticator hoặc nhận mã OTP bảo mật qua SMS.<br>5. Nhập 6 số xác nhận để kích hoạt thành công tính năng 2FA.<br>6. Nếu phát hiện thiết bị lạ: Hội viên bấm "Đăng Xuất Khỏi Thiết Bị Này Ngay Lập Tức". |
| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | - Hội viên có thể kích hoạt tính năng Đăng nhập sinh trắc học (FaceID / Vân tay) để mở app nhanh mà vẫn an toàn tuyệt đối. |
| **Hậu Điều Kiện (Post-conditions)** | Tài khoản doanh nhân được bảo vệ đa lớp, ngăn chặn 100% nguy cơ xâm nhập trái phép. |
| **Hình Ảnh Minh Chứng Thực Tế** | *Màn hình quản lý thiết bị đăng nhập, cấu hình xác thực hai yếu tố và bảo mật tài khoản* |

![Màn hình quản lý thiết bị đăng nhập, cấu hình xác thực hai yếu tố và bảo mật tài khoản](images/evidence/sub_47_app_settings_password_security.png)


---

## 6. YÊU CẦU PHI CHỨC NĂNG (Non-Functional Requirements)

| Tiêu Chí Kỹ Thuật | Yêu Cầu Chi Tiết & Chuẩn Mực Doanh Nghiệp | Chỉ Số Đo Lường (SLA) |
| :--- | :--- | :--- |
| **Hiệu năng & Tốc độ (Performance)** | - Thời gian phản hồi thao tác trung bình dưới 150ms.<br>- Thời gian nhận diện mã QR vé mời tại cổng dưới 0.2 giây.<br>- Khả năng chịu tải đồng thời tối thiểu 5,000 người dùng truy cập biểu quyết hoặc xem sự kiện Gala. | - Thời gian phản hồi: < 150ms<br>- Nhận diện QR: < 200ms<br>- Tải đồng thời: > 5,000 |
| **Bảo mật & An toàn (Security)** | - Mã hóa dữ liệu truyền tải theo tiêu chuẩn TLS 1.3 bảo mật cao.<br>- Mật khẩu tài khoản được băm một chiều an toàn (Bcrypt Salt 10 vòng).<br>- Tự động khóa tạm thời sau 5 lần đăng nhập thất bại liên tiếp.<br>- Phân quyền dữ liệu RBAC nghiêm ngặt cho 6 Ban chuyên môn và ghi nhận nhật ký kiểm toán không thể sửa đổi. | - Mã hóa: TLS 1.3<br>- Băm Bcrypt Salt 10<br>- Khóa sau 5 lần sai<br>- Nhật ký Audit Trail: 100% |
| **Bảo trì & Sao lưu (Maintainability)** | - Kiến trúc mô-đun hóa độc lập, phân tách rõ ràng giữa giao diện và logic xử lý.<br>- Tự động tạo bản sao lưu dữ liệu (Daily Backup) hàng ngày vào 03:00 sáng.<br>- Khả năng phục hồi dữ liệu nhanh khi có sự cố kỹ thuật. | - Tự động sao lưu định kỳ<br>- Thời gian phục hồi RTO < 30 phút<br>- RPO < 24 giờ |
| **Tính khả dụng (Usability)** | - Thiết kế giao diện phong cách Hoàng gia Doanh nhân sang trọng (Obsidian Dark, Royal Navy, Amber Gold).<br>- Tương thích hoàn hảo trên mọi kích thước màn hình từ điện thoại di động đến máy tính để bàn.<br>- Toàn bộ thuật ngữ tiếng Việt hành chính chuẩn mực, dễ hiểu đối với lãnh đạo không chuyên CNTT. | - Tương thích 100% thiết bị<br>- Tỷ lệ lỗi giao diện: 0%<br>- Trải nghiệm mượt mà, trực quan |

---

## 7. YÊU CẦU DỮ LIỆU & GIAO DIỆN (UI/UX Standards)

### 7.1. Bảng màu nhận diện thương hiệu độc quyền CEO 1983
* **Royal Navy (#0A2540):** Màu xanh biển sâu tượng trưng cho uy tín vững bền, tầm nhìn chiến lược của người lãnh đạo.
* **Amber Gold (#D97706):** Màu vàng kim vinh danh thẻ VIP, kỷ niệm chương và các gói đối tác chiến lược.
* **Trắng Sứ & Xám Khói (#FFFFFF, #F8FAFC):** Nền tảng thanh lịch, thoáng đãng giúp hiển thị dữ liệu rõ ràng.

### 7.2. Chuẩn mực phần cứng & giao tiếp ngoại vi
* **Camera Soát Vé Thông Minh:** Tự động điều chỉnh tiêu cự nhận diện mã QR trong 0.2 giây kể cả trong điều kiện ánh sáng yếu tại sảnh tiệc Gala.
* **Công Nghệ NFC 1 Chạm:** Trao đổi thông tin danh thiếp điện tử không tiếp xúc tiêu chuẩn quốc tế ISO/IEC 14443.
* **Máy Chủ Thư Tín Tự Động (SMTP Mailer):** Tự động phát hành email chào mừng, hóa đơn VietQR và vé điện tử E-Ticket tức thời.

---

## 8. PHỤ LỤC: DANH MỤC 138 MINH CHỨNG HÌNH ẢNH CHỤP THỰC TẾ

Toàn bộ 138 hình ảnh minh chứng thực tế trên hệ thống được lưu trữ trong thư mục tài liệu `document/images/evidence/` và được tích hợp trực tiếp dưới từng bảng Use Case chi tiết ở Mục 5 của tài liệu này.
