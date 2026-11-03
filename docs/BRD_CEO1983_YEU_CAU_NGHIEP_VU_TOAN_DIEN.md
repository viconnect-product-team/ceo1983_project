# HỆ SINH THÁI SỐ HÓA & QUẢN TRỊ HIỆP HỘI DOANH NHÂN CEO 1983

## Tài Liệu Yêu Cầu Nghiệp Vụ Toàn Diện (Business Requirements Document - BRD)

*Mã tài liệu: BRD-CEO1983-MASTER-V5.5 | Phiên bản: Version 5.5 (Master Enterprise Release - Tích Hợp Trợ Lý AI 32 Tính Năng & GPS Tour) | Ngày phê duyệt: 06/10/2026*

*Cơ quan chủ quản: Câu Lạc Bộ Doanh Nhân CEO 1983 (Trực thuộc Hội Doanh Nhân Trẻ Hà Nội — HanoiBA)*

*Chuyên gia thực hiện: Senior Business Analyst & Solution Architect (15+ Năm Kinh Nghiệm)*
---

## CHƯƠNG 1: TỔNG QUAN & BỐI CẢNH DOANH NGHIỆP

### 1.1. Bối Cảnh Hình Thành CLB Doanh Nhân CEO 1983

Câu lạc bộ Doanh nhân CEO 1983 được thành lập với tư cách là tổ chức thành viên trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA). Đây là nơi hội tụ của hơn 500+ Chủ tịch Hội đồng Quản trị, Tổng Giám đốc, Nhà sáng lập và Lãnh đạo cấp cao của các doanh nghiệp tư nhân tiêu biểu sinh năm Quý Hợi 1983 trên địa bàn Thủ đô Hà Nội và các tỉnh thành lân cận.

Với sứ mệnh "Bản lĩnh - Tiên phong - Kết nối - Phát triển", CLB Doanh nhân CEO 1983 đóng vai trò là cầu nối liên minh kinh tế, xúc tiến thương mại nội khối, hỗ trợ tiếp cận nguồn lực tài chính, đồng thời là hạt nhân tích cực trong các chương trình an sinh xã hội, thiện nguyện vì cộng đồng của Hội Doanh Nhân Trẻ Hà Nội.

### 1.2. Thách Thức Nghiệp Vụ Thực Tế Trước Khi Số Hóa (Pain Points)

| Mã | Vấn Đề & Thách Thức Nghiệp Vụ | Tác Động Thực Tế & Rủi Ro |
| --- | --- | --- |
| PP-01 | Dữ liệu Hội viên Phân tán & Thất lạc Nghiêm trọng | Trước khi số hóa, hồ sơ của hơn 500 hội viên được lưu trữ rải rác trên nhiều bảng tính Excel cá nhân của từng cán bộ văn phòng và các nhóm chat mạng xã hội (Zalo, Viber, Facebook). Khi có sự thay đổi về chức danh lãnh đạo, địa chỉ trụ sở, mã số thuế hoặc năng lực cung ứng sản phẩm, dữ liệu không được cập nhật tập trung, dẫn đến việc mất dấu thông tin hội viên, thiếu cơ sở dữ liệu xác thực để kết nối giao thương nội bộ. |
| PP-02 | Chồng chéo Thẩm quyền & Quy trình Phê duyệt Kết nạp Thiếu Chặt chẽ | Quy trình tiếp nhận đơn gia nhập câu lạc bộ diễn ra qua hình thức gửi hồ sơ giấy hoặc tin nhắn cá nhân. Thiếu sự phân định rành mạch giữa vai trò hành chính của Ban Thư Ký và thẩm quyền thẩm định tư cách doanh nghiệp của Ban Thành Viên. Tình trạng phê duyệt kết nạp không đúng thẩm quyền hoặc bỏ sót hồ sơ ứng viên tiềm năng diễn ra thường xuyên, làm suy giảm uy tín của tổ chức. |
| PP-03 | Thất thoát & Chậm trễ Trong Công tác Thu - Nộp - Đối soát Hội phí Thường niên | Hội phí thường niên (5.000.000 VNĐ/hội viên/năm) là nguồn kinh phí duy trì hoạt động cốt lõi của câu lạc bộ. Việc theo dõi công nợ hoàn toàn dựa trên việc Ban Tài chính/Thủ quỹ đối soát thủ công từng dòng biến động số dư tài khoản ngân hàng với danh sách Excel. Không có mã định danh giao dịch chuẩn hóa dẫn đến tình trạng chuyển khoản không ghi rõ họ tên/mã hội viên, gây tranh cãi về tình trạng hoàn thành nghĩa vụ tài chính và tốn hàng trăm giờ làm việc mỗi kỳ đại hội. |
| PP-04 | Hỗn loạn Sơ đồ Ghế ngồi & Ùn tắc Cửa Check-in Sự kiện Gala Đại hội | Tại các sự kiện thường niên, Gala Dinner và Đại hội toàn thể quy mô từ 300 đến 600 đại biểu, ban tổ chức phải in danh sách giấy tại bàn đón tiếp. Việc tìm kiếm tên thủ công gây ùn tắc kéo dài từ 30 - 45 phút tại sảnh hội trường. Nghiêm trọng hơn, việc sắp xếp vị trí bàn tiệc VIP cho các Lãnh đạo Thành ủy, Hội LHTN, HanoiBA và Hội viên kim cương không có sơ đồ trực quan, dẫn đến việc đại biểu ngồi sai vị trí, làm ảnh hưởng tiêu cực đến tính trang trọng của sự kiện. |
| PP-05 | Kiểm phiếu Bầu cử Đại hội Thủ công Chậm trễ & Rủi ro Sai sót | Công tác bầu cử Ban Chấp Hành nhiệm kỳ mới và thông qua các nghị quyết đại hội trước đây sử dụng phiếu bầu giấy. Quá trình phát phiếu, thu phiếu và ban kiểm phiếu làm việc thủ công kéo dài từ 2 đến 3 giờ đồng hồ, làm gián đoạn chương trình đại hội. Ngoài ra, việc kiểm phiếu thủ công tiềm ẩn nguy cơ sai lệch số liệu và thiếu tính minh bạch tức thời. |
| PP-06 | Thiếu Kênh Giao thương B2B Nội Khối & Minh Bạch Quỹ Thiện Nguyện | Hội viên có nhu cầu tiêu dùng chéo và tìm kiếm nhà cung cấp tin cậy trong nội bộ những người bạn đồng niên 1983 nhưng không có sàn thương mại B2B chính danh để niêm yết sản phẩm với chính sách ưu đãi đặc quyền. Đồng thời, nguồn tiền quyên góp Quỹ Thiện nguyện an sinh xã hội thiếu cơ chế công khai sao kê thời gian thực, chưa đáp ứng kỳ vọng minh bạch tuyệt đối của các nhà hảo tâm. |
| PP-07 | Hội Viên & Cán Bộ Bỡ Ngỡ Trước 32+ Phân Hệ Tính Năng (Thiếu Trợ Lý Hướng Dẫn Tức Thời) | Hệ thống sở hữu hơn 32 phân hệ tính năng phức tạp từ quản trị sự kiện, soát vé QR/NFC, danh thiếp số AI OCR, sàn giao thương B2B, biểu quyết đại hội đến phân quyền RBAC và kế toán hội phí. Đa số doanh nhân CEO 1983 bận rộn và cán bộ văn phòng mới tiếp cận không có thời gian đọc cẩm nang hướng dẫn dài hàng trăm trang, thường xuyên gọi điện hỏi Ban Thư Ký về các thao tác cơ bản, gây quá tải bộ máy hành chính và giảm tỷ lệ tương tác với nền tảng số. |



