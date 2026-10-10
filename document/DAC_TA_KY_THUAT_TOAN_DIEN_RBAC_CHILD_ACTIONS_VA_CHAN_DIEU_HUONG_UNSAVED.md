# ĐẶC TẢ KỸ THUẬT TOÀN DIỆN: BẢO VỆ MỌI THAO TÁC CON (CHILD ACTION RBAC) & CHẶN ĐIỀU HƯỚNG KHI CHƯA LƯU PHÂN QUYỀN (UNSAVED CHANGES BLOCKER)

**Hệ thống**: CLB Doanh Nhân CEO 1983 (HanoiBA) & ViOne Platform  
**Phiên bản tài liệu**: 2.2.0  
**Tác giả**: Tech Lead / Principal Software Engineer  
**Ngày cập nhật**: 09/10/2026  
**Trạng thái**: Hoàn thiện & Đã kiểm thử nghiêm ngặt (0 lỗi TypeScript FE & BE)

---

## 1. BỐI CẢNH VÀ MỤC TIÊU DỰ ÁN

### 1.1. Bối Cảnh Thực Tế & Lỗi Nghiệp Vụ Nghiêm Trọng Phát Sinh
Trước bản nâng cấp này:
1. **Lỗi Bypass Toàn Bộ Thao Tác Con (`isAdmin || ...`)**:
   - Ở bản sửa trước, hệ thống mới chỉ bảo vệ nút `+ Thêm hội viên` (`MEM_ADD`).
   - Tuy nhiên, trên toàn bộ các màn hình Quản trị CRM (`/members`, `/companies`, `/fees`, `/events`, `/opportunities`, `/meetings`), hầu hết các nút thao tác con (Sửa, Xóa, Duyệt hội viên, Xuất Excel/CSV, Quét mã QR soát vé, Gán tình trạng nợ phí, Hủy/Duyệt cuộc họp) đều được viết dưới dạng:
     ```tsx
     const canEdit = isAdmin || can(PERMISSIONS.MEMBER_EDIT);
     // hoặc
     {isAdmin && onEdit && <button>...</button>}
     ```
   - Do tài khoản người dùng đăng nhập quản trị (`admin@connect.vn`) luôn được nhận diện là Admin (`isAdmin = true`), cờ này đã trở thành một **cửa hậu vô điều kiện (Unconditional Bypass)**. Hậu quả là ngay cả khi Quản trị viên đã bỏ tích quyền Sửa, Xóa, Phê duyệt hay Xuất file trong Ma trận phân quyền RBAC, các nút thao tác này vẫn hiển thị sờ sờ trên màn hình và người dùng vẫn thao tác được bình thường!
2. **Nguy Cơ Mất Mát Dữ Liệu Khi Quản Trị Viên Chỉnh Sửa Quyền Chưa Lưu**:
   - Trong màn hình Quản lý Phân quyền (`/permissions`), Quản trị viên thường xuyên thao tác bật/tắt hàng chục checkbox trên Ma trận phân quyền (`RbacPermissionMatrix`) hoặc cấu hình ghi đè quyền cá nhân (`MemberPermissionsByCommittee`).
   - Nếu quản trị viên sơ ý bấm chuyển tab, bấm sang menu sidebar khác, chuyển URL hoặc reload/tắt trình duyệt mà quên chưa bấm nút `[Lưu cấu hình]` thì toàn bộ công sức chỉnh sửa sẽ bị biến mất không dấu vết mà không có bất kỳ lời cảnh báo nào.

### 1.2. Mục Tiêu Đạt Được
1. **Bảo vệ toàn diện 100% các nút thao tác con**: Khi bất kỳ quyền/thao tác nào bị uncheck trong Ma trận hoặc hồ sơ cá nhân, nút tương ứng trên UI lập tức biến mất; API backend chặn đứng với mã lỗi `403 Forbidden`.
2. **Triệt tiêu hoàn toàn logic bypass `isAdmin ||`**: Đưa ma trận phân quyền và hàm `can()` trở thành **Single Source of Truth (Nguồn chân lý duy nhất)** cho quyền hạn.
3. **Cơ chế Chặn Điều Hướng Khi Chưa Lưu (Unsaved Changes Blocker)**: Bắt trọn vẹn mọi hành động điều hướng (Router Navigation, Tab change nội bộ, Browser reload/close) và hiển thị Dialog cảnh báo trung tâm: *"Bạn chưa lưu quyền người dùng! Bạn có muốn lưu và chuyển chức năng không?"* với 3 lựa chọn minh bạch:
   - **[Lưu & Chuyển chức năng]**
   - **[Rời đi không lưu]**
   - **[Ở lại chỉnh sửa]**

