# TÀI LIỆU ĐẶC TẢ PHÂN HỆ 04: GIAO THƯƠNG B2B, CHIA SẺ CƠ HỘI, SÀN THƯƠNG MẠI & TỰ ĐỘNG GỬI TIN NHẮN
**Hệ thống:** Cổng Quản Trị Web CRM & Mobile App CLB Doanh Nhân CEO 1983 (HanoiBA)  
**Phiên bản:** 8.0 — Cập nhật chuẩn hóa Kiến trúc & Dữ liệu thực nghiệm  
**Mã phân hệ:** `[SUB-SPEC-04]` (Ánh xạ `[NODE-APP-002]`, `[NODE-APP-003]`, `[NODE-APP-006]`)

---

## 1. TỔNG QUAN NGHIỆP VỤ (BUSINESS REQUIREMENTS - BRD)
### 1.1. Mục tiêu nghiệp vụ
- Xây dựng sàn giao thương nội bộ B2B độc quyền dành riêng cho các doanh nghiệp hội viên sinh năm 1983:
  - Chia sẻ cơ hội kinh doanh (Bên mua / Bên bán / Tìm đối tác liên doanh).
  - Trưng bày sản phẩm, giải pháp công nghệ và dịch vụ với chính sách giá ưu đãi đặc quyền cho hội viên CLB.
  - Tự động hóa hoàn toàn quy trình đặt lịch hẹn kết nối 1-on-1: Khi một hội viên thiết lập lịch gặp, hệ thống tự động gửi tin nhắn cho người trao cơ hội và người đồng ý lịch hẹn qua 3 kịch bản thực tế.

---

## 2. ĐẶC TẢ YÊU CẦU PHẦN MỀM (SOFTWARE REQUIREMENTS - SRS)
### 2.1. Yêu cầu chức năng Cơ Hội Kinh Doanh (B2B Opportunities)
- **FR-04.1 (Định dạng & Bóc tách Tiền tệ Chuẩn Việt Nam)**:
  - Khắc phục triệt để lỗi parse dấu chấm phân tách hàng nghìn (ví dụ `2.000.000.000 đ` không bao giờ bị hiểu sai thành `2` hay `Thỏa thuận B2B`).
  - Hàm `parseVnNumber()` xử lý thông minh các định dạng số tiền hàng tỷ, hàng triệu đồng và hiển thị chuẩn: `2 Tỷ VNĐ`, `500 Triệu VNĐ`.
- **FR-04.2 (Phản hồi Dữ liệu Real-time khi Tạo / Sửa / Xóa)**:
  - Triển khai `localOpps` reactive state: Khi sửa thông tin cơ hội, giao diện cập nhật ngay lập tức không cần đợi F5 hoặc tải lại trang.
- **FR-04.3 (Xem Minh Chứng & Dẫn Chứng Thương Vụ)**:
  - Cho phép người dùng chạm vào các ô thẻ chỉ số giao thương để mở Modal xem danh sách dẫn chứng và chi tiết các thương vụ đã khớp nối thành công.

### 2.2. Yêu cầu chức năng Sàn Thương Mại & Sản Phẩm (Marketplace & Products)
- **FR-04.4 (Cập nhật Sản Phẩm & Giá Niêm Yết)**:
  - Cập nhật đúng các trường `price`, `original_price`, `member_price` và mảng ảnh `image_urls` định dạng PostgreSQL `text[]`.
  - Hỗ trợ bí danh API `@Patch('products/:id')` và `@Put(':id')` đảm bảo đồng bộ hoàn hảo giữa CRM và App.

### 2.3. Tự động hóa Tin nhắn Cuộc hẹn B2B (3 Case Bắt Buộc)
- **FR-04.5 (Kịch bản 1: Tự thiết lập tại phân hệ Kết nối B2B)**:
  - Khi hội viên chọn đối tác tại `/association/connect` và gửi yêu cầu gặp mặt, Backend tự động sinh tin nhắn cuộc hẹn trong hộp thư riêng tư của cả 2 bên.
- **FR-04.6 (Kịch bản 2: Thiết lập từ Chia sẻ Cơ hội kinh doanh)**:
  - Khi xem một cơ hội B2B tại `/association/opportunities`, bấm "Lên lịch gặp" sẽ tự động tạo cuộc họp và gửi tin nhắn xác nhận kèm tiêu đề cơ hội đến người đăng.
- **FR-04.7 (Kịch bản 3: Thiết lập từ Sàn thương mại sản phẩm)**:
  - Tại trang chi tiết sản phẩm `/association/products`, bấm "Đặt lịch hẹn B2B" sẽ tự động gửi tin nhắn đàm phán hợp tác thương mại vào hộp thư của chủ doanh nghiệp sở hữu sản phẩm.
- **FR-04.8 (Tin nhắn xác nhận khi Đồng ý Lên Lịch Gặp)**:
  - Khi bên nhận bấm "Chấp thuận cuộc hẹn", hệ thống tự động bắn tin nhắn xác nhận lịch gặp (kèm thời gian, địa điểm, hình thức gặp Zoom/trực tiếp) vào hộp chat của cả hai người.

