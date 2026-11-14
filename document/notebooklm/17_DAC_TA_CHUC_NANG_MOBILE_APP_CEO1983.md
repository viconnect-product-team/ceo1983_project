# BẢN ĐẶC TẢ CHỨC NĂNG ỨNG DỤNG DI ĐỘNG CEO 1983 (MOBILE APP)
## Dành Cho Hội Viên Doanh Nhân, Ban Lãnh Đạo & Đối Tác Giao Thương B2B

*Hiệp Hội Doanh Nhân CEO 1983 (HanoiBA) | Phiên bản 5.0 | 100% CSDL PostgreSQL*

---

### 1. [NODE-APP-AUTH-001] Đăng Nhập Di Động Đa Phương Thức (Email, Phone, Google OAuth, Apple ID)
- **Đối tượng sử dụng**: Hội viên Doanh nhân CEO 1983
- **Luồng nghiệp vụ chi tiết**:
  1. Mở app CEO 1983, truy cập màn hình đăng nhập (/association/login).
  2. Nhập Email hoặc Số điện thoại cùng Mật khẩu cá nhân.
  3. Hỗ trợ đăng nhập 1 chạm bằng Google OAuth hoặc Apple ID (trên iOS).
  4. Backend cấp phát Access Token và Refresh Token, lưu trữ bảo mật trên thiết bị di động.
  5. Tải nạp hồ sơ cá nhân, đồng bộ trạng thái hội viên và chuyển thẳng vào Trang Chủ App.
- **API Endpoints Backend**:
```http
POST /auth/login
POST /auth/google
POST /auth/apple
POST /auth/refresh-token
```
- **Bảng CSDL PostgreSQL**:
```sql
public.vione_users (email, phone, password_hash, status)
public.members (full_name, avatar_url, executive_role, department)
```
- **Ràng buộc & Ghi chú**: Tối ưu đăng nhập nhanh, hỗ trợ sinh trắc học FaceID/Vân tay qua Capacitor.

---

### 2. [NODE-APP-AUTH-002] Đổi Mật Khẩu Cá Nhân Trên Ứng Dụng
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Vào mục Cá nhân -> Cài đặt hệ thống -> Đổi mật khẩu.
  2. Nhập mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới.
  3. Backend kiểm tra hash cũ, cập nhật hash mới vào CSDL và trả về thông báo thành công.
- **API Endpoints Backend**:
```http
PUT /auth/change-password
```
- **Bảng CSDL PostgreSQL**:
```sql
public.vione_users (password_hash, updated_at)
```
- **Ràng buộc & Ghi chú**: Đảm bảo an toàn tài khoản di động, tự động cập nhật phiên đăng nhập.

---

### 3. [NODE-APP-AUTH-003] Quên Mật Khẩu & Gửi Yêu Cầu Cấp Lại Về CRM
- **Đối tượng sử dụng**: Hội viên quên mật khẩu
- **Luồng nghiệp vụ chi tiết**:
  1. Tại màn đăng nhập, bấm 'Quên mật khẩu?'.
  2. Nhập Email hoặc SĐT đã đăng ký trong danh bạ CLB.
  3. Hệ thống gửi yêu cầu về Trung tâm Thông báo trên Web CRM.
  4. Sau khi Quản trị viên cấp lại mật khẩu mới, hệ thống tự động bắn Email và tin nhắn Zalo OA chứa mật khẩu mới về số điện thoại của hội viên.
  5. Hội viên đăng nhập bằng mật khẩu mới và đổi lại mật khẩu cá nhân.
- **API Endpoints Backend**:
```http
POST /auth/forgot-password
```
- **Bảng CSDL PostgreSQL**:
```sql
public.vione_users (reset_token)
public.notifications (type='FORGOT_PASSWORD_REQUEST')
public.mail_templates (key='RESET_PASSWORD_TEMPLATE')
```
- **Ràng buộc & Ghi chú**: Xử lý khép kín: Hội viên yêu cầu -> Admin phê duyệt -> Tự động nhận mật khẩu qua SMS/Zalo/Email.

