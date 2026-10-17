import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('D:/download/node_modules/playwright');

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.goto('https://crm.ceo1983.viconnect.vn/auth', { waitUntil: 'networkidle' });
  await page.fill('input[type="text"], input[type="email"]', 'admin@connect.vn');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  await page.goto('https://crm.ceo1983.viconnect.vn/events', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const eventData = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('button, a'));
    const buttons = cards.map(c => ({ text: c.innerText.trim(), href: c.getAttribute('href') })).filter(c => c.text || c.href);
    return buttons;
  });
  console.log('Event buttons & links:', JSON.stringify(eventData.slice(0, 30), null, 2));

  // Kiểm tra sơ đồ ghế trên trang events
  const seatingBtn = page.locator('button:has-text("Sơ đồ ghế"), button:has-text("Xếp chỗ"), button:has-text("Ghế ngồi"), button:has-text("Seating")').first();
  console.log('Seating button visible?', await seatingBtn.isVisible().catch(() => false));

  // Kiểm tra modal tạo sự kiện step 2
  const createBtn = page.locator('button:has-text("Tạo sự kiện"), button:has-text("+ Tạo")').first();
  if (await createBtn.isVisible().catch(() => false)) {
    await createBtn.click();
    await page.waitForTimeout(2000);
    const step2Btn = page.locator('button:has-text("2"), button:has-text("Sơ đồ ghế"), button:has-text("Tiếp tục")').first();
    console.log('In modal, step2/next button visible?', await step2Btn.isVisible().catch(() => false));
  }

  await browser.close();
}

main().catch(console.error);
