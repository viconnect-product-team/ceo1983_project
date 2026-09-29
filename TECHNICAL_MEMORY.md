# TÀI LIỆU KIẾN TRÚC & HỆ THỐNG CÔNG NGHỆ (TECHNICAL MEMORY)
## DỰ ÁN HỆ SINH THÁI HIỆP HỘI DOANH NHÂN CEO 1983 (`ceo1983_project`)

> **Cảnh báo cốt lõi**: Dự án `ceo1983_project` là một hệ thống độc lập, hoàn toàn cách ly với `vione_project`. Mọi chỉnh sửa, cấu hình, dữ liệu và giao diện của CRM và Mobile/Web App Hiệp Hội CEO 1983 chỉ được thực thi bên trong thư mục `ceo1983_project/`. Tuyệt đối cấm can thiệp chéo sang `vione_project/`.

---

## 1. TỔNG QUAN HỆ THỐNG VÀ 3 PHÂN HỆ

Hệ thống Hiệp hội Doanh nhân CEO 1983 bao gồm 3 phân hệ tương tác chặt chẽ theo mô hình Client - Server:

```
                  +--------------------------------------------------+
                  |         DATABASE (PostgreSQL 15 / Prisma)        |
                  |  Tables: vione_users, members, events, meetings, |
                  |    sponsors, advertisements, notifications, etc. |
                  +-------------------------+------------------------+
                                            |
                                            v
                  +--------------------------------------------------+
                  |          BACKEND API (NestJS 10)                 |
                  |          apps/ceo1983_app_be (Port 4000/4002)    |
                  |  - REST API, JWT Auth, MinIO Storage S3          |
                  |  - Push Notifications, WebSocket Gatekeeper      |
                  +--------------------+-------------------+---------+
                                       |                   |
            +--------------------------+                   +--------------------------+
            |                                                                         |
            v                                                                         v
+---------------------------------------+                         +---------------------------------------+
|        WEB CRM & APP HIỆP HỘI         |                         |           MOBILE APP CONTAINER        |
|          apps/ceo1983_app_fe          |                         |            apps/mobile_ceo1983        |
|  - React 18 + TanStack Router/Start   |                         |  - Capacitor / Expo wrapper           |
|  - CRM Admin: Port 5000 / 5443        |                         |  - Remote live URL & Offline static   |
|  - App Hiệp Hội Mobile Web:           |                         |  - Android (APK) & iOS (IPA)          |
|    URL: /association/... (Port 5444)  |                         |  - Camera Scanner QR, NFC Native      |
+---------------------------------------+                         +---------------------------------------+
```

### Chi tiết 3 phân hệ:
1. **Backend (`apps/ceo1983_app_be`)**:
   - Framework: **NestJS 10** + **TypeScript**.
   - ORM / DB Access: **Prisma Client** kết hợp Raw SQL Queries tối ưu hóa hiệu năng cao.
   - Database: PostgreSQL (Port 6432, user: `app1`, db: `ceo1983_project`).
   - File Storage: MinIO S3 Object Storage (Port 9050 API, bucket: `advertisements`, `avatars`, `events`).
   - Authentication: Passport JWT (`/auth/login`, Local Strategy, JWT Bearer Token).
   - Core Modules: `AuthModule`, `UsersModule`, `MembersModule`, `EventsModule`, `MeetingsModule`, `SponsorsModule`, `UploadModule`, `ConnectAppModule`, `AdvertisementsModule`.

2. **Frontend Web & Mobile Web (`apps/ceo1983_app_fe`)**:
   - Framework: **React 18** + **TanStack Start & TanStack Router** (File-based routing).
   - Styling: **Vanilla CSS + Tailwind CSS (v3/v4 token system)**.
   - UI Design: Navy Blue (`#0f172a`), Deep Blue (`#1e3a8a`), Warm Amber/Gold (`#d97706`), Slate Gray.
   - CRM Portal (Desktop): `/`, `/members`, `/events`, `/sponsors`, `/business-connect`, `/settings`, `/matrix-permissions`.
   - App Hiệp hội (Mobile First): `/association`, `/association/events`, `/association/products`, `/association/messages`, `/association/notifications`, `/association/checkin`, `/association/profile`.