### 1.3. Mục Tiêu Chiến Lược & Chỉ Số Đo Lường Hiệu Quả (Strategic KPIs)

| Mã KPI | Mục Tiêu Chiến Lược | Chỉ Số Đo Lường Cụ Thể (SLA) |
| --- | --- | --- |
| OBJ-01 | Số hóa 100% Hồ Sơ Hội Viên | Định danh điện tử (e-KYC Doanh nghiệp) cho toàn bộ 500+ hội viên với mã định danh chuẩn `CEO-83xxx` trước Quý 4/2026. |
| OBJ-02 | Tự Động Hóa 100% Thu - Nộp Hội Phí Qua VietQR | Sinh mã VietQR động Napas 24/7 chứa chính xác mã hội viên và số tiền; kế toán đối soát gạch nợ trên CRM giảm 95% thời gian xử lý thủ công. |
| OBJ-03 | Soát Vé An Ninh QR Gate < 0.2 Giây/Đại Biểu | Tốc độ quét nhận diện vé điện tử E-Ticket tại cửa sự kiện đạt dưới 200ms; hiển thị trực quan thông tin đại biểu và số bàn tiệc VIP; triệt tiêu 100% gian lận trùng vé. |
| OBJ-04 | Tăng Trưởng Giao Thương Nội Khối B2B +45% | Thiết lập sàn thương mại B2B và kênh kết nối Cung - Cầu 1-on-1, thúc đẩy doanh số giao thương nội khối đạt tối thiểu 50 tỷ VNĐ trong năm đầu vận hành. |
| OBJ-05 | Kiểm Phiếu Đại Hội Thời Gian Thực (Live 1s) | 100% đại biểu biểu quyết trực tuyến trên thiết bị di động cá nhân theo nguyên tắc 1 người 1 phiếu; tổng hợp kết quả chính xác 100% trong 1 giây sau khi đóng hòm phiếu. |
| OBJ-06 | Minh Bạch 100% Sổ Quỹ Thu Chi & Thiện Nguyện | Áp dụng quy trình kiểm soát chi tiêu 3 cấp nghiêm ngặt; công khai sao kê quỹ thiện nguyện thời gian thực cho toàn thể hội viên. |
| OBJ-07 | Trợ Lý AI Điều Hành 100% Miễn Phí & Chỉ Dẫn Thao Tác Trực Tiếp 32/32 Tính Năng | Tích hợp Google Gemini 2.0 Flash Free Tier kết hợp giọng nói tiếng Việt Web Speech API vi-VN và Smart Hybrid Engine nội bộ; tự động nắm bắt 100% phiên đăng nhập thời gian thực và dẫn đường GPS Turn-by-Turn HUD cho 32 tính năng (trong/ngoài) khi người dùng bấm hoặc nói 'Có', giải quyết 99% thắc mắc thao tác tức thời. |



## CHƯƠNG 2: MÔ HÌNH VẬN HÀNH & PHÂN ĐỊNH 6 CHUYÊN BAN

Hệ sinh thái số hóa được thiết kế chuẩn hóa bám sát cơ cấu tổ chức và điều lệ hoạt động chính thức của CLB Doanh Nhân CEO 1983 trực thuộc Hội Doanh Nhân Trẻ Hà Nội, phân định rõ ràng quyền hạn và trách nhiệm giữa Ban Quản Trị, Ban Thư Ký và 6 Ban chuyên môn tác nghiệp.

### BAN-01: Ban Quản Trị (BQT) / Ban Thường Trực (`admin@connect.vn`)

*Tôn chỉ & Quyền hạn:* Cơ quan lãnh đạo cao nhất của CLB giữa hai kỳ đại hội.

1. Phê duyệt chiến lược phát triển, kế hoạch công tác năm và quy chế hoạt động của các ban chuyên môn.
2. Phê duyệt dự toán và quyết toán các sự kiện quy mô lớn, ngân sách tài chính và quỹ thiện nguyện.
3. Cấu hình và giám sát ma trận phân quyền RBAC 5 cấp bậc trong toàn hệ thống.
4. Phê duyệt quyết định kết nạp hội viên danh dự và quyết định khai trừ/chấm dứt tư cách hội viên khi vi phạm điều lệ.

### BAN-02: Ban Thư Ký (BTK) (`ceo.tongthuky@ceo1983.com`)

*Tôn chỉ & Quyền hạn:* Cơ quan thường trực điều hành công tác hành chính, văn phòng và tổng hợp của câu lạc bộ.

1. Triệu tập đại biểu, khởi tạo và điều phối các cuộc họp Ban Chấp Hành định kỳ và đột xuất.
2. Quản lý lịch phòng họp tập trung Sapphire Hub (sức chứa 40 chỗ), phòng họp trực tuyến Zoom/Meet.
3. Soạn thảo, trình ký và ban hành nghị quyết, thông báo, biên bản đại hội và phân công nhiệm vụ (Tasks).
4. Tổng hợp báo cáo tiến độ công việc đa chiều từ các ban chuyên trách gửi Ban Quản Trị.
5. ĐẶC BIỆT LƯU Ý: Ban Thư Ký TUYỆT ĐỐI KHÔNG CÓ THẨM QUYỀN PHÊ DUYỆT HỒ SƠ KẾT NẠP HỘI VIÊN MỚI. Mọi can thiệp vào thẩm quyền này bị hệ thống chặn đứng hoàn toàn.

### BAN-03: Ban Thành Viên (BTV) (`ceo.thanhvien@ceo1983.com`)

*Tôn chỉ & Quyền hạn:* Cơ quan chuyên trách phát triển hội viên, thẩm định tư cách và chăm sóc thành viên.

1. ĐỘC QUYỀN TIẾP NHẬN & THẨM ĐỊNH HỒ SƠ ĐĂNG KÝ GIA NHẬP mới từ Cổng thông tin công khai.
2. Xác minh điều kiện pháp lý: Năm sinh 1983 (Quý Hợi), Giấy chứng nhận ĐKKD, Mã số thuế, Năng lực tài chính và uy tín của doanh nghiệp ứng viên.
3. BẤM NÚT PHÊ DUYỆT KẾT NẠP CHÍNH THỨC trên hệ thống Web CRM, kích hoạt quy trình cấp mã định danh `CEO-83xxx`.
4. Phát hành email thông báo kết nạp kèm mật khẩu khởi tạo tài khoản ứng dụng di động cho hội viên mới.
5. Theo dõi, đánh giá điểm cống hiến và xếp hạng hội viên thường niên (Hạng Kim Cương, Vàng, Bạc, Tiêu Chuẩn).

