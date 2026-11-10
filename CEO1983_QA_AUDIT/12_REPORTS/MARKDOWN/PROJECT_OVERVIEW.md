# TỔNG QUAN HỆ THỐNG & ĐẶC TẢ KIẾN TRÚC CEO 1983
## HỆ THỐNG CLB DOANH NHÂN CEO 1983 (TRỰC THUỘC HANOIBA)
*Phiên bản: 10.98 | Đơn vị kiểm toán: Independent Software QA & Audit Team*

---

### 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG
Hệ thống CLB Doanh Nhân CEO 1983 được thiết kế theo kiến trúc tách biệt đa phân hệ:
1. **Web CRM Quản Trị**: Dành cho Chủ tịch, Ban Chấp Hành, Ban Điều Hành, Trưởng 6 Ban Chuyên Môn, Ban Thư Ký, Kế toán và Admin.
   - Giao diện: Desktop Web Layout, Sidebar cố định, Bảng biểu Excel, Recharts, Quản trị hội viên 360°, Phân quyền RBAC 2 Tab.
2. **CEO 1983 PWA (Progressive Web App)**: Dành cho toàn thể hội viên doanh nhân.
   - Giao diện: Mobile-first MemberShell, Bottom Navigation, Thẻ Doanh Nhân Số, QR Động 60s, Cổng thanh toán Napas247 / VNPAY-QR, Sàn giao thương B2B, Lịch hẹn 1-on-1, Trợ lý ViOne AI.
   - Chạy trên cả Trình duyệt Web và chế độ Ứng dụng Cài đặt (Standalone Display) với Service Worker Offline Cache.
3. **Backend Core (NestJS)**: 38 Controllers, 629 API endpoints, WebSocket Gateway, SMTP Mailer, Zalo OA API & MiniApp Webhook.
4. **Cơ sở dữ liệu (PostgreSQL 15)**: 181 Prisma Models với toàn vẹn ràng buộc khóa ngoại và bảo mật cấp hàng (Row Level Security).

---

### 2. CHỈ SỐ KHẢO SÁT & ĐỘ PHỦ 100%
- **Số Phân Hệ (Nodes)**: 38 Nodes (17 CRM Nodes, 15 Mobile App Nodes, 6 Core Nodes).
- **Màn Hình / Routes**: 248 Tuyến đường giao diện.
- **Thành Phần UI (Components)**: 495 Components.
- **Backend APIs**: 629 API endpoints độc lập.
- **CSDL Prisma Models**: 181 Models.
- **Test Automation**: 182 Tests PASS 100% (Jest + Vitest).
- **Strict TypeScript Check**: 0 Lỗi (exit code 0 trên cả BE & FE).
