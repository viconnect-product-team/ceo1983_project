# ĐẶC TẢ KỸ THUẬT: PHÂN QUYỀN RESTFUL API, LỌC THANH TOÁN HỘI VIÊN & LANDING BANNER BỐC THĂM TRÚNG THƯỞNG

**Dự án**: Hệ thống CRM Hiệp hội CLB Doanh Nhân CEO 1983  
**Thời gian cập nhật**: Tháng 10/2026  
**Trạng thái**: Đã nghiệm thu & Hoàn thành 100% (TypeCheck FE & BE 0 errors)

---

## 1. TỔNG QUAN YÊU CẦU & MỤC TIÊU
Tài liệu này đặc tả chi tiết kiến trúc, API và luồng giao diện cho 4 yêu cầu cải tiến trọng yếu của CRM CEO 1983:
1. **Loại bỏ hoàn toàn tài khoản chưa duyệt khỏi Phân quyền**: Ngăn chặn tuyệt đối các tài khoản `pending`, `pending_approval`, `rejected`, `inactive` hoặc chưa được ban kiểm duyệt phê duyệt xuất hiện trong số liệu thống kê hoặc danh sách phân quyền.
2. **Chuẩn hóa RESTful API phân quyền, Staging cục bộ & Ẩn hoàn toàn nút khỏi DOM**:
   - Khi chỉnh sửa quyền, hệ thống lưu tạm (staging) và chỉ gửi RESTful API lưu vào cơ sở dữ liệu khi bấm nút **"Lưu Vào Database"**.
   - Khắc phục lỗi nút hoặc chức năng không bị ẩn đi khi đổi/thu hồi quyền: Chuyển toàn bộ sang cơ chế render có điều kiện (DOM omission).
   - Giao diện phân quyền hỗ trợ đầy đủ 2 chế độ: **Dạng Dashboard** và **Dạng Lưới (Matrix Grid)**.
3. **Bộ lọc trạng thái thanh toán hội phí đa vị trí**:
   - Bổ sung bộ lọc "Đã thanh toán" / "Chưa thanh toán" tại tab trạng thái (Pills), thanh công cụ lọc và trực tiếp tại tiêu đề cột "Thanh toán" trong bảng dữ liệu.
4. **Banner Bốc thăm trúng thưởng dạng Landing Page tự setup & Chuẩn Icon ClickUp**:
   - Thiết kế banner hero dạng Landing Page sang trọng, tự động đổi nội dung, ưu đãi và phần thưởng theo sự kiện được chọn.
   - Hỗ trợ modal tự cấu hình giải thưởng (Đặc biệt, Nhất, Nhì, Ba, May mắn), nhà tài trợ, giá trị và thể lệ; lưu RESTful database.
   - Tích hợp vòng quay số may mắn kỹ thuật số tương tác với hiệu ứng chúc mừng và pháo hoa.
   - Nghiêm cấm chèn mã SVG cứng (hardcoded paths); toàn bộ icon sử dụng vector chuẩn từ Lucide React theo đúng ngôn ngữ thiết kế ClickUp Design System.

---

## 2. KIẾN TRÚC & TRIỂN KHAI CHI TIẾT

### 2.1. Loại Bỏ Tài Khoản Chưa Duyệt Khỏi Phân Quyền
- **Vị trí tệp**:
  - `apps/ceo1983_app_fe/src/routes/permissions.tsx`
  - `apps/ceo1983_app_fe/src/components/dashboard/MemberPermissionsByCommittee.tsx`
  - `apps/ceo1983_app_fe/src/routes/association.permissions.tsx`
- **Bộ lọc chuẩn hóa**:
  ```typescript
  const approvedMembers = useMemo(() => {
    return members.filter((m) => {
      const status = String((m as any)?.status || "").toLowerCase();
      const isUnapproved =
        status === "pending" ||
        status === "pending_approval" ||
        status === "rejected" ||
        status === "inactive" ||
        (m as any)?.isApproved === false ||
        (m as any)?.approved === false;
      return !isUnapproved;
    });
  }, [members]);
  ```
- **Kết quả**: Toàn bộ 4 thẻ KPI, số lượng hội viên 6 ban chuyên môn và bảng phân quyền chỉ hiển thị hội viên chính thức đã được kết nạp.

---

### 2.2. Chuẩn Hóa RESTful API Phân Quyền & DOM Button Omission
- **Backend Endpoints (`apps/ceo1983_app_be`)**:
  - `GET /api/admin/member-permissions`: Đọc cấu hình phân quyền hội viên từ bảng `app_settings` (key: `vba_member_permissions`).
  - `PUT /api/admin/member-permissions`: Lưu cấu hình phân quyền hội viên vào `app_settings` chuẩn RESTful.
- **Frontend Staging Buffer (`MemberPermissionsByCommittee.tsx`)**:
  - `stagedRoleDept`: Lưu đệm các thay đổi vai trò và ban chuyên môn chưa lưu.
  - `stagedOverrides`: Lưu đệm các phân quyền chức năng đặc biệt.
  - Hàng có thay đổi được đánh dấu viền hổ phách và huy hiệu `Chưa lưu`.
  - Khi `unsavedCount > 0`, xuất hiện thanh **Floating Save Bar** ở đáy màn hình với nút **"Lưu Vào Database"**. Khi bấm nút, hệ thống gửi lệnh `PUT /api/admin/member-permissions` và reset draft state.
