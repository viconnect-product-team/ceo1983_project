# TÀI LIỆU KỸ THUẬT & HƯỚNG DẪN SỬ DỤNG TRỢ LÝ AI ĐIỀU HÀNH THÔNG MINH (32 TÍNH NĂNG TOÀN DIỆN)
## HỆ THỐNG CLB DOANH NHÂN CEO 1983 (HANOIBA)

---

## 1. TỔNG QUAN KIẾN TRÚC & CÔNG NGHỆ 100% MIỄN PHÍ

Hệ thống Trợ lý AI Điều hành CLB Doanh Nhân CEO 1983 được thiết kế với kiến trúc **Hybrid Intelligence** kết hợp:
1. **Google Gemini 2.0 Flash (Free Tier)**:
   - Miễn phí 100% qua Google AI Studio API key (`GEMINI_API_KEY` / `GOOGLE_AI_KEY`).
   - Hạn ngạch: 15 Requests/phút (RPM), 1.500 Requests/ngày (RPD), 1.000.000 Tokens/phút (TPM).
   - Khả năng xử lý tiếng Việt xuất sắc, độ trễ phản hồi cực thấp.
2. **Web Speech API (`SpeechSynthesis` & `SpeechRecognition`)**:
   - Tích hợp chuẩn Web Speech API của trình duyệt: `SpeechSynthesisUtterance` với `lang = "vi-VN"`.
   - Giọng đọc mượt mà, phản hồi 0ms latency, không tốn bất kỳ chi phí cloud TTS nào.
   - Nhận diện giọng nói tiếng Việt tự động chuyển hóa thành câu lệnh điều hành.
3. **Smart Hybrid NLP Engine Nội Bộ**:
   - Tự động nhận diện ý định (Intent Classification) ngay trên Backend NestJS (`apps/ceo1983_app_be/src/ai/ai.service.ts`).
   - Hoạt động 100% ngoại tuyến / fallback ngay cả khi không có kết nối ra API bên ngoài.

---

## 2. MA TRẬN 32 TÍNH NĂNG BAO PHỦ TOÀN BỘ HỆ THỐNG

Trợ lý AI nắm vững và hỗ trợ hướng dẫn chi tiết cho **tất cả 32 chức năng**, không bỏ sót bất kỳ phân hệ nào:

### 2.1. Phân Hệ Hội Viên Nội Bộ (In-App Member Modules - 24 Chức Năng)

