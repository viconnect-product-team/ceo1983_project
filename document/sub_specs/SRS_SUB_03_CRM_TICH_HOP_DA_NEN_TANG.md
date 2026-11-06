# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## PHÂN HỆ QUẢN TRỊ TÍCH HỢP ĐA NỀN TẢNG & LANDING WEB (SUB-03)
**HỆ THỐNG QUẢN TRỊ HIỆP HỘI DOANH NHÂN CEO 1983 (HANOIBA)**

---

### THÔNG TIN TÀI LIỆU
- **Mã tài liệu:** `CEO1983-SRS-SUB-03`
- **Mã định danh Functional Node:** `[NODE-CRM-011]` (Cấu hình Nền tảng & Zalo Mini App) & `[NODE-CRM-016]` (Quản trị Landing Web Đa mẫu)
- **Tiêu chuẩn áp dụng:** IEEE 830 Software Requirements Specification, OS-46 (Design Pattern Pragmatism - Adapter & Builder), OS-47 (Security 6-Layer Gate), OS-49 (Monorepo Feature Architecture)
- **Ngày ban hành:** 06/11/2026 (Phiên bản 5.2 - Chuẩn hóa Kỹ thuật)

---

### 1. KIẾN TRÚC TỔNG QUAN PHÂN HỆ (SYSTEM ARCHITECTURE)

```mermaid
flowchart TD
    subgraph Client_Tier["LỚP GIAO DIỆN (CRM WEB APPS)"]
        UI_PlatformConfig["Trang Cấu hình Nền tảng\n(apps/ceo1983_app_fe/src/app/platform/page.tsx)"]
        UI_LandingBuilder["Trình dựng Landing Web Đa mẫu\n(apps/ceo1983_app_fe/src/app/landing/page.tsx)"]
        UI_PreviewModal["Bộ xem trước Trực quan Responsive\n(Mẫu Thẻ Cuộn & Mẫu Mobile App Showcase)"]
    end

    subgraph API_Gateway["LỚP GATEWAY BẢO MẬT & ĐIỀU PHỐI (NestJS)"]
        Controller_Platform["PlatformController\n(/api/platform/social-config)"]
        Controller_Landing["LandingWebController\n(/api/landing-pages)"]
        Subdomain_Middleware["Subdomain Routing Interceptor\n(Định tuyến subdomain sang template)"]
    end

    subgraph Service_Domain["LỚP NGHIỆP VỤ & PATTERNS"]
        Service_Platform["PlatformIntegrationService"]
        Adapter_Facebook["FacebookSyndicationAdapter\n(Adapter Pattern theo OS-46)"]
        Adapter_Zalo["ZaloMiniAppAdapter\n(Adapter Pattern theo OS-46)"]
        Builder_Landing["LandingPageBuilderService\n(Builder Pattern theo OS-46)"]
    end

    subgraph Persistence_Tier["LỚP DỮ LIỆU POSTGRESQL"]
        DB_SocialConfig[("Bảng platform_social_configs\n(Link FB, Group, Zalo, App ID)")]
        DB_LandingWeb[("Bảng landing_pages & landing_sections\n(Template, Tree Menu, CTA, Slugs)")]
    end

    UI_PlatformConfig -->|JWT Bearer + RBAC| Controller_Platform
    UI_LandingBuilder -->|JWT Bearer + Schema Validation| Controller_Landing
    UI_PreviewModal --> Controller_Landing

    Controller_Platform --> Service_Platform
    Service_Platform --> Adapter_Facebook
    Service_Platform --> Adapter_Zalo
    Service_Platform --> DB_SocialConfig

    Controller_Landing --> Builder_Landing
    Builder_Landing --> DB_LandingWeb
    Subdomain_Middleware --> Builder_Landing
```

---

