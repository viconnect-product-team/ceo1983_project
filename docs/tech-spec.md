# TÀI LIỆU ĐẶC TẢ KỸ THUẬT (TECHNICAL SPECIFICATION)
## DỰ ÁN: NỀN TẢNG QUẢN TRỊ & APP HỘI VIÊN HIỆP HỘI DOANH NHÂN CEO 1983
**Phiên bản:** 2.0.0 | **Ngày lập:** 29/09/2026 | **Tác giả:** Technical Writer

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

Hệ thống được thiết kế theo mô hình Monorepo hướng dịch vụ phân tách rõ ràng giữa Phân hệ Người dùng Cuối (Member Mobile PWA & App), Phân hệ Quản trị (Admin Web CRM) và Lõi Xử lý Backend API (NestJS Core).

```mermaid
graph TD
    subgraph ClientLayer [Client Presentation Layer]
        A1[CEO Member Mobile PWA / iOS Safari / Android]
        A2[Executive Web CRM Dashboard]
        A3[Native Wrapper - Capacitor/Cordova]
    end

    subgraph GatewayLayer [Gateway & Security]
        B1[Nginx SSL Reverse Proxy :5444]
        B2[JWT Guard & Roles Guard]
        B3[DataScope Interceptor]
    end

    subgraph ServiceLayer [NestJS Backend Services]
        C1[Auth & IAM Module]
        C2[Members & Profile Module]
        C3[Events & QR Check-in Module]
        C4[Voting & Lucky Draw Module]
        C5[Sponsors & Packages Module]
        C6[Business Connect & Opportunities Module]
        C7[Documents & News Module]
        C8[Upload MinIO S3 & Mail Service]
    end

    subgraph StorageLayer [Persistence & Storage]
        D1[(PostgreSQL Database)]
        D2[(MinIO Object Storage)]
        D3[Socket.IO Realtime Gateway]
    end

    A1 -->|HTTPS / WSS| B1
    A2 -->|HTTPS / WSS| B1
    A3 -->|Internal WebView| B1
    B1 --> B2
    B2 --> B3
    B3 --> ServiceLayer
    ServiceLayer -->|Prisma Client & $queryRaw| D1
    ServiceLayer -->|S3 Protocol| D2
    ServiceLayer -->|Pub/Sub Events| D3
    D3 -.->|Realtime Push| A1
    D3 -.->|Realtime Push| A2
```

---

## 2. SƠ ĐỒ THỰC THỂ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA - ERD)

Cơ sở dữ liệu sử dụng **PostgreSQL** với Prisma ORM (`@vibe/db`), hỗ trợ khóa ngoại, chỉ mục hiệu năng cao và phân quyền Row Level Security (RLS).