---

### 4. [NODE-APP-ONBOARD-001] Đăng Ký Hội Viên Mới & Hồ Sơ Doanh Nghiệp (Member Onboarding)
- **Đối tượng sử dụng**: Doanh nhân đăng ký gia nhập CLB
- **Luồng nghiệp vụ chi tiết**:
  1. Bấm 'Đăng ký gia nhập CLB CEO 1983'.
  2. Điền đầy đủ thông tin chuẩn xác: Họ tên, Email, Số điện thoại, Tên công ty, Mã số thuế, Ngành nghề, Quy mô nhân sự, Vị trí chức danh, Avatar (chụp ảnh trực tiếp hoặc tải từ thư viện máy).
  3. Hệ thống kiểm tra tính duy nhất của Email, SĐT, MST trong CSDL.
  4. Tạo hồ sơ hội viên trạng thái 'PENDING' và gửi cảnh báo về CRM để Ban Thư Ký xét duyệt.
  5. Khi được duyệt, nhận email chào mừng và kích hoạt tài khoản sử dụng app.
- **API Endpoints Backend**:
```http
POST /auth/register
POST /members/onboard
```
- **Bảng CSDL PostgreSQL**:
```sql
public.vione_users (email, phone, role_code='MEMBER')
public.members (full_name, status='PENDING')
public.companies (company_name, tax_code, industry, employee_scale)
public.notifications (type='NEW_MEMBER_REGISTRATION')
```
- **Ràng buộc & Ghi chú**: Lưu trữ 100% dữ liệu đã đăng ký vào CSDL, không bỏ sót trường thông tin.

---

### 5. [NODE-APP-001] Trang Chủ Ticker Nến Realtime & Shortcut Tiện Ích
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Hội viên mở app, trang chủ hiển thị Biểu đồ nến Ticker biến động doanh số B2B realtime.
  2. Hiển thị Banner sự kiện nổi bật và dải phím tắt thông minh (Cơ hội, Danh bạ, Tin nhắn, Sự kiện, Thẻ QR).
  3. Modal chào mừng hội viên cá nhân hóa (WelcomeMemberModal) khi vào app đầu ngày.
  4. Tự động đồng bộ hình nền chủ đề Lễ Hội (--festival-bg-image) từ CRM.
  5. Các nút bấm chuẩn hóa màu nền #FFFFFF với chữ đen sang trọng, dễ đọc.
- **API Endpoints Backend**:
```http
GET /association/home-stats
GET /admin/landing-templates/active
```
- **Bảng CSDL PostgreSQL**:
```sql
public.opportunities (value_amount, created_at)
public.landing_templates (theme_key, festival_bg_url, is_active)
public.members (full_name, avatar_url, points)
```
- **Ràng buộc & Ghi chú**: Trải nghiệm mượt mà 60fps chuẩn native ứng dụng di động.

---

### 6. [NODE-APP-002] Thẻ Hội Viên VIP Số & Mã QR Cá Nhân Bảo Mật
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Thẻ danh thiếp điện tử VIP mang màu sắc nhận diện CLB (Đỏ - Vàng - Xanh Obsidian).
  2. Thông tin: Ảnh đại diện, Họ tên, Chức vụ trong ban, Logo công ty ở góc phải trên.
  3. Mã QR cá nhân hóa độc bản: Chạm vào phóng to toàn màn hình để trao đổi danh thiếp 1 chạm.
  4. Công tắc bật/tắt quyền riêng tư: Ẩn hoặc hiện Số điện thoại và Email khi đối tác quét thẻ.
  5. Tích hợp camera quét nhanh mã QR danh thiếp của đối tác để lưu danh bạ kết nối.
- **API Endpoints Backend**:
```http
GET /association/card-profile
PUT /association/card-privacy
```
- **Bảng CSDL PostgreSQL**:
```sql
public.members (full_name, phone, email, is_phone_private, is_email_private)
public.companies (company_name, logo_url)
public.member_cards (card_code, qr_url)
```
- **Ràng buộc & Ghi chú**: Bảo vệ thông tin liên lạc cá nhân theo cài đặt riêng tư của hội viên.

