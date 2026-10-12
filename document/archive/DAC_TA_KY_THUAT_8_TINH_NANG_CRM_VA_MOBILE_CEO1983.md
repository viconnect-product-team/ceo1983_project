# ĐẶC TẢ KỸ THUẬT: 8 TÍNH NĂNG NÂNG CẤP VÀ SỬA LỖI HỆ THỐNG APP CEO 1983 MOBILE & CRM HIỆP HỘI

**Dự án**: Hệ thống Quản trị & Kết nối Doanh nhân Hiệp hội CEO 1983 (HanoiBA)  
**Ngày thực hiện**: 12/10/2026  
**Trạng thái**: Hoàn thành toàn diện (100% Type-safe, 0 Errors)

---

## 1. TỔNG QUAN YÊU CẦU & MỤC TIÊU PHÁT TRIỂN

Phiên bản cập nhật giải quyết triệt để 8 bài toán nghiệp vụ và trải nghiệm người dùng trọng yếu theo yêu cầu của Ban Điều hành:
1. **Thông Báo Cuộc Gọi & Tin Nhắn Ngoài Ứng Dụng (Mobile Background Notification)**: Thiết bị di động nhận được thông báo cuộc gọi đến (đổ chuông, rung, nút Chấp nhận / Từ chối) và tin nhắn mới ngay ở ngoài màn hình khóa/thanh thông báo mà không cần người dùng phải đang mở ứng dụng.
2. **Khắc Phục Lỗi Cuộc Gọi Video/Voice (WebRTC Call Deduplication & Sync)**: Triệt tiêu tình trạng duplicate cuộc gọi khi khởi tạo và đồng bộ sự kiện kết thúc cuộc gọi — khi một đầu gác máy thì đầu nhận lập tức dừng chuông và đóng modal ngay tức khắc.
3. **Trình Diễn Mã QR Sự Kiện Đã Đăng Ký Dạng Slide (Registered Events QR Slide)**: Hiển thị tối đa 3 mã QR vé tham dự sự kiện trực quan theo dạng cuộn/slide nằm ngang, kèm nút bấm "Xem tất cả" mở Modal tra cứu toàn bộ danh sách vé.
4. **Chuẩn Hóa Ma Trận Phân Quyền CRM (RBAC Matrix)**:
   - Bổ sung đầy đủ các vai trò Trưởng ban chuyên trách (`truong_ban_truyen_thong`, `truong_ban_thanh_vien`, `truong_ban_xuc_tien`, `truong_ban_tai_chinh`, `truong_ban_thien_nguyen`, `truong_ban_quan_tri`).
   - Loại bỏ gấp vai trò `ban_thu_ky` (chuyển sang `tong_thu_ky` hoặc `Ban Quản trị`).
   - Bỏ nút "Lưu toàn bộ" cạnh nút "+ Thêm quyền".
   - Nâng cấp nút "+ Thêm chức năng" tự động quét/phát hiện các route và chức năng mới của hệ thống và ghi trực tiếp vào CSDL.
5. **Chuẩn Hóa Phân Quyền Tài Khoản (Account Permissions)**:
   - Bỏ hoàn toàn các từ ngữ "gấp cấp", "cấp" (thay bằng "Bật" / "Tắt", "bật thêm").
   - Đổi nút "Tùy chỉnh quyền" thành "Chỉnh sửa".
   - Bổ sung thêm thao tác "Xem" (xem chi tiết quyền thực tế) và "Xóa" (xóa bỏ quyền ghi đè, hoàn trả quyền gốc theo vai trò), bảo đảm 3 phân hệ phân quyền liên thông mật thiết.
6. **Bộ Lọc Trạng Thái Toàn Bộ Dashboard (Dashboard Status Filters)**:
   - Tích hợp bộ lọc trạng thái (Tất cả, Đang hoạt động, Chờ duyệt, v.v.) gọi API CSDL thực tế trên tất cả các trang Dashboard (`ExecutiveDashboard.tsx`, `events-overview.tsx`, `finance-report.tsx`).
7. **Quản Lý Tài Chính: Import & Export Excel (Finance Excel Suite)**:
   - Bổ sung tính năng "Import Excel" song song với "Xuất Excel" cho cả phân hệ Khoản Thu (`income.tsx`) và Khoản Chi & Tạm Ứng (`expenses.tsx`).
   - Cung cấp file mẫu chuẩn `.xlsx`, bộ phân tích cú pháp linh hoạt, preview xác thực dữ liệu và ghi hàng loạt vào CSDL.
