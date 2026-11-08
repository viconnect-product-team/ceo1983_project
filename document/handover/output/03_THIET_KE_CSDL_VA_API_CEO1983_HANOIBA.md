# HỆ SINH THÁI NỀN TẢNG SỐ CLB DOANH NHÂN CEO 1983 (HANOIBA)

## TÀI LIỆU THIẾT KẾ CƠ SỞ DỮ LIỆU POSTGRESQL & ĐẶC TẢ REST API
*(DATABASE DESIGN & REST API SPECIFICATIONS - MASTER ENTERPRISE SPEC)*

---

* **Mã tài liệu:** `DB-API-CEO1983-MASTER-HANOIBA`
* **Phiên bản:** `Phiên bản 10.0 Enterprise Handover Standard (Bản Bàn Giao Kỹ Thuật & CSDL Toàn Diện)`
* **Cơ quan chủ quản:** Câu Lạc Bộ Doanh Nhân CEO 1983 — Trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)
* **Đơn vị phát triển giải pháp:** VICONNECT - Đội ngũ Kỹ sư Dữ liệu & Kiến trúc sư Backend NestJS
* **Công nghệ cốt lõi:** PostgreSQL 16+, NestJS Pure 3-Tier, Prisma ORM, JWT Authentication, Redis Cache, Socket.IO Realtime
* **Ngày phát hành:** `08/11/2026`

---

## MỤC LỤC TÀI LIỆU

1. **PHẦN I: TỔNG QUAN KIẾN TRÚC DỮ LIỆU & GIAO TIẾP HỆ THỐNG**
   - 1.1. Triết Lý Thiết Kế Kiến Trúc Backend NestJS Thuần Khiết
   - 1.2. Chuẩn Hóa Khóa Chính UUIDv4 & Tính Toàn Vẹn Quan Hệ
   - 1.3. Cơ Chế Bảo Mật RBAC, DataScopeInterceptor & Xác Thực JWT
2. **PHẦN II: THIẾT KẾ CƠ SỞ DỮ LIỆU POSTGRESQL CHI TIẾT (16 BẢNG DỮ LIỆU)**
   - 2.1. Sơ Đồ Quan Hệ Thực Thể Toàn Diện (Full ERD Diagram)
   - 2.2. Phân Hệ Người Dùng, Hội Viên & Doanh Nghiệp (`vione_users`, `members`, `companies`)
   - 2.3. Phân Hệ Phân Quyền Vai Trò & Phân Ban (`user_roles`, `committee_members`)
   - 2.4. Phân Hệ Giao Thương B2B, Cơ Hội & Đàm Phán Deal (`opportunities`, `opportunity_interests`)
   - 2.5. Phân Hệ Sản Phẩm & Gian Hàng Sàn TMĐT (`products`)
   - 2.6. Phân Hệ Sự Kiện, Sơ Đồ Ghế Cinema & Trạm Soát Vé (`events`, `event_registrations`)
   - 2.7. Phân Hệ Cuộc Họp Ban & Quản Lý Check-in Độc Lập (`business_meetings`, `meeting_participants`)
   - 2.8. Phân Hệ Bảng Tin Mạng Lưới & Bình Luận Cây 3 Tầng (`feed_posts`, `feed_comments`, `feed_likes`)
   - 2.9. Phân Hệ Tài Chính, Sổ Quỹ & Thu Hội Phí Niên Liễm (`financial_transactions`, `membership_fees`)
   - 2.10. Phân Hệ Tích Hợp Zalo OA & Quản Lý Token 6 Giờ (`zalo_accounts`)
   - 2.11. Phân Hệ Quản Trị Hệ Thống & Nhật Ký Kiểm Toán (`audit_logs`, `app_settings`, `notifications`)
3. **PHẦN III: ĐẶC TẢ CHI TIẾT 50+ REST API ENDPOINTS CHUẨN DOANH NGHIỆP**
   - 3.1. Phân Hệ Xác Thực & Phiên Làm Việc (Authentication & Session APIs)
   - 3.2. Phân Hệ Quản Trị Hội Viên & Thẩm Định Hồ Sơ (Members APIs)
   - 3.3. Phân Hệ Sự Kiện, Sơ Đồ Bàn Tiệc & Trạm Soát Vé QR Gate (Events & Seating APIs)
   - 3.4. Phân Hệ Cuộc Họp Ban & Quản Lý Check-in Độc Lập (Meetings & Check-in APIs)
   - 3.5. Phân Hệ Cơ Hội Giao Thương B2B & Đàm Phán Deal Sinh Lời (Opportunities & Deals APIs)
   - 3.6. Phân Hệ Sản Phẩm & Sàn TMĐT Nội Khối (Products APIs)
   - 3.7. Phân Hệ Mạng Lưới, Đăng Bài QR & Bình Luận Cây (Feed & Comments APIs)
   - 3.8. Phân Hệ Tài Chính, Thu Hội Phí & Webhook Đối Soát (Finance & Payment APIs)
   - 3.9. Phân Hệ Tích Hợp Zalo OA & Tự Động Làm Mới Token (Zalo OA APIs)
   - 3.10. Phân Hệ Báo Cáo Thống Kê 2 Cột & Dashboard KPI (Analytics BI APIs)

---

## PHẦN I: TỔNG QUAN KIẾN TRÚC DỮ LIỆU & GIAO TIẾP HỆ THỐNG

