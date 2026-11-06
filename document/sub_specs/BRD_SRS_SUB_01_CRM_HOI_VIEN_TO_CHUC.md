# TÀI LIỆU ĐẶC TẢ PHÂN HỆ 01: QUẢN TRỊ HỘI VIÊN, TỔ CHỨC & RBAC PHÂN QUYỀN
**Hệ thống:** Cổng Quản Trị Web CRM & Mobile App CLB Doanh Nhân CEO 1983 (HanoiBA)  
**Phiên bản:** 8.0 — Cập nhật chuẩn hóa Kiến trúc & Dữ liệu thực nghiệm  
**Mã phân hệ:** `[SUB-SPEC-01]` (Ánh xạ `[NODE-CRM-001]`, `[NODE-CRM-004]`, `[NODE-CORE-001]`)

---

## 1. TỔNG QUAN NGHIỆP VỤ (BUSINESS REQUIREMENTS - BRD)
### 1.1. Mục tiêu nghiệp vụ
- Xây dựng kho dữ liệu số hóa 360 độ về hồ sơ doanh nhân hội viên sinh năm 1983 trực thuộc Hội Doanh nghiệp Trẻ Hà Nội (HanoiBA).
- Quản trị quy trình vòng đời hội viên: Đăng ký gia nhập trực tuyến (qua Zalo Mini App / Web Form) -> Thẩm định & Phê duyệt của Ban Thư Ký / Ban Chấp Hành -> Cấp mã hội viên duy nhất (`CEO1983-xxx`) -> Thu hội phí thường niên -> Cấp thẻ điện tử & Phân quyền truy cập.

### 1.2. Các bên liên quan (Stakeholders & Actors)
1. **Chủ tịch & Ban Điều Hành CLB**: Xem báo cáo biến động nhân sự, phê duyệt kết nạp ủy viên BCH.
2. **Ban Thư Ký / Quản trị viên CRM**: Tiếp nhận hồ sơ, đối soát giấy phép kinh doanh, duyệt hồ sơ 1-click và cấp tài khoản tự động.
3. **Hội viên Doanh nhân**: Quản lý hồ sơ năng lực doanh nghiệp, nhận diện thương hiệu, tạo danh thiếp số cá nhân.

---

## 2. ĐẶC TẢ YÊU CẦU PHẦN MỀM (SOFTWARE REQUIREMENTS - SRS)
### 2.1. Yêu cầu chức năng (Functional Requirements)
- **FR-01.1 (Duyệt kết nạp & Cấp tài khoản tự động)**:
  - Khi hồ sơ đăng ký mới gửi từ Web/Zalo Mini App, hệ thống hiển thị trạng thái `Chờ duyệt`.
  - Quản trị viên bấm `Duyệt & Cấp Tài Khoản`, Backend NestJS tự động sinh chuỗi mật khẩu ngẫu nhiên an toàn, kích hoạt tài khoản `vione_users` và gửi email thông báo kết nạp chứa thông tin đăng nhập.
- **FR-01.2 (Ma trận Phân quyền Vai trò RBAC 3 Cấp)**:
  - Cấp 1 (`SUPER_ADMIN` / Chủ tịch CLB): Toàn quyền truy cập mọi phân hệ, cấu hình hệ thống và quản trị tài chính.
  - Cấp 2 (`BOARD_MEMBER` / Ủy viên BCH & Trưởng Ban): Quản trị sự kiện, phê duyệt cơ hội giao thương, xem báo cáo thống kê chuyên môn.
  - Cấp 3 (`MEMBER` / Hội viên Doanh nhân): Truy cập Mobile App hội viên, cập nhật thông tin doanh nghiệp, giao thương và kết nối.
- **FR-01.3 (Quản trị Ban Chuyên Môn & Chức Vụ)**:
  - Gán hội viên vào các ban: Ban Xúc Tiến Thương Mại, Ban Đào Tạo & Chuyển Đổi Số, Ban Thành Viên, Ban Truyền Thông, Ban Tài Chính.

### 2.2. Thiết kế Cơ sở dữ liệu (PostgreSQL)
- Bảng `public.vione_users`: Lưu trữ thông tin tài khoản đăng nhập (`id UUID`, `email`, `password_hash`, `role`, `status`).
- Bảng `public.members`: Lưu trữ hồ sơ hội viên doanh nghiệp (`id`, `code`, `name`, `company_name`, `phone`, `email`, `industry`, `executive_role`, `department`, `fee_paid`, `status`, `user_id`).
- Bảng `public.associations`: Lưu trữ thông tin định danh CLB CEO 1983 (`id: c1983000-0000-4000-8000-000000001983`).

