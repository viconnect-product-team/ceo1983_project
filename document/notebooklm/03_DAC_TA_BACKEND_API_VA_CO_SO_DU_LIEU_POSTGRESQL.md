# MỤC 3: ĐẶC TẢ BACKEND API & CƠ SỞ DỮ LIỆU POSTGRESQL CEO 1983
*Tài liệu nguồn chuẩn hóa tải lên Google NotebookLM (Sổ tay: https://notebook.google.com/notebook/6ea9dec4-b8c1-4b4b-a077-d874b625bafd)*
*Phân hệ: Backend API NestJS (`apps/ceo1983_app_be`) & CSDL PostgreSQL (`ceo1983_project`)*

---

## 1. NGUYÊN TẮC KIẾN TRÚC BACKEND THUẦN NESTJS (PURE NESTJS ARCHITECTURE)
1. **Kết nối trực tiếp CSDL PostgreSQL qua NestJS**:
   - Máy chủ CSDL: `14.225.217.232:5436`
   - Database Name: `ceo1983_project`
   - Framework Backend: NestJS 11.x (`Node.js 20+`, Express platform, Prisma ORM `@vibe/db`).
   - Cổng API phục vụ: `5001` (trên VPS reverse proxy từ domain `api.ceo1983.vn`).
2. **CẤM TUYỆT ĐỐI Supabase PostgREST Client**:
   - 100% dữ liệu nghiệp vụ (Meetings, Opportunities, Marketplace, News, Events, Documents, Sponsors, Members) phải đi qua NestJS REST API (`fetchNestApiFromServer` / `fetchNestApi`) kết nối trực tiếp đến PostgreSQL `ceo1983_project`.
   - TUYỆT ĐỐI KHÔNG dùng Supabase PostgREST client (`supabaseAdmin.from(...)`, `getDb.from(...)`) trong các server function nghiệp vụ nhằm tránh lỗi cache schema PostgREST.

---

## 2. KIẾN TRÚC 3 TẦNG CHUẨN RESTFUL TRONG NESTJS
Mỗi tính năng backend nằm trong một module độc lập tại `apps/ceo1983_app_be/src/<module>/`:
- **Controller (`<name>.controller.ts`)**: Mỏng, định tuyến HTTP routes, bắt param/body qua DTO classes riêng biệt, điều hướng tới Service.
- **Service (`<name>.service.ts`)**: Chứa 100% Business Logic, tính toán, phân quyền, ném NestJS HttpException (`NotFoundException`, `BadRequestException`, `ForbiddenException`).
- **Repository / Prisma (`<name>.repository.ts` / `prisma.service.ts`)**: Thực thi truy vấn Prisma ORM hoặc Raw SQL ($queryRaw với Tagged Template Literals).
- **DTO (`dto/`)**: Chứa các lớp truyền tải dữ liệu có validation decorator (`class-validator`, `class-transformer`).

---

## 3. DANH MỤC CÁC BẢNG CƠ SỞ DỮ LIỆU POSTGRESQL CHÍNH

### 1. Bảng Hội Viên & Người Dùng (`public.members`, `public.vione_users`, `public.companies`)
- `public.vione_users`:
  - Mục đích: Tài khoản xác thực cơ sở.
  - Các cột: `id` (UUID), `name`, `email`, `avatar_url`, `created_at`, `updated_at`.
  - *Lưu ý quan trọng*: Bảng này TUYỆT ĐỐI KHÔNG chứa các cột `phone`, `status`, `role`.
- `public.members`:
  - Mục đích: Hồ sơ hội viên câu lạc bộ và chức danh lãnh đạo.
  - Các cột: `id`, `user_id`, `code`, `name`, `phone`, `email`, `company_name`, `position`, `department` (Ban chuyên môn), `executive_role` (Vai trò BĐH), `status` (`active`, `pending`, `expired`), `tier` (`official`, `honorary`), `region`, `address`, `about` (Lưu thông tin lãnh đạo dạng JSON), `avatar_url`, `created_at`.
- `public.companies`:
  - Mục đích: Hồ sơ doanh nghiệp của hội viên.
  - Các cột: `id`, `member_id`, `name`, `tax_code`, `industry`, `employee_scale`, `website`, `address`, `description`, `annual_revenue`.

### 2. Bảng Cơ Hội Giao Thương B2B (`public.opportunities`)
- Các cột: `id`, `creator_id`, `title`, `description`, `type` (`buy` - Bên mua, `sell` - Bên bán, `partner` - Tìm đối tác), `industry`, `value_vnd` (Giá trị deal ước tính), `status` (`open`, `negotiating`, `closed`, `cancelled`), `created_at`.
- Quan hệ: Nối với `members` qua `creator_id`.

### 3. Bảng Sự Kiện & Cuộc Họp (`public.events`, `public.meetings`, `public.event_registrations`)
- `public.events`: Sự kiện lớn, Gala, Hội thảo, Đại hội thường niên (`id`, `title`, `description`, `poster_url`, `start_time`, `end_time`, `agenda` (JSON lịch trình theo giờ), `location`, `capacity`, `ticket_price`, `checkin_qr`, `status`).
- `public.meetings`: Cuộc họp ban chuyên môn & gặp gỡ CLB (`id`, `title`, `department_id`, `start_time`, `end_time`, `location`, `latitude`, `longitude`, `agenda`, `status`).
- `public.event_registrations`: Ghi nhận đăng ký và soát vé (`id`, `event_id`, `member_id`, `ticket_code`, `status` - `registered`/`paid`/`attended`/`cancelled`, `attended_at`).

### 4. Bảng Tài Chính Thu - Chi (`public.income_records`, `public.expense_records`)
- `public.income_records`: Khoản thu ngân sách (`id`, `title`, `category` - `membership_fee`/`event_ticket`/`sponsor`, `amount`, `payer_id`, `payment_method`, `status` - `paid`/`pending`, `recorded_at`, `invoice_url`).
- `public.expense_records`: Khoản chi ngân sách (`id`, `title`, `category` - `event`/`office`/`charity`/`marketing`, `amount`, `payee_id`, `advance_amount` - tiền tạm ứng, `refund_amount` - hoàn ứng, `status`, `approved_by`, `spent_at`).

### 5. Bảng Sàn Giao Thương Marketplace B2B (`public.products`)
- Các cột: `id`, `company_id`, `member_id`, `name`, `category`, `price_vnd`, `image_urls` (Mảng ảnh), `description`, `contact_phone`, `is_featured`, `status`.
- *Ràng buộc*: Mỗi doanh nghiệp thành viên chỉ được đăng tối đa 5 sản phẩm.

### 6. Bảng Phân Quyền & Vai Trò (`public.roles`, `public.permissions`, `public.role_permissions`, `public.user_roles`)
- `roles`: Bảng các vai trò (`chu_tich`, `admin`, `ban_dieu_hanh`, `tong_thu_ky`, 6 ban `truong_ban_*`, 6 ban `thanh_vien_ban_*`, `member`).
- `permissions`: Danh mục quyền hạn theo module (`crm_dashboard`, `crm_finance_view`, `crm_finance_edit`, `cat_mobile_app`, v.v.).

### 7. Bảng Bảng Tin Mạng Xã Hội (`public.feed_posts`, `public.feed_comments`, `public.feed_likes`)
- `feed_posts`: Bài viết chia sẻ, thảo luận, cuộc họp tự động đẩy (`id`, `author_id`, `title`, `content`, `category` - `GENERAL`/`EVENT_MEETING`/`NEWS`, `media_urls`, `created_at`).
- `feed_comments`: Bình luận trao đổi.
- `feed_likes`: Lượt thả tim.

---

## 4. DANH MỤC API ENDPOINTS PHÂN LOẠI THEO PHÂN HỆ

### Endpoints Phân Hệ CRM Quản Trị
- `GET /admin/dashboard-stats`: Lấy chỉ số tổng hợp KPI
- `GET /admin/analytics-summary`: Lấy số liệu 5 chế độ thống kê
- `GET /members`: Danh sách hội viên 360° (kèm phân trang, lọc ban)
- `POST /members`: Thêm mới hội viên
- `PUT /members/:id`: Cập nhật thông tin cá nhân hội viên
- `DELETE /members/:id`: Xóa hội viên (chế độ company_only hoặc all)
- `PATCH /members/:id/role-dept`: Gán vai trò BĐH và Ban chuyên môn
- `GET /companies`: Danh sách doanh nghiệp thành viên
- `PUT /companies/:id`: Cập nhật hồ sơ doanh nghiệp
- `GET /events`: Quản lý danh sách sự kiện
- `POST /events`: Tạo sự kiện mới kèm Poster & Agenda theo giờ
- `GET /meetings`: Lịch họp ban chuyên môn kèm tọa độ GPS
- `POST /meetings`: Tạo cuộc họp ban (tự động đẩy sang Events & Feed)
- `GET /finance/income`: Danh sách khoản thu ngân sách
- `POST /finance/income/import-excel`: Nhập dữ liệu thu từ Excel
- `GET /finance/expenses`: Danh sách phiếu chi, tạm ứng, hoàn ứng
- `GET /finance/summary-report`: Báo cáo tài chính tổng hợp dòng tiền
- `GET /tasks`: Danh sách nhiệm vụ ban chuyên môn
- `POST /tasks`: Giao nhiệm vụ mới (gửi thông báo nêu rõ người giao)
- `GET /admin/roles`: Ma trận vai trò và danh mục quyền hạn
- `POST /admin/roles/permissions`: Cập nhật ma trận phân quyền RBAC
- `GET /admin/lucky-draw-config`: Cấu hình danh sách giải thưởng quay số

### Endpoints Phân Hệ Mobile App CEO 1983
- `GET /association/home-feed`: Bảng tin hoạt động trang chủ
- `GET /association/home-stats`: Số liệu thống kê thật 100% CSDL
- `GET /association/card-profile`: Thẻ hội viên VIP và thông tin công ty
- `PUT /association/card-privacy`: Cập nhật công tắc ẩn/hiện SĐT & Email
- `GET /card/public/:code`: Xem danh thiếp số công khai
- `GET /association/members`: Danh bạ doanh nhân kèm lọc ngành
- `POST /association/b2b-connect`: Gửi đề xuất hẹn gặp B2B 1-on-1
- `GET /association/opportunities`: Danh sách cơ hội giao thương B2B
- `POST /association/opportunities`: Đăng nhu cầu Bên mua / Bên bán
- `GET /association/opportunities/report`: Báo cáo biểu đồ cơ cấu deal
- `GET /association/opportunities/top-givers`: Xếp hạng vinh danh Top Givers
- `GET /association/products`: Sàn B2B nội bộ (kiểm tra tối đa 5 sản phẩm)
- `POST /association/products`: Đăng sản phẩm mới (tối đa 5 sản phẩm/DN)
- `GET /association/events`: Lịch sự kiện & cuộc họp ban di động
- `POST /association/events/:id/register`: Đăng ký tham dự và nhận vé QR
- `GET /association/polls`: Danh sách biểu quyết đang mở và lịch sử
- `POST /association/polls/:id/vote`: Bỏ phiếu biểu quyết trực tuyến
- `GET /association/feed`: Dòng thời gian mạng xã hội CLB
- `POST /association/feed/posts`: Đăng bài viết chia sẻ
- `POST /association/feed/comments`: Bình luận vào bài viết
- `PUT /auth/change-password`: Đổi mật khẩu tài khoản