```mermaid
erDiagram
    associations ||--o{ members : "has"
    associations ||--o{ events : "organizes"
    associations ||--o{ sponsor_packages : "defines"
    associations ||--o{ documents : "manages"
    
    users ||--o| members : "binds_profile"
    users ||--o{ event_registrations : "registers"
    users ||--o{ poll_votes : "casts"
    users ||--o{ lucky_draw_winners : "wins"

    events ||--o{ event_registrations : "receives"
    events ||--o{ checkins : "logs"
    events ||--o{ polls : "associates"
    events ||--o{ lucky_draw_winners : "draws"

    event_registrations ||--o{ checkins : "verifies"

    polls ||--o{ poll_options : "contains"
    poll_options ||--o{ poll_votes : "tallies"

    sponsor_packages ||--o{ sponsors : "categorizes"
    sponsors }o--|| associations : "supports"

    users {
        uuid id PK
        string email UK
        string phone
        string password_hash
        string role "superadmin|admin|bqt|btc|btt|member"
        string status "active|suspended|pending"
        datetime created_at
    }

    members {
        uuid id PK
        uuid user_id FK
        uuid association_id FK
        string member_code UK
        string full_name
        string company_name
        string position
        string industry
        string membership_tier "official|associate|honorary"
        string fee_status "paid|unpaid|grace_period"
        jsonb business_card_data
        datetime joined_at
    }

    events {
        uuid id PK
        uuid association_id FK
        string name
        string description
        date event_date
        string location
        string status "upcoming|ongoing|completed|cancelled"
        int max_attendees
        string banner_url
        boolean is_public
    }

    event_registrations {
        uuid id PK
        uuid event_id FK
        uuid user_id FK
        string qr_code UK
        string status "pending|confirmed|cancelled|attended"
        datetime registered_at
    }

    checkins {
        uuid id PK
        uuid event_id FK
        uuid registration_id FK
        uuid scanner_user_id FK
        string scan_method "qr_camera|nfc_tap|manual"
        jsonb geo_location
        datetime checkin_time
    }

    polls {
        uuid id PK
        uuid event_id FK
        string title
        string description
        string status "draft|open|closed"
        string target_audience "all|members"
        datetime start_date
        datetime end_date
    }

    poll_options {
        uuid id PK
        uuid poll_id FK
        string title
        int votes_count
    }

    poll_votes {
        uuid id PK
        uuid poll_id FK
        uuid option_id FK
        uuid user_id FK
        string source_app "association_app|crm"
        datetime voted_at
    }

    sponsor_packages {
        uuid id PK
        uuid association_id FK
        string tier "platinum|gold|silver|bronze"
        decimal price
        string package_type "cash|in_kind"
        jsonb benefits
        int available
        int sold
    }

    sponsors {
        uuid id PK
        uuid association_id FK
        uuid package_id FK
        string name
        string logo_url
        decimal amount
        string status "active|expired"
    }

    documents {
        uuid id PK
        uuid association_id FK
        string title
        string category "regulation|resolution|minutes"
        string file_url
        boolean is_confidential
    }
```

---

## 3. DANH SÁCH API ENDPOINTS CHÍNH (CORE API CATALOG)

Tất cả các API được định tuyến qua tiền tố `/api` (hoặc `/upload`), yêu cầu xác thực Bearer JWT thông qua `JwtAuthGuard` ngoại trừ các route công khai (Public).

### 3.1. Phân hệ Xác thực & Quản lý Tài khoản (Auth & Identity)
| Method | Endpoint | Quyền hạn (Roles) | Mô tả nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Đăng nhập bằng Email / Mã hội viên + Mật khẩu |
| `POST` | `/api/auth/refresh` | Public | Cấp mới Access Token từ Refresh Token |
| `GET` | `/api/auth/profile` | Authenticated | Trích xuất hồ sơ cá nhân và quyền hạn hiện tại |
| `POST` | `/api/auth/change-password`| Authenticated | Đổi mật khẩu tài khoản |
| `POST` | `/api/auth/forgot-password`| Public | Gửi liên kết đặt lại mật khẩu qua Email |

### 3.2. Phân hệ Quản lý Hội viên (Members & Associations)
| Method | Endpoint | Quyền hạn (Roles) | Mô tả nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/members` | Authenticated | Danh sách hội viên (hỗ trợ phân trang, lọc ngành nghề) |
| `GET` | `/api/members/:id` | Authenticated | Xem chi tiết hồ sơ hội viên và doanh nghiệp |
| `POST` | `/api/members` | `admin, bqt` | Thêm mới hồ sơ hội viên vào CLB |
| `PUT` | `/api/members/:id` | `admin, bqt, self` | Cập nhật thông tin hội viên / danh thiếp số |
| `DELETE`| `/api/members/:id` | `admin` | Lưu trữ / vô hiệu hóa tài khoản hội viên |
| `GET` | `/api/members/stats/overview`| `admin, bqt` | Thống kê tổng hội viên, đóng phí, phân bố ban |

### 3.3. Phân hệ Sự kiện & Điểm danh QR (Events & QR Check-in)
| Method | Endpoint | Quyền hạn (Roles) | Mô tả nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Authenticated | Danh sách sự kiện sắp diễn ra và đã hoàn thành |
| `GET` | `/api/events/:id` | Authenticated | Chi tiết sự kiện, agenda, nhà tài trợ liên kết |
| `POST` | `/api/events` | `admin, bqt, btc` | Tạo mới sự kiện hiệp hội |
| `PUT` | `/api/events/:id` | `admin, bqt, btc` | Cập nhật thông tin, banner, trạng thái sự kiện |
| `POST` | `/api/events/:id/register` | Authenticated | Đăng ký tham gia sự kiện và nhận QR Code vé |
| `POST` | `/api/events/checkin` | `admin, btc, scanner` | Quét QR Code vé xác thực điểm danh tức thời |
| `GET` | `/api/events/:id/attendees`| `admin, btc` | Danh sách người tham dự và tiến độ check-in |

### 3.4. Phân hệ Biểu quyết & Quay số May mắn (Voting & Lucky Draw)
| Method | Endpoint | Quyền hạn (Roles) | Mô tả nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/voting/polls` | Authenticated | Danh sách các cuộc biểu quyết / thăm dò ý kiến |
| `GET` | `/api/voting/polls/:id` | Authenticated | Chi tiết biểu quyết, tùy chọn và kết quả thống kê |
| `POST` | `/api/voting/polls` | `admin, bqt, btc` | Khởi tạo cuộc biểu quyết mới kèm danh sách option |
| `PUT` | `/api/voting/polls/:id` | `admin, bqt, btc` | Chỉnh sửa nội dung hoặc đóng sớm biểu quyết |
| `POST` | `/api/voting/polls/:id/vote`| Member (Active) | Bỏ phiếu biểu quyết (Ghi nhận nguồn App hoặc CRM) |
| `POST` | `/api/voting/lucky-draw/notify`| `admin, btc` | Bắn thông báo realtime chúc mừng người trúng thưởng |

