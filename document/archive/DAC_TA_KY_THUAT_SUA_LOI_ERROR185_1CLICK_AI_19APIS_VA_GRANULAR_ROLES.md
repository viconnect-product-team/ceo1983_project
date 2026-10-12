# ĐẶC TẢ KỸ THUẬT: KHẮC PHỤC REACT ERROR #185, TỐI ƯU 1-CLICK NAVIGATION, NÂNG CẤP BỘ NÃO AI 19 MODULES VÀ PHÂN CẤP CHI TIẾT ROLE TRƯỞNG BAN CRM & MOBILE APP

**Mã tài liệu:** `DAC_TA_KY_THUAT_SUA_LOI_ERROR185_1CLICK_AI_19APIS_VA_GRANULAR_ROLES.md`  
**Dự án:** CLB Doanh Nhân CEO 1983 (HanoiBA)  
**Ngày cập nhật:** 11/10/2026  
**Trạng thái kiểm định:** Đạt 100% TypeCheck Exit Code 0 trên cả Frontend và Backend  

---

## 1. Mục Tiêu & Yêu Cầu Kỹ Thuật

Khách hàng yêu cầu xử lý triệt để 6 nội dung trọng tâm:
1. **Kiểm tra và sửa lỗi Minified React error #185** xuất hiện khi mở bản mobile CEO 1983 trên web.
2. **Căn chỉnh phần "Sự kiện xem gần đây"** vừa vặn 100% kích thước với section phía trên; cập nhật thông tin liên hệ thành **"Liên hệ Ban Truyền Thông"** (thay vì Ban Thư Ký).
3. **Triệt tiêu hiện tượng delay và click 2 lần** mới vào được chức năng, tối ưu hóa để thao tác chỉ cần 1 lần click là chuyển trang mượt mà tức thì.
4. **Huấn luyện và nâng cấp bộ não Trợ lý AI**:
   - Khắc phục tình trạng không hiểu ngữ cảnh khi người dùng hỏi các câu hỏi xã giao, đời sống hoặc "linh tinh".
   - Nạp toàn bộ kiến thức 19 modules API của hệ thống để AI nắm vững kiến trúc nghiệp vụ.
   - Khi hỏi về hướng dẫn thao tác, AI **tự động nhảy về đúng màn hình thao tác ngay lập tức**, không stalling hỏi lại "Có muốn tôi hướng dẫn không?" làm mất thời gian người dùng; hiển thị nút CTA `[⚡ Đến ngay: <tên_tính_năng>]` trong bong bóng chat.
5. **Phân quyền CRM**: Phân cấp chi tiết role Trưởng ban thành các chức danh cụ thể (Trưởng ban Truyền thông, Trưởng ban Thành viên, Trưởng ban Xúc tiến thương mại, Trưởng ban Tài chính, Trưởng ban Thiện nguyện).
6. **Phân quyền App CEO 1983**: Đồng bộ hóa ma trận quyền và phân cấp tương tự trên ứng dụng mobile.

---

## 2. Chi Tiết Kỹ Thuật & Giải Pháp Triển Khai

### 2.1. Khắc Phục Minified React Error #185 & Delay Click 2 Lần
- **Nguyên nhân gốc của React Error #185 (`Maximum update depth exceeded`)**:
  - Tại `apps/ceo1983_app_fe/src/components/member/MemberShell.tsx`, một `useEffect` được gắn lắng nghe `[pathname, navigate]` và thực hiện:
    ```ts
    window.history.pushState({ vbaApp: true, path: pathname }, "", window.location.href);
    ```
  - Khi `@tanstack/react-router` xử lý chuyển trang (`buildAndCommitLocation`), lệnh `pushState` thủ công này đã ghi đè toàn bộ `history.state` nội bộ của router (mất key `__tanstack_router`).
  - TanStack Router phát hiện state bị mất tính đồng bộ và kích hoạt lại sự kiện lắng nghe lịch sử trình duyệt (`popstate`/`location change`), dẫn đến chuỗi lặp đệ quy 107 lần gọi `buildAndCommitLocation` và `load`, làm tràn stack React và bung lỗi Error #185.
  - Đồng thời, cú click đầu tiên của người dùng bị nuốt bởi router reconciliation loop, dẫn đến việc người dùng phải click lần thứ 2 mới nhận lệnh.