### 2. LUỒNG XỬ LÝ DỮ LIỆU ĐỒNG BỘ ĐA NỀN TẢNG (END-TO-END DATA FLOW)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Ban Thư Ký / Quản trị viên
    participant FE as Web CRM UI
    participant Gateway as API Gateway
    participant Adapter as Social Platform Adapter
    participant MetaZalo as Facebook / Zalo Open Graph API
    participant DB as PostgreSQL DB

    Admin->>FE: Nhập cấu hình Fanpage FB, Nhóm Zalo, Zalo OA ID
    FE->>Gateway: POST /api/platform/social-config (Payload kiểm tra định dạng URL)
    Gateway->>DB: Lưu cấu hình vào platform_social_configs
    DB-->>Gateway: Trả về trạng thái đã lưu
    Gateway-->>FE: Thông báo "Lưu cấu hình thành công"

    Admin->>FE: Tạo Sự kiện mới & Tích chọn "Đăng tự động lên Nhóm FB/Zalo"
    FE->>Gateway: POST /api/events (kèm cờ auto_syndicate = true)
    Gateway->>DB: Ghi dữ liệu sự kiện vào bảng events
    Gateway->>Adapter: Kích hoạt syndication (Event Data, Image Cover, Shortlink)
    Adapter->>MetaZalo: Bắn Webhook / Graph API bài tóm tắt kèm chuẩn OpenGraph
    MetaZalo-->>Adapter: Trả về Post ID thành công
    Adapter->>DB: Cập nhật nhật ký syndication_logs
    Gateway-->>FE: Phản hồi 201 Created kèm mã bài viết đồng bộ
```

---

### 3. ĐẶC TẢ YÊU CẦU CHỨC NĂNG CHI TIẾT (FUNCTIONAL SPECIFICATIONS)

#### 3.1 Cấu hình Tích hợp Mạng xã hội & Zalo Mini App `[NODE-CRM-011]`
- **Mã chức năng:** `SPEC-CRM-PLT-001`
- **Mục tiêu:** Cung cấp biểu mẫu quản trị các trường thông tin tích hợp:
  - `facebook_fanpage_url`: Đường dẫn Fanpage chính thức CEO 1983.
  - `facebook_group_url`: Đường dẫn Nhóm giao thương kín của Hội viên.
  - `zalo_oa_id`: Mã Zalo Official Account chính thức.
  - `zalo_group_url`: Đường dẫn nhóm Zalo trao đổi thông tin nhanh.
  - `zalo_miniapp_id`: Định danh ứng dụng nhỏ Zalo được cấp phép.
  - `auto_post_events`: Cờ bật/tắt tự động đăng bài khi có sự kiện mới.
  - `auto_post_meetings`: Cờ bật/tắt tự động thông báo lịch họp câu lạc bộ.
- **Ràng buộc an toàn:** Mọi URL đều được regex kiểm tra chống URL giả mạo hoặc chèn mã độc.

#### 3.2 Quản trị Landing Web Đa Mẫu Thiết kế `[NODE-CRM-016]`
- **Mã chức năng:** `SPEC-CRM-LND-001`
- **Mục tiêu:** Cho phép tạo lập, cấu hình và kích hoạt các trang đích với 2 mẫu thiết kế độc quyền:
  1. **Mẫu 1 - Thẻ Chuyển Động Theo Trục Cuộn (Scroll Timed Cards Opening):**
     - Thiết kế chuyển động toàn trang khi người dùng cuộn chuột (Mouse Wheel / Touch Scroll).
     - Không cần nút bấm trái phải; giao diện tự tính toán ngưỡng cuộn để chuyển thẻ thông tin mượt mà.
     - 4 khối nội dung chính: Bối cảnh thành lập 1983, Sứ mệnh phụng sự, Giá trị giao thương, Đăng ký tham gia.
  2. **Mẫu 2 - Trưng bày Ứng dụng Di động Hội viên (Startup Mobile Showcase):**
     - Mô phỏng mô hình điện thoại iPhone 16 viền siêu mỏng, hiển thị giao diện động của Mobile App CEO 1983.
     - Khối 4 Chỉ số vàng: Tổng doanh nhân kết nối, Tổng giá trị cơ hội giao thương đã chốt, Số lượt kết nối 1-on-1 thành công, Tỷ lệ gắn kết hoạt động.
     - Khối Thẻ Tính Năng 3D với hiệu ứng bóng đổ và chuyển động thị giác chiều sâu.
     - Khối Câu hỏi thường gặp (FAQ) dạng mở rộng/thu gọn (Accordion) thân thiện.
- **Quản trị Menu Cây Đa Cấp (Tree Menu Management):**
  - Người dùng có thể thêm mục menu cấp 1, cấp 2 linh hoạt.
  - Thiết lập hành vi menu: Cuộn đến thẻ nội dung (Anchor Link) hoặc Mở trang con độc lập.
- **Quản lý Nút Kêu Gọi Hành Động (CTA Buttons):**
  - Tùy chỉnh màu sắc nút (ưu tiên sắc đỏ son HANOIBA và vàng kim), nhãn văn bản, biểu tượng và đích đến (Mở cổng đăng ký hội viên, mở Zalo Mini App, gọi hotline).

---

### 4. ĐẶC TẢ HỢP ĐỒNG API (API CONTRACTS)

#### 4.1 Cập nhật Thông số Cấu hình Mạng xã hội
- **Đường dẫn:** `PUT /api/platform/social-config`
- **Yêu cầu Xác thực:** Bearer JWT (Chỉ cấp quyền cho Quản trị viên cấp cao `system_admin`)
- **Body Request (JSON):**
```json
{
  "facebook_fanpage_url": "https://www.facebook.com/ceo1983hanoiba",
  "facebook_group_url": "https://www.facebook.com/groups/ceo1983connection",
  "zalo_oa_id": "382910394829102",
  "zalo_group_url": "https://zalo.me/g/ceo1983vietnam",
  "zalo_miniapp_id": "zma_ceo1983_official_prod",
  "auto_post_events": true,
  "auto_post_meetings": false
}
```
- **Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cfg_social_1983",
    "updated_at": "2026-11-06T08:45:00.000Z",
    "status": "ACTIVE"
  },
  "message": "Cập nhật cấu hình tích hợp đa nền tảng thành công"
}
```

