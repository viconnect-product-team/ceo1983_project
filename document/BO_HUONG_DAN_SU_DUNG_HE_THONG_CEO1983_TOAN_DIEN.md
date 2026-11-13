# BỘ HƯỚNG DẪN SỬ DỤNG TOÀN DIỆN HỆ SINH THÁI SỐ CEO 1983
## TÀI LIỆU VẬN HÀNH ĐỒNG BỘ 2 SUBDOMAIN: WEB CRM QUẢN TRỊ & MOBILE APP HỘI VIÊN
*Hiệp Hội Doanh Nhân CEO 1983 (HanoiBA) — Phiên bản: 5.0 (Năm 2026)*

---

## 1. TỔNG QUAN KIẾN TRÚC PHÂN TÁCH 2 SUBDOMAIN

Hệ thống số hóa CLB Doanh Nhân CEO 1983 (HanoiBA) được kiến trúc phân lập chuyên nghiệp thành **2 Subdomain độc lập**, phục vụ 2 nhóm đối tượng người dùng với giao diện và luồng nghiệp vụ chuyên biệt:

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │      CƠ SỞ DỮ LIỆU CHUNG (POSTGRESQL 15 / PRISMA)      │
                                  │           VÀ BACKEND API LÕI NESTJS (PORT 4000)        │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │
                                      ┌───────────────────────┴───────────────────────┐
                                      │                                               │
                                      ▼                                               ▼
         ┌──────────────────────────────────────────────┐    ┌──────────────────────────────────────────────┐
         │         SUBDOMAIN 1: WEB CRM QUẢN TRỊ        │    │         SUBDOMAIN 2: MOBILE APP HỘI VIÊN     │
         │     🌐 https://crm.ceo1983.viconnect.vn      │    │         📱 https://ceo1983.viconnect.vn      │
         ├──────────────────────────────────────────────┤    ├──────────────────────────────────────────────┤
         │ • Đối tượng: Chủ tịch, BĐH, 6 Ban, Admin    │    │ • Đối tượng: Hội viên Doanh nhân, Đối tác B2B│
         │ • Môi trường: Desktop Web, Sidebar cố định   │    │ • Môi trường: Mobile-First VIP Shell, 5 Tabs │
         │ • Chức năng: 24 Functional Nodes CRM        │    │ • Chức năng: 17 Functional Nodes Mobile App  │
         │ • Nghiệp vụ: Duyệt hồ sơ, Quản lý tài chính, │    │ • Nghiệp vụ: Thẻ VIP số, QR Danh thiếp, Sàn  │
         │   Giao việc, Ma trận RBAC, Theme Studio,     │    │   B2B, Giao thương 1-1, Biểu quyết, Sự kiện, │
         │   Bắn mạng lưới đa kênh, Báo cáo A4/Excel   │    │   Check-in vé QR, Nhắc hẹn thời gian thực   │
         └──────────────────────────────────────────────┘    └──────────────────────────────────────────────┘
