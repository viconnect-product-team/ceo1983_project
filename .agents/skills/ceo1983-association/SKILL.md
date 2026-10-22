---
name: ceo1983-association
description: Hướng dẫn nghiệp vụ, kỹ thuật, giao diện và quy chuẩn vận hành toàn diện cho ứng dụng và hệ sinh thái Hiệp Hội Doanh Nhân CEO 1983 (HanoiBA).
---

# KỸ NĂNG HỆ SINH THÁI HIỆP HỘI DOANH NHÂN CEO 1983

Kỹ năng này định nghĩa các tiêu chuẩn kỹ thuật, mẫu kiến trúc và tri thức nghiệp vụ cho **Ứng Dụng Web Di Động Hiệp Hội CEO 1983** (`@ceo1983/app_fe`), nằm trong thư mục `apps/ceo1983_app_fe` và hệ thống quản trị Web CRM Hiệp hội.

---

## 1. Nghiệp Vụ & Mục Đích Hệ Thống

Ứng dụng phục vụ các chủ doanh nghiệp, nhà sáng lập và lãnh đạo cấp cao trực thuộc **CLB Doanh Nhân CEO 1983** (HanoiBA). Đây không phải là một mạng xã hội thông thường mà là một hệ sinh thái số hóa điều hành dành riêng cho lãnh đạo doanh nghiệp:
- **Định Danh Lãnh Đạo & Danh Thiếp Số**: Thẻ hội viên thông minh sang trọng hiển thị logo doanh nghiệp, mã QR cá nhân, hợp đồng hội viên và danh thiếp số công khai (`/card/:code`).
- **Giao Thương B2B & Kết Nối Chiến Lược**: Đặt lịch hẹn gặp 1-on-1 (`[B2B_CONNECT_INVITE]`) gắn liền mục đích kinh doanh, thông tin đối tác và cơ hội hợp tác liên kết.
- **Sàn Giao Thương Nội Bộ B2B**: Danh mục sản phẩm, giải pháp doanh nghiệp với banner tài trợ Obsidian & Amber và đàm phán trực tiếp trong ứng dụng.
- **Cơ Hội Kinh Doanh Thời Gian Thực**: Tổng hợp nhu cầu mua, bán, hợp tác đầu tư với bảng định giá thời gian thực.
- **Điều Hành Sự Kiện & Biểu Quyết**: Biểu quyết trực tuyến kết nối trực tiếp với đại hội, phiên họp ban điều hành và hội thảo chuyên đề.
- **Ma Trận Phân Quyền & Quản Trị Vai Trò**: Quản trị viên phân quyền chặt chẽ theo các ban chuyên môn (Ban Truyền thông, Ban Thành viên, Ban Xúc tiến, Ban Tài chính, Ban Thiện nguyện, Ban Quản trị).

---

## 2. Cấu Trúc Thư Mục & Các Tệp Trọng Yếu

Toàn bộ các route và component của ứng dụng hiệp hội nằm tại `apps/ceo1983_app_fe`:

```
apps/ceo1983_app_fe/
├── src/
│   ├── routes/
│   │   ├── association.index.tsx          # Trang chủ: Cập nhật hồ sơ nhanh kiểu Facebook, tin tức nổi bật, phím tắt nhanh
│   │   ├── association.card.tsx           # Thẻ hội viên: Logo công ty, mã QR cá nhân, hợp đồng + hồ sơ, quét mã
│   │   ├── association.members.tsx        # Danh bạ hội viên: Nút hành động tối giản biểu tượng, ngăn kéo Kết nối B2B
│   │   ├── association.messages.tsx       # Tin nhắn: Thẻ mời họp B2B tương tác, lịch sử cuộc gọi, vé mời
│   │   ├── association.opportunities.tsx  # Cơ hội giao thương: Thanh giá trị deal thời gian thực, đăng & ghép nối deal
│   │   ├── association.products.tsx       # Gian hàng B2B: Băng chuyền nhà tài trợ Obsidian, nhắn tin trực tiếp người bán
│   │   ├── association.events.tsx         # Sự kiện: Danh sách sự kiện, slide mã QR vé tham dự, quay số may mắn
│   │   ├── association.voting.tsx         # Biểu quyết: Tab đang mở & lịch sử biểu quyết gắn với sự kiện/cuộc họp
│   │   ├── association.permissions.tsx    # Quản trị: Thiết lập phân quyền tài khoản và ban chuyên trách
│   │   ├── association.profile.tsx        # Hồ sơ cá nhân: Định danh lãnh đạo gọn gàng, liên kết Thẻ & Quản trị RBAC
│   │   ├── card.$code.tsx                 # Trang quét thẻ QR công khai: Giao diện thẻ chuẩn + tùy chọn bảo mật
│   │   ├── income.tsx                     # Quản lý thu: Phí hội viên, vé sự kiện, thu đột xuất, Xuất/Import Excel
│   │   ├── expenses.tsx                   # Quản lý chi: Phiếu chi, tạm ứng, hoàn ứng tiền thừa, Xuất/Import Excel
│   │   ├── finance-report.tsx             # Báo cáo tài chính: Tổng quan thu chi, bộ lọc trạng thái và quyết toán
│   ├── components/
│   │   ├── common/
│   │   │   ├── QuickProfileEditModal.tsx      # Modal chỉnh sửa hồ sơ & logo công ty tức thì
│   │   │   ├── BusinessConnectBottomSheet.tsx # Ngăn kéo đề xuất lịch hẹn B2B kèm liên kết cơ hội
│   │   ├── member/
│   │   │   ├── Ceo1983BusinessCardVisit.tsx   # Danh thiếp số lãnh đạo chuẩn nhận diện chính thức
│   │   │   ├── ContactSupportModal.tsx        # Danh bạ liên hệ 6 ban chuyên môn & đường dây hỗ trợ 24/7
│   │   │   ├── UserGuideModal.tsx             # Hướng dẫn từng bước tương tác + tải PDF hướng dẫn
│   │   │   ├── MemberShell.tsx                # Khung điều hướng di động & thanh tiêu đề lãnh đạo
│   │   ├── events/
│   │   │   ├── RegisteredEventsQrSlider.tsx   # Slide cuộn ngang hiển thị trực tiếp tối đa 3 mã QR vé tham dự
│   │   ├── dashboard/
│   │   │   ├── RbacPermissionMatrix.tsx       # Ma trận phân quyền vai trò hệ thống, tự quét chức năng mới
│   │   │   ├── MemberPermissionsByCommittee.tsx # Phân quyền tài khoản theo ban (Bật/Tắt, Xem, Chỉnh sửa, Xóa)
│   │   │   ├── FinanceExcelImportModal.tsx    # Modal nhập dữ liệu thu/chi từ file Excel/CSV chuẩn
```

---

## 3. Tiêu Chuẩn Giao Diện & Hệ Màu 3 Cấp Độ Ưu Tiên Chuẩn CEO 1983

Luôn luôn tuân thủ nghiêm ngặt bảng màu nhận diện chính thức của CEO 1983 theo đúng 3 cấp độ ưu tiên thể hiện trạng thái:
1. **Ưu Tiên 1 - ĐỎ (Highest Priority / Quan Trọng / Nhận Diện Thương Hiệu)**:
   - Mã màu: `#D92525`, `#DC2626`, `#B91C1C`, `#991B1B`.
   - Ứng dụng: Nhận diện thương hiệu chính CEO 1983, nút kêu gọi hành động quyết định (CTA then chốt), trạng thái khẩn cấp/quan trọng, huy hiệu Top 1 dẫn đầu, thông báo nổi bật.
2. **Ưu Tiên 2 - VÀNG (Medium Priority / Vừa / Cảnh Báo & Điểm Nhấn VIP)**:
   - Mã màu: `#F59E0B`, `#D97706`, `#B45309`, `#FEF3C7`.
   - Ứng dụng: Trạng thái đang tiến hành, cảnh báo/nhắc nhở vừa, viền thẻ VIP, ngôi sao danh dự, giá trị deal CRM, huy hiệu Top 2-3, nút quan tâm.
3. **Ưu Tiên 3 - XANH (Normal / Bình Thường / Thông Tin & Nền Tảng)**:
   - Mã màu: `#003B95`, `#002B70`, `#0A1A3A`, `#0284C7` (và Emerald `#059669` cho trạng thái thành công/đã duyệt).
   - Ứng dụng: Thanh điều hướng Header/Sidebar, thông tin bình thường, nền tảng hệ thống, trạng thái ổn định/hoàn thành.