### BAN-04: Ban Thiện Nguyện & An Sinh Xã Hội (BTN) (`ceo.thiennguyen@ceo1983.com`)

*Tôn chỉ & Quyền hạn:* Cơ quan chuyên trách các chương trình nhân đạo, xây dựng điểm trường, tài trợ đồng bào lũ lụt và công tác an sinh xã hội của HanoiBA.

1. Xây dựng kế hoạch và phát động các chiến dịch gây quỹ thiện nguyện trong hội viên và đối tác.
2. Quản lý nguồn quỹ thiện nguyện chuyên biệt trên hệ thống Web CRM (`/funds`).
3. Phối hợp Ban Tài chính thực hiện quy trình kiểm soát chi tiêu 3 cấp trước khi giải ngân nguồn quỹ.
4. Cập nhật và công khai báo cáo sao kê thu chi tài chính thiện nguyện thời gian thực cho toàn thể hội viên.

### BAN-05: Ban Truyền Thông & Sự Kiện (BTT) (`ceo.truyenthong@ceo1983.com`)

*Tôn chỉ & Quyền hạn:* Cơ quan chuyên trách xây dựng thương hiệu, thông tin báo chí, tổ chức sự kiện và vận hành an ninh hội nghị.

1. Quản trị nội dung bảng tin, banner marketing carousel tự động trượt, thư viện hình ảnh/video trên Mobile App.
2. Tổ chức các sự kiện họp mặt, hội thảo chuyên đề, giải thể thao và đêm Gala Dinner thường niên.
3. Thiết kế sơ đồ phân bổ vị trí chỗ ngồi trực quan Cinema Seating Map cho từng khán phòng.
4. Trực tiếp vận hành Cổng An Ninh Soát Vé Gate Check-in QR tại các sự kiện thực tế, đảm bảo an ninh trật tự.
5. Điều hành chương trình Vòng quay may mắn (Lucky Draw) thời gian thực phục vụ quay thưởng đại hội.

### BAN-06: Ban Xúc Tiến Thương Mại & Đầu Tư (BXT) (`ceo.xuctien@ceo1983.com`)

*Tôn chỉ & Quyền hạn:* Cơ quan chuyên trách thúc đẩy hợp tác đầu tư, liên minh kinh tế và hỗ trợ tiêu thụ sản phẩm giữa các doanh nghiệp thành viên.

1. Quản trị và kiểm duyệt sản phẩm, dịch vụ niêm yết trên Sàn Thương Mại Doanh Nhân B2B.
2. Thẩm định chính sách trợ giá nội bộ (Ưu đãi độc quyền từ 5% - 30% dành riêng cho hội viên CEO 1983).
3. Điều phối và duyệt các tin đăng trên Bảng tin Cơ hội Kinh doanh Cung - Cầu (Cần Mua / Cần Bán).
4. Tổ chức các phiên kết nối giao thương 1-on-1, ký kết biên bản ghi nhớ hợp tác chiến lược giữa các hội viên.

## CHƯƠNG 3: MA TRẬN TRÁCH NHIỆM RACI (16 QUY TRÌNH NGHIỆP VỤ)

*Quy ước ma trận: R (Responsible - Người thực thi); A (Accountable - Người chịu trách nhiệm & phê duyệt); C (Consulted - Người tham vấn); I (Informed - Người nhận thông tin).*


| Mã | Quy Trình Nghiệp Vụ Cốt Lõi | BQT | BTV | BTK | Tài Chính | Truyền Thông | Xúc Tiến | Hội Viên |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PROC-01 | Tiếp nhận hồ sơ đăng ký gia nhập trực tuyến (Landing Page) | I | A / R | I | I | I | I | R (Ứng viên) |
| PROC-02 | Thẩm định doanh nghiệp & Duyệt kết nạp (Cấp mã CEO-83xxx) | A | R (Độc quyền) | KHÔNG CÓ QUYỀN | I | I | I | I |
| PROC-03 | Khởi tạo sự kiện Gala & Cấu hình các gói vé E-Ticket | A | C | C | C | R | C | I |
| PROC-04 | Thiết kế sơ đồ chỗ ngồi trực quan Cinema Seating Map | A | C | R | I | R | I | I |
| PROC-05 | Vận hành Cổng An Ninh Soát Vé Gate Check-in QR (< 0.2s) | I | I | C | I | A / R | I | R (Quét vé) |
| PROC-06 | Lên lịch họp & Thuật toán chống trùng phòng Sapphire Hub | A | I | A / R | I | I | I | I |
| PROC-07 | Điểm danh đại biểu tham gia cuộc họp bằng mã QR động (30s) | I | I | A / R | I | I | I | R (Quét QR) |
| PROC-08 | Giao nhiệm vụ & Đánh giá tiến độ công việc (Tasks 5 Views) | A | R | A / R | R | R | R | R (Được giao) |
| PROC-09 | Thu hội phí thường niên qua Cổng VietQR Napas 24/7 | A | C | I | A / R | I | I | R (Chuyển khoản) |
| PROC-10 | Đối soát sao kê ngân hàng & Duyệt gạch nợ hội phí (+365 ngày) | A | I | I | A / R | I | I | I |
| PROC-11 | Kiểm soát phiếu chi 3 cấp (Lập -> Thẩm định -> Phê duyệt) | A | I | I | A / R | I | I | I |
| PROC-12 | Kiểm duyệt sản phẩm niêm yết trên Sàn Thương Mại B2B | I | C | I | I | I | A / R | R (Đăng bán) |
| PROC-13 | Điều phối & Tiếp nhận Cơ hội Kinh doanh Cung - Cầu 1-on-1 | I | I | I | I | I | A / R | R (Khớp nối) |
| PROC-14 | Bỏ phiếu bầu cử & Biểu quyết Nghị quyết Đại hội (1 người 1 phiếu) | A | I | R | I | I | I | A / R (Bầu cử) |
| PROC-15 | Quản trị Danh thiếp số VIP 3D Titanium & Kết nối Chạm NFC | I | C | I | I | I | I | A / R (Sử dụng) |
| PROC-16 | Quản lý Hộp thư Doanh nhân Messenger #0084FF & Kênh BTK ghim | I | I | A / R (Ghim kênh) | I | I | I | R (Chat) |



## CHƯƠNG 4: ĐẶC TẢ CHI TIẾT CÁC QUY TRÌNH NGHIỆP VỤ CỐT LÕI

### FLOW-01: Quy Trình Tiếp Nhận, Thẩm Định & Phê Duyệt Kết Nạp Hội Viên Mới

