# BACKEND TECHNICAL SPECIFICATION (TECHSPEC) - CEO 1983 PROJECT
## Phân Hệ: Backend API NestJS (`apps/ceo1983_app_be`)

---

### 1. Kiến Trúc Tổng Thể & Tech Stack
- **Framework**: NestJS 11.x (Node.js runtime, Express engine).
- **Ngôn Ngữ**: TypeScript 5.8+ (Strict Mode bật 100%).
- **Cơ Sở Dữ Liệu**: PostgreSQL 15+ tập trung (Host Docker / Linux server).
- **ORM & Data Access**: Prisma ORM v6+ (`@vibe/db`), hỗ trợ Type-Safe Client và Raw SQL tagged templates (`this.prisma.$queryRaw`).
- **Xác Thực (Authentication)**: JWT (`@nestjs/jwt`, `passport-jwt`), mật khẩu băm bcrypt, phân quyền RBAC (`RolesGuard`, `DataScopeInterceptor`).
- **Lưu Trữ Tệp (Object Storage)**: MinIO / S3 SDK (Endpoint RESTful upload file đa phương tiện: ảnh đại diện, danh thiếp, poster cơ hội, sản phẩm B2B, tài liệu công việc).
- **Giao Tiếp Thời Gian Thực (Realtime)**: Socket.IO Gateway (`@nestjs/websockets`, `@nestjs/platform-socket.io`).

---

### 2. Cấu Trúc Thư Mục Chuẩn
```
apps/ceo1983_app_be/src/
├── common/                  # Filters, Interceptors, Decorators, Utilities
├── prisma/                  # PrismaService & PrismaModule
├── auth/                    # AuthModule, JwtStrategy, Guards (JwtAuthGuard, RolesGuard)
├── members/                 # Quản lý hội viên, hồ sơ, phân quyền ban
├── events/                  # Sự kiện hiệp hội, đại biểu, cuống vé, check-in QR
├── opportunities/           # Sàn cơ hội kinh doanh B2B, deal CRM
├── marketplace/             # Chợ sản phẩm B2B, gian hàng, báo giá VIP
├── moments/                 # Bảng tin khoảnh khắc doanh nhân
├── messenger/               # Chat 1-1, hội thoại, file/media chat
├── tasks/                   # Quản lý giao việc, tiến độ 1-5 sao, deliverables
├── voting/                  # Biểu quyết trực tuyến, đại hội, tỷ lệ phiếu
├── sponsors/                # Gói tài trợ, cơ cấu giải thưởng, bốc thăm may mắn
├── admin/                   # Quản trị hệ thống, ma trận phân quyền, audit logs
├── users/                   # Tài khoản đăng nhập, đổi mật khẩu
├── notifications/           # Thông báo chuông hệ thống & Push notifications
├── connect-app/             # Hệ sinh thái Business Connect:
│   ├── connect-app.module.ts
│   ├── connect-app.service.ts    # Lean Facade Service (2.190 dòng)
│   ├── connect-app.utils.ts      # Tiện ích dùng chung
│   └── services/                 # 12 Specialized Domain Micro-Services:
│       ├── moments.service.ts              # ConnectMomentsService (1.138 dòng)
│       ├── messenger.service.ts            # ConnectMessengerService (987 dòng)
│       ├── nfc-device.service.ts           # ConnectNfcService (240 dòng)
│       ├── opportunity.service.ts          # ConnectOpportunityService (996 dòng)
│       ├── marketplace.service.ts          # ConnectMarketplaceService (883 dòng)
│       ├── customer.service.ts             # ConnectCustomerService (783 dòng)
│       ├── card-scan.service.ts            # ConnectCardScanService (602 dòng)
│       ├── identity.service.ts             # ConnectIdentityService (596 dòng)
│       ├── community.service.ts            # ConnectCommunityService (1.712 dòng)
│       ├── content.service.ts              # ConnectContentService (299 dòng)
│       ├── public-registration.service.ts  # ConnectPublicRegistrationService (568 dòng)
│       └── network.service.ts              # ConnectNetworkService (2.740 dòng)
├── app.module.ts            # Root Module
└── main.ts                  # Entry point (CORS, Pipes, Prefix /api/v1)
```

---

### 3. Phân Quyền & Bảo Mật (Strict RBAC)
1. **Chuẩn Hóa 5 Vai Trò Hệ Thống (Strict Roles)**:
   - `quan_tri`: Quản trị cấp cao nhất (Super Admin).
   - `admin`: Quản trị viên hiệp hội / hệ thống.
   - `tong_thu_ky`: Tổng thư ký điều hành hoạt động hiệp hội.
   - `truong_ban`: Trưởng ban của một trong 7 Ban chuyên môn.
   - `member`: Hội viên chính thức của CLB Doanh Nhân CEO 1983.
   *(CẤM TỰ BỊA THÊM BẤT KỲ VAI TRÒ NÀO KHÁC)*.
2. **Chuẩn Hóa 7 Ban Chuyên Môn**:
   - Ban Thành viên
   - Ban xúc tiến
   - Ban thiện nguyện
   - Ban truyền thông
   - Ban quản trị
   - Ban tài chính
   - Hội viên ceo1983
   *(CẤM TỰ BỊA THÊM BẤT KỲ TÊN BAN NÀO KHÁC)*.

---

### 4. Quy Chuẩn Cơ Sở Dữ Liệu & Raw Queries
- Mọi ID khóa chính chuẩn hóa kiểu `String` (UUID).
- Khi sử dụng `$queryRaw`:
  ```typescript
  // CHUẨN: Tagged Template Literal của Prisma
  const result = await this.prisma.$queryRaw`
    SELECT id, title, status FROM public.events WHERE id = ${eventId}::uuid
  `;
  // CẤM TUYỆT ĐỐI: Nối chuỗi SQL thủ công
  ```
- Toàn bộ thời gian hiển thị quy đổi múi giờ Việt Nam (`Asia/Ho_Chi_Minh` UTC+7).