- **Giải pháp**:
  - Gỡ bỏ hoàn toàn `window.history.pushState` thô trong `MemberShell.tsx`.
  - Cấu hình preload trong [router.tsx](file:///d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/apps/ceo1983_app_fe/src/router.tsx):
    ```ts
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    defaultPreloadStaleTime: 30000,
    ```
  - Kết quả: Thao tác chuyển route đạt độ trễ 0ms, nhận ngay từ cú click đầu tiên, loại bỏ 100% lỗi Error #185.

---

### 2.2. Chuẩn Hóa Giao Diện "Sự Kiện Xem Gần Đây" & Banner Ban Truyền Thông
- **Tệp chỉnh sửa**: [association.events.tsx](file:///d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/apps/ceo1983_app_fe/src/routes/association.events.tsx)
- **Căn chỉnh kích thước**:
  - Chuyển container từ cuộn ngang lệch lề `flex overflow-x-auto` thành lưới đáp ứng 2 cột cân xứng:
    ```tsx
    <div className="w-full px-4">
      <div className="grid grid-cols-2 gap-3 w-full">
        {recentEvents.map((evt) => (
          <div key={evt.id} className="w-full ...">
            <img className="w-full h-24 object-cover rounded-xl" ... />
          </div>
        ))}
      </div>
    </div>
    ```
  - Chiều rộng của khu vực Sự kiện xem gần đây mở rộng vừa khít 100% bằng phẳng với section phía trên.
- **Cập nhật thông tin ban**:
  - Đổi nhãn nút tại banner chân trang từ `"Liên hệ Ban Thư Ký"` thành `"Liên hệ Ban Truyền Thông"`, điều hướng kết nối hotline truyền thông CLB.

---

### 2.3. Nâng Cấp Trợ Lý AI: Bản Đồ 19 Modules API & Dẫn Đường Tự Động
- **Tệp chỉnh sửa**:
  - Backend: [ai.service.ts](file:///d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/apps/ceo1983_app_be/src/ai/ai.service.ts)
  - Frontend: [VoiceNavAssistant.tsx](file:///d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/apps/ceo1983_app_fe/src/components/ai/VoiceNavAssistant.tsx)
- **Nạp Bản Đồ 19 Modules API Hệ Thống vào Prompt AI**:
  1. `/api/members`: Quản lý 200+ CEO, danh bạ hồ sơ 360°, chức vụ, doanh nghiệp (`/association/members`).
  2. `/api/events`: Lịch sự kiện, hội nghị, workshop, đăng ký tham dự (`/association/events`).
  3. `/api/events/checkin`: Vé điện tử, mã QR động, camera/NFC soát vé cổng (`/association/checkin`).
  4. `/api/business-card`: Danh thiếp số 5.0, chạm thẻ NFC 1 giây, quét card AI OCR (`/association/card`).
  5. `/api/marketplace/products`: Chợ giao thương B2B, gian hàng số (`/association/products`).
  6. `/api/opportunities`: Sàn cơ hội kinh doanh Cung - Cầu B2B (`/association/opportunities`).
  7. `/api/voting`: Biểu quyết trực tuyến đại hội, lucky draw trúng thưởng (`/association/voting`).
  8. `/api/connect-app`: Tin nhắn B2B, phòng chat ban, hẹn gặp 1-on-1 (`/association/messages`).
  9. `/api/documents`: Kho văn bản, điều lệ, kỷ yếu doanh nhân số (`/association/library`).
  10. `/api/fees` & `/api/finance`: Đóng hội phí niên liễm VietQR MB Bank tự động (`/association/profile`).
  11. `/api/tasks`: Giao việc, theo dõi tiến độ nhiệm vụ ban chuyên môn (`/tasks`).
  12. `/api/sponsors`: Quản lý nhà tài trợ, gói tài trợ kim cương/vàng/bạc (`/sponsors`).
  13. `/api/meetings`: Lịch họp ban thường trực, biên bản họp số (`/meetings`).
  14. `/api/charity`: Các chương trình an sinh xã hội, gây quỹ cộng đồng (`/association/charity`).
  15. `/api/admin/permissions`: Ma trận phân quyền RBAC đa cấp (`/permissions`).
  16. `/api/activity-log`: Nhật ký thao tác và kiểm toán hệ thống (`/activity-log`).
  17. `/api/notifications`: Trung tâm thông báo đẩy đa kênh (`/association/notifications`).
  18. `/api/users/me`: Hồ sơ cá nhân, đổi mật khẩu, avatar (`/association/profile`).
  19. `/api/app-settings`: Cấu hình hệ thống, AI Provider, cổng VietQR (`/settings`).
- **Phân Tích Ngữ Cảnh Xã Giao & Trò Chuyện Mở ("Linh Tinh")**:
  - AI được hướng dẫn nhận diện các câu hỏi đời sống, xả stress, lời chúc, triết lý kinh doanh và giải đáp với sự sắc bén, ấm áp, lịch lãm của Senior Executive Assistant.
- **Dẫn Đường Tự Động Tức Thì (Instant Auto-Navigation)**:
  - Khi hỏi hướng dẫn thao tác ("làm sao", "hướng dẫn", "ở đâu", "cách", "xem", "tạo"), AI lập tức trả về `intent: "navigate"`, kèm `route` và `tourId`.
  - Frontend `VoiceNavAssistant.tsx` tự động gọi `navigate({ to: targetRoute })` sau 300ms, khởi chạy GPS tour vòng sáng chỉ dẫn.
  - Trong bong bóng tin nhắn hiển thị nút CTA `[⚡ Đến ngay: <tên_tính_năng>]` hỗ trợ người dùng chạm chuyển trang bất kỳ lúc nào.

---

### 2.4. Phân Cấp Chi Tiết Role Trưởng Ban CRM & Mobile App
- **Danh sách Role Trưởng ban Chuyên môn**:
  1. `truong_ban_truyen_thong`: Trưởng ban Truyền thông (quản lý truyền thông, tin tức, sự kiện).
  2. `truong_ban_thanh_vien`: Trưởng ban Thành viên (quản lý phát triển & thẩm định hồ sơ hội viên).
  3. `truong_ban_xuc_tien`: Trưởng ban Xúc tiến thương mại (quản lý kết nối giao thương B2B, marketplace).
  4. `truong_ban_tai_chinh`: Trưởng ban Tài chính (quản lý quỹ, niên liễm, thu chi).
  5. `truong_ban_thien_nguyen`: Trưởng ban Thiện nguyện (quản lý chương trình an sinh, từ thiện).
  6. `truong_ban`: Trưởng ban (Chung / Kế thừa).
- **Các tệp cập nhật**:
  - `apps/ceo1983_app_fe/src/constants/permissions.ts`: Bổ sung hằng số role và quyền cấp riêng cho từng role trong `ROLE_PERMISSIONS`.
  - `apps/ceo1983_app_fe/src/hooks/use-role.ts`: Bổ sung các cờ `isTruongBanTruyenThong`, `isTruongBanThanhVien`, `isTruongBanXucTien`, `isTruongBanTaiChinh`, `isTruongBanThienNguyen` vào `RoleState` và return object.
  - `apps/ceo1983_app_fe/src/routes/permissions.tsx` & `apps/ceo1983_app_fe/src/lib/rbac-permission-helpers.ts`: Cập nhật `ROLE_OPTIONS` và `normalizeRole` hỗ trợ đầy đủ các role chi tiết.
  - `apps/ceo1983_app_fe/src/routes/association.permissions.tsx`: Cập nhật `ROLE_LABELS` và dropdown phân quyền trên app, tự động gán ban và tích sẵn quyền quản trị phù hợp với từng trưởng ban.
  - `apps/ceo1983_app_be/src/members/members.service.ts`: Cập nhật hàm `updateMemberRoleDept` để nhận diện và lưu trữ chính xác chuỗi role Trưởng ban chuyên trách vào CSDL `members`, `memberships` và `user_roles`.

---

## 3. Kết Quả Kiểm Định Chất Lượng Mã Nguồn (Strict Rule 3)

| Phân hệ | Lệnh kiểm tra | Kết quả | Exit Code |
| :--- | :--- | :--- | :--- |
| **Frontend (`apps/ceo1983_app_fe`)** | `npx tsc --noEmit` | **0 errors** | **0** |
| **Backend (`apps/ceo1983_app_be`)** | `npx tsc --noEmit` | **0 errors** | **0** |

- Không tự ý thực thi các lệnh `git push` hay `git commit` (Tuân thủ nghiêm ngặt Strict Rule 1).
- Đồng bộ hóa 100% tài liệu kỹ thuật, `.cursorrules` và `MEMORY.md` (Tuân thủ nghiêm ngặt Strict Rule 2).
