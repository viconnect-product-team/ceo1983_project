# TÀI LIỆU ĐẶC TẢ PHÂN HỆ 06: TRỢ LÝ CỐ VẤN SỐ AI, ONBOARDING NGÀY ĐẦU & TOUR HƯỚNG DẪN "GIÁO VIÊN ĐỨNG CẠNH BẢNG"
**Hệ thống:** Cổng Quản Trị Web CRM & Mobile App CLB Doanh Nhân CEO 1983 (HanoiBA)  
**Phiên bản:** 8.0 — Cập nhật chuẩn hóa Kiến trúc & Dữ liệu thực nghiệm  
**Mã phân hệ:** `[SUB-SPEC-06]` (Ánh xạ `[NODE-CRM-011]`, `[NODE-APP-016]`)

---

## 1. TỔNG QUAN NGHIỆP VỤ (BUSINESS REQUIREMENTS - BRD)
### 1.1. Mục tiêu nghiệp vụ
- Xóa bỏ hoàn toàn cảm giác bỡ ngỡ của người dùng khi tiếp cận hệ thống: Áp dụng trọn vẹn mô hình hướng dẫn thao tác chi tiết từng bước như các ứng dụng ngân hàng số hiện đại hàng đầu (Vietcombank Digibank, Techcombank Mobile, MoMo).
- Trợ lý Cố Vấn Số AI (AI Tutor) đồng hành trực tiếp: Không chỉ là một tài liệu tĩnh, mà AI sẽ xuất hiện tại từng bước, đưa ra lời giải thích nghiệp vụ, lời khuyên thực chiến và lắng nghe câu hỏi thắc mắc của người dùng để trả lời ngay lập tức.
- Tạo ấn tượng ấm áp, chuyên nghiệp ngay từ lần đầu tiên hội viên đăng nhập vào Mobile App: AI xuất hiện chào mừng, hỏi thăm sức khỏe và điểm qua lịch trình sự kiện/cuộc họp trong ngày.

---

## 2. ĐẶC TẢ YÊU CẦU PHẦN MỀM (SOFTWARE REQUIREMENTS - SRS)
### 2.1. Thiết kế Giao diện Độc bản "Giáo Viên Đứng Bên Cạnh Bảng"
- **FR-06.1 (Bố cục 2 phần tách biệt chuẩn lớp học)**:
  - **Bên Trái (hoặc Cột 4/12)**: Icon / Avatar Trợ lý AI Cố Vấn Số CEO 1983 trong trang phục doanh nhân lịch lãm, gắn huy hiệu trạng thái "AI Đang Giảng" kèm sóng nhịp đập sinh động.
  - **Bên Phải (hoặc Cột 8/12)**: Khung bảng tương tác (Blackboard Style) hiển thị rõ ràng:
    - Tiêu đề bước (Bước X/Y) và mã Use Case (`UC-CRM-01`, `UC-CRM-02`,...).
    - Văn bản chỉ dẫn thao tác cụ thể trên giao diện.
    - Khung "Lời khuyên từ Cố Vấn Số" bổ sung góc nhìn nghiệp vụ thực tế.
    - Khung chat tương tác "Hỏi AI thêm về bước này": Người dùng gõ câu hỏi, AI tự động phân tích và giải đáp ngay tức thì.
    - Nút điều hướng: "Tiếp tục" / "Tôi đã hiểu", "Quay lại", "Bỏ qua hướng dẫn".
- **FR-06.2 (Bao phủ Đầy đủ các Use Cases Trọng yếu)**:
  - **Nhóm CRM**:
    - `UC-CRM-01`: Quản trị Hội viên & Phân quyền Ban Điều Hành.
    - `UC-CRM-02`: Tạo Sự Kiện CLB & Phát hành Vé QR Check-in.
    - `UC-CRM-03`: Thống Kê Chuyên Sâu & Xuất/Nhập Excel Thông Minh.
    - `UC-CRM-04`: Cấu hình Tích hợp Đa Kênh & 1-Click Auto Post.
  - **Nhóm Mobile App**:
    - `UC-APP-01`: Thẻ Hội Viên Điện Tử & Check-in QR.
    - `UC-APP-02`: Chia Sẻ & Tiếp Nhận Cơ Hội Kinh Doanh B2B.
    - `UC-APP-03`: Sàn Thương Mại & Đặt Lịch Gặp B2B Tự Động.

### 2.2. Modal Chào Mừng Ngày Đầu Tiên Đăng Nhập (First-Day AI Welcome Greeting)
- **FR-06.3 (Cơ chế Nhận Diện Ngày Đầu Tiên)**:
  - Hệ thống kiểm tra khóa `vba_first_day_welcomed_date` trong LocalStorage.
  - Modal CHỈ hiển thị đúng vào ngày đầu tiên hội viên đăng nhập vào Mobile App. Sau khi hội viên bấm "Bắt đầu dùng App" hoặc "Xem Tour", hệ thống ghi nhận ngày và không hiển thị lại làm phiền người dùng.
- **FR-06.4 (Nội dung Chào mừng Đậm chất Doanh nhân)**:
  - Avatar AI đứng vẫy tay chào bên trái.
  - Bảng lời nhắn bên phải:
    - Lời chào cá nhân hóa: "Chào mừng Doanh nhân [Họ tên]! Hôm nay Bạn có khỏe không? Chúc Bạn một ngày tràn đầy năng lượng và kết nối giao thương thắng lợi!"
    - Bảng điểm tin lịch trình hôm nay: Hiển thị cuộc hẹn kết nối 1-on-1 lúc 14:30 và sự kiện Cafe Doanh Nhân sắp tới.
    - Nút kích hoạt nhanh: "Xem Hướng Dẫn Thao Tác (Tour)" và "Bắt đầu dùng App".

