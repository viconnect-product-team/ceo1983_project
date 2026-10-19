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
  - `crm_system_branding_updated`: Cập nhật biểu trưng và tên hiệp hội trên Header Sidebar.

---

## 6. Quy Chuẩn Phân Quyền, AI & Vận Hành Mới (Cập Nhật 10/2026)

1. **Tách Biệt Hồ Sơ Quản Trị CRM & App Mobile**:
   - Sử dụng khóa `crm_admin_profile` và `crm_admin_avatar` cho tài khoản quản trị CRM, tuyệt đối không can thiệp hay ghi đè vào `vba_custom_profile` hay avatar hội viên mobile.
2. **Phân Quyền Thao Tác Chi Tiết**:
   - **Tin tức CLB**: Chỉ `quan_tri`, `admin`, `chu_tich`, `truong_ban_*` mới có quyền tạo/sửa/xóa tin bài. Thành viên thông thường chỉ có quyền xem.
   - **Soát Vé / Quét Mã Check-in**: Căn cứ danh sách nhân sự soát vé trong `qrScanners` / `qrStaff` từ CRM. Riêng `quan_tri`, `chu_tich`, `admin` luôn có toàn quyền soát vé ở mọi sự kiện.
3. **Trợ Lý AI Động (Dynamic Context Assistant)**:
   - Tự động nạp dữ liệu tài khoản đang đăng nhập (sự kiện đã đăng ký, cơ hội quan tâm, bạn bè, cuộc hẹn B2B, hóa đơn cần thanh toán).
   - Tự động chuyển đổi sang mô hình miễn phí thông minh (`google/gemini-2.0-flash-exp:free`, `meta-llama/llama-3.3-70b-instruct:free`) hoặc trả lời cục bộ nếu OpenRouter lỗi.
4. **Phân Hệ Trao Đổi B2B (/network)**:
   - Bỏ rào cản kết nối: Nhắn tin trực tiếp giữa các hội viên không cần chờ duyệt.
   - Hỗ trợ gửi/tải tệp tin đa định dạng, ghim tin nhắn, và loại bỏ lỗi trùng lặp chức danh.
5. **Cấu Hình Thương Hiệu Sidebar Header**:
   - Hỗ trợ thay đổi Tên hiệp hội và Logo tại màn hình `/settings`, phát sự kiện `crm_system_branding_updated` đồng bộ ngay lập tức.
6. **Không Mock Dữ Liệu Gói Tài Trợ**:
   - Tải 100% dữ liệu thực từ bảng `public.sponsor_packages` và `public.sponsors`.
7. **Đồng Bộ Danh Mục Động Marketplace (Mobile & CRM)**:
   - Dùng `getDynamicMarketplaceCategories(products)` trích xuất phân loại mới từ sản phẩm thực tế, tự động hiển thị trên thanh danh mục lọc của cả App và CRM.
   - Modal đăng/sửa sản phẩm hỗ trợ "+ Thêm phân loại mới..." cho phép người dùng tự điền tên phân loại.
