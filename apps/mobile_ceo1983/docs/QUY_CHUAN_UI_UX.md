# QUY CHUẨN THIẾT KẾ UI/UX MOBILE - CLB DOANH NHÂN CEO 1983
## Phân Hệ: Mobile App Android / iOS Wrapper (`apps/mobile_ceo1983`)

---

## 1. NGUYÊN TẮC VÀNG: ĐÚNG 3 MÀU CHUẨN CEO 1983
Trên ứng dụng di động native, mọi màn hình, thanh trạng thái (Status Bar), splash screen, bottom navigation đều tuân thủ nghiêm ngặt **3 tông màu duy nhất**:
1. **Deep Cobalt Navy (`#003B95`)**: Màu nền Splash Screen, màu thanh Header, màu nút hành động chính.
2. **Warm Amber Gold (`#F59E0B`)**: Viền thẻ danh thiếp, icon nổi bật, thông báo quan trọng.
3. **Neutral Contrast (`#FFFFFF` / `#0F172A`)**: Nền thẻ sáng sạch hoặc thẻ tối sang trọng.

> ⛔ **CẤM TUYỆT ĐỐI**: Màu tím, hồng, xanh lá chuối, màu cầu vồng trên giao diện app mobile!

---

## 2. TRẢI NGHIỆM VUỐT CHẠM NATIVE 60-120 FPS
- **Không trễ nhịp**: Thời gian phản hồi xúc giác `:active` $\le$ 60ms.
- **Cuộn mượt mà**: Sử dụng CSS `touch-action: pan-y;` trên toàn bộ container cuộn.
- **Kéo để làm mới (Pull to Refresh)**: Cử chỉ kéo mượt mà, đàn hồi tự nhiên như MoMo và Apple iOS.
- **Touch Target**: Mọi phần tử bấm được tối thiểu `44px x 44px`.
