const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'vumikasa6@gmail.com',
    pass: 'hlqekykrcmcbkqjb'
  }
});

async function main() {
  console.log('--- TESTING SMTP CREDENTIALS & DISPATCH ---');
  
  const verify = await transporter.verify();
  console.log('SMTP Verify Result:', verify);

  // 1. Gửi mail tiếp nhận hồ sơ tới vuvp090120@gmail.com
  console.log('Dispatching test registration email to vuvp090120@gmail.com...');
  const res1 = await transporter.sendMail({
    from: '"CLB Doanh Nhân CEO 1983" <vumikasa6@gmail.com>',
    to: 'vuvp090120@gmail.com',
    subject: '[CLB CEO 1983] Xác Nhận Tiếp Nhận Hồ Sơ Đăng Ký Gia Nhập — Anh/Chị Vũ Văn Phúc',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #003B95;">CLB DOANH NHÂN CEO 1983</h2>
      <p>Kính gửi Anh/Chị <strong>Vũ Văn Phúc</strong>,</p>
      <p>Ban Thư Ký CLB Doanh Nhân CEO 1983 xin trân trọng thông báo: Hệ thống đã <strong>tiếp nhận thành công hồ sơ đăng ký gia nhập</strong> của Anh/Chị:</p>
      <ul>
        <li><strong>Đại diện:</strong> Vũ Văn Phúc (Tổng Giám Đốc)</li>
        <li><strong>Doanh nghiệp:</strong> Công ty Cổ phần Công nghệ ViConnect Global</li>
        <li><strong>Số điện thoại:</strong> 0983 1983 83</li>
        <li><strong>Email:</strong> vuvp090120@gmail.com</li>
        <li><strong>Ban mong muốn tham gia:</strong> Ban Thành Viên & Kết Nối Giao Thương</li>
      </ul>
      <p>Hồ sơ của Anh/Chị đang được Ban Thành Viên & Ban Kiểm Soát CLB tiến hành thẩm định. Sau khi được phê duyệt chính thức, hệ thống sẽ tự động cấp mã hội viên và gửi mật khẩu đăng nhập tài khoản App Doanh Nhân CEO 1983 tới email này.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <p style="font-size: 12px; color: #64748b;">Văn phòng Ban Thư Ký CLB Doanh Nhân CEO 1983 · Hotline: 0983 1983 83</p>
    </div>
    `
  });
  console.log('✓ Sent to vuvp090120@gmail.com:', res1.messageId);

  // 2. Gửi mail vé sự kiện có mã QR tới thuylt313@gmail.com
  console.log('Dispatching test event ticket email to thuylt313@gmail.com...');
  const res2 = await transporter.sendMail({
    from: '"Ban Tổ Chức Sự Kiện CEO 1983" <vumikasa6@gmail.com>',
    to: 'thuylt313@gmail.com',
    subject: '[CLB CEO 1983] Vé Điện Tử & Mã QR Check-in: Diễn Đàn Doanh Nhân CEO 1983 — Lê Thị Thùy (#REG-EV88)',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #003B95;">CLB DOANH NHÂN CEO 1983</h2>
      <p>Kính gửi Chị <strong>Lê Thị Thùy</strong>,</p>
      <p>Ban Tổ Chức xin trân trọng gửi đến Chị thông tin vé tham dự <strong>Diễn Đàn Doanh Nhân CEO 1983 & Kết Nối Giao Thương Mùa Thu 2026</strong>:</p>
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #003B95; margin: 15px 0;">
        <p style="margin: 4px 0;"><strong>Đại biểu:</strong> Lê Thị Thùy (Giám Đốc Kinh Doanh)</p>
        <p style="margin: 4px 0;"><strong>Đơn vị:</strong> Công ty TNHH Thời Trang & Xuất Nhập Khẩu Thùy Linh</p>
        <p style="margin: 4px 0;"><strong>Thời gian:</strong> 08:30 Thứ Bảy, 10/10/2026</p>
        <p style="margin: 4px 0;"><strong>Địa điểm:</strong> Khách sạn Melia Hà Nội, 44 Lý Thường Kiệt</p>
        <p style="margin: 4px 0;"><strong>Mã vé:</strong> <span style="font-family: monospace; font-size: 16px; color: #003B95; font-weight: bold;">REG-EV88</span></p>
        <p style="margin: 4px 0;"><strong>Số may mắn quay thưởng:</strong> <span style="background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 4px; font-weight: bold;">Lucky #198</span></p>
      </div>
      <div style="text-align: center; margin: 20px 0;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=REG-EV88" alt="QR Code Checkin" style="border: 2px solid #003B95; padding: 5px; border-radius: 8px;" />
        <p style="font-size: 12px; color: #64748b; margin-top: 6px;">Xuất trình mã QR này tại bàn tiếp đón để check-in trong 1 giây</p>
      </div>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <p style="font-size: 12px; color: #64748b;">Ban Tổ Chức Sự Kiện CLB Doanh Nhân CEO 1983 · Hotline Hỗ Trợ: 0983 1983 83</p>
    </div>
    `
  });
  console.log('✓ Sent to thuylt313@gmail.com:', res2.messageId);

  console.log('--- ALL EMAILS DISPATCHED SUCCESSFULLY! ---');
}

main().catch(err => {
  console.error('SMTP Dispatch Failed:', err);
  process.exit(1);
});
