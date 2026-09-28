# QUY CHUẨN THIẾT KẾ GIAO DIỆN (UI/UX) - WEB CRM CEO 1983
## HỆ THỐNG QUẢN TRỊ ĐIỀU HÀNH & HỘI VIÊN DÀNH CHO BAN QUẢN TRỊ CLB DOANH NHÂN CEO 1983

> **Phiên bản:** v3.0 - Chuẩn Hóa Theo Chỉ Đạo Nâng Cấp Hệ Sinh Thái Toàn Diện  
> **Áp dụng cho:** Phân hệ Web CRM Quản trị CLB CEO 1983 (`ceo1983_crm_fe` / `ceo1983_app_fe`)  
> **Triết lý chủ đạo:** Nghiêm túc, Minh bạch, Chuẩn xác, Tối giản, Đẳng cấp Doanh nhân B2B.  
> **NGUYÊN TẮC CỐT LÕI:** "CÀNG ÍT MÀU - ÍT CHỮ CÀNG TỐT - TỐI ƯU HÓA QUẢN TRỊ B2B - TRÁNH NÚT ĐEN & NÚT CAM LÒE LOẸT"

---

## 1. NGUYÊN TẮC THIẾT KẾ BẮT BUỘC (CRITICAL MANDATES)

1. **QUY CHUẨN NÚT BẤM (BUTTONS & ACTIONS):**
   - **Tuyệt đối KHÔNG sử dụng màu đen tuyền (`#000000`)** cho các nút bấm hành động chính, nút xác nhận, hoặc nút tạo mới vì tạo cảm giác u ám, thiếu chuyên nghiệp và vi phạm bảng màu thương hiệu.
   - **Tuyệt đối KHÔNG sử dụng nút hay viền màu cam chói lóa (`#F97316` / `#FB923C`):**
   - Các dạng nút chuẩn hóa trên toàn hệ thống CRM:
     - **Dạng 1 (Nút thao tác chính cao cấp - Premium CTA):** Nền Champagne Gold Gradient:
       `background: linear-gradient(135deg, #F6E1C3 0%, #D8B282 45%, #C29B69 70%, #8C653B 100%)`, Chữ Slate-900 đậm (`text-slate-900 font-bold`), bóng đổ nhẹ sang trọng. Dùng cho: Nút Thêm mới, Duyệt đăng ký quảng cáo, Kích hoạt ưu đãi, Check-in & Gatekeeper.
     - **Dạng 2 (Nút thao tác chính điều hành - Brand Navy Primary CTA):** Nền Xanh Navy `#003B95`, Chữ Trắng (`text-white font-medium`), hover đậm hơn (`hover:bg-[#002B70]`). Dùng cho: Duyệt hồ sơ, Xuất báo cáo, Lưu cấu hình, Tạo sự kiện.
     - **Dạng 3 (Nút phụ / Nút lọc / Xuất file / Đóng / Hủy):** Nền Trắng (`bg-white` hoặc `bg-card`), Chữ Xám đậm (`text-slate-700`), Viền xám mỏng (`border border-slate-200 dark:border-slate-800`). Hover chuyển nền nhẹ (`hover:bg-slate-50 dark:hover:bg-slate-900`).
     - **Dạng 4 (Nút cảnh báo / Xóa):** Nền đỏ nhạt (`bg-rose-50 text-rose-600 border border-rose-200`), hover nền đỏ đậm hơn.

2. **ĐỒNG BỘ KÍCH THƯỚC NÚT VÀ CỤM ĐIỀU KHIỂN:**
   - Chiều cao các nút bấm, ô tìm kiếm và ô chọn bộ lọc (Select/Dropdown) phải bằng nhau tuyệt đối (`h-9` hoặc `h-10`, `rounded-xl`).
   - Khoảng cách giữa các phần tử đều đặn (`gap-2` hoặc `gap-3`), bố trí cân đối theo chuẩn Desktop Dashboard.

3. **GIAO DIỆN TỐI GIẢN & THẺ THỐNG KÊ (MINIMALISTIC DATA TABLES & CARDS):**
   - Bảng dữ liệu nền trắng phẳng, đường kẻ mỏng `border-slate-100 dark:border-slate-800`, dòng chẵn lẻ dịu mắt.
   - Không chèn các icon trang trí vô nghĩa vào avatar hội viên, tiêu đề cột hay các ô dữ liệu.
   - Text ngắn gọn, súc tích, đúng thuật ngữ nghiệp vụ hội nhập B2B.

---

## 2. QUY CHUẨN CẤU TRÚC ĐIỀU HƯỚNG SIDEBAR (NAVIGATION HIERARCHY)

