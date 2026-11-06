# TÀI LIỆU ĐẶC TẢ PHÂN HỆ 03: TÍCH HỢP NỀN TẢNG ĐA KÊNH, ĐĂNG BÀI 1-CLICK & ZALO MINI APP
**Hệ thống:** Cổng Quản Trị Web CRM & Mobile App CLB Doanh Nhân CEO 1983 (HanoiBA)  
**Phiên bản:** 8.0 — Cập nhật chuẩn hóa Kiến trúc & Dữ liệu thực nghiệm  
**Mã phân hệ:** `[SUB-SPEC-03]` (Ánh xạ `[NODE-CRM-021]`, `[NODE-CRM-010]`)

---

## 1. TỔNG QUAN NGHIỆP VỤ (BUSINESS REQUIREMENTS - BRD)
### 1.1. Mục tiêu nghiệp vụ
- Xóa bỏ rào cản thao tác thủ công khi truyền thông sự kiện, cuộc họp và thông báo của CLB: Người quản trị CRM không cần phải copy nội dung rồi mở từng ứng dụng Facebook, Zalo, Website để paste bài.
- Cho phép cấu hình các liên kết mạng xã hội chính thức của CLB (Link Hội nhóm Facebook, Link Fanpage, Link Nhóm Zalo, Cổng thông tin Website) và lưu trữ bền vững vào CSDL.
- Cung cấp tính năng **Đăng bài 1-Click (1-Click Auto Post)**: Bấm 1 nút duy nhất là hệ thống tự động phân phối bài viết chuẩn OpenGraph lên tất cả các kênh và hiển thị đường dẫn bài viết trực tiếp.
- Vận hành phân hệ cấu hình Zalo Mini App đồng bộ dữ liệu hội viên hai chiều.

---

## 2. ĐẶC TẢ YÊU CẦU PHẦN MỀM (SOFTWARE REQUIREMENTS - SRS)
### 2.1. Cấu hình Trường Thông Tin Đa Nền Tảng (Platform Integration Hub)
- **FR-03.1 (Các trường thông tin cấu hình Facebook)**:
  - `fbGroupUrl`: Đường dẫn Hội nhóm Facebook CLB (ví dụ: `https://facebook.com/groups/clbdoanhnhanceo1983`).
  - `fbGroupId`: Group ID tiếp nhận bài viết.
  - `fbPageUrl`: Đường dẫn Fanpage chính thức CLB.
  - `fbPageId`: Page ID Fanpage.
  - `fbAccessToken`: Facebook Graph API Access Token (quyền `pages_manage_posts`, `publish_to_groups`).
- **FR-03.2 (Các trường thông tin cấu hình Zalo)**:
  - `zaloGroupUrl`: Đường dẫn Nhóm Zalo chính thức CLB CEO 1983 (ví dụ: `https://zalo.me/g/clbceo1983hanoiba`).
  - `zaloCommunityUrl`: Link Cộng đồng Zalo Official.
  - `zaloOaId`: Zalo Official Account ID.
  - `zaloSecretKey`: Secret Key của Zalo OA.
  - `zaloTemplateId`: Mã Template ZNS gửi thông báo.
- **FR-03.3 (Các trường thông tin cấu hình Website)**:
  - `webPortalUrl`: Link Trang chủ cổng thông tin (ví dụ: `https://ceo1983.com`).
  - `webEventsUrl`: Link Chuyên mục Sự kiện (ví dụ: `https://ceo1983.com/su-kien`).
  - `webEndpoint`: API Webhook tiếp nhận bài viết (`https://ceo1983.com/api/v1/syndication`).
  - `webApiKey`: Khóa bảo mật API Key.

### 2.2. Quy trình & Cơ chế Đăng Bài 1-Click (1-Click Auto Post Workflow)
- **FR-03.4 (Lựa chọn nội dung & Xem trước đa kênh)**:
  - Quản trị viên chọn loại bài đăng: Sự kiện CLB, Lịch họp Ban / BCH, hoặc Bản tin Giao thương.
  - Hệ thống tự động điền sẵn Tiêu đề, Thời gian, Địa điểm, Tóm tắt và Link tham gia.
  - Cho phép tích chọn các kênh tiếp nhận (Hội nhóm Facebook, Nhóm Zalo, Website).
- **FR-03.5 (Thực thi Call API Đồng loạt & Lưu Lịch sử)**:
  - Gọi endpoint Backend `POST /syndication/publish`.
  - Backend thực thi phân phối đồng thời qua HTTP/API tới các dịch vụ.
  - Lưu bản ghi phát hành vào `public.app_settings` (key `crm_syndication_broadcast_history`).
  - Trả về danh sách liên kết trực tiếp để quản trị viên có thể bấm vào xem ngay bài viết trên Hội nhóm Facebook, Nhóm Zalo và Website.

### 2.3. Cấu hình Zalo Mini App
- **FR-03.6 (Đồng bộ Cấu hình Zalo Mini App vào CSDL PostgreSQL)**:
  - API `GET /zalo/miniapp/config` & `POST /zalo/miniapp/config` đọc và ghi vào bảng `public.app_settings`.
  - Hỗ trợ kiểm tra sức khỏe kết nối (`POST /zalo/miniapp/check-health`) phản hồi trạng thái hoạt động thực tế.