---

### 7. [NODE-APP-003] Trang Quét Danh Thiếp Công Khai Bảo Mật (Public Web Card)
- **Đối tượng sử dụng**: Đối tác quét mã QR, Khách hàng bên ngoài
- **Luồng nghiệp vụ chi tiết**:
  1. Đối tác quét mã QR trên thẻ số hoặc mở link /card/:code.
  2. Giao diện trang trọng, đồng bộ nhận diện thương hiệu với thẻ nội bộ.
  3. Kiểm tra cài đặt quyền riêng tư: Nếu hội viên ẩn SĐT/Email, hệ thống hiển thị '🔒 Đã ẩn theo cài đặt riêng tư của hội viên'.
  4. Các nút tương tác: 'Lưu Danh Bạ' (tải file vCard .vcf), 'Ghé thăm Website' công ty, 'Đăng ký kết nối'.
- **API Endpoints Backend**:
```http
GET /card/public/:code
```
- **Bảng CSDL PostgreSQL**:
```sql
public.members (full_name, avatar_url, bio, phone, email, is_phone_private, is_email_private)
public.companies (company_name, tax_code, website_url, logo_url, address)
```
- **Ràng buộc & Ghi chú**: Tối ưu tải trang cực nhanh trên mọi trình duyệt di động.

---

### 8. [NODE-APP-004] Danh Bạ Hội Viên & Bản Đồ 2D Google Maps Dẫn Đường
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Danh bạ số 100% doanh nhân thành viên chính thức của CLB.
  2. 2 chế độ hiển thị: Danh sách và Bản đồ 2D.
  3. Bản đồ 2D Google Maps (Leaflet tile mt1.google.com): Ghim vị trí trụ sở công ty các hội viên trên bản đồ với 2 phạm vi 'Tổng thể' và 'Cá nhân'.
  4. Chạm vào ghim xem thông tin doanh nghiệp, ngành nghề và bấm 'Chỉ đường' để kích hoạt Google Maps dẫn đường trực tiếp từ vị trí GPS hiện tại đến công ty đối tác.
  5. Triệt tiêu hoàn toàn lỗi màn hình đen 3D, vận hành mượt mà.
- **API Endpoints Backend**:
```http
GET /association/members
GET /association/members/locations
```
- **Bảng CSDL PostgreSQL**:
```sql
public.members (full_name, avatar_url, phone, department, executive_role)
public.companies (company_name, industry, address, lat, lng)
```
- **Ràng buộc & Ghi chú**: Tích hợp GPS định vị vị trí hiện tại và chỉ đường chính xác theo thời gian thực.

---

### 9. [NODE-APP-005] Cơ Hội Giao Thương B2B Strip 3 Thẻ Ngang
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Màn hình giao thương thiết kế dải 3 thẻ thống kê ngang trực quan: 'Tổng chia sẻ', 'Deal đã chốt', 'Tôi share đi' (tuyệt đối không để biểu đồ nặng).
  2. Đăng cơ hội hợp tác kinh doanh mới: Tiêu đề nhu cầu, Mô tả chi tiết, Trị giá dự kiến, Lĩnh vực ngành nghề.
  3. Hội viên nhận cơ hội bấm tiếp nhận, trao đổi và cập nhật trạng thái (Đang kết nối -> Đàm phán -> Ký kết thành công -> Báo cáo doanh số).
  4. Nút chuyển hướng sang màn hình Thống kê Analytics chuyên sâu.
- **API Endpoints Backend**:
```http
GET /association/opportunities
POST /association/opportunities
PUT /association/opportunities/:id/status
```
- **Bảng CSDL PostgreSQL**:
```sql
public.opportunities (giver_id, receiver_id, title, description, value_amount, status, closed_at)
public.members (full_name, avatar_url)
```
- **Ràng buộc & Ghi chú**: Ghi nhận doanh số chốt deal thực tế phục vụ vinh danh Top Giver của CLB.

---