### 1. Triết lý Thiết kế Kiến trúc (Design Philosophy)
1. **Kiến trúc Pure NestJS 3 tầng (Controller - Service - Repository/Prisma)**:
   - 100% nghiệp vụ quản trị CRM và tính năng Mobile App kết nối qua cổng API RESTful NestJS (`apps/ceo1983_app_be`).
   - Tuyệt đối loại bỏ các kết nối trực tiếp PostgREST phía client nhằm đảm bảo tính toàn vẹn nghiệp vụ, an toàn dữ liệu và tuân thủ RBAC chặt chẽ.
2. **PostgreSQL Relational Core**:
   - Sử dụng PostgreSQL phiên bản 16+ với schema `public` được phân định rõ ràng giữa các phân hệ: Hội viên, Doanh nghiệp, Phân quyền RBAC, Giao thương B2B, Sự kiện & Cuộc họp, Quản trị Tài liệu, Tài chính Thu - Chi, Mạng xã hội nội bộ, và Thông báo thời gian thực.
   - Định danh bản ghi sử dụng chuẩn `UUIDv4` để đảm bảo an toàn, bảo mật thông tin và khả năng mở rộng dữ liệu phân tán.
3. **Chuẩn hóa Giao thức REST API**:
   - Mọi request gửi tới API được xác thực qua header `Authorization: Bearer <JWT_ACCESS_TOKEN>`.
   - Định dạng payload và response chuẩn `application/json`.
   - Cơ chế xử lý lỗi chuẩn HTTP Status Codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`).

---

## PHẦN II: THIẾT KẾ CƠ SỞ DỮ LIỆU POSTGRESQL CHI TIẾT (DATABASE SCHEMA)

```
                            ┌────────────────────────┐
                            │      vione_users       │
                            └───────────┬────────────┘
                                        │ 1:1
                                        ▼
                            ┌────────────────────────┐
                            │        members         │
                            └─────┬────────────┬─────┘
                                  │ 1:1        │ 1:N
                                  ▼            ▼
             ┌───────────────────────┐      ┌─────────────────────────┐
             │       companies       │      │      opportunities      │
             └───────────┬───────────┘      └─────────────────────────┘
                         │ 1:N                         ▲
                         ▼                             │ 1:N
             ┌───────────────────────┐      ┌──────────┴──────────────┐
             │       products        │      │    user_connections     │
             └───────────────────────┘      └─────────────────────────┘