**Chủ thể tham gia:** Ứng viên Doanh nhân 1983, Ban Thành Viên (BTV), Hệ thống SMTP Mailer

| Bước | Tên Thao Tác Nghiệp Vụ | Mô Tả Chi Tiết Quy Trình & Tiêu Chuẩn Thực Hiện |
| --- | --- | --- |
| 1 | Nộp hồ sơ trực tuyến | Ứng viên truy cập Cổng tiếp nhận hồ sơ tại địa chỉ `https://14.225.217.232:5444/landing?apply=true`. Điền đầy đủ thông tin: Họ tên, Ngày tháng năm sinh (Bắt buộc năm 1983), Số điện thoại, Email, Tên doanh nghiệp, Mã số thuế, Chức vụ lãnh đạo, Lĩnh vực ngành nghề, Nguyện vọng chuyên ban. |
| 2 | Ghi nhận bản ghi & Gửi thư tiếp nhận tự động | Hệ thống ghi nhận bản ghi vào cơ sở dữ liệu ở trạng thái `pending` (Chờ thẩm định). Máy chủ SMTP Mailer tự động phát hành thư điện tử xác nhận tiếp nhận hồ sơ đến email ứng viên kèm Mã tra cứu hồ sơ định danh. |
| 3 | Thẩm định điều kiện doanh nghiệp (Độc quyền BTV) | Lãnh đạo Ban Thành Viên đăng nhập Cổng Quản trị Web CRM (`/members`), mở ngăn kéo (Drawer) chi tiết hồ sơ ứng viên. Tiến hành đối soát thông tin pháp nhân trên Cổng thông tin quốc gia về đăng ký doanh nghiệp, xác minh mã số thuế, doanh thu và phẩm chất đạo đức kinh doanh. |
| 4 | Phê duyệt kết nạp & Cấp mã hội viên định danh | Lãnh đạo BTV bấm nút 'Phê Duyệt Kết Nạp'. Hệ thống kiểm tra quyền hạn (Chỉ tài khoản BTV hoặc BQT tối cao mới được phép; chặn hoàn toàn Ban Thư Ký). Hệ thống tự động sinh Mã số hội viên chuẩn `CEO-83xxx` (VD: `CEO-83007`), chuyển trạng thái tài khoản sang `active`, tạo tài khoản đăng nhập và mật khẩu khởi tạo ngẫu nhiên bảo mật cao. |
| 5 | Phát hành email thông báo & Đăng nhập lần đầu | Hệ thống tự động gửi Email Chào mừng chính thức gia nhập CLB Doanh Nhân CEO 1983, cung cấp thông tin tài khoản, hướng dẫn tải Mobile App và yêu cầu bắt buộc đổi mật khẩu khởi tạo trong lần đầu tiên đăng nhập. |



### FLOW-02: Quy Trình Quản Trị Hội Phí Thường Niên & Thu Nộp Qua VietQR Napas 24/7

**Chủ thể tham gia:** Hội viên chính thức, Ban Tài chính / Kế toán, Cổng thanh toán VietQR

| Bước | Tên Thao Tác Nghiệp Vụ | Mô Tả Chi Tiết Quy Trình & Tiêu Chuẩn Thực Hiện |
| --- | --- | --- |
| 1 | Thông báo nghĩa vụ hội phí | Hằng năm, hệ thống tự động quét ngày hết hạn thẻ VIP (`term_end`). Trước 30 ngày, hệ thống kích hoạt thông báo đẩy trên Mobile App và email nhắc nhở nghĩa vụ hoàn thành hội phí thường niên (5.000.000 VNĐ/năm). |
| 2 | Sinh mã VietQR động Napas 24/7 | Hội viên mở mục 'Hội Phí' trên Mobile App, nhấn 'Thanh Toán VietQR'. Hệ thống sinh mã QR động chuẩn Napas 24/7 chứa đầy đủ: Số tiền chính xác (5.000.000 VNĐ), Số tài khoản thụ hưởng của CLB CEO 1983 và Cú pháp chuẩn hóa: `HOIPHI CEO1983 [MÃ_HỘI_VIÊN] [HỌ_TÊN]`. |
| 3 | Chuyển khoản liên ngân hàng | Hội viên sử dụng ứng dụng Mobile Banking của bất kỳ ngân hàng thương mại nào tại Việt Nam, quét mã VietQR và xác nhận chuyển khoản nhanh 24/7 không cần nhập tay. |
| 4 | Đối soát sao kê ngân hàng & Gạch nợ thủ công trên CRM | Kế toán câu lạc bộ truy cập màn hình 'Quản Lý Hội Phí' (`/fees`) trên Web CRM. Đối soát số tiền và cú pháp giao dịch trên sao kê tài khoản ngân hàng thực tế. Khi khớp lệnh, kế toán bấm nút 'Duyệt Gạch Nợ' tương ứng với bản ghi hội viên. |
| 5 | Kích hoạt gia hạn Thẻ VIP & Xuất hóa đơn điện tử | Hệ thống tự động chuyển trạng thái bản ghi sang `paid`, cộng thêm +365 ngày vào hạn dùng của Thẻ hội viên VIP (`term_end`), đồng thời tạo hóa đơn điện tử (`invoices`) và gửi thông báo xác nhận đã hoàn thành nghĩa vụ tài chính đến hội viên. |



### FLOW-03: Quy Trình Tổ Chức Sự Kiện Gala, Thiết Kế Sơ Đồ Ghế & Soát Vé QR Gate

**Chủ thể tham gia:** Ban Truyền Thông (BTT), Ban Thư Ký (BTK), Hội viên, Đại biểu khách mời

