# ĐẶC TẢ KỸ THUẬT: VIỆT HÓA TOÀN BỘ AI SKILL VÀ CƠ CHẾ TỰ ĐỘNG STREAM SPACE / TRIM KHOẢNG TRẮNG TOÀN HỆ THỐNG

## 1. Mục Tiêu & Bối Cảnh
1. **Việt hóa AI Skill**:
   - Chuyển ngữ toàn diện các tệp chỉ dẫn kỹ năng AI Agent từ tiếng Anh sang 100% tiếng Việt chuyên nghiệp:
     - `.agents/skills/ceo1983-association/SKILL.md`: Hệ thống CRM Hiệp hội CEO 1983 (bảng màu, 43 định tuyến, quy tắc RBAC, lưu trữ).
     - `.agents/skills/ceo1983-mobile/SKILL.md`: Ứng dụng di động CEO 1983 Mobile App (Capacitor native, Foreground Service, Android Speech Bridge).
     - `apps/mobile_ceo1983/docs/SKILL.md`: Hướng dẫn vận hành & đóng gói Mobile APK.
2. **Cơ chế Stream Space / Auto-Trim Whitespace**:
   - Người dùng thường xuyên gặp tình trạng gõ nhầm khoảng trắng thừa ở đầu/cuối chuỗi hoặc ô nhập chỉ toàn dấu cách (whitespace-only) dẫn đến lỗi dữ liệu, tìm kiếm sai lệch hoặc tạo bản ghi rỗng.
   - Triển khai cơ chế toàn cục (Global Stream Space Trimmer) tự động chuẩn hóa và cắt tỉa mọi ô nhập liệu (`input`, `textarea`) trên toàn bộ hệ thống Web CRM và Mobile App CEO 1983 khi người dùng blur khỏi ô nhập, đồng thời chặn giá trị chỉ toàn khoảng trắng.

---

## 2. Kiến Trúc & Giải Pháp Kỹ Thuật

### 2.1. Thư viện trợ năng `input-trim-helper.ts`
- **Đường dẫn**: `apps/ceo1983_app_fe/src/lib/input-trim-helper.ts`
- **Cơ chế hoạt động**:
  - Lắng nghe sự kiện `focusout` và `blur` ở capture phase trên toàn bộ cây DOM (`window.addEventListener('focusout', ..., true)`).
  - Tự động bỏ qua các trường không thích hợp:
    - Ô mật khẩu (`type="password"`) để bảo toàn ký tự khoảng trắng có chủ ý của người dùng.
    - `file`, `checkbox`, `radio`, `hidden`, `range`, `color`, `button`, `submit`, `reset`.
    - Các phần tử đang trong trạng thái `readOnly` hoặc `disabled`.
  - **React State Synchronization (Virtual DOM Value Setter)**:
    - Khi thay đổi trực tiếp `input.value`, React nội tại sẽ không phát hiện thay đổi nếu không kích hoạt prototype setter.
    - Giải pháp: Sử dụng `Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(el, trimmed)` để ép React Virtual DOM Tracker nhận diện giá trị đã được trim, sau đó dispatch các sự kiện tổng hợp `Event('input', { bubbles: true })` và `Event('change', { bubbles: true })`.

### 2.2. Tích hợp Đa Lớp (Defense-in-Depth)
1. **Lớp Toàn Cục (Global Window Event Capture)**:
   - Được khởi tạo tại `apps/ceo1983_app_fe/src/routes/__root.tsx` trong `RootComponent`.
   - Bắt trọn mọi ô nhập xuất hiện động trong modals, drawers, bottom sheets, bảng dữ liệu inline-edit.
2. **Lớp Thành Phần Cơ Sở (Base UI Components)**:
   - `apps/ceo1983_app_fe/src/components/ui/input.tsx`: Gắn sẵn `trimInputElement(e.currentTarget)` trên sự kiện `onBlur`.
   - `apps/ceo1983_app_fe/src/components/ui/textarea.tsx`: Gắn sẵn `trimInputElement(e.currentTarget)` trên sự kiện `onBlur`.

---

## 3. Danh Mục Tệp Triển Khai & Kiểm Tra Chất Lượng
- `.agents/skills/ceo1983-association/SKILL.md`: Việt hóa 100%.
- `.agents/skills/ceo1983-mobile/SKILL.md`: Việt hóa 100%.
- `apps/mobile_ceo1983/docs/SKILL.md`: Việt hóa 100%.
- `apps/ceo1983_app_fe/src/lib/input-trim-helper.ts`: Mã nguồn tiện ích cắt khoảng trắng.
- `apps/ceo1983_app_fe/src/routes/__root.tsx`: Đăng ký bộ lắng nghe toàn cục.
- `apps/ceo1983_app_fe/src/components/ui/input.tsx`: Tích hợp auto-trim on blur.
- `apps/ceo1983_app_fe/src/components/ui/textarea.tsx`: Tích hợp auto-trim on blur.
- `.cursorrules`: Bổ sung điều khoản [BẮT BUỘC 59].
- `MEMORY.md`: Ghi chép nhật ký 227.

### Kết Quả Kiểm Tra TypeScript:
- `apps/ceo1983_app_fe`: `npx tsc --noEmit` -> Exit Code 0 (0 error).
- `apps/ceo1983_app_be`: `npx tsc --noEmit` -> Exit Code 0 (0 error).
