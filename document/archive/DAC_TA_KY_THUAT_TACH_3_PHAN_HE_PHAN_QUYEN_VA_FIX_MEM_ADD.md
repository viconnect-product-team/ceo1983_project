# ĐẶC TẢ KỸ THUẬT: TÁCH RỜI 3 PHÂN HỆ PHÂN QUYỀN VÀ KHẮC PHỤC QUYỀN THÊM HỘI VIÊN (`MEM_ADD`)

> **Phiên bản:** 1.0.0  
> **Ngày cập nhật:** 2026-10-09  
> **Phạm vi:** `apps/ceo1983_app_fe` (Quản trị CRM, Phân quyền RBAC, Sidebar) & `apps/ceo1983_app_be` (Users Service, RBAC)  
> **Trạng thái:** Đã triển khai & Kiểm tra TypeScript đạt 100% 0 Lỗi (Strict 0 Errors)

---

## 1. BỐI CẢNH & PHẢN HỒI TỪ KHÁCH HÀNG

Khách hàng phản ánh 2 vấn đề bất cập trong hệ thống phân quyền:
1. **Lỗi hiển thị nút "+ Thêm hội viên" khi không có quyền**:
   - Tài khoản `admin@connect.vn` trong Ma trận phân quyền (cột `ADMIN`) đang **KHÔNG ĐƯỢC TÍCH** quyền "Thêm mới hội viên" (`MEM_ADD`).
   - Tuy nhiên, khi đăng nhập bằng tài khoản `admin@connect.vn` và truy cập trang Danh sách hội viên (`/members`), nút `+ Thêm hội viên` vẫn hiển thị ở góc trên bên phải.
2. **Yêu cầu tách rời 3 phân hệ phân quyền tương ứng với 3 chức năng trên Sidebar**:
   - Trước đây, thanh Sidebar CRM có 3 mục: `Ma trận phân quyền`, `Phân quyền tài khoản`, `Thẩm quyền Ban & Cấp bậc`.
   - Tuy nhiên khi bấm vào `Ma trận phân quyền`, giao diện lại chứa cả 3 phân hệ bên trong thông qua các nút sub-tabs (`1. Ma Trận Quyền Hệ Thống...`, `2. Thẩm Quyền 6 Ban Chuyên Môn...`, `3. Phân Quyền Tài Khoản Thành Viên...`) kèm toggle "dashboard" / "grid".
   - Khách hàng yêu cầu tách biệt triệt để 3 phân hệ thành 3 màn hình độc lập, không được để ma trận phân quyền gom cụm cả 3 phân hệ lồng vào nhau.

---

## 2. PHÂN TÍCH NGUYÊN NHÂN GỐC (ROOT CAUSE ANALYSIS)

### 2.1. Tại sao nút "+ Thêm hội viên" vẫn hiển thị dù `MEM_ADD` bị bỏ tích?
Qua điều tra mã nguồn, nguyên nhân gồm 3 mắt xích:
1. **Lệch vai trò ở Backend (`apps/ceo1983_app_be/src/users/users.service.ts`)**:
   - Tại dòng 290 và 605, logic seed / resolve tài khoản hardcode gán cho `admin@connect.vn` role `'platform_admin'`.
2. **Lệch vai trò ở Frontend (`apps/ceo1983_app_fe/src/hooks/use-role.ts`)**:
   - Tại hàm `resolveSrsRole`, điều kiện `userEmail === "admin@connect.vn"` được gán cứng trả về `"ADM"` (`quan_tri` / Superadmin).
   - Trong `useRole`: `isPlatformAdmin = (srsRole === "ADM")`. Khi `isPlatformAdmin === true`, hook luôn trả về `return true` cho mọi thao tác (`if (isPlatformAdmin) return true`), vô hiệu hóa hoàn toàn ma trận phân quyền.
3. **Lỗi Logic Fallback trong Ma Trận (`apps/ceo1983_app_fe/src/lib/rbac-permission-helpers.ts`)**:
   - Trong hàm `isActionAllowedByMatrix(role, actionCode)`:
     ```typescript
     // CODE CŨ CÓ LỖI:
     for (const mod of matrix.modules) {
       for (const act of mod.actions) {
         if (isMatch && act.roles) {
           if (act.roles[targetRole] === true) return true;
           // NẾU act.roles[targetRole] === false, NÓ KHÔNG RETURN FALSE!
           // MÀ NÓ BỎ QUA VÀ TIẾP TỤC VÒNG LẶP
         }
       }
     }
     return true; // FALLBACK NGẦM CHO PHÉP TẤT CẢ!
     ```
   - Do đó, ngay cả khi vai trò được chuẩn hóa, giá trị `act.roles["admin"] === false` vẫn rơi xuống cuối hàm trả về `true`!

