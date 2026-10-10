# MOBILE CODING RULES (CURSORRULE) - CEO 1983 PROJECT
## Phân Hệ: Mobile App Android / iOS Wrapper (`apps/mobile_ceo1983`)

---

### [ĐIỀU LUẬT 1] BẢO ĐẢM TỐC ĐỘ PHẢN HỒI CẢM ỨNG 0MS (Zero Touch Latency)
- Tuyệt đối CẤM chèn bất kỳ đoạn mã nào gọi `e.preventDefault()` trong sự kiện `touchend`.
- Trên Chromium WebView di động, gọi `preventDefault()` trong `touchend` sẽ hủy toàn bộ sự kiện click tự nhiên, khiến người dùng bị cảm giác "chạm không ăn" hoặc "bị đơ".

---

### [ĐIỀU LUẬT 2] TRIỆT TIÊU HIỆU ỨNG NẶNG GÂY TỤT FPS
- Không sử dụng CSS `filter: blur(...)` vượt quá 12px trên diện tích lớn hơn 100px.
- Tránh gán `transform: translateZ(0)` bừa bãi lên toàn bộ danh sách card khiến GPU cạn kiệt bộ nhớ VRAM.

---

### [ĐIỀU LUẬT 3] AN TOÀN VÙNG HIỂN THỊ (Safe Area & Notch)
- Giao diện phải tính toán trừ hao vùng tai thỏ (`safe-area-inset-top`) và thanh điều hướng đáy (`safe-area-inset-bottom`).
- Khoảng cách chạm (Touch targets) tối thiểu **44px x 44px** cho mọi ngón tay thao tác.
