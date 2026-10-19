# HƯỚNG DẪN SỬ DỤNG ỨNG DỤNG DI ĐỘNG HỘI VIÊN (HDSD - MOBILE APP)
## CẨM NANG THAO TÁC DÀNH CHO DOANH NHÂN CLB CEO 1983
*Phiên bản: 4.0 - Phát hành: Tháng 10/2026*

---

### BÀI 1: CÀI ĐẶT ỨNG DỤNG, ĐĂNG NHẬP & BẮT BUỘC ĐỔI MẬT KHẨU LẦN ĐẦU
1. Mở ứng dụng CEO 1983 trên điện thoại thông minh (hoặc truy cập `https://ceo1983.viconnect.vn`).
2. Đăng nhập bằng Email/Mã hội viên và mật khẩu tạm thời do Ban Thư ký cấp gửi qua email kích hoạt.
3. **Quy trình Đổi Mật Khẩu Bắt Buộc (Mandatory Initial Password Change)**:
   - Đối với tài khoản mới kích hoạt có cờ `must_change_password = true`, hệ thống lập tức khóa thanh điều hướng dưới (Bottom Tab Bar) và chuyển hướng bắt buộc tới màn hình Đổi Mật Khẩu.
   - Hội viên bắt buộc phải nhập mật khẩu mới và xác nhận mật khẩu hợp lệ (tối thiểu 6 ký tự).
   - Tuyệt đối không thể bấm nút quay lại hoặc truy cập các tính năng khác cho đến khi hoàn thành đổi mật khẩu.
   - Sau khi đổi thành công, hệ thống mở khóa toàn bộ quyền năng ứng dụng di động.
4. Bật quyền nhận thông báo và quyền mic/camera để sẵn sàng kết nối.

### BÀI 2: SỬ DỤNG THẺ HỘI VIÊN ĐIỆN TỬ & CHẠM DANH THIẾP NFC
1. Tại màn hình chính, thẻ hội viên VIP điện tử hiển thị trang trọng.
2. Bật tính năng NFC trên điện thoại, chạm lưng máy vào điện thoại đối tác để trao đổi danh thiếp số.
3. Hoặc nhấn vào thẻ để phóng to mã QR kết nối.

### BÀI 3: XỬ LÝ CÔNG VIỆC ĐƯỢC GIAO & NỘP BÁO CÁO
1. Vào tab "Nhiệm vụ" để xem danh sách công việc do Ban Điều Hành hoặc Trưởng ban phân công.
2. Nhấn vào từng việc để đọc kỹ yêu cầu, mở tệp Word/Excel/PDF đính kèm để nghiên cứu.
3. Đánh dấu hoàn thành các việc con và tải tệp nghiệm thu kết quả.

### BÀI 4: TRA CỨU ĐỐI TÁC, HẸN GẶP 1-ON-1 & SOÁT VÉ SỰ KIỆN
1. Tra cứu danh bạ doanh nhân theo ngành nghề và gửi lời mời hẹn gặp giao thương.
2. Mở ví vé tham dự Gala, trình mã QR tại bàn lễ tân để check-in và nhận số bàn tiệc.
3. Gọi điện thoại hoặc video bảo mật nội bộ với các thành viên khác.

### BÀI 5: QUY ĐỊNH BẢO MẬT & PHÂN QUYỀN TRÊN MOBILE APP
1. Toàn bộ thiết lập phân quyền thao tác hệ thống đã được di chuyển tập trung về Cổng Web CRM (`/permissions`).
2. Trên Mobile App không còn hiển thị mục "Phân quyền", đảm bảo giao diện gọn gàng, tinh gọn, thuần túy trải nghiệm hội viên doanh nhân.
3. Quyền hạn thao tác trên App (quét mã QR sự kiện, đăng bài tin tức, quản lý cuộc họp) sẽ tự động kế thừa tức thời từ Ban chuyên môn mà hội viên tham gia do Ban Điều Hành phân công trên CRM.