### 2.2. Tại sao 3 phân hệ lại bị gom cụm trong Ma trận phân quyền?
- Route `/permissions` trước đây dùng state nội bộ `activeTab` với giá trị mặc định là `"matrix"`, nhưng render cùng lúc cả 3 sub-tab switcher buttons và các khối UI điều kiện, đồng thời có nút toggle view mode ("Chế độ Dashboard" vs "Chế độ Ma trận Lưới").
- Các link sidebar (`/permissions?tab=matrix`, `/permissions?tab=user_actions`, `/permissions?tab=role_groups`) trỏ vào nhưng `Sidebar.tsx` không parse URL search query params (`searchStr`), dẫn đến việc cả 3 mục menu cùng chia sẻ URL pathname `/permissions` và không highlight chuẩn xác.

---

## 3. GIẢI PHÁP TRIỂN KHAI CHI TIẾT

```
+---------------------------------------------------------------------------------------+
|                                KIẾN TRÚC PHÂN LẬP MỚI                                 |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|   SIDEBAR MENU CRM                                       ROUTE / MÀN HÌNH ĐỘC LẬP     |
|   +---------------------------------------+              +------------------------+   |
|   | 1. Ma trận phân quyền                 | ---------->  | /permissions?tab=matrix|   |
|   |    (8 Modules x 5 Roles Matrix)       |              | (RbacPermissionMatrix) |   |
|   +---------------------------------------+              +------------------------+   |
|                                                                                       |
|   +---------------------------------------+              +-------------------------------+
|   | 2. Phân quyền tài khoản               | ---------->  | /permissions?tab=user_actions |
|   |    (Theo 7 Ban chuyên môn)            |              | (MemberPermissionsByCommittee)|
|   +---------------------------------------+              +-------------------------------+
|                                                                                       |
|   +---------------------------------------+              +-------------------------------+
|   | 3. Thẩm quyền Ban & Cấp bậc           | ---------->  | /permissions?tab=role_groups  |
|   |    (Thẩm quyền 6 ban & phân cấp)      |              | (CommitteesPermissionManager) |
|   +---------------------------------------+              +-------------------------------+
|                                                                                       |
+---------------------------------------------------------------------------------------+
```

### 3.1. Chuẩn Hóa Vai Trò `admin@connect.vn` Thuộc Nhóm `admin` (BQT)
1. **Backend (`apps/ceo1983_app_be/src/users/users.service.ts`)**:
   - Sửa dòng gán role cho `admin@connect.vn` từ `'platform_admin'` thành `'admin'`:
     ```typescript
     if (email === 'admin@connect.vn' || email === 'admin1@connect.vn') {
       roles.push('admin'); // Vai trò BQT/Admin của hiệp hội CEO 1983
     }
     ```
2. **Frontend (`apps/ceo1983_app_fe/src/hooks/use-role.ts`)**:
   - Cập nhật hàm `resolveSrsRole`:
     ```typescript
     if (userEmail === "admin@connect.vn" || userEmail === "admin1@connect.vn") {
       return "BQT"; // Admin hiệp hội, không phải ADM (Superadmin)
     }
     ```
   - Khi đó, `srsRole === "BQT"`, `isPlatformAdmin === false`, người dùng được đối soát chính xác theo cột `ADMIN` trong ma trận phân quyền.

### 3.2. Sửa Cơ Chế Fallback Trong `isActionAllowedByMatrix` (`rbac-permission-helpers.ts`)
- Khi một hành động đã được định nghĩa trong ma trận và cột role của người dùng có cấu hình, nếu quyền bị tắt (`act.roles[targetRole] === false`), hàm **BẮT BUỘC TRẢ VỀ `false` DỨT KHOÁT (Explicit Denial)**:
  ```typescript
  if (isMatch && act.roles) {
    if (act.roles[targetRole] === true) {
      return true;
    }
    // Nếu action đã khớp trong ma trận và role không được cấp quyền => từ chối quyền dứt khoát!
    return false;
  }
  ```
- Nhờ thay đổi này, khi `MEM_ADD` không được tích cho cột `ADMIN`, `hasActionPermission("MEMBER_CREATE")` trả về `false`, và nút `+ Thêm hội viên` trong `apps/ceo1983_app_fe/src/routes/members.tsx` hoàn toàn bị ẩn.

### 3.3. Tách Rời Hoàn Toàn 3 Màn Hình Phân Quyền Độc Lập (`permissions.tsx`)
1. **Định nghĩa `validateSearch` trên Route**:
   ```typescript
   export const Route = createFileRoute('/permissions')({
     validateSearch: (search: Record<string, unknown>) => ({
       tab: typeof search.tab === 'string' ? search.tab : 'matrix',
     }),
     component: PermissionsPage,
   });
   ```
