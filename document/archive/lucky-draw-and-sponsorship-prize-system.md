# ĐẶC TẢ KỸ THUẬT: HỆ THỐNG GIẢI THƯỞNG SỰ KIỆN, BỐC THĂM TRÚNG THƯỞNG & THƯ VIỆN CLICKUP ICON TOKENS
**Hệ Thống:** CLB Doanh Nhân CEO 1983 (Trực thuộc Hội Doanh Nhân Trẻ Hà Nội - HanoiBA)  
**Phiên Bản:** 1.0 (08/10/2026)  
**Trạng Thái:** Production-Ready (Database-Backed & Type-Safe)

---

## 1. TỔNG QUAN & MỤC TIÊU KIẾN TRÚC

### 1.1. Bối Cảnh
Trong các phiên bản trước, tính năng quay thưởng may mắn (Lucky Draw) và cơ cấu giải thưởng sự kiện tại một số màn hình còn sử dụng mảng dữ liệu giả lập (mock data) và các emoji thô cứng (🏆, 🥇, 🥈, 🥉, 🎁, 🎰, ...), chưa có sự liên kết chặt chẽ với CSDL hàng hóa B2B và các gói tài trợ của doanh nghiệp hội viên.

### 1.2. Mục Tiêu Cốt Lõi
1. **Loại Bỏ Hoàn Toàn Icon Hardcode & Emoji Thô Cứng**:
   - Tích hợp trọn vẹn bộ Token thiết kế và thư viện biểu tượng chuẩn **ClickUp Design System** từ nguồn `https://designmd-store.com/packs/clickup` (lưu tại `DESIGN.md`).
   - Cung cấp component vector `ClickUpIcon`, `ClickUpBadgeIcon`, và biểu tượng nhận diện `ClickUpMark`.
2. **Động Hóa 100% Cơ Cấu Giải Thưởng Sự Kiện Từ CSDL (Zero Mock Data)**:
   - Khởi tạo bảng dữ liệu PostgreSQL `public.event_prizes`.
   - Toàn bộ giải thưởng hiển thị tại Banner Bốc Thăm (`LuckyDrawLandingBanner`) và Quản trị Gói tài trợ (`/sponsor-packages`) đều được truy vấn và lưu trữ trực tiếp vào CSDL.
3. **Mở Rộng Quản Trị Giải Thưởng Động Trong Phân Hệ Gói Tài Trợ**:
   - Thêm tab chuyển đổi "Cơ Cấu Giải Thưởng Sự Kiện & Bốc Thăm" bên cạnh "Gói Tài Trợ & Quyền Lợi".
   - Cung cấp bảng điều khiển thống kê KPI, bộ lọc theo sự kiện, và modal tạo/sửa giải thưởng (`PrizeEditorModal`).
4. **Typed Target Chuẩn Xác Khi Thiết Lập Giải Thưởng**:
   - Định nghĩa rõ ràng enum `PrizeTargetType`: `'PRODUCT' | 'SPONSOR_PACKAGE' | 'VOUCHER' | 'CASH' | 'CUSTOM'`.
   - Khi chọn loại đối tượng là `PRODUCT`, form tự động gọi API `GET /products` để lấy danh sách sản phẩm thật từ CSDL `public.products`. Khi người dùng chọn 1 sản phẩm cụ thể, hệ thống tự động điền: Tên giải thưởng, Doanh nghiệp tài trợ, Giá niêm yết (VND) và Link ảnh đại diện.
   - Khi chọn loại `SPONSOR_PACKAGE`, hệ thống liên kết với `public.sponsor_packages`.

---

## 2. KIẾN TRÚC CƠ SỞ DỮ LIỆU POSTGRESQL

Bảng `public.event_prizes` được thiết kế linh hoạt, hỗ trợ cả giải thưởng hiện vật, tiền mặt, voucher và sản phẩm tài trợ B2B:

```sql
CREATE TABLE IF NOT EXISTS public.event_prizes (
  id VARCHAR(64) PRIMARY KEY,
  event_id VARCHAR(64) REFERENCES public.events(id) ON DELETE SET NULL,
  rank_name VARCHAR(100) NOT NULL,            -- 'Giải Đặc Biệt', 'Giải Nhất', 'Giải Kim Cương', ...
  title VARCHAR(255) NOT NULL,                -- Tiêu đề giải thưởng
  value NUMERIC(15, 2) DEFAULT 0,             -- Trị giá VND thực tế
  amount VARCHAR(100),                        -- Chuỗi hiển thị: "100.000.000 VNĐ"
  quantity INT DEFAULT 1,                     -- Số lượng giải
  target_type VARCHAR(50) DEFAULT 'CUSTOM',   -- 'PRODUCT' | 'SPONSOR_PACKAGE' | 'VOUCHER' | 'CASH' | 'CUSTOM'
  target_id VARCHAR(100),                     -- ID của Product / SponsorPackage nếu liên kết
  sponsor_name VARCHAR(255),                  -- Tên nhà tài trợ / Doanh nghiệp trao giải
  sponsor_package_id VARCHAR(64),             -- Gói tài trợ liên kết (nếu có)
  description TEXT,                           -- Mô tả chi tiết giải thưởng
  icon_name VARCHAR(50) DEFAULT 'trophy',     -- Tên icon ClickUp (trophy, award, gift, diamond...)
  image_url TEXT,                             -- Ảnh sản phẩm / hình ảnh giải thưởng
  highlight_color VARCHAR(30) DEFAULT '#7612FA', -- Màu token ClickUp nổi bật
  status VARCHAR(30) DEFAULT 'active',        -- 'active' | 'drawn' | 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_prizes_event_id ON public.event_prizes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_prizes_target ON public.event_prizes(target_type, target_id);
```

---

## 3. THIẾT KẾ RESTFUL API (BACKEND NESTJS)

### 3.1. DTO Định Nghĩa
```typescript
export type PrizeTargetType = 'PRODUCT' | 'SPONSOR_PACKAGE' | 'VOUCHER' | 'CASH' | 'CUSTOM';

export class CreateEventPrizeDto {
  eventId?: string;
  rankName!: string;
  title!: string;
  value?: number;
  amount?: string;
  quantity?: number;
  targetType?: PrizeTargetType;
  targetId?: string;
  sponsorName?: string;
  sponsorPackageId?: string;
  description?: string;
  iconName?: string;
  imageUrl?: string;
  highlightColor?: string;
  status?: string;
}

export class UpdateEventPrizeDto extends PartialType(CreateEventPrizeDto) {}
```

### 3.2. Danh Sách Endpoints Quản Trị Giải Thưởng

| Phương thức | Đường dẫn API | Mô tả |
|---|---|---|
| `GET` | `/sponsors/prizes?eventId=...` | Danh sách cơ cấu giải thưởng (kèm thông tin sản phẩm và gói tài trợ) |
| `GET` | `/sponsors/prizes/:id` | Xem chi tiết 1 giải thưởng |
| `POST` | `/sponsors/prizes` | Tạo mới giải thưởng (hỗ trợ tự động bind sản phẩm) |
| `PUT` | `/sponsors/prizes/:id` | Cập nhật thông tin giải thưởng |
| `DELETE` | `/sponsors/prizes/:id` | Xóa giải thưởng khỏi hệ thống |
| `GET` | `/products` | Danh sách sản phẩm B2B thực tế từ CSDL để chọn làm giải thưởng |
| `GET` | `/admin/lucky-draw/config` | Cấu hình quay thưởng: nạp sự kiện thật, giải thưởng từ `event_prizes`, và đại biểu từ `event_registrations` |
| `POST` | `/admin/lucky-draw/config` | Lưu đồng bộ cấu hình và các giải thưởng trực tiếp vào `public.event_prizes` |

---

## 4. THƯ VIỆN BIỂU TƯỢNG CLICKUP DESIGN SYSTEM

Tập trung tại `apps/ceo1983_app_fe/src/components/icons/ClickUpIcons.tsx`:

### 4.1. Hệ Màu Token ClickUp (`CLICKUP_TOKENS`)
- **Logo & Brand:**
  - `logo-purple`: `#7612FA` (ClickUp Signature Purple)
  - `deep-purple`: `#6647F0`
- **Tones Nổi Bật:**
  - `electric-blue`: `#0091FF`
  - `ai-pink`: `#FF02F0`
  - `warning-orange`: `#F76808`
  - `neon-magenta`: `#FA12E3`
  - `cyan`: `#12D0FA`
  - `product-teal`: `#12A594`
  - `product-yellow`: `#FFC800`

### 4.2. Component `ClickUpIcon`
Hỗ trợ hiển thị vector linh hoạt theo tên icon:
- `trophy`: Cúp vàng danh dự / Giải đặc biệt.
- `award`: Huân chương giải thưởng / Giải nhất.
- `gift`: Hộp quà may mắn.
- `sparkles`: Hiệu ứng sao bốc thăm.
- `box` / `package`: Kiện hàng / Sản phẩm vật lý.
- `crown`: Vương miện Kim Cương.
- `star`: Ngôi sao tỏa sáng.
- `diamond`: Kim cương quý giá.
- `tag`: Nhãn hàng / Voucher.
- `target`: Mục tiêu trúng thưởng.
- `coins`: Giải thưởng tiền mặt.

