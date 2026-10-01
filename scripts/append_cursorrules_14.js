const fs = require('fs');
const path = require('path');

const rule = `
# [BẮT BUỘC 14] Quy Chuẩn Slide Thuyết Trình Đối Ngoại & Khung Mockup Mobile Titanium:
#   - Slide thuyết trình (CRM & App) TUYỆT ĐỐI KHÔNG đưa màn hình đăng nhập tiện ích cơ bản. Bắt buộc tập trung 100% vào giá trị cốt lõi, đặc quyền hội viên, sàn giao thương B2B, sổ quỹ tài chính và công tác đại hội.
#   - Bộ slide CRM gồm đúng 16 slides (CHỨC NĂNG QUẢN TRỊ 01 -> 16); Bộ slide App gồm đúng 20 slides (CHỨC NĂNG HỘI VIÊN 01 -> 20).
#   - Giao diện minh họa di động trên Slide bắt buộc hiển thị dưới dạng Khung Smartphone Titanium sang trọng (Titanium chassis, dynamic island, home bar), không dùng khung hộp xám thô kệch để lộ khoảng trắng trống trải.
#   - Màn hình quét QR phải hiển thị đúng giao diện Camera Scanner WebRTC (khung ngắm mạ vàng, tia laser quét động). Màn hình thẻ công khai phải hiển thị trọn vẹn 100% không cắt xén thông tin liên lạc hay bảng thẩm định.
`;

fs.appendFileSync(path.join(__dirname, '../.cursorrules'), rule, 'utf8');
console.log('✓ Successfully appended Rule 14 to .cursorrules!');