```

---

### 1. Phân Hệ Người Dùng & Hội Viên (Identity & Membership)

#### 1.1. Bảng `public.vione_users` (Tài khoản người dùng cơ sở)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Khóa chính tài khoản người dùng |
| `name` | `VARCHAR(255)` | `NOT NULL` | Họ và tên hiển thị cơ sở |
| `email` | `VARCHAR(255)` | `UNIQUE, NOT NULL` | Địa chỉ email đăng nhập |
| `avatar_url` | `TEXT` | `NULL` | Đường dẫn ảnh đại diện gốc |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm tạo tài khoản |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm cập nhật cuối cùng |

#### 1.2. Bảng `public.members` (Hồ sơ Hội viên CLB Doanh Nhân CEO 1983)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Khóa chính hồ sơ hội viên |
| `user_id` | `UUID` | `FOREIGN KEY -> vione_users(id), ON DELETE SET NULL` | Khóa ngoại nối với tài khoản cơ sở |
| `code` | `VARCHAR(50)` | `UNIQUE, NOT NULL` | Mã số hội viên (VD: `CEO1983-001`) |
| `name` | `VARCHAR(255)` | `NOT NULL` | Họ tên đầy đủ của hội viên |
| `phone` | `VARCHAR(20)` | `NOT NULL` | Số điện thoại liên hệ (chỉ chứa 10-11 chữ số) |
| `email` | `VARCHAR(255)` | `NULL` | Email liên hệ hội viên |
| `company_name` | `VARCHAR(255)` | `NULL` | Tên doanh nghiệp của hội viên |
| `position` | `VARCHAR(100)` | `DEFAULT 'CEO'` | Chức danh trong doanh nghiệp |
| `department` | `VARCHAR(100)` | `NULL` | Ban chuyên môn CLB (VD: Ban Xúc tiến Thương mại) |
| `executive_role`| `VARCHAR(100)` | `NULL` | Vai trò trong Ban Điều Hành (Chủ tịch, Phó CT, Trưởng ban) |
| `status` | `VARCHAR(50)` | `DEFAULT 'active'` | Trạng thái (`active`, `pending`, `expired`, `locked`) |
| `tier` | `VARCHAR(50)` | `DEFAULT 'official'` | Hạng hội viên (`official` - Chính thức, `honorary` - Danh dự) |
| `region` | `VARCHAR(100)` | `DEFAULT 'Hà Nội'` | Khu vực địa lý |
| `address` | `TEXT` | `NULL` | Địa chỉ trụ sở/văn phòng làm việc |
| `latitude` | `DOUBLE PRECISION`| `NULL` | Tọa độ vĩ độ địa lý (GPS) |
| `longitude` | `DOUBLE PRECISION`| `NULL` | Tọa độ kinh độ địa lý (GPS) |
| `avatar_url` | `TEXT` | `NULL` | Ảnh đại diện chuyên nghiệp của hội viên |
| `cover_url` | `TEXT` | `NULL` | Ảnh bìa trang cá nhân |
| `business_card_slug` | `VARCHAR(100)` | `UNIQUE, NULL` | Định danh URL danh thiếp điện tử công khai |
| `about` | `JSONB` | `DEFAULT '{}'` | Thông tin bổ sung, tiểu sử, thông số lãnh đạo |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Ngày gia nhập CLB |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Ngày cập nhật thông tin |

#### 1.3. Bảng `public.companies` (Hồ sơ Doanh nghiệp Thành viên)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Khóa chính doanh nghiệp |
| `member_id` | `UUID` | `FOREIGN KEY -> members(id), ON DELETE CASCADE` | Khóa ngoại nối với hội viên sáng lập |
| `name` | `VARCHAR(255)` | `NOT NULL` | Tên pháp nhân doanh nghiệp đầy đủ |
| `tax_code` | `VARCHAR(50)` | `NULL` | Mã số thuế doanh nghiệp |
| `industry` | `VARCHAR(100)` | `NOT NULL` | Lĩnh vực kinh doanh chủ lực |
| `employee_scale`| `VARCHAR(50)` | `DEFAULT '10 - 50 nhân sự'` | Quy mô nhân sự |
| `website` | `VARCHAR(255)` | `NULL` | Website doanh nghiệp |
| `address` | `TEXT` | `NULL` | Địa chỉ trụ sở đăng ký kinh doanh |
| `description` | `TEXT` | `NULL` | Năng lực sản xuất, sản phẩm dịch vụ chủ lực |
| `annual_revenue`| `VARCHAR(50)` | `NULL` | Doanh thu ước tính hàng năm |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Ngày tạo hồ sơ |

---

### 2. Phân Hệ Phân Quyền RBAC (Role-Based Access Control)

#### 2.1. Bảng `public.roles` & `public.permissions`
- `public.roles`: `id (VARCHAR)`, `name (VARCHAR)`, `description (TEXT)`, `created_at (TIMESTAMPTZ)`.
  - Các vai trò chuẩn: `chu_tich`, `admin`, `ban_dieu_hanh`, `tong_thu_ky`, `ke_toan`, các `truong_ban_*`, các `thanh_vien_ban_*`, và `member`.
- `public.permissions`: `id (VARCHAR)`, `name (VARCHAR)`, `module (VARCHAR)`, `description (TEXT)`.
- `public.role_permissions`: Bảng nối nhiều-nhiều `role_id (VARCHAR)` và `permission_id (VARCHAR)`.
- `public.user_roles`: Bảng gán vai trò người dùng `user_id (UUID)`, `role_id (VARCHAR)`, `assigned_at (TIMESTAMPTZ)`.

---

### 3. Phân Hệ Giao Thương B2B, Kết Nối & Cuộc Hẹn 1-on-1

#### 3.1. Bảng `public.opportunities` (Cơ hội hợp tác B2B)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Khóa chính cơ hội |
| `creator_id` | `UUID` | `FOREIGN KEY -> members(id), NOT NULL` | Hội viên đăng cơ hội |
| `title` | `VARCHAR(255)` | `NOT NULL` | Tiêu đề tóm tắt nhu cầu |
| `description` | `TEXT` | `NOT NULL` | Mô tả chi tiết yêu cầu hợp tác |
| `type` | `VARCHAR(50)` | `NOT NULL` | Phân loại: `buy` (Mua), `sell` (Bán), `partner` (Tìm đối tác) |
| `industry` | `VARCHAR(100)` | `NOT NULL` | Ngành nghề kinh doanh liên quan |
| `value_vnd` | `BIGINT` | `DEFAULT 0` | Giá trị giao dịch ước tính (VNĐ) |
| `status` | `VARCHAR(50)` | `DEFAULT 'open'` | Trạng thái: `open`, `connecting`, `won` (khớp lệnh), `closed` |
| `visibility` | `VARCHAR(50)` | `DEFAULT 'public'` | Phạm vi: `public` (CLB), `internal` (Ban) |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm tạo |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm cập nhật cuối |

#### 3.2. Bảng `public.user_connections` (Kết nối giao thương & Cuộc gặp 1-on-1)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Khóa chính kết nối |
| `sender_id` | `UUID` | `FOREIGN KEY -> members(id), NOT NULL` | Hội viên chủ động gửi lời mời |
| `receiver_id` | `UUID` | `FOREIGN KEY -> members(id), NOT NULL` | Hội viên được nhận lời mời |
| `type` | `VARCHAR(50)` | `DEFAULT 'b2b_connect'` | Loại hình: `b2b_connect`, `meeting_1on1` |
| `status` | `VARCHAR(50)` | `DEFAULT 'pending'` | Trạng thái: `pending`, `accepted`, `rejected`, `completed` |
| `meeting_time` | `TIMESTAMPTZ` | `NULL` | Lịch hẹn gặp trao đổi cụ thể |
| `location` | `TEXT` | `NULL` | Địa điểm hẹn gặp (offline / online meeting URL) |
| `notes` | `TEXT` | `NULL` | Ghi chú nội dung trao đổi sau cuộc gặp |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm tạo kết nối |

---

### 4. Phân Hệ Sự Kiện, Hội Nghị & Cuộc Họp Ban Chuyên Môn

#### 4.1. Bảng `public.events` (Sự kiện lớn, Gala, Hội thảo CLB)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Khóa chính sự kiện |
| `title` | `VARCHAR(255)` | `NOT NULL` | Tên sự kiện |
| `description` | `TEXT` | `NULL` | Giới thiệu nội dung sự kiện |
| `poster_url` | `TEXT` | `NULL` | Ảnh bìa/banner truyền thông sự kiện |
| `start_time` | `TIMESTAMPTZ` | `NOT NULL` | Thời gian bắt đầu |
| `end_time` | `TIMESTAMPTZ` | `NOT NULL` | Thời gian kết thúc |
| `location` | `TEXT` | `NOT NULL` | Địa chỉ tổ chức sự kiện |
| `capacity` | `INTEGER` | `DEFAULT 100` | Số lượng người tham gia tối đa |
| `ticket_price` | `BIGINT` | `DEFAULT 0` | Giá vé tham gia (0 = Miễn phí) |
| `checkin_code` | `VARCHAR(50)` | `NULL` | Mã định danh check-in QR Code |
| `agenda` | `JSONB` | `DEFAULT '[]'` | Lịch trình chương trình chi tiết theo từng mốc giờ |
| `status` | `VARCHAR(50)` | `DEFAULT 'published'`| Trạng thái: `draft`, `published`, `ongoing`, `completed`, `cancelled` |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm tạo sự kiện |

#### 4.2. Bảng `public.event_registrations` (Đăng ký & Soát vé sự kiện)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Khóa chính đăng ký |
| `event_id` | `UUID` | `FOREIGN KEY -> events(id), ON DELETE CASCADE` | Khóa ngoại sự kiện |
| `member_id` | `UUID` | `FOREIGN KEY -> members(id), NOT NULL` | Hội viên tham gia |
| `ticket_code` | `VARCHAR(100)`| `UNIQUE, NOT NULL` | Mã vé điện tử định danh |
| `status` | `VARCHAR(50)` | `DEFAULT 'registered'` | Trạng thái: `registered`, `paid`, `attended` (đã quét mã check-in) |
| `checked_in_at`| `TIMESTAMPTZ` | `NULL` | Thời điểm quét mã QR thành công tại cửa soát vé |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm đăng ký vé |

---

### 5. Phân Hệ Quản Trị Tài Liệu & Thư Mục Google Drive (`public.documents`)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Khóa chính tài liệu/thư mục |
| `title` | `VARCHAR(255)` | `NOT NULL` | Tên tài liệu hoặc tên thư mục |
| `category` | `VARCHAR(100)` | `NOT NULL` | Chuyên mục tài liệu: `BOD`, `FINANCE`, `LEGAL`, `EVENT`, `MEDIA`, `TRAINING` |
| `file_url` | `TEXT` | `NULL` | Đường dẫn tệp tin tải trực tiếp lên server |
| `drive_url` | `TEXT` | `NULL` | Đường dẫn liên kết Google Drive tương tác |
| `folder_id` | `UUID` | `FOREIGN KEY -> documents(id), ON DELETE SET NULL` | Thư mục cha chứa tài liệu này |
| `is_folder` | `BOOLEAN` | `DEFAULT FALSE` | Đánh dấu là Thư mục (`true`) hay Tệp (`false`) |
| `share_scope` | `VARCHAR(50)` | `DEFAULT 'ALL'` | Phạm vi chia sẻ: `ALL`, `BOD_ONLY`, `SECRETARY`, `INTERNAL` |
| `file_size` | `BIGINT` | `DEFAULT 0` | Dung lượng tệp tính bằng byte |
| `file_type` | `VARCHAR(50)` | `NULL` | Loại định dạng tệp: `pdf`, `docx`, `xlsx`, `zip`, `folder` |
| `download_count`| `INTEGER` | `DEFAULT 0` | Số lượt hội viên tải về |
| `uploaded_by` | `UUID` | `FOREIGN KEY -> members(id), NULL` | Người tạo/tải tệp lên |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Ngày tạo tài liệu/thư mục |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Ngày chỉnh sửa cuối |

---

### 6. Phân Hệ Tài Chính Thu - Chi & Qũy Ngân Sách CLB

#### 6.1. Bảng `public.income_records` (Khoản thu)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Khóa chính khoản thu |
| `title` | `VARCHAR(255)` | `NOT NULL` | Nội dung khoản thu |
| `category` | `VARCHAR(100)` | `NOT NULL` | Phân loại: `membership_fee` (Niên liễm), `event_ticket` (Vé sự kiện), `sponsor` (Tài trợ) |
| `amount` | `BIGINT` | `NOT NULL` | Số tiền thu (VNĐ) |
| `payer_id` | `UUID` | `FOREIGN KEY -> members(id), NULL` | Hội viên nộp tiền |
| `payment_method`| `VARCHAR(50)` | `DEFAULT 'bank_transfer'` | Hình thức: `bank_transfer`, `cash`, `card` |
| `status` | `VARCHAR(50)` | `DEFAULT 'paid'` | Trạng thái: `paid`, `pending`, `cancelled` |
| `invoice_url` | `TEXT` | `NULL` | Ảnh chụp ủy nhiệm chi / hóa đơn điện tử |
| `recorded_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm ghi nhận giao dịch |

