import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('D:/download/node_modules/playwright');

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // Login CRM
  await page.goto('https://crm.ceo1983.viconnect.vn/auth', { waitUntil: 'networkidle' });
  await page.fill('input[type="text"], input[type="email"]', 'admin@connect.vn');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // Đi tới event-registrations
  await page.goto('https://crm.ceo1983.viconnect.vn/event-registrations', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);

  // Tìm nút xếp chỗ
  const seatBtn = page.locator('button:has-text("+ Xếp"), button:has-text("Đổi"), button[title*="xếp chỗ"]').first();
  console.log('Nút xếp chỗ có hiển thị không:', await seatBtn.isVisible().catch(() => false));
  if (await seatBtn.isVisible().catch(() => false)) {
    await seatBtn.click();
    await page.waitForTimeout(2500);
    console.log('Đã click mở modal xếp chỗ!');
    const modalMap = page.locator('.cinema-seating-map, [class*="CinemaSeatingMap"], div:has-text("SƠ ĐỒ RẠP CHIẾU PHIM")').first();
    console.log('CinemaSeatingMap modal visible:', await modalMap.isVisible().catch(() => false));
    await page.screenshot({ path: 'scratch/test_cinema_seating_modal.png' });
    console.log('Đã chụp thử ảnh scratch/test_cinema_seating_modal.png');
  } else {
    console.log('Không thấy nút trong bảng, kiểm tra có nút nào khác trên trang không...');
    const allBtns = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()));
    console.log('All buttons on event-registrations:', allBtns);
  }

  await browser.close();
}

main().catch(console.error);