#### 4.2 Lưu Trữ Cấu Hình Trang Đích (Landing Web)
- **Đường dẫn:** `POST /api/landing-pages`
- **Body Request (JSON):**
```json
{
  "title": "CEO 1983 - Kỷ nguyên Giao thương Số",
  "slug": "kyn-nguyen-so-1983",
  "subdomain": "kyn-nguyen.ceo1983.com",
  "template_type": "STARTUP_MOBILE_SHOWCASE",
  "navigation_tree": [
    {
      "label": "Giới thiệu",
      "href": "#about",
      "children": [
        { "label": "Lịch sử 1983", "href": "#history" },
        { "label": "Ban Điều Hành", "href": "#board" }
      ]
    },
    { "label": "Hệ sinh thái Số", "href": "#app-showcase" },
    { "label": "Chỉ số Vàng", "href": "#metrics" },
    { "label": "Hỏi đáp", "href": "#faq" }
  ],
  "metrics": {
    "members_count": "500+",
    "deals_value_billion": "1,250",
    "meetings_count": "3,400+",
    "retention_rate": "98.5%"
  },
  "cta_config": {
    "label": "Gia nhập CLB CEO 1983",
    "target_url": "/register",
    "theme_color": "PRIMARY_RED"
  },
  "is_published": true
}
```

---

### 5. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)
1. **Hiệu năng & Tối ưu Băng thông:**
   - Landing Web công khai phải đạt điểm Google Lighthouse tối thiểu 90 điểm về Performance và SEO.
   - Toàn bộ ảnh nền và mô hình điện thoại được tối ưu định dạng WebP với kích thước dưới 250KB.
2. **Tuân thủ Bảo mật OS-47 & OS-49:**
   - Cấm lưu trữ API Secret của Facebook/Zalo ở Frontend. Mọi lệnh gọi API nền tảng thứ ba bắt buộc ủy thác cho Backend thông qua `Adapter Pattern`.
   - Ngăn chặn triệt để lỗ hổng XSS khi lưu trữ nội dung Rich Text thông qua bộ lọc `DOMPurify` trước khi kết xuất.
   - Thiết lập CSP (Content Security Policy) chặt chẽ, chỉ cho phép nạp tài nguyên từ các tên miền hợp lệ của Facebook và Zalo.