| Bước | Tên Thao Tác Nghiệp Vụ | Mô Tả Chi Tiết Quy Trình & Tiêu Chuẩn Thực Hiện |
| --- | --- | --- |
| 1 | Khởi tạo sự kiện & Cấu hình gói vé | Ban Truyền Thông tạo sự kiện Gala trên Web CRM (`/events`), thiết lập thông tin: Tên chương trình, thời gian, địa điểm tổ chức, diễn giả VIP và cấu hình các loại vé: Vé VIP Đại biểu danh dự (0 VNĐ), Vé Hội viên chính thức (0 VNĐ), Vé Khách mời mở rộng có phí (1.500.000 VNĐ). |
| 2 | Thiết kế sơ đồ chỗ ngồi trực quan (Cinema Seating Map) | Ban tổ chức sử dụng công cụ thiết kế sơ đồ ghế trực quan (`/events/seating`), bố trí bàn tròn Gala VIP 10 chỗ (Bàn VIP 1 đến VIP 6 dành cho Lãnh đạo Thành ủy, HanoiBA), dãy ghế đại biểu danh dự và các bàn tiệc hội viên. |
| 3 | Đăng ký vé & Nhận E-Ticket QR độc bản | Hội viên đăng ký tham dự qua Mobile App, hệ thống tự động gán vị trí bàn tiệc và phát hành Vé điện tử E-Ticket lưu trong Ví vé offline. Mã vé chứa chuỗi QR mã hóa bảo mật độc bản và số may mắn tham dự quay thưởng (#LUCKY-xxxx). |
| 4 | Vận hành Cổng An Ninh Soát Vé Gate Check-in QR | Tại cửa đón tiếp hội trường Gala, nhân sự Ban Truyền Thông mở màn hình Soát vé an ninh (`/checkin`) sử dụng camera quét mã QR trên điện thoại của đại biểu. Tốc độ nhận diện đạt dưới 0.2 giây. |
| 5 | Kiểm soát an ninh chống gian lận & Đồng bộ Lucky Draw | Vé hợp lệ lần đầu: Màn hình bừng sáng XANH LỤC, hiển thị Họ tên, Tên công ty và Vị trí Bàn tiệc VIP để lễ tân hướng dẫn vào chỗ. Vé quét lại lần thứ hai: Màn hình lập tức báo ĐỎ RỰC cảnh báo 'Vé đã qua cửa lúc hh:mm:ss' để ngăn chặn hành vi chụp ảnh vé chia sẻ cho người khác. Đồng thời, danh sách đại biểu ĐÃ CHECK-IN THỰC TẾ tự động đồng bộ vào Vòng quay may mắn (Lucky Draw) trên sân khấu. |



### FLOW-04: Quy Trình Điều Hành Cuộc Họp Lãnh Đạo & Thuật Toán Chống Trùng Phòng Sapphire Hub

**Chủ thể tham gia:** Ban Thư Ký (BTK), Ban Quản Trị (BQT), Đại biểu tham dự

| Bước | Tên Thao Tác Nghiệp Vụ | Mô Tả Chi Tiết Quy Trình & Tiêu Chuẩn Thực Hiện |
| --- | --- | --- |
| 1 | Lên lịch cuộc họp & Lựa chọn phòng họp | Ban Thư Ký tạo lịch họp trên Web CRM (`/meetings`), lựa chọn địa điểm: Phòng họp tập trung Sapphire Hub (sức chứa tối đa 40 người) hoặc Phòng họp trực tuyến (Zoom / Google Meet / UniWork Link). |
| 2 | Thuật toán kiểm tra chống xung đột lịch (Conflict Detection) | Nếu lựa chọn phòng họp vật lý Sapphire Hub, hệ thống tự động chạy thuật toán quét các cuộc họp đã được phê duyệt trong cùng khung giờ. Nếu phát hiện trùng lặp thời gian sử dụng phòng, hệ thống lập tức cảnh báo đỏ và chặn không cho phép lưu bản ghi. |
| 3 | Phê duyệt cuộc họp cấp quản trị | Lịch họp do Ban Thư Ký hoặc Trưởng ban khởi tạo ở trạng thái `pending_approval`. Ban Quản Trị tối cao duyệt chuyển trạng thái sang `upcoming`, hệ thống tự động phát hành giấy triệu tập qua thông báo đẩy và email. |
| 4 | Điểm danh đại biểu bằng mã QR động (Dynamic QR 30s) | Tại cuộc họp, máy chiếu hoặc màn hình lễ tân hiển thị mã QR điểm danh động. Mã QR tự động đổi mã sau mỗi 30 giây để ngăn chặn tình trạng chụp ảnh gửi điểm danh hộ từ xa. Đại biểu mở Mobile App quét mã để ghi nhận có mặt. |
| 5 | Ban hành biên bản điện tử & Tự động tạo nhiệm vụ (Tasks) | Kết thúc cuộc họp, Ban Thư Ký tải lên Nghị quyết và Biên bản cuộc họp đã ký số. Các đầu việc kết luận tự động chuyển đổi thành Nhiệm vụ (`tasks`) gán cho các Trưởng ban chuyên môn chịu trách nhiệm thực thi. |



## CHƯƠNG 5: DANH MỤC QUY TẮC NGHIỆP VỤ BẮT BUỘC (BUSINESS RULES)

| Mã Luật | Tên Quy Tắc | Nội Dung Quy Định Bắt Buộc & Chế Tài |
| --- | --- | --- |
| RULE-AUTH-BTV-EXCLUSIVE | Quy Tắc Độc Quyền Thẩm Định & Phê Duyệt Hội Viên Của Ban Thành Viên | Thẩm quyền xem xét hồ sơ, đối soát tính hợp lệ doanh nghiệp và bấm nút 'Phê Duyệt Kết Nạp' hội viên mới thuộc về duy nhất Ban Thành Viên (tài khoản `ceo.thanhvien@ceo1983.com`) hoặc Ban Quản Trị tối cao (`admin@connect.vn`). Ban Thư Ký và các ban chuyên môn khác TUYỆT ĐỐI KHÔNG CÓ THẨM QUYỀN DUYỆT HỘI VIÊN. Nếu cố tình can thiệp qua API hoặc giao diện, hệ thống bắt buộc chặn đứng bằng mã lỗi HTTP 403 Forbidden. |
| RULE-STRUCT-6-COMMITTEES | Quy Tắc Chuẩn Hóa Danh Mục 6 Ban Chuyên Môn | Toàn bộ cơ sở dữ liệu, bộ lọc giao diện, phân bổ công việc và báo cáo chỉ được phép sử dụng đúng danh mục 6 ban chuyên môn chính thức: 1. Ban Quản Trị; 2. Ban Thư Ký; 3. Ban Thành Viên; 4. Ban Thiện Nguyện; 5. Ban Truyền Thông; 6. Ban Xúc Tiến Thương Mại. Tuyệt đối không tự ý thêm bớt hoặc đổi tên ban. |
| RULE-TERMINOLOGY-HOIPHI | Quy Tắc Chuẩn Hóa Thuật Ngữ Hội Phí Thường Niên | Tuyệt đối KHÔNG sử dụng từ ngữ 'niên liễm' trong bất kỳ tài liệu kỹ thuật, giao diện người dùng, mã nguồn hay thông báo của hệ thống. Bắt buộc chuẩn hóa 100% bằng thuật ngữ 'Hội phí' hoặc 'Hội phí thường niên'. |
| RULE-MEMBER-BIRTHYEAR-1983 | Quy Tắc Ràng Buộc Năm Sinh Hội Viên Chính Thức (Quý Hợi 1983) | Biểu mẫu đăng ký gia nhập hội viên chính thức bắt buộc kiểm tra trường năm sinh của người đại diện pháp luật phải chính xác là năm 1983. Mọi trường hợp sinh năm khác 1983 chỉ được tiếp nhận ở tư cách 'Khách mời danh dự' hoặc 'Đối tác liên kết' sau khi có nghị quyết phê duyệt riêng của Ban Quản Trị. |
| RULE-FEE-VIETQR-AUTO-MATCH | Quy Tắc Quản Trị Hội Phí & Gạch Nợ Thủ Công | Mức hội phí thường niên được ấn định là 5.000.000 VNĐ/năm. Mã thanh toán VietQR Napas 24/7 phải chứa cú pháp chuẩn định danh. Do hệ thống chưa tích hợp Webhook gạch nợ tự động với cổng ngân hàng lõi, kế toán BẮT BUỘC phải kiểm tra sổ phụ/sao kê thực tế trước khi bấm nút 'Duyệt Gạch Nợ' trên CRM. Khi duyệt, hạn dùng thẻ VIP tự động cộng thêm chính xác +365 ngày. |
| RULE-EVENT-SINGLE-CHECKIN | Quy Tắc Soát Vé Một Lần Duy Nhất (Single Check-in) | Mỗi mã vé điện tử E-Ticket QR chỉ được phép qua cổng soát vé thành công đúng 01 lần duy nhất trong suốt thời gian diễn ra sự kiện. Lần quét thứ hai bắt buộc kích hoạt cảnh báo đỏ gian lận kèm âm báo cảnh báo và hiển thị thời gian đã check-in trước đó. |
| RULE-VOTING-ONE-PERSON-ONE-VOTE | Quy Tắc Biểu Quyết Đại Hội 1 Người 1 Phiếu | Mỗi hội viên chính thức (`member`) có trạng thái hội phí `paid` chỉ sở hữu đúng 01 phiếu biểu quyết duy nhất cho mỗi nghị quyết đại hội. Phiếu bầu được mã hóa một chiều đảm bảo tính ẩn danh tuyệt đối và không thể sửa đổi sau khi đã bấm xác nhận gửi phiếu. |
| RULE-FIN-CASHBOOK-3-LEVELS | Quy Tắc Sổ Quỹ Thu Chi Kiểm Soát 3 Cấp | Mọi khoản chi tiêu từ quỹ câu lạc bộ vượt quá 2.000.000 VNĐ bắt buộc phải trải qua quy trình kiểm soát 3 cấp nghiêm ngặt trên Web CRM: Cấp 1: Cán bộ đề xuất lập phiếu (`pending`); Cấp 2: Trưởng ban phụ trách hoặc Tổng Thư Ký thẩm tra (`reviewed`); Cấp 3: Chủ tịch CLB hoặc Trưởng Ban Tài chính phê duyệt xuất quỹ (`approved`). |
| RULE-B2B-INTERNAL-DISCOUNT | Quy Tắc Niêm Yết Sản Phẩm Sàn B2B Có Trợ Giá Nội Bộ | Sản phẩm hoặc dịch vụ đăng bán trên Sàn Thương Mại B2B của CLB Doanh Nhân CEO 1983 bắt buộc phải cam kết chính sách trợ giá nội bộ (Mức chiết khấu tối thiểu từ 5% trở lên so với giá bán lẻ ngoài thị trường) dành riêng cho các thành viên trong câu lạc bộ. |
| RULE-UI-ROYAL-NAVY-GOLD | Quy Tắc Nhận Diện Thương Hiệu Hoàng Gia (Navy & Amber Gold) | Toàn bộ giao diện Web CRM và Mobile App bắt buộc tuân thủ hệ màu thương hiệu chính thức của CLB CEO 1983: Màu chủ đạo Xanh Navy `#003B95` đại diện cho bản lĩnh doanh nhân; Màu điểm xuyết Vàng Ánh Kim Amber Gold `#F59E0B` đại diện cho sự thịnh vượng và uy quyền. Tuyệt đối KHÔNG sử dụng màu đen thuần `#000000` cho các nút bấm chính (CTA Buttons). |
| RULE-EVT-VENUE-CONFLICT | Quy Tắc Kiểm Tra Xung Đột Địa Điểm Tổ Chức Sự Kiện (Venue Conflict Validation) | Hệ thống cho phép nhiều sự kiện diễn ra trong cùng một khung thời gian nhưng BẮT BUỘC phải tổ chức ở các địa điểm vật lý khác nhau (hoặc hình thức trực tuyến Online). Nếu quản trị viên nhập địa điểm trùng khớp với một sự kiện khác đang hoạt động (`status != 'cancelled'`) trong cùng ngày/giờ, hệ thống bắt buộc chặn lưu và hiển thị thông báo chi tiết: 'Địa điểm này đang trùng với sự kiện [Tên sự kiện], sau thời gian [hh:mm dd/MM/yyyy] có thể đăng ký được' (với thời điểm rảnh được tự động tính toán bằng thời gian kết thúc của sự kiện đang chiếm chỗ cộng thêm 2 giờ đệm phục vụ công tác dọn dẹp hội trường). |
| RULE-EVT-USER-OVERLAP-WARNING | Quy Tắc Cảnh Báo Trùng Khung Giờ Đăng Ký Sự Kiện Hội Viên (confirmOverlap) | Khi hội viên đăng ký một sự kiện mới có cùng thời gian diễn ra với một sự kiện khác mà hội viên đó đã đăng ký trước đó, hệ thống không chặn cứng mà BẮT BUỘC hiển thị hộp thoại cảnh báo xác nhận: 'Bạn đang đăng ký sự kiện [Tên sự kiện mới] cùng thời gian với sự kiện [Tên sự kiện cũ] ([Thời gian]). Bạn có chắc muốn đăng ký thêm không?'. Khi hội viên chủ động bấm 'Tiếp Tục Đăng Ký', client gửi kèm cờ `confirmOverlap: true` để backend phê duyệt lưu bản ghi. |
| RULE-SMTP-FAIL-SUPPRESSION | Quy Tắc Kiểm Soát Thư Tín SMTP & Khóa Gửi 1-Fail Suppression List | Máy chủ dịch vụ thư điện tử (SMTP Relay) phải chủ động lọc và bỏ qua các địa chỉ hòm thư giả lập, kiểm thử nội bộ (`@ceo1983.com`, `test`, `dummy`). Đối với các email hội viên thực tế, nếu gửi thất bại ngay lần đầu (mã lỗi 5xx, Recipient Rejected, Mailbox Unavailable), hệ thống lập tức đưa email đó vào Danh Sách Chặn (Suppression List - lưu trữ tại `uploads/mail_suppression_list.json`) và TUYỆT ĐỐI KHÔNG thử lại lần thứ 2, nhằm triệt tiêu hoàn toàn vòng lặp thử lại vô hạn 47 giờ gây quá tải hạ tầng và rủi ro bị khóa tài khoản Google Mailer-Daemon. |
| RULE-MTG-VENUE-SCHEDULE-CONFLICT | Quy Tắc Kiểm Tra Xung Đột Phòng Họp Vật Lý & Lịch Trình Đại Biểu | Áp dụng thuật toán kiểm tra xung đột thời gian và địa điểm cho tất cả các phòng họp vật lý (Sapphire Hub hoặc địa điểm phòng họp tập trung ngoài). Đồng thời, khi lên lịch cuộc họp hoặc mời đại biểu, hệ thống tự động kiểm tra lịch trình của các đại biểu tham gia (`attendees`); nếu phát hiện đại biểu đang có lịch họp trùng khung giờ, hệ thống hiển thị cảnh báo để Ban Thư Ký nắm bắt và chủ động sắp xếp nhân sự. |
| RULE-RBAC-DEDICATED-MENU-GROUP | Quy Tắc Độc Lập Hóa Nhóm Phân Quyền Vai Trò & Đồng Bộ URL Query | Chức năng Ma Trận Phân Quyền Vai Trò (RBAC Matrix) phải được tách biệt thành một Nhóm Menu Cấp 1 độc lập trên thanh điều hướng Sidebar và Mobile Drawer mang tên 'PHÂN QUYỀN' (`nav.group.permissions`). Màn hình điều khiển `/permissions` hỗ trợ đồng bộ trạng thái Tab hai chiều qua URL Query Parameter (`?tab=matrix`, `?tab=user_actions`, `?tab=role_groups`), đảm bảo khả năng liên kết sâu (deep link) và trải nghiệm tác nghiệp mượt mà cho Quản trị viên. |
| RULE-AI-32-FEATURES-TWO-PHASE-GPS-GUIDE | Quy Chuẩn Trợ Lý AI Điều Hành 32 Tính Năng & Cơ Chế 2 Pha Chỉ Dẫn Trực Tiếp (Voice GPS Tour Spotlight) | 1) Nền tảng 100% Miễn Phí: Kết hợp Google Gemini 2.0 Flash Free Tier, Web Speech API vi-VN và Smart Hybrid NLP Engine nội bộ, đảm bảo 0đ chi phí vận hành và tốc độ phản hồi < 400ms. 2) Tự Động Nắm Bắt Phiên Đăng Nhập: Truy vấn dữ liệu thực tế thời gian thực (Hồ sơ cá nhân, Hội phí nợ, Thông báo chưa đọc, Vé sự kiện đã đặt, Top 5 sự kiện đông nhất). 3) Quy Trình Đàm Thoại 2 Pha: Pha 1 giải thích chi tiết các bước thao tác và chủ động hỏi: 'Quý Anh/Chị có muốn tôi hướng dẫn thao tác trực tiếp trên màn hình không?'; Pha 2 khi người dùng bấm 'Có' hoặc nói khẩu lệnh khẳng định ('Có', 'Đồng ý', 'Bắt đầu', 'OK'), hệ thống tự động đóng modal, điều hướng URL đến trang đích và kích hoạt Spotlight viền vàng nhấp nháy dẫn đường từng bước như Google Maps. 4) Ma Trận 32 Tính Năng Toàn Diện: Bao phủ 24 chức năng nội bộ hội viên và 8 chức năng quản trị CRM bên ngoài, không bỏ sót bất kỳ phân hệ nào. |