### 4.3. Component `ClickUpBadgeIcon`
Bọc icon trong container hình vuông bo góc hiện đại với màu nền gradient theo độ đậm nhạt và viền mạ tinh tế, thay thế hoàn toàn các emoji thô sơ trong bảng dữ liệu và thẻ giải thưởng.

---

## 5. GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (FRONTEND IMPLEMENTATION)

### 5.1. Phân Hệ Gói Tài Trợ (`/sponsor-packages`)
- **Thanh Tab 2 Chế Độ**:
  1. `packages`: "Gói Tài Trợ & Quyền Lợi" (Kim Cương, Vàng, Bạc, Đồng...).
  2. `prizes`: "Cơ Cấu Giải Thưởng Sự Kiện & Bốc Thăm (Lucky Draw Prizes)".
- **Bộ Thẻ Thống Kê KPI Giải Thưởng**:
  - Tổng số giải thưởng sự kiện.
  - Tổng trị giá hiện vật & tiền mặt (VND).
  - Số lượng giải Đặc Biệt & Giải Nhất.
  - Số giải thưởng là Sản Phẩm B2B tài trợ.
- **Bảng Quản Trị Giải Thưởng Động**:
  - Lọc theo Sự kiện trực tiếp từ CSDL.
  - Cột hiển thị: Thứ hạng giải (Huy hiệu ClickUp), Tên giải thưởng & Quà tặng, Trị giá VND, Loại đối tượng (`PRODUCT` kèm badge sản phẩm, `SPONSOR_PACKAGE`, `CASH`, v.v.), Nhà tài trợ / Doanh nghiệp trao giải, Số lượng suất giải.
  - Thao tác: Sửa giải thưởng (`Pencil`), Xóa giải thưởng (`Trash2`).
- **Modal Thiết Lập Giải Thưởng (`PrizeEditorModal`)**:
  - Chọn sự kiện tổ chức.
  - Chọn thứ hạng giải thưởng (Giải Kim Cương, Đặc Biệt, Nhất, Nhì, Ba, Khuyến Khích, May Mắn).
  - Chọn **Loại quà tặng (`targetType`)**:
    - `PRODUCT (Sản phẩm từ kho B2B)`: Lập tức gọi API `GET /products`, mở dropdown chọn sản phẩm thực tế từ CSDL. Khi chọn, tự động điền Tên sản phẩm, Tên doanh nghiệp cung ứng, Giá trị thị trường và Hình ảnh.
    - `SPONSOR_PACKAGE (Quyền lợi theo gói tài trợ)`: Nạp danh sách từ `public.sponsor_packages`.
    - `VOUCHER`, `CASH`, `CUSTOM`: Tùy chỉnh thông tin linh hoạt.
  - Nhập số lượng giải, đơn vị giá trị, mô tả và chọn icon ClickUp tương ứng.

### 5.2. Banner Quay Thưởng Bốc Thăm May Mắn (`LuckyDrawLandingBanner.tsx`)
- Không còn hardcode bất kỳ mảng sự kiện hay giải thưởng giả định nào.
- Dữ liệu sự kiện được lấy từ `GET /admin/lucky-draw/config` (truy vấn từ `public.events` và `public.event_prizes`).
- Mọi giải thưởng hiển thị đều có icon ClickUp sắc nét và màu sắc token nhận diện cao cấp.
- Modal Thiết Lập Quay Thưởng (`LuckyDrawSetupModal`) cho phép Ban Tổ Chức tùy biến cơ cấu giải thưởng kết nối trực tiếp kho sản phẩm B2B trước khi bắt đầu phiên quay thưởng trực tiếp tại hội trường.

---

## 6. QUY TRÌNH KIỂM TRA CHẤT LƯỢNG (STRICT VERIFICATION)

Hệ thống đã trải qua kiểm tra chất lượng theo chuẩn nghiêm ngặt của `AGENTS.md`:
1. **Kiểm Tra Type Check (TypeScript Verification)**:
   - `apps/ceo1983_app_be`: `npx tsc --noEmit` -> **Exit code 0 (0 errors)**.
   - `apps/ceo1983_app_fe`: `npx tsc --noEmit` -> **Exit code 0 (0 errors)**.
2. **Kiểm Tra Hoạt Động CSDL**:
   - Bảng `public.event_prizes` đã được tạo và chứa dữ liệu liên kết với các sản phẩm thật trong `public.products`.
3. **Tuân Thủ Quy Định Git**:
   - Tuyệt đối không tự ý thực hiện `git push` hay `git commit`. Toàn bộ mã nguồn sẵn sàng trên local.
