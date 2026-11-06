# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SOFTWARE REQUIREMENTS SPECIFICATION - SRS)
# HỆ THỐNG QUẢN TRỊ HIỆP HỘI CRM & MOBILE APP CLB DOANH NHÂN CEO 1983 (HANOIBA)
**Phiên bản:** 8.0 (Master Release)  
**Tổ chức:** CLB Doanh Nhân CEO 1983 — Trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)  
**Đơn vị phát triển:** VICONNECT - VIONE PLATFORM  
**Ngày phát hành:** Tháng 11/2026  

---

## 1. KIẾN TRÚC KỸ THUẬT TỔNG THỂ (SYSTEM ARCHITECTURE)
### 1.1. Ngăn xếp Công nghệ (Technology Stack)
- **Frontend Web CRM & Mobile App**:
  - Framework: React 19 + TypeScript + Vite 6 + TanStack Router (File-based Routing).
  - UI & Styling: Tailwind CSS v4 + Radix UI Primitives + Lucide React Icons.
  - Data Visualizations: Recharts 2.15 (Composed Bar-Line Charts, Pie/Donut Charts).
  - Excel Engine: SheetJS (XLSX 0.18.5) xử lý trực tiếp tại Client-side.
  - Real-time & Sockets: Socket.IO Client 4.8.
- **Backend API & Microservices**:
  - Framework: NestJS 11 + TypeScript (Strict mode).
  - Database ORM: Prisma ORM 6.4 + PostgreSQL Database (Port 6432, Host 113.20.107.184).
  - Security & Auth: JWT Passport Strategy + bcryptjs password hashing.
  - Media & Storage: Upload local service mounted `/uploads`.

---

## 2. ĐẶC TẢ CHI TIẾT CÁC PHÂN HỆ KỸ THUẬT (FUNCTIONAL SPECIFICATIONS)

### 2.1. Phân hệ Thống Kê Quản Trị & Xuất/Nhập Excel (`[NODE-CRM-002]`, `[NODE-CRM-007]`)
- **API Endpoint Xuất Thống Kê**: `GET /analytics/overview?granularity={period}&period={period}`
- **Chế độ Xuất Excel 1 (Theo Thời Gian)**:
  - Input: `year: string`, `periodType: 'month' | 'quarter' | 'year'`, `periodValue: string`.
  - Process: Lấy dữ liệu hội viên, format tiền tệ, tính tổng `totalVolume`, `totalConnections`, `totalDeals`.
  - Output: Tệp `CEO1983_BaoCao_GiaoThuong_{year}_{timestamp}.xlsx`.
- **Chế độ Xuất Excel 2 (Theo Từng Cá Nhân Hội Viên)**:
  - Input: `selectedMemberIds: string[]`.
  - Process: Sinh multi-sheet workbook, mỗi sheet chứa bảng thông tin cá nhân, chỉ số KPI và lịch sử thương vụ.
  - Output: Tệp `CEO1983_HoSo_HoiVien_{timestamp}.xlsx`.
- **Chế độ Xuất Excel 3 (Biến Động Hội Viên - Delta)**:
  - Input: So sánh kỳ này và kỳ trước.
  - Process: Tính Delta %, gán nhãn phân loại xu hướng và hành động đề xuất của BĐH.
  - Output: Tệp `CEO1983_BaoCao_BienDong_HoiVien_{timestamp}.xlsx`.
- **API Endpoint Nhập Excel Hàng Loạt**:
  - `POST /members/bulk-import`
  - Body: `{ members: Array<{ name, phone, email, company, position, industry, department, address }> }`
  - Logic: Kiểm tra tồn tại qua Email hoặc Phone; nếu có -> UPDATE, nếu chưa -> INSERT mã mới `MB...` và code `CEO1983-...`.

### 2.2. Phân hệ Tích Hợp Đa Nền Tảng & 1-Click Auto Post (`[NODE-CRM-021]`)
- **Endpoints Cấu hình**:
  - `GET /syndication/config`: Đọc cấu hình từ `public.app_settings` (key `crm_platform_integrations`).
  - `POST /syndication/config`: Lưu cấu hình bền vững vào CSDL.