## CHƯƠNG 6: BẢNG PHÂN TÍCH HIỆN TRẠNG (GAP ANALYSIS)

| Hạng Mục Tích Hợp | Kỳ Vọng Thiết Kế Hoàn Chỉnh | Hiện Trạng Kết Nối Thực Tế | Giải Pháp Vận Hành Tác Nghiệp |
| --- | --- | --- | --- |
| Cổng Thanh Toán VietQR | Tự động gạch nợ công nợ hội phí sang trạng thái `paid` trong 1 giây qua Webhook ngân hàng. | Đã sinh mã VietQR động chuẩn Napas 24/7 chứa đúng số tiền và nội dung chuyển khoản; tuy nhiên chưa có kết nối Webhook gạch nợ tự động. | Kế toán / Thủ quỹ đối soát biến động số dư trên sao kê tài khoản ngân hàng thực tế, sau đó truy cập Web CRM (`/fees`) và bấm nút 'Duyệt Gạch Nợ' thủ công. |
| Trợ Lý AI Điều Hành & Dẫn Đường Thao Tác Trực Tiếp (Turn-by-Turn Voice GPS) | Người dùng phải đọc tài liệu văn bản tĩnh hoặc xem video hướng dẫn rời rạc, tự tìm kiếm các nút bấm phức tạp trên giao diện. | Đã tích hợp Trợ lý AI giọng nói tiếng Việt 100% miễn phí (Gemini 2.0 Flash Free Tier + Web Speech API); cơ chế 2 pha đàm thoại thông minh; tự động lái màn hình và chiếu Spotlight viền vàng nhấp nháy vào đúng nút cần thao tác khi người dùng đồng ý. | Hội viên và cán bộ quản trị chỉ cần mở micro nói khẩu lệnh (ví dụ: 'Đăng ký sự kiện như nào', 'Tạo sự kiện mới kiểu gì', 'Có'), AI tự động giải thích và dẫn đường tận tay. |
| Đăng Nhập Một Chạm (SSO Google / Apple) | Đăng nhập tức thì chỉ với một chạm qua Google OAuth 2.0 hoặc Apple Sign-In. | Đã thiết kế nút bấm UI trên màn hình đăng nhập; chưa cấu hình chính thức Google Client ID và Apple Developer Service ID. | Hội viên và cán bộ quản lý đăng nhập ổn định bằng Số điện thoại / Email kết hợp Mật khẩu tài khoản cá nhân. |
| Phòng Họp Trực Tuyến Trực Tiếp (In-app Video Call) | Nhúng trực tiếp khung hình hội nghị truyền hình WebRTC đa điểm ngay bên trong ứng dụng di động. | Chưa tích hợp SDK Video Conference trực tiếp vào bundle ứng dụng di động để tối ưu dung lượng tải app. | Khi đến giờ họp, ứng dụng hiển thị nút mở trực tiếp liên kết phòng họp ngoài (Zoom Meetings, Google Meet hoặc UniWork Platform). |
| Dịch Vụ Tin Nhắn SMS OTP | Gửi mã xác thực OTP qua cổng Brandname SMS của các nhà mạng viễn thông Viettel/VNPT/Mobifone. | Chưa ký kết hợp đồng thương mại với nhà cung cấp dịch vụ SMS Brandname. | Sử dụng mã OTP mặc định trong môi trường kiểm thử nội bộ hoặc gửi mã kích hoạt trực tiếp qua dịch vụ Thư điện tử SMTP Gmail Relay bảo mật. |
| Kiểm Soát Xung Đột Địa Điểm Tổ Chức Sự Kiện | Hệ thống chỉ cho phép tạo 1 sự kiện duy nhất trên toàn hiệp hội trong cùng 1 ngày, hoặc không kiểm tra địa điểm dẫn đến 2 sự kiện khác nhau tranh chấp cùng một khán phòng. | Đã chuẩn hóa thuật toán kiểm tra xung đột theo cặp (Thời gian - Địa điểm). Cho phép nhiều sự kiện cùng ngày/giờ nhưng khác địa điểm. Trùng địa điểm sẽ chặn và hiển thị thời gian rảnh dự kiến (+2h). | Backend API `POST /api/association/events` tự động quét các sự kiện active cùng ngày/giờ; nếu trùng địa điểm thì trả về HTTP 409 kèm gợi ý thời gian đăng ký khả dụng. |
| Cảnh Báo Đăng Ký Sự Kiện Trùng Lịch Hội Viên | Hội viên có thể vô tình hoặc cố ý đăng ký tham dự nhiều sự kiện diễn ra cùng thời gian ở 2 địa điểm khác nhau mà không có bất kỳ cảnh báo nào từ hệ thống. | Giao diện và API đã bổ sung bước xác thực overlap. Hiển thị modal cảnh báo xác nhận rõ tên sự kiện cũ và mới, thời gian trùng lặp; chỉ lưu khi có cờ `confirmOverlap: true`. | Mobile App hiển thị Confirm Dialog giải thích xung đột; khi hội viên bấm 'Tiếp Tục Đăng Ký', API nhận `confirmOverlap = true` để lưu vé hợp lệ. |
| Vòng Lặp Thử Lại Thư Điện Tử (Google Mailer-Daemon Loop) | Nodemailer cấu hình retry vô hạn hoặc không lọc email test/dummy, dẫn đến việc gửi mail đến hòm thư ảo (@ceo1983.com) bị Google trả về lỗi 550 và kẹt tiến trình suốt 47 giờ. | Đã tích hợp bộ lọc Regex chặn gửi đến miền ảo/test và cơ chế danh sách đen 1-Fail Suppression List (`uploads/mail_suppression_list.json`). Gửi lỗi 1 lần là dừng hẳn. | Dịch vụ `mail.service.ts` kiểm tra suppression list trước khi gửi. Nếu gặp lỗi từ chối, ghi địa chỉ vào file JSON để triệt tiêu hoàn toàn retry. |
| Kiểm Tra Xung Đột Phòng Họp & Lịch Đại Biểu | Chỉ kiểm tra phòng Sapphire Hub, không kiểm tra các địa điểm họp offline khác và không cảnh báo nếu đại biểu được mời đang có lịch họp trùng khung giờ. | Đã mở rộng kiểm tra mọi địa điểm phòng họp offline; bổ sung kiểm tra xung đột lịch trình của từng đại biểu trong danh sách tham gia cuộc họp. | `meetings.service.ts` kiểm tra cả room physical conflict lẫn attendee conflict; cảnh báo trực quan cho Ban Thư Ký khi lên lịch. |
| Cấu Trúc Điều Hướng Phân Quyền Quản Trị RBAC | Menu phân quyền bị ẩn sâu bên trong 'Cấu Hình Hệ Thống' chung, khó tìm kiếm và không lưu trạng thái tab trên thanh địa chỉ URL. | Đã tách thành Nhóm Menu riêng 'PHÂN QUYỀN' trên Sidebar và Mobile Drawer. Trang `/permissions` đồng bộ query param `?tab=matrix`, `?tab=user_actions`, `?tab=role_groups`. | Navigation Sidebar bổ sung nhóm `nav.group.permissions`; Route `/permissions` hỗ trợ quản trị viên chia sẻ deep link trực tiếp đến từng tab chức năng. |