### BÀI 6: QUẢN LÝ HỒ SƠ DOANH NGHIỆP ĐA BỐ CỤC (CHUẨN ẢNH 1) & BANNER ƯU ĐÃI HỘI VIÊN (ẢNH 2)
1. **Thiết Kế Profile Đa Bố Cục (3 Tùy Chọn Trải Nghiệm)**:
   - **Bố cục 1: Cắt Vát Đa Giác (Chuẩn Ảnh 1)**:
     * Ảnh nền bị cắt giảm vát chéo đa giác (`clip-path: polygon`), kết hợp 2 cánh hình học ("TĂNG TRƯỞNG LIÊN TỤC" & "CHUYỂN ĐỔI SỐ") rực rỡ và khối trung tâm xếp tầng làm nổi bật tên doanh nghiệp, chức vụ và họ tên hội viên.
     * Khối **ABOUT US — GIỚI THIỆU DOANH NGHIỆP**: Đoạn giới thiệu tổng quan, tầm nhìn và năng lực cốt lõi đặt ngay bên dưới.
     * Khối **OUR SERVICES & THÔNG SỐ**: Lưới 2 ô nổi bật cho *Lĩnh vực hoạt động* và *Quy mô nhân sự*.
     * Khối **FIND US — LIÊN HỆ & THÔNG TIN**: *Số điện thoại / Hotline* (nút Gọi trực tiếp `tel:` và Sao chép) và *Website công ty* (nút Mở web).
   - **Bố cục 2: Thẻ Doanh Nhân VIP**: Ảnh bìa vát cong nhẹ, Avatar trung tâm lớn, 4 nút tiện ích và thẻ doanh nghiệp nổi.
   - **Bố cục 3: Tối Giản Siêu Gọn**: Thiết kế phẳng, tối ưu toàn bộ thông tin gói gọn trong 1 màn hình.
   - Bố cục được lưu tự động trên thiết bị (`vba_profile_layout_mode`).
2. **Bộ 6 Bảng Màu Tùy Biến (Color Palette Switcher)**:
   - **Cyan & Vàng Nắng (Chuẩn Ảnh 1)**: Màu Cyan/Teal kết hợp Vàng tươi sáng như ảnh thiết kế mẫu.
   - **Trắng Xanh Sapphire**: Thanh lịch, hiện đại, chuẩn nhận diện CEO 1983.
   - **Vàng Kim Doanh Nhân**: Sang trọng, quyền quý.
   - **Xanh Ngọc Lục Bảo**: Đĩnh đạc, tươi mới.
   - **Bạc Tối Giản Platinum**: Nhẹ nhàng, sắc nét.
   - **Xanh Đêm Obsidian**: Đẳng cấp bóng đêm bí ẩn.
3. **Chỉnh Sửa Nhanh Hồ Sơ (`QuickProfileEditModal`)**:
   - Nhấn nút "Sửa hồ sơ" để cập nhật ngay tên công ty, chức vụ, quy mô nhân sự, lĩnh vực, website và giới thiệu.
4. **Banner Ưu Đãi Hội Viên & Đối Tác (Chuẩn Ảnh 2)**:
   - Tại trang chủ ứng dụng (`/association`), hiển thị toàn cảnh hình ảnh thiết kế gốc **Ảnh 2 (`/uu_dai_event.jpg`)** với hộp quà 3D, dải ruy băng và hiệu ứng ánh sao.
   - Nút hành động CTA ("Xem ưu đãi ngay →") được **bóc tách riêng biệt ra bên ngoài/bên dưới banner**, giúp banner hiển thị trọn vẹn 100% không bị che lấp, bấm vào chuyển ngay tới trang đặc quyền `/association/perks`.

