# TÀI LIỆU YÊU CẦU NGHIỆP VỤ (BRD)
## PHÂN HỆ BẢN TIN MẠNG LƯỚI, BÌNH LUẬN DẠNG CÂY & THẺ ĐIỆN TỬ HỘI VIÊN (SUB-05)
**HỆ THỐNG QUẢN TRỊ HIỆP HỘI DOANH NHÂN CEO 1983 (HANOIBA)**

---

### THÔNG TIN TÀI LIỆU
- **Mã tài liệu:** `CEO1983-BRD-SUB-05`
- **Phân hệ mục tiêu:** Bản tin Mạng lưới Doanh nhân, Tương tác Bình luận Đa cấp (Tree Comments), Thẻ Danh thiếp Điện tử & Chia sẻ Đa nền tảng
- **Đối tượng sử dụng:** Toàn thể Hội viên Doanh nhân CEO 1983, Ban Thư ký, Ban Truyền thông
- **Ngày ban hành:** 06/11/2026 (Phiên bản 5.2 - Chuẩn hóa Nghiệp vụ Mạng lưới)

---

### 1. BỐI CẢNH & TẦM NHÌN NGHIỆP VỤ

#### 1.1 Tầm nhìn Mạng xã hội Doanh nhân Nội bộ
Hiệp hội Doanh nhân CEO 1983 cần một không gian truyền thông nội bộ văn minh, trang trọng và đẳng cấp, nơi các chủ doanh nghiệp có thể:
- Chia sẻ tin tức thành tựu, kỷ niệm ngày thành lập doanh nghiệp, sự kiện khai trương, ký kết hợp tác.
- Bình luận, trao đổi ý kiến, phản hồi các chủ đề giao thương theo luồng rõ ràng, chuyên nghiệp tương tự các mạng xã hội hiện đại như Facebook hay LinkedIn nhưng hoàn toàn riêng tư cho hiệp hội.
- Sử dụng Thẻ Doanh nhân Điện tử tích hợp mã định danh để kết nối nhanh chóng tại các kỳ đại hội và sự kiện kết nối trực tiếp.

#### 1.2 Những vấn đề người dùng phản ánh cần hoàn thiện
1. **Trải nghiệm Bình luận bị hạn chế:**
   - Trước đây, người dùng không xem được tất cả các bình luận, bình luận mới hay bị trôi xuống dưới.
   - Chưa hỗ trợ phản hồi phân nhánh theo dạng cây (Tree Reply), làm cho các đoạn hội thoại trao đổi nghiệp vụ bị lẫn lộn.
   - Thiếu thao tác giữ lâu hoặc menu ba chấm để người dùng tự sửa hoặc xóa bình luận của mình khi có sai sót.
2. **Bất cập trong việc Nhắc tên Đồng nghiệp (`@tag`):**
   - Trước đây xuất hiện nút bấm `@` rườm rà trên thanh công cụ.
   - Danh sách gợi ý nhắc tên lấy ra toàn bộ thành viên trong hệ thống dù chưa kết nối, gây phiền hà.
   - Cần tối ưu để khi người dùng gõ ký tự `@`, hệ thống chỉ hiển thị danh sách những người đã kết nối trong vòng tròn bạn bè giao thương, hỗ trợ chọn nhiều người và có nút bấm hủy chọn nhanh. Người được nhắc tên phải nhận được thông báo ngay lập tức.
3. **Thẩm mỹ Nút bấm & Nhận diện Thương hiệu:**
   - Các nút màu biến chuyển sặc sỡ (gradient) không phù hợp phong cách điềm đạm của doanh nhân 1983. Cần chuyển toàn bộ về màu xanh đậm doanh nhân thanh lịch.
4. **Chia sẻ Bài viết Ra Mạng Xã Hội:**
   - Khi chia sẻ bài viết từ câu lạc bộ ra Facebook hay Zalo, bài viết phải giữ nguyên vẹn tiêu đề, hình ảnh minh họa sắc nét và tóm tắt nội dung, không bị rỗng hình hay vỡ giao diện.

---

### 2. CHÂN DUNG NGƯỜI DÙNG & VAI TRÒ TÁC NGHIỆP

| Nhóm Người dùng | Hành vi Nghiệp vụ | Kỳ vọng Nghiệp vụ |
| :--- | :--- | :--- |
| **Hội viên Doanh nhân** | Đăng bài viết chia sẻ kinh nghiệm, cập nhật thành tựu công ty, bình luận phân nhánh, nhắc tên đối tác thân thiết, quét thẻ kết nối danh thiếp. | Trải nghiệm mượt mà, văn minh, kết nối đúng đối tác tin cậy. |
| **Hội viên Tiêu biểu / Diễn giả** | Khởi xướng các chủ đề chuyên sâu, trả lời phân nhánh cho từng hội viên tham gia thảo luận. | Quản lý luồng thảo luận mạch lạc, nâng cao uy tín cá nhân. |
| **Ban Quản trị Nội dung** | Duyệt bài viết, xóa các bình luận khiếm nhã hoặc vi phạm quy chế sinh hoạt hiệp hội. | Giữ gìn môi trường mạng xã hội lành mạnh, bảo vệ hình ảnh HANOIBA. |

