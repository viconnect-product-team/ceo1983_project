# HƯỚNG DẪN SỬ DỤNG ỨNG DỤNG DI ĐỘNG HỘI VIÊN CEO 1983
## HỆ THỐNG GIAO THƯƠNG & KẾT NỐI DOANH NHÂN CLB CEO 1983 (HANOIBA)
*Địa chỉ truy cập ứng dụng: `https://ceo1983.viconnect.vn`*

---

## MỤC LỤC HƯỚNG DẪN

1. [Đăng Nhập & Quên Mật Khẩu](#1-đăng-nhập--quên-mật-khẩu)
2. [NODE-APP-001: Trang Chủ & Trung Tâm Thông Báo](#node-app-001-trang-chủ--trung-tâm-thông-báo)
3. [NODE-APP-002: Thẻ Hội Viên VIP Số & QR Cá Nhân](#node-app-002-thẻ-hội-viên-vip-số--qr-cá-nhân)
4. [NODE-APP-003: Trang Quét Danh Thiếp Công Khai](#node-app-003-trang-quét-danh-thiếp-công-khai)
5. [NODE-APP-004: Danh Bạ Hội Viên](#node-app-004-danh-bạ-hội-viên)
6. [NODE-APP-005: Cơ Hội Giao Thương B2B](#node-app-005-cơ-hội-giao-thương-b2b)
7. [NODE-APP-006: Thống Kê Hoạt Động & Biểu Đồ Realtime](#node-app-006-thống-kê-hoạt-động--biểu-đồ-realtime)
8. [NODE-APP-007: Sàn Giao Thương B2B Marketplace](#node-app-007-sàn-giao-thương-b2b-marketplace)
9. [NODE-APP-008: Sự Kiện & Cuộc Họp CLB](#node-app-008-sự-kiện--cuộc-họp-clb)
10. [NODE-APP-009: Biểu Quyết Trực Tuyến](#node-app-009-biểu-quyết-trực-tuyến)
11. [NODE-APP-010: Bảng Tin Mạng Lưới Moments & Tin Nhắn Trao Đổi](#node-app-010-bảng-tin-mạng-lưới-moments--tin-nhắn-trao-đổi)
12. [NODE-APP-011: Hồ Sơ Cá Nhân & Doanh Nghiệp](#node-app-011-hồ-sơ-cá-nhân--doanh-nghiệp)
13. [NODE-APP-012: Cài Đặt Hệ Thống & Đổi Mật Khẩu](#node-app-012-cài-đặt-hệ-thống--đổi-mật-khẩu)
14. [NODE-APP-013: Ưu Đãi Hội Viên & Điểm Sử Dụng](#node-app-013-ưu-đãi-hội-viên--điểm-sử-dụng)
15. [NODE-APP-014: Cài Đặt Ứng Dụng Màn Hình Chính (PWA)](#node-app-014-cài-đặt-ứng-dụng-màn-hình-chính-pwa)
16. [NODE-APP-015: Hẹn Gặp Kết Nối B2B 1-on-1](#node-app-015-hẹn-gặp-kết-nối-b2b-1-on-1)
17. [NODE-APP-016: Đào Tạo Doanh Nghiệp & Video Call](#node-app-016-đào-tạo-doanh-nghiệp--video-call)
18. [NODE-APP-017: Lịch Hoạt Động CLB](#node-app-017-lịch-hoạt-động-clb)

---

## 1. ĐĂNG NHẬP & QUÊN MẬT KHẨU

### 1.1. Đăng nhập ứng dụng
![Đăng nhập Di động Hội viên](./images/guide_app/00_app_login.png)

- **Tại màn hình Đăng nhập (`https://ceo1983.viconnect.vn/auth`)**:
  - Bước 1: Nhập địa chỉ email vào ô **"Email"** (ví dụ: `vumikasa6@gmail.com`).
  - Bước 2: Nhập mật khẩu vào ô **"Mật khẩu"**.
  - Bước 3: Bấm nút **"Đăng nhập"**.
  - Kết quả: Hệ thống xác thực và chuyển vào màn hình **Trang Chủ**.

### 1.2. Quên mật khẩu
- **Tại màn hình Đăng nhập (`https://ceo1983.viconnect.vn/auth`)**:
  - Bước 1: Bấm vào dòng chữ **"Quên mật khẩu?"** bên dưới ô mật khẩu.
  - Bước 2: Nhập địa chỉ email đã đăng ký tài khoản vào ô **"Email khôi phục"**.
  - Bước 3: Bấm nút **"Gửi yêu cầu cấp lại mật khẩu"**.
  - Kết quả: Hệ thống gửi yêu cầu về Cổng CRM Quản trị và tự động gửi email chứa liên kết thiết lập mật khẩu mới đến hòm thư của bạn.

---

## NODE-APP-001: TRANG CHỦ & TRUNG TÂM THÔNG BÁO

### 1. Mục đích
Theo dõi biểu đồ nến biến động giao thương, sử dụng các phím tắt truy cập nhanh và xem thông báo hệ thống.

### 2. Đường dẫn truy cập
- Trang Chủ: `/association` (Biểu tượng **Trang Chủ** tại thanh điều hướng đáy).
- Trung Tâm Thông Báo: `/association/notifications` (Biểu tượng quả chuông ở góc trên bên phải).
- Cài Đặt Giao Diện Màu Sắc: `/association/system-config`.

### 3. Hình ảnh giao diện
![Trang Chủ Ticker Nến Realtime Mobile](./images/guide_app/01_app_home_ticker.png)
*Hình 1.1: Giao diện Trang Chủ với biểu đồ nến Ticker và các nút chức năng nhanh.*

![Trung Tâm Thông Báo Đa Kênh Hội Viên](./images/guide_app/01_b_app_notifications_center.png)
*Hình 1.2: Trung tâm thông báo hệ thống, lời mời kết nối và sự kiện.*

![Cài Đặt Giao Diện & Bộ Chọn Màu Brandbook](./images/guide_app/01_c_app_theme_switcher_modal.png)
*Hình 1.3: Màn hình chọn màu chủ đề nhận diện thương hiệu.*

### 4. Các bước thao tác
#### a. Xem biểu đồ Ticker nến giao thương:
- Tại màn Trang Chủ: Quan sát đồ thị nến thể hiện giá trị các cơ hội kinh doanh phát sinh theo thời gian thực.
- Bấm vào các nút khung thời gian bên dưới đồ thị: **"1N"** (1 ngày), **"1T"** (1 tuần), **"1Th"** (1 tháng) để xem biến động tương ứng.

#### b. Xem và quản lý thông báo:
- Tại màn Trang Chủ, bấm vào **Biểu tượng Chuông** ở góc trên bên phải để vào màn hình **Thông Báo**.
- Bước 1: Chạm vào thông báo cần xem để mở nội dung chi tiết. Hệ thống tự động đánh dấu thông báo đó chuyển từ trạng thái chưa đọc sang đã đọc (mờ viền đậm và giảm số đếm chuông).
- Bước 2: Bấm nút **"Đã đọc tất cả"** ở góc phải tiêu đề nếu muốn xóa toàn bộ chấm đỏ chưa đọc.

#### c. Đổi màu giao diện thương hiệu:
- Tại màn Trang Chủ, bấm vào biểu tượng bảng màu hoặc truy cập `/association/system-config`.
- Bước 1: Bấm chọn 1 trong 4 màu thương hiệu:
  - Nút **"Đỏ Ruby"**
  - Nút **"Vàng Hoàng Gia"**
  - Nút **"Xanh Doanh Nhân"**
  - Nút **"Cam Tiên Phong"**
- Bước 2: Bấm nút **"Lưu cài đặt"**.
- Kết quả: Toàn bộ nút bấm, thanh điều hướng và viền thẻ chuyển sang màu sắc đã chọn.

---

## NODE-APP-002: THẺ HỘI VIÊN VIP SỐ & QR CÁ NHÂN

### 1. Mục đích
Sử dụng thẻ danh thiếp điện tử thay thế danh thiếp giấy và quét mã QR để kết nối doanh nhân.

### 2. Đường dẫn truy cập
- Route: `/association/card`
- Cách mở: Tại màn Trang Chủ, bấm vào ô **"Thẻ VIP"** hoặc vào mục **Cá Nhân** -> chọn **"Thẻ danh thiếp số"**.

### 3. Hình ảnh giao diện
![Thẻ Hội Viên VIP Số Mobile](./images/guide_app/02_app_vip_card.png)
*Hình 2.1: Thẻ hội viên VIP điện tử với mã QR cá nhân.*

### 4. Các bước thao tác
#### a. Xem và lật mặt thẻ:
- Tại màn Thẻ VIP: Chạm vào mặt thẻ để xoay chuyển giữa Mặt trước (Họ tên, Ảnh đại diện, Chức danh, Tên công ty) và Mặt sau (Mã QR định danh, Mã số hội viên).
- Chạm trực tiếp vào **Mã QR** để phóng to mã phục vụ việc quét mã tại các buổi gặp mặt.

#### b. Cài đặt quyền riêng tư:
- Bên dưới thẻ có 2 công tắc gạt:
  - Gạt công tắc **"Hiển thị số điện thoại"**: Tắt nếu không muốn người quét nhìn thấy số điện thoại.
  - Gạt công tắc **"Hiển thị email"**: Tắt nếu không muốn người quét nhìn thấy địa chỉ email.
- Bấm nút **"Lưu cấu hình thẻ"**.

#### c. Quét mã QR của hội viên khác:
- Bước 1: Bấm nút **"Quét mã QR"** màu đỏ ở cuối màn hình.
- Bước 2: Hướng camera điện thoại về phía mã QR trên thẻ của đối tác.
- Kết quả: Hệ thống tự động mở hồ sơ hội viên đối tác để bạn kết nối.

---

## NODE-APP-003: TRANG QUÉT DANH THIẾP CÔNG KHAI

### 1. Mục đích
Hiển thị danh thiếp của bạn khi người khác quét mã QR mà chưa cài đặt ứng dụng.

### 2. Đường dẫn truy cập
- Route: `/card/$code` (Ví dụ: `https://ceo1983.viconnect.vn/card/CEO1983-000003`).

### 3. Hình ảnh giao diện
![Trang Quét Danh Thiếp Công Khai](./images/guide_app/03_app_public_card.png)
*Hình 3.1: Màn hình danh thiếp công khai hiển thị trên trình duyệt điện thoại.*

### 4. Các bước thao tác
- Bước 1: Người quét mở camera điện thoại quét mã QR trên thẻ của bạn.
- Bước 2: Trình duyệt mở ra trang danh thiếp công khai hiển thị Họ tên, Tên công ty, Chức vụ và Logo.
- Bước 3: Người quét bấm nút **"Lưu vào danh bạ (vCard)"** để tự động tải thông tin danh bạ vào ứng dụng Danh bạ trên điện thoại (iPhone/Android).

---

## NODE-APP-004: DANH BẠ HỘI VIÊN

### 1. Mục đích
Tra cứu thông tin liên hệ của toàn bộ hội viên trong CLB theo họ tên, doanh nghiệp hoặc lĩnh vực ngành nghề.

### 2. Đường dẫn truy cập
- Route: `/association/members`
- Cách mở: Tại màn Trang Chủ, chọn chức năng **"Danh Bạ Hội Viên"**.

### 3. Hình ảnh giao diện
![Danh Bạ Hội Viên Mobile](./images/guide_app/04_app_members_directory.png)
*Hình 4.1: Danh sách hội viên doanh nhân kèm bộ lọc tìm kiếm.*

### 4. Các bước thao tác
#### a. Tìm kiếm hội viên:
- Bước 1: Nhập từ khóa vào ô **"Tìm kiếm theo tên, công ty, ngành nghề..."** (Ví dụ: "Vũ", "Xây dựng", "ViOne").
- Bước 2: Bấm chọn Ban chuyên môn tại thanh cuộn ngang bên dưới (Tất cả, Ban Thành Viên, Ban Sự Kiện, Ban Truyền Thông...).
- Kết quả: Danh sách hội viên phù hợp tự động hiển thị ngay bên dưới.

#### b. Xem chi tiết và liên hệ:
- Bước 1: Chạm vào thẻ của hội viên cần xem.
- Bước 2: Màn hình hiển thị đầy đủ: Ảnh đại diện, Chức danh, Số điện thoại, Email, Giới thiệu công ty.
- Bước 3: Bấm nút **"Gọi điện"**, **"Gửi Email"** hoặc **"Nhắn tin"** để liên hệ trực tiếp.

---

## NODE-APP-005: CƠ HỘI GIAO THƯƠNG B2B

### 1. Mục đích
Đăng tin trao cơ hội kinh doanh hoặc tìm kiếm đối tác cung ứng trong hiệp hội.

### 2. Đường dẫn truy cập
- Route: `/association/opportunities`
- Cách mở: Tại màn Trang Chủ, chọn chức năng **"Cơ Hội Giao Thương"**.

### 3. Hình ảnh giao diện
![Cơ Hội Giao Thương B2B Strip](./images/guide_app/05_app_opportunities_strip.png)
*Hình 5.1: Màn hình cơ hội giao thương B2B.*

### 4. Các bước thao tác
#### a. Đăng cơ hội giao thương mới:
- Tại màn Cơ Hội Giao Thương:
  - Bước 1: Bấm nút **"Đăng cơ hội mới"** ở góc phải màn hình.
  - Bước 2: Nhập các thông tin vào form:
    - Ô **"Tiêu đề cơ hội"**: Nhập tên nhu cầu (ví dụ: "Cần tìm nhà cung cấp nội thất văn phòng 500m2").
    - Ô **"Giá trị dự kiến (VNĐ)"**: Nhập số tiền (ví dụ: `200000000`).
    - Ô **"Nhóm ngành nghề"**: Chọn ngành nghề tương ứng trong danh sách thả xuống.
    - Ô **"Mô tả chi tiết"**: Nhập yêu cầu cụ thể về sản phẩm/dịch vụ.
  - Bước 3: Bấm nút **"Xác nhận đăng"**.
  - Kết quả: Cơ hội hiển thị trên bảng tin giao thương của toàn bộ hội viên.

#### b. Phản hồi cơ hội kinh doanh:
- Bước 1: Chạm vào cơ hội bạn quan tâm trong danh sách.
- Bước 2: Bấm nút **"Nhận kết nối cơ hội"**.
- Kết quả: Hệ thống mở màn hình tin nhắn trực tiếp với người đăng cơ hội.

---

## NODE-APP-006: THỐNG KÊ HOẠT ĐỘNG & BIỂU ĐỒ REALTIME

### 1. Mục đích
Theo dõi các chỉ số giao thương B2B, điểm danh sự kiện, bảng vinh danh Top hội viên kèm tính năng phóng to thu nhỏ và xem chi tiết theo ngày/tuần/tháng/quý/năm.

### 2. Đường dẫn truy cập
- Route: `/association/analytics`
- Cách mở: Chạm vào **Tab 2: Thống Kê** tại thanh điều hướng đáy.

### 3. Hình ảnh giao diện
![Trung Tâm Thống Kê Dashboard](./images/guide_app/06_app_analytics_dashboard.png)
*Hình 6.1: Màn hình Thống kê với biểu đồ nến, thanh Zoom và granular tabs.*

### 4. Các bước thao tác
#### a. Chọn chu kỳ thời gian thống kê:
- Tại hàng nút chu kỳ phía trên biểu đồ, bấm chọn:
  - Nút **"Ngày"**: Xem chi tiết từng ngày trong tháng hiện tại.
  - Nút **"Tuần"**: Xem tổng hợp từng tuần (Tuần 1, Tuần 2, Tuần 3, Tuần 4).
  - Nút **"Tháng"**: Xem dữ liệu các tháng trong năm.
  - Nút **"Quý"**: Xem 4 quý (Q1, Q2, Q3, Q4).
  - Nút **"Năm"**: Xem tổng kết theo các năm.

#### b. Sử dụng công cụ Phóng to / Thu nhỏ (Zoom In / Out) và Vuốt:
- Bước 1: Bấm nút **"+"** (Zoom In) để phóng to biểu đồ (hỗ trợ các mức: 1x, 1.5x, 2x, 2.5x, 3x).
- Bước 2: Bấm nút **"-"** (Zoom Out) để thu nhỏ lại kích thước chuẩn 1x.
- Bước 3: Dùng ngón tay vuốt ngang sang trái/phải trên vùng biểu đồ để xem các mốc ngày/tuần bị ẩn khi phóng to.

#### c. Xem Bục vinh danh Top 3 kết nối:
- Cuộn xuống phần **"Bục Vinh Danh Top Hội Viên"**: Quan sát vị trí Top 1 (Vàng), Top 2 (Bạc), Top 3 (Đồng) căn cứ theo tổng giá trị giao dịch và số lượng lời mời kết nối thành công.

---

## NODE-APP-007: SÀN GIAO THƯƠNG B2B MARKETPLACE

### 1. Mục đích
Quảng bá và giới thiệu các sản phẩm, dịch vụ tiêu biểu của doanh nghiệp hội viên (mỗi doanh nghiệp tối đa 5 sản phẩm tiêu biểu).

### 2. Đường dẫn truy cập
- Route: `/association/products`
- Cách mở: Chạm vào **Tab 3: Sàn B2B** tại thanh điều hướng đáy.

### 3. Hình ảnh giao diện
![Sàn Giao Thương B2B Marketplace](./images/guide_app/07_app_marketplace_products.png)
*Hình 7.1: Sàn trưng bày sản phẩm doanh nghiệp thành viên.*

### 4. Các bước thao tác
#### a. Đăng bán sản phẩm mới:
- Bước 1: Bấm nút **"Thêm sản phẩm"** ở đầu trang.
- Bước 2: Nhập thông tin sản phẩm:
  - Ô **"Tên sản phẩm / dịch vụ"**: Nhập tên chính xác.
  - Ô **"Giá bán (VNĐ)"**: Nhập đơn giá hoặc ghi 0 nếu là giá thỏa thuận.
  - Ô **"Ưu đãi cho hội viên CEO 1983 (%)"**: Nhập % giảm giá dành riêng cho hội viên (ví dụ: `15`).
  - Nút **"Chọn ảnh"**: Tải lên ảnh sản phẩm từ thư viện điện thoại.
  - Ô **"Mô tả sản phẩm"**: Nhập chi tiết tính năng, quy cách.
- Bước 3: Bấm nút **"Lưu sản phẩm"**.
- Kết quả: Sản phẩm hiển thị trên Sàn giao thương B2B.

#### b. Tìm kiếm và gửi báo giá:
- Bước 1: Nhập tên sản phẩm vào ô tìm kiếm hoặc chọn danh mục hàng hóa.
- Bước 2: Chạm vào sản phẩm cần mua để xem chi tiết.
- Bước 3: Bấm nút **"Gửi yêu cầu báo giá"** hoặc **"Liên hệ người bán"**.

---

## NODE-APP-008: SỰ KIỆN & CUỘC HỌP CLB

### 1. Mục đích
Đăng ký tham dự các sự kiện lớn, cuộc họp giao ban của CLB, lấy vé điện tử và mã QR điểm danh check-in.

### 2. Đường dẫn truy cập
- Route: `/association/events`
- Cách mở: Tại màn Trang Chủ, chọn chức năng **"Sự Kiện & Cuộc Họp"**.

### 3. Hình ảnh giao diện
![Sự Kiện & Cuộc Họp CLB](./images/guide_app/08_app_events_and_meetings.png)
*Hình 8.1: Danh sách các sự kiện và cuộc họp sắp diễn ra.*

![Vé Điện Tử & Mã QR Check-in](./images/guide_app/08_b_app_event_ticket_qr_modal.png)
*Hình 8.2: Vé điện tử với mã QR check-in vào cửa sự kiện.*

### 4. Các bước thao tác
#### a. Đăng ký tham gia sự kiện:
- Bước 1: Chọn tab **"Sự kiện"** hoặc **"Cuộc họp"**.
- Bước 2: Chạm vào sự kiện muốn tham dự để xem Thời gian, Địa điểm, Sơ đồ chỗ ngồi và Danh sách khách mời.
- Bước 3: Bấm nút **"Đăng ký tham gia"**.
- Kết quả: Hệ thống xác nhận và cấp cho bạn 1 Vé điện tử.

#### b. Lấy vé điện tử và quét mã QR check-in:
- Bước 1: Tại thẻ sự kiện đã đăng ký, bấm nút **"Xem vé của tôi"**.
- Bước 2: Màn hình mở ra Vé điện tử gồm: Tên sự kiện, Họ tên người tham dự, Số ghế và Mã QR check-in.
- Bước 3: Đưa mã QR này cho Ban Lễ Tân quét tại cửa vào hội trường để xác nhận điểm danh.

---

## NODE-APP-009: BIỂU QUYẾT TRỰC TUYẾN

### 1. Mục đích
Tham gia bỏ phiếu, biểu quyết các nghị quyết, bầu cử Ban Chấp Hành hoặc tham gia vòng quay may mắn trong các kỳ họp đại hội.

### 2. Đường dẫn truy cập
- Route: `/association/voting`
- Cách mở: Tại màn Trang Chủ, chọn chức năng **"Biểu Quyết"**.

### 3. Hình ảnh giao diện
![Biểu Quyết Trực Tuyến](./images/guide_app/09_app_voting_online.png)
*Hình 9.1: Màn hình danh sách các câu hỏi biểu quyết.*

### 4. Các bước thao tác
- Bước 1: Chạm vào phiên biểu quyết đang mở có nhãn màu xanh **"Đang diễn ra"**.
- Bước 2: Đọc kỹ nội dung nghị quyết và tích chọn 1 trong các phương án:
  - Chọn nút tròn: **"Đồng ý"**
  - Chọn nút tròn: **"Không đồng ý"**
  - Chọn nút tròn: **"Ý kiến khác / Trắng"**
- Bước 3: Bấm nút **"Gửi phiếu biểu quyết"**.
- Kết quả: Hệ thống ghi nhận kết quả và hiển thị tỷ lệ % biểu quyết realtime.

---

## NODE-APP-010: BẢNG TIN MẠNG LƯỚI MOMENTS & TIN NHẮN TRAO ĐỔI

### 1. Mục đích
Chia sẻ hình ảnh hoạt động, khoảnh khắc giao lưu doanh nghiệp và nhắn tin trao đổi 1-on-1 giữa các hội viên.

### 2. Đường dẫn truy cập
- Route: `/association/messages`
- Cách mở: Chạm vào **Tab 4: Mạng Lưới** tại thanh điều hướng đáy.

### 3. Hình ảnh giao diện
![Bảng Tin Mạng Lưới Moments](./images/guide_app/10_app_moments_feed.png)
*Hình 10.1: Bảng tin chia sẻ hình ảnh và bài viết của hội viên.*

![Tin Nhắn Trao Đổi 1-on-1](./images/guide_app/10_b_app_messages_chat_1on1.png)
*Hình 10.2: Khung chat tin nhắn trực tiếp giữa 2 doanh nhân.*

### 4. Các bước thao tác
#### a. Đăng bài viết chia sẻ khoảnh khắc:
- Bước 1: Tại màn Mạng Lưới, bấm vào ô **"Bạn đang nghĩ gì? Chia sẻ khoảnh khắc..."** ở đầu trang.
- Bước 2: Nhập nội dung bài viết và bấm biểu tượng máy ảnh để chọn hình ảnh đính kèm.
- Bước 3: Bấm nút **"Đăng bài"**.

#### b. Nhắn tin trao đổi 1-on-1:
- Bước 1: Bấm vào biểu tượng bong bóng chat hoặc chọn nút **"Nhắn tin"** trên thẻ của một hội viên.
- Bước 2: Nhập nội dung tin nhắn vào ô soạn thảo ở cuối màn hình.
- Bước 3: Bấm nút **"Gửi"** (Biểu tượng mũi tên).
- *Thao tác với tin nhắn đã gửi*: Chạm vào biểu tượng dấu 3 chấm (`...`) trên bong bóng chat để chọn:
  - **"Chỉnh sửa"**: Sửa lại nội dung tin nhắn vừa gửi.
  - **"Thu hồi tin nhắn"**: Thu hồi tin nhắn đối với cả 2 phía.
  - **"Xóa ở phía tôi"**: Xóa tin nhắn khỏi màn hình của bạn.
  - *Lưu ý*: Menu tùy chọn này tự động nhận diện vị trí và mở chúc xuống dưới nếu chạm gần header để không che khuất màn hình.

---

## NODE-APP-011: HỒ SƠ CÁ NHÂN & DOANH NGHIỆP

### 1. Mục đích
Xem và cập nhật thông tin cá nhân, logo doanh nghiệp, lĩnh vực kinh doanh và theo dõi tình trạng hội phí niên liễm.

### 2. Đường dẫn truy cập
- Route: `/association/profile`
- Cách mở: Chạm vào **Tab 5: Cá Nhân** tại thanh điều hướng đáy.

### 3. Hình ảnh giao diện
![Hồ Sơ Cá Nhân & Doanh Nghiệp](./images/guide_app/11_app_profile_view.png)
*Hình 11.1: Màn hình quản lý hồ sơ cá nhân và doanh nghiệp.*

### 4. Các bước thao tác
#### a. Cập nhật thông tin cá nhân:
- Bước 1: Tại màn Cá Nhân, bấm nút **"Chỉnh sửa hồ sơ"**.
- Bước 2: Thay đổi thông tin tại các ô:
  - Ô **"Họ và tên"**
  - Ô **"Số điện thoại"**
  - Ô **"Chức vụ tại doanh nghiệp"**
  - Nút **"Thay đổi ảnh đại diện"**: Chọn ảnh chân dung mới từ máy điện thoại.
- Bước 3: Bấm nút **"Lưu thay đổi"**.

#### b. Xem tình trạng hội phí niên liễm:
- Quan sát khối thẻ **"Tình trạng Hội Phí"**:
  - Nhãn xanh **"Đã hoàn thành niên liễm 2026"**: Hội viên đang hoạt động chuẩn.
  - Nhãn đỏ **"Đến hạn đóng phí"**: Kèm theo nút **"Đóng phí qua VietQR"** để thanh toán trực tiếp.

---

## NODE-APP-012: CÀI ĐẶT HỆ THỐNG & ĐỔI MẬT KHẨU

### 1. Mục đích
Thiết lập các thông số tài khoản, đổi mật khẩu đăng nhập định kỳ và tùy chọn nhận thông báo.

### 2. Đường dẫn truy cập
- Route: `/association/settings`
- Cách mở: Tại màn Cá Nhân, chọn mục **"Cài đặt hệ thống"**.

### 3. Hình ảnh giao diện
![Cài Đặt Hệ Thống & Đổi Mật Khẩu](./images/guide_app/12_app_settings.png)
*Hình 12.1: Màn hình Cài đặt hệ thống và bảo mật tài khoản.*

### 4. Các bước thao tác
#### a. Đổi mật khẩu:
- Bước 1: Chọn mục **"Đổi mật khẩu"**.
- Bước 2: Nhập thông tin vào 3 ô:
  - Ô **"Mật khẩu hiện tại"**: Nhập mật khẩu bạn đang dùng.
  - Ô **"Mật khẩu mới"**: Nhập mật khẩu mới (tối thiểu 6 ký tự).
  - Ô **"Xác nhận mật khẩu mới"**: Nhập lại chính xác mật khẩu mới.
- Bước 3: Bấm nút **"Cập nhật mật khẩu"**.
- Kết quả: Hệ thống lưu mật khẩu mới và thông báo cập nhật thành công.

#### b. Đăng xuất:
- Cuộn xuống cuối màn hình, bấm nút màu đỏ **"Đăng xuất"** để thoát tài khoản trên thiết bị.

---

## NODE-APP-013: ƯU ĐÃI HỘI VIÊN & ĐIỂM SỬ DỤNG

### 1. Mục đích
Khám phá và nhận các voucher, chính sách chiết khấu ưu đãi chéo giữa các doanh nghiệp trong CLB CEO 1983.

### 2. Đường dẫn truy cập
- Route: `/association/perks`
- Cách mở: Tại màn Trang Chủ, chọn chức năng **"Ưu Đãi Đặc Quyền"**.

### 3. Hình ảnh giao diện
![Ưu Đãi Hội Viên & Điểm Sử Dụng](./images/guide_app/13_app_perks_benefits.png)
*Hình 13.1: Danh sách các chính sách ưu đãi dành riêng cho hội viên.*

### 4. Các bước thao tác
- Bước 1: Duyệt danh sách các gói ưu đãi (Nhà hàng, Khách sạn, Dịch vụ xe, Tư vấn luật, Phần mềm...).
- Bước 2: Bấm vào ưu đãi bạn muốn sử dụng để xem điều kiện và thời hạn áp dụng.
- Bước 3: Bấm nút **"Nhận mã ưu đãi"**: Hệ thống hiển thị mã voucher hoặc mã QR để bạn xuất trình khi sử dụng dịch vụ tại đơn vị đối tác.

---

## NODE-APP-014: CÀI ĐẶT ỨNG DỤNG MÀN HÌNH CHÍNH (PWA)

### 1. Mục đích
Đưa ứng dụng ra màn hình chính của điện thoại để truy cập nhanh như một ứng dụng nguyên bản mà không cần vào kho ứng dụng App Store hay Google Play.

### 2. Các bước thực hiện
#### a. Trên điện thoại iPhone (Trình duyệt Safari):
- Bước 1: Mở Safari và truy cập địa chỉ `https://ceo1983.viconnect.vn`.
- Bước 2: Bấm vào **Biểu tượng Chia sẻ** (Hình vuông có mũi tên chỉ lên ở thanh đáy trình duyệt).
- Bước 3: Cuộn xuống và chọn dòng **"Thêm vào MH chính"** (Add to Home Screen).
- Bước 4: Bấm nút **"Thêm"** (Add) ở góc trên bên phải.
- Kết quả: Biểu tượng ứng dụng **CEO 1983** xuất hiện trên màn hình chính của iPhone.

#### b. Trên điện thoại Android (Trình duyệt Chrome):
- Bước 1: Mở Chrome và truy cập địa chỉ `https://ceo1983.viconnect.vn`.
- Bước 2: Bấm vào **Biểu tượng 3 dấu chấm dọc** ở góc trên bên phải trình duyệt.
- Bước 3: Chọn dòng **"Cài đặt ứng dụng"** hoặc **"Thêm vào Màn hình chính"**.
- Bước 4: Bấm nút **"Cài đặt"** (Install) trên hộp thoại xác nhận.
- Kết quả: Ứng dụng tự động được cài đặt và xuất hiện trên danh sách ứng dụng điện thoại.

---

## NODE-APP-015: HẸN GẶP KẾT NỐI B2B 1-ON-1

### 1. Mục đích
Đặt lịch hẹn gặp trực tiếp hoặc trực tuyến 1-on-1 giữa 2 doanh nhân để tìm hiểu sâu về sản phẩm và cơ hội hợp tác kinh doanh.

### 2. Đường dẫn truy cập
- Route: `/association/connect`
- Cách mở: Tại màn Trang Chủ, chọn chức năng **"Hẹn Gặp 1-on-1"**.

### 3. Hình ảnh giao diện
![Hẹn Gặp Kết Nối B2B 1-on-1](./images/guide_app/14_app_b2b_connect.png)
*Hình 15.1: Màn hình đặt lịch hẹn gặp gỡ giao thương.*

### 4. Các bước thao tác
- Bước 1: Bấm nút **"Tạo lịch hẹn 1-on-1"**.
- Bước 2: Nhập thông tin lịch hẹn:
  - Ô **"Hội viên muốn gặp"**: Chọn tên đối tác trong danh sách.
  - Ô **"Thời gian hẹn"**: Chọn ngày và giờ gặp mặt.
  - Ô **"Địa điểm"**: Nhập địa chỉ quán cafe / văn phòng hoặc chọn họp trực tuyến.
  - Ô **"Mục đích buổi gặp"**: Nhập nội dung trao đổi chính.
- Bước 3: Bấm nút **"Gửi lời mời hẹn gặp"**.
- Kết quả: Lời mời được gửi đến trung tâm thông báo của hội viên được mời.

---

## NODE-APP-016: ĐÀO TẠO DOANH NGHIỆP & VIDEO CALL

### 1. Mục đích
Xem các video khóa học, tài liệu chia sẻ kinh nghiệm quản trị doanh nghiệp và tham gia các phòng họp trực tuyến qua video call.

### 2. Đường dẫn truy cập
- Route: `/association/training`
- Cách mở: Tại màn Trang Chủ, chọn chức năng **"Đào Tạo & Khóa Học"**.

### 3. Hình ảnh giao diện
![Đào Tạo Doanh Nghiệp & Video Call](./images/guide_app/15_app_training.png)
*Hình 16.1: Thư viện khóa học đào tạo và phòng họp video trực tuyến.*

### 4. Các bước thao tác
#### a. Xem tài liệu đào tạo:
- Bước 1: Chọn chuyên đề muốn học (Quản trị nhân sự, Tài chính doanh nghiệp, Marketing số...).
- Bước 2: Chạm vào bài học để xem video trực tiếp hoặc tải file tài liệu đính kèm (PDF, Slide).

#### b. Tham gia phòng họp trực tuyến Video Call:
- Bước 1: Chọn phòng họp có nhãn màu xanh **"Đang mở"**.
- Bước 2: Bấm nút **"Tham gia phòng họp"**.
- Kết quả: Ứng dụng tự động kết nối camera và micro để bạn tham gia họp trực tuyến.

---

## NODE-APP-017: LỊCH HOẠT ĐỘNG CLB

### 1. Mục đích
Theo dõi toàn bộ lịch trình công tác, lịch họp ban chấp hành, lịch thăm doanh nghiệp hội viên và các ngày kỷ niệm trong tháng.

### 2. Đường dẫn truy cập
- Route: `/association/calendar`
- Cách mở: Tại màn Trang Chủ, chọn chức năng **"Lịch Hoạt Động"**.

### 3. Hình ảnh giao diện
![Lịch Hoạt Động CLB](./images/guide_app/16_app_calendar.png)
*Hình 17.1: Lịch tháng hiển thị các hoạt động của CLB CEO 1983.*

### 4. Các bước thao tác
- Bước 1: Quan sát giao diện lịch dạng bảng tháng. Các ngày có sự kiện được đánh dấu bằng chấm tròn màu đỏ hoặc màu vàng.
- Bước 2: Chạm vào một ngày bất kỳ trên lịch.
- Bước 3: Danh sách các hoạt động trong ngày đó hiển thị chi tiết ngay bên dưới (Khung giờ, Tên hoạt động, Thành phần tham gia, Địa điểm).
- Bước 4: Bấm nút **"Thêm vào Lịch điện thoại"** nếu muốn đồng bộ lịch trình vào Google Calendar hoặc Apple Calendar.