### 3.5. Phân hệ Quản lý Tài trợ (Sponsors & Packages)
| Method | Endpoint | Quyền hạn (Roles) | Mô tả nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/sponsors/packages` | Public / Auth | Danh sách các gói tài trợ (Kim cương, Vàng, Bạc, Đồng) |
| `POST` | `/api/sponsors/packages` | `admin, bqt, btc` | Tạo gói tài trợ mới kèm danh sách quyền lợi |
| `GET` | `/api/sponsors` | Authenticated | Danh sách nhà tài trợ đã xác nhận |
| `POST` | `/api/sponsors` | `admin, bqt, btt` | Ghi nhận nhà tài trợ mới cho CLB hoặc sự kiện |
| `POST` | `/api/sponsors/onboard` | Authenticated | Quy trình tiếp nhận nhà tài trợ tự động |

### 3.6. Phân hệ Tài liệu & Quản lý File (Documents & Upload)
| Method | Endpoint | Quyền hạn (Roles) | Mô tả nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/documents` | Authenticated | Thư viện nghị quyết, văn bản lưu hành nội bộ |
| `POST` | `/api/documents` | `admin, bqt` | Tải lên tài liệu hiệp hội mới (PDF, DOCX) |
| `POST` | `/api/upload` | Authenticated | Upload tệp tin / hình ảnh vào MinIO S3 Bucket |

---

## 4. HẠ TẦNG & QUY TRÌNH TRIỂN KHAI (DEPLOYMENT & INFRASTRUCTURE)

### 4.1. Cấu hình Môi trường Triển khai (Environment Topologies)
- **Production Server IP:** `14.225.217.232` (SSL Port: `5444`).
- **Containerization:** Docker & Docker Compose chạy môi trường cô lập.
- **Reverse Proxy:** Nginx xử lý SSL termination, nén gzip/brotli, proxy pass websocket và static assets.

### 4.2. Cấu trúc Docker Containers
```yaml
version: '3.8'
services:
  ceo1983-backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/ceo1983_db
      - JWT_SECRET=your_jwt_secret_key
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000
    restart: always

  ceo1983-frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "5173:5173"
    restart: always

  postgres:
    image: postgres:15-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: always

  minio:
    image: minio/minio:RELEASE.2024-01-18T22-51-28Z
    command: server /data --console-address ":9001"
    volumes:
      - miniodata:/data
    restart: always
```