Hệ thống thanh menu bên trái (Sidebar) của Web CRM được chuẩn hóa theo cấu trúc phân tầng nghiệp vụ chặt chẽ, loại bỏ hoàn toàn các nhóm chức năng thừa hoặc trùng lặp:

```
[LOGO CEO 1983 - EXECUTIVE CRM]
├── TỔNG QUAN (Overview)
│   └── Bàn làm việc (/dashboard)
│
├── HỘI VIÊN (Members)
│   ├── Danh sách hội viên (/members)
│   ├── Tiếp nhận & Duyệt hồ sơ (/members/onboarding)
│   ├── Chi hội & Ban ngành (/chapters)
│   ├── Quyền lợi & Ưu đãi sinh nhật (/perks)
│   └── Đóng góp & Ý kiến (/feedback)
│
├── KẾT NỐI (Networking & Business Connect)
│   ├── Cuộc gặp 1-on-1 (/business-connect/meetings) [MỚI CHUYỂN VÀO]
│   ├── Danh thiếp đã lưu (/business-connect/saved-cards) [MỚI CHUYỂN VÀO]
│   ├── Lịch sinh hoạt & Cuộc họp CLB (/meetings)
│   └── Biểu quyết (/voting)
│
├── HOẠT ĐỘNG (Activities & Operations)
│   ├── Sự kiện & Soát vé QR (/events)
│   ├── Tin tức & Truyền thông (/news)
│   ├── Quản lý Quảng cáo Marketplace (/marketplace) [CHUYỂN THÀNH ADS ADMIN]
│   └── Văn bản & Tài liệu (/documents)
│
├── TÀI CHÍNH (Finance - Chỉ hiển thị cho Admin & Ban Tài Chính)
│   ├── Báo cáo thu chi (/finance)
│   ├── Quỹ CLB (/finance/funds)
│   └── Niên liễm hội viên (/membership-fees)
│
├── HỆ THỐNG (System & Configuration)
│   ├── Quản lý Chủ đề Landing & Giao diện (/admin/landing-templates) [CHUYỂN XUỐNG ĐÂY]
│   ├── Cấu hình thông báo (/settings/notifications)
│   └── Thiết lập chung (/settings)
│
└── QUẢN TRỊ (Platform Administration - Chỉ dành cho Super Admin)
    ├── Quản trị người dùng & Phân quyền (/admin/users)
    ├── Phân quyền vai trò RBAC (/admin/roles)
    └── Nhật ký hệ thống Audit Logs (/admin/logs)
```

> **Ghi chú thay đổi cấu trúc Sidebar quan trọng:**
> - **Loại bỏ vĩnh viễn nhóm "BUSINESS CONNECT" độc lập** 
> - Menu xây dựng chức năgn **"Quản lý chủ đề"** (`/admin/landing-templates`) .

---

## 3. QUY CHUẨN CÁC PHÂN HỆ NGHIỆP VỤ MỚI NÂNG CẤP

### 3.1. Phân hệ Quản trị Ưu Đãi Sinh Nhật Hội Viên (`perks.tsx` -> `BirthdayPromoManager`)
- **Vị trí:** Phân hệ "Quyền lợi & Ưu đãi" (`/perks`), hiển thị dưới dạng Tab cấu hình chuyên dụng hoặc Khối điều hành độc lập.
- **Thành phần điều khiển:**
  - **Công tắc bật/tắt (Toggle Switch):** Cho phép bật hoặc tạm dừng chương trình tự động chúc mừng sinh nhật trên toàn hệ thống.
  - **Mẫu thông điệp chúc mừng:** Ô nhập nội dung lời chúc mừng mang đậm dấu ấn CLB Doanh Nhân CEO 1983. Hỗ trợ biến số tự động: `{memberName}`, `{associationName}`.
  - **Giá trị quà tặng / Ưu đãi:** Thiết lập % giảm giá hoặc trị giá quà tặng (VD: Giảm 20% tất cả dịch vụ trong hệ sinh thái CEO 1983).
  - **Mã Voucher độc quyền:** Mã khuyến mãi sinh nhật (VD: `SINHNHAT-CEO1983-2026`).
  - **Thời hạn áp dụng:** Số ngày hiệu lực của voucher kể từ ngày sinh nhật (Mặc định: 30 ngày).
  - **Khung Preview Banner:** Mô phỏng trực quan giao diện Popup Modal mà hội viên sẽ nhìn thấy khi mở App Hiệp hội vào ngày sinh nhật.