3. **Mobile App Wrapper (`apps/mobile_ceo1983`)**:
   - Engine: **Capacitor 6 / Expo EAS**.
   - Cấu hình Server: `capacitor.config.ts` trỏ tới `https://14.225.217.232:5444/association` (chế độ Live Server) hoặc đóng gói Offline Bundle từ `apps/ceo1983_app_fe/dist` vào `www/`.
   - Native Bridges: Camera Scanner QR Code, NFC Hardware Scanner, Native Push Notification, Device Biometrics.

---

## 2. CẤU HÌNH MÔI TRƯỜNG & BIẾN MÔI TRƯỜNG (ENV)

### Backend (`apps/ceo1983_app_be/.env` & Root `.env`):
```env
# Database kết nối (Tự động hỗ trợ kết nối Local hoặc Remote Server)
DATABASE_URL=postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@127.0.0.1:6432/ceo1983_project?schema=public
REMOTE_DATABASE_URL=postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?schema=public&pgbouncer=true

# Bảo mật JWT
JWT_SECRET=super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server Port
PORT=4000
NODE_ENV=production

# MinIO S3 Object Storage
MINIO_ENDPOINT=127.0.0.1
MINIO_PORT=9050
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=advertisements
```

### Frontend (`apps/ceo1983_app_fe/.env`):
```env
VITE_API_URL=https://14.225.217.232:5443/api
VITE_BACKEND_DIRECT_URL=http://localhost:4002/api
VITE_APP_ENV=production
VITE_ENABLE_NFC=true
```

---

## 3. LUỒNG CHẠY & ĐỒNG BỘ DỮ LIỆU GIỮA 3 PHÂN HỆ

### Luồng 1: Xác thực & Đăng nhập (Auth Flow)
1. User nhập email & password trên Web CRM hoặc App Hiệp Hội.
2. Frontend gọi `POST /api/auth/login` qua `fetchNestApi`.
3. Backend kiểm tra tài khoản trong bảng `public.vione_users` bằng `bcrypt.compare`.
4. Backend cấp phát `access_token` JWT chứa `{ sub: user.id, email, name, role, department }`.
5. Frontend lưu token vào `localStorage` (`vba_nest_auth_token`) và đính kèm `Authorization: Bearer <token>` cho mọi request tiếp theo.

### Luồng 2: Quản lý & Đồng bộ Quảng cáo Media (Video/Banner)
1. Admin trên Web CRM mở modal "Thêm Quảng Cáo Mới", upload ảnh hoặc video (.mp4, .webm).
2. Tệp được đẩy lên `POST /api/upload/single` -> Lưu trực tiếp vào MinIO S3 bucket `advertisements` và nhận URL tĩnh chuẩn.
3. Admin submit form -> Frontend gửi `POST /api/advertisements` lưu bản ghi vào database `public.advertisements`.
4. App Hiệp Hội trên Mobile gọi `GET /api/advertisements` để lấy danh sách chiến dịch đang chạy (`status = 'active'`).
5. App Hiệp Hội hiển thị danh sách dạng **Slider vuốt ngang mượt mà**, hỗ trợ auto-play video và đếm lượt tương tác (impressions, clicks) gửi về backend.

### Luồng 3: Thông báo cuộc họp Offline & Push Notification
1. Lãnh đạo hoặc Hội viên tạo cuộc gặp Offline trên CRM (`POST /api/meetings`).
2. Backend `MeetingsService` ghi nhận lịch hẹn, kiểm tra hình thức `type === 'offline'` hoặc `location` thực tế.
3. Backend kích hoạt `NotificationsService.sendMeetingPushNotification`:
   - Ghi bản ghi vào bảng `public.notifications`.
   - Bắn tin nhắn trực tiếp vào Kênh Ban/Kênh Cá nhân của người được mời.
   - Gửi tín hiệu Push Notification tới thiết bị Mobile đã đăng ký Push Token.

