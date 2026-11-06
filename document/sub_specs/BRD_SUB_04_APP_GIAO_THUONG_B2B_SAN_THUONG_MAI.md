# TÀI LIỆU YÊU CẦU NGHIỆP VỤ (BRD)
## PHÂN HỆ GIAO THƯƠNG B2B, SÀN THƯƠNG MẠI & LÊN LỊCH HẸN 1-ON-1 (SUB-04)
**HỆ THỐNG QUẢN TRỊ HIỆP HỘI DOANH NHÂN CEO 1983 (HANOIBA)**

---

### THÔNG TIN TÀI LIỆU
- **Mã tài liệu:** `CEO1983-BRD-SUB-04`
- **Phân hệ mục tiêu:** Giao thương B2B, Sàn Sản phẩm & Dịch vụ Doanh nghiệp, Kết nối Lịch hẹn 1-on-1 Doanh nhân
- **Đối tượng sử dụng:** Hội viên Doanh nhân CEO 1983, Ban Xúc tiến Thương mại, Ban Thư ký
- **Ngày ban hành:** 06/11/2026 (Phiên bản 5.2 - Chuẩn hóa Nghiệp vụ Giao thương)

---

### 1. BỐI CẢNH & TẦM NHÌN NGHIỆP VỤ

#### 1.1 Tầm nhìn Giao thương CEO 1983
CLB Doanh nhân CEO 1983 được thành lập với tôn chỉ hành động: *"Gắn kết tình bạn - Đồng hành kinh doanh - Phụng sự cộng đồng"*. Trong đó, xúc tiến thương mại nội khối là trụ cột sinh tồn và thước đo giá trị hàng đầu của tổ chức.
Hội viên tham gia câu lạc bộ với mong muốn:
- Tìm kiếm đối tác cung ứng uy tín cùng chung thế hệ 1983.
- Chào bán các sản phẩm, giải pháp và dịch vụ thế mạnh của doanh nghiệp mình.
- Trao đổi cơ hội kinh doanh (Business Opportunity Referral) với giá trị thực tế hàng trăm triệu đến hàng chục tỷ đồng.
- Xúc tiến gặp gỡ trực tiếp 1-on-1 để bàn bạc hợp tác chiến lược.

#### 1.2 Những điểm nghẽn nghiệp vụ cần giải quyết
1. **Thiếu cơ chế hiển thị giá trị ngân sách chuẩn mực:** Trước đây, các bài đăng cơ hội thường nhập số liệu tùy tiện, giao diện hiển thị nhầm lẫn đơn vị (như hiển thị sai định dạng tỷ đồng hoặc ghi chữ "/tỷ" gây khó hiểu cho người xem). Khi người dùng sửa thông tin giá trị cơ hội hoặc sản phẩm, giao diện không tự cập nhật dữ liệu mới nhất.
2. **Quy trình Lên lịch hẹn 1-on-1 bị ngắt quãng:** Khi một hội viên muốn gặp gỡ đối tác từ một sản phẩm trên sàn hoặc từ một bài đăng cơ hội, họ phải thoát ra, tìm số điện thoại hoặc mở ứng dụng nhắn tin bên ngoài để hẹn gặp. Điều này làm mất dấu vết giao thương và giảm tỷ lệ chốt hợp tác.
3. **Thiếu tin nhắn tự động xác nhận lịch hẹn:** Sau khi thiết lập lịch hẹn thành công, đối tác không nhận được thông báo rõ ràng trong hộp thư hội thoại, dẫn đến việc quên lịch hoặc không chuẩn bị nội dung trao đổi.

---

### 2. CHÂN DUNG NGƯỜI DÙNG & VAI TRÒ TÁC NGHIỆP