- **Dual View Modes (`permissions.tsx`)**:
  - **Dạng Dashboard**: KPI Stat cards (Hội viên chính thức, Trưởng ban chuyên môn, Quyền quản trị hệ thống, Chưa kích hoạt tài khoản) + 6 Thẻ Ban Chuyên Môn + Panel phân quyền hội viên theo ban.
  - **Dạng Lưới (Matrix Grid)**: Bảng ma trận đa chiều hiển thị toàn bộ vai trò và ma trận quyền hạn chi tiết (Xem, Tạo, Sửa, Xóa, Phê duyệt).
- **Khắc Phục Nút Không Bị Ẩn Khỏi Giao Diện**:
  - `members.index.tsx`:
    - Sửa `<Pencil>` bọc trong `{canEdit && (...)}`.
    - Quản lý tài khoản `<UserCog>` bọc trong `{canAccount && (...)}`.
    - Xóa `<Trash2>` bọc trong `{canDelete && (...)}`.
    - Áp dụng triệt để ở cả dạng Thẻ (`MemberCard`) và Dạng Bảng (`table tbody tr`).
  - `opportunities.index.tsx`: Bọc link Sửa `<Pencil>` và nút Xóa trong `{canManage && (...)}`.
  - `companies.index.tsx`: Bọc nút Sửa và Xóa trong `{isAdmin && (...)}`.
  - Loại bỏ hoàn toàn khỏi DOM tree, không để lại nút mờ `opacity-60` hay sự kiện bấm báo lỗi.

---

### 2.3. Bộ Lọc Đã/Chưa Thanh Toán Hội Phí
- **Vị trí tệp**: `apps/ceo1983_app_fe/src/routes/members.index.tsx`
- **Tầng 1 (Pill Tabs)**: Nút '✓ Đã thanh toán ({paidCount})' (xanh ngọc) và '✗ Chưa thanh toán ({unpaidCount})' (đỏ hồng) trên thanh tab trạng thái nhanh.
- **Tầng 2 (Toolbar Filter)**: Dropdown `<FilterSelect label="Thanh toán" ... />` trên thanh tìm kiếm cố định.
- **Tầng 3 (Header Cột Bảng)**: Dropdown selector trực tiếp tại thẻ `<th>` của cột "Thanh toán":
  ```tsx
  <th className="px-4 py-3 border-b border-border bg-secondary text-left">
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      <button type="button" onClick={() => tc.toggleSort("payment")}>
        <span>Thanh toán</span>
      </button>
      <select
        value={paymentFilter}
        onChange={(e) => setPaymentFilter(e.target.value as any)}
      >
        <option value="all">Tất cả</option>
        <option value="paid">✓ Đã TT</option>
        <option value="unpaid">✗ Chưa TT</option>
      </select>
    </div>
  </th>
  ```

---

### 2.4. Banner Bốc Thăm Trúng Thưởng Dạng Landing Page
- **Vị trí tệp**:
  - `apps/ceo1983_app_fe/src/components/dashboard/LuckyDrawLandingBanner.tsx`
  - `apps/ceo1983_app_fe/src/routes/lucky-draw.tsx`
  - `apps/ceo1983_app_fe/src/routes/voting.tsx`
- **Tính năng nổi bật**:
  - **Dynamic Event Selector**: Bộ chọn sự kiện tải động thông tin sự kiện (Tiêu đề, Địa điểm, Thời gian, Ban tổ chức, Quyền lợi).
  - **Self-Setup Modal**: Người dùng tự cấu hình tiêu đề, ảnh banner, tone màu gradient, danh sách giải thưởng (Đặc biệt, Nhất, Nhì, Ba, May mắn), nhà tài trợ, giá trị và thể lệ; lưu RESTful database qua `PUT /api/admin/lucky-draw-config`.
  - **Vòng Quay Số Kỹ Thuật Số**: Tương tác quay ngẫu nhiên người tham dự, hiển thị mã vé may mắn, công bố người chiến thắng kèm pháo hoa và âm thanh.
  - **Chuẩn Icon Vector ClickUp**: Sử dụng 100% icon vector chuẩn từ `lucide-react` (Trophy, Gift, Sparkles, Award, Star, Ticket, Crown, Zap, Flame, Shield, CheckCircle2, ChevronRight, Settings2, v.v.), tuyệt đối không dùng mã SVG cứng (hardcoded paths).
  - **Tích Hợp Đa Nơi**: Route độc lập `/lucky-draw` và tích hợp trực tiếp trên đầu trang `/voting` với nút cuộn mượt "Bốc Thăm Trúng Thưởng".

---

## 3. KẾT QUẢ KIỂM THỬ & TYPECHECK
- Frontend `apps/ceo1983_app_fe`: `npx tsc --noEmit` -> **Exit code 0 (0 errors)**.
- Backend `apps/ceo1983_app_be`: `npx tsc --noEmit` -> **Exit code 0 (0 errors)**.
- Tuân thủ quy định nghiêm ngặt: Tuyệt đối không tự động chạy `git push` hay `git commit`.