### 3.2. Phân hệ Quản lý Quảng Cáo & Tiếp Thị Liên Kết Marketplace (`marketplace.index.tsx` -> `MarketplaceAdsManager`)
- **Triết lý chuyển đổi:** Loại bỏ hoàn toàn các tab duyệt hàng hóa thông thường (nổi bật, mới đăng, danh mục) vốn dành cho người mua trên App, biến trang Marketplace trong CRM thành **Trung tâm Quản trị & Điều phối Quảng cáo Doanh nghiệp (Sponsorship & Affiliate Ads Center)**.
- **Quy trình tiếp nhận & duyệt:**
  1. Doanh nghiệp hội viên gửi đơn đăng ký quảng cáo từ App Hiệp hội (bao gồm Tên thương hiệu, Tên sản phẩm/dịch vụ, Tiêu đề quảng cáo, Mô tả, Ảnh banner 16:9, Link liên kết web/Zalo/hotline).
  2. CRM tiếp nhận yêu cầu với trạng thái ban đầu: `Chờ duyệt (pending)`.
  3. Quản trị viên kiểm tra nội dung và thiết lập gói chiến dịch:
     - Chi phí quảng cáo (VND).
     - Thời lượng hiển thị (Số ngày).
     - Vị trí hiển thị trên App: Đầu trang (Top Hero Carousel), Giữa danh sách sản phẩm (In-feed Native), hoặc Ghim đầu trang (Pinned).
  4. **Thanh toán VietQR Napas 24/7:**
     - Bấm nút **"Xuất Mã VietQR Thanh Toán"** sẽ hiển thị Modal thanh toán với mã QR chuẩn VietQR sinh động (Số tài khoản MB Bank thụ hưởng, số tiền chính xác, nội dung chuyển khoản mã hóa chuẩn: `CEO1983_AD_{id}`).
     - Có chức năng sao chép thông tin chuyển khoản và tải ảnh mã QR.
  5. Sau khi nhận thanh toán, Admin chuyển trạng thái thành `Đang chạy (active)`. Hệ thống tự động kích hoạt đẩy banner quảng cáo xuống Carousel Marketplace của App Hiệp hội ngay tức thì.

### 3.3. Phân hệ Quản lý Check-in & Gatekeeper Sự Kiện (`events.index.tsx` & `EventCheckinGatekeeperModal.tsx`)
- **Nút thao tác nhanh:** Mỗi hàng/thẻ sự kiện trong CRM đều có nút nổi bật: **"Quản lý Check-in & Soát vé"** (icon ShieldCheck, style Champagne Gold Gradient).
- **Cấu trúc 3 Tab điều hành:**
  - **Tab 1: Mã QR Standee Sự Kiện:**
    - Sinh mã QR khổ lớn chuẩn format: `event_checkin:{eventId}:{encodeURIComponent(eventName)}`.
    - Hỗ trợ nút **"In Standee A4 / Roll-up"** (gọi lệnh in ấn sẵn khổ chuẩn sự kiện) và nút **"Tải / Sao chép Mã"**.
    - Hội viên quét mã này bằng App sẽ tự động điểm danh, nhận số bàn/ghế và mã số may mắn.
  - **Tab 2: Phân Quyền Ban Soát Vé Tại Cửa (Gatekeeper Assignment):**
    - Thêm/bớt người soát vé bằng Họ tên và Số điện thoại.
    - Phân quyền động: Chỉ những thành viên có tên trong danh sách này khi đăng nhập App Hiệp hội mới được hiển thị chức năng và Camera quét vé tham dự của người tham gia.
  - **Tab 3: Người Tham Gia & Điểm Danh Trực Tiếp (Attendees & Manual Check-in):**
    - Bảng danh sách tất cả hội viên đã đăng ký tham gia sự kiện.
    - Thống kê tỷ lệ điểm danh theo thời gian thực (VD: 45/120 hội viên đã có mặt).
    - Công cụ tìm kiếm nhanh theo Tên, Mã hội viên, Số điện thoại.
    - Nút điểm danh thủ công (Manual Check-in) dành cho các trường hợp hội viên quên điện thoại hoặc điện thoại hết pin.
    - Quản lý phân bổ Vị trí Bàn/Ghế (VD: Bàn VIP 01, Bàn 08) và Mã số bốc thăm may mắn (VD: LUCK-8319).