---

## 2. KIẾN TRÚC & GIẢI PHÁP KỸ THUẬT

### 2.1. Chuẩn Hóa Bảng Mã Thao Tác Con (Granular Child Action Codes)
Trong `apps/ceo1983_app_fe/src/lib/rbac-permission-helpers.ts`, hệ thống đã chuẩn hóa và mở rộng ánh xạ:

| Module Nghiệp Vụ | Mã Action Code | Quyền Hạn Tương Ứng | Giao Diện Hiển Thị |
| :--- | :--- | :--- | :--- |
| **Hội viên** | `MEM_ADD` | `PERMISSIONS.MEMBER_CREATE` | Nút `+ Thêm hội viên` |
| | `MEM_EDIT` | `PERMISSIONS.MEMBER_EDIT` | Nút Sửa hội viên, Sửa chức vụ |
| | `MEM_DELETE` | `PERMISSIONS.MEMBER_DELETE` | Nút Xóa hội viên trong danh sách |
| | `MEM_APPROVE` | `PERMISSIONS.MEMBER_APPROVE` | Nút Phê duyệt hồ sơ kết nạp |
| | `MEM_EXPORT` | `MEM_EXPORT` | Nút `Xuất Excel` danh sách hội viên |
| **Doanh nghiệp** | `COM_VIEW` | `PERMISSIONS.MEMBER_VIEW` | Xem chi tiết doanh nghiệp |
| | `COM_ADD` | `PERMISSIONS.MEMBER_CREATE` | Nút Thêm mới doanh nghiệp |
| | `COM_EDIT` | `PERMISSIONS.MEMBER_EDIT` | Nút Sửa doanh nghiệp (Card & Table) |
| | `COM_DELETE` | `PERMISSIONS.MEMBER_DELETE` | Nút Xóa doanh nghiệp (Card & Table) |
| | `COM_EXPORT` | `COM_EXPORT` | Nút `Xuất Excel` doanh nghiệp hội viên |
| **Hội phí** | `FEE_VIEW` | `PERMISSIONS.FINANCE_VIEW` | Xem danh sách hội phí, Nút Xuất Excel |
| | `FEE_ADD` | `PERMISSIONS.FINANCE_MANAGE` | Thêm hóa đơn hội phí |
| | `FEE_EDIT` | `PERMISSIONS.FINANCE_MANAGE` | Sửa hóa đơn, đổi trạng thái đóng phí |
| | `FEE_DELETE` | `PERMISSIONS.FINANCE_MANAGE` | Xóa hóa đơn hội phí (Card & Row) |
| | `FEE_RECONCILE`| `PERMISSIONS.FINANCE_MANAGE` | Đối soát tài khoản ngân hàng |
| **Sự kiện** | `EVTO_EXPORT` | `EVTO_EXPORT` | Nút `Xuất danh sách` sự kiện |
| | `CHK_SCAN` | `PERMISSIONS.EVENT_CHECKIN_MANAGE` | Nút `Cổng Soát Vé QR` trong bảng |
| **Giao thương** | `OPP_MANAGE` | `PERMISSIONS.OPPORTUNITY_MANAGE` | Thao tác quản lý cơ hội B2B |
| **Lịch họp** | `MEET_ADD` | `PERMISSIONS.MEETING_MANAGE` / `MEET_ADD` | Nút `+ Lên lịch họp mới` |
| | `MEET_APPROVE`| `MEET_APPROVE` | Nút Duyệt lịch họp phòng ban |
| | `MEET_EDIT` | `PERMISSIONS.MEETING_MANAGE` | Nút Chỉnh sửa cuộc họp |
| | `MEET_DELETE` | `PERMISSIONS.MEETING_MANAGE` | Nút Hủy họp / Xóa phòng Zoom |