8. **Đại Tu Chi Tiết Sản Phẩm & Triệt Tiêu Màu Cam Shopee (#EE4D2D)**:
   - Thay thế toàn bộ màu cam chói gắt bằng Deep Cobalt Navy `#003B95` sang trọng và Neutral Slate/White; chỉ giữ màu hổ phách vàng (`fill-amber-400`) cho icon sao đánh giá.
9. **Đánh Giá Sản Phẩm Real Lưu CSDL PostgreSQL**:
   - Kết nối API NestJS `GET /reviews?productId=...` và `POST /reviews` lưu trực tiếp vào bảng `public.reviews`. Cấm mock dữ liệu hay lưu local.
10. **Bảo Mật Phân Quyền Bằng `permissions: string[]`**:
   - Cấm lưu trữ các trường nhạy cảm hoặc cờ vai trò (`vba_is_admin`, `vba_user_role`, `vba_current_role`, `vba_user_department`, `vba_is_event_qr_scanner`, v.v.) vào `localStorage`.
   - Kiểm soát quyền hạn hội viên và ban điều hành qua trường `permissions: string[]` được cấp từ token JWT và backend session.
11. **Đăng Ký & Tách Bạch Danh Xưng Hội Viên vs Tên Doanh Nghiệp**:
    - Mọi quy trình đăng ký (công khai & nội bộ) lưu name = fullName, contact = fullName, company_name = companyName, company_size = staffSize.
    - Cột about lưu trữ JSON an toàn và phải được phân giải khi hiển thị hồ sơ chi tiết (Người đại diện, Chức vụ, Năm sinh, Quy mô nhân sự, Nhu cầu kết nối, Năng lực cung ứng). Không bao giờ hiển thị raw JSON string cho người dùng.
12. **Mẫu Thư Cảm Ơn Đăng Ký Hội Viên**:
    - Tự động chuyển đổi các mã định danh ngành nghề (e.g. `ind.trade` -> `Thương mại & Bán lẻ`, `ind.it` -> `Công nghệ thông tin & Viễn thông`) sang tiếng Việt rõ ràng.
    - Không hiển thị mục "Ban nguyện vọng".
13. **Tinh Gọn Quản Trị Phân Quyền CRM (Sub-system 1 RBAC Only)**:
    - Loại bỏ hoàn toàn các tab con rườm rà (Phân hệ 2 & 3). Giữ duy nhất Ma trận phân quyền hệ thống (`RbacPermissionMatrix`).
    - Phân rã vai trò thành viên thành 6 ban chuyên môn cụ thể (`thanh_vien_ban_su_kien`, `thanh_vien_ban_xuc_tien`, `thanh_vien_ban_thanh_vien`, `thanh_vien_ban_truyen_thong`, `thanh_vien_ban_tai_chinh`, `thanh_vien_ban_thien_nguyen`) và `member` (App CEO 1983).
    - Tích hợp đầy đủ nhóm quyền ứng dụng di động (`cat_mobile_app`) lên ma trận phân quyền.
14. **Bảng Tin Mạng Xã Hội B2B Chuẩn Doanh Nhân**:
    - Trình bày ảnh bài viết kiểu Facebook (1 ảnh hero, 2 ảnh tỉ lệ 50/50, 3 ảnh 1 trái 2 phải, 4+ ảnh lưới 2x2 kèm huy hiệu +N).
    - TUYỆT ĐỐI KHÔNG có tính năng bình luận hay thả cảm xúc (like, haha, tim).
    - Chỉ phục vụ 2 hành động giao thương thực chiến: "Nhắn tin" trực tiếp và "Setup cuộc gặp 1-1".
15. **Điều Hướng Màn Hình Đổi Mật Khẩu Bắt Buộc**:
    - Khi `required === "true"`, cho phép hội viên bấm nút "Quay lại màn hình đăng nhập" hoặc mũi tên quay lại để hủy phiên hiện tại và trở về màn hình đăng nhập an toàn.
16. **Tắt Vĩnh Viễn Trợ Lý AI**:
    - Khi người dùng bấm biểu tượng tắt (X) trên widget trợ lý AI, hệ thống tắt hoàn toàn AI (`setVoiceAiEnabled(false)` và `ceo1983_ai_disabled_permanently = true`), triệt tiêu nút thu gọn mini dock, và cấm xuất hiện trên giao diện CRM. Chỉ được kích hoạt lại khi người dùng chủ động bật trong mục Cài đặt.
17. **Truy Vấn Bảng Hệ Thống Không Có Trong Prisma Schema**:
    - Khi truy vấn các bảng hệ thống độc lập như `user_profiles`, bắt buộc dùng raw SQL an toàn (`$executeRawUnsafe` / `$queryRawUnsafe`) để tránh lỗi crash HTTP 500.
