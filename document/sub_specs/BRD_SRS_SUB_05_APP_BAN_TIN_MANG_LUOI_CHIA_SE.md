# TÀI LIỆU ĐẶC TẢ PHÂN HỆ 05: BẢN TIN DIỄN ĐÀN, MẠNG LƯỚI HỘI VIÊN, OPENGRAPH CHIA SẺ & TỐI ƯU TÌM KIẾM
**Hệ thống:** Cổng Quản Trị Web CRM & Mobile App CLB Doanh Nhân CEO 1983 (HanoiBA)  
**Phiên bản:** 8.0 — Cập nhật chuẩn hóa Kiến trúc & Dữ liệu thực nghiệm  
**Mã phân hệ:** `[SUB-SPEC-05]` (Ánh xạ `[NODE-APP-001]`, `[NODE-APP-005]`, `[NODE-APP-012]`)

---

## 1. TỔNG QUAN NGHIỆP VỤ (BUSINESS REQUIREMENTS - BRD)
### 1.1. Mục tiêu nghiệp vụ
- Tạo không gian kết nối xã hội số văn minh, tin cậy cho cộng đồng doanh nhân CEO 1983: Đăng tải bài viết chia sẻ kinh nghiệm quản trị, tin tức hoạt động CLB và giới thiệu đối tác.
- Đảm bảo tính lan tỏa truyền thông ra các nền tảng mạng xã hội lớn (Facebook, Zalo, LinkedIn): Khi hội viên bấm chia sẻ bài viết, liên kết khi gửi lên Facebook/Zalo phải giữ trọn vẹn tiêu đề, ảnh banner và tóm tắt nội dung thông qua thẻ OpenGraph tiêu chuẩn.
- Ngược lại, khi hội viên dán link bài viết từ bên ngoài (Facebook, Báo chí, Web) vào App CEO 1983, hệ thống phải tự động bóc tách và hiển thị khung thẻ xem trước (Link Preview Card) đẹp mắt.
- Tối ưu hóa trải nghiệm tìm kiếm: Triệt tiêu hoàn toàn hiện tượng gọi API liên tục khi người dùng gõ từng ký tự hoặc phím Space trên thanh tìm kiếm.

---

## 2. ĐẶC TẢ YÊU CẦU PHẦN MỀM (SOFTWARE REQUIREMENTS - SRS)
### 2.1. Yêu cầu chức năng OpenGraph & Chia sẻ Liên kết Hai chiều
- **FR-05.1 (OpenGraph Dynamic Metadata Backend)**:
  - Controller `app.controller.ts` xử lý route công khai `/share/:type/:id` (hoặc `/association/opportunities/:id`, `/association/products/:id`).
  - Truy vấn trực tiếp tiêu đề, ảnh banner và mô tả từ CSDL PostgreSQL.
  - Trả về mã nguồn HTML chuẩn SEO chứa đầy đủ các thẻ:
    - `<meta property="og:title" content="...">`
    - `<meta property="og:description" content="...">`
    - `<meta property="og:image" content="...">`
    - `<meta property="og:url" content="...">`
    - `<meta property="og:type" content="article">`
    - `<meta name="twitter:card" content="summary_large_image">`
- **FR-05.2 (Hiển thị Bài viết Chia sẻ từ Bên ngoài vào App)**:
  - Khi tạo bài viết chứa liên kết ngoài (`externalLink` hoặc `sharedArticle`), frontend hiển thị khung Card phong cách Facebook Share Card với ảnh thumbnail, tên miền nguồn viết hoa và tiêu đề bài viết.
  - Sửa lỗi ép kiểu `text[]` cho `image_urls` trong `feed.service.ts` tránh lỗi PostgreSQL `42804`.

### 2.2. Tối ưu hóa Tìm kiếm Debounce & Bộ nhớ đệm (Search Optimization)
- **FR-05.3 (Cơ chế Debounce 350ms)**:
  - Tại thanh tìm kiếm Mạng lưới & Bản tin, áp dụng `useDebounce(searchQuery, 350)`: Chỉ khi người dùng dừng gõ 350ms thì mới thực thi lọc hoặc gửi API.
  - Triệt tiêu 100% tình trạng spam request API mỗi khi nhập 1 ký tự hoặc bấm dấu cách (Space).
- **FR-05.4 (Bộ nhớ đệm Bình luận - Comment Caching)**:
  - Không refetch lại danh sách bình luận của các bài viết đã có sẵn trong state khi người dùng tìm kiếm, giúp giao diện mượt mà và không giật lag.

### 2.3. Chuẩn hóa Tiêu đề Màn hình Mạng Lưới
- **FR-05.5 (Tiêu đề Mạng Lưới Chuẩn Xác)**:
  - Đặt tiêu đề hiển thị chuẩn tại header và document title: **"Mạng Lưới Hội Viên & Bản Tin Doanh Nhân CEO 1983"**.

