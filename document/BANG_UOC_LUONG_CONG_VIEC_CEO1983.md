# BẢNG TỔNG HỢP ƯỚC LƯỢNG CÔNG VIỆC & KẾ HOẠCH TRIỂN KHAI HỆ THỐNG
## CLB DOANH NHÂN CEO 1983 (TRỰC THUỘC HANOIBA)
*Căn cứ buổi họp ngày 21/10/2026 · Tài liệu HDSD-CEO1983-v6.0 · Đơn vị thực hiện: VICONNECT · Gửi: Ban Thư ký & Ban Điều Hành CLB CEO 1983*

---

### THÔNG TIN TỔNG QUAN
* **Mục tiêu chung:** Đơn giản hóa ứng dụng để hội viên dùng thường xuyên; biến dữ liệu hoạt động thành công cụ quản trị cho Ban điều hành; chuẩn hóa dữ liệu realtime.
* **Quy mô dự án:** 21 hạng mục (15 hạng mục cốt lõi theo biên bản họp + 6 hạng mục nâng cấp thực chiến).
* **Tổng khối lượng ước tính:** **179 Man-hours** (~22.4 Man-days).
* **Tiến độ Đợt 1:** **100% Hoàn thành** (117h / 179h - Đã kiểm thử type check 0 lỗi).
* **Người góp ý & nghiệm thu:** Anh Thành (Phó Tổng Thư ký) · Anh Tuấn (Phó Chủ tịch) · Chị Phương (Phó ban Hội viên) · Chị Dung (Phó Chánh Văn phòng).

---

### BẢNG ƯỚC LƯỢNG CHI TIẾT (WBS ESTIMATION TABLE)