### 10. [NODE-APP-006] Trung Tâm Thống Kê Hội Viên 5 Phân Loại Nghiệp Vụ
- **Đối tượng sử dụng**: Hội viên Doanh nhân, Ban Điều Hành
- **Luồng nghiệp vụ chi tiết**:
  1. Thống kê hiệu quả hoạt động cá nhân và toàn CLB theo 5 chỉ số: Doanh thu kết nối, Cơ hội trao đi, Tỷ lệ tham dự sự kiện/họp, Khóa đào tạo hoàn thành, Khách mời giới thiệu.
  2. Biểu đồ ComposedChart trực quan cột-đường sinh động.
  3. Bục vinh danh Top 3 Giver được gom gọn trên 1 hàng ngang, Top 1 avatar viền vàng đặc trưng.
  4. Bấm nút xuất báo cáo thành tích ra file Excel hoặc in ấn file A4 PDF.
- **API Endpoints Backend**:
```http
GET /association/opportunities/report
```
- **Bảng CSDL PostgreSQL**:
```sql
public.opportunities (giver_id, receiver_id, value_amount, status)
public.members (full_name, avatar_url)
public.event_registrations (member_id, check_in_status)
```
- **Ràng buộc & Ghi chú**: Thiết kế chuẩn Mobile-first, hiển thị sắc nét trên mọi thiết bị di động.

---

### 11. [NODE-APP-007] Giao Thương B2B, Gian Hàng Của Tôi & Danh Mục Quan Tâm
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Đổi tên danh mục 'Sàn giao thương nội bộ' và 'Chợ giao thương' thành tên chuẩn mực: 'Giao thương'.
  2. Sàn Giao thương: Trưng bày sản phẩm/dịch vụ của các doanh nghiệp thành viên. Lọc theo ngành nghề, tìm kiếm nhanh và nút bấm nhắn tin trực tiếp với chủ doanh nghiệp.
  3. Gian hàng của tôi: Mỗi doanh nghiệp được đăng tối đa 5 sản phẩm/dịch vụ (huy hiệu X/5 sản phẩm để chống spam).
  4. Mỗi thẻ sản phẩm có Icon 3 chấm bấm vào mở Menu tùy chọn tinh gọn: Chỉnh sửa sản phẩm, Xóa sản phẩm, Chia sẻ liên kết sản phẩm.
  5. Đặc biệt có Danh mục 'Ai đang quan tâm sản phẩm': Hiển thị danh sách chính xác các hội viên đã bấm quan tâm hoặc gửi yêu cầu kết nối với sản phẩm của chính tài khoản đó đăng.
- **API Endpoints Backend**:
```http
GET /association/products
POST /association/products
PUT /association/products/:id
DELETE /association/products/:id
GET /association/products/:id/interested-users
```
- **Bảng CSDL PostgreSQL**:
```sql
public.products (company_id, member_id, name, description, price, discount_price, image_urls, category, status)
public.product_interests (product_id, interested_member_id, note, created_at)
public.members (full_name, phone, email, avatar_url)
public.companies (company_name, logo_url)
```
- **Ràng buộc & Ghi chú**: Menu 3 chấm tinh tế tiết kiệm diện tích và cung cấp danh mục khách hàng tiềm năng nội bộ.

---

### 12. [NODE-APP-008] Sự Kiện & Hoạt Động (Đăng Ký Vé, Tải Poster & Up Ảnh Trực Tiếp)
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Đổi tên giao diện thành 'Sự kiện & Hoạt động'.
  2. Phân loại chuẩn 2 tab danh mục: Tab Sự kiện (Gala, Đại hội, Tọa đàm) và Tab Hoạt động (Kết nối B2B giữa 2 tài khoản, Chương trình đào tạo từ CRM). Loại bỏ các tab trùng lặp.
  3. Chuẩn hóa hiển thị: Duy nhất 1 nút 'Xem tất cả' và nút này tự động ẩn đi khi đang chọn ở tab 'Tất cả'.
  4. Hội viên bấm 'Đăng ký tham gia' nhận vé điện tử kèm mã QR check-in.
  5. Có chức năng 'Tải poster' đối với các sự kiện chính thức.
  6. Trong quá trình diễn ra sự kiện, có nút 'Tải ảnh' hoặc 'Chụp ảnh trực tiếp' từ điện thoại để đính kèm vào sự kiện (giới hạn tối đa 5 ảnh, có tính năng up video), lưu vào lịch sử sự kiện và tự động đẩy bài sang màn hình Mạng lưới.
