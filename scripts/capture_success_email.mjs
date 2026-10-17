import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('D:/download/node_modules/playwright');
import path from 'path';

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5
  });
  const page = await context.newPage();

  // Đăng nhập CRM
  console.log('1. Đăng nhập CRM...');
  await page.goto('https://crm.ceo1983.viconnect.vn/auth', { waitUntil: 'networkidle', timeout: 35000 });
  await page.fill('input[type="text"], input[type="email"]', 'admin@connect.vn');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);

  // Mở trang đăng ký khách mời
  console.log('2. Mở trang đăng ký khách mời...');
  const eventId = 'EV-MV7E33J4';
  await page.goto(`https://crm.ceo1983.viconnect.vn/events/${eventId}/register?source=zalo_guest`, { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForTimeout(5000); // Đợi tải dữ liệu sự kiện

  // Kiểm tra inputs
  console.log('3. Điền form đăng ký...');
  const nameLoc = page.locator('input[placeholder*="Hoàng"], input[placeholder*="Tên"], form input').first();
  await nameLoc.waitFor({ timeout: 10000 });
  await nameLoc.fill('Nguyễn Tuấn Anh');

  const emailLoc = page.locator('input[type="email"]').first();
  if (await emailLoc.isVisible()) await emailLoc.fill('tuananh.ceo@vietants.vn');

  const telLoc = page.locator('input[type="tel"], input[placeholder*="09"]').first();
  if (await telLoc.isVisible()) await telLoc.fill('0988665544');

  const companyLoc = page.locator('input[placeholder*="Tập đoàn"], input[placeholder*="Công ty"]').first();
  if (await companyLoc.isVisible()) await companyLoc.fill('Tập đoàn Công nghệ & Thương mại Ánh Dương');

  const posLoc = page.locator('input[placeholder*="Giám Đốc"], input[placeholder*="Chức vụ"]').first();
  if (await posLoc.isVisible()) await posLoc.fill('Chủ tịch HĐQT & Tổng Giám đốc');

  console.log('4. Click submit form...');
  const submitBtn = page.locator('button[type="submit"], button:has-text("Đăng Ký"), button:has-text("Xác Nhận")').first();
  await submitBtn.click();

  console.log('5. Đợi kết quả xác nhận vé và thông báo email...');
  await page.waitForTimeout(5000);

  const outPath = path.resolve('docs/training/screenshots/crm_07_event_register_success_email.png');
  await page.screenshot({ path: outPath });
  console.log('>>> HOÀN THÀNH: Đã lưu ảnh thành công vào:', outPath);
  await browser.close();
}

run().catch(err => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
