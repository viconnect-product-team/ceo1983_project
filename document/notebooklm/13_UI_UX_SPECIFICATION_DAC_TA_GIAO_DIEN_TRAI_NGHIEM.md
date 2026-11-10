# HỆ SINH THÁI NỀN TẢNG SỐ CLB DOANH NHÂN CEO 1983 (HANOIBA)

## TÀI LIỆU ĐẶC TẢ GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG TOÀN DIỆN
*(UI/UX DESIGN SYSTEM & EXTERNAL INTERFACE SPECIFICATION - MASTER EDITION)*
*Chuẩn Nhận Diện Hoàng Gia: Xanh Navy (#1B365D) — Vàng Ánh Kim (#D4AF37) — Xanh Ngọc (#00A86B)*
*Thiết kế Đa Nền Tảng: Desktop Web CRM (Full HD) & CEO 1983 Mobile App (Mobile-First PWA / Capacitor)*

---

* **Mã tài liệu:** `UIUX-SPEC-CEO1983-MASTER-V10.0`
* **Phiên bản:** `10.0.0-PROD` (Đặc tả chi tiết 25 màn hình Web CRM, 18 màn hình Mobile App, Quy chuẩn Design System & Trải nghiệm 3-Click)
* **Cơ quan chủ quản:** Câu Lạc Bộ Doanh Nhân CEO 1983 — Trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)
* **Đơn vị thiết kế & kiểm chuẩn:** VICONNECT - Đội Ngũ Sáng Tạo & Kỹ Sư Trải Nghiệm Người Dùng (UI/UX Guild)
* **Ngày phát hành:** Tháng 11/2026

---

## MỤC LỤC TỔNG QUAN