### 4.3. Quy trình Triển khai Nhanh (Fast Deployment Automation)
Sử dụng script PowerShell tự động hóa kiểm tra build, đồng bộ tài nguyên và reload PM2 / Docker:
```powershell
# Thực thi triển khai toàn diện Backend & Frontend:
./fast-deploy.ps1

# Triển khai riêng phân hệ App Hiệp hội:
./fast-deploy-association.ps1

# Triển khai riêng phân hệ Web CRM:
./fast-deploy-crm.ps1
```
Script tự động:
1. Chạy `npm run build` ở `apps/ceo1983_app_fe` kiểm tra lỗi TypeScript.
2. Xóa cache Service Worker cũ (`sw.js`).
3. Đẩy code lên server qua SSH/Rsync.
4. Restart tiến trình PM2 Backend và Reload Nginx Gateway.

---

## 5. ĐẶC TẢ CÁC NÂNG CẤP HỆ THỐNG MỚI (V2.1.0 SPECIFICATIONS)

### 5.1. Phân hệ Ma Trận Phân Quyền RBAC Chuẩn (5 Roles x Feature Columns)
- **Vị trí file:** `apps/ceo1983_app_fe/src/routes/permissions.tsx` & `apps/ceo1983_app_fe/src/components/dashboard/RbacPermissionMatrix.tsx`
- **Tối ưu hóa kiến trúc:**
  + **Tách biệt 2 Tab độc lập**, tuyệt đối không gộp chung quản trị tài khoản vào ma trận vai trò:
    1. **Tab 1: Ma Trận Phân Quyền 5 Cấp Bậc (Vai Trò x Chức Năng):**
       - **Dòng bên trái (Rows):** Đúng 5 vai trò chuẩn mực của Hiệp hội CEO 1983:
         + `Quản trị`: Toàn quyền (Xem, Sửa, Xóa, Phân quyền).
         + `Admin`: Quản trị vận hành (Xem, Sửa, Phân quyền).
         + `Tổng thư ký`: Điều hành & Thư ký (Xem, Sửa).
         + `Trưởng ban`: Quản lý chuyên ban (Xem, Sửa - bao gồm cả Ban Thiện Nguyện & An Sinh Xã Hội mới).
         + `Hội viên`: Thành viên chính thức (Chỉ Xem).
       - **Cột bên trên (Columns):** Từng chức năng riêng lẻ (Hội viên, Sự kiện, Cuộc họp, Công việc, Thiện nguyện & An sinh, Tài chính, Giao thương, Bầu cử, Truyền thông, Hệ thống...).
       - **Ô giao điểm (Cells):** Render pill/checkbox thao tác trực quan (Xem, Sửa, Xóa, Phân quyền) tuân thủ giới hạn của từng vai trò.
    2. **Tab 2: Phân Quyền Thao Tác Trực Tiếp Cho Từng Tài Khoản:**
       - Quản lý từng tài khoản thành viên (Gán vai trò điều hành, Ban chuyên môn, Hiệp hội trực thuộc, kích hoạt/tạm dừng).
  + Bổ sung thanh tìm kiếm nhanh, bộ lọc nhóm chức năng, các thẻ KPI vai trò và thao tác thêm/sửa/xóa cột chức năng.