### 3.4. Phân hệ Quản trị Cuộc Gặp 1-on-1 Doanh Nhân (`meetings.tsx` & `Create1on1MeetingModal.tsx`)
- **Kiến trúc:** Chạy trực tiếp qua cơ chế REST API / Supabase RPC, loại bỏ hoàn toàn sự phụ thuộc vào hàng đợi Redis để đảm bảo 100% tính ổn định khi chạy trên môi trường Web CRM tiêu chuẩn.
- **Trải nghiệm trực quan Cuộc họp Offline:** Tích hợp Google Maps iframe gọn gàng trong chi tiết cuộc họp, kèm nút mở Google Maps điều hướng đường đi nhanh cho doanh nhân.
- **Trải nghiệm trực quan Cuộc họp Online:** Tích hợp nút launcher kích hoạt Google Meet hoặc Zoom trực tiếp chỉ bằng một click.
- **Form Tạo Cuộc Gặp 1-on-1 Chuẩn Format CEO 1983:**
  - Chọn đối tác hẹn gặp từ danh bạ hội viên.
  - Chủ đề / Mục tiêu cuộc gặp (VD: Trao đổi hợp tác cung ứng vật tư, Chia sẻ cơ hội kinh doanh).
  - Hình thức: Trực tiếp (Địa chỉ cụ thể, quán cafe, phòng họp CLB) hoặc Trực tuyến (Link Google Meet).
  - Ngày giờ hẹn bắt đầu và thời lượng dự kiến.
  - Ghi chú bảo mật cho cuộc gặp.

### 3.5. Quy chuẩn Bố cục Chi tiết Sự kiện (`events.$eventId.tsx`)
- **Banner Hero:** Ảnh bìa sự kiện hiển thị khổ ngang chuẩn tỷ lệ với chiều cao tối đa 240px, chống vỡ khung hình (`overflow-hidden rounded-2xl`).
- **Lớp phủ Gradient Tối:** Phủ lớp `linear-gradient(to top, rgba(15,23,42,0.95), rgba(15,23,42,0.6), transparent)` giúp tôn vinh tiêu đề sự kiện màu vàng kim và thông tin ngày giờ mà không bị chìm màu.
- **Đầy đủ trường thông tin cập nhật:** Banner URL (`imageUrl`), Nhân sự phụ trách soát vé (`qrStaff`), Mô tả chi tiết, Số lượng vé tối đa, Địa điểm Google Maps.

---

## 4. BẢNG MÀU CHUẨN HỆ THỐNG WEB CRM CEO 1983

| Tên Màu | Mã HEX / CSS | Tailwind Class | Áp Dụng |
| :--- | :--- | :--- | :--- |
| **Champagne Gold Gradient** | `linear-gradient(135deg, #F6E1C3 0%, #D8B282 45%, #C29B69 70%, #8C653B 100%)` | Style Inline / Custom | Nút CTA chính cao cấp, Nút Soát vé, Nút Duyệt |
| **CRM Navy Brand** | `#003B95` | `bg-[#003B95]`, `text-[#003B95]` | Thanh Sidebar, Nút Lưu, Header bảng |
| **Royal Dark Navy** | `#0A1834` | `bg-[#0A1834]` | Header trang điều hành, Card thống kê VIP |
| **Clean White** | `#FFFFFF` | `bg-white` | Nền trang, nền bảng dữ liệu, nền modal |
| **Table Header Gray** | `#F8FAFC` | `bg-slate-50 dark:bg-slate-900` | Nền hàng tiêu đề bảng danh sách |
| **Border Divider** | `#E2E8F0` | `border-slate-200 dark:border-slate-800` | Viền ô nhập liệu, đường phân cách bảng |
| **Dark Text** | `#0F172A` | `text-slate-900` | Số liệu thống kê, tên hội viên, tiêu đề |
| **Muted Text** | `#64748B` | `text-slate-500` | Ngày tháng, mã định danh, mô tả phụ |
| **Success Emerald** | `#10B981` | `text-emerald-500`, `bg-emerald-50` | Trạng thái Đang hoạt động, Đã điểm danh |
| **Warning Amber** | `#F59E0B` | `text-amber-500`, `bg-amber-50` | Trạng thái Chờ duyệt, Nhắc nhở |
| **Subtle Blue Hover** | `#EFF6FF` | `hover:bg-blue-50 dark:hover:bg-blue-950/20` | Highlight dòng bảng khi rê chuột |

---

## 5. BẢO ĐẢM CHẤT LƯỢNG & KHẢ NĂNG TIẾP CẬN (A11Y & QA)
- Độ tương phản chữ đạt tiêu chuẩn WCAG AA (Tối thiểu 4.5:1 đối với văn bản thông thường).
- Nút bấm có chiều cao tối thiểu 36px (`h-9`), kích thước vùng chạm chuột/cảm ứng đạt chuẩn.
- Mọi hộp thoại Modal đều có nút đóng (`X`), phím `Esc` hỗ trợ thoát nhanh, và khóa cuộn nền (`overflow-hidden` trên `body`).
