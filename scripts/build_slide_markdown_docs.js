const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '../document');
const FE_DOCS_DIR = path.join(__dirname, '../apps/vione_app_fe/public/docs');
const CEO_DOCS_DIR = path.join(__dirname, '../apps/ceo1983_app_fe/public/docs');

// 1. CRM SLIDES MARKDOWN (16 Slides không có đăng nhập)
const crmMd = `# SLIDE THUYẾT TRÌNH HỆ THỐNG WEB CRM QUẢN TRỊ - CLB DOANH NHÂN CEO 1983
*Bản quyền © 2026 CLB Doanh Nhân CEO 1983 · Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA)*
*Tập tin trình chiếu PowerPoint: SLIDE_THUYET_TRINH_CRM_QUAN_TRI_CEO1983.pptx (16 Slides)*

---

### Slide 01: Bìa Trình Bày - Trung Tâm Điều Hành & Quản Trị Số Hóa Hiệp Hội
- **Chủ đề**: 4 Trụ Cột Điều Hành Số Hóa Toàn Diện.
- **Nội dung cốt lõi**: Quản trị hội viên 360° · Tài chính & đối soát VietQR · Sự kiện, bầu cử & Lucky Draw · Sàn giao thương B2B.

### Slide 02: Bảng Điều Khiển Tổng Quan (Dashboard) & Chỉ Số KPI Thực
- **Bức tranh toàn cảnh**: Thống kê số lượng lãnh đạo hội viên chính thức, nguồn thu hội phí, số lượng deal giao thương và tỷ lệ tăng trưởng.
- **Báo cáo**: Xuất báo cáo Ban Chấp Hành tức thì phục vụ các kỳ họp định kỳ.

### Slide 03: Quản Trị Danh Sách Hội Viên, Phân Hạng & Bộ Lọc Ban Ngành
- **Quản lý danh bạ**: Họ tên, doanh nghiệp, mã số thuế, chức vụ C-Level, số điện thoại và ngành nghề.
- **Phân bổ ban bệ**: Sắp xếp hội viên vào 6 ban chuyên môn sinh hoạt và xuất file Excel danh bạ chuẩn in kỷ yếu.

### Slide 04: Thẩm Định Hồ Sơ 360° & Ban Thường Vụ Độc Quyền Phê Duyệt
- **Quy trình thẩm định**: Xem xét giấy phép kinh doanh, chức vụ lãnh đạo và lĩnh vực hoạt động.
- **Phê duyệt độc quyền**: Chỉ Ban Thường Vụ có thẩm quyền bấm duyệt cấp mã định danh chính thức CEO-83xxx.
- **Tự động hóa**: Hệ thống kích hoạt tài khoản và gửi ngay thư điện tử kèm mật khẩu khởi tạo về hòm thư hội viên.

### Slide 05: Hồ Sơ Chi Tiết Hội Viên 360°, Phân Hạng Kim Cương & Quản Trị Tài Khoản
- **Hồ sơ 360 độ**: Theo dõi lịch sử sinh hoạt, tham gia sự kiện, giao thương và đóng hội phí.
- **Quản trị an toàn**: Đặt lại mật khẩu gửi về email, tạm khóa hoặc mở khóa quyền truy cập tức thì.
- **Chấm điểm KPI**: Thuật toán tự động xếp hạng hội viên Kim Cương, Vàng, Bạc minh bạch.

### Slide 06: Event Wizard: Khởi Tạo, Sửa Sự Kiện, Diễn Giả, Vé Đa Tầng & Xác Nhận
- **Vòng đời sự kiện**: Thiết lập thông tin, lịch trình chi tiết, hình ảnh diễn giả VIP và vé đa tầng.
- **Cấu hình vé**: Vé VIP 0đ cho hội viên; vé đối tác phụ thu qua mã VietQR tự động.

### Slide 07: Sơ Đồ Rạp Cinema Seating Map & Xếp Chỗ VIP Gala Dinner
- **Khán phòng trực quan**: Mô phỏng ma trận bàn tiệc Bàn Chủ Tọa, Bàn Kim Cương, Bàn Đại biểu.
- **Xếp chỗ danh dự**: Kéo thả phân bổ chỗ ngồi danh dự và đồng bộ số bàn số ghế lên vé trên điện thoại hội viên.

### Slide 08: Cổng Soát Vé Check-in QR Tốc Độ Cao & Giám Sát Cửa (Xanh / Đỏ)
- **Tốc độ 1 giây**: Quét vé QR từ App bằng camera máy tính bảng hoặc máy quét chuyên dụng.
- **Chống gian lận**: Cảnh báo màu đỏ nổi bật và âm thanh cảnh báo nếu vé bị quét trùng lặp.

### Slide 09: Quản Trị Cuộc Họp BQT, Phòng Họp Trực Tiếp / Online & Điểm Danh QR
- **Phòng họp linh hoạt**: Đặt phòng họp Sapphire Hub hoặc phòng trực tuyến Zoom/Google Meet.
- **Triệu tập tự động**: Phát thông báo push và gửi tin nhắn hệ thống [CEO1983_SYSTEM] vào nhóm chat.
- **Điểm danh thông minh**: Quét mã QR tại cửa phòng họp ghi nhận chính xác giây có mặt của lãnh đạo.

### Slide 10: Quản Trị Bầu Cử Đại Hội & Biểu Quyết Tín Nhiệm Đại Biểu
- **Dân chủ số hóa**: Thiết lập kỳ bỏ phiếu, danh sách ứng cử viên Ban Chấp Hành nhiệm kỳ mới.
- **Kiểm phiếu tự động**: Mã hóa phiếu bầu một chiều ngăn bỏ phiếu hai lần, tổng hợp tỷ lệ phần trăm trực tiếp.

### Slide 11: Quản Trị Vòng Quay May Mắn Lucky Draw & Trao Thưởng VinFast VF3
- **Khuấy động Gala**: Quay số ngẫu nhiên từ tập hợp mã vé đã check-in vào sự kiện.
- **Vinh danh trúng giải**: Hiển thị thông tin người trúng giải lên màn LED và gửi push xuống điện thoại tức thì.

### Slide 12: Quản Trị Nhà Tài Trợ, Phân Bổ Gói Quyền Lợi Kim Cương/Vàng & Đo ROI
- **Đối tác tài trợ**: Quản lý gói Diamond, Platinum, Gold, Silver kèm định mức và quyền lợi.
- **Đo lường hiệu quả**: Đẩy logo lên banner, backdrop, vé mời và thống kê lượt tiếp cận thương hiệu.

### Slide 13: Quản Trị Sàn Marketplace, Kiểm Duyệt Sản Phẩm Doanh Nghiệp
- **Thẩm định chất lượng**: Kiểm duyệt sản phẩm, thông số kỹ thuật và chính sách chiết khấu ưu đãi nội bộ.
- **Xuất bản tức thì**: Bấm duyệt là sản phẩm xuất hiện ngay trên sàn giao dịch di động của toàn bộ hội viên.

### Slide 14: Điều Phối Cơ Hội Giao Thương B2B & Thống Kê Giá Trị Deals
- **Kết nối cung cầu**: Theo dõi các nhu cầu mua bán sỉ, tìm nhà cung ứng và kêu gọi đầu tư.
- **Đo lường giá trị**: Thống kê quy mô kinh tế bằng tiền mà hệ sinh thái CEO 1983 đã kiến tạo cho hội viên.

### Slide 15: Quản Lý Thu Hội Phí Thường Niên, Đối Soát VietQR & Sổ Quỹ Thu Chi 3 Cấp
- **Gạch nợ tự động**: Đối soát tự động 24/7 khi hội viên chuyển khoản mã VietQR, gia hạn thẻ số ngay lập tức.
- **Sổ quỹ minh bạch**: Quy trình phê duyệt 3 cấp (Lập phiếu -> Soát xét -> Phê duyệt) và xuất phiếu thu điện tử.

### Slide 16: Ma Trận Phân Quyền 6 Ban Chuyên Trách RBAC & Nhật Ký Kiểm Toán
- **Phân định quyền hạn**: Tách bạch thẩm quyền Ban Thường Vụ, Ban Thư Ký, Ban Sự Kiện, Ban Tài Chính...
- **Lưu vết bất biến**: Ghi nhận toàn bộ lịch sử thao tác phục vụ kiểm toán, sao lưu định kỳ tự động.
`;