### BÀI 7: BẬT / TẮT TRỢ LÝ AI & TRUNG TÂM HƯỚNG DẪN SỬ DỤNG CHUYÊN BIỆT APP CEO 1983
1. **Bật / Tắt Trợ Lý AI CEO 1983**:
   - Tại màn Cá nhân (`/association/profile`) hoặc trang Cài đặt (`/association/settings`), hội viên có thể chủ động Bật hoặc Tắt Trợ lý AI bằng công tắc gạt 1-chạm.
   - Khi Bật: Nút nổi bóng chat Robot AI xuất hiện ở góc dưới màn hình, sẵn sàng hỗ trợ tìm kiếm đối tác, tra cứu thông tin và hướng dẫn nghiệp vụ 24/7.
   - Khi Tắt: Robot AI lập tức biến mất khỏi màn hình, giúp không gian ứng dụng thoáng đãng, tập trung tối đa cho công việc.
2. **Trung Tâm Hướng Dẫn Sử Dụng Chuyên Biệt Cho App CEO 1983**:
   - Truy cập nhanh từ nút "Hướng dẫn" trên Header màn cá nhân hoặc mục "Hướng dẫn sử dụng App CEO 1983" trong Cài đặt.
   - Nội dung được biên soạn chuẩn hóa 100% dành riêng cho Ứng dụng Di Động Hội Viên CEO 1983:
     * Chỉ dẫn tương tác 10 màn hình cốt lõi (Trang chủ, Thẻ hội viên NFC, Check-in sự kiện, Cơ hội B2B, Sàn thương mại, Biểu quyết, Lịch họp, Tin tức, Tin nhắn, Trang cá nhân).
     * Sổ tay hướng dẫn sử dụng định dạng PDF tải trực tiếp về điện thoại (`HUONG_DAN_SU_DUNG_APP_HIEP_HOI_CEO1983.pdf`).
     * Tuyệt đối không hiển thị nội dung Web CRM Quản trị, đảm bảo tập trung tuyệt đối vào trải nghiệm di động của Hội viên.

### BÀI 8: MÀN HÌNH CÁ NHÂN TINH GỌN & THIẾT KẾ NÚT PHẲNG HIỆN ĐẠI
1. **Loại Bỏ Badge & Danh Xưng Thừa Thãi**:
   - Khi đã đăng nhập vào hệ sinh thái CEO 1983, người dùng mặc định đã là hội viên câu lạc bộ.
   - Toàn bộ các nhãn, ruy băng "Hội viên chính thức" được loại bỏ hoàn toàn, giao diện tập trung trực diện vào Họ tên, Chức vụ và Tên doanh nghiệp.
2. **Hàng Nút Tiện Ích Tinh Gọn (Không Nền)**:
   - 4 nút chức năng cốt lõi (`Danh thiếp`, `Sửa hồ sơ`, `Chia sẻ`, `Mã QR`) được tinh chỉnh kích thước nhỏ gọn, loại bỏ nền màu cồng kềnh, chuyển sang thiết kế phẳng thanh thoát và hiện đại.
   - Người dùng chỉ cần chạm nhẹ để thực hiện nhanh các tác vụ kết nối giao thương mà không bị rối mắt.
3. **Cấu Trúc 3 Tab Điều Hướng Đầy Đủ**:
   - Tab **Hồ sơ**: Hiển thị đầy đủ thông tin liên hệ và kết nối trực tiếp (Hotline, Email, Trụ sở, Website, Lĩnh vực, Quy mô, Tiểu sử doanh nghiệp).
   - Tab **Giao thương**: Tích hợp danh thiếp số điện tử, cơ hội kết nối B2B, gian hàng sản phẩm và danh bạ doanh nhân.
   - Tab **Cài đặt**: Tích hợp công tắc Bật/Tắt Trợ lý AI tức thì, Sổ tay hướng dẫn sử dụng App, Đổi mật khẩu, Chế độ ban đêm và Trung tâm hỗ trợ.