```

---

## 2. MA TRẬN ĐỐI CHIẾU DỮ LIỆU ĐỒNG BỘ 2 CHIỀU (CROSS-SYSTEM TRACEABILITY)

Dưới đây là ma trận ánh xạ luồng tương tác thời gian thực giữa hành động quản trị trên Web CRM và trải nghiệm nhận diện của Hội viên trên Mobile App:

| Luồng Nghiệp Vụ | Thao Tác Của Ban Điều Hành Trên Web CRM (`crm.ceo1983.viconnect.vn`) | Phản Hồi Thời Gian Thực Trên Mobile App (`ceo1983.viconnect.vn`) | Bảng Dữ Liệu PostgreSQL |
| :--- | :--- | :--- | :--- |
| **1. Kết Nạp Hội Viên** | Ban Thư Ký nhấp **[Phê duyệt & Cấp tài khoản]** tại `[NODE-CRM-003]` | Hội viên nhận email kích hoạt, đăng nhập app thấy ngay Thẻ VIP số tại `[NODE-APP-002]` | `members`, `vione_users` |
| **2. Phân Quyền Ban** | Admin gán chức vụ Ban Chuyên Môn tại `[NODE-CRM-005]` | Huy hiệu chức vụ và quyền hạn trên app cập nhật ngay lập tức tại `[NODE-APP-011]` | `members.executive_role`, `departments` |
| **3. Bắn Mạng Lưới Sự Kiện** | Ban Sự Kiện tạo sự kiện và bấm **[Bắn Mạng Lưới]** tại `[NODE-CRM-007]` | Bảng tin Mạng lưới (`Feed`) trên app hiện bài phát thanh kèm poster và nút đặt vé tại `[NODE-APP-010]` | `events`, `feed_posts` |
| **4. Đối Soát Vé Sự Kiện** | Kế toán xác nhận **[✓ Đã thanh toán]** tại danh sách đăng ký vé | Hội viên mở app thấy Thẻ vé QR Check-in chuyển từ Chờ nộp sang Kích hoạt chính thức tại `[NODE-APP-008]` | `event_registrations` |
| **5. Biểu Quyết Trực Tuyến** | Ban Thư Ký khởi tạo phiên biểu quyết nghị quyết tại `[NODE-CRM-015]` | Hội viên nhận thông báo và tham gia bỏ phiếu điện tử 1 chạm tại `[NODE-APP-009]` | `polls`, `poll_votes` |
| **6. Giao Thương B2B** | Lãnh đạo trao cơ hội kinh doanh đa điểm tại `[NODE-CRM-020]` | Các CEO nhận thông báo đẩy, vào mục Cơ hội B2B xúc tiến deal tại `[NODE-APP-005]` | `opportunities` |
| **7. Quản Trị Sàn B2B** | Admin kiểm duyệt danh mục và tiêu chuẩn sản phẩm | Hội viên đăng tối đa 5 sản phẩm, xem sàn thương mại nội bộ tại `[NODE-APP-007]` | `products` |
| **8. Đồng Bộ Theme Giao Diện** | Admin đổi chủ đề (Mùa Lễ Hội / Hoàng Gia) tại `[NODE-CRM-021]` | Toàn bộ app của hội viên tự động đổi màu sắc và hình nền hoa đào/mai (`--festival-bg-image`) | `landing_templates`, `system_settings` |
| **9. Nhắc Phí Niên Liễm** | Kế toán nhấp **[Gửi thông báo gia hạn]** tại `[NODE-CRM-017]` | Hội viên nhận email kèm mã VietQR MB Bank chuyển khoản niên liễm tự động | `income_records`, `members` |
| **10. Đào Tạo Trực Tuyến** | Giảng viên mở phòng Video Call tại `[NODE-CRM-018]` | Hội viên nhấp nút **[Vào Phòng Học]** gọi video call Jitsi trực tiếp tại `[NODE-APP-016]` | `trainings` |

---

## 3. DANH MỤC TÀI NGUYÊN HÌNH ẢNH MINH CHỨNG THỰC TẾ

Tất cả hình ảnh trong bộ tài liệu đều được chụp trực tiếp từ môi trường Production thực tế của 2 Subdomain thông qua công cụ tự động hóa Playwright chất lượng cao:

### 3.1. Hình Ảnh Web CRM Quản Trị (`document/images/guide_crm/`)
1. [00_crm_login.png](./images/guide_crm/00_crm_login.png) — Màn hình Đăng nhập Hệ thống CRM
2. [01_crm_dashboard.png](./images/guide_crm/01_crm_dashboard.png) — [NODE-CRM-001] Dashboard KPI & Lịch hoạt động
3. [02_crm_analytics.png](./images/guide_crm/02_crm_analytics.png) — [NODE-CRM-002] Thống kê chuyên sâu 5 danh mục & Bục vinh danh
4. [03_crm_members_list.png](./images/guide_crm/03_crm_members_list.png) — [NODE-CRM-003] Quản trị Danh bạ Hội viên 360°
5. [04_crm_member_detail_drawer.png](./images/guide_crm/04_crm_member_detail_drawer.png) — [NODE-CRM-003] Drawer chi tiết & Phê duyệt kết nạp
6. [05_crm_companies_list.png](./images/guide_crm/05_crm_companies_list.png) — [NODE-CRM-004] Quản trị Doanh nghiệp thành viên
7. [06_crm_company_edit_modal.png](./images/guide_crm/06_crm_company_edit_modal.png) — [NODE-CRM-004] Modal chỉnh sửa doanh nghiệp
8. [07_crm_accounts_list.png](./images/guide_crm/07_crm_accounts_list.png) — [NODE-CRM-005] Quản lý Tài khoản & 6 Ban Chuyên Môn
9. [08_crm_account_role_dept_modal.png](./images/guide_crm/08_crm_account_role_dept_modal.png) — [NODE-CRM-005] Gán chức vụ điều hành 1 chạm
10. [09_crm_permissions_matrix.png](./images/guide_crm/09_crm_permissions_matrix.png) — [NODE-CRM-006] Ma trận phân quyền RBAC 2 Tab độc lập
11. [10_crm_events_list.png](./images/guide_crm/10_crm_events_list.png) — [NODE-CRM-007] Quản trị Sự kiện & Phát hành vé
12. [11_crm_event_create_modal.png](./images/guide_crm/11_crm_event_create_modal.png) — [NODE-CRM-007] Modal tạo sự kiện 3 bước chuẩn hóa
13. [11_b_crm_event_detail_hub.png](./images/guide_crm/11_b_crm_event_detail_hub.png) — [NODE-CRM-007] Trung tâm Điều hành Sự kiện Chi tiết Hub (Countdown, Poster, Gatekeeper)
14. [11_c_crm_event_registrations_tickets.png](./images/guide_crm/11_c_crm_event_registrations_tickets.png) — [NODE-CRM-007] Quản lý Đăng ký & Vé Sự kiện Đa Phân Hạng (/event-registrations)
15. [11_d_crm_event_seating_setup.png](./images/guide_crm/11_d_crm_event_seating_setup.png) — [NODE-CRM-007] Sơ đồ Chỗ ngồi & Xếp Bàn Tiệc Đại biểu CinemaSeatingMap
16. [11_e_crm_event_poster_and_qr_modal.png](./images/guide_crm/11_e_crm_event_poster_and_qr_modal.png) — [NODE-CRM-007] Poster Sự kiện & QR Check-in Điểm danh Gatekeeper
17. [11_f_crm_event_guest_qr_presenter.png](./images/guide_crm/11_f_crm_event_guest_qr_presenter.png) — [NODE-CRM-007] Trình chiếu Mã QR Đăng ký Khách mời Zalo
18. [12_crm_meetings_list.png](./images/guide_crm/12_crm_meetings_list.png) — [NODE-CRM-008] Quản lý Cuộc họp Ban & Gặp gỡ CLB
19. [13_crm_meeting_create_modal.png](./images/guide_crm/13_crm_meeting_create_modal.png) — [NODE-CRM-008] Modal tạo cuộc họp & Bản đồ Nominatim
20. [14_crm_income_list.png](./images/guide_crm/14_crm_income_list.png) — [NODE-CRM-009] Quản lý Thu ngân sách & Niên liễm
21. [15_crm_expenses_list.png](./images/guide_crm/15_crm_expenses_list.png) — [NODE-CRM-010] Quản lý Chi ngân sách & Tạm ứng/Hoàn ứng
22. [16_crm_finance_report.png](./images/guide_crm/16_crm_finance_report.png) — [NODE-CRM-011] Báo cáo Tài chính tổng hợp & Sổ quỹ S07-DN
23. [17_crm_tasks_kanban.png](./images/guide_crm/17_crm_tasks_kanban.png) — [NODE-CRM-012] Giao việc Ban chuyên môn & Kanban
24. [19_crm_sponsors_list.png](./images/guide_crm/19_crm_sponsors_list.png) — [NODE-CRM-013] Quản trị Nhà tài trợ 4 phân hạng & VietQR
25. [20_crm_documents_list.png](./images/guide_crm/20_crm_documents_list.png) — [NODE-CRM-014] Kho Tài liệu & Universal Document Viewer
26. [21_crm_voting_and_luckydraw.png](./images/guide_crm/21_crm_voting_and_luckydraw.png) — [NODE-CRM-015] Quản trị Biểu quyết & Vòng quay Lucky Draw
27. [22_crm_news_admin.png](./images/guide_crm/22_crm_news_admin.png) — [NODE-CRM-016] Quản lý Bản tin & Soạn thảo truyền thông
28. [23_crm_renewal_list.png](./images/guide_crm/23_crm_renewal_list.png) — [NODE-CRM-017] Gia hạn hội viên & Xử lý nợ phí niên liễm
29. [24_crm_trainings_list.png](./images/guide_crm/24_crm_trainings_list.png) — [NODE-CRM-018] Quản trị Đào tạo & Video Call Jitsi
30. [25_crm_activity_logs.png](./images/guide_crm/25_crm_activity_logs.png) — [NODE-CRM-019] Nhật ký an ninh thao tác Audit Log
31. [26_crm_opportunities_list.png](./images/guide_crm/26_crm_opportunities_list.png) — [NODE-CRM-020] Trao cơ hội B2B đa điểm
32. [27_crm_theme_studio.png](./images/guide_crm/27_crm_theme_studio.png) — [NODE-CRM-021] Theme Studio 5 VIP Presets & Live Preview
33. [28_crm_notifications_hub.png](./images/guide_crm/28_crm_notifications_hub.png) — [NODE-CRM-022] Trung tâm thông báo & Cảnh báo hội phí
34. [29_crm_landing_webs.png](./images/guide_crm/29_crm_landing_webs.png) — [NODE-CRM-023] Landing Web Pinterest Showcase (Timed Cards & iPhone 16)
35. [30_crm_templates_hub.png](./images/guide_crm/30_crm_templates_hub.png) — [NODE-CRM-024] Omnichannel Invitation Studio (Thư mời, Zalo OA/ZNS, Email v3)
36. [responsive_crm_desktop_1440.png](./images/guide_crm/responsive_crm_desktop_1440.png) — CRM Responsive hiển thị chuẩn Desktop (1440x900)
37. [responsive_crm_tablet_1024.png](./images/guide_crm/responsive_crm_tablet_1024.png) — CRM Responsive hiển thị trên Tablet (1024x768)
38. [responsive_crm_mobile_390.png](./images/guide_crm/responsive_crm_mobile_390.png) — CRM Responsive hiển thị trên Smartphone Mobile (390x844)

### 3.2. Hình Ảnh Mobile App Hội Viên (`document/images/guide_app/`)
1. [00_app_login.png](./images/guide_app/00_app_login.png) — Màn hình Đăng nhập Di động Hội viên
2. [01_app_home_ticker.png](./images/guide_app/01_app_home_ticker.png) — [NODE-APP-001] Trang chủ Ticker nến Realtime & Shortcut chat
3. [01_b_app_notifications_center.png](./images/guide_app/01_b_app_notifications_center.png) — [NODE-APP-001] Trung tâm Thông báo Đa kênh Hội viên (/association/notifications)
4. [01_c_app_theme_switcher_modal.png](./images/guide_app/01_c_app_theme_switcher_modal.png) — [NODE-APP-001] Cài đặt Giao diện & Bộ chọn Màu Brandbook 4 màu (/association/system-config)
5. [01_d_app_theme_dark_mode.png](./images/guide_app/01_d_app_theme_dark_mode.png) — [NODE-APP-001] Giao diện Chế độ Tối (Dark Mode) Doanh nhân
6. [02_app_vip_card.png](./images/guide_app/02_app_vip_card.png) — [NODE-APP-002] Thẻ Hội viên VIP số 2 mặt & QR cá nhân hóa
7. [03_app_public_card.png](./images/guide_app/03_app_public_card.png) — [NODE-APP-003] Trang quét danh thiếp công khai bảo mật
8. [04_app_members_directory.png](./images/guide_app/04_app_members_directory.png) — [NODE-APP-004] Danh bạ Hội viên & Tìm kiếm đối tác
9. [05_app_opportunities_strip.png](./images/guide_app/05_app_opportunities_strip.png) — [NODE-APP-005] Cơ hội giao thương B2B Strip 3 thẻ ngang
10. [06_app_analytics_dashboard.png](./images/guide_app/06_app_analytics_dashboard.png) — [NODE-APP-006] Trung tâm Thống kê & Bục vinh danh Top 3
11. [07_app_marketplace_products.png](./images/guide_app/07_app_marketplace_products.png) — [NODE-APP-007] Sàn B2B Marketplace giới hạn 5 sản phẩm/DN
12. [08_app_events_and_meetings.png](./images/guide_app/08_app_events_and_meetings.png) — [NODE-APP-008] Sự kiện lớn & Họp mặt 2 kiểu YBA
13. [08_b_app_event_ticket_qr_modal.png](./images/guide_app/08_b_app_event_ticket_qr_modal.png) — [NODE-APP-008] Chi tiết Sự kiện & Vé QR Check-in có gán số bàn tiệc
14. [09_app_voting_online.png](./images/guide_app/09_app_voting_online.png) — [NODE-APP-009] Biểu quyết trực tuyến Realtime
15. [10_app_moments_feed.png](./images/guide_app/10_app_moments_feed.png) — [NODE-APP-010] Bảng tin mạng lưới Moments & Thẻ Check-in
16. [10_b_app_messages_chat_1on1.png](./images/guide_app/10_b_app_messages_chat_1on1.png) — [NODE-APP-010] Màn hình Tin nhắn & Trò chuyện B2B 1-on-1 thời gian thực
17. [11_app_profile_view.png](./images/guide_app/11_app_profile_view.png) — [NODE-APP-011] Hồ sơ cá nhân tối giản & Hợp đồng điện tử
18. [12_app_settings.png](./images/guide_app/12_app_settings.png) — [NODE-APP-012] Cài đặt hệ thống, Trợ lý AI & Đổi mật khẩu
19. [13_app_perks_benefits.png](./images/guide_app/13_app_perks_benefits.png) — [NODE-APP-013] Danh sách Ưu đãi QR động & Điểm áp dụng
20. [14_app_b2b_connect.png](./images/guide_app/14_app_b2b_connect.png) — [NODE-APP-015] Phân hệ Kết nối B2B 1-on-1 độc lập
21. [15_app_training.png](./images/guide_app/15_app_training.png) — [NODE-APP-016] Đào tạo di động & Video Call Jitsi Meet
22. [16_app_calendar.png](./images/guide_app/16_app_calendar.png) — [NODE-APP-017] Lịch hoạt động & Nhắc hẹn Active Reminder

---

## 4. QUY TRÌNH VẬN HÀNH KHÉP KÍN 6 BƯỚC (END-TO-END BUSINESS LIFECYCLE)

Để toàn bộ hệ thống hoạt động trơn tru, Ban Điều Hành và Hội viên tuân thủ quy trình 6 bước khép kín sau:

```
  BƯỚC 1: Đăng ký gia nhập qua Landing Page (https://ceo1983.viconnect.vn/landing/ceo1983)
     │
     ▼
  BƯỚC 2: Ban Thư Ký tiếp nhận, thẩm định và phê duyệt trên CRM (https://crm.ceo1983.viconnect.vn/members)
     │
     ▼
  BƯỚC 3: Hệ thống sinh tài khoản an toàn, gửi thư kích hoạt tự động kèm mã QR qua email
     │
     ▼
  BƯỚC 4: Doanh nhân đăng nhập Mobile App, nhận Thẻ VIP số, cấu hình quyền riêng tư và niêm yết 5 sản phẩm
     │
     ▼
  BƯỚC 5: Tham gia sinh hoạt: Đặt lịch 1-on-1, trao cơ hội B2B, điểm danh QR tại Gala, bỏ phiếu biểu quyết
     │
     ▼
  BƯỚC 6: Hệ thống tự động ghi nhận điểm cống hiến, tôn vinh Top 3 Giver và kế toán quyết toán sổ quỹ
```

---

## 5. THÔNG TIN HỖ TRỢ & BÀN GIAO KỸ THUẬT

- **Đơn vị phát triển nền tảng**: Công ty Cổ phần Công nghệ ViConnect
- **Đơn vị thụ hưởng**: Câu Lạc Bộ Doanh Nhân CEO 1983 — Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA)
- **Tài khoản ngân hàng quỹ CLB**:
  - **Ngân hàng**: Ngân hàng TMCP Quân Đội (MB Bank)
  - **Số tài khoản**: `1983000000`
  - **Chủ tài khoản**: `CLB DOANH NHAN CEO 1983`
- **Tài liệu tham chiếu liên quan**:
  - Cẩm nang chi tiết Web CRM: [HDSD_WEB_CRM_CHI_TIET.md](./HUONG_DAN_SU_DUNG_WEB_CRM_CHI_TIET.md)
  - Cẩm nang chi tiết Mobile App: [HDSD_APP_MOBILE_CHI_TIET.md](./HUONG_DAN_SU_DUNG_APP_MOBILE_CHI_TIET.md)
  - Ma trận Traceability Nodes: [.agents/rules/node-matrix.md](../.agents/rules/node-matrix.md)