#### 6.2. Bảng `public.expense_records` (Khoản chi)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Khóa chính khoản chi |
| `title` | `VARCHAR(255)` | `NOT NULL` | Nội dung chi ngân sách |
| `category` | `VARCHAR(100)` | `NOT NULL` | Chuyên mục: `event`, `office`, `charity`, `marketing`, `operation` |
| `amount` | `BIGINT` | `NOT NULL` | Số tiền thực chi (VNĐ) |
| `advance_amount`| `BIGINT` | `DEFAULT 0` | Số tiền tạm ứng trước |
| `refund_amount` | `BIGINT` | `DEFAULT 0` | Số tiền hoàn ứng lại quỹ |
| `payee_id` | `UUID` | `FOREIGN KEY -> members(id), NULL` | Người nhận tiền/thực thi |
| `approved_by` | `UUID` | `FOREIGN KEY -> members(id), NULL` | Cán bộ lãnh đạo phê duyệt (Chủ tịch/TTK) |
| `status` | `VARCHAR(50)` | `DEFAULT 'approved'` | Trạng thái: `draft`, `submitted`, `approved`, `rejected` |
| `spent_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Ngày giải ngân chi tiêu |

---

### 7. Phân Hệ Bảng Tin Mạng Xã Hội (`public.feed_posts`, `feed_comments`, `feed_likes`)
- `public.feed_posts`: `id (UUID)`, `author_id (UUID)`, `title (VARCHAR)`, `content (TEXT)`, `category (VARCHAR: GENERAL, EVENT, NEWS, MEETING)`, `media_urls (TEXT[])`, `likes_count (INTEGER)`, `comments_count (INTEGER)`, `created_at (TIMESTAMPTZ)`.
- `public.feed_comments`: `id (UUID)`, `post_id (UUID)`, `author_id (UUID)`, `parent_id (UUID, NULL)`, `content (TEXT)`, `created_at (TIMESTAMPTZ)`.
- `public.feed_likes`: `post_id (UUID)`, `member_id (UUID)`, `created_at (TIMESTAMPTZ)`, `PRIMARY KEY (post_id, member_id)`.

---

### 8. Phân Hệ Thông Báo Đa Kênh (`public.notifications`)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Khóa chính thông báo |
| `recipient_id` | `UUID` | `FOREIGN KEY -> members(id), NOT NULL` | Hội viên nhận thông báo |
| `title` | `VARCHAR(255)` | `NOT NULL` | Tiêu đề thông báo ngắn gọn |
| `content` | `TEXT` | `NOT NULL` | Chi tiết nội dung thông báo |
| `category` | `VARCHAR(50)` | `NOT NULL` | Phân loại: `MEMBER`, `EVENT`, `MEETING`, `OPPORTUNITY`, `TASK`, `FINANCE`, `SYSTEM` |
| `target_route` | `VARCHAR(255)` | `NULL` | Điều hướng liên kết khi bấm vào (Deep Link) |
| `is_read` | `BOOLEAN` | `DEFAULT FALSE` | Trạng thái đã đọc hay chưa |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm phát thông báo |

---

### 9. Phân Hệ Tin Nhắn Trực Tiếp & Cuộc Trò Chuyện B2B (`public.messages`)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Khóa chính tin nhắn |
| `from_id` | `VARCHAR(100)` | `NOT NULL` | Định danh người gửi (UUID / Member ID / Code) |
| `to_id` | `VARCHAR(100)` | `NOT NULL` | Định danh người nhận (UUID / Member ID / Code) |
| `content` | `TEXT` | `NOT NULL` | Nội dung tin nhắn (văn bản thường hoặc thẻ [file:...], [meeting:...]) |
| `file_metadata` | `JSONB` | `DEFAULT '{}'` | Metadata tệp tin đính kèm (URL, tên tệp, kích thước, mimeType) |
| `is_read` | `BOOLEAN` | `DEFAULT FALSE` | Trạng thái đã xem tin nhắn hay chưa |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm gửi tin nhắn |

*Chỉ mục tối ưu:* `CREATE INDEX idx_messages_from_to ON public.messages(from_id, to_id);`, `CREATE INDEX idx_messages_to_from ON public.messages(to_id, from_id);`

---

### 10. Phân Hệ Quan Tâm Cơ Hội B2B & Yêu Cầu Báo Giá (`public.opportunity_interests`, `public.quote_requests`)
- `public.opportunity_interests`:
  | Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Khóa chính bản ghi quan tâm |
  | `opportunity_id` | `UUID` | `FOREIGN KEY -> opportunities(id), ON DELETE CASCADE` | Khóa ngoại cơ hội kinh doanh |
  | `user_id` | `UUID` | `NULL` | Khóa ngoại tài khoản người dùng |
  | `member_id` | `VARCHAR(100)` | `NULL` | ID định danh hội viên bày tỏ quan tâm |
  | `member_code` | `VARCHAR(50)` | `NULL` | Mã số hội viên (VD: CEO-83001) |
  | `phone` | `VARCHAR(20)` | `NULL` | SĐT người quan tâm để liên hệ tức thời |
  | `notes` | `TEXT` | `NULL` | Ghi chú nhu cầu hợp tác ban đầu |
  | `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm bày tỏ quan tâm |