| STT | Mã Định Danh (`tourId`) | Tên Chức Năng | Đường Dẫn (Route) | Mô Tả & Thao Tác Trọng Tâm |
| :---: | :--- | :--- | :--- | :--- |
| 1 | `association-events` | Đăng ký sự kiện & Vé mời | `/association/events` | Tìm sự kiện, chọn loại vé (Hội viên / Khách VIP / Vé kèm theo), xác nhận vé và lưu lịch. |
| 2 | `association-checkin` | Xem vé QR Check-in & Bàn VIP | `/association/checkin` | Xuất trình mã QR động cho Ban lễ tân, tra cứu số bàn VIP và chỗ ngồi đại biểu. |
| 3 | `association-checkin` | Quét vé QR & Thẻ NFC soát vé | `/association/checkin` | Bật camera quét mã QR vé đại biểu hoặc kích hoạt đầu đọc thẻ NFC tiếp xúc nhanh. |
| 4 | `association-card` | Mở Danh thiếp số 5.0 | `/association/card` | Mở danh thiếp điện tử, chọn mẫu thiết kế phôi thẻ, tải mã QR danh thiếp cá nhân. |
| 5 | `association-card` | Ghi thẻ cứng NFC chạm thông minh | `/association/card` | Bật chế độ "Ghi thẻ NFC", áp thẻ cứng vào mặt lưng điện thoại để nạp danh thiếp số. |
| 6 | `association-card` | Quét card visit giấy bằng AI OCR | `/association/card` | Chụp danh thiếp giấy đối tác, AI OCR tự động trích xuất Tên, Công ty, SĐT, Email vào danh bạ. |
| 7 | `association-card` | Bảo mật riêng tư danh thiếp | `/association/card` | Bật/tắt hiển thị Số điện thoại, CCCD, Email, Địa chỉ khi chia sẻ danh thiếp công khai. |
| 8 | `association-members` | Tìm kiếm & Tra cứu danh bạ CEO | `/association/members` | Gõ họ tên, mã hội viên, tên công ty; xem chi tiết hồ sơ năng lực doanh nghiệp đối tác. |
| 9 | `association-members` | Lọc Ban chuyên môn & Ngành nghề | `/association/members` | Lọc theo 6 Ban chuyên môn, lọc theo 20+ nhóm ngành công nghiệp, thương mại, dịch vụ. |
| 10 | `association-members` | Đặt lịch hẹn giao thương 1-on-1 | `/association/members` | Chọn đối tác CEO, bấm "Hẹn 1-on-1", chọn thời gian, địa điểm hoặc link Uniwork Meet trực tuyến. |
| 11 | `association-products` | Đăng cơ hội hợp tác B2B | `/association/products` | Bấm "Chia sẻ cơ hội", nhập nhu cầu Mua/Bán, quy mô ngân sách, hạn chót và hình ảnh. |
| 12 | `association-products` | Khám phá cơ hội kết nối B2B | `/association/products` | Lướt nguồn cung cầu B2B, bấm "Kết nối ngay" để mở kênh đàm phán trực tiếp với chủ doanh nghiệp. |
| 13 | `association-products` | Đăng bán sản phẩm B2B | `/association/products` | Bấm "Đăng bán", chọn danh mục, mô tả thông số kỹ thuật, giá niêm yết, chính sách ưu đãi hội viên. |
| 14 | `association-products` | Sàn thương mại B2B Marketplace | `/association/products` | Xem gian hàng sản phẩm, dịch vụ, giải pháp công nghệ tiêu biểu của các doanh nghiệp CEO 1983. |
| 15 | `association-products` | Báo giá sỉ & Kết nối cung ứng | `/association/products` | Gửi yêu cầu chào giá sỉ (RFQ), thảo luận chiết khấu nội bộ giữa các hội viên HanoiBA. |
| 16 | `association-voting` | Biểu quyết đại hội trực tuyến | `/association/voting` | Xem nghị quyết, tờ trình nhân sự; bỏ phiếu Tán thành / Không tán thành / Ý kiến khác thời gian thực. |
| 17 | `association-voting` | Quay số may mắn Lucky Draw Gala | `/association/voting` | Nhập mã vé đại biểu, theo dõi vòng quay thưởng điện tử và nhận quà Gala vinh danh. |
| 18 | `association-profile` | Đóng hội phí thường niên VietQR | `/association/profile` | Tra cứu niên liễm, quét mã VietQR MB Bank tự động điền đúng cú pháp `HP1983 [Mã]`, gạch nợ tức thì. |
| 19 | `association-library` | Thư viện điều lệ & Kỷ yếu số | `/association/library` | Đọc và tải file PDF Điều lệ HanoiBA, Quy chế CLB CEO 1983, Niên giám hội viên và Kỷ yếu Gala. |
| 20 | `association-profile` | Đổi ảnh đại diện & Phôi thẻ VIP | `/association/profile` | Tải avatar sắc nét, tùy biến phôi thẻ VIP Gold/Platinum/Diamond và cập nhật chức danh. |
| 21 | `association-profile` | Chế độ giao diện & Lễ hội | `/association/profile` | Bật/tắt Dark Mode, giao diện Navy Classic hoặc chế độ Lễ kỷ niệm Hội Doanh Nhân Trẻ. |
| 22 | `association-profile` | Cài đặt ứng dụng PWA | `/association/profile` | Bấm "Thêm vào màn hình chính" trên Safari iOS hoặc Chrome Android để dùng như native app. |
| 23 | `association-profile` | Đường dây nóng 5 Ban chuyên môn | `/association/profile` | Bấm gọi trực tiếp Ban Thư ký, Ban Thành viên, Ban Sự kiện, Ban Truyền thông, Ban Tài chính. |
| 24 | `association-messages` | Hộp thư tin nhắn B2B & Ban | `/association/messages` | Nhắn tin trao đổi bảo mật 1-1, nhận thông báo điều hành từ Ban Thư ký và nhóm chuyên trách. |

---

### 2.2. Phân Hệ Quản Trị Hệ Thống CRM (External / CRM Admin Modules - 8 Chức Năng)