// 2. APP SLIDES MARKDOWN (20 Slides không có đăng nhập)
const appMd = `# SLIDE THUYẾT TRÌNH ỨNG DỤNG DI ĐỘNG HIỆP HỘI - CLB DOANH NHÂN CEO 1983
*Bản quyền © 2026 CLB Doanh Nhân CEO 1983 · Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA)*
*Tập tin trình chiếu PowerPoint: SLIDE_THUYET_TRINH_APP_HIEP_HOI_CEO1983.pptx (20 Slides)*

---

### Slide 01: Bìa Trình Bày - Không Gian Số Hội Viên Đẳng Cấp
- **Chủ đề**: 4 Giá Trị Đặc Quyền Dành Cho Lãnh Đạo Hội Viên.
- **Nội dung cốt lõi**: Thẻ VIP Gold & chạm NFC · Sàn giao thương B2B · Sự kiện, vé số & bầu cử đại hội · Đồng bộ realtime với CRM.

### Slide 02: Trang Chủ Dashboard Doanh Nhân & Tiện Ích 1-Chạm
- **Tiêu điểm**: Thẻ hội viên VIP Titanium 3D ánh kim, thanh tiện ích truy cập nhanh các nghiệp vụ cốt lõi.
- **Thông tin kịp thời**: Đếm ngược sự kiện sắp diễn ra và bảng tin chỉ đạo từ Ban Chủ Tịch.

### Slide 03: Thẻ Định Danh Số VIP Titanium & Tích Hợp Chip Chạm NFC
- **Khẳng định vị thế**: Thiết kế vàng kim sang trọng, mã số hội viên độc bản (CEO-83xxx).
- **Công nghệ chạm NFC**: Chạm lưng điện thoại vào bất kỳ smartphone nào để mở trang định danh trong 1 giây.

### Slide 04: Danh Thiếp Số Doanh Nhân Visit Card Lật Mặt Sau & Chuẩn Brandbook
- **Thay thế card visit giấy**: Mặt trước đầy đủ thông tin lãnh đạo, mặt sau màu xanh Navy mang slogan CLB CEO 1983.
- **Kết nối nhanh**: Mã QR cá nhân hóa để đối tác quét và lưu trực tiếp vCard vào danh bạ điện thoại.

### Slide 05: Quét Mã QR Bằng Camera WebRTC Siêu Tốc 0.1s & Nhận Diện Đa Chiều
- **Camera WebRTC 60fps**: Tự động nhận diện mã QR danh thiếp đối tác, vé sự kiện và điểm danh họp trong 0.1s.
- **Tiện ích thực tế**: Nút bật/tắt đèn flash và lật camera trước/sau hỗ trợ không gian tiệc tối.

### Slide 06: Quét Mã QR Từ Ngoài & Trang Xác Thực Công Khai Chuẩn Brandbook
- **Không cần cài app**: Đối tác dùng camera Zalo/iPhone quét là mở ngay trang web xác thực công khai.
- **Tích xanh bảo chứng**: Dấu chứng nhận tư cách hội viên chính thức được kiểm định bởi CLB và HanoiBA.
- **Liên hệ 1-chạm**: Gọi điện thoại, nhắn tin Zalo và lưu danh bạ vCard chỉ với một cú chạm.

### Slide 07: Chỉnh Sửa Nhanh Hồ Sơ Doanh Nhân (Quick Profile Edit) Tiện Lợi
- **Thao tác nhanh**: Modal kéo chạm trực quan cập nhật ảnh đại diện, ảnh bìa, chức danh và slogan công ty.
- **Đồng bộ tức thì**: Lưu dữ liệu là tự động cập nhật ngay trên thẻ 3D và hệ thống CRM trung tâm.

### Slide 08: Hồ Sơ Năng Lực Doanh Nhân 360° & Pháp Nhân Doanh Nghiệp
- **Thương hiệu cá nhân & tổ chức**: Hiển thị tên công ty, mã số thuế, địa chỉ trụ sở, website và brochure giới thiệu.
- **Khen thưởng & cống hiến**: Vinh danh các danh hiệu và đóng góp tiêu biểu của doanh nhân cho hiệp hội.

### Slide 09: Danh Bạ Hội Viên CLB CEO 1983 & Tra Cứu Đối Tác Đa Ngành Nghề
- **Mạng lưới đồng niên 1983**: Kết nối hơn 100+ Chủ tịch và Tổng Giám Đốc cùng thế hệ.
- **Bộ lọc đa ngành**: Tìm kiếm đối tác theo Xây dựng, Công nghệ, Y tế, Tài chính, Bất động sản...

### Slide 10: Xem Chi Tiết Hồ Sơ Năng Lực Đối Tác & Kết Nối Hợp Tác
- **Tìm hiểu đối tác**: Nắm bắt năng lực kinh doanh, danh mục sản phẩm trước khi tiến hành đàm phán.
- **Kênh kết nối**: Mở phòng chat 1-on-1 hoặc đặt lịch hẹn gặp trực tiếp.

### Slide 11: Đặt Lịch Hẹn Gặp Kết Nối 1-on-1 Giữa 2 CEO Doanh Nghiệp
- **Hẹn gặp 30 giây**: Chọn đối tác, đề xuất giờ gặp và địa điểm tại văn phòng, cafe hoặc Google Meet.
- **Đồng bộ lịch**: Tự động thêm vào Google Calendar, Apple Calendar và gửi thông báo nhắc hẹn trước 1 giờ.

### Slide 12: Hộp Thư Doanh Nghiệp, Chat 1-1 & Nhóm Chat 6 Ban Realtime
- **Trò chuyện bảo mật**: Nhắn tin realtime tốc độ cao, gửi file PDF báo giá, hợp đồng và ảnh mẫu sản phẩm.
- **Kênh chỉ đạo**: Nhận tin nhắn triệu tập họp khẩn và thông báo duyệt hồ sơ từ hệ thống [CEO1983_SYSTEM].

### Slide 13: Lịch Sự Kiện, Diễn Đàn Doanh Nhân & Đăng Ký Vé Tham Dự
- **Lịch trình phong phú**: Nắm bắt Caravan kết nối, Gala Dinner thường niên và Cafe Doanh nhân định kỳ.
- **Vé mời đặc quyền**: Hội viên chính thức nhận vé miễn phí hoặc ưu đãi đặc biệt dành riêng.

### Slide 14: Đăng Ký Sự Kiện, Chọn Chỗ Khán Phòng VIP & Vé Điện Tử E-Ticket
- **Sơ đồ ghế ngồi trực quan**: Chạm chọn trực tiếp vị trí ghế và bàn tiệc VIP trên sơ đồ rạp.
- **Ví vé thông minh**: Lưu vé điện tử trong điện thoại, hiển thị mã may mắn tham gia Lucky Draw.

### Slide 15: Vé Điện Tử Thông Minh & Quét Mã QR Check-in Siêu Tốc 1s
- **Check-in 1 giây**: Đưa mã vé trước máy quét tại bàn lễ tân để hoàn tất thủ tục đón tiếp.
- **Bảo mật phiên**: Mã QR động chống gian lận và hiển thị chính xác số bàn tiệc danh dự.

### Slide 16: Bầu Cử BCH & Biểu Quyết Tín Nhiệm Trực Tuyến Trên App
- **Thực thi dân chủ**: Bỏ phiếu bầu Ban Chấp Hành nhiệm kỳ mới ngay trên màn hình điện thoại.
- **Minh bạch & bảo mật**: Mã hóa phiếu bầu một chiều, mỗi hội viên bỏ phiếu 1 lần, theo dõi tỷ lệ kiểm phiếu realtime.

### Slide 17: Vòng Quay May Mắn Lucky Draw & Nhận Quà Tức Thì
- **Khuấy động đêm tiệc**: Tự động đưa mã vé check-in vào danh sách quay số trúng thưởng ô tô VinFast VF3.
- **Thông báo push tức thì**: Điện thoại rung báo trúng giải ngay trong túi áo để doanh nhân lên sân khấu nhận quà.

### Slide 18: Sàn Thương Mại Marketplace & Gian Hàng Doanh Nghiệp
- **Gian hàng số hóa**: Mỗi hội viên sở hữu gian hàng trưng bày sản phẩm chủ lực với giá ưu đãi nội bộ.
- **Đã kiểm duyệt**: Toàn bộ sản phẩm được thẩm định chất lượng và xuất xứ từ Ban Quản Trị CLB.

### Slide 19: Sàn Trao Cơ Hội Giao Thương B2B & Tìm Kiếm Đối Tác
- **Chia sẻ nhu cầu sỉ**: Công khai nhu cầu mua sắm thiết bị, tìm đại lý hoặc kêu gọi hợp tác đầu tư.
- **Đón nhận cơ hội**: Bấm nhận deal để nhận thông tin liên lạc trực tiếp của doanh nhân có nhu cầu.

### Slide 20: Cổng Đóng Hội Phí Thường Niên & Quét Mã VietQR Tự Động
- **Gia hạn 30 giây**: Quét mã VietQR động tự động điền số tiền và cú pháp chuẩn xác.
- **Gạch nợ tức thì**: Hệ thống tự động gạch nợ sau 3-5 giây, gia hạn thẻ số và gửi phiếu thu điện tử về hòm thư.
`;

fs.writeFileSync(path.join(OUT_DIR, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_CEO1983.md'), crmMd, 'utf8');
fs.writeFileSync(path.join(OUT_DIR, 'SLIDE_THUYET_TRINH_APP_HIEP_HOI_CEO1983.md'), appMd, 'utf8');

for (const dir of [FE_DOCS_DIR, CEO_DOCS_DIR]) {
  fs.writeFileSync(path.join(dir, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_CEO1983.md'), crmMd, 'utf8');
  fs.writeFileSync(path.join(dir, 'SLIDE_THUYET_TRINH_APP_HIEP_HOI_CEO1983.md'), appMd, 'utf8');
}

console.log('✓ Successfully created both SLIDE_THUYET_TRINH_CRM_QUAN_TRI_CEO1983.md and SLIDE_THUYET_TRINH_APP_HIEP_HOI_CEO1983.md!');