- **API Endpoints Backend**:
```http
GET /association/events-and-meetings
POST /events/:id/register
POST /events/:id/cancel
POST /events/:id/media
GET /events/:id/my-ticket
```
- **Bảng CSDL PostgreSQL**:
```sql
public.events (title, banner_url, poster_url, start_date, end_date, location, status)
public.meetings (title, meeting_date)
public.trainings (title, start_time)
public.event_registrations (event_id, member_id, ticket_code, status)
public.feed_posts (type='EVENT_MEDIA', media_urls, author_id)
```
- **Ràng buộc & Ghi chú**: Nút chụp ảnh trực tiếp và đăng tải ảnh tư liệu đa phương tiện trong sự kiện.

---

### 13. [NODE-APP-009] Biểu Quyết Trực Tuyến Gắn Với Sự Kiện / Cuộc Họp
- **Đối tượng sử dụng**: Hội viên Doanh nhân tham dự
- **Luồng nghiệp vụ chi tiết**:
  1. Danh sách các phiên biểu quyết, bầu cử đang mở gắn liền với Sự kiện hoặc Cuộc họp mà hội viên tham gia.
  2. Hội viên đọc nội dung tờ trình, chọn phương án tán thành/không tán thành/ý kiến khác.
  3. Bấm 'Gửi phiếu biểu quyết', hệ thống ghi nhận phiếu bầu vào CSDL PostgreSQL.
  4. Cập nhật tỷ lệ phần trăm (%) biểu quyết thời gian thực trên màn hình ứng dụng và màn hình chiếu lớn tại sự kiện.
- **API Endpoints Backend**:
```http
GET /association/polls
POST /association/polls/:id/vote
```
- **Bảng CSDL PostgreSQL**:
```sql
public.polls (event_id, meeting_id, title, is_active)
public.poll_options (option_text, vote_count)
public.poll_votes (poll_id, option_id, member_id, voted_at)
```
- **Ràng buộc & Ghi chú**: Mỗi hội viên chỉ được bỏ phiếu một lần duy nhất cho mỗi phiên biểu quyết.

---

### 14. [NODE-APP-010] Bảng Tin Mạng Lưới Doanh Nhân & Tương Tác Xã Hội
- **Đối tượng sử dụng**: Toàn thể Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Mạng xã hội doanh nhân CEO 1983: Hội viên đăng bài viết chia sẻ kinh nghiệm điều hành, kết nối kinh doanh, đính kèm hình ảnh và video.
  2. Tương tác đa dạng: Thả cảm xúc (Like, Tym, Claps), Bình luận trao đổi dưới bài viết.
  3. Tiếp nhận các bài phát thanh tự động từ CRM ('Bắn Mạng Lưới' từ Sự kiện, Cuộc họp, Khóa đào tạo).
  4. Đặc thù bảo mật: Khi bài viết có mã QR tham dự/điểm danh, hệ thống tự động hiển thị dưới dạng đường link an toàn, không hiển thị mã QR thô trên màn hình Mạng lưới.
  5. Hiển thị huy hiệu điểm danh '@HọTên [✓ Đã Check-in]' tạo không khí sôi động.
- **API Endpoints Backend**:
```http
GET /association/feed
POST /association/feed/posts
POST /association/feed/posts/:id/comments
POST /association/feed/posts/:id/react
DELETE /association/feed/posts/:id
```
- **Bảng CSDL PostgreSQL**:
```sql
public.feed_posts (author_id, type, title, content, link_url, media_urls, likes_count, comments_count)
public.feed_comments (post_id, author_id, content)
public.feed_reactions (post_id, member_id, reaction_type)
```
- **Ràng buộc & Ghi chú**: Mã QR được hiển thị dưới dạng đường link bảo mật trên màn Mạng lưới.