8. **Chuẩn Hóa Ngôn Ngữ Giao Diện (Zero Technical Jargon)**:
   - Rà soát và loại bỏ toàn bộ các từ ngữ kỹ thuật như "SQL", "PostgreSQL", "public.<table_name>", "RESTful API", "Cấp bậc" trên giao diện người dùng app CEO 1983 và CRM.

---

## 2. CHI TIẾT KỸ THUẬT & KIẾN TRÚC TRIỂN KHAI

### 2.1. Nền Tảng Thông Báo Cuộc Gọi & Tin Nhắn Ngoài App (`CeoNotificationSyncService.java`)
- **Tệp nguồn native**: `apps/mobile_ceo1983/android/app/src/main/java/com/vione/app/CeoNotificationSyncService.java`
- **Tệp khai báo cấu hình**: `AndroidManifest.xml` & `MainActivity.java`
- **Cơ chế hoạt động**:
  - Dịch vụ Android Foreground Service chạy ngầm độc lập với vòng đời WebView.
  - Sử dụng Notification Channel riêng biệt `ceo1983_calls_v2` với `IMPORTANCE_HIGH`, âm thanh chuông gọi mặc định và cờ rung `enableVibration(true)`.
  - Polling ngầm định kỳ gọi API `/me/active-call` và `/notifications`.
  - Khi có cuộc gọi đến: Bắn thông báo Heads-Up Notification toàn màn hình khóa, hiển thị tên người gọi, loại cuộc gọi (Video/Voice), kèm 2 nút bấm thao tác trực tiếp:
    - **Nghe máy**: Mở ứng dụng và tự động trả lời cuộc gọi.
    - **Từ chối**: Gửi lệnh hủy cuộc gọi qua Native Broadcast.
  - Khi có tin nhắn mới: Bắn thông báo tin nhắn kèm nội dung rút gọn và tên người gửi.

### 2.2. Khắc Phục Lỗi Cuộc Gọi Duplicate & Đồng Bộ Kết Thúc WebRTC
- **Tệp backend**: `apps/ceo1983_app_be/src/connect-app/connect-app.gateway.ts`
- **Tệp frontend**: `GlobalIncomingCallModal.tsx`, `CeoWebRtcCallModal.tsx`
- **Cơ chế kiểm soát**:
  - **Khóa Deduplication Lock**: Khi tài khoản A gọi tài khoản B, gateway tạo khóa session `call_${callerId}_${receiverId}` kèm timeout 10 giây. Các yêu cầu gọi tiếp theo trong khoảng thời gian này bị chặn đứng (`isDuplicateCall = true`).
  - **Đồng Bộ Kết Thúc Tức Thì (Immediate Termination Sync)**:
    - Khi một trong hai bên bấm nút gác máy (`hangup` / `call_ended`), gateway lập tức xóa `activeCalls` cache và broadcast sự kiện `call:ended` tới toàn bộ các room của cả người gọi và người nhận.
    - Component `GlobalIncomingCallModal` và `CeoWebRtcCallModal` lắng nghe sự kiện `call:ended` -> ngắt chuông chuông, hủy rung và đóng modal ngay lập tức (0ms delay).

### 2.3. Trình Diễn Mã QR Sự Kiện Dạng Slide (`RegisteredEventsQrSlider.tsx`)
- **Tệp nguồn**: `apps/ceo1983_app_fe/src/components/events/RegisteredEventsQrSlider.tsx`
- **Tích hợp vào route**: `apps/ceo1983_app_fe/src/routes/association.events.tsx`
- **Quy cách hiển thị**:
  - Bố trí ngay trên đầu trang Sự kiện của hội viên.
  - Hiển thị danh sách thẻ vé sự kiện đã đăng ký thành công (`status === "confirmed" || status === "registered"`).
  - Tối đa 3 mã QR được hiển thị trực quan trực tiếp trên slide cuộn mượt mà (Horizontal Touch Slider).
  - Mỗi thẻ vé hiển thị: Tên sự kiện, thời gian, địa điểm, mã số vé/ghế ngồi, và mã QR sắc nét có thể dùng trực tiếp để check-in tại cổng sự kiện.
  - Nút bấm **"Xem tất cả (N)"**: Mở Modal hiển thị toàn bộ danh sách vé sự kiện của hội viên.

