# MỤC 0: TỔNG QUAN KIẾN TRÚC & MA TRẬN NODE HỆ THỐNG CEO 1983 (HANOIBA)
*Tài liệu nguồn chuẩn hóa tải lên Google NotebookLM (Sổ tay: https://notebook.google.com/notebook/6ea9dec4-b8c1-4b4b-a077-d874b625bafd)*
*Phiên bản: 5.0 - Chuẩn hóa kiến trúc phân lập Web CRM & Mobile App kèm Functional Node Indexing*

---

## 1. TÔN CHỈ VẬN HÀNH & PHÂN LẬP 2 PHÂN HỆ ĐỘC LẬP
Hệ thống chuyển đổi số toàn diện của **CLB Doanh Nhân CEO 1983** (trực thuộc HanoiBA) được thiết kế theo mô hình phân lập tuyệt đối thành 2 phân hệ độc lập phục vụ 2 nhóm người dùng có trải nghiệm, quyền hạn và mục đích hoàn toàn khác biệt:

```
                                 ┌─────────────────────────────────────────────────────────┐
                                 │       CƠ SỞ DỮ LIỆU POSTGRESQL 15 (ceo1983_project)     │
                                 │               14.225.217.232:5436                       │
                                 └────────────────────────────┬────────────────────────────┘
                                                              │
                                                              ▼
                                 ┌─────────────────────────────────────────────────────────┐
                                 │            BACKEND API NESTJS 11 (apps/ceo1983_app_be)  │
                                 │               Port 5001 (Pure NestJS, No PostgREST)     │
                                 └──────────────┬───────────────────────────┬──────────────┘
                                                │                           │
                   ┌────────────────────────────┴────────┐ ┌────────────────┴───────────────────────────┐
                   ▼                                     ▼ ▼                                            ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────────────┐ ┌───────────────────────────────────────┐
│     PHÂN HỆ 1: WEB CRM QUẢN TRỊ       │ │     PHÂN HỆ 2: MOBILE APP HỘI VIÊN    │ │    HẠ TẦNG DEVOPS & TRIỂN KHAI    │
│  (Desktop Browser: Laptop/PC 1280px+) │ │   (Mobile Safari, Chrome, Capacitor)  │ │      (Docker, Nginx VPS, SSL)       │
│  - Đối tượng: Chủ tịch, BĐH, Ban TK,  │ │   - Đối tượng: Hội viên Doanh nhân    │ │  - CRM Deploy: deploy/crm (Port 5005)│
│    Trưởng 6 Ban Chuyên Môn, Admin.    │ │     (Chủ tịch HĐQT, CEO, TGĐ 1983).   │ │  - App Deploy: deploy/ceo1983 (5002) │
│  - Layout: DashboardLayout + Sidebar. │ │   - Layout: MemberShell + Bottom Nav. │ │  - Nginx VPS: Port 80, 443 SSL.     │
│  - Bảng biểu Excel, Recharts, Thu Chi.│ │   - Thẻ số QR, B2B Connect, Feed, Deal│ │  - Không bind 80/443 trong container│
└───────────────────────────────────────┘ └───────────────────────────────────────┘ └───────────────────────────────────────┘
```

---

## 2. PHÂN BIỆT RÕ RÀNG GIỮA CRM VÀ MOBILE APP

| Tiêu Chí Phân Biệt | Phân Hệ 1: Web CRM Quản Trị | Phân Hệ 2: Mobile App Hội Viên CEO 1983 |
| :--- | :--- | :--- |
| **Đối tượng sử dụng** | Chủ tịch, Ban Điều Hành, Trưởng 6 ban, Ban Thư Ký, Kế toán, Admin | Hội viên doanh nhân chính thức (sinh năm 1983), Đối tác B2B |
| **Mục đích cốt lõi** | Quản trị, giám sát chỉ số, phê duyệt hồ sơ, thu/chi, giao việc, phân quyền | Kết nối đối tác, danh thiếp số, chia sẻ cơ hội, giao thương B2B, điểm danh họp |
| **Môi trường & Thiết bị** | Máy tính để bàn (Desktop PC/Laptop), màn hình lớn >= 1280px | Màn hình cảm ứng di động (320px - 430px+), iOS/Android/PWA |
| **Khung giao diện (Layout)** | `DashboardLayout`: Sidebar cố định bên trái, Header tìm kiếm & chuông | `MemberShell`: Thanh điều hướng chân trang (Bottom Nav 5 icon) |
| **Thành phần giao diện đặc trưng**| Bảng Excel kéo rê chuột co dãn cột, Biểu đồ Recharts, Xuất/Nhập Excel | Thẻ VIP số, QR cá nhân popup, Dải thẻ ngang, Icon Lucide 5 cột |
| **Bộ mã định danh Node** | **`[NODE-CRM-001]` đến `[NODE-CRM-017]`** | **`[NODE-APP-001]` đến `[NODE-APP-014]`** |
| **Cấu hình triển khai Deploy** | Thư mục `deploy/crm/` (Container Port 5005) | Thư mục `deploy/ceo1983/` (Container Port 5002) |

---

## 3. BẢNG MA TRẬN ĐÁNH DẤU CÁC NODE LUỒNG XỬ LÝ (FUNCTIONAL NODE MATRIX)

### A. Nhóm Node Web CRM Quản Trị ([NODE-CRM-xxx])
1. **`[NODE-CRM-001]` Tổng Quan & Dashboard CLB**: Thẻ KPI tổng quan, lịch sự kiện & cuộc họp tháng, cảnh báo nợ phí niên liễm (`/dashboard`, `OverviewCards.tsx`, `dashboard.service.ts`).
2. **`[NODE-CRM-002]` Trung Tâm Thống Kê Chuyên Sâu 5 Chế Độ**: Menu Sidebar `BarChart3` "Thống kê CLB", 5 chế độ xem: Lưới KPI, Dashboard tổng quan, Treemap ngành nghề, Donut ban ngành, Org Tree cơ cấu tổ chức (`/analytics`, `Sidebar.tsx`, `analytics.service.ts`).
3. **`[NODE-CRM-003]` Quản Trị Danh Bạ Hội Viên 360°**: Hồ sơ pháp lý, người đại diện. Modal sửa chỉ sửa trường cá nhân. Xóa 2 lựa chọn (xóa cty trước hoặc xóa cascade tất cả) (`/members`, `MemberTable.tsx`, `members.service.ts`).
4. **`[NODE-CRM-004]` Quản Trị Doanh Nghiệp Thành Viên**: MST, ngành nghề, quy mô, website, địa chỉ. Cột 3 bảng là Tên doanh nghiệp (`/companies`, `CompanyTable.tsx`, `members.service.ts`).
5. **`[NODE-CRM-005]` Quản Lý Tài Khoản & Gán Ban Chuyên Môn**: Lưu CSDL qua API `PATCH /members/:id/role-dept`, nạp CSDL đè danh sách khi F5, 5 vai trò BĐH hiện ngay click 1, không hardcode email (`/accounts`, `AccountTable.tsx`).
6. **`[NODE-CRM-006]` Ma Trận Phân Quyền RBAC 2 Tab Độc Lập**: Tab 1 "Phân Quyền CRM Web", Tab 2 "Phân Quyền App Mobile", 6 vai trò thành viên ban và 10 quyền di động (`/permissions`, `RbacPermissionMatrix.tsx`).
7. **`[NODE-CRM-007]` Quản Trị Sự Kiện, Vé Check-in & Lucky Draw**: Poster tùy biến khung giờ, Lịch trình Agenda theo giờ, đếm Realtime tham dự, in mã QR điểm danh, cấu hình giải thưởng Lucky Draw (`/events`, `EventPosterModal.tsx`).
8. **`[NODE-CRM-008]` Quản Lý Cuộc Họp Ban & Gặp Gỡ CLB**: Bản đồ tương tác chọn vị trí ghim đỏ Nominatim, tự động đồng bộ sang Sự kiện Mobile (`[Họp Ban]`) và đẩy lên Bảng tin Social (`EVENT_MEETING`) (`/meetings`, `MeetingFormModal.tsx`).
9. **`[NODE-CRM-009]` Quản Lý Thu Ngân Sách, Phí & Vé**: Bảng co dãn cột kéo chuột như Excel (`table-fixed`), Biểu đồ ComposedChart dòng tiền, PieChart nguồn thu & hạng tài trợ, Xuất/Nhập Excel (`/income`, `FinanceChartsSection.tsx`).
10. **`[NODE-CRM-010]` Quản Lý Chi Ngân Sách, Tạm Ứng & Hoàn Ứng**: Phiếu chi, tạm ứng công việc, hoàn ứng tiền thừa. Biểu đồ tròn cơ cấu chi phí thực tế. Hỗ trợ import/export Excel (`/expenses`, `ExpenseModal.tsx`).
11. **`[NODE-CRM-011]` Báo Cáo Tài Chính Tổng Hợp & Quyết Toán**: Dòng tiền ròng Thu - Chi - Thặng Dư tích lũy. Lưới phân tích 4 hạng tài trợ (`/finance-report`, `FinanceChartsSection.tsx`).
12. **`[NODE-CRM-012]` Giao Việc Ban Chuyên Môn & Xem File Đính Kèm**: Nêu rõ người giao (`[Giao việc từ ${creatorDisplayName}]`). Nút "Xem file" (Eye) xem trực tiếp Excel, Lightbox ảnh, PDF (`/tasks`, `TaskFormModal.tsx`).
13. **`[NODE-CRM-013]` Quản Trị Nhà Tài Trợ & Quyền Lợi Thương Hiệu**: 4 Hạng Kim Cương, Vàng, Bạc, Đồng; Quản lý quyền lợi hiển thị banner (`/sponsors`, `SponsorTable.tsx`).
14. **`[NODE-CRM-014]` Kho Tài Liệu CLB & Quản Trị Mẫu Email**: Mẫu email v3 bền vững, thẻ thân thiện `[Mã hội viên]`, `[Tên hội viên]`, đính kèm QR Inline CID (`/documents`, `MailTemplateManager.tsx`).
15. **`[NODE-CRM-015]` Quản Trị Biểu Quyết & Quay Số May Mắn**: Vòng quay nạp động giải thưởng từ API, loại trừ người trúng, tự động trừ số lượng và dispatch email trúng thưởng (`/voting`, `PollManager.tsx`, `LuckyDrawWheel.tsx`).
16. **`[NODE-CRM-016]` Quản Lý Bản Tin & Truyền Thông CLB**: Soạn thảo tin tức, đính kèm ảnh đa phương tiện, phát hành bản tin tới bảng tin mạng xã hội App Mobile (`/news-admin`, `NewsEditorModal.tsx`).
17. **`[NODE-CRM-017]` Gia Hạn Hội Viên & Xử Lý Nợ Phí Niên Liễm**: Khử prefix `RNW-`, tránh lỗi ép kiểu UUID CSDL. LEFT JOIN tài khoản mới nhất (`/renewal`, `RenewalTable.tsx`).

---

### B. Nhóm Node CEO 1983 Mobile App ([NODE-APP-xxx])
1. **`[NODE-APP-001]` Trang Chủ Hội Viên & 4 Phím Tắt Tùy Biến**: Số liệu thật 100% từ CSDL. Tự chọn 4 tính năng chính hiển thị ra trang chủ. Cập nhật nhanh avatar/bìa/logo kiểu Facebook (`/association`, `CustomHomeShortcutsModal.tsx`).
2. **`[NODE-APP-002]` Thẻ Hội Viên VIP Số & QR Cá Nhân**: Logo công ty hội viên ở góc phải trên. Mã QR cá nhân hóa mở popup phóng to. Công tắc bảo mật SĐT và Email. Tích hợp Quét QR thẻ đối tác (`/association/card`, `Ceo1983BusinessCardVisit.tsx`).
3. **`[NODE-APP-003]` Trang Quét Danh Thiếp Công Khai Bảo Mật**: Xem công khai danh thiếp. Tuân thủ quyền riêng tư: Ẩn SĐT/Email sẽ hiện "🔒 Đã ẩn theo cài đặt riêng tư" (`/card/$code`).
4. **`[NODE-APP-004]` Danh Bạ Hội Viên & Hẹn Gặp 1-on-1**: Thanh A-Z cuộn ngang trên điện thoại (`sm:hidden overflow-x-auto`). Nút hành động dàn lưới cân đối (5 cột biểu tượng Lucide). Popup hẹn gặp B2B kèm liên kết cơ hội hợp tác (`/association/members`, `BusinessConnectBottomSheet.tsx`).
5. **`[NODE-APP-005]` Cơ Hội Giao Thương B2B Strip 3 Thẻ Ngang**: TUYỆT ĐỐI KHÔNG để biểu đồ trong màn này. Dải 3 thẻ ngang: "Tổng chia sẻ", "Deal đã chốt", "Tôi share đi" và nút sang Analytics. Bộ lọc 3 trạng thái: Tất cả, Bên mua, Bên bán (`/association/opportunities`).
6. **`[NODE-APP-006]` Trung Tâm Thống Kê & Vinh Danh Top Giver**: Nơi tập trung 100% biểu đồ cơ hội di động (chuyển đổi 3 chế độ). Vinh danh Top 1 Giver nổi bật kèm số lượng & giá trị deal, bảng Top 5 Givers, danh sách ALL cơ hội live filter (`/association/analytics`).
7. **`[NODE-APP-007]` Sàn Giao Thương B2B Giới Hạn 5 Sản Phẩm**: Giới hạn tối đa 5 sản phẩm/DN (chống spam). Huy hiệu `(X/5 sản phẩm)`. Slider tài trợ nền Obsidian Dark viền Amber Gold. Nút nhắn tin trực tiếp người bán (`/association/products`, `ProductPostModal.tsx`).
8. **`[NODE-APP-008]` Lịch Trình Sự Kiện, Họp Ban & Soát Vé QR**: Bọc `EventsErrorBoundary` chống sập trang. Helper an toàn `safeFormatEventDate` chống `Invalid time value`. Tự động gộp Cuộc họp ban (`[Họp Ban]`). Slider tối đa 3 QR vé (`/association/events`).
9. **`[NODE-APP-009]` Biểu Quyết Trực Tuyến Gắn Với Sự Kiện/Họp**: 2 Tab: Biểu quyết đang diễn ra & Lịch sử nghị quyết. Mọi biểu quyết đều gắn liền với Cuộc họp hoặc Sự kiện chính thức (`/association/voting`).
10. **`[NODE-APP-010]` Bảng Tin Mạng Xã Hội, Comment & Đánh Dấu Họp**: Nút Icon Bình luận đặt cạnh nút Icon Chia sẻ bên phải thanh tương tác. Nút "Đánh dấu cuộc họp vào hồ sơ cá nhân" tự động ghi nhận vào lịch sử hoạt động hội viên (`/association/messages`, `FeedView.tsx`).
11. **`[NODE-APP-011]` Hồ Sơ Cá Nhân & Quản Trị RBAC Nhanh**: Định danh lãnh đạo trang trọng, xem hợp đồng và liên kết thẻ số. Nút "Phân quyền Hội viên (BQT)" mở sang `/association/permissions` nếu có quyền Admin (`/association/profile`).
12. **`[NODE-APP-012]` Cài Đặt Hệ Thống, Trợ Lý AI & Đổi Mật Khẩu**: Đồng bộ 3 khối: Cài đặt hệ thống, Thông tin hỗ trợ 24/7 (Hotline, Email), Đổi mật khẩu bắt buộc & Bảo mật (`/association/settings`, `AccountSecuritySettingsForm.tsx`).
13. **`[NODE-APP-013]` Kho Đặc Quyền & Quà Tặng Sự Kiện**: Nơi lưu giữ các voucher, quà tặng trúng giải từ Vòng quay may mắn Lucky Draw (`/association/perks`).
14. **`[NODE-APP-014]` Cầu Nối Native Android / iOS & Push Service Worker**: Trong `sw.js` bọc `Notification.permission === 'granted'` và `.catch()`. Android Java cầu nối Capacitor WebView an toàn (`mobile_ceo1983`, `MainActivity.java`).

---

### C. Nhóm Node Hạ Tầng Dùng Chung ([NODE-CORE-xxx])
1. **`[NODE-CORE-001]` Xác Thực & Bảo Mật JWT, Guard RBAC**: `auth.service.ts`, `jwt.strategy.ts`, `roles.guard.ts`.
2. **`[NODE-CORE-002]` CSDL PostgreSQL & Prisma ORM**: Host `14.225.217.232:5436`, database `ceo1983_project`.
3. **`[NODE-CORE-003]` Realtime Socket.IO Gateway**: `events.gateway.ts`, `notifications.gateway.ts`.
4. **`[NODE-CORE-004]` Triển Khai Độc Lập Mobile App CEO 1983**: Thư mục `deploy/ceo1983/`, Docker Compose Port 5002.
5. **`[NODE-CORE-005]` Triển Khai Độc Lập Web CRM Quản Trị**: Thư mục `deploy/crm/`, Docker Compose Port 5005.
6. **`[NODE-CORE-006]` Nginx VPS & Chứng Chỉ SSL Let's Encrypt**: Port 80 & 443 độc quyền trên VPS Nginx host.