---

### 15. [NODE-APP-011] Hồ Sơ Cá Nhân & Quản Trị Hồ Sơ Doanh Nghiệp Thành Viên
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Quản lý thông tin hồ sơ cá nhân 360 độ: Ảnh đại diện, Họ tên, Ngày sinh, Giới tính, Số điện thoại, Email, Tiểu sử lãnh đạo.
  2. Hồ sơ Doanh nghiệp thành viên: Logo, Tên doanh nghiệp, Mã số thuế, Ngành nghề, Quy mô vốn/nhân sự, Trụ sở, Sản phẩm dịch vụ chủ lực.
  3. Xem Hợp đồng hội viên điện tử, tình trạng đóng hội phí niên liễm và thẻ VIP liên kết.
  4. Tải lên và cập nhật ảnh đại diện sắc nét thông qua camera điện thoại.
- **API Endpoints Backend**:
```http
GET /association/profile
PUT /association/profile
POST /upload/avatar
```
- **Bảng CSDL PostgreSQL**:
```sql
public.members (full_name, avatar_url, bio, phone, email, dues_expired_at)
public.companies (company_name, tax_code, industry, employee_scale, website_url, logo_url)
public.vione_users (email)
```
- **Ràng buộc & Ghi chú**: Lấy chuẩn 100% dữ liệu đã đăng ký của hội viên từ CSDL, không bị thiếu sót trường.

---

### 16. [NODE-APP-012] Cài Đặt Hệ Thống, Bảo Mật Tài Khoản & Hỗ Trợ 24/7
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Tùy chỉnh ngôn ngữ hiển thị (Tiếng Việt / English), chuyển đổi giao diện Sáng / Tối (Light/Dark mode).
  2. Quản lý cấu hình thông báo đẩy (Bật/tắt thông báo sự kiện, tin nhắn, nhắc hẹn).
  3. Đổi mật khẩu bảo mật tài khoản di động.
  4. Khối Thông tin hỗ trợ 24/7: Hotline Ban Thư Ký CLB, Email tiếp nhận phản hồi và Hướng dẫn sử dụng app.
- **API Endpoints Backend**:
```http
PUT /auth/change-password
GET /system/support-info
```
- **Bảng CSDL PostgreSQL**:
```sql
public.vione_users (password_hash)
public.system_settings (key='support_contact', value_json)
```
- **Ràng buộc & Ghi chú**: Hỗ trợ thay đổi mật khẩu và quản lý bảo mật cá nhân thuận tiện.

---

### 17. [NODE-APP-013] Kho Ưu Đãi Đặc Quyền Doanh Nhân (VIP Perks) & Mã QR Động
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Kho đặc quyền ưu đãi dành riêng cho hội viên CEO 1983 do các doanh nghiệp thành viên và đối tác tài trợ cung cấp (Nhà hàng cao cấp, Khách sạn nghỉ dưỡng, Dịch vụ phòng vé, Tư vấn luật, Golf).
  2. Xem chi tiết ưu đãi, điều kiện áp dụng và địa điểm sử dụng kèm liên kết mở Google Maps chỉ đường trực tiếp.
  3. Mỗi ưu đãi cung cấp một mã QR động để nhân viên tại điểm chấp nhận ưu đãi quét xác thực quyền lợi VIP.
- **API Endpoints Backend**:
```http
GET /association/perks
GET /association/perks/:id/qr
```
- **Bảng CSDL PostgreSQL**:
```sql
public.perks (title, provider_company_id, discount_percent, description, location_address, lat, lng, valid_until, qr_code_secret, is_active)
public.companies (company_name, logo_url)
```
- **Ràng buộc & Ghi chú**: Mã QR động thay đổi theo thời gian đảm bảo tính xác thực của ưu đãi.

---

