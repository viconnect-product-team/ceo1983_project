# BẢNG TIẾP NHẬN & XỬ LÝ Ý KIẾN ĐÓNG GÓP, CHẤT VẤN KỸ THUẬT
**CLB Doanh Nhân CEO 1983 (HanoiBA) - Phiên Họp Thẩm Định Hệ Thống Số**
*Thời gian phiên:* 09:45 - 11:45 Thứ Tư (Thời lượng: 120 phút)  
*Đơn vị phát triển:* ViConnect  

---

## 1. Mục Đích & Hướng Dẫn Sử Dụng
File này dùng để thư ký và người chủ trì mở lên gõ trực tiếp nội dung đóng góp, chất vấn kỹ thuật từ Ban Điều Hành và 6 Trưởng Ban chuyên môn trong suốt 2 tiếng trao đổi.
- **File Excel tương ứng:** `document/BIEU_MAU_GHI_NHAN_Y_KIEN_TRAO_DOI_THU_4_CEO1983.xlsx`
- **File Word tương ứng:** `document/BIEU_MAU_GHI_NHAN_Y_KIEN_TRAO_DOI_THU_4_CEO1983.docx`

## 2. Bảng Ghi Nhận Chi Tiết Theo Thời Gian Thực

| STT | Thời gian | Người góp ý / Chức vụ | Ban chuyên môn | Phân hệ liên quan | Nội dung góp ý / Chất vấn | Phân loại | Phản hồi Kỹ thuật (ViConnect) | Mức ưu tiên | Kết luận xử lý | Người phụ trách & Hạn chót |
|:---:|:---:|:---|:---|:---|:---|:---|:---|:---:|:---|:---|
| 1 | 09:50 | **Lê Hoàng Long (Trưởng Ban)** | Ban Sự kiện | Mobile App - Check-in QR | Đề nghị tối ưu camera quét QR vé tại cổng sự kiện để đạt tốc độ dưới 1 giây, hoạt động tốt kể cả khi hội trường mạng 4G yếu hoặc chập chờn. | Tối ưu hiệu năng & Offline | Đã tích hợp camera scanner native, cache vé offline trong máy, hỗ trợ quét liên tục và đồng bộ ngược lên máy chủ khi có mạng trở lại. | **P0 - Bắt buộc** | **Duyệt áp dụng ngay** | Trưởng nhóm Mobile ViConnect (18:00 Thứ Năm) |
| 2 | 09:58 | **Nguyễn Văn Cường (Trưởng Ban)** | Ban Thành viên | Danh bạ CEO & Thẻ hội viên | Hồ sơ hội viên và ảnh bìa đại diện trên điện thoại phải hiển thị sắc nét, đồng bộ tên doanh nghiệp, chức vụ thật từ hệ cơ sở dữ liệu, không được sót chữ. | Chuẩn hóa dữ liệu & UI | Đã vá triệt để: bổ sung cột cover_url, company_name vào database PostgreSQL, sửa lỗi initials lọc bỏ hậu tố admin, co giãn 2 dòng không bị cụt. | **P0 - Bắt buộc** | **Đã hoàn thành 100%** | Trưởng nhóm Backend ViConnect (Đã xử lý) |
| 3 | 10:08 | **Phạm Quang Huy (Trưởng Ban)** | Ban Tài chính | Web CRM - Quản trị Sổ quỹ TT200 | Cần xuất được file Excel Sổ quỹ tiền mặt và Sổ tiền gửi ngân hàng chuẩn Thông tư 200/2014/TT-BTC, có đầy đủ công thức tính Tồn đầu kỳ, Thu, Chi, Tồn cuối kỳ. | Quy trình kế toán | Đã hoàn thiện module xuất Excel và PDF chuẩn mẫu S03a-DNN và S03b-DNN theo Thông tư 200, hiển thị số dư thực theo từng tài khoản ngân hàng CLB. | **P0 - Bắt buộc** | **Duyệt nghiệm thu** | Chuyên viên Kế toán ViConnect (Đã sẵn sàng) |
| 4 | 10:18 | **Hoàng Minh Tuấn (Trưởng Ban)** | Ban Xúc tiến TM | Mobile App & Web - Gian hàng B2B | Cho phép hội viên tự chụp ảnh sản phẩm từ camera điện thoại, đăng tải giá bán, ưu đãi độc quyền cho thành viên CLB và tạo cơ hội hợp tác kinh doanh. | Tính năng nghiệp vụ | Hệ sinh thái đã có sẵn mục Gian hàng & Cơ hội kinh doanh (Deals), đã kết nối MinIO lưu ảnh độ nét cao và thông báo real-time khi có đối tác quan tâm. | **P1 - Ưu tiên cao** | **Duyệt triển khai** | Kỹ sư Fullstack ViConnect (20:00 Thứ Sáu) |
| 5 | 10:28 | **Vũ Thu Trang (Trưởng Ban)** | Ban Thiện nguyện | Cổng đóng góp & Quỹ thiện nguyện | Công khai danh sách ủng hộ chương trình từ thiện minh bạch theo thời gian thực, có mã QR ngân hàng tạo sẵn số tiền đóng góp để hội viên chuyển khoản nhanh. | Minh bạch tài chính | Đã tích hợp mã VietQR động theo từng chiến dịch thiện nguyện, webhook ngân hàng tự động cập nhật tên người ủng hộ và số tiền lên bảng vinh danh. | **P1 - Ưu tiên cao** | **Duyệt áp dụng** | Kỹ sư Cổng thanh toán (Thứ Bảy) |
| 6 | 10:38 | **Đại diện Ban Kiểm tra** | Ban Kiểm tra | Phân quyền & Bảo mật hệ thống | Đảm bảo dữ liệu số điện thoại, doanh thu và các deal nội bộ chỉ hội viên chính thức đã duyệt mới được xem; tài khoản khách vãng lai chỉ xem thông tin công khai. | Bảo mật & Phân quyền | Hệ thống áp dụng RBAC 4 cấp: SuperAdmin, Ban Chấp Hành, Hội viên chính thức (VIP), Khách. API kiểm soát JWT chặt chẽ ở tầng Backend. | **P0 - Bắt buộc** | **Đã kiểm thử Pass** | Chuyên gia An toàn thông tin (Đã bảo đảm) |
| 7 | 10:48 | **Phó Chủ tịch Phụ trách Đối ngoại** | Thường trực BĐH | Sapphire Hub & Cẩm nang CLB | Cần mục lưu trữ các tài liệu chính sách, cẩm nang hội viên, quy chế văn hóa 1983 để tân hội viên cài app là mở xem và tải về được ngay. | Tiện ích tri thức | Đã kích hoạt Sapphire Hub trên Mobile App và Web CRM, hỗ trợ xem trực tuyến file PDF, Word điều lệ và các mẫu văn bản hiệp hội. | **P2 - Trung bình** | **Duyệt đưa vào sử dụng** | Nhóm Nội dung số (Đã sẵn sàng) |
| 8 | 10:58 | **Tổng Thư ký CLB** | Ban Thư ký | Bầu cử & Biểu quyết số | Trong các kỳ họp Đại hội thường niên, cần tính năng biểu quyết trực tuyến tại hội trường bằng điện thoại, chống gian lận và hiển thị kết quả ngay. | Tính năng biểu quyết | Đã có sẵn module Biểu quyết số trên Mobile App, kiểm soát theo mã hội viên duy nhất (M1983-xxx), mỗi người 1 phiếu, hiển thị biểu đồ kết quả trực tiếp. | **P1 - Ưu tiên cao** | **Duyệt cho Đại hội** | Nhóm Giải pháp số (Đã sẵn sàng) |
| 9 | 11:05 | *(Điền trực tiếp trong cuộc họp)* | | | | | | | | |
| 10 | 11:15 | *(Điền trực tiếp trong cuộc họp)* | | | | | | | | |
| 11 | 11:25 | *(Điền trực tiếp trong cuộc họp)* | | | | | | | | |
| 12 | 11:35 | *(Điền trực tiếp trong cuộc họp)* | | | | | | | | |

---

## 3. Tổng Kết Xử Lý Phiên Thảo Luận
- **Tổng số ý kiến tiếp nhận:** Ghi nhận đầy đủ theo từng nhóm nghiệp vụ.
- **Cam kết kỹ thuật của ViConnect:** 100% các ý kiến mức **P0 (Bắt buộc)** được xử lý và kiểm thử tự động ngay trước thời điểm phát hành. Dữ liệu chạy trực tiếp trên cơ sở dữ liệu PostgreSQL thật, không dùng bất kỳ dữ liệu fake/mock/hard-coded nào ở Frontend.