- **Màu Tương Phản Trung Tính**: `#FFFFFF` (Nền sáng thanh lịch) và `#0F172A` (Nền thẻ đen Obsidian sang trọng).
- **CẤM TUYỆT ĐỐI**: Màu tím (purple), hồng (pink), xanh chuối (lime), xanh neon, dải màu cầu vồng.
- **CẤM TUYỆT ĐỐI HARD DỮ LIỆU / MOCK DATA**: 100% dữ liệu phải nạp từ CSDL qua NestJS API (`fetchNestApi`), không làm dạng mock fake dữ liệu.
- **KHÔNG SỬ DỤNG TỪ NGỮ KỸ THUẬT**: Không để lộ các từ như "SQL", "PostgreSQL", "public.<bảng>", "RESTful API", "Cấp bậc" trên giao diện người dùng.

### Tối Ưu Nút Bấm Thành Biểu Tượng (Button-to-Icon)
Không làm rối màn hình bằng các nút chữ cồng kềnh. Sử dụng biểu tượng Lucide đơn sắc tinh tế (`<MessageSquare />`, `<Phone />`, `<User />`, `<Handshake />`). Chỉ dành nút chữ đầy đủ cho các hành động quyết định then chốt (Sửa hồ sơ, Chấp nhận lịch hẹn, Biểu quyết).

---

## 4. Quy Chuẩn Kỹ Thuật Bắt Buộc

1. **Sinh Định Tuyến (Route Generation)**:
   Khi thêm mới hoặc đổi tên tệp route trong `src/routes/`, luôn luôn chạy:
   ```bash
   npm run routes:gen
   ```
   Lệnh này tái tạo `routeTree.gen.ts` trước khi kiểm tra TypeScript.

2. **Kiểm Tra Biên Dịch Type-Check**:
   Xác thực chất lượng mã nguồn bằng lệnh:
   ```bash
   npx tsc --noEmit
   ```
   BẮT BUỘC phải vượt qua với **0 lỗi (Exit code 0)**.

3. **Quy Tắc Quản Lý Mã Nguồn Git (STRICT)**:
   **CẤM TUYỆT ĐỐI**: Không tự ý chạy `git push` hay `git commit`. Mọi thay đổi lưu trữ cục bộ để người dùng chủ động kiểm tra.

4. **Xử Lý Khoảng Trắng Nhập Liệu (Auto-trim Whitespace / Stream Space)**:
   Mọi ô nhập liệu (`<input>`, `<textarea>`) trong toàn bộ hệ thống phải tự động cắt bỏ khoảng trắng thừa đầu cuối khi kết thúc nhập liệu (`onBlur`) và ngăn chặn việc gửi dữ liệu chỉ chứa toàn khoảng trắng.

---

## 5. Khóa Lưu Trữ & Sự Kiện Chuẩn Của Hệ Thống

- `vba_custom_profile`: Ghi đè hồ sơ người dùng cục bộ.
- `vba_member_company_logo`: URL logo doanh nghiệp của hội viên.
- `vba_member_avatar_photo`: Ảnh đại diện cá nhân của hội viên.
- `vba_member_cover_photo`: Ảnh bìa trang chủ của hội viên.
- `vba_user_custom_shortcuts`: Lưu trữ danh sách 4 tính năng chính do hội viên tùy chọn hiển thị trên trang chủ.
- `vba_member_permissions`: Bản đồ phân quyền tài khoản (`memberCode` -> `MemberPermissionProfile`).
- `vba_meeting_votes`: Dữ liệu phiên biểu quyết và phiếu bầu cử.
- Sự kiện tùy biến (Custom Events):
  - `vba_member_company_logo_updated`: Cập nhật logo công ty.
  - `vba_member_avatar_updated`: Cập nhật ảnh đại diện.
  - `vba_member_cover_updated`: Cập nhật ảnh bìa.
  - `vba.connection.changed`: Thay đổi trạng thái kết nối bạn bè/đối tác.
  - `crm:permissions-updated`: Đồng bộ phân quyền tức thời giữa 3 phân hệ.
  - `crm_system_branding_updated`: Cập nhật biểu trưng và tên hiệp hội trên Header Sidebar.

---

## 6. Quy Chuẩn Phân Quyền, Bảng Tin, Thống Kê & Vận Hành Mới (Cập Nhật 10/2026)