### 18. [NODE-APP-014] Cầu Nối Native Capacitor (Android/iOS) & Push Notifications
- **Đối tượng sử dụng**: Hội viên Doanh nhân sử dụng App Native
- **Luồng nghiệp vụ chi tiết**:
  1. Cầu nối Native Capacitor tích hợp trên nền tảng Android (APK/AAB) và iOS (IPA).
  2. Tối ưu hóa giao diện di động: Tương thích vùng an toàn (Safe Area), thanh trạng thái (StatusBar) và phím Back cứng trên Android.
  3. Đăng ký nhận thông báo đẩy qua Firebase Cloud Messaging (FCM) và Web Push Service Worker.
  4. Khi có sự kiện mới, nhắc hẹn lịch họp, tin nhắn kết nối hoặc giao việc khẩn cấp, máy chủ tự động bắn Push Notification hiển thị trên màn hình khóa điện thoại.
- **API Endpoints Backend**:
```http
POST /notifications/subscribe
POST /notifications/unsubscribe
POST /notifications/test-push
```
- **Bảng CSDL PostgreSQL**:
```sql
public.user_push_tokens (user_id, device_token, platform, is_active)
public.notifications (user_id, title, content, is_read)
```
- **Ràng buộc & Ghi chú**: Cung cấp trải nghiệm mượt mà 100% giống ứng dụng native thuần túy.

---

### 19. [NODE-APP-015] Gặp Gỡ Kết Nối B2B 1-on-1 Giữa Hai Tài Khoản
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Phân hệ kết nối chuyên sâu giữa 2 hội viên: Hội viên tra cứu đối tác phù hợp trong danh bạ và bấm 'Đặt lịch hẹn kết nối 1-on-1'.
  2. Chọn ngày giờ gặp, hình thức (Gặp trực tiếp tại công ty, Cafe kết nối, hoặc Video Call online) và nội dung trao đổi mong muốn.
  3. Đối tác nhận được lời mời: Có thể Chấp nhận, Từ chối kèm lý do hoặc Đề xuất dời lịch hẹn.
  4. Sau buổi gặp, hai bên cập nhật kết quả trao đổi và ghi nhận giá trị cơ hội hợp tác phát sinh.
- **API Endpoints Backend**:
```http
GET /association/b2b-connect/my-meetings
POST /association/b2b-connect/request
PATCH /association/b2b-connect/:id/status
POST /association/b2b-connect/:id/result
```
- **Bảng CSDL PostgreSQL**:
```sql
public.b2b_connections (sender_id, receiver_id, scheduled_at, location_type, location_detail, agenda, status, result_notes, deal_value)
public.members (full_name, avatar_url)
```
- **Ràng buộc & Ghi chú**: Tự động đồng bộ lịch hẹn 1-on-1 đã xác nhận vào Lịch hoạt động cá nhân.

---

### 20. [NODE-APP-016] Đào Tạo Di Động & Phòng Họp Video Call Trực Tuyến
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Danh sách các khóa đào tạo nâng cao năng lực quản trị doanh nghiệp từ Ban Đào Tạo CLB.
  2. Xem chi tiết lộ trình học, thông tin chuyên gia giảng dạy và tài liệu bài giảng số (file PDF/Word).
  3. Bấm 'Vào phòng học trực tuyến': Ứng dụng kích hoạt giao diện phòng họp Video Call trực tiếp trong app (nhúng Jitsi Meet SDK/WebRTC), hỗ trợ đầy đủ mic, camera, chat, giơ tay phát biểu mà không cần cài đặt phần mềm bên ngoài.
- **API Endpoints Backend**:
```http
GET /association/trainings
POST /trainings/:id/register
GET /trainings/:id/room-token
```
- **Bảng CSDL PostgreSQL**:
```sql
public.trainings (title, instructor_name, start_time, end_time, room_url, syllabus_url)
public.training_attendees (training_id, member_id, status)
```
- **Ràng buộc & Ghi chú**: Tham gia lớp học trực tuyến mượt mà ngay trên thiết bị di động.

---