- `public.quote_requests`:
  | Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Khóa chính yêu cầu báo giá |
  | `product_id` | `VARCHAR(100)` | `NOT NULL` | ID sản phẩm trên sàn B2B |
  | `buyer_id` | `VARCHAR(100)` | `NOT NULL` | ID hội viên gửi yêu cầu báo giá |
  | `quantity` | `INTEGER` | `DEFAULT 1` | Số lượng hàng hóa/dịch vụ cần mua |
  | `notes` | `TEXT` | `NULL` | Yêu cầu kỹ thuật và thời gian giao hàng |
  | `status` | `VARCHAR(50)` | `DEFAULT 'pending'` | Trạng thái: pending, quoted, ordered, rejected |
  | `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm gửi yêu cầu |

---

### 11. Phân Hệ Cấu Hình Trang Đích Dynamic (`public.landing_web_configs`)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Khóa chính cấu hình landing |
| `template_id` | `VARCHAR(100)` | `UNIQUE, NOT NULL` | Mã bản mẫu: `timed_cards`, `startup_mobile` |
| `title` | `VARCHAR(255)` | `NOT NULL` | Tiêu đề trang đích |
| `slug` | `VARCHAR(100)` | `NOT NULL` | Đường dẫn path-based (VD: web-v1, web-v2) |
| `is_published` | `BOOLEAN` | `DEFAULT TRUE` | Trạng thái xuất bản công khai |
| `config` | `JSONB` | `DEFAULT '{}'` | Cấu hình dynamic 5 tab (hero, ribbon, map, avatars, testimonials) |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm cập nhật cuối cùng |

---

## PHẦN III: ĐẶC TẢ CHI TIẾT REST API ENDPOINTS

### 1. Phân Hệ Xác Thực & Phiên Làm Việc (Authentication & Session)

#### 1.1. `POST /auth/login`
- **Mục đích**: Đăng nhập hệ thống bằng Email và Mật khẩu.
- **Request Body**:
  ```json
  {
    "email": "president@ceo1983.vn",
    "password": "SecurePassword123@"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "e6a12b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "email": "president@ceo1983.vn",
      "name": "Trần Tuấn Anh",
      "role": "chu_tich",
      "memberId": "12345678-1234-1234-1234-123456789abc"
    }
  }
  ```

#### 1.2. `GET /auth/me`
- **Mục đích**: Lấy thông tin tài khoản và danh sách quyền hạn hiện hữu của phiên đăng nhập.
- **Header**: `Authorization: Bearer <TOKEN>`
- **Response `200 OK`**: Trả về hồ sơ người dùng kèm mảng permissions (`crm_dashboard`, `crm_finance_edit`, `cat_mobile_app`,...).

---

### 2. Phân Hệ Quản Trị Hội Viên (CRM & Member Management)

#### 2.1. `GET /members`
- **Mục đích**: Lấy danh sách hội viên 360° có phân trang và bộ lọc.
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 20)
  - `search` (string, tìm theo tên, số điện thoại, công ty, mã hội viên)
  - `department` (string, lọc theo Ban chuyên môn)
  - `status` (string: `active`, `pending`, `expired`)
- **Response `200 OK`**:
  ```json
  {
    "data": [
      {
        "id": "7b04f762-c840-410a-8a5f-141a0e101419",
        "code": "CEO1983-001",
        "name": "Trần Tuấn Anh",
        "phone": "0393631546",
        "email": "tuananh@vione.vn",
        "companyName": "Công ty Cổ phần và Công nghệ Đầu tư ViOne",
        "position": "Chủ tịch HĐQT",
        "department": "Ban Xúc tiến Thương mại",
        "executiveRole": "Chủ tịch CLB",
        "status": "active",
        "tier": "official",
        "avatarUrl": "https://storage.ceo1983.vn/avatars/user-01.jpg"
      }
    ],
    "total": 128,
    "page": 1,
    "limit": 20
  }
  ```

#### 2.2. `PATCH /members/:id/role-dept`
- **Mục đích**: Cập nhật Ban chuyên môn và Vai trò Ban Điều Hành cho hội viên (Đặc quyền: Chủ tịch, Admin, Tổng thư ký).
- **Request Body**:
  ```json
  {
    "department": "Ban Đào tạo & Truyền thông",
    "executiveRole": "Trưởng Ban",
    "status": "active",
    "tier": "official"
  }
  ```
- **Response `200 OK`**: Trả về hồ sơ hội viên sau khi cập nhật thành công.

---

### 3. Phân Hệ Thống Kê & Báo Cáo Thông Minh (Analytics BI)

#### 3.1. `GET /analytics/overview`
- **Mục đích**: Cung cấp các chỉ số KPI then chốt phục vụ trang chủ CRM và Thống kê Mobile App.
- **Response `200 OK`**:
  ```json
  {
    "kpi": {
      "totalMembers": 128,
      "totalConnections": 340,
      "totalMeetings": 186,
      "totalEvents": 14,
      "totalOpportunities": 52,
      "totalOpportunityValue": 85600000000,
      "totalDealsWon": 28,
      "activeRatePercent": 85.5
    }
  }
  ```

#### 3.2. `GET /analytics/chart`
- **Mục đích**: Cung cấp dữ liệu cột chồng và đường timeline đồng bộ theo thời gian thực.
- **Query Parameters**:
  - `range` (string: `minute`, `hour`, `day`, `week`, `month`, `quarter`, `year`)
- **Response `200 OK`**:
  ```json
  {
    "chartData": [
      {
        "timeBucket": "10/2026",
        "connections": 45,
        "meetings": 30,
        "events": 8,
        "opportunities": 12,
        "timelineVal": 95
      }
    ]
  }
  ```

---

### 4. Phân Hệ Quản Trị Tài Liệu & Thư Mục (Document & Google Drive)

#### 4.1. `GET /documents`
- **Mục đích**: Lấy danh sách tài liệu và thư mục theo cấp phân cấp `folder_id`.
- **Query Parameters**:
  - `folderId` (UUID, optional: nếu null lấy danh sách cấp gốc Root)
  - `category` (string, optional: lọc theo chuyên mục)
  - `search` (string, tìm kiếm tên tài liệu)
- **Response `200 OK`**:
  ```json
  {
    "folders": [
      {
        "id": "c1a2b3c4-0000-1111-2222-333344445555",
        "title": "Hồ Sơ Pháp Lý & Điều Lệ CLB",
        "category": "LEGAL",
        "isFolder": true,
        "createdAt": "2026-09-01T08:00:00Z"
      }
    ],
    "documents": [
      {
        "id": "d2b3c4d5-1111-2222-3333-444455556666",
        "title": "Quy chế Quản lý Tài chính Quý 3_2026.pdf",
        "category": "FINANCE",
        "fileUrl": "https://storage.ceo1983.vn/docs/quy-che-tc.pdf",
        "driveUrl": "https://docs.google.com/document/d/1aBcDeFg...",
        "isFolder": false,
        "folderId": "c1a2b3c4-0000-1111-2222-333344445555",
        "shareScope": "ALL",
        "fileSize": 2450800,
        "fileType": "pdf",
        "downloadCount": 42
      }
    ]
  }
  ```

#### 4.2. `POST /documents`
- **Mục đích**: Tải lên tài liệu mới hoặc tạo thư mục mới vào CSDL.
- **Request Body (Tạo Thư mục)**:
  ```json
  {
    "title": "Tài liệu Ban Xúc Tiến Thương Mại",
    "category": "BOD",
    "isFolder": true,
    "folderId": null,
    "shareScope": "BOD_ONLY"
  }
  ```
- **Request Body (Lưu Tệp tin vào Thư mục đã chọn)**:
  ```json
  {
    "title": "Biên bản họp Đại hội Thường niên 2026.docx",
    "category": "BOD",
    "isFolder": false,
    "folderId": "c1a2b3c4-0000-1111-2222-333344445555",
    "fileUrl": "/uploads/documents/bien-ban-hop-2026.docx",
    "driveUrl": "https://drive.google.com/file/d/1XyZ...",
    "shareScope": "ALL",
    "fileSize": 1048576,
    "fileType": "docx"
  }
  ```

#### 4.3. `PATCH /documents/:id/move`
- **Mục đích**: Di chuyển tệp tin hoặc thư mục con vào thư mục đích khác.
- **Request Body**:
  ```json
  {
    "targetFolderId": "c1a2b3c4-0000-1111-2222-333344445555"
  }
  ```

---

### 5. Phân Hệ Sự Kiện & Điểm Danh Check-in QR (Events & QR Check-in)

#### 5.1. `POST /events/:id/checkin`
- **Mục đích**: Ban soát vé quét mã QR trên vé điện tử của hội viên tại cổng check-in sự kiện.
- **Request Body**:
  ```json
  {
    "ticketCode": "TIC-CEO1983-2026-X89A"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Check-in thành công!",
    "member": {
      "name": "Nguyễn Văn Linh",
      "company": "Công ty Cổ phần Công nghệ ViOne",
      "ticketCode": "TIC-CEO1983-2026-X89A",
      "checkedInAt": "2026-11-06T18:30:15Z"
    }
  }
  ```

---

### 6. Phân Hệ Mobile App: Vị Trí Doanh Nghiệp & Bản Đồ 2D (Business Location)

#### 6.1. `PUT /members/my-location`
- **Mục đích**: Hội viên cập nhật địa chỉ trụ sở và tọa độ GPS định vị bản đồ 2D.
- **Request Body**:
  ```json
  {
    "address": "39 Ngõ 29 Mạc Thái Tông, Phường Trung Hòa, Quận Cầu Giấy, Hà Nội",
    "latitude": 21.0175,
    "longitude": 105.7838,
    "company": "Công ty Cổ phần và Công nghệ Đầu tư ViOne"
  }
  ```
- **Response `200 OK`**: Trả về dữ liệu vị trí đã được lưu an toàn vào PostgreSQL.

#### 6.2. `GET /members/geocode` & `GET /members/reverse-geocode`
- **Mục đích**: Chuyển đổi hai chiều giữa địa chỉ chuỗi ký tự và tọa độ kinh độ/vĩ độ (Geocoding API).
- **Query Params (Geocode)**: `address=...` -> Trả về `{ lat, lng, displayName }`.
- **Query Params (Reverse Geocode)**: `lat=...&lng=...` -> Trả về `{ address, street, district, city }`.

---

### 7. Phân Hệ Cơ Hội B2B & Quản Trị Quan Tâm (Opportunities & Interests)

#### 7.1. `POST /community/opportunities/:id/interest`
- **Mục đích**: Hội viên bày tỏ quan tâm đến một cơ hội giao thương B2B.
- **Request Body**:
  ```json
  {
    "notes": "Công ty chúng tôi có năng lực cung ứng 500 tấn nhôm định hình tiêu chuẩn ISO."
  }
  ```
- **Response `201 Created`**: Ghi nhận vào `opportunity_interests` và gửi push notification tới chủ cơ hội.

#### 7.2. `DELETE /opportunities/:id/interests` & `POST /community/opportunities/:id/uninterest`
- **Mục đích**: Hội viên rút/bỏ quan tâm cơ hội kinh doanh.
- **Response `200 OK`**: Xóa triệt để bản ghi quan tâm đối soát qua UUID, mã hội viên và số điện thoại.

#### 7.3. `POST /community/opportunities/:id/deal-status`
- **Mục đích**: Chủ cơ hội cập nhật trạng thái tiến độ đàm phán (`negotiating`, `won`, `closed`).
- **Request Body**:
  ```json
  {
    "status": "won",
    "actualValue": 2500000000,
    "partnerId": "7b04f762-c840-410a-8a5f-141a0e101419"
  }
  ```
- **Response `200 OK`**: Cập nhật trạng thái deal và cộng dồn giá trị vào thống kê giao thương.

---

### 8. Phân Hệ Tin Nhắn Trực Tiếp & Giao Tiếp B2B (Direct Messaging)

#### 8.1. `POST /dm/member/messages`
- **Mục đích**: Gửi tin nhắn trao đổi hoặc gửi tệp văn bản giữa hai hội viên.
- **Request Body**:
  ```json
  {
    "toId": "M1983-002",
    "content": "Kính gửi anh Tuấn Anh hồ sơ năng lực [file:https://storage.ceo1983.vn/docs/profile.pdf|Profile_ViOne.pdf|2.4MB]"
  }
  ```
- **Response `201 Created`**: Lưu vào bảng `messages` và phát sóng Socket.IO tới người nhận.

#### 8.2. `GET /dm/member/messages`
- **Mục đích**: Lấy lịch sử hội thoại tin nhắn phân trang giữa hai hội viên.
- **Query Params**: `partnerId=M1983-002&limit=50&before=...`.

---

### 9. Phân Hệ Sinh Mã QR Vé Sự Kiện Nội Bộ Siêu Tốc (Native QR Ticket)

#### 9.1. `GET /events/qr`
- **Mục đích**: Sinh mã QR vé mời check-in hoặc thanh toán MoMo định dạng PNG sắc nét nội bộ dưới 5 mili-giây.
- **Query Params**: `code=TIC-CEO1983-2026-X89A&size=300`.
- **Response `200 OK`**: Trả về `image/png` trực tiếp kèm header `Cache-Control: public, max-age=86400`.

---

### 10. Phân Hệ Kiểm Duyệt Bình Luận Tin Tức CRM (News Moderation)

#### 10.1. `GET /moderation/comments`
- **Mục đích**: Cán bộ CRM tải danh sách toàn bộ bình luận trên các bài viết tin tức để kiểm duyệt.
- **Response `200 OK`**: Trả về mảng bình luận kèm thông tin tác giả, bài viết gốc và cờ trạng thái.

#### 10.2. `DELETE /moderation/comments/:id`
- **Mục đích**: Ban Truyền Thông xóa bỏ bình luận vi phạm điều lệ CLB.
- **Response `200 OK`**: Đánh dấu xóa hoặc xóa vĩnh viễn khỏi CSDL và ghi nhận audit log.

---

## PHẦN IV: CHIẾN LƯỢC ĐÁNH INDEX VÀ TỐI ƯU HIỆU NĂNG CSDL (DATABASE INDEXING)

Để đảm bảo tốc độ phản hồi API luôn dưới 50ms với quy mô dữ liệu mở rộng hàng triệu bản ghi, hệ thống đã thiết lập các chỉ mục (indexes) chiến lược:
1. `CREATE INDEX idx_members_user_id ON public.members(user_id);`
2. `CREATE INDEX idx_members_phone ON public.members(phone);`
3. `CREATE INDEX idx_members_department_status ON public.members(department, status);`
4. `CREATE INDEX idx_opportunities_creator_status ON public.opportunities(creator_id, status);`
5. `CREATE INDEX idx_opportunities_type_created ON public.opportunities(type, created_at DESC);`
6. `CREATE INDEX idx_documents_folder_category ON public.documents(folder_id, category);`
7. `CREATE INDEX idx_notifications_recipient_read ON public.notifications(recipient_id, is_read);`
8. `CREATE INDEX idx_event_reg_event_member ON public.event_registrations(event_id, member_id);`

---

## PHẦN V: KẾT LUẬN & ĐỒNG BỘ TÀI LIỆU
Tài liệu đặc tả này là kim chỉ nam kỹ thuật cho toàn bộ đội ngũ phát triển, được lưu trữ tại `document/notebooklm/09_DAC_TA_API_VA_THIET_KE_CSDL.md` để đồng bộ trực tiếp lên hệ thống **Google NotebookLM Master của CEO 1983**.
Mọi sự thay đổi về schema bảng CSDL hoặc API payload trong quá trình vận hành tiếp theo bắt buộc phải cập nhật đồng bộ vào tài liệu này và `document/SRS_CEO1983_MASTER_CHINH_THUC.md`.