### Luồng 4: Phân luồng Thông báo & Tin nhắn (Notifications vs Messages)
1. **Màn hình Thông báo (Mobile UI)**:
   - Rút gọn thẻ Card: Chỉ hiển thị Icon/Badge, Tiêu đề, Thời gian gửi, Preview ngắn 1 dòng và Nút hành động ("Xem chi tiết" / "Vào phòng họp").
   - Ẩn toàn bộ Body dài để giao diện thông báo luôn tinh gọn, hiện đại.
2. **Màn hình Tin nhắn (Mobile UI)**:
   - Tự động tiếp nhận toàn bộ nội dung chi tiết (Body) được phân luồng từ CRM.
   - Phân luồng theo Kênh:
     - Tin Broadcast (toàn thể): Kênh Thông báo Chung Hiệp Hội.
     - Tin Ban Điều Hành: Kênh Ban Quản Trị / Ban Thư Ký / Ban Xúc Tiến / Ban Truyền Thông.
     - Tin 1-on-1: Chat riêng giữa 2 hội viên.

### Luồng 5: Bảo toàn Ma trận Phân quyền (Permission Matrix Integrity)
1. Khi Admin thay đổi ma trận quyền trên CRM, Frontend gửi payload chuẩn `PUT /api/admin/permissions-matrix`.
2. Backend cập nhật `roles` & `permissions` vào bảng `public.app_permissions` với transaction commit an toàn.
3. Khi tải lại trang (mount), Frontend gọi `GET /api/admin/permissions-matrix` để nạp dữ liệu thực tế từ DB, tuyệt đối không dùng state tạm thời đè lên dữ liệu đã lưu.

### Luồng 6: Quản lý Công Việc Đa Dạng (5 View Modes), Điều Khiển Zoom & Biểu Đồ Thống Kê
1. Kiến trúc: Toàn bộ mã nguồn đặt tại `apps/ceo1983_app_fe/src/features/tasks/`.
2. 5 Chế độ hiển thị:
   - **Bảng (Table)**: Cột STT, mã CV, tiêu đề + link họp, ban phụ trách, người thực hiện, độ ưu tiên, hạn chót, tiến độ %, trạng thái, thao tác.
   - **Lưới (Kanban)**: 5 cột trạng thái chuẩn với thanh điều khiển **Zoom to / Zoom nhỏ (Kích thước)** 3 cấp độ:
     + *Thu nhỏ (Compact - 280px)*: Thu nhỏ để nhìn bao quát toàn bộ 5 cột trên màn hình.
     + *Tiêu chuẩn (Standard - 345px)*: Kích thước tiêu chuẩn thoáng đãng, cân đối.
     + *Phóng to (Spacious - 410px)*: Phóng to thẻ card, hiển thị chi tiết mô tả và nút vào họp.
     + Bố cục flex trượt ngang mượt mà, loại bỏ triệt để lỗi co cụm dính chùm thẻ card.
   - **Lịch (Calendar)**: Lưới 7 ngày/tuần dạng tháng, hiển thị badge việc theo ngày hết hạn kèm ký hiệu video meeting và nút thêm nhanh việc.
   - **Biểu đồ Thống kê (Statistics & Analytics Dashboard)**:
     + Dashboard phân tích điều hành chuyên sâu với Recharts.
     + Biểu đồ tròn Donut: Cơ cấu phân bổ 5 trạng thái công việc kèm tỷ lệ hoàn thành %.
     + Biểu đồ cột nhóm (Grouped Bar): So sánh việc đã xong vs đang làm vs quá hạn của từng Ban chuyên môn CEO 1983.
     + Biểu đồ tiến độ trung bình (Area Chart) và phân bổ mức độ ưu tiên (Hỏa tốc, Cao, Trung bình).
     + Bảng xếp hạng chi tiết hiệu suất các ban và sub-tab chuyển đổi sang Timeline Gantt 14 ngày.
   - **Cây đơn vị (Org Tree)**: Phân cấp theo cơ cấu Ban Hiệp hội (CEO 1983 -> Ban Thiện Nguyện & An Sinh, Ban Xúc Tiến, Ban Truyền Thông, Ban Thành Viên...), tính % tiến độ trung bình ban, số lượng việc, và nút "Giao việc" theo từng ban.