### 21. [NODE-APP-017] Lịch Hoạt Động & Báo Thức Nhắc Hẹn Đa Kênh Tự Động
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Mọi Sự kiện CLB, Cuộc họp Ban chuyên môn, Khóa đào tạo và Cuộc gặp B2B 1-on-1 mà hội viên đã đăng ký/chấp nhận tham gia đều được TỰ ĐỘNG LƯU VÀO LỊCH HOẠT ĐỘNG.
  2. Cung cấp 2 chế độ xem giao diện linh hoạt: Dạng Lưới lịch tháng (Grid Calendar) và Dạng Danh sách dòng thời gian (Timeline List).
  3. Nút 'Bật nhắc' (click lần 2 để bỏ nhắc) cho từng hoạt động.
  4. Hệ thống Active Reminder Engine hoạt động tự động:
     - Nhắc hẹn tại Popup chào mừng ngay lần đầu mở app trong ngày.
     - Bắn thông báo đẩy vào Trung tâm Thông báo trên app.
     - Rung chuông phát thông báo Toast native trên màn hình điện thoại khi sắp đến giờ diễn ra hoạt động.
- **API Endpoints Backend**:
```http
GET /association/calendar/my-schedule
POST /association/calendar/toggle-reminder
```
- **Bảng CSDL PostgreSQL**:
```sql
public.events (title, start_date)
public.meetings (title, meeting_date)
public.trainings (title, start_time)
public.b2b_connections (scheduled_at)
public.calendar_reminders (member_id, activity_type, activity_id, is_reminder_enabled, reminded_today)
```
- **Ràng buộc & Ghi chú**: Tích hợp đồng bộ tự động 4 nguồn hoạt động và nhắc hẹn đa tầng thông minh.

---

### 22. [NODE-APP-EXT-001] Quét Mã QR Sự Kiện Vãng Lai & Luồng Tự Động Gửi Email Khi QR Hết Hạn / Bị Xóa
- **Đối tượng sử dụng**: Khách mời vãng lai quét mã QR từ Poster, Mạng xã hội, Email hoặc Zalo
- **Luồng nghiệp vụ chi tiết**:
  1. Khách quét mã QR sự kiện/đào tạo (được in trên banner standee, chia sẻ trên mạng xã hội hoặc gửi qua email/Zalo), trình duyệt mở trang đăng ký vé khách (/guest-event-register/$eventId).
  2. Cơ chế kiểm tra an toàn mã QR (QR Safety Guard):
     - Nếu sự kiện/khóa đào tạo đã bị ban tổ chức XÓA khỏi hệ thống, hoặc mã QR ĐÃ HẾT HẠN, hoặc ĐÃ THAY ĐỔI:
     - Khi khách bấm gửi biểu mẫu đăng ký, hệ thống lập tức chặn lại và tự động kích hoạt mail.service.ts (hàm sendQrChangedOrExpiredEmail) gửi ngay một email thông báo lịch sự tới hòm thư của khách: thông báo sự kiện đã thay đổi/mã QR không còn sử dụng được, đồng thời cung cấp thông tin liên hệ Ban Thư Ký CLB nếu muốn biết thêm chi tiết.
     - Đồng thời trên màn hình đăng ký hiển thị thông báo trạng thái trang trọng, rõ ràng.
  3. Nếu mã QR còn hiệu lực hợp lệ:
     - Hệ thống lưu thông tin đăng ký vào CSDL, sinh mã vé điện tử QR độc bản và tự động gửi email xác nhận tham dự kèm vé (sendEventTicketEmail) tới hộp thư của khách.
- **API Endpoints Backend**:
```http
GET /public/events/:id/details
POST /events/:id/guest-register
```
- **Bảng CSDL PostgreSQL**:
```sql
public.events (title, start_date, location, status, is_deleted)
public.event_registrations (guest_name, guest_email, guest_phone, ticket_code, check_in_status)
public.mail_templates (key='QR_EXPIRED_OR_CHANGED' | 'EVENT_TICKET_CONFIRMATION')
```
- **Ràng buộc & Ghi chú**: Triệt tiêu hoàn toàn rủi ro quét nhầm mã QR cũ hoặc sự kiện đã hủy; tự động chăm sóc và hướng dẫn khách qua email.

---

