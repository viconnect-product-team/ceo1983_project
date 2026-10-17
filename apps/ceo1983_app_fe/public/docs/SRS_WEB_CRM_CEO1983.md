# ĐẶC TẢ YÊU CẦU PHẦN MỀM HỆ THỐNG QUẢN TRỊ (SRS - WEB CRM)
## HỆ THỐNG QUẢN TRỊ CLB DOANH NHÂN CEO 1983
*Chuẩn IEEE 830 - Phiên bản 4.0 - Tháng 10/2026*

---

### 1. MỤC ĐÍCH & PHẠM VI HỆ THỐNG
Tài liệu đặc tả chi tiết các yêu cầu chức năng, yêu cầu phi chức năng và giao diện lập trình cho Cổng Quản trị Web CRM Hiệp hội CEO 1983:
- Quản lý phân quyền người dùng theo ma trận 8 Phân hệ x 5 Vai trò.
- Thẩm quyền giao việc phân cấp theo Ban Chuyên môn và bảo vệ dữ liệu công việc.
- Hệ thống thông báo thay đổi quyền hạn thời gian thực qua Popup trung tâm.
- Quản trị tài chính thu chi, hội phí Napas 24/7 và hóa đơn điện tử.
- Quản trị sự kiện, sơ đồ khán phòng Seating Map và cổng soát vé QR.

---

### 2. CÁC YÊU CẦU CHỨC NĂNG CHÍNH
1. **Phân hệ Quản trị Phân quyền RBAC**:
   - Ma trận phân quyền động lưu trong cấu hình hệ thống.
   - 7 cấp bậc: Chủ tịch, Admin, Ban Điều Hành, Tổng thư ký, Trưởng ban, Ban thư ký, Hội viên.
   - Chặn điều hướng khi chưa lưu quyền (Unsaved changes modal 3 lựa chọn).
2. **Phân hệ Giao việc & Quản lý Nhiệm vụ**:
   - Đính kèm tệp đa định dạng: Word, Excel, PDF, Hình ảnh.
   - Thẩm quyền giao việc theo ban, chặn ném lỗi 403 nếu vượt quyền.
   - Biểu mẫu động: Phân loại, dự toán, tiêu chí nghiệm thu, việc con, họp trực tuyến.
3. **Phân hệ Quản lý Hội viên & Doanh nghiệp**:
   - Tiếp nhận, thẩm định, phê duyệt và cấp tài khoản tự động.
   - Hồ sơ hội viên 360 độ và danh bạ doanh nghiệp.
4. **Phân hệ Quản lý Tài chính & Hội phí**:
   - Tự động sinh mã VietQR theo chuẩn Napas 24/7.
   - Xuất nhập báo cáo tài chính định dạng Excel tiêu chuẩn.
5. **Phân hệ Quản trị Sự kiện & Bàn tiệc**:
   - Thiết lập khán phòng, số bàn, số ghế và quay số Lucky Draw.
