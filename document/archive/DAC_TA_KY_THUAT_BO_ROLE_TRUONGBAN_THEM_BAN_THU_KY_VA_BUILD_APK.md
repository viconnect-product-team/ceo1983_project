# ĐẶC TẢ KỸ THUẬT: LOẠI BỎ TOÀN BỘ ROLE TRƯỞNG BAN CHUNG, BỔ SUNG BAN THƯ KÝ VÀ BIÊN DỊCH BẢN BUILD ANDROID APK MỚI NHẤT

## 1. BỐI CẢNH & YÊU CẦU NGHIỆP VỤ TỪ NGƯỜI DÙNG

### 1.1. Yêu Cầu Cốt Lõi
- **Loại bỏ triệt để Role Trưởng ban chung (`truong_ban`)**:
  - Không tồn tại vai trò chung chung là "Trưởng ban" hay "Trưởng ban (Chung)".
  - Mọi chức danh Trưởng ban phải gắn liền cụ thể với Ban chuyên môn tương ứng.
- **Bổ sung vai trò Ban Thư Ký (`ban_thu_ky`)**:
  - Tách bạch vai trò Tổng thư ký (`tong_thu_ky`) và Ban thư ký (`ban_thu_ky` / `thu_ky`).
  - Ban thư ký phụ trách hỗ trợ công tác hành chính, lập biên bản, chuẩn bị tài liệu đại hội và hỗ trợ điều phối.
- **Danh mục 10 vai trò chuẩn hóa toàn diện trên toàn hệ thống CEO 1983**:
  1. `quan_tri` (Quản trị)
  2. `admin` (Admin)
  3. `tong_thu_ky` (Tổng thư ký)
  4. `ban_thu_ky` (Ban thư ký)
  5. `truong_ban_truyen_thong` (Trưởng ban Truyền thông)
  6. `truong_ban_thanh_vien` (Trưởng ban Thành viên)
  7. `truong_ban_xuc_tien` (Trưởng ban Xúc tiến thương mại)
  8. `truong_ban_tai_chinh` (Trưởng ban Tài chính)
  9. `truong_ban_thien_nguyen` (Trưởng ban Thiện nguyện)
  10. `thanh_vien` / `member` (Thành viên)
- **Biên dịch & Đóng gói bản Android APK mới nhất**:
  - Đồng bộ Capacitor, build Gradle APK `assembleDebug`.
  - Xuất file APK ra các thư mục phát hành:
    + `release_apk/CEO1983-app-latest.apk`
    + `release_apk/CEO1983-v1.0-debug.apk`
    + `apps/ceo1983_app_fe/public/docs/CEO1983-app-latest.apk`

---

## 2. KIẾN TRÚC & CÁC FILE ĐÃ ĐƯỢC CHUẨN HÓA

### 2.1. Phân Hệ Frontend (`apps/ceo1983_app_fe`)

1. **`src/constants/permissions.ts`**:
   - Thay thế `TRUONG_BAN` bằng `BAN_THU_KY: "ban_thu_ky"`.
   - Cập nhật `STANDARD_5_ROLES`: `["quan_tri", "admin", "tong_thu_ky", "ban_thu_ky", "thanh_vien"]`.
   - Cập nhật `STANDARD_7_COMMITTEES`: Bổ sung `"Ban thư ký"`.
   - Cập nhật kiểu `SrsRole`: Thay `truong_ban` bằng `ban_thu_ky`.
   - Cập nhật ma trận `ROLE_PERMISSIONS`: Cấu hình danh mục quyền hạn chi tiết cho `ban_thu_ky`.

2. **`src/routes/permissions.tsx` (Trang Phân Quyền CRM 1983)**:
   - Cập nhật `ROLE_OPTIONS`: Loại bỏ `truong_ban`, thêm `ban_thu_ky: "Ban thư ký"`.
   - Cập nhật `normalizeRole`: Nhận diện các giá trị `ban_thu_ky`, `thu_ky`, `báo cáo`, `thư ký` chuẩn hóa về `ban_thu_ky`.
   - Cập nhật `DEPARTMENT_OPTIONS`: Thêm `"Ban thư ký"`.
   - Chuẩn hóa hàm `normalizeDept`.

3. **`src/routes/association.permissions.tsx` (Phân Quyền Hiệp Hội)**:
   - Cập nhật `MemberPermissionProfile.boardRole` chấp nhận `"Ban thư ký"`.
   - Thêm `"Ban thư ký"` vào `BOARD_OPTIONS`.
   - Cập nhật `ROLE_LABELS`: Loại bỏ `truong_ban`, thêm `ban_thu_ky: "Ban thư ký"`.
   - Cấu hình quyền mặc định khi chọn role `ban_thu_ky`.

4. **`src/lib/rbac-permission-helpers.ts`**:
   - `SystemRoleKey`: Loại bỏ `truong_ban`, thêm `ban_thu_ky`.
   - `SYSTEM_5_ROLES`, `ROLE_OPTIONS`, `DEPARTMENT_OPTIONS`: Đồng bộ loại bỏ `truong_ban`, bổ sung `ban_thu_ky`.
   - `normalizeRole`, `normalizeDept`, `normalizeActionRoles`, `isActionAllowedByMatrix`: Khớp 100% với cấu trúc 10 role.