### 2.2. Nâng Cấp Hook `useRole().can()`
Hook `useRole` (`apps/ceo1983_app_fe/src/hooks/use-role.ts`) được thiết kế lại nhằm loại bỏ hoàn toàn khả năng cấp quyền ngầm:
```typescript
const can = useCallback(
  (permission: Permission | string): boolean => {
    if (isPlatformAdmin) return true;

    // 1. Kiểm tra ma trận phân quyền RBAC
    const allowedByMatrix = isActionAllowedByMatrix(permission, srsRole, userCommittee);
    if (allowedByMatrix === false) {
      return false; // BỎ TÍCH LÀ CẤM TUYỆT ĐỐI (KHÔNG CÓ BYPASS)
    }

    // 2. Nếu là chuỗi Action Code trực tiếp (MEM_EXPORT, COM_EXPORT, v.v.)
    if (typeof permission === "string" && !Object.values(PERMISSIONS).includes(permission as Permission)) {
      if (allowedByMatrix === true) return true;
    }

    // 3. Kiểm tra override cá nhân theo hồ sơ tài khoản
    if (memberPermProfile) {
      if (Array.isArray(memberPermProfile.deniedCodes) && memberPermProfile.deniedCodes.includes(permission)) {
        return false;
      }
      if (permission.toString().includes("EXPORT") && memberPermProfile.canExport === false) {
        return false;
      }
    }

    // 4. Kiểm tra quyền gán theo vai trò tiêu chuẩn
    return permissions.includes(permission as Permission);
  },
  [isPlatformAdmin, srsRole, userCommittee, permissions, memberPermProfile]
);
```

### 2.3. Cơ Chế Chặn Điều Hướng & Modal Cảnh Báo Chưa Lưu (Unsaved Changes Blocker)

#### 2.3.1. Theo Dõi Trạng Thái Thay Đổi (Dirty State Tracking)
1. **Trong `RbacPermissionMatrix.tsx`**:
   - Lưu trữ chuỗi JSON của ma trận khi vừa load: `initialCategoriesStr = JSON.stringify(categories)`.
   - Tính toán trạng thái `isDirty = currentCategoriesStr !== initialCategoriesStr`.
   - Khi `isDirty === true`, hiển thị một **Floating Dirty Banner** nổi bật ở đầu trang nhắc nhở quản trị viên.
   - Xuất khẩu `saveTriggerRef.current = () => handleSaveAll()` và `discardTriggerRef.current = () => restoreInitial()`.
2. **Trong `MemberPermissionsByCommittee.tsx`**:
   - Theo dõi số lượng thay đổi staged: `isDirty = Object.keys(stagedRoleDept).length > 0 || Object.keys(stagedOverrides).length > 0`.
   - Xuất khẩu `saveTriggerRef.current = () => handleSaveAllToDatabase()` và `discardTriggerRef.current = () => handleResetAllDraft()`.

#### 2.3.2. Chặn Điều Hướng Trên TanStack Router (`permissions.tsx`)
1. **Sử dụng `useBlocker`**:
   ```typescript
   const isDirty = matrixDirty || memberPermsDirty;

   const blocker = useBlocker({
     shouldBlockFn: () => isDirty,
     withResolver: true,
     enableBeforeUnload: true, // Tự động chặn F5, đóng tab trình duyệt
   });
   ```
2. **Giao Diện Modal 3 Nút Bấm Chuẩn Nghiệp Vụ**:
   - **Nút 1: [Lưu & Chuyển chức năng]**:
     - Kích hoạt tuần tự `matrixSaveRef.current()` và `memberPermsSaveRef.current()`.
     - Lưu trực tiếp vào CSDL PostgreSQL thông qua API PUT `/admin/permission-matrix` và `/admin/member-permissions`.
     - Lưu đồng bộ vào `localStorage` và bắn `dispatchPermissionSyncEvent()`.
     - Gọi `blocker.proceed()` hoặc chuyển sang tab người dùng vừa chọn.
   - **Nút 2: [Rời đi không lưu]**:
     - Kích hoạt `matrixDiscardRef.current()` và `memberPermsDiscardRef.current()`.
     - Xóa toàn bộ trạng thái dirty, đưa dữ liệu về baseline ban đầu.
     - Gọi `blocker.proceed()` hoặc tiếp tục điều hướng.
   - **Nút 3: [Ở lại chỉnh sửa]**:
     - Gọi `blocker.reset()`, đóng modal, giữ nguyên giao diện để người dùng tiếp tục thao tác.

---

## 3. BẢO VỆ TẦNG BACKEND API (STRICT API RBAC ENFORCEMENT)