2. **Gỡ bỏ hoàn toàn sub-tabs và viewMode toggle**:
   - Loại bỏ các nút `1. Ma Trận Quyền Hệ Thống`, `2. Thẩm Quyền 6 Ban Chuyên Môn`, `3. Phân Quyền Tài Khoản Thành Viên`.
   - Loại bỏ nút chuyển đổi "Chế độ Dashboard" / "Chế độ Ma trận Lưới".
3. **Phân tách 3 màn hình độc lập**:
   - **`tab === 'matrix'`**: Hiển thị Header "Ma Trận Phân Quyền Hệ Thống", mô tả 8 module và 5 vai trò, kèm banner đồng bộ và component `<RbacPermissionMatrix />`.
   - **`tab === 'user_actions'`**: Hiển thị Header "Phân Quyền Tài Khoản (Theo Từng Ban Chuyên Môn)", banner hướng dẫn phân quyền và component `<MemberPermissionsByCommittee />`.
   - **`tab === 'role_groups'`**: Hiển thị Header "Thẩm Quyền 6 Ban Chuyên Môn & Cấp Bậc Nghiệp Vụ", 4 thẻ KPI thống kê, 6 thẻ tổng quan thẩm quyền ban và component `<CommitteesPermissionManager />`.

### 3.4. Nâng Cấp Highlight Sidebar Cho Query Params (`Sidebar.tsx`)
- Trong `Sidebar.tsx`, lấy `searchStr` từ `useRouterState`:
  ```typescript
  const searchStr = routerState.location.searchStr; // e.g. "?tab=matrix"
  ```
- Nâng cấp hàm `isActive()`:
  ```typescript
  const isActive = (itemPath: string) => {
    if (itemPath.includes('?')) {
      const [path, query] = itemPath.split('?');
      return currentPath === path && searchStr.includes(query);
    }
    return currentPath === itemPath;
  };
  ```
- Đảm bảo khi người dùng bấm vào từng mục trên Sidebar:
  - `Ma trận phân quyền` (`/permissions?tab=matrix`): Sáng đèn độc lập.
  - `Phân quyền tài khoản` (`/permissions?tab=user_actions`): Sáng đèn độc lập.
  - `Thẩm quyền Ban & Cấp bậc` (`/permissions?tab=role_groups`): Sáng đèn độc lập.

---

## 4. KẾT QUẢ XÁC MINH & KIỂM THỬ (VERIFICATION)

### 4.1. Kiểm Tra TypeScript Toàn Bộ Dự Án (Strict Rule 3)
- **Frontend (`apps/ceo1983_app_fe`)**:
  ```bash
  npx tsc --noEmit
  # Exit code 0 (0 errors)
  ```
- **Backend (`apps/ceo1983_app_be`)**:
  ```bash
  npx tsc --noEmit -p tsconfig.json
  # Exit code 0 (0 errors)
  ```

### 4.2. Kiểm Tra Hành Vi Nghiệp Vụ
1. Đăng nhập tài khoản `admin@connect.vn`:
   - Vai trò được nhận diện là `admin` (`BQT`).
   - Trong Ma trận phân quyền, cột `ADMIN` không tích quyền "Thêm mới hội viên" (`MEM_ADD`).
   - Truy cập `/members`: Nút `+ Thêm hội viên` đã bị ẩn hoàn toàn 100%.
2. Truy cập 3 mục menu Phân quyền trên Sidebar:
   - Click `Ma trận phân quyền`: Điều hướng `/permissions?tab=matrix`, hiển thị duy nhất ma trận 8x5, không còn sub-tabs.
   - Click `Phân quyền tài khoản`: Điều hướng `/permissions?tab=user_actions`, hiển thị duy nhất danh sách phân quyền tài khoản theo ban.
   - Click `Thẩm quyền Ban & Cấp bậc`: Điều hướng `/permissions?tab=role_groups`, hiển thị duy nhất thẩm quyền 6 ban và cấp bậc.
   - Mục sidebar tương ứng sáng đèn chính xác.

---

## 5. KẾT LUẬN & BÀN GIAO

- Toàn bộ thay đổi mã nguồn đã được thực hiện an toàn, cô lập tại máy phát triển (local).
- Tuân thủ nghiêm ngặt **Quy tắc 1** (Không tự ý chạy `git push` hay `git commit`).
- Tuân thủ nghiêm ngặt **Quy tắc 2** (Đồng bộ hóa `MEMORY.md`, `.cursorrules`, và tài liệu kỹ thuật).
- Tuân thủ nghiêm ngặt **Quy tắc 3** (Kiểm tra 0 lỗi TypeScript exit code 0 trước khi hoàn thành).
