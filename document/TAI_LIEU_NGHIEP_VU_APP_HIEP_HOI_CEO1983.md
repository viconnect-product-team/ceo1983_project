# TÀI LIỆU MÔ TẢ NGHIỆP VỤ TOÀN DIỆN
## ỨNG DỤNG SỐ HÓA HIỆP HỘI CLB DOANH NHÂN CEO 1983 (HANOIBA)

---

### THÔNG TIN TÀI LIỆU
- **Tên dự án:** Ứng dụng Hiệp Hội Doanh Nhân CEO 1983 (`CEO 1983 Association Mobile Web App`)
- **Đơn vị chủ quản:** CLB Doanh Nhân CEO 1983 (Trực thuộc Hội Doanh Nhân Trẻ Hà Nội - HanoiBA)
- **Đối tượng đọc:** Toàn thể Hội viên Doanh nhân, Ban Điều Hành, Ban Thư Ký, Ban Quản Trị và Đối tác liên kết (Không yêu cầu kiến thức kỹ thuật lập trình).
- **Mục đích tài liệu:** Mô tả chi tiết, sinh động và trực quan toàn bộ nghiệp vụ thực tế của ứng dụng giúp mọi người đọc là hiểu và vận hành được ngay.

---

## MỤC LỤC
1. [Giới Thiệu Tổng Quan & Sứ Mệnh](#1-giới-thiệu-tổng-quan--sứ-mệnh)
2. [Sơ Đồ Kiến Trúc Nghiệp Vụ Cốt Lõi](#2-sơ-đồ-kiến-trúc-nghiệp-vụ-cốt-lõi)
3. [Chi Tiết 10 Phân Hệ Nghiệp Vụ Trọng Yếu](#3-chi-tiết-10-phân-hệ-nghiệp-vụ-trọng-yếu)
   - [3.1. Trang Chủ & Cập Nhật Hồ Sơ Nhanh Phong Cách Mạng Xã Hội](#31-trang-chủ--cập-nhật-hồ-sơ-nhanh-phong-cách-mạng-xã-hội)
   - [3.2. Thẻ Hội Viên VIP & Danh Thiếp Số Độc Bản](#32-thẻ-hội-viên-vip--danh-thiếp-số-độc-bản)
   - [3.3. Trang Quét QR Ngoài Ứng Dụng (Public Digital Card)](#33-trang-quét-qr-ngoài-ứng-dụng-public-digital-card)
   - [3.4. Sàn Giao Thương Marketplace B2B & Quảng Cáo Tài Trợ Hoàng Gia](#34-sàn-giao-thương-marketplace-b2b--quảng-cáo-tài-trợ-hoàng-gia)
   - [3.5. Chia Sẻ Cơ Hội Giao Thương & Khớp Nối Cung - Cầu Realtime](#35-chia-sẻ-cơ-hội-giao-thương--khớp-nối-cung---cầu-realtime)
   - [3.6. Hẹn Gặp Kết Nối & Bàn Chiến Lược Kinh Doanh](#36-hẹn-gặp-kết-nối--bàn-chiến-lược-kinh-doanh)
   - [3.7. Biểu Quyết Trực Tuyến Đi Kèm Sự Kiện & Cuộc Họp](#37-biểu-quyết-trực-tuyến-đi-kèm-sự-kiện--cuộc-họp)
   - [3.8. Danh Bạ 7 Ban Chuyên Môn & Kênh Hỗ Trợ 24/7](#38-danh-bạ-7-ban-chuyên-môn--kênh-hỗ-trợ-247)
   - [3.9. Hướng Dẫn Sử Dụng 2 Chế Độ (Từng Bước & Sổ Tay PDF)](#39-hướng-dẫn-sử-dụng-2-chế-độ-từng-bước--sổ-tay-pdf)
   - [3.10. Phân Quyền Hội Viên Dành Cho Admin & Ban Quản Trị](#310-phân-quyền-hội-viên-dành-cho-admin--ban-quản-trị)
4. [Quy Chuẩn Thẩm Mỹ & Trải Nghiệm Doanh Nhân](#4-quy-chuẩn-thẩm-mỹ--trải-nghiệm-doanh-nhân)
5. [Tổng Kết & Giá Trị Mang Lại](#5-tổng-kết--giá-trị-mang-lại)

---

## 1. GIỚI THIỆU TỔNG QUAN & SỨ MỆNH

Ứng dụng **CLB Doanh Nhân CEO 1983** là nền tảng số hóa đặc quyền phục vụ cộng đồng các nhà lãnh đạo, chủ tịch, tổng giám đốc và doanh nghiệp trực thuộc CLB CEO 1983 (HanoiBA).

Khác với các ứng dụng mạng xã hội giải trí thông thường, ứng dụng Hiệp hội là một **văn phòng số và sàn xúc tiến giao thương B2B** thu nhỏ, nơi:
- Mỗi doanh nhân có một **tấm danh thiếp số độc bản** đại diện cho doanh nghiệp mình.
- Mọi kết nối đều hướng đến **hợp tác thương mại, bàn chiến lược kinh doanh và đầu tư phát triển**.
- Mọi hoạt động của CLB từ bầu cử, biểu quyết nghị quyết, tham gia sự kiện gala, hội chợ kết nối cung cầu đến tra cứu hỗ trợ từ Ban Thư Ký đều được thực hiện nhanh chóng trên điện thoại thông minh.

---

## 2. SƠ ĐỒ KIẾN TRÚC NGHIỆP VỤ CỐT LÕI

```
                  ┌───────────────────────────────────────────┐
                  │    ỨNG DỤNG HIỆP HỘI CLB CEO 1983        │
                  └─────────────────────┬─────────────────────┘
                                        │
      ┌──────────────────┬──────────────┴───────┬──────────────────┐
      ▼                  ▼                      ▼                  ▼
┌───────────┐     ┌─────────────┐        ┌─────────────┐    ┌─────────────┐
│ TRANG CHỦ │     │THẺ HỘI VIÊN │        │ GIAO THƯƠNG │    │ QUẢN TRỊ    │
│ & HỒ SƠ   │     │ & DANH THIẾP│        │ & KẾT NỐI   │    │ & BIỂU QUYẾT│
└─────┬─────┘     └──────┬──────┘        └──────┬──────┘    └──────┬──────┘
      │                  │                      │                  │
      ├─ Đổi ảnh bìa     ├─ Logo cty góc phải   ├─ Sàn Marketplace ├─ Biểu quyết
      ├─ Đổi Avatar      ├─ Mã QR cá nhân       ├─ Quảng cáo Gold  ├─ Lịch sử họp
      ├─ Đổi SĐT, Tên    ├─ Quét QR đối tác     ├─ Nhắn tin nhà bán├─ Phân quyền BQT
      └─ Biểu quyết nhanh├─ Bật/Tắt riêng tư    ├─ Cơ hội Realtime └─ Danh bạ 7 Ban
                         └─ Hợp đồng & Profile  └─ Hẹn gặp chiến lược
```

---

## 3. CHI TIẾT 10 PHÂN HỆ NGHIỆP VỤ TRỌNG YẾU

### 3.1. Trang Chủ & Cập Nhật Hồ Sơ Nhanh Phong Cách Mạng Xã Hội
- **Ý nghĩa:** Giúp hội viên làm mới hình ảnh đại diện và thương hiệu doanh nghiệp ngay tại trang chủ mà không cần thao tác qua nhiều tầng menu phức tạp.
- **Tính năng nổi bật:**
  - **Thay đổi tức thì:** Bấm vào icon cây bút hoặc ảnh đại diện để mở cửa sổ chỉnh sửa:
    - *Ảnh đại diện (Avatar):* Ảnh chân dung doanh nhân chuyên nghiệp.
    - *Ảnh bìa (Cover Banner):* Ảnh nhà máy, showroom, văn phòng hoặc sự kiện tiêu biểu của công ty.
    - *Logo công ty:* Tải lên logo chính hãng dạng PNG/JPG sắc nét.
    - *Họ tên & Số điện thoại:* Thay đổi nhanh số hotline liên hệ khi cần.
  - **Thanh tác vụ nhanh (Quick Action Pills):**
    - Đã loại bỏ các mục thừa: Không còn mục ưu đãi, không có mã QR thừa, bỏ quét NFC và Apple Wallet.
    - Bổ sung nút **"Biểu quyết"** đưa thẳng tới các phiên họp đang mở.

### 3.2. Thẻ Hội Viên VIP & Danh Thiếp Số Độc Bản
- **Ý nghĩa:** Tấm thẻ đại diện cho vị thế và danh tính doanh nghiệp của hội viên trong hiệp hội.
- **Quy chuẩn thiết kế mặt thẻ:**
  - **Logo công ty ở góc trên bên phải:** Không để logo hiệp hội cố định mà tôn vinh logo công ty của hội viên.
  - **Mã QR cá nhân:** Nằm ngay dưới logo công ty; nhấp vào mã QR sẽ phóng to toàn màn hình để đối tác dễ dàng quét tại các buổi tiệc hoặc hội thảo.
  - **Bỏ lật mặt sau thẻ (No 3D Flip):** Tránh gây chóng mặt và bất tiện trên điện thoại.
- **Bố cục dưới thẻ:**
  - **Nút quét mã QR tích hợp:** Quét nhanh thẻ của hội viên khác ngay tại chỗ.
  - **Hồ sơ năng lực (Profile) & Hợp đồng hội viên (Contract):** Hiển thị rõ ràng ngày gia nhập, thời hạn hội phí, quyền lợi hội viên và thông tin pháp lý doanh nghiệp.
  - **Kiểm soát quyền riêng tư (Privacy Toggle):** Hội viên có quyền bật/tắt từng thông tin (Số điện thoại, Email, Zalo, Website) mà họ muốn người khác nhìn thấy khi quét mã QR của họ.
  - **Chỉnh sửa hồ sơ chuẩn màu hoàng gia:** Cửa sổ chỉnh sửa hiển thị chính giữa màn hình với nền tối mờ, phối màu Cobalt Navy & Amber Gold sang trọng.

### 3.3. Trang Quét QR Ngoài Ứng Dụng (Public Digital Card)
- **Ý nghĩa:** Khi đối tác sử dụng camera điện thoại hoặc Zalo quét mã QR trên danh thiếp của hội viên, một trang web danh thiếp số độc bản hiển thị ngay lập tức mà đối tác không cần cài đặt app.
- **Quy chuẩn giao diện:**
  - Đồng bộ 100% về bố cục và màu sắc với Thẻ Hội Viên trong app.
  - Hiển thị logo công ty, ảnh chân dung, họ tên, chức danh và tên doanh nghiệp.
  - Bên dưới thẻ là các nút liên kết trực tiếp: Gọi điện thoại, Mở Zalo OA, Xem Facebook, Truy cập Website công ty (chỉ hiển thị những kênh mà hội viên cho phép).

### 3.4. Sàn Giao Thương Marketplace B2B & Quảng Cáo Tài Trợ Hoàng Gia
- **Ý nghĩa:** Chợ đầu mối B2B nội bộ để các hội viên giới thiệu sản phẩm và mua bán chéo với chính sách giá ưu đãi thành viên.
- **Khu vực tài trợ cao cấp (Sponsor Showcase):**
  - Vị trí vàng nằm ngay dưới thanh tìm kiếm.
  - Bỏ màu xanh đơn điệu cũ, thay thế bằng phong cách **Obsidian Dark & Warm Amber Gold** đẳng cấp với chế độ trượt tự động (Carousel 4s) tôn vinh các gói tài trợ truyền thông của doanh nghiệp.
- **Nhắn tin trực tiếp với nhà bán hàng:**
  - Trên từng thẻ sản phẩm, tích hợp biểu tượng tin nhắn giúp người mua bấm vào là mở ngay phòng chat riêng với chủ doanh nghiệp để đàm phán hợp đồng, báo giá số lượng lớn và xem mẫu thực tế.

### 3.5. Chia Sẻ Cơ Hội Giao Thương & Khớp Nối Cung - Cầu Realtime
- **Ý nghĩa:** Kênh xúc tiến thương mại cốt lõi của CLB CEO 1983.
- **Thanh thống kê Realtime:**
  - *Tổng số cơ hội giao thương:* Số lượng bài đăng cung cấp/tìm mua đang mở.
  - *Tổng số sản phẩm liên kết:* Số mặt hàng đang chào bán.
  - *Tổng giá trị giao dịch ước tính:* Tính toán thời gian thực tổng giá trị các dự án, gói thầu được chia sẻ.
- **Đăng bài chia sẻ:**
  - Phân loại rõ: **Cung cấp (Supply)**, **Tìm mua (Demand)**, **Hợp tác đầu tư (Joint Venture)**.
  - Gắn tag giá trị deal và người phụ trách phụ trợ thương thảo.

### 3.6. Hẹn Gặp Kết Nối & Bàn Chiến Lược Kinh Doanh
- **Ý nghĩa:** Đổi mới hoàn toàn khái niệm "kết bạn". Doanh nhân không lên app để chat tán gẫu; họ kết nối để **bàn chiến lược và chốt cơ hội kinh doanh**.
- **Quy trình gửi đề xuất (Sender):**
  - Bấm nút icon "Bắt tay" trên danh bạ, một cửa sổ trượt từ dưới lên (Bottom Sheet) hiển thị tinh tế.
  - Hội viên chỉ cần điền nhanh: *Họ tên*, *Số điện thoại*, *Tên công ty*, *Nội dung đề xuất gặp* và tùy chọn *Đính kèm tin đăng cơ hội giao thương*.
- **Quy trình tiếp nhận (Receiver):**
  - Hệ thống tạo một **Thư Mời Hẹn Gặp** trang trọng trong mục tin nhắn của đối tác.
  - Đối tác có 2 lựa chọn:
    - Bấm nút **"Đồng ý kết nối"** -> Hệ thống xác nhận lịch hẹn, chuyển sang trạng thái đối tác tin cậy.
    - Bấm nút **"Hủy"** -> Hệ thống hiển thị ô nhập lý do từ chối (không bắt buộc nhập) để bảo đảm sự tôn trọng và lịch thiệp giữa các CEO.

### 3.7. Biểu Quyết Trực Tuyến Đi Kèm Sự Kiện & Cuộc Họp
- **Ý nghĩa:** Đảm bảo tính dân chủ, minh bạch và gắn kết với các sự kiện thực tế của Hiệp hội.
- **Quy tắc quan trọng:** Biểu quyết **không đẩy vu vơ từ hệ thống** mà luôn gắn liền với một Cuộc họp hoặc Sự kiện cụ thể (Ví dụ: Đại hội nhiệm kỳ, Họp Ban Chấp Hành, Diễn đàn Doanh nhân).
- **Hai phân vùng:**
  - **Tab 1 - Biểu quyết đang diễn ra:** Hiển thị các nghị quyết đang mở phiếu, thời gian họp, địa điểm tổ chức. Hội viên chọn một phương án (Tán thành, Không tán thành, Ý kiến khác) và bấm "Xác nhận biểu quyết". Hệ thống hiển thị thanh tỷ lệ % số phiếu realtime.
  - **Tab 2 - Lịch sử biểu quyết:** Lưu trữ vĩnh viễn các kỳ đại hội trước, tỷ lệ biểu quyết đã thông qua để tra cứu làm biên bản nghị quyết.

### 3.8. Danh Bạ 7 Ban Chuyên Môn & Kênh Hỗ Trợ 24/7
- Không thu gọn chỉ có Ban Thư Ký, ứng dụng công khai thông tin liên hệ của toàn bộ 7 Ban Chuyên Môn của CLB Doanh Nhân CEO 1983:
  1. **Ban Thường Trực CLB:** Hoạch định chiến lược và đối ngoại cấp cao.
  2. **Ban Thư Ký & Điều Phối Hội Viên:** Hỗ trợ hồ sơ, kỹ thuật app 24/7.
  3. **Ban Xúc Tiến Thương Mại & Đầu Tư B2B:** Khớp nối chuỗi cung ứng, thương vụ mua bán chéo.
  4. **Ban Phát Triển Hội Viên & Thẩm Định:** Xác thực năng lực pháp lý và hồ sơ gia nhập.
  5. **Ban Truyền Thông & Sự Kiện:** Tổ chức Gala, Caravan, Cafe Doanh nhân.
  6. **Ban Tài Chính & Pháp Chế:** Quản lý hội phí minh bạch, bảo trợ pháp lý.
  7. **Ban Đào Tạo & Chuyển Đổi Số:** Ứng dụng công nghệ AI và số hóa quản trị.
- Mỗi ban đều có: Tên Trưởng/Phó Ban, Số điện thoại trực tiếp, Email và địa chỉ trụ sở văn phòng.

### 3.9. Hướng Dẫn Sử Dụng 2 Chế Độ (Từng Bước & Sổ Tay PDF)
- **Khắc phục lỗi trước đây:** Hướng dẫn sử dụng không chỉ là một file PDF khô khan, mà được phân tách thành 2 chế độ thông minh:
  - **Chế độ 1 - Chỉ dẫn từng bước (Step-by-step Interactive Tour):**
    - Hướng dẫn cụ thể từng màn hình (Trang chủ, Thẻ hội viên, Gian hàng, Cơ hội, Hẹn gặp, Biểu quyết).
    - Có số thứ tự bước (1/6, 2/6...), thanh tiến trình phần trăm và nút **"Bỏ qua" (Skip)** nổi bật để hội viên có thể thoát bất kỳ lúc nào nếu đã nắm rõ.
  - **Chế độ 2 - Sổ tay tài liệu PDF:**
    - Xem trực tiếp tài liệu hướng dẫn chuẩn in ấn của CLB, có nút mở tab mới và tải về máy.
    - **Bảo vệ quyền tải file:** Hội viên thông thường **không có quyền** tải file lung tung lên hệ thống. Nút cập nhật/tải lên file PDF mới **chỉ hiển thị duy nhất khi tài khoản là Admin / Ban Quản Trị**.

### 3.10. Phân Quyền Hội Viên Dành Cho Admin & Ban Quản Trị
- Khi tài khoản thuộc Ban Quản Trị hoặc Admin đăng nhập:
  - Mở quyền truy cập màn hình **Phân quyền Hội viên (`/association/permissions`)**.
  - Cho phép chọn hội viên trong danh bạ để:
    - Bổ nhiệm vào 1 trong 7 Ban Chuyên Môn.
    - Chỉ định chức vụ: Trưởng Ban, Phó Ban Thường Trực, Phó Ban, Ủy Viên, Hội Viên.
    - Cấp quyền chi tiết (Bật/Tắt công tắc):
      1. *Duyệt & Quản lý Sự kiện / Cuộc họp*
      2. *Đăng & Duyệt Bản tin CLB*
      3. *Kiểm duyệt Sản phẩm / Gian hàng Marketplace*
      4. *Tạo & Quản lý Biểu quyết*
      5. *Thẩm định Hồ sơ Hội viên*
      6. *Cấp quyền Quản trị viên (Admin)*.

---

## 4. QUY CHUẨN THẨM MỸ & TRẢI NGHIỆM DOANH NHÂN

1. **Màu sắc doanh nhân chuẩn mực:**
   - Xanh Cobalt Navy (`#003B95`) thể hiện tính bền vững, tin cậy của giới tinh hoa.
   - Vàng Amber Gold (`#F59E0B`) tượng trưng cho thịnh vượng, hợp tác thành công.
   - Đen Titan / Obsidian (`#0B132B`) tạo chiều sâu công nghệ và sang trọng.
   - Tuyệt đối không sử dụng các màu xanh neon, đỏ chói hoặc màu mặc định rẻ tiền.

2. **Quy tắc tối giản nút bấm:**
   - Thay thế toàn bộ các nút bấm chữ cồng kềnh thành các icon đơn sắc sắc nét (`lucide-react`).
   - Nút bấm nguyên khối chỉ xuất hiện khi cần xác nhận các hành động quan trọng (Lưu hồ sơ, Đồng ý kết nối, Xác nhận phiếu bầu).

3. **Tránh lạm dụng chữ (Zero Wall of Text):**
   - Mọi thông tin được tinh gọn thành các thẻ bo tròn, huy hiệu ngắn gọn, thông số hiển thị dạng số lớn trực quan.

---

## 5. TỔNG KẾT & GIÁ TRỊ MANG LẠI

Hệ thống ứng dụng Hiệp hội Doanh nhân CEO 1983 sau khi được hoàn thiện và nâng cấp toàn diện mang lại 3 giá trị đột phá:
1. **Giá trị nhận diện thương hiệu:** Mọi hội viên đều tự hào khi sở hữu tấm thẻ danh thiếp số độc bản mang logo công ty mình, kết nối không chạm tiện lợi trong kỷ nguyên số.
2. **Giá trị xúc tiến thương mại thực chất:** Không dừng lại ở kết nối xã giao; mọi đề xuất hẹn gặp, cơ hội cung cầu và sàn sản phẩm đều có số liệu thống kê realtime, giúp các doanh nhân nhanh chóng tìm thấy đối tác phù hợp và chốt các thương vụ giá trị.
3. **Giá trị quản trị minh bạch:** Ban Thường Trực và Ban Quản Trị có công cụ số hóa để điều hành hiệp hội, biểu quyết đại hội dân chủ, quản lý các ban chuyên môn và tiếp nhận hỗ trợ hội viên 24/7.