- **Endpoint Phát hành 1-Click**:
  - `POST /syndication/publish`
  - Body:
    ```json
    {
      "title": "Hội nghị Xúc tiến Thương mại CEO 1983",
      "summary": "Mời tham dự...",
      "content": "Chi tiết...",
      "itemType": "event",
      "targetChannels": ["facebook", "zalo", "website"],
      "location": "Hà Nội",
      "eventTime": "14:30 - 12/11/2026",
      "directJoinUrl": "https://ceo1983.com/su-kien"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "broadcastId": "BC_179393...",
      "results": {
        "facebook": { "success": true, "publishedUrl": "https://facebook.com/groups/..." },
        "zalo": { "success": true, "publishedUrl": "https://zalo.me/g/..." },
        "website": { "success": true, "publishedUrl": "https://ceo1983.com/su-kien/..." }
      }
    }
    ```

### 2.3. Phân hệ Cấu Hình Zalo Mini App (`[NODE-CRM-010]`)
- **API Endpoints**:
  - `GET /zalo/miniapp/config`: Trả về thông tin appId, secretKey, appName, headerTitle.
  - `POST /zalo/miniapp/config`: Lưu cấu hình vào PostgreSQL `public.app_settings`.
  - `POST /zalo/miniapp/check-health`: Kiểm tra sức khỏe kết nối Zalo OpenAPI thực tế.

### 2.4. Phân hệ Giao Thương B2B, Sản Phẩm & Tin Nhắn Lịch Gặp (`[NODE-APP-002]`, `[NODE-APP-003]`)
- **Định dạng Tiền tệ Chuẩn**:
  - Hàm `parseVnNumber()` xử lý dấu chấm phân tách hàng nghìn: `2.000.000.000 đ` -> `2000000000` -> `2 Tỷ VNĐ`.
  - Reactive state `localOpps` và `localProducts` cập nhật UI tức thì khi Create/Edit/Delete.
- **API Tự Động Nhắn Tin Lịch Gặp**:
  - Triển khai trong `meetings.service.ts`:
    1. Khi tạo cuộc họp (`POST /meetings`), tự động gọi `messages.service.sendDirectMessage()` gửi tin nhắn chi tiết tới người nhận.
    2. Khi chấp nhận cuộc họp (`POST /meetings/:id/accept`), tự động gửi tin nhắn xác nhận tới cả 2 bên.

### 2.5. Phân hệ OpenGraph Chia Sẻ & Tối Ưu Tìm Kiếm (`[NODE-APP-001]`, `[NODE-APP-005]`)
- **Backend OpenGraph**: `GET /share/:type/:id` trong `app.controller.ts` trả về đầy đủ các thẻ meta `og:title`, `og:image`, `og:description`.
- **Frontend Debounce**: Áp dụng debounce 350ms trên ô tìm kiếm tin bài và mạng lưới, ngắt hoàn toàn spam API request.

### 2.6. Phân hệ Trợ Lý Cố Vấn Số AI & Onboarding Lớp Học (`[NODE-CRM-011]`, `[NODE-APP-016]`)
- **Component `ViOneAiTutorGuide.tsx`**:
  - Cột 1: Avatar AI Cố Vấn Số CEO 1983 đứng giảng bài.
  - Cột 2: Bảng đen tương tác hiển thị chỉ dẫn từng bước, lời khuyên thực chiến, khung hỏi đáp với AI và các nút "Tiếp tục" / "Tôi đã hiểu".
- **Component `FirstDayAiWelcomeModal.tsx`**:
  - Kiểm tra `vba_first_day_welcomed_date` trong LocalStorage.
  - Chỉ hiển thị đúng vào ngày đầu đăng nhập, chào mừng doanh nhân và điểm qua lịch trình trong ngày.

---

## 3. ĐẶC TẢ DỮ LIỆU & AN TOÀN HỆ THỐNG
### 3.1. Dữ Liệu Sau Dọn Dẹp Thực Nghiệm (Database Hygiene)
- Toàn bộ các bảng nghiệp vụ thử nghiệm đã được làm sạch:
  - `vione_users`: 1 record duy nhất (`admin@connect.vn`, ID: `00000000-0000-4000-8000-000000000002`).
  - `members`: 1 record duy nhất (`Jame Nguyễn`, `admin@connect.vn`).
  - `feed_posts`, `messages`, `opportunities`, `products`, `events`, `member_notifications`: 0 records (sẵn sàng đón nhận dữ liệu thật).

### 3.2. Tiêu Chuẩn Chất Lượng & Ràng Buộc Kiểm Thử
- **TypeScript Strict Compliance**: Toàn bộ mã nguồn Backend và Frontend đạt `npx tsc --noEmit` với exit code 0 (0 errors, 0 warnings).
- **Tuân thủ Git Rule**: Không tự ý thực thi `git commit` hoặc `git push`.
