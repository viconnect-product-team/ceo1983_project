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

## 3. Tiêu Chuẩn Giao Diện & Màu Sắc (CHỈ ĐÚNG 3 NHÓM MÀU CHUẨN CEO 1983)

Luôn luôn tuân thủ nghiêm ngặt bảng màu nhận diện chính thức của CEO 1983:
1. **Màu Chủ Đạo Deep Cobalt Navy**: `#003B95`, `#002B70`, `#0A1A3A` (Thanh điều hướng Header, nút hành động chính CTA, huy hiệu chính thức).
2. **Màu Nhấn Warm Amber Gold**: `#F59E0B`, `#D97706`, `#B45309`, `#FEF3C7` (Viền thẻ VIP, ngôi sao danh dự, giá trị deal CRM, nút Quan tâm).
3. **Màu Tương Phản Trung Tính**: `#FFFFFF` (Nền trắng sáng thanh lịch) và `#0F172A` (Nền thẻ đen Obsidian sang trọng).
- **CẤM TUYỆT ĐỐI**: Màu tím (purple), hồng (pink), xanh lá chuối (lime), xanh neon, dải màu cầu vồng.
- **CẤM TUYỆT ĐỐI HARD DỮ LIỆU / MOCK DATA**: 100% dữ liệu phải nạp từ CSDL qua NestJS API (`fetchNestApi`).
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
- `vba_member_permissions`: Bản đồ phân quyền tài khoản (`memberCode` -> `MemberPermissionProfile`).
- `vba_meeting_votes`: Dữ liệu phiên biểu quyết và phiếu bầu cử.
- Sự kiện tùy biến (Custom Events):
  - `vba_member_company_logo_updated`: Cập nhật logo công ty.
  - `vba_member_avatar_updated`: Cập nhật ảnh đại diện.
  - `vba_member_cover_updated`: Cập nhật ảnh bìa.
  - `vba.connection.changed`: Thay đổi trạng thái kết nối bạn bè/đối tác.
  - `crm:permissions-updated`: Đồng bộ phân quyền tức thời giữa 3 phân hệ.