---

### 3. QUY TRÌNH NGHIỆP VỤ CHI TIẾT (BUSINESS WORKFLOWS)

#### 3.1 Quy trình Bình luận Phân nhánh & Nhắc Tên Đối tác (`@tag`)
```
[Hội viên Xem Bài Viết / Báo Cáo Thống Kê]
       │
       ▼
1. Mở xem toàn bộ danh sách bình luận (Sắp xếp theo thứ tự ưu tiên trao đổi)
       │
       ▼
2. Nhập nội dung bình luận vào ô soạn thảo:
       │
       ├─► Gõ ký tự "@" trực tiếp trên bàn phím
       │     • Hệ thống tự động gợi ý danh sách đối tác ĐÃ KẾT NỐI
       │     • Có thể chọn 1 hoặc nhiều người (hiển thị thẻ tên kèm nút [x] để xóa nhanh)
       │
       ▼
3. Gửi Bình luận:
       │
       ├─► Bình luận mới lập tức hiển thị nổi bật ở đầu luồng
       └─► Những người được nhắc tên nhận ngay thông báo: "[Họ Tên] đã nhắc đến bạn trong một bình luận"
       │
       ▼
4. Tác vụ Quản lý Bình luận của Tôi:
       │
       ├─► Nhấn giữ hoặc bấm vào biểu tượng [...] bên cạnh bình luận
       ├─► Chọn "Chỉnh sửa" -> Cập nhật nội dung
       └─► Chọn "Xóa bình luận" -> Xác nhận xóa khỏi hệ thống
```

#### 3.2 Quy trình Chia sẻ Bài viết & Thẻ Doanh nhân Ra Mạng xã hội Ngoài
```
[Hội viên Mở Bài Viết / Thẻ Doanh nhân]
       │
       ▼
1. Bấm nút "Chia sẻ ra bên ngoài"
       │
       ▼
2. Chọn Nền tảng Đích (Facebook hoặc Zalo)
       │
       ▼
3. Xem trước thẻ đại diện bài viết:
       │     • Tiêu đề bài viết trọn vẹn, không bị mất chữ
       │     • Ảnh đại diện rõ nét, tỷ lệ chuẩn vàng
       │     • Tên thương hiệu "CLB Doanh nhân CEO 1983 - HANOIBA"
       │
       ▼
4. Xác nhận đăng lên Bảng tin cá nhân hoặc Nhóm doanh nghiệp
```

---

### 4. BỘ QUY TẮC NGHIỆP VỤ (BUSINESS RULES)

1. **Quy tắc Kiểm soát Quyền riêng tư Nhắc tên:**
   - Tuyệt đối không cho phép người dùng tự do nhắc tên toàn bộ danh bạ nếu chưa thiết lập quan hệ kết nối bạn bè/giao thương. Điều này nhằm ngăn chặn hành vi quấy rầy và quảng cáo rác trong nội bộ.
2. **Quy tắc Phân cấp Bình luận:**
   - Hệ thống cho phép tối đa 3 cấp phản hồi thụt lề để đảm bảo giao diện di động không bị vỡ hoặc quá hẹp trên màn hình điện thoại thông minh.
   - Bình luận của tác giả bài viết được gắn huy hiệu nhỏ để người đọc dễ nhận biết câu trả lời chính thức.
3. **Quy tắc Thẩm mỹ Nút bấm:**
   - Toàn bộ các nút hành động (Đăng bài, Gửi bình luận, Lưu thay đổi, Kết nối) sử dụng màu xanh đậm doanh nhân đơn sắc, loại bỏ hoàn toàn dải màu cầu vồng/gradient gây chói mắt.
4. **Quy tắc Đồng bộ Giao diện giữa Mạng Lưới & Thống Kê:**
   - Giao diện bình luận trao đổi tại màn hình Chi tiết Báo cáo Thống kê Giao thương phải tuân thủ 100% các tính năng của Mạng lưới (bình luận dạng cây, thao tác ba chấm, nhắc tên đối tác kết nối).

---

### 5. CHỈ SỐ ĐO LƯỜNG HIỆU QUẢ HOẠT ĐỘNG (KPIS)
- **Tỷ lệ Tương tác Phản hồi:** Đạt trên 70% các bài đăng trên mạng lưới có phản hồi trao đổi dạng cây.
- **Tốc độ Nhận Thông báo Nhắc tên:** Người được gắn thẻ nhận được thông báo đẩy trong vòng dưới 1 giây.
- **Mức độ Hài lòng về Giao diện:** 95% hội viên đánh giá giao diện màu xanh doanh nhân mang lại cảm giác trang trọng, chuyên nghiệp hơn phiên bản cũ.