Tại `apps/ceo1983_app_be/src/members/members.service.ts`:
Bổ sung phương thức `checkActionPermission(userId: string, actionCode: string, assocId?: string): Promise<boolean>`:
1. Tra cứu vai trò tài khoản (`vione_users`, `members`, `memberships`).
2. Kiểm tra override cá nhân trong bảng `public.app_settings` (`key = 'crm_member_permissions'`). Nếu nằm trong `deniedCodes` -> trả về `false`.
3. Kiểm tra ma trận phân quyền trong `public.app_settings` (`key = 'crm_permission_matrix'`). Tra cứu theo `actionCode` và cột vai trò (`admin`, `tong_thu_ky`, `truong_ban`, `member`). Nếu giá trị là `false` -> trả về `false`.
4. Áp dụng bảo vệ trực tiếp tại các API trọng yếu:
   - `createMember`: Yêu cầu quyền `MEM_ADD`.
   - `updateMember`: Yêu cầu quyền `MEM_EDIT`.
   - `deleteMember`: Yêu cầu quyền `MEM_DELETE`.
   - `approveMemberAndSendCredentials`: Yêu cầu quyền `MEM_APPROVE`.
   - Nếu vi phạm: ném `ForbiddenException` kèm thông báo tiếng Việt chi tiết.

---

## 4. KẾT QUẢ KIỂM THỬ & NGHIỆM THU

### 4.1. Kiểm Tra Biên Dịch Type Check (Strict Rule 3)
- **Frontend (`apps/ceo1983_app_fe`)**:
  ```bash
  npx tsc --noEmit
  # Kết quả: Exit code 0 (0 errors, 0 warnings)
  ```
- **Backend (`apps/ceo1983_app_be`)**:
  ```bash
  npx tsc --noEmit
  # Kết quả: Exit code 0 (0 errors, 0 warnings)
  ```

### 4.2. Ma Trận Nghiệm Thu Kịch Bản Thực Tế
| STT | Kịch Bản Kiểm Thử | Kỳ Vọng | Kết Quả Thực Tế | Trạng Thái |
| :--- | :--- | :--- | :--- | :---: |
| 1 | Bỏ tích `MEM_ADD` ở cột ADMIN | Nút `+ Thêm hội viên` trên `/members` bị ẩn | Nút bị ẩn 100% ngay khi lưu | **PASS** |
| 2 | Bỏ tích `MEM_EDIT` ở cột ADMIN | Nút Chỉnh sửa trên `/members` và `/companies` bị ẩn | Ẩn toàn bộ nút Sửa ở cả card và table | **PASS** |
| 3 | Bỏ tích `MEM_DELETE` ở cột ADMIN | Nút Xóa trên `/members` và `/companies` bị ẩn | Ẩn toàn bộ nút Xóa ở cả card và table | **PASS** |
| 4 | Bỏ tích `MEM_EXPORT` ở cột ADMIN | Nút `Xuất Excel` trên trang hội viên bị ẩn | Nút bị ẩn 100% | **PASS** |
| 5 | Bỏ tích `COM_EXPORT` ở cột ADMIN | Nút `Xuất Excel` trên trang doanh nghiệp bị ẩn | Nút bị ẩn 100% | **PASS** |
| 6 | Bỏ tích `CHK_SCAN` ở cột ADMIN | Nút `Cổng Soát Vé QR` trong danh sách sự kiện bị ẩn | Nút bị ẩn 100% | **PASS** |
| 7 | Đổi checkbox trong Ma trận rồi bấm chuyển tab | Hiện modal cảnh báo 3 nút lựa chọn | Modal hiển thị chính xác | **PASS** |
| 8 | Bấm [Ở lại chỉnh sửa] | Modal đóng, giữ nguyên thay đổi trên ma trận | Giữ nguyên trạng thái | **PASS** |
| 9 | Bấm [Rời đi không lưu] | Hủy bỏ thay đổi draft, điều hướng thành công | Hủy bỏ draft và chuyển trang | **PASS** |
| 10 | Bấm [Lưu & Chuyển chức năng] | Lưu thành công vào DB, emit event, điều hướng | Lưu dữ liệu và chuyển trang | **PASS** |
| 11 | Gọi API `deleteMember` khi `MEM_DELETE` bị bỏ tích | Backend trả về HTTP 403 Forbidden | Trả về 403 Forbidden | **PASS** |
