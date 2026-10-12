// Module sinh nội dung SRS Tổng thể hệ sinh thái CEO 1983 (Web CRM + Mobile App)
function getMasterSrsMarkdown() {
  return `# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM TỔNG THỂ HỆ THỐNG (MASTER SRS)
## HỆ SINH THÁI SỐ TOÀN DIỆN CLB DOANH NHÂN CEO 1983 (HANOIBA)
*Chuẩn IEEE 830 - Phiên bản 5.0 Hoàn thiện - Ngày phát hành: Tháng 10/2026*

---

# PHẦN 1: TỔNG QUAN KIẾN TRÚC KẾT NỐI ĐỒNG BỘ 2 CHIỀU
Hệ sinh thái số **CLB Doanh Nhân CEO 1983** được xây dựng trên mô hình kết nối đồng bộ 2 chiều thời gian thực (Realtime Dual-Sync) giữa hai trụ cột then chốt:
1. **Cổng Quản trị CRM Hiệp hội (Web CRM)**: Trung tâm điều phối, phân quyền và kiểm soát của Chủ tịch, Ban Điều Hành, Tổng thư ký và 5 Trưởng ban chuyên môn.
2. **Ứng dụng Di động Doanh nhân (Mobile App)**: Tấm Danh Thiếp Số Quyền Năng và Văn Phòng Bỏ Túi của toàn thể hội viên trên nền tảng iOS và Android.

Cả hai trụ cột hoạt động trên một cơ sở dữ liệu đồng nhất, đảm bảo mọi dữ liệu phát sinh từ điện thoại của hội viên (kết quả nghiệm thu, lượt chạm thẻ thông minh 1 chạm, đăng ký vé sự kiện, thanh toán hội phí VietQR Napas 24/7) đều lập tức xuất hiện trên màn hình điều hành CRM trong vòng dưới 1 giây và ngược lại.

---

# PHẦN 2: MA TRẬN LIÊN THÔNG DỮ LIỆU GIỮA WEB CRM VÀ MOBILE APP

| Phân hệ nghiệp vụ | Luồng dữ liệu từ Web CRM xuống Mobile App | Luồng dữ liệu từ Mobile App lên Web CRM | Thời gian đồng bộ |
| :--- | :--- | :--- | :--- |
| **Phân quyền & Vai trò** | Thay đổi quyền hạn, kích hoạt tài khoản lãnh đạo | Gửi nhật ký xác thực FaceID, đăng nhập thẻ thông minh | Dưới 0.5 giây (Tức thời) |
| **Hồ sơ Hội viên & Doanh nghiệp** | Thông báo phê duyệt kết nạp, cấp mã số CEO-83xxx | Cập nhật số điện thoại, ảnh đại diện, hồ sơ năng lực | Tức thời |
| **Công việc & Giao việc** | Ban hành nhiệm vụ, đính kèm tài liệu Word/Excel/PDF | Nộp báo cáo tiến độ %, ảnh chụp nghiệm thu hiện trường | Tức thời kèm chuông báo |
| **Sự kiện & Soát vé QR** | Xuất bản sự kiện, bố trí sơ đồ bàn tiệc VIP | Đăng ký vé, quét QR tại bàn lễ tân (0.1s check-in) | Dưới 0.1 giây |
| **Tài chính & Hội phí** | Phát hành hóa đơn hội phí, duyệt lệnh tạm ứng | Quét mã VietQR chuyển khoản ngân hàng Napas 24/7 | Dưới 10 giây (Theo ngân hàng) |
| **Cuộc họp & Giao thương** | Triệu tập họp Ban Chấp Hành, ban hành nghị quyết | Điểm danh họp bằng mã QR, đặt lịch hẹn cà phê 1-on-1 | Tức thời |
| **Sàn Giao thương B2B** | Ban Xúc tiến phê duyệt niêm yết sản phẩm | Đăng sản phẩm mới, gửi yêu cầu báo giá giao thương | Tức thời |

---

# PHẦN 3: ĐẶC TẢ CHI TIẾT CÁC PHÂN HỆ THEO CẤU TRÚC CHUẨN MỰC

Chi tiết đặc tả từng màn hình, trường dữ liệu, quy tắc kiểm tra (validation), hành vi động theo lựa chọn danh mục (Select-State UI Dependencies), luồng nghiệp vụ lưu nháp/lưu chính thức và tương tác giao tiếp dữ liệu được quy định cụ thể tại:
- [Tài liệu SRS Web CRM](file:///d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/document/SRS_WEB_CRM_CEO1983.md)
- [Tài liệu SRS Mobile App](file:///d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/document/SRS_MOBILE_APP_CEO1983.md)

---

# PHẦN 4: TIÊU CHUẨN AN TOÀN DỮ LIỆU & ĐẢM BẢO HOẠT ĐỘNG LIÊN TỤC
1. **Bảo vệ Phân quyền Thời Gian Thực (Active Role Enforcement)**:
   - Khi Ban Điều Hành thay đổi quyền hạn của một tài khoản trên Web CRM, máy chủ tự động phát tín hiệu thu hồi hoặc nâng quyền.
   - Nếu tài khoản đó đang mở ứng dụng di động hoặc Web CRM, hệ thống tự động hiển thị cửa sổ thông báo giữa màn hình: *"Quyền hạn của bạn vừa được cập nhật theo quyết định của Ban Điều Hành"* và tự động tải lại quyền mà không làm mất phiên đăng nhập.
2. **Cơ chế Xóa Liên Thông (Cascade Deletion Safety)**:
   - Khi xóa một hội viên, toàn bộ các bản ghi liên quan (hồ sơ doanh nghiệp, sản phẩm gian hàng B2B, thẻ thông minh doanh nhân, tài khoản đăng nhập) được giải phóng đồng bộ, triệt tiêu hoàn toàn rác dữ liệu.
3. **Bảo mật Đàm thoại & Thông báo Nền Native**:
   - Các cuộc đàm thoại thoại và video nội bộ được bảo vệ nghiêm ngặt.
   - Dịch vụ thông báo nền native trên điện thoại đảm bảo chuông cuộc gọi khẩn đổ vang ngay trên màn hình khóa kể cả khi ứng dụng đang đóng hoàn toàn.
   - Kết thúc cuộc gọi tức thì ở cả hai đầu khi một bên gác máy (0ms độ trễ), không để chuông ảo đổ tiếp.

---

# PHẦN 5: BẢNG MÀU NHẬN DIỆN THƯƠNG HIỆU CHUẨN HANOIBA CEO 1983
Toàn bộ giao diện Web CRM và Mobile App bắt buộc tuân thủ tuyệt đối bảng màu nhận diện thương hiệu câu lạc bộ:
- **Màu chủ đạo (Primary)**: \`#0A2540\` (Deep Cobalt Navy) - Thể hiện sự vững chãi, bản lĩnh và chiều sâu trí tuệ của doanh nhân.
- **Màu điểm nhấn (Accent & Luxury)**: \`#D4AF37\` / \`#F59E0B\` (Warm Amber Gold) - Tượng trưng cho sự thịnh vượng, đẳng cấp mạ vàng và năng lượng tiên phong.
- **Màu nền sáng (Light Surface)**: \`#F8FAFC\` (Slate Light) - Tinh tế, rõ ràng, tôn vinh nội dung văn bản.
- **Màu nền tối (Dark Surface)**: \`#0B192C\` / \`#1E293B\` (Navy Night) - Hiện đại, không gây mỏi mắt trong các phiên làm việc ban đêm.
- *Quy tắc nghiêm ngặt: Tuyệt đối không sử dụng màu tím ViOne hoặc màu đen u ám ở chế độ giao diện sáng.*

---
`;
}

module.exports = {
  getMasterSrsMarkdown,
};