| Nhóm Người dùng | Quyền hạn & Hành vi Nghiệp vụ | Lợi ích Mang lại |
| :--- | :--- | :--- |
| **Hội viên Doanh nhân Chính thức** | Đăng cơ hội hợp tác, niêm yết sản phẩm thương mại, tìm kiếm đối tác, gửi yêu cầu hẹn gặp 1-on-1, trao đổi trong luồng đàm phán. | Tiếp cận thị trường nội khối 500+ doanh nghiệp uy tín, gia tăng doanh số. |
| **Hội viên Tiêu biểu / Ban Điều hành** | Ưu tiên hiển thị sản phẩm nổi bật, bảo trợ giao thương cho các thương vụ lớn, cố vấn kết nối liên ngành. | Khẳng định vị thế thủ lĩnh, dẫn dắt các tập đoàn kinh tế nội bộ. |
| **Ban Xúc tiến Thương mại** | Theo dõi dòng chảy cơ hội, hỗ trợ kết nối các cặp doanh nghiệp có nhu cầu tương hỗ, xác nhận giá trị hợp đồng thành công. | Nắm bắt chính xác chỉ số đóng góp kinh tế của toàn hiệp hội. |

---

### 3. QUY TRÌNH NGHIỆP VỤ CHI TIẾT (BUSINESS WORKFLOWS)

#### 3.1 Quy trình Đăng tải & Cập nhật Cơ hội Giao thương (Business Opportunity)
```
[Doanh nhân Có Nhu Cầu]
       │
       ▼
1. Bấm "Tạo Cơ Hội Giao Thương"
       │
       ├─► Chọn Phân loại: Cần Mua (Bên Mua) / Cần Bán (Bên Bán) / Tìm Đối tác Liên danh
       ├─► Nhập Tiêu đề, Ngành nghề, Địa bàn triển khai
       ├─► Thiết lập Ngân sách dự kiến:
       │     • Nhập số tiền cụ thể (VD: 5,000,000,000 VNĐ -> Tự động format "5 Tỷ VNĐ")
       │     • Hoặc chọn "Thỏa thuận theo dự án"
       │
       ▼
2. Xuất bản Cơ hội lên Sàn Giao thương B2B
       │
       ▼
3. Khi Cần Chỉnh Sửa Cơ hội:
       │
       ├─► Bấm "Chỉnh sửa cơ hội", cập nhật ngân sách hoặc tiến độ
       └─► Giao diện lập tức hiển thị dữ liệu mới nhất, không bị lưu bộ nhớ đệm cũ
```

#### 3.2 Ba Kịch bản Lên Lịch Hẹn 1-on-1 Doanh nhân (Three Meeting Setup Scenarios)
Hệ thống chuẩn hóa 3 kịch bản lên lịch hẹn phủ kín mọi điểm chạm của doanh nhân:

```
                          ┌──────────────────────────────────────────────┐
                          │  3 KỊCH BẢN LÊN LỊCH HẸN GẶP 1-ON-1 DOANH NHÂN │
                          └──────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┼────────────────────────────────┐
                 │                                │                                │
                 ▼                                ▼                                ▼
    [KỊCH BẢN 1: TỰ CHỦ ĐỘNG]       [KỊCH BẢN 2: TỪ CƠ HỘI GIAO THƯƠNG]   [KỊCH BẢN 3: TỪ SÀN THƯƠNG MẠI]
  • Mở chức năng "Kết nối B2B"      • Xem 1 cơ hội trên bản tin        • Xem chi tiết 1 sản phẩm/dịch vụ
  • Chọn 1 hội viên trong danh bạ    • Thấy phù hợp năng lực            • Quan tâm bảng giá & chính sách
  • Bấm "Lên lịch gặp 1-on-1"       • Bấm "Lên lịch gặp từ cơ hội"     • Bấm "Hẹn gặp tư vấn sản phẩm"
                 │                                │                                │
                 └────────────────────────────────┼────────────────────────────────┘
                                                  │
                                                  ▼
                                 [ĐIỀN CHI TIẾT LỊCH HẸN]
                                 • Chọn Thời gian & Ngày gặp
                                 • Hình thức: Trực tiếp (Địa điểm cà phê/Văn phòng) hoặc Trực tuyến (Google Meet/Zoom)
                                 • Ghi chú mục tiêu cuộc gặp
                                                  │
                                                  ▼
                                 [GỬI YÊU CẦU & TỰ ĐỘNG NHẮN TIN]
                                 • Hệ thống tự động tạo 1 tin nhắn chuyên nghiệp trong hộp thoại chat
                                 • Người nhận nhận được tin nhắn kèm thẻ lịch hẹn có nút "Đồng ý" / "Đổi giờ"
                                 • Khi người nhận bấm "Đồng ý": Hệ thống tự động xác nhận vào luồng chat của cả hai
```