### 5.2. Phân hệ Quản Lý Công Việc Đa Dạng Hiển Thị (5 Task View Modes)
- **Vị trí thư mục:** `apps/ceo1983_app_fe/src/features/tasks/`
- **Mã nguồn đóng gói (Feature-First Standard):**
  + `types.ts`: Định nghĩa `TaskItem`, `TaskStatus`, `TaskPriority`, `TaskMeeting`, `MeetingPlatform`, cấu hình màu sắc và badge.
  + `api.ts`: Toàn bộ các RESTful API endpoints (`fetchTasks`, `createTask`, `updateTask`, `updateTaskStatus`, `updateTaskProgress`, `toggleSubtask`, `addCommentToTask`, `deleteTask`).
  + `components/`:
    1. `TaskTableView.tsx`: Dạng bảng chi tiết theo cột (Mã CV, Tên, Ban, Người làm, Deadline, Ưu tiên, Tiến độ, Trạng thái, Thao tác, Link họp).
    2. `TaskKanbanBoard.tsx`: Dạng lưới Kanban 5 cột trạng thái, bố cục flex trượt ngang chống dính chùm, thanh điều khiển **Zoom to / Zoom nhỏ (Kích thước)** 3 cấp độ (Thu nhỏ 280px, Tiêu chuẩn 345px, Phóng to 410px).
    3. `TaskCalendarView.tsx`: Dạng lịch tháng tương tác, hiển thị công việc và cuộc họp theo ngày, icon họp trực tuyến, nút thêm việc nhanh.
    4. `TaskStatisticsChartView.tsx`: Dashboard Biểu đồ Thống kê phân tích chuyên sâu với Recharts (Donut cơ cấu trạng thái %, Grouped Bar so sánh khối lượng theo ban, Area Chart tiến độ TB, Phân bổ mức ưu tiên, Bảng xếp hạng hiệu suất các ban và sub-tab Timeline Gantt).
    5. `TaskOrgTreeView.tsx`: Dạng cây cơ cấu tổ chức phân cấp ban chuyên môn (Ban Thường Trực -> Các Ban chuyên trách), thống kê tiến độ trung bình, đôn đốc công việc quá hạn và nút giao việc theo ban.
  + `TaskFormModal.tsx`: Modal tạo và chỉnh sửa công việc, tích hợp cuộc họp trực tuyến, checklist mục con, người giám sát.
  + `TaskDetailDrawer.tsx`: Drawer xem chi tiết công việc, khối cuộc họp trực tuyến có nút vào phòng và sao chép link, tiến độ slider, phản hồi trao đổi và nhật ký lịch sử.
  + `index.ts`: Barrel export toàn diện.

### 5.3. Nâng Cấp Quản Lý Cuộc Họp & Xử Lý Khẩn Cấp (Meetings Refactor)
- **Vị trí file:** `apps/ceo1983_app_fe/src/routes/meetings.tsx` & `src/lib/meetings.functions.ts`
- **Nền tảng hỗ trợ:** Đúng 3 hình thức select:
  1. **Zoom Meeting:** Prefix URL mặc định `https://zoom.us/j/`
  2. **Google Meet:** Prefix URL mặc định `https://meet.google.com/`
  3. **UniWork Meeting:** Nền tảng hội họp làm việc số CEO 1983 / UniWork `https://uni-hrm.ubos.vn/meeting/`
- **Thẩm quyền tạo cuộc họp:** Giới hạn đúng 4 vai trò có thẩm quyền: **Chủ tịch**, **Tổng thư ký**, **Admin**, **Trưởng ban**. Đi kèm thông tin người triệu tập (Tên, SĐT, Email liên hệ).
- **Cơ chế xử lý Cuộc họp đột xuất quan trọng & Xung đột lịch:**
  + Đánh dấu cờ khẩn cấp (`isUrgent`) kèm lý do đột xuất (`urgentReason`).
  + Nút **"Liên Hệ Điều Phối"**: Mở modal thông tin người tạo cuộc họp, tích hợp gọi điện thoại trực tiếp (`tel:`) và gửi email (`mailto:`) để thống nhất lịch ưu tiên.
  + Chức năng **"Sắp Xếp Lại Lịch Họp (Reschedule)"**: Cho phép người triệu tập/admin cập nhật ngày/giờ mới và tự động gửi thông báo broadcast điều chỉnh lịch đến toàn bộ đại biểu.
  + Chức năng **"Xóa Cuộc Họp (Delete)"**: Nút xóa cuộc họp màu đỏ kèm modal xác nhận an toàn, xóa dữ liệu vĩnh viễn và thu hồi giấy mời.

### 5.4. Quy Chuẩn Màu Sắc & Tính Toàn Vẹn Dữ Liệu
- **Màu thương hiệu bắt buộc:**
  + Deep Cobalt Navy (`#003B95`) cho nút chính, thanh điều hướng, card tiêu điểm.
  + Warm Amber Gold (`#F59E0B`) cho icon nhấn, badge VIP, viền trạng thái nổi bật.
  + Tuyệt đối không tự ý đổi màu sang vàng sâm banh gradient ViOne hoặc nút đen tối trong Light mode.
- **Dữ liệu:** Tuyệt đối không sinh dữ liệu ảo (fake data) ngẫu nhiên; giữ vững logic thực tế của CLB Doanh Nhân CEO 1983.