| STT | Mã Định Danh (`tourId`) | Tên Chức Năng | Đường Dẫn (Route) | Mô Tả & Thao Tác Trọng Tâm |
| :---: | :--- | :--- | :--- | :--- |
| 25 | `events-admin` | Quản lý & Tạo sự kiện mới BTC | `/events` | Bấm "Tạo sự kiện", cấu hình thời gian, kiểm tra trùng địa điểm, thiết lập vé và danh sách khách VIP. |
| 26 | `members-admin` | Quản lý & Duyệt hội viên CRM | `/members` | Tiếp nhận hồ sơ gia nhập, thẩm định doanh nghiệp, phê duyệt hội viên và tự động cấp tài khoản. |
| 27 | `fees-admin` | Quản trị tài chính & Hội phí | `/fees` | Theo dõi dòng tiền niên liễm, tạo đợt thu phí, đối soát sao kê ngân hàng MB Bank tự động. |
| 28 | `tasks-admin` | Quản lý công việc & Giao việc | `/tasks` | Giao nhiệm vụ cho các Ban, theo dõi tiến độ bảng Kanban, nhắc việc tự động và nghiệm thu. |
| 29 | `permissions-admin` | Phân quyền RBAC & Soát vé | `/permissions` | Thiết lập ma trận quyền hạn, phân quyền tài khoản Admin/BQT/BTC và cấp thẩm quyền quét vé Check-in. |
| 30 | `sponsors-admin` | Quản lý Nhà tài trợ & Quyền lợi | `/sponsors` | Quản lý các gói Kim cương, Vàng, Bạc; gắn logo thương hiệu, kiểm soát vị trí đặt banner Gala. |
| 31 | `association-library` | Kho văn bản & Quyết định CRM | `/documents` | Soạn thảo, ban hành nghị quyết, quyết định bổ nhiệm nhân sự và lưu trữ công văn hiệp hội. |
| 32 | `association-notifications` | Trung tâm thông báo & Nhắc việc | `/association/notifications` | Phát thông báo khẩn, gửi tin push điều hành và theo dõi tỷ lệ hội viên đã đọc thông báo. |

---

## 3. CƠ CHẾ 2 PHA TƯƠNG TÁC GIỌNG NÓI & DẪN ĐƯỜNG TRỰC TIẾP

Để đảm bảo người dùng không bị chuyển màn hình đột ngột ngoài ý muốn, hệ thống áp dụng luồng đàm thoại 2 pha chuẩn quốc tế:

### Pha 1: Giải thích cặn kẽ thao tác + Mời dẫn đường trực tiếp
- Khi người dùng hỏi bằng giọng nói hoặc văn bản (ví dụ: *"đăng ký sự kiện như nào"*, *"làm sao để tạo sự kiện mới"*, *"cách ghi thẻ NFC"*):
  1. AI phản hồi bằng văn bản Markdown chia rõ ràng các bước: **Bước 1, Bước 2, Bước 3**.
  2. Web Speech API phát âm thanh tiếng Việt ngắn gọn, chuyên nghiệp.
  3. Cuối phản hồi, AI luôn hỏi:
     > *"Quý Anh/Chị có muốn tôi hướng dẫn thao tác trực tiếp trên màn hình không? Tôi sẽ dẫn đường từng bước cho Anh/Chị."*
  4. Hộp chat hiển thị khối Callout màu vàng hoàng gia sang trọng với 2 nút hành động:
     - `[👉 Có, hướng dẫn trực tiếp ngay]`
     - `[Để sau]`

### Pha 2: Tự động lái màn hình và kích hoạt GPS Tour HUD khi người dùng Đồng ý
- Người dùng có thể:
  - **Cách 1**: Bấm nút `[👉 Có, hướng dẫn trực tiếp ngay]`.
  - **Cách 2**: Bấm Micro hoặc nói to: `"Có"`, `"Đồng ý"`, `"OK"`, `"Bắt đầu"`, `"Yes"`, `"Hướng dẫn đi"`, `"Lái màn hình đi"`.
- Hệ thống lập tức:
  1. Đóng modal Trợ lý AI.
  2. Điều hướng ngay lập tức đến route tương ứng bằng `navigate({ to: route })`.
  3. Kích hoạt lộ trình dẫn đường thực tế bằng `startTourGlobally(tourId)`.
  4. Lớp phủ `VoiceGpsHudOverlay` xuất hiện:
     - **Spotlight định vị**: Vùng tối xung quanh, chiếu vòng hào quang vàng kim nhấp nháy vào đúng vị trí nút/thẻ cần thao tác.
     - **Thanh HUD dẫn đường**: Hiển thị cử chỉ (👆 Chạm, 📸 Quét, ↔️ Vuốt), Vị trí điểm chạm, Lời thoại hướng dẫn, Mẹo VIP.
     - **Giọng nói tiếng Việt**: Tự động thuyết minh bước hiện tại và chuyển tiếp bước tiếp theo mượt mà.

---

## 4. BẢO ĐẢM CHẤT LƯỢNG MÃ NGUỒN & KIỂM THỬ

- **TypeScript Compilation**: Kiểm tra `tsc --noEmit` đạt **Exit code 0 (0 errors)** trên toàn bộ:
  - Backend NestJS: `apps/ceo1983_app_be`
  - Frontend Vite: `apps/ceo1983_app_fe`
- **Tuân thủ quy tắc bảo mật & Git**: Toàn bộ thay đổi mã nguồn được lưu trữ cục bộ, tuyệt đối không tự ý thực hiện `git push` hay `git commit`.
