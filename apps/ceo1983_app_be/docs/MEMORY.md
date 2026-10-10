# BACKEND ARCHITECTURE MEMORY - CEO 1983 PROJECT
## Phân Hệ: Backend API NestJS (`apps/ceo1983_app_be`)

---

### 1. Lịch Sử Các Quyết Định Kiến Trúc Trọng Yếu (Architectural Decisions)
1. **Chuyển Đổi Triệt Để Khỏi Supabase**:
   - Toàn bộ cơ sở dữ liệu và xác thực được chuyển giao 100% sang PostgreSQL nội bộ kết nối qua Prisma ORM và NestJS API Gateway.
   - Triệt tiêu hoàn toàn sự phụ thuộc vào các dịch vụ đám mây bên thứ ba không kiểm soát được.
2. **Bóc Tách "God Service" `connect-app.service.ts` (Hiệp 2)**:
   - Tệp monolith ban đầu có quy mô khổng lồ **12.973 dòng**.
   - Đã được phân rã thành **12 Specialized Domain Services** độc lập trong `apps/ceo1983_app_be/src/connect-app/services/` với tổng dung lượng 11.544 dòng:
     * `ConnectMomentsService`: Khoảnh khắc, tương tác, album, hashtag.
     * `ConnectMessengerService`: Luồng chat 1-1, emoji reaction, trích dẫn.
     * `ConnectNfcService`: Quản lý định danh và thiết bị thẻ NFC.
     * `ConnectOpportunityService`: Cơ hội giao thương B2B, deal CRM.
     * `ConnectMarketplaceService`: Chợ sản phẩm, báo giá VIP.
     * `ConnectCustomerService`: Danh bạ khách hàng danh thiếp CRM.
     * `ConnectCardScanService`: Quét OCR danh thiếp bằng AI Vision.
     * `ConnectIdentityService`: Hồ sơ doanh nhân, trang xác thực `/verify`.
     * `ConnectCommunityService`: Nhóm chuyên môn, sự kiện nhóm.
     * `ConnectContentService`: Tin tức xuất bản, quyền lợi hội viên (Perks).
     * `ConnectPublicRegistrationService`: Đăng ký tham gia hiệp hội công khai.
     * `ConnectNetworkService`: Gợi ý kết nối thông minh, ma trận đối tác.
   - Tệp `connect-app.service.ts` chính được thu gọn còn **2.190 dòng (giảm 76%)** đóng vai trò Facade Orchestrator, bảo toàn 100% chữ ký phương thức cho 13 NestJS Controllers.
3. **Chuẩn Hóa Phân Quyền Staging & RESTful Sync**:
   - Cung cấp API `PUT /api/admin/member-permissions` lưu cấu hình phân quyền vào `public.app_settings` (key `vba_member_permissions`).
   - Lọc sạch toàn bộ tài khoản `pending` / `inactive` khỏi các chỉ số phân quyền.
4. **Hệ Thống Bốc Thăm & Gói Tài Trợ Động**:
   - Lưu trữ giải thưởng vào bảng `public.event_prizes`.
   - Kết nối trực tiếp giữa giải thưởng bốc thăm với sản phẩm trong `public.products` và gói tài trợ trong `public.sponsor_packages`.

---

### 2. Các Lưu Ý Kỹ Thuật (Gotchas)
- **Chuẩn hóa ID**: Dùng UUID kiểu `String` trong toàn bộ code NestJS để tránh xung đột kiểu `BigInt` vs `String`.
- **Múi giờ**: Thời gian trong CSDL lưu chuẩn UTC ISO-8601 (`toISOString()`), khi xuất sang frontend hiển thị qua tiện ích định dạng UTC+7.
- **Upload File**: Endpoint `uploadFileToNest` lưu vào MinIO S3 bucket `opportunities`, `products`, `avatars`, `tasks` và trả về URL chuẩn hóa.