- [CHƯƠNG 1: HỆ THỐNG NHẬN DIỆN THƯƠNG HIỆU & DESIGN SYSTEM HOÀNG GIA](#chương-1-hệ-thống-nhận-diện-thương-hiệu--design-system-hoàng-gia)
  - [1.1. Triết Lý Thiết Kế 3 Màu Nhận Diện Cốt Lõi](#11-triết-lý-thiết-kế-3-màu-nhận-diện-cốt-lõi)
  - [1.2. Bảng Màu Hệ Thống Toàn Diện (Color Tokens)](#12-bảng-màu-hệ-thống-toàn-diện-color-tokens)
  - [1.3. Quy Chuẩn Kiểu Chữ & Phông Chữ (Typography)](#13-quy-chuẩn-kiểu-chữ--phông-chữ-typography)
  - [1.4. Hệ Thống Khoảng Cách & Lưới Bố Cục (Spacing & Layout Grids)](#14-hệ-thống-khoảng-cách--lưới-bố-cục-spacing--layout-grids)
  - [1.5. Thư Viện Thành Phần Dùng Chung (Component Library Specs)](#15-thư-viện-thành-phần-dùng-chung-component-library-specs)
- [CHƯƠNG 2: ĐẶC TẢ CHI TIẾT 25 MÀN HÌNH CỔNG QUẢN TRỊ WEB CRM](#chương-2-đặc-tả-chi-tiết-25-màn-hình-cổng-quản-trị-web-crm)
  - [2.1. Cấu Trúc Khung Màn Hình CRM (Sidebar, Header, Main Content)](#21-cấu-trúc-khung-màn-hình-crm-sidebar-header-main-content)
  - [2.2. Phân Hệ Thống Kê & Bảng Điều Khiển Tổng Quan (Dashboard Recharts)](#22-phân-hệ-thống-kê--bảng-điều-khiển-tổng-quan-dashboard-recharts)
  - [2.3. Phân Hệ Quản Trị Danh Sách Hội Viên 360 Độ](#23-phân-hệ-quản-trị-danh-sách-hội-viên-360-độ)
  - [2.4. Phân Hệ Thẩm Định & Phê Duyệt Kết Nạp](#24-phân-hệ-thẩm-định--phê-duyệt-kết-nạp)
  - [2.5. Phân Hệ Quản Trị Tài Chính, Hội Phí & Sổ Quỹ Thu - Chi](#25-phân-hệ-quản-trị-tài-chính-hội-phí--sổ-quỹ-thu---chi)
  - [2.6. Phân Hệ Quản Lý Sự Kiện & Bàn Tiệc VIP Keangnam](#26-phân-hệ-quản-lý-sự-kiện--bàn-tiệc-vip-keangnam)
  - [2.7. Studio Thiết Kế Poster Thư Mời Wyndham Thanh Thủy 9:16 Pinterest](#27-studio-thiết-kế-poster-thư-mời-wyndham-thanh-thủy-916-pinterest)
  - [2.8. Phân Hệ Phát Sóng Đa Kênh Omnichannel (Zalo OA ZNS, Email, App)](#28-phân-hệ-phát-sóng-đa-kênh-omnichannel-zalo-oa-zns-email-app)
  - [2.9. Phân Hệ Quản Trị Công Việc Kanban & AI Bóc Tách Nhiệm Vụ](#29-phân-hệ-quản-trị-công-việc-kanban--ai-bóc-tách-nhiệm-vụ)
  - [2.10. Phân Hệ Kho Văn Thư & Trình Xem Tài Liệu (Word, Excel, PDF)](#210-phân-hệ-kho-văn-thư--trình-xem-tài-liệu-word-excel-pdf)
  - [2.11. Phân Hệ Cài Đặt Hệ Thống, Nhãn Sidebar & Cấu Hình Zalo OA](#211-phân-hệ-cài-đặt-hệ-thống-nhãn-sidebar--cấu-hình-zalo-oa)
- [CHƯƠNG 3: ĐẶC TẢ CHI TIẾT 18 MÀN HÌNH CEO 1983 MOBILE APP](#chương-3-đặc-tả-chi-tiết-18-màn-hình-ceo-1983-mobile-app)
  - [3.1. Cấu Trúc Khung Ứng Dụng Di Động (MemberShell & Bottom Navigation)](#31-cấu-trúc-khung-ứng-dụng-di-động-membershell--bottom-navigation)
  - [3.2. Màn Hình Khởi Động & Launcher Cài Đặt PWA (/open-app)](#32-màn-hình-khởi-động--launcher-cài-đặt-pwa-open-app)
  - [3.3. Màn Hình Trang Chủ & Bảng Tin Giao Lưu (Feed 3 Cấp & Menu 3 Chấm)](#33-màn-hình-trang-chủ--bảng-tin-giao-lưu-feed-3-cấp--menu-3-chấm)
  - [3.4. Màn Hình Thẻ Hội Viên Hoàng Gia & QR vCard Đa Năng](#34-màn-hình-thẻ-hội-viên-hoàng-gia--qr-vcard-đa-năng)
  - [3.5. Màn Hình Danh Bạ Doanh Nhân & Tìm Kiếm Tọa Độ GPS 10km](#35-màn-hình-danh-bạ-doanh-nhân--tìm-kiếm-tọa-độ-gps-10km)
  - [3.6. Màn Hình Sàn Giao Thương B2B & Đăng Nhu Cầu Hợp Tác](#36-màn-hình-sàn-giao-thương-b2b--đăng-nhu-cầu-hợp-tác)
  - [3.7. Màn Hình Gian Hàng Sản Phẩm & Ưu Đãi Nội Khối](#37-màn-hình-gian-hàng-sản-phẩm--ưu-đãi-nội-khối)
  - [3.8. Màn Hình Đặt Lịch Hẹn 1-on-1 Trong 3 Tình Huống Giao Lưu](#38-màn-hình-đặt-lịch-hẹn-1-on-1-trong-3-tình-huống-giao-lưu)
  - [3.9. Màn Hình Sự Kiện Gala Keangnam & Mua Vé Trực Tuyến](#39-màn-hình-sự-kiện-gala-keangnam--mua-vé-trực-tuyến)
  - [3.10. Màn Hình Trình Vé QR Động Xoay Vòng 30s & Tra Cứu Vị Trí Bàn](#310-màn-hình-trình-vé-qr-động-xoay-vòng-30s--tra-cứu-vị-trí-bàn)
  - [3.11. Màn Hình Lịch Họp Ban & Phòng Họp Trực Tuyến Jitsi Meet](#311-màn-hình-lịch-họp-ban--phòng-họp-trực-tuyến-jitsi-meet)
  - [3.12. Màn Hình Nộp Hội Phí Mã QR Ngân Hàng Napas247, MoMo & VNPay](#312-màn-hình-nộp-hội-phí-mã QR ngân hàng-napas247-momo--vnpay)
  - [3.13. Màn Hình Nhắn Tin B2B Thời Gian Thực & Kênh Thảo Luận Ban](#313-màn-hình-nhắn-tin-b2b-thời-gian-thực--kênh-thảo-luận-ban)
  - [3.14. Màn Hình Biểu Quyết Đại Hội Số (1 Doanh Nhân - 1 Phiếu)](#314-màn-hình-biểu-quyết-đại-hội-số-1-doanh-nhân---1-phiếu)
  - [3.15. Màn Hình Cố Vấn Trí Tuệ Nhân Tạo AI Gemini](#315-màn-hình-cố-vấn-trí-tuệ-nhân-tạo-ai-gemini)
  - [3.16. Màn Hình Hồ Sơ Doanh Nghiệp & Cài Đặt Quyền Riêng Tư](#316-màn-hình-hồ-sơ-doanh-nghiệp--cài-đặt-quyền-riêng-tư)
- [CHƯƠNG 4: NGUYÊN TẮC TRẢI NGHIỆM NGƯỜI DÙNG & TỐI ƯU HÓA TƯƠNG TÁC (UX GUIDELINES)](#chương-4-nguyên-tắc-trải-nghiệm-người-dùng--tối-ưu-hóa-tương-tác-ux-guidelines)
  - [4.1. Quy Tắc 3-Click (3-Click Rule) Cho Mọi Thao Tác Trọng Yếu](#41-quy-tắc-3-click-3-click-rule-cho-mọi-thao-tác-trọng-yếu)
  - [4.2. Vùng Chạm Tối Thiểu 48x48px & Phản Hồi Rung Haptic](#42-vùng-chạm-tối-thiểu-48x48px--phản-hồi-rung-haptic)
  - [4.3. Cơ Chế Skeleton Loading & Trạng Thái Trống (Empty States)](#43-cơ-chế-skeleton-loading--trạng-thái-trống-empty-states)
  - [4.4. Thích Ứng Chủ Đề Tự Động (Dark / Light Mode & Theme-Adaptive Recharts)](#44-thích-ứng-chủ-đề-tự-động-dark--light-mode--theme-adaptive-recharts)
  - [4.5. Tiêu Chuẩn Tiếp Cận Người Dùng (A11y - WCAG 2.1 Level AA)](#45-tiêu-chuẩn-tiếp-cận-người-dùng-a11y---wcag-21-level-aa)

---

# CHƯƠNG 1: HỆ THỐNG NHẬN DIỆN THƯƠNG HIỆU & DESIGN SYSTEM HOÀNG GIA

### 1.1. Triết Lý Thiết Kế 3 Màu Nhận Diện Cốt Lõi
Hệ sinh thái số CLB Doanh Nhân CEO 1983 (HanoiBA) được xây dựng trên ngôn ngữ thị giác Hoàng Gia Doanh Nhân (Royal Executive Visual Language), kết hợp hài hòa 3 gam màu độc bản:
1. **Xanh Navy Hoàng Gia (Royal Navy - `#1B365D`):**
   - *Ý nghĩa biểu trưng:* Nền tảng vững chắc, quyền uy, tính chuyên nghiệp đỉnh cao và sự tin cậy tuyệt đối của các doanh nhân tuổi Hợi 1983.
   - *Ứng dụng:* Header chính, Sidebar định vị, nút kêu gọi hành động cấp 1 (Primary Button), tiêu đề lớn (H1/H2) và nền thẻ hội viên hạng Kim Cương.
2. **Vàng Ánh Kim (Imperial Gold - `#D4AF37`):**
   - *Ý nghĩa biểu trưng:* Thịnh vượng tài chính, vinh quang doanh nghiệp, giá trị đẳng cấp của cộng đồng lãnh đạo HanoiBA.
   - *Ứng dụng:* Viền thẻ hội viên số mạ vàng, nhãn chức vụ (Chủ tịch, Phó Chủ tịch), huy hiệu bàn tiệc VIP Keangnam, đường kẻ phân cách nghệ thuật và biểu đồ doanh số.
3. **Xanh Ngọc Lục Bảo (Emerald Green - `#00A86B`):**
   - *Ý nghĩa biểu trưng:* Sự sinh sôi nảy nở của các cơ hội giao thương B2B, dòng tiền dồi dào, phát triển bền vững và tinh thần đổi mới sáng tạo không ngừng.
   - *Ứng dụng:* Trạng thái thanh toán thành công (Paid), chỉ số tăng trưởng dương (+%), nút đăng tin giao thương B2B, nhãn hoạt động trực tuyến.

### 1.2. Bảng Màu Hệ Thống Toàn Diện (Color Tokens)

| Token Tên Biến | Mã HEX | Giá Trị RGB | Cấp Độ Ứng Dụng |
| :--- | :--- | :--- | :--- |
| `color-primary-navy` | `#1B365D` | `rgb(27, 54, 93)` | Màu chủ đạo cấp 1 (Brand Primary) |
| `color-primary-navy-dark` | `#0F2038` | `rgb(15, 32, 56)` | Nền Sidebar CRM Dark Mode, Header Mobile |
| `color-primary-navy-light`| `#2C4F85` | `rgb(44, 79, 133)`| Trạng thái Hover nút bấm chính |
| `color-accent-gold` | `#D4AF37` | `rgb(212, 175, 55)`| Màu nhấn ánh kim cấp 2 (Brand Gold) |
| `color-accent-gold-light` | `#F3E5AB` | `rgb(243, 229, 171)`| Nền huy hiệu VIP, viền sáng Gradient |
| `color-accent-gold-dark` | `#996515` | `rgb(153, 101, 21)` | Chữ vàng ánh kim trên nền sáng |
| `color-emerald-success` | `#00A86B` | `rgb(0, 168, 107)` | Màu sinh lời cấp 3 (Brand Emerald / Success) |
| `color-emerald-light` | `#E8F8F2` | `rgb(232, 248, 242)`| Nền thông báo đã nộp tiền, Badge Đã Duyệt |
| `color-danger-red` | `#EF4444` | `rgb(239, 68, 68)` | Trạng thái nợ quá hạn, Hủy bỏ, Xóa dữ liệu |
| `color-warning-amber` | `#F59E0B` | `rgb(245, 158, 11)`| Chờ phê duyệt, Nhắc nhở hạn nộp phí |
| `color-info-blue` | `#3B82F6` | `rgb(59, 130, 246)`| Thông báo hệ thống, Phiên bản cập nhật |
| `color-bg-light` | `#F8FAFC` | `rgb(248, 250, 252)`| Nền tổng thể Web CRM & Mobile Light Mode |
| `color-bg-card-light` | `#FFFFFF` | `rgb(255, 255, 255)`| Nền Card thẻ thông tin Light Mode |
| `color-bg-dark` | `#0B132B` | `rgb(11, 19, 43)` | Nền tổng thể Dark Mode Hoàng Gia |
| `color-bg-card-dark` | `#1C2541` | `rgb(28, 37, 65)` | Nền Card thẻ thông tin Dark Mode |
| `color-border-subtle` | `#E2E8F0` | `rgb(226, 232, 240)`| Đường viền ngăn cách tinh tế |

### 1.3. Quy Chuẩn Kiểu Chữ & Phông Chữ (Typography)
* **Phông chữ Hệ Thống Tiêu Chuẩn:** `Inter`, `Montserrat` (hoặc font mặc định hệ điều hành: `-apple-system`, `SF Pro Display`, `Segoe UI`, `Roboto`).
* **Hệ Thống Thang Kích Thước Chữ (Type Scale):**
  - **Display / Poster Title:** 28pt – 36pt (Bold 800), Line-height 1.2. Áp dụng cho Tiêu đề Studio Thư Mời & thẻ hội viên điện tử.
  - **Heading 1 (H1):** 20pt – 24pt (Bold 700), Line-height 1.3. Áp dụng cho Tiêu đề Trang Dashboard CRM, Trang Chủ App.
  - **Heading 2 (H2):** 16pt – 18pt (Semi-bold 600), Line-height 1.4. Áp dụng cho Tên các Phân Hệ, Tiêu đề Card thông tin.
  - **Heading 3 (H3):** 13pt – 15pt (Semi-bold 600), Line-height 1.4. Áp dụng cho Tiêu đề Cột Kanban, Bảng Excel.
  - **Body Regular:** 10.5pt – 11pt (Regular 400), Line-height 1.5. Áp dụng cho Văn bản nội dung, dữ liệu bảng.
  - **Body Medium:** 10.5pt – 11pt (Medium 500). Áp dụng cho Nhãn trường nhập liệu Form (Form Label).
  - **Caption / Meta:** 8.5pt – 9pt (Regular 400 / Italic). Áp dụng cho Chú thích ảnh, ngày giờ gửi tin, số trang.

### 1.4. Hệ Thống Khoảng Cách & Lưới Bố Cục (Spacing & Layout Grids)
* **Quy chuẩn 8-Point Grid:** Mọi kích thước đệm (Padding), lề (Margin), bán kính góc (Border-radius) đều là bội số của 4px và 8px (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
* **Bán Kính Góc Bo Tròn (Border Radius):**
  - Card & Container: `12px` (tạo cảm giác hiện đại, thanh thoát).
  - Nút bấm & Input Form: `8px`.
  - Huy hiệu (Badge) & Nút Tròn (Avatar): `9999px` (Full Pill).
* **Lưới Bố Cục Desktop Web CRM:**
  - Lưới 12 cột (12-column grid), Container tối đa `1440px`, Gutter `24px`.
  - Chiều rộng Sidebar thu gọn: `80px`; Chiều rộng Sidebar mở rộng: `260px`.
* **Lưới Bố Cục Mobile App:**
  - Lưới 4 cột (Fluid Mobile Grid), Margin hai bên màn hình: `16px`.
  - Vùng an toàn phía trên (Safe Area Top): Hỗ trợ Dynamic Island và Tai thỏ (Notch).
  - Vùng an toàn phía dưới (Safe Area Bottom): `34px` dành cho thanh gạt Home Indicator iOS.

---

# CHƯƠNG 2: ĐẶC TẢ CHI TIẾT 25 MÀN HÌNH CỔNG QUẢN TRỊ WEB CRM

### 2.1. Cấu Trúc Khung Màn Hình CRM (Sidebar, Header, Main Content)
* **Khung tổng quan:** Thiết kế 3 khối cố định gồm Sidebar điều hướng bên trái (tích hợp khả năng tùy biến nhãn tại Cài đặt), Header quản trị bên trên và Khu vực nội dung cuộn mượt mà (Main Content Area).
* **Header Bar:**
  - Logo CLB Doanh Nhân CEO 1983 mạ vàng ánh kim kèm dòng chữ "HanoiBA Member".
  - Bộ chuyển đổi Chế độ Sáng / Tối (Theme Toggle: Light / Dark Mode).
  - Chuông thông báo Real-time Socket.IO hiển thị số đếm chưa đọc (Badge đỏ).
  - Menu cá nhân: Avatar người dùng, chức danh trong Ban, Nút "Đăng xuất an toàn".
* **Sidebar Menu 17 Mục Chính Thức:**
  1. `[Bảng Điều Khiển]` (Dashboard Tổng Hợp Recharts)
  2. `[Quản Trị Hội Viên]` (Danh sách 360 độ, Hồ sơ năng lực)
  3. `[Thẩm Định Kết Nạp]` (Quy trình duyệt 2 cấp)
  4. `[Hồ Sơ Doanh Nghiệp]` (Đối tác, B2B Catalog)
  5. `[Studio Poster Thư Mời]` (Wyndham Thanh Thủy 9:16 Pinterest)
  6. `[Phát Sóng Đa Kênh]` (Omnichannel Broadcast: Zalo, Email, App)
  7. `[Cấu Hình Zalo OA]` (Zalo Cloud API & Token Monitor)
  8. `[Quản Lý Sự Kiện]` (Gala Dinner Keangnam Landmark72)
  9. `[Soát Vé QR Cổng]` (Check-in tốc độ cao < 0.5s)
  10. `[Điều Hành Cuộc Họp]` (Lịch họp Ban, Jitsi Meet)
  11. `[Quản Lý Thu Chi]` (Sổ quỹ hiệp hội, Hóa đơn)
  12. `[Hội Phí Niên Khóa]` (Phát hành nợ, Mã QR Ngân Hàng gạch nợ)
  13. `[Báo Cáo Phân Tích]` (Xuất nhập Excel SheetJS)
  14. `[Kho Văn Thư Số]` (Trình đọc Word, Excel, PDF)
  15. `[Giao Việc Kanban]` (Bảng thẻ việc & AI Parse Task)
  16. `[Cài Đặt Hệ Thống]` (Đổi nhãn Sidebar, Cấu hình SMTP)
  17. `[Nhật Ký Kiểm Toán]` (Audit Logs bảo mật)

### 2.2. Phân Hệ Thống Kê & Bảng Điều Khiển Tổng Quan (Dashboard Recharts)
* **Mô tả giao diện:** Trung tâm điều hành thời gian thực dành cho Chủ tịch và Ban Lãnh đạo CLB.
* **Các khối thẻ chỉ số nhanh (KPI Cards):**
  - Thẻ 1: Tổng số Hội viên chính thức (Ví dụ: `215 Doanh nhân`, tăng trưởng `+12%`).
  - Thẻ 2: Quỹ tiền mặt & Số dư tài khoản ngân hàng (Ví dụ: `1.930.000.000 VNĐ`).
  - Thẻ 3: Tỷ lệ thu hồi hội phí niên khóa (Ví dụ: `88.5%` - Đã thu `2.150.000.000 VNĐ`).
  - Thẻ 4: Doanh số giao thương B2B nội khối (Ví dụ: `14.850.000.000 VNĐ`).
* **Hệ thống Biểu đồ Recharts Thích Ứng Theme:**
  - *Biểu đồ đường (LineChart):* Tăng trưởng quỹ hội viên 12 tháng qua. Màu nét line: Vàng Ánh Kim (`#D4AF37`) trên nền Dark Mode và Xanh Navy (`#1B365D`) trên nền Light Mode.
  - *Biểu đồ cột chồng (BarChart):* Phân bổ thu - chi của 6 Ban chuyên môn.
  - *Biểu đồ tròn (PieChart):* Cơ cấu hội viên theo ngành nghề (Bất động sản, Xây dựng, Công nghệ, Sản xuất, Thương mại dịch vụ, Tài chính).

### 2.5. Phân Hệ Quản Trị Tài Chính, Hội Phí & Sổ Quỹ Thu - Chi
* **Bảng tính Thu - Chi dạng Excel thông minh:**
  - Thanh công cụ phía trên: Nút Lập Phiếu Thu, Nút Lập Phiếu Chi / Đề Xuất Tạm Ứng, Bộ lọc theo Ban, Ô tìm kiếm đa năng và Nút "Xuất Báo Cáo Excel Đầy Đủ".
  - Tiêu đề cột cố định (Sticky Header) khi cuộn dọc hàng nghìn dòng.
  - Định dạng số tiền tự động phân cách hàng nghìn (`10.000.000 đ`).
  - Màu sắc dòng tiền: Thu tiền có màu Xanh Ngọc Lục Bảo (`#00A86B`), Chi tiền có màu Xanh Navy hoặc Đỏ Muted.
  - Cửa sổ Modal Chi Tiết Hóa Đơn: Hiển thị mã QR Mã QR Ngân Hàng Napas247, lịch sử thanh toán, mã tham chiếu ngân hàng và nút In Biên Lai PDF.

### 2.7. Studio Thiết Kế Poster Thư Mời Wyndham Thanh Thủy 9:16 Pinterest
* **Mô tả giao diện:** Không gian làm việc đồ họa trực quan (Studio Canvas) phục vụ tạo thiệp mời và poster chuyên nghiệp:
  - Khung Canvas chuẩn tỷ lệ dọc `9:16` (Độ phân giải chuẩn Full HD 1080x1920px), phong cách Pinterest Executive.
  - Khu vực tải ảnh chân dung đại biểu: Hỗ trợ kéo thả ảnh doanh nhân, tích hợp công cụ AI tự động tách nền chân dung (Remover Background) và làm mịn biên mép (Feather Edge 15px) hòa quyện vào phông nền 3D.
  - Bảng chọn phông nền sân khấu: Mẫu Wyndham Thanh Thủy Resort, Mẫu Keangnam Landmark72 Grand Ballroom, Mẫu Hội Trường Độc Lập mạ vàng.
  - Thanh nhập liệu thông tin đại biểu: Họ tên, Chức vụ trong CLB, Tên doanh nghiệp, Số bàn tiệc VIP.
  - Nút "Xuất Ảnh Poster PNG 4K" và Nút "Gửi Thư Mời Tức Thời Qua Zalo OA & Email".

### 2.9. Phân Hệ Quản Trị Công Việc Kanban & AI Bóc Tách Nhiệm Vụ
* **Mô tả giao diện:** Bảng Kanban quản lý tiến độ 4 cột tiêu chuẩn:
  1. `Cần làm (TODO)` - Huy hiệu xám Slate
  2. `Đang thực hiện (IN PROGRESS)` - Huy hiệu xanh Info
  3. `Chờ duyệt (REVIEW)` - Huy hiệu vàng Amber
  4. `Đã hoàn thành (DONE)` - Huy hiệu ngọc Emerald
* **Tương tác kéo thả (Drag and Drop):**
  - Người dùng có thể kéo thẻ Task từ cột này thả sang cột khác mượt mà.
  - Khi thả vào cột `Đã hoàn thành`, hệ thống tự động đổi trạng thái thành `DONE`, ghi nhận thời gian hoàn tất và lưu vào CSDL qua API.
* **Bộ Phân Tích AI Bóc Tách Nhiệm Vụ:**
  - Nút "Bóc tách Task từ Biên Bản Họp AI" nổi bật viền vàng ánh kim.
  - Hộp thoại tải lên tệp: Hỗ trợ tệp Word (`.docx`), Excel (`.xlsx`) hoặc paste văn bản trực tiếp.
  - Khung xem trước gợi ý của AI: Hiển thị bảng danh sách các nhiệm vụ được trích xuất (Tên việc, Người thực hiện trong Ban, Mức ưu tiên, Hạn chót Deadline) kèm nút "Xác Nhận Đưa Lên Bảng Kanban".

---

# CHƯƠNG 3: ĐẶC TẢ CHI TIẾT 18 MÀN HÌNH CEO 1983 MOBILE APP

### 3.1. Cấu Trúc Khung Ứng Dụng Di Động (MemberShell & Bottom Navigation)
* **Khung vỏ di động MemberShell:** Bọc toàn bộ các màn hình của hội viên, đảm bảo giao diện chuẩn Mobile-First, chống tràn ngang và xử lý an toàn ngày tháng tiếng Việt.
* **Thanh Điều Hướng Đáy Màn Hình (Bottom Navigation Bar - 5 Tab Chính):**
  1. `[Trang Chủ]` (Icon Home) - Bảng tin giao lưu nội bộ, bài viết chia sẻ, sự kiện nổi bật.
  2. `[Danh Bạ]` (Icon Users / Directory) - Bản đồ kết nối doanh nhân, định vị GPS bán kính 10km.
  3. `[Giao Thương]` (Icon Handshake / B2B) - Sàn đăng tin mua bán, gian hàng ưu đãi hội viên.
  4. `[Thẻ Doanh Nhân Số]` (Icon CreditCard / QR) - Thẻ hội viên số Hoàng Gia mạ vàng ánh kim, mã QR vCard danh thiếp.
  5. `[Tài Khoản]` (Icon UserCircle) - Quản lý hồ sơ công ty, nộp hội phí Mã QR Ngân Hàng, lịch họp Ban, cài đặt.

### 3.3. Màn Hình Trang Chủ & Bảng Tin Giao Lưu (Feed 3 Cấp & Menu 3 Chấm)
* **Mô tả giao diện:** Mạng xã hội nội bộ dành riêng cho giới tinh hoa doanh nhân 1983:
  - Khung soạn thảo bài đăng nhanh: "Chia sẻ cơ hội kinh doanh hôm nay..." đính kèm ảnh, video, tài liệu PDF.
  - Bảng tin tương tác 3 cấp: Bài đăng (Post) -> Bình luận (Comment) -> Phản hồi bình luận (Reply).
  - **Menu Tùy Chọn 3 Chấm (...):**
    * Xuất hiện tại góc trên bên phải của mọi bài viết do chính tài khoản đó đăng tải, hoặc bài viết được chia sẻ từ bên ngoài vào.
    * Khi chạm vào icon 3 chấm, menu ActionSheet bật lên với các lựa chọn: `Chỉnh sửa bài viết`, `Xóa bài đăng`, `Sao chép liên kết`, `Báo cáo vi phạm`.
    * Phân quyền bảo mật: Chỉ chủ bài viết hoặc Quản trị viên (Admin) mới có quyền Chỉnh sửa hoặc Xóa bài đăng.

### 3.4. Màn Hình Thẻ Hội Viên Hoàng Gia & QR vCard Đa Năng
* **Mô tả giao diện:** Thẻ định danh số đẳng cấp của từng doanh nhân:
  - Tỷ lệ thẻ chuẩn ngân hàng quốc tế `85.6 x 53.98 mm`.
  - Hiệu ứng thị giác Hologram 3D mạ vàng ánh kim chuyển sắc khi người dùng nghiêng điện thoại (con quay hồi chuyển Gyroscope).
  - Mặt trước thẻ: Logo HanoiBA & CLB CEO 1983, Họ tên doanh nhân in hoa, Chức danh CLB, Mã hội viên (`CEO1983-001`), Huy hiệu Hạng hội viên (Kim Cương / Vàng).
  - Nút lật thẻ xem mặt sau: Mã QR vCard chứa danh thiếp điện tử (Họ tên, SĐT, Email, Website công ty). Đối tác chỉ cần quét camera thông thường là lưu ngay vào danh bạ điện thoại mà không cần cài app.

### 3.10. Màn Hình Trình Vé QR Động Xoay Vòng 30s & Tra Cứu Vị Trí Bàn
* **Mô tả giao diện:** Trình vé thông minh phục vụ đêm tiệc Gala tại Keangnam Landmark72:
  - Mã QR Code động tạo theo thuật toán TOTP (Time-based One-Time Password), tự động xoay vòng làm mới sau mỗi `30 giây` để chống hoàn toàn việc chụp ảnh màn hình chuyển tiếp vé cho người khác.
  - Đồng hồ đếm ngược hình tròn (Countdown Circle) hiển thị số giây còn lại của mã QR.
  - Thông tin chỉ dẫn vị trí đại biểu cực kỳ trực quan:
    * Tên bàn tiệc: **BÀN VIP-01 (KIM CƯƠNG)**
    * Số ghế ngồi: **GHẾ SỐ 01**
    * Vị trí sảnh: **Grand Ballroom, Tầng 5, Tháp Keangnam Landmark72**
    * Mã vé: `TKT-2026-0112`

### 3.12. Màn Hình Nộp Hội Phí Mã QR Ngân Hàng Napas247, MoMo & VNPay
* **Mô tả giao diện:** Trung tâm nộp phí niên khóa và vé sự kiện tiện lợi:
  - Hiển thị tóm tắt công nợ: Số tiền cần nộp, Niên khóa 2026-2027, Hạn chót thanh toán.
  - Khung mã QR ngân hàng trung tâm: Tự động render mã QR Napas247 cá nhân hóa. Doanh nhân chỉ cần mở bất kỳ ứng dụng ngân hàng nào (MBBank, Vietcombank, Techcombank, BIDV,...) quét mã là thông tin tài khoản và cú pháp chuyển khoản được điền chính xác 100%.
  - Nút "Mở App Ngân Hàng Thanh Toán Ngay" (Deep-link ngân hàng).
  - Nút chọn phương thức ví điện tử: MoMo, VNPay-QR.
  - Trạng thái kiểm tra thanh toán thời gian thực (Polling & WebSocket): Ngay khi tài khoản ngân hàng báo có tiền, màn hình tự động chuyển sang hiệu ứng pháo hoa chúc mừng màu xanh ngọc lục bảo và thông báo gạch nợ thành công!

---

# CHƯƠNG 4: NGUYÊN TẮC TRẢI NGHIỆM NGƯỜI DÙNG & TỐI ƯU HÓA TƯƠNG TÁC (UX GUIDELINES)

### 4.1. Quy Tắc 3-Click (3-Click Rule) Cho Mọi Thao Tác Trọng Yếu
Mọi tác vụ cốt lõi của doanh nhân trên ứng dụng bắt buộc phải hoàn tất trong tối đa 3 lần chạm (3 Clicks):
1. **Trình thẻ doanh nhân số:** Mở App -> Chạm tab `Thẻ Doanh Nhân Số` -> Hiện mã QR vCard (2 chạm).
2. **Nộp hội phí:** Mở App -> Chạm `Nộp Phí Ngay` tại Trang Chủ -> Hiện mã QR ngân hàng sẵn sàng quét (2 chạm).
3. **Quét vé vào cổng Keangnam:** Mở App Quản Trị -> Chạm `Quét Vé` -> Camera mở sẵn sàng quét (2 chạm).
4. **Đăng tin B2B:** Chạm tab `Giao Thương` -> Chạm `Đăng Nhu Cầu` -> Điền thông tin & Đăng (3 bước).

### 4.2. Vùng Chạm Tối Thiểu 48x48px & Phản Hồi Rung Haptic
* **Vùng chạm cảm ứng:** Mọi nút bấm, icon menu, tab điều hướng đều có kích thước vùng chạm tối thiểu `48 x 48 dp` (theo chuẩn thiết kế của Apple Human Interface Guidelines và Google Material Design) để doanh nhân thao tác chính xác, không bấm nhầm.
* **Phản hồi rung xúc giác (Haptic Feedback):**
  - Chạm nhẹ (Light Impact): Khi bấm các tab Bottom Navigation hoặc bấm Like bài viết.
  - Phản hồi thành công (Success Notification): Rung 2 nhịp êm ái khi quét vé thành công, gạch nợ thành công hoặc nộp đơn kết nạp thành công.
  - Phản hồi cảnh báo (Warning/Error): Rung nhịp kép mạnh khi quét vé trùng lặp hoặc điền thiếu thông tin bắt buộc.

### 4.3. Cơ Chế Skeleton Loading & Trạng Thái Trống (Empty States)
* **Skeleton Screen:** Trong thời gian chờ tải dữ liệu API từ máy chủ PostgreSQL, hệ thống hiển thị khung xương chuyển động sóng ánh bạc (Shimmer Animation) thay vì vòng tròn xoay Spinner đơn điệu, giảm thiểu cảm giác chờ đợi của người dùng.
* **Trạng Thái Trống (Empty State):** Khi danh sách không có dữ liệu (Chưa có cuộc họp, Chưa có tin B2B), hệ thống hiển thị hình minh họa doanh nhân sang trọng kèm thông điệp gợi mở hành động (ví dụ: *"Chưa có bài đăng giao thương nào. Hãy là người đầu tiên mở rộng mạng lưới kinh doanh!"* kèm nút Tạo Bài Đăng).

### 4.4. Thích Ứng Chủ Đề Tự Động (Dark / Light Mode & Theme-Adaptive Recharts)
* Hệ thống hỗ trợ chế độ Tối (Dark Mode) và Sáng (Light Mode) tự động theo cài đặt hệ thống của thiết bị hoặc tùy chọn thủ công của người dùng.
* Biểu đồ Recharts trên Web CRM tự động điều chỉnh màu trục tọa độ (CartesianGrid), màu văn bản và Tooltip:
  - Nền Tối: Trục tọa độ màu Slate `#334155`, chữ màu trắng bạc `#F1F5F9`.
  - Nền Sáng: Trục tọa độ màu nhạt `#E2E8F0`, chữ màu xám đậm `#1E293B`.

---
*Tài liệu Đặc tả Giao diện & Trải nghiệm Người dùng CEO 1983 hoàn tất với chuẩn mực cao nhất.*