1. **Tách Biệt Hồ Sơ Quản Trị CRM & App Mobile**:
   - Sử dụng khóa `crm_admin_profile` và `crm_admin_avatar` cho tài khoản quản trị CRM, tuyệt đối không can thiệp hay ghi đè vào `vba_custom_profile` hay avatar hội viên mobile.
2. **Phân Quyền Thao Tác Chi Tiết**:
   - **Tin tức CLB**: Chỉ `quan_tri`, `admin`, `chu_tich`, `truong_ban_*` mới có quyền tạo/sửa/xóa tin bài. Thành viên thông thường chỉ có quyền xem.
   - **Soát Vé / Quét Mã Check-in**: Căn cứ danh sách nhân sự soát vé trong `qrScanners` / `qrStaff` từ CRM. Riêng `quan_tri`, `chu_tich`, `admin` luôn có toàn quyền soát vé ở mọi sự kiện.
3. **Bảng Tin Đa Danh Mục Tại Tab Tin Nhắn (Social Newsfeed & B2B Feed)**:
   - Tích hợp tại tab `/association/messages` với thanh chuyển đổi "Bảng tin" và "Tin nhắn".
   - Danh mục thanh tiêu đề: Tất cả, Tin tức (kèm chọn phân lọc theo từng ban), Cơ hội chia sẻ, Sự kiện & Họp ban, Sản phẩm sàn Marketplace.
   - Tìm kiếm chuẩn xác theo danh mục hội viên đang chọn.
   - Tương tác mạng xã hội đầy đủ: Bình luận (Comment), Thả tim (Like/Unlike), Chia sẻ (Share).
   - Đăng bài đa ảnh: Hỗ trợ chọn/tải nhiều ảnh cùng lúc, tích hợp công cụ kéo/di chuyển/cắt ảnh (Crop/Pan/Zoom) trước khi xuất bản.
4. **Tùy Chỉnh 4 Tính Năng Chính Trên Trang Chủ**:
   - Cho phép hội viên tự chọn 4 tính năng mong muốn nhất được hiển thị trên Trang chủ thông qua modal tùy chọn, lưu vào cấu hình hội viên.
5. **Cơ Hội Chia Sẻ, Chọn Theo Ban & Báo Cáo**:
   - Báo cáo và xuất báo cáo cơ hội (Excel/CSV).
   - Biểu đồ trực quan so sánh: Cơ hội đã chia sẻ, Cơ hội deal được và Tổng cơ hội toàn CLB. Bấm xem chi tiết chuyển sang màn Thống kê chuyên sâu.
   - Chia sẻ cơ hội: Chọn người nhận thông qua API lọc danh sách thành viên theo từng Ban chuyên trách.
6. **Hệ Thống Thống Kê Chuyên Sâu (Dedicated Analytics)**:
   - **Mobile App**:
     - Thống kê lượt tương tác, giá trị mang lại cho CEO 1983 (VND), thống kê cơ hội (tổng cơ hội, lượt trao, lượt deal thành công).
     - Biểu đồ cột kết hợp đường timeline biến động theo ngày (nhảy số theo từng khung giờ).
     - Vinh danh Top 1: Hiện avatar lớn nổi bật của người dẫn đầu, bấm vào hiển thị thông tin và số liệu thực tế.
     - Dạng Accordion đóng mở cho Top 3 người dẫn đầu.
     - Thống kê hội viên ít tham gia nhất cần ban điều hành quan tâm, hỗ trợ gắn kết.
   - **CRM Dashboard**:
     - 5 chế độ hiển thị chuyên nghiệp: 1. Lưới (Grid/Cards), 2. Dashboard KPI, 3. Biểu đồ cây (Treemap), 4. Biểu đồ tròn (Donut), 5. Cây đơn vị / Tổ chức (Org Unit Tree).
     - Luôn có tính năng Xuất file Excel và Nhập (Import) file Excel cho từng danh mục.
7. **Truy Vấn Bảng Hệ Thống Không Có Trong Prisma Schema**:
   - Khi truy vấn các bảng hệ thống độc lập như `user_profiles`, `feed_posts`, `feed_comments`, bắt buộc dùng raw SQL an toàn (`$executeRawUnsafe` / `$queryRawUnsafe`) để tránh lỗi crash HTTP 500.
