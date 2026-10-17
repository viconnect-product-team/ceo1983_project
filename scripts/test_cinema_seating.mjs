import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('D:/download/node_modules/playwright');

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('https://crm.ceo1983.viconnect.vn/auth', { waitUntil: 'networkidle' });
  await page.fill('input[type="text"], input[type="email"]', 'admin@connect.vn');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  await page.goto('https://crm.ceo1983.viconnect.vn/event-registrations', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);

  const seatingBtn = page.locator('button:has-text("Sơ Đồ Xếp Chỗ")').first();
  console.log('Nút Sơ Đồ Xếp Chỗ visible:', await seatingBtn.isVisible());
  if (await seatingBtn.isVisible()) {
    await seatingBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'scratch/cinema_seating_studio.png' });
    console.log('Đã chụp thành công scratch/cinema_seating_studio.png');
  }

  // Thử nút "+ Quét QR / Thêm người tham gia"
  const addParticipantBtn = page.locator('button:has-text("+ Quét QR / Thêm người tham gia")').first();
  if (await addParticipantBtn.isVisible()) {
    // Đóng modal cũ nếu có
    const closeBtn = page.locator('button:has-text("Đóng"), button[aria-label="Close"]').first();
    if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click().catch(() => {});
    await page.waitForTimeout(1000);

    await addParticipantBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'scratch/event_checkin_gatekeeper_modal.png' });
    console.log('Đã chụp thành công scratch/event_checkin_gatekeeper_modal.png');
  }

  await browser.close();
}

main().catch(console.error);