3. Tích hợp cuộc họp trực tuyến:
   - Chọn 1 trong 3 nền tảng: **Zoom**, **Google Meet**, **UniWork**.
   - Lưu trữ URL cuộc họp, thời gian bắt đầu, mã phòng/mật khẩu họp.
   - Badge tham gia họp xuất hiện trên Thẻ việc (Kanban), Bảng (Table), Lịch (Calendar), Biểu đồ, và Drawer Chi tiết.

### Luồng 7: Ma Trận Phân Quyền Chuẩn RBAC & Tách Biệt Chức Năng (RBAC Matrix Overhaul)
1. Tách biệt 2 Tab chức năng độc lập (Không gộp chung quản trị tài khoản vào ma trận quyền):
   - **Tab 1**: Ma Trận Phân Quyền 5 Cấp Bậc (Vai Trò x Chức Năng).
   - **Tab 2**: Phân Quyền Thao Tác Trực Tiếp Cho Từng Tài Khoản Cá Nhân.
2. Cấu trúc Ma Trận Tab 1:
   - **Dòng bên trái (Rows)**: Đúng 5 Vai trò chuẩn mực của Hiệp hội CEO 1983 kèm phạm vi quyền tối đa:
     - `Quản trị`: Toàn quyền (Xem, Sửa, Xóa, Phân quyền).
     - `Admin`: Quản trị vận hành (Xem, Sửa, Phân quyền).
     - `Tổng thư ký`: Điều hành & Thư ký (Xem, Sửa).
     - `Trưởng ban`: Quản lý chuyên ban bao gồm cả Ban Thiện Nguyện & An Sinh Xã Hội mới (Xem, Sửa).
     - `Hội viên`: Thành viên chính thức (Chỉ Xem).
   - **Cột bên trên (Columns)**: Từng chức năng riêng lẻ (Hội viên, Sự kiện, Cuộc họp, Công việc, Ban Thiện nguyện & An sinh, Tài chính, Giao thương, Bầu cử, Truyền thông, Hệ thống...).
   - **Ô giao điểm (Cells)**: Render trực quan các pill/checkbox thao tác tương ứng (Xem, Sửa, Xóa, Phân quyền) được bật/tắt theo giới hạn từng vai trò.
   - Hỗ trợ thêm chức năng mới, sửa tên chức năng, xóa chức năng động và thống kê KPI trực quan.

### Luồng 8: Nâng Cấp Quản Lý Cuộc Họp & Xử Lý Khẩn Cấp (Meetings Refactoring)
1. Hỗ trợ **3 Nền tảng họp trực tuyến**:
   - **Zoom Meeting**: Phòng họp bảo mật cao, nhập Zoom URL + Passcode.
   - **Google Meet**: Họp trực tiếp qua trình duyệt web không cần cài app.
   - **UniWork Meet**: Họp bảo mật nội bộ trong hệ sinh thái UniWork.
2. Thẩm quyền tạo cuộc họp:
   - Giới hạn đúng 4 vai trò có thẩm quyền triệu tập: **Chủ tịch**, **Tổng thư ký**, **Admin**, **Trưởng ban**.
   - Lưu trữ đầy đủ danh tính người triệu tập: Tên, Chức vụ, SĐT liên hệ, Email.
3. Cơ chế xử lý **Cuộc họp đột ngột quan trọng (Khẩn cấp)** & Xung đột lịch:
   - Cờ đánh dấu cuộc họp khẩn cấp (`isUrgent`) kèm lý do triệu tập đột xuất (`urgentReason`).
   - Nút **"Liên Hệ Điều Phối"**: Mở modal hiển thị ngay thông tin người tạo cuộc họp kèm nút gọi điện thoại nhanh (`tel:`) và gửi email (`mailto:`) để thống nhất ưu tiên.
   - Chức năng **"Sắp Xếp Lại Lịch Họp (Reschedule)"**: Người tạo cuộc họp hoặc quản trị viên có thể vào điều chỉnh ngày/giờ mới, hệ thống tự động phát thông báo broadcast dời lịch đến toàn thể thành viên.
   - Chức năng **"Xóa Cuộc Họp"**: Nút xóa cuộc họp màu đỏ kèm modal xác nhận an toàn, xóa vĩnh viễn dữ liệu và thông báo thu hồi lịch họp.