---

### 4. BỘ QUY TẮC NGHIỆP VỤ (BUSINESS RULES)

1. **Quy tắc Chuẩn hóa Hiển thị Ngân sách:**
   - Ngân sách giao thương bắt buộc phải hiển thị rõ ràng đơn vị: Nếu giá trị ≥ 1,000,000,000 VNĐ, hệ thống hiển thị dạng `X Tỷ VNĐ`. Nếu giá trị từ 1,000,000 đến dưới 1,000,000,000 VNĐ, hiển thị `Y Tr VNĐ`. Nếu để trống, hiển thị `Thỏa thuận B2B`.
   - Tuyệt đối không hiển thị các ký tự gây hiểu lầm như `/tỷ` hay số đơn độc không có mệnh giá.
2. **Quy tắc Minh bạch Thương mại:**
   - Chỉ có Hội viên chính thức đã hoàn tất đóng hội phí thường niên mới được quyền đăng bài lên Sàn Giao thương B2B.
   - Mọi sản phẩm niêm yết phải là sản phẩm có thật, thuộc quyền sở hữu hoặc phân phối hợp pháp của doanh nghiệp hội viên.
3. **Quy tắc Tự động Hóa Hộp Thư Hội thoại (Auto-Messaging Rule):**
   - Khi lên lịch hẹn, hệ thống không được phép bắt người dùng phải tự soạn lại tin nhắn text. Hệ thống phải chủ động thay mặt người gửi soạn thảo mẫu tin lịch thiệp: *"Kính gửi Anh/Chị [Tên Đối Tác], tôi xin phép đặt lịch gặp 1-on-1 để trao đổi về [Tên Cơ Hội/Sản Phẩm] vào hồi [Giờ, Ngày]. Kính mời Anh/Chị xác nhận."*
   - Khi đối tác xác nhận, hệ thống gửi phản hồi tự động vào luồng chat: *"Anh/Chị [Tên Đối Tác] đã đồng ý lịch gặp. Vui lòng kiểm tra mục Lịch hẹn."*
4. **Quy tắc Thanh toán Đơn hàng & Quyên góp:**
   - Toàn bộ giao dịch thanh toán trong hệ thống sử dụng phương thức quét mã QR MoMo và cổng thanh toán VNPay. Không áp dụng bất kỳ hình thức nào khác.

---

### 5. CHỈ SỐ HIỆU QUẢ HOẠT ĐỘNG (KPIS)
- **Tỷ lệ Chuyển đổi từ Lịch hẹn sang Hợp đồng:** Đạt tối thiểu 35% các cuộc gặp 1-on-1 dẫn tới ký kết hợp tác kinh doanh.
- **Thời gian Thiết lập Cuộc gặp:** Dưới 30 giây cho một thao tác hẹn gặp hoàn chỉnh kể cả khâu gửi tin nhắn.
- **Độ chính xác Dữ liệu Cập nhật:** 100% các thao tác chỉnh sửa giá, số lượng hoặc trạng thái cơ hội được phản ánh ngay lập tức trên ứng dụng di động.
- **Tần suất Giao thương Bình quân:** Mỗi hội viên chính thức tạo lập tối thiểu 2 cơ hội giao thương và tham gia 1 cuộc gặp 1-on-1 mỗi tháng.