## CHƯƠNG 7: YÊU CẦU PHI CHỨC NĂNG & TIÊU CHUẨN KỸ THUẬT

### Hiệu Năng & Tốc Độ Xử Lý (Performance & Scalability)

| Tiêu Chí Kỹ Thuật | Chỉ Số Cam Kết & Yêu Cầu Chất Lượng (SLA) |
| --- | --- |
| Thời gian phản hồi API (API Response Time) | < 150ms cho 95% số lượng request truy vấn cơ sở dữ liệu thông thường. |
| Tốc độ quét nhận diện mã QR (QR Scan Speed) | < 0.2 giây (200ms) tại Cổng An Ninh Soát Vé Gate Check-in. |
| Thời gian tải trang ứng dụng di động (First Contentful Paint) | < 1.5 giây trên kết nối mạng di động 4G tiêu chuẩn. |
| Năng lực chịu tải đồng thời (Concurrent Users) | Đáp ứng tối thiểu 5,000 người dùng truy cập đồng thời trong các kỳ Đại hội hoặc sự kiện lớn. |



### Bảo Mật & Toàn Vẹn Dữ Liệu (Security & Compliance)

| Tiêu Chí Kỹ Thuật | Chỉ Số Cam Kết & Yêu Cầu Chất Lượng (SLA) |
| --- | --- |
| Mã hóa đường truyền (Transport Encryption) | 100% dữ liệu truyền tải qua giao thức HTTPS bảo mật TLS 1.3 và WebSocket Secure (WSS). |
| Mã hóa mật khẩu người dùng (Password Hashing) | Sử dụng thuật toán Bcrypt với Salt Round 10 vòng kết hợp muối bảo mật độc bản. |
| Cơ chế bảo vệ chống Brute-force | Tự động khóa tài khoản tạm thời trong 15 phút nếu nhập sai mật khẩu quá 5 lần liên tiếp. |
| Nhật ký kiểm toán hệ thống (Audit Logs) | Ghi nhận 100% nhật ký các thao tác tạo, sửa, xóa, duyệt của cán bộ quản lý (User, IP, Action, Timestamp, Payload). |