### 2.4. Nâng Cấp Ma Trận Phân Quyền CRM (`RbacPermissionMatrix.tsx`)
- **Tệp nguồn**:
  - `apps/ceo1983_app_fe/src/components/dashboard/RbacPermissionMatrix.tsx`
  - `apps/ceo1983_app_fe/src/lib/rbac-permission-helpers.ts`
  - `apps/ceo1983_app_fe/src/routes/permissions.tsx`
- **Thay đổi trọng yếu**:
  - **Bổ sung vai trò Trưởng ban chuyên trách**:
    - `truong_ban_truyen_thong` (Trưởng ban Truyền thông)
    - `truong_ban_thanh_vien` (Trưởng ban Thành viên)
    - `truong_ban_xuc_tien` (Trưởng ban Xúc tiến thương mại)
    - `truong_ban_tai_chinh` (Trưởng ban Tài chính)
    - `truong_ban_thien_nguyen` (Trưởng ban Thiện nguyện)
    - `truong_ban_quan_tri` (Trưởng ban Quản trị)
  - **Loại bỏ vai trò `ban_thu_ky`**: Toàn bộ cấu hình và dữ liệu liên quan được chuẩn hóa chuyển sang `tong_thu_ky` hoặc `Ban Quản trị`.
  - **Bỏ nút "Lưu toàn bộ"**: Bỏ nút bấm thừa cạnh nút "+ Thêm quyền", kích hoạt cơ chế lưu thay đổi tự động theo từng thao tác.
  - **Tự động phát hiện chức năng mới ("+ Thêm chức năng")**:
    - Tích hợp bộ quét danh mục hệ thống `DETECTABLE_SYSTEM_FEATURES`.
    - Khi bấm "+ Thêm chức năng", modal cung cấp nút "Quét ngay các chức năng mới từ hệ thống" hoặc chọn nhanh từ danh mục.
    - Tự động đồng bộ và lưu cấu hình ma trận mới trực tiếp vào CSDL thông qua API `/admin/permission-matrix`.

### 2.5. Chuẩn Hóa Phân Quyền Tài Khoản (`MemberPermissionsByCommittee.tsx`)
- **Tệp nguồn**: `apps/ceo1983_app_fe/src/components/dashboard/MemberPermissionsByCommittee.tsx`
- **Thay đổi trọng yếu**:
  - **Bỏ hoàn toàn từ "gấp cấp", "cấp"**:
    - Thay thế huy hiệu trạng thái: "Cấp" -> "Bật", "Khóa" -> "Tắt".
    - Thay thế mô tả: "cấp thêm quyền" -> "bật thêm quyền".
  - **Thay thế nút "Tùy chỉnh quyền" bằng 3 nút thao tác chuyên biệt**:
    1. **Nút "Xem" (`Eye`)**: Mở Modal `MemberPermissionDetailModal` hiển thị hồ sơ hội viên, danh sách quyền hiệu lực, nguồn gốc quyền (mặc định theo ban/vai trò hay ghi đè cá nhân).
    2. **Nút "Chỉnh sửa" (`Pencil`)**: Mở Modal chỉnh sửa quyền tài khoản, cho phép bật/tắt từng quyền con cụ thể.
    3. **Nút "Xóa" (`Trash2`)**: Mở hộp thoại xác nhận xóa bỏ toàn bộ quyền ghi đè tùy chỉnh của tài khoản, hoàn trả quyền hạn về đúng chuẩn mặc định của vai trò và ban chuyên môn; đồng thời gọi API `DELETE /admin/member-permissions/:id` và phát sự kiện đồng bộ `crm:permissions-updated`.

### 2.6. Bộ Lọc Trạng Thái Toàn Bộ Dashboard
- **Các màn hình tích hợp**:
  1. `apps/ceo1983_app_fe/src/components/dashboard/ExecutiveDashboard.tsx`:
     - Bổ sung thanh lọc trạng thái: "Tất cả", "Chính thức / Đã duyệt", "Chờ thẩm định / Chưa thanh toán", "Đã đóng / Tạm khóa".
     - Gọi API backend `/members?status=...`, `/admin/invoices?status=...`, `/events?status=...` và tính toán lại các thẻ KPI số lượng hội viên, doanh thu, sự kiện.
  2. `apps/ceo1983_app_fe/src/routes/events-overview.tsx`:
     - Bổ sung bộ lọc trạng thái: "Tất cả", "Sắp diễn ra", "Đang diễn ra", "Đã kết thúc", "Đã hủy".
     - Lọc dữ liệu bảng sự kiện và đồng bộ biểu đồ tỷ lệ tham gia.
  3. `apps/ceo1983_app_fe/src/routes/finance-report.tsx`:
     - Bổ sung bộ lọc trạng thái: "Tất cả trạng thái", "Đã duyệt / Hoàn thành", "Chờ phê duyệt", "Đã hủy".
     - Tự động tính toán lại Tổng thu, Tổng chi, Tạm ứng, Hoàn ứng và Thặng dư quỹ theo đúng trạng thái được chọn.