5. **`src/components/dashboard/RbacPermissionMatrix.tsx`**:
   - `SYSTEM_ROLES`: Loại bỏ `truong_ban`, thêm `{ key: "ban_thu_ky", label: "Ban thư ký" }`.
   - Chuyển toàn bộ các cờ phân quyền 30 chức năng từ `truong_ban` sang `ban_thu_ky`.

6. **`src/components/dashboard/Sidebar.tsx`**:
   - Destructure chính xác các cờ vai trò từ hook: `isTongThuKy`, `isBanThuKy`, `isTruongBanTruyenThong`, `isTruongBanThanhVien`, `isTruongBanXucTien`, `isTruongBanTaiChinh`, `isTruongBanThienNguyen`.
   - `currentRoleKey`: Ưu tiên chính xác vai trò theo thứ tự phân cấp, không còn role `truong_ban` chung.

7. **`src/hooks/use-role.ts`**:
   - Bổ sung `isBanThuKy: boolean` vào interface `RoleState`.
   - `resolveSrsRole`: Nhận diện `ban_thu_ky`, `thu_ky`, `ban thư ký`.
   - Khai báo độc lập, tường minh không trùng lặp các biến:
     + `isTongThuKy`
     + `isBanThuKy` / `isBTK`
     + `isBTT` / `isTruongBanTruyenThong`
     + `isBTV` / `isTruongBanThanhVien`
     + `isBXT` / `isTruongBanXucTien`
     + `isBTC` / `isTruongBanTaiChinh`
     + `isBTN` / `isTruongBanThienNguyen`
     + `isTruongBan` (tổng hợp 5 trưởng ban cụ thể)
   - Bổ sung `isBanThuKy` vào đối tượng trả về của hook.

### 2.2. Phân Hệ Backend (`apps/ceo1983_app_be`)

1. **`src/users/users.service.ts`**:
   - Cập nhật mapping `roleList`: Nhận diện `tong_thu_ky` và `ban_thu_ky`, loại bỏ hoàn toàn `truong_ban`.

2. **`src/members/members.service.ts`**:
   - Mapping `roleKey`: Ánh xạ `ban_thu_ky` / `thu_ky` về `ban_thu_ky`.
   - `updateMemberRoleDept`: Gán role `moderator` cho `ban_thu_ky`.
   - Kiểm tra `rl === 'ban_thu_ky'`.

3. **`src/events/events.controller.ts`**:
   - Cập nhật decorator `@Roles(...)`: Thay thế `'truong_ban'` bằng danh sách tường minh `'ban_thu_ky'`, `'truong_ban_truyen_thong'`, `'truong_ban_thanh_vien'`, `'truong_ban_xuc_tien'`, `'truong_ban_tai_chinh'`, `'truong_ban_thien_nguyen'`.

4. **`src/admin/admin.service.ts`**:
   - Bổ sung cột ma trận phân quyền mặc định: `ban_thu_ky` và `truong_ban_thien_nguyen`.

---

## 3. KIỂM ĐỊNH CHẤT LƯỢNG MÃ NGUỒN (STRICT RULE 3)

- **Backend Type Check**:
  - Lệnh: `npx tsc --noEmit` (trong `apps/ceo1983_app_be`).
  - Kết quả: **Exit code 0 (0 errors)**.
- **Frontend Type Check**:
  - Lệnh: `npx tsc --noEmit` (trong `apps/ceo1983_app_fe`).
  - Kết quả: **Exit code 0 (0 errors)**.
- **Grep Verification**:
  - Kiểm tra các mẫu `"truong_ban"`, `'truong_ban'`, `"Trưởng ban (Chung)"`, `"Trưởng ban chung"` trên toàn bộ thư mục `apps/`.
  - Kết quả: **0 matches** (không còn bất kỳ vết tích nào của role trưởng ban chung).

---

## 4. BIÊN DỊCH VÀ ĐÓNG GÓI ANDROID APK

- **Capacitor Sync**:
  - Thực thi lệnh `npx cap copy android` tại `apps/mobile_ceo1983`.
  - Đồng bộ thành công cấu hình Capacitor và tài nguyên ứng dụng.
- **Gradle Assemble**:
  - Thực thi lệnh `.\gradlew.bat assembleDebug` tại `apps/mobile_ceo1983/android`.
  - Kết quả: **BUILD SUCCESSFUL**.
- **Đóng gói phát hành**:
  - Tệp sinh ra: `apps/mobile_ceo1983/android/app/build/outputs/apk/debug/app-debug.apk`
  - Đã sao chép và đồng bộ sang:
    1. `release_apk/CEO1983-app-latest.apk`
    2. `release_apk/CEO1983-v1.0-debug.apk`
    3. `apps/ceo1983_app_fe/public/docs/CEO1983-app-latest.apk`
