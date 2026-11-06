# TÀI LIỆU ĐẶC TẢ PHÂN HỆ 02: THỐNG KÊ QUẢN TRỊ, 3 CHẾ ĐỘ XUẤT EXCEL & NHẬP DỮ LIỆU THÔNG MINH
**Hệ thống:** Cổng Quản Trị Web CRM & Mobile App CLB Doanh Nhân CEO 1983 (HanoiBA)  
**Phiên bản:** 8.0 — Cập nhật chuẩn hóa Kiến trúc & Dữ liệu thực nghiệm  
**Mã phân hệ:** `[SUB-SPEC-02]` (Ánh xạ `[NODE-CRM-002]`, `[NODE-CRM-007]`)

---

## 1. TỔNG QUAN NGHIỆP VỤ (BUSINESS REQUIREMENTS - BRD)
### 1.1. Mục tiêu nghiệp vụ
- Khác biệt hoàn toàn so với báo cáo tóm tắt trên Mobile App, phân hệ Thống kê Quản trị trên Web CRM là công cụ đắc lực hỗ trợ Ban Điều Hành ra quyết định chiến lược:
  - Giám sát toàn diện chỉ số gắn kết hội viên (Tỷ lệ hoạt động tích cực vs Cần hỗ trợ).
  - Phân tích hiệu quả giao thương B2B, số lượng cuộc hẹn 1-on-1, doanh số thương vụ chốt thành công.
  - Cung cấp tính năng xuất Excel linh hoạt phục vụ in ấn, đối soát và nộp báo cáo cho Thường trực HanoiBA.
  - Cho phép Ban Thư Ký nhập hàng loạt hội viên từ tệp Excel bên ngoài thông qua cơ chế tự động bóc tách các trường thông tin không cần chỉnh sửa thủ công.

---

## 2. ĐẶC TẢ YÊU CẦU PHẦN MỀM (SOFTWARE REQUIREMENTS - SRS)
### 2.1. Yêu cầu chức năng Xuất Báo Cáo Excel (3 Chế độ Độc lập)
- **FR-02.1 (Chế độ 1: Xuất Tất Cả Theo Thời Gian - Tháng / Quý / Năm)**:
  - Cho phép người dùng chọn Năm báo cáo, loại chu kỳ (Theo Tháng, Theo Quý, Toàn Năm) và chi tiết kỳ tương ứng.
  - Xuất ra file Excel (.xlsx) chuẩn cấu trúc với Header CLB Doanh Nhân CEO 1983 - HanoiBA.
  - Danh sách cột: STT, Mã Hội Viên, Họ và Tên, Doanh Nghiệp, Chức Vụ, Ban Chuyên Môn, SĐT, Email, Ngành Nghề, Lượt Kết Nối B2B, Thương Vụ Đã Chốt, Tổng Giá Trị Giao Thương (VNĐ), Điểm Gắn Kết (%), Trạng Thái Hoạt Động.
  - Tự động bổ sung dòng Tổng Cộng (Sum) cho toàn bộ các chỉ số định lượng ở cuối bảng.
- **FR-02.2 (Chế độ 2: Xuất Chi Tiết Theo Từng Hội Viên - Individual Dossier)**:
  - Cho phép tìm kiếm và tích chọn 1 hoặc nhiều hội viên cụ thể trong danh bạ.
  - Kết xuất file Excel đa trang tính (multi-sheet), mỗi hội viên tương ứng với 1 Sheet độc lập chứa:
    - Bảng thông tin định danh & liên hệ doanh nhân.
    - Bảng tổng kết KPI hoạt động trong năm.
    - Bảng lịch sử các cơ hội B2B đã tạo, trạng thái thương thảo và giá trị hợp đồng.
- **FR-02.3 (Chế độ 3: Xuất Báo Cáo Biến Động Hội Viên - Fluctuations & Delta Analysis)**:
  - Phân tích so sánh biên độ tăng/giảm (+/- %) giữa kỳ hiện tại so với kỳ liền kề trước đó.
  - Tự động phân loại 3 nhóm: Nhóm bứt phá tăng trưởng (+20%), Nhóm duy trì ổn định (±5%), Nhóm suy giảm / cần hỗ trợ kết nối lại.
  - Tự động sinh cột "Hành động đề xuất của BĐH" để phân công Ủy viên BCH liên hệ đồng hành.

### 2.2. Yêu cầu chức năng Nhập Dữ Liệu Excel Thông Minh (Smart Import)
- **FR-02.4 (Kéo thả & Đọc trực tiếp Client-side bằng SheetJS XLSX)**:
  - Hỗ trợ định dạng `.xlsx`, `.xls`, `.csv` với dung lượng tối đa 15MB.
- **FR-02.5 (Thuật toán Fuzzy Header Mapping tự bóc tách trường thông tin)**:
  - Tự động nhận diện dòng tiêu đề và chuẩn hóa ánh xạ cột tiếng Việt có dấu, không dấu hoặc tiếng Anh:
    - Họ tên -> `name`
    - Số điện thoại -> `phone`
    - Email -> `email`
    - Tên công ty / Doanh nghiệp -> `company`
    - Chức vụ / Vị trí -> `position`
    - Ngành nghề / Lĩnh vực -> `industry`
    - Ban chuyên môn -> `department`
    - Địa chỉ doanh nghiệp -> `address`
- **FR-02.6 (Bảng Xem Trước & Kiểm Tra Tính Hợp Lệ - Live Preview)**:
  - Hiển thị badge số dòng hợp lệ (Xanh lá) và số dòng có cảnh báo thiếu dữ liệu (Vàng/Đỏ).
  - Cho phép tích chọn/bỏ chọn từng dòng hoặc toàn bộ dòng muốn nhập.
  - Cung cấp nút "Tải Mẫu Chuẩn (.xlsx)" sinh trực tiếp file template mẫu có sẵn cấu trúc chuẩn.
- **FR-02.7 (Đồng bộ Backend API Bulk Import)**:
  - Gọi endpoint `POST /members/bulk-import` ghi nhận vào CSDL PostgreSQL với logic: Cập nhật nếu đã có SĐT/Email, tạo mới nếu là hội viên mới.