### Độ Sẵn Sàng & Khôi Phục Thảm Họa (Reliability & Disaster Recovery)

| Tiêu Chí Kỹ Thuật | Chỉ Số Cam Kết & Yêu Cầu Chất Lượng (SLA) |
| --- | --- |
| Chỉ số sẵn sàng hoạt động (System Uptime) | Cam kết đạt tối thiểu 99.9% tính sẵn sàng của hạ tầng máy chủ và ứng dụng. |
| Sao lưu cơ sở dữ liệu định kỳ (Automated Backup) | Tự động sao lưu toàn bộ CSDL PostgreSQL hàng ngày vào lúc 03:00 AM, lưu trữ phân tán 30 ngày. |
| Chỉ số RTO & RPO (Recovery Objectives) | Thời gian phục hồi dịch vụ (RTO) < 2 giờ; Mức độ mất mát dữ liệu tối đa chấp nhận (RPO) < 24 giờ. |



### Giao Diện Người Dùng & Khả Năng Tương Thích (UI/UX & Compatibility)

| Tiêu Chí Kỹ Thuật | Chỉ Số Cam Kết & Yêu Cầu Chất Lượng (SLA) |
| --- | --- |
| Chuẩn giao diện di động (Mobile Responsiveness) | Tương thích 100% các dòng điện thoại thông minh iOS (Safari PWA) và Android (Chrome PWA / Native APK). |
| Chuẩn trình duyệt máy tính (Desktop Browsers) | Tối ưu hiển thị sắc nét trên Google Chrome 90+, Microsoft Edge, Mozilla Firefox và Safari. |
| Quy chuẩn tài liệu xuất bản (Document Standards) | Tài liệu Word (.docx) và PDF phải tuân thủ chuẩn in ấn A4, không lỗi bảng, không gãy dòng, không lệch lề. |