### 2.7. Bộ Công Cụ Nhập & Xuất Excel Tài Chính (`FinanceExcelImportModal.tsx`)
- **Tệp component mới**: `apps/ceo1983_app_fe/src/components/dashboard/FinanceExcelImportModal.tsx`
- **Tích hợp vào route**:
  - Khoản thu: `apps/ceo1983_app_fe/src/routes/income.tsx`
  - Khoản chi: `apps/ceo1983_app_fe/src/routes/expenses.tsx`
- **Tính năng nổi bật**:
  - **Tải file mẫu Excel chuẩn (`.xlsx`)**: Tự động tạo file mẫu chuẩn với các cột ngày tháng, danh mục, nội dung, người nộp/nhận, số tiền, hình thức (tiền mặt/chuyển khoản), trạng thái.
  - **Kéo thả & Đọc file siêu tốc**: Sử dụng thư viện `xlsx` đọc file `.xlsx`, `.xls`, `.csv` trực tiếp trên client.
  - **Xác thực dữ liệu thông minh**:
    - Nhận diện cột linh hoạt (hỗ trợ nhiều tiêu đề cột tiếng Việt/tiếng Anh khác nhau).
    - Chuẩn hóa ngày tháng (`DD/MM/YYYY`, `YYYY-MM-DD`, số serial Excel).
    - Làm sạch số tiền (loại bỏ ký tự đ, VNĐ, dấu phẩy, dấu chấm).
    - Phân loại danh mục thu chi theo chuẩn CLB.
    - Gắn cờ dòng hợp lệ / dòng lỗi (thiếu nội dung hoặc số tiền <= 0).
  - **Bảng Xem Trước (Preview Table)**: Cho phép lọc xem "Tất cả", "Hợp lệ", "Lỗi cần sửa", chọn/bỏ chọn từng dòng hoặc chọn toàn bộ dòng hợp lệ.
  - **Ghi nhận hàng loạt vào CSDL**: Hiển thị thanh tiến trình trực quan (0% - 100%), gọi `createTransactionFn` ghi trực tiếp vào backend, hiển thị thông báo thành công và làm mới dữ liệu.

### 2.8. Làm Sạch Thuật Ngữ Kỹ Thuật (Zero Technical Jargon)
- **Tệp xử lý tiêu biểu**: `apps/ceo1983_app_fe/src/routes/sponsor-packages.tsx`
  - Thay thế chuỗi: `Lưu trữ trên PostgreSQL table public.event_prizes` -> `Cơ cấu giải thưởng sự kiện chính thức`.
- **Rà soát toàn diện**:
  - Kiểm tra và đảm bảo không còn chuỗi giao diện người dùng nào chứa các từ "SQL", "PostgreSQL", "public.<table_name>", "RESTful API", "Cấp bậc".
  - Chuyển đổi toàn bộ sang ngôn ngữ hành chính/doanh nghiệp chuyên nghiệp: "Hệ thống quản trị CSDL", "Cấu hình quyền vai trò", "Chức năng hệ thống".

---

## 3. KIỂM ĐỊNH CHẤT LƯỢNG & TÍNH TOÀN VẸN (VERIFICATION)

- **Type-Check Frontend (`apps/ceo1983_app_fe`)**: Đảm bảo 0 lỗi TypeScript trên toàn bộ các tệp tạo mới và chỉnh sửa.
- **Tuân thủ Strict Rule 1 (AGENTS.md)**: Tuyệt đối không tự động chạy `git push` hay `git commit`. Mọi thay đổi mã nguồn được lưu trữ cục bộ sẵn sàng để người dùng kiểm tra.
- **Đồng bộ tài liệu (Strict Rule 2)**: Cập nhật đầy đủ `.cursorrules`, `MEMORY.md` và `document/`.