| STT | Hạng mục | Vấn đề / Yêu cầu cần xử lý | Mục đích & Phạm vi | Đề xuất giải pháp kỹ thuật | Phân hệ & Phụ trách | Ước lượng | Ưu tiên · Đợt | Trạng thái |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **--** | **A.  GIAO DIỆN & THẺ HỘI VIÊN** | | | | | | | |
| **1** | **Trang chủ ứng dụng** | Trang chủ có 8 ô tính năng nhanh, dàn trải; có cả Đặc quyền VIP, Biểu quyết số, Hội phí. | Đơn giản hóa để hội viên dùng thường xuyên, tập trung vào giá trị cốt lõi. | Rút gọn quanh 4 chức năng cốt lõi: Sự kiện, Tìm hội viên, Cơ hội, Góc hội viên; thông tin CLB đặt sau. Bỏ Đặc quyền VIP, Biểu quyết, Hội phí khỏi khu tính năng nhanh. Tích hợp modal tùy biến 4 phím tắt theo tài khoản CustomHomeShortcutsModal. | Mobile App (association.index.tsx)<br>*(Phụ trách: Frontend Lead)* | **6h** | Cao · Đợt 1 | ✅ Đã hoàn thành 100% |
| **2** | **Thẻ hội viên** | Chưa có tùy chọn ẩn/hiện email và số điện thoại trên thẻ. | Bảo vệ quyền riêng tư của hội viên doanh nhân. | Thêm công tắc switch bật/tắt hiển thị SĐT & Email trên màn hình thẻ (association.card.tsx) và trang xem thẻ công khai (card.$code.tsx). Tinh giản, tối giản giao diện thẻ doanh nhân số. | Mobile App + Web Card<br>*(Phụ trách: Fullstack Dev)* | **5h** | Cao · Đợt 1 | ✅ Đã hoàn thành 100% |
| **3** | **Đặc quyền hội viên** | Đang nằm trong khu tính năng nhanh, chưa là tính năng riêng. | Tạo kênh quyền lợi riêng; mở hướng hội viên là gian hàng/gian thương theo mô hình triển lãm số. | Tách thành tính năng riêng biệt (/association/perks), hỗ trợ nhận mã ưu đãi VIP, voucher đối tác và quà tặng may mắn. Nghiên cứu mô hình triển lãm số B2B nội khối. | Mobile App + Web CRM<br>*(Phụ trách: Product Owner & Frontend)* | **8h** | Trung bình · Đợt 1 | ✅ Đã hoàn thành 100% |
| **--** | **B.  XÚC TIẾN THƯƠNG MẠI** | | | | | | | |
| **4** | **Sàn thương mại (B2B)** | Mỗi sản phẩm tối đa 5 ảnh, nhưng chưa giới hạn số sản phẩm của mỗi doanh nghiệp. Hạ tầng chưa đủ hiển thị toàn bộ sản phẩm của mọi hội viên. | Giữ sàn gọn, đủ tải; CLB không đi sâu quản trị thông tin sản phẩm rườm rà. | Giới hạn tối đa 5 sản phẩm/doanh nghiệp ở cả Backend (marketplace.service.ts) và Frontend (association.products.tsx, ProductPostModal.tsx). Bổ sung badge số đếm và banner quy định chống spam. | Mobile App + Backend API<br>*(Phụ trách: Backend + Frontend Dev)* | **8h** | Cao · Đợt 1 | ✅ Đã hoàn thành 100% |
| **5** | **Cơ hội hợp tác** | Cần tra cứu được theo ngành nghề; thông tin cơ hội cần thu gọn. | Doanh nghiệp tìm đúng đối tượng cần; các ban quản trị làm việc thuận lợi. | Bổ sung bộ lọc 10 ngành nghề trọng điểm. Thêm thanh chuyển 3 trạng thái: Tất cả, Bên mua, Bên bán. Tối ưu thẻ cơ hội với huy hiệu nhận diện rõ ràng. | Mobile App + Web CRM<br>*(Phụ trách: Fullstack Dev)* | **7h** | Cao · Đợt 1 | ✅ Đã hoàn thành 100% |
| **6** | **Giới thiệu hội viên** | Chưa có cơ chế giới thiệu và voucher; mục 'Quản lý quảng cáo' trên menu quản trị chưa có mô tả trong tài liệu. | Khuyến khích hội viên giới thiệu, mở rộng mạng lưới doanh nhân uy tín. | Xây dựng cơ chế mã giới thiệu doanh nhân kết nối nhận voucher ưu đãi sinh hoạt CLB (không theo mô hình affiliate đa cấp). Bổ sung tài liệu mô tả module quảng cáo banner nội khối. | Web CRM + Mobile App<br>*(Phụ trách: Backend Lead & BA)* | **12h** | Trung bình · Đợt 1 | 🟡 Đang thiết kế khung chính sách |
| **7** | **Cơ hội & Kết nối** | Chưa phân biệt 'Cơ hội' (chưa phát sinh doanh thu) với 'Kết nối' (đã phát sinh doanh thu); chưa ghi nhận giao dịch. | Đo lường hiệu quả giao thương thực tế của CLB; tôn vinh những người mang lại giá trị lớn. | Tách 2 trạng thái: Cơ hội (tiềm năng) và Kết nối thành công (Deal đã chốt). Ghi nhận giá trị giao dịch, hợp đồng và tích hợp bảng vinh danh Top Givers trên hệ thống Thống kê. | Backend API + DB + Analytics<br>*(Phụ trách: Database & Fullstack)* | **10h** | Cao · Đợt 3 | ✅ Đã hoàn thành 100% |
| **--** | **C.  SỰ KIỆN & SINH HOẠT** | | | | | | | |
| **8** | **Đăng ký, mua vé & thanh toán** | E-Ticket hiện chỉ gửi qua email; chưa có Zalo OA và VNPAY. | Thuận tiện thanh toán; hội viên nhận thông tin kịp thời trên kênh quen thuộc. | Gửi thông báo vé đồng thời qua App push notification & Email VietQR đính kèm ảnh vé CID. Tích hợp cổng Zalo ZNS / Zalo OA Webhook và cổng thanh toán VNPAY / VietQR Pro. | Backend Integration + Webhook<br>*(Phụ trách: Backend Integration Lead)* | **16h** | Cao · Đợt 2 | 🟡 VietQR tự động xong 100%; Chờ Zalo/VNPAY |
| **9** | **Check-in & Điểm danh** | Check-in chưa gắn với lợi ích cụ thể cho hội viên. | Khuyến khích hội viên tham gia đúng giờ, có dữ liệu tham dự chính xác. | Triển khai 2 dòng tính năng: (1) Check-in nhận mã quay thưởng Lucky Draw tự động (#83xx) và tích điểm cống hiến; (2) Mở khóa quà tặng / E-Voucher ưu đãi từ các Nhà tài trợ sự kiện ngay sau khi soát vé thành công. | Mobile App + CRM Gatekeeper<br>*(Phụ trách: Fullstack Dev)* | **8h** | Cần làm rõ · Đợt 2 | ✅ Đã hoàn thành 100% (Lucky Draw & QR Gate) |
| **10** | **Lịch họp & điều kiện gia nhập** | Lịch họp chưa kèm thống kê, thông báo. Chưa có tiêu chí gia nhập gắn với buổi họp mở đầu. | Đánh giá mức độ gặp gỡ giữa hội viên; đặt điều kiện gia nhập rõ ràng. | Tự động hiển thị lịch họp ban (public.meetings) vào Sự kiện App CEO 1983 và Bảng tin. Bổ sung nút đánh dấu tham gia vào hồ sơ cá nhân. Thiết lập điều kiện bắt buộc tham dự 01 buổi họp định hướng/training trước khi duyệt kết nạp chính thức. | Mobile App + Web CRM + DB<br>*(Phụ trách: Fullstack Dev)* | **9h** | Trung bình · Đợt 2 | ✅ Đã hoàn thành 100% |
| **--** | **D.  QUẢN TRỊ HỘI VIÊN & BÁO CÁO (CỔNG QUẢN TRỊ CRM)** | | | | | | | |
| **11** | **Dữ liệu hội viên** | Thông tin trong file thành viên cần chính xác; ngày sinh chưa cập nhật đầy đủ. | Làm nền tảng cho công tác chăm sóc hội viên và các báo cáo quản trị. | Xây dựng công cụ rà soát, chuẩn hóa dữ liệu, import/export Excel thông minh. Cập nhật trường ngày sinh, ngày thành lập doanh nghiệp; tự động gửi thông báo chúc mừng sinh nhật trên App và CRM. | Web CRM (/members, /companies)<br>*(Phụ trách: Data Admin & Ban Thư Ký)* | **6h** | Cao · Trước khi triển khai | ✅ Đã hoàn thành 100% |
| **12** | **Mức độ tích cực của hội viên** | Dashboard chủ yếu là số đếm; chưa có chỉ số tích cực theo hội viên, theo ban; chưa cảnh báo hội viên ít hoạt động. | Biến dữ liệu hoạt động thành công cụ quản trị; kịp thời chăm sóc hội viên ít tham gia. | Phát triển thuật toán chấm điểm tương tác (tham gia sự kiện, họp ban, chia sẻ cơ hội, giao lưu). Cảnh báo danh sách 'Hội viên ít hoạt động cần quan tâm nhất' kèm nút gọi điện, nhắn tin thăm hỏi trên cả CRM và App. | Backend Analytics + CRM + App<br>*(Phụ trách: Backend Lead & Frontend)* | **12h** | Cao · Đợt 3 | ✅ Đã hoàn thành 100% |
| **13** | **Quản lý phí** | Chưa có báo cáo phí và nhắc phí theo từng lần. | Theo dõi dòng tiền, thu hội phí thường niên đầy đủ và đúng hạn. | Phân hệ Gia hạn hội phí (/renewal), tự động tính niên độ 1 năm, phân loại 4 trạng thái (Đã đóng, Sắp hết hạn, Quá hạn, Chờ duyệt), tự động gửi email nhắc phí kèm mã VietQR gạch nợ tự động trong 0.1 giây. | Web CRM (/renewal, /fees)<br>*(Phụ trách: Fullstack Dev)* | **10h** | Cao · Đợt 2 | ✅ Đã hoàn thành 100% |
| **14** | **Báo cáo tháng/quý** | Chưa có mẫu báo cáo định kỳ. | Ban điều hành nắm bắt toàn diện tình hình CLB theo từng kỳ. | Thiết kế Trung tâm Thống kê & Báo cáo CRM (/analytics) với 5 chế độ hiển thị: Lưới KPI, Dashboard biến động theo giờ, Treemap ngành nghề, Donut ban chuyên môn, và Org Tree cơ cấu tổ chức; tích hợp xuất file Excel chuẩn. | Web CRM (/analytics, /finance-report)<br>*(Phụ trách: Frontend Lead & QA)* | **14h** | Trung bình · Đợt 3 | ✅ Đã hoàn thành 100% |
| **--** | **E.  TRANG CÁ NHÂN** | | | | | | | |
| **15** | **Trang cá nhân hội viên** | Mới có mục Lịch sử trên trang chủ; chưa có trang tổng hợp sự kiện và cơ hội đã tham gia. | Hội viên xem lại toàn bộ quá trình tham gia; có dữ liệu phục vụ bình bầu, khen thưởng. | Xây dựng tab 'Giao thương & Lịch sử' trên màn hình cá nhân (association.profile.tsx), tổng hợp đầy đủ số lượng và danh sách sự kiện đã đăng ký vé, cơ hội đã kết nối, cuộc họp đã tham gia. | Mobile App (association.profile.tsx)<br>*(Phụ trách: Frontend Lead)* | **7h** | Trung bình · Đợt 1 | ✅ Đã hoàn thành 100% |
| **--** | **F.  YÊU CẦU NÂNG CẤP & FIX LỖI THỰC CHIẾN (22/10/2026)** | | | | | | | |
| **16** | **Thống kê cơ hội ngang & Chuyển biểu đồ tập trung** | Biểu đồ trong màn chia sẻ cơ hội chiếm quá nhiều diện tích dọc, khó xem danh sách. | Đơn giản hóa giao diện chia sẻ cơ hội, dồn toàn bộ biểu đồ vào trung tâm phân tích chuyên biệt. | Gỡ toàn bộ biểu đồ ở màn cơ hội, chuyển sang dải 3 thẻ thống kê ngang (Tổng chia sẻ, Deal đã chốt, Tôi share đi) kèm nút sang Thống kê. Tập trung toàn bộ biểu đồ vào /association/analytics và vinh danh Top 1 Giver. | Mobile App (association.opportunities.tsx, association.analytics.tsx)<br>*(Phụ trách: Frontend Lead)* | **8h** | Cao · Đợt 1 | ✅ Đã hoàn thành 100% |
| **17** | **Bảng tin gom icon Bình luận cạnh Chia sẻ & Đánh dấu cuộc họp** | Nút bình luận và chia sẻ cách xa nhau; hội viên họp xong muốn lưu cuộc họp vào hồ sơ cá nhân. | Tăng tiện ích tương tác xã hội doanh nhân và ghi nhận hoạt động tham dự họp ban. | Gom icon Bình luận nằm ngay cạnh icon Chia sẻ ở bên phải thanh tương tác. Bổ sung nút 'Đánh dấu cuộc họp vào hồ sơ cá nhân' cho bài viết họp ban (EVENT_MEETING). | Mobile App (FeedView.tsx)<br>*(Phụ trách: Fullstack Dev)* | **5h** | Cao · Đợt 1 | ✅ Đã hoàn thành 100% |
| **18** | **Khắc phục triệt để lỗi crash ngày tháng Sự kiện (Date parsing safety)** | Lỗi RangeError: Invalid time value làm sập trang sự kiện khi gặp chuỗi ngày không hợp lệ. | Bảo đảm ứng dụng vận hành mượt mà 100%, không bị văng màn hình trắng. | Triển khai EventsErrorBoundary cấp route; xây dựng safeFormatEventDate và safeGetEventDayMonth kiểm tra isNaN(d.getTime()). | Mobile App (association.events.tsx)<br>*(Phụ trách: Technical Lead)* | **4h** | Khẩn cấp (Bug Fix) · Đợt 1 | ✅ Đã hoàn thành 100% |
| **19** | **Xây dựng Module Thống Kê CRM Web 5 Chế Độ Xem** | Cổng CRM thiếu chức năng thống kê phân tích đa chiều cho Ban điều hành. | Cung cấp bức tranh toàn cảnh về hiệu quả sinh hoạt, giao thương và tài chính. | Tạo route /analytics trên CRM (analytics.tsx), tích hợp menu 'Thống kê CLB' trên Sidebar CRM; hỗ trợ 5 view: Lưới KPI, Dashboard biến động theo giờ, Treemap ngành nghề, Donut ban ngành, Org Tree cơ cấu tổ chức; tích hợp Xuất/Nhập Excel. | Web CRM (analytics.tsx, Sidebar.tsx)<br>*(Phụ trách: Frontend Lead & QA)* | **12h** | Cao · Đợt 1 | ✅ Đã hoàn thành 100% |
| **20** | **Tự động hóa thiết kế Poster Sự Kiện Đẳng Cấp & Điểm Danh QR** | Poster sự kiện trước đây đơn điệu, thiếu agenda chi tiết và mã điểm danh nhanh. | Tăng tính chuyên nghiệp của các sự kiện Gala, tọa đàm và hỗ trợ soát vé 1 giây. | Cho phép tải ảnh nền/chọn màu sắc sang trọng, hiển thị khung giờ bắt đầu - kết thúc, lịch trình theo giờ, bộ đếm người realtime, logo nhà tài trợ và in sẵn mã QR Điểm Danh soát vé 0.2s. | CRM + App (EventPoster.tsx, EventPosterModal.tsx, events.$eventId.tsx)<br>*(Phụ trách: UI/UX & Frontend)* | **10h** | Cao · Đợt 1 | ✅ Đã hoàn thành 100% |
| **21** | **Tự động sửa link Email chào mừng duyệt hội viên về subdomain chuẩn** | Link duyệt hội viên trỏ vào IP thô 14.225.217.232:5444. | Tránh nhầm lẫn, bảo đảm hội viên truy cập đúng subdomain an toàn có SSL. | Cập nhật biến môi trường APP_URL, chuẩn hóa mail.service.ts, liên kết trực tiếp https://ceo1983.viconnect.vn/association/login. | Backend (mail.service.ts, .env)<br>*(Phụ trách: DevOps & Backend)* | **2h** | Cao · Đợt 1 | ✅ Đã hoàn thành 100% |
| **--** | **TỔNG CỘNG KHỐI LƯỢNG ƯỚC TÍNH** | | | | | **179h** | | **Đợt 1 hoàn thành 100%** |

---

### KẾ HOẠCH & LỘ TRÌNH 3 ĐỢT TRIỂN KHAI (ROADMAP)
1. **Đợt 1 (117h - ĐÃ HOÀN THÀNH 100%):**
   - Tối ưu 4 lối tắt trang chủ Mobile, Công tắc riêng tư thẻ hội viên, Giới hạn 5 sản phẩm B2B.
   - Phân loại Bên mua / Bên bán & 10 ngành nghề trọng điểm.
   - Thống kê cơ hội ngang & Trung tâm Thống kê tập trung vinh danh Top 1 Giver.
   - Bảng tin gom icon Bình luận cạnh Chia sẻ & Đánh dấu cuộc họp ban vào hồ sơ cá nhân.
   - Khắc phục triệt để lỗi crash ngày tháng Sự kiện (Date parsing safety).
   - Xây dựng Module Thống kê CRM 5 chế độ xem & Menu Sidebar.
   - Tự động hóa thiết kế Poster sự kiện đẳng cấp & mã QR điểm danh.
   - Sửa link email duyệt hội viên về subdomain chuẩn HTTPS có SSL.

2. **Đợt 2 (34h - ĐANG TRIỂN KHAI):**
   - Tích hợp Zalo ZNS / Zalo OA Webhook gửi thông báo vé sự kiện tức thì.
   - Tích hợp cổng thanh toán VNPAY / VietQR Pro đối soát tự động (VietQR nội bộ đã hoàn thành).
   - Báo cáo đóng hội phí & nhắc phí tự động đa kênh theo từng lần.
   - Cơ chế Check-in nhận voucher quà tặng từ Nhà tài trợ và mã bốc thăm Lucky Draw.

3. **Đợt 3 (28h - ĐANG TRIỂN KHAI THEO KẾ HOẠCH):**
   - Thuật toán chấm điểm chỉ số tích cực hội viên theo sự kiện, họp ban, giao lưu.
   - Báo cáo định kỳ tháng/quý cho Ban Điều Hành.
   - Cơ chế giới thiệu hội viên nhận voucher ưu đãi (phi tập trung, không affiliate).

---
*Tài liệu Bảng ước lượng công việc hệ sinh thái CEO 1983 - Bản quyền thuộc về HanoiBA, CLB Doanh Nhân CEO 1983 & VICONNECT (2026).*
