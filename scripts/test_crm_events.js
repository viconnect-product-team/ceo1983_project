const { chromium } = require('playwright');
const path = require('path');

async function testCrmEvents() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Login
  await page.goto('https://14.225.217.232:5443/auth', { waitUntil: 'networkidle' });
  await page.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
  await page.locator('input[type="password"]').first().fill('123456');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3000);

  // Navigate to /events
  await page.goto('https://14.225.217.232:5443/events', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Check buttons
  const buttons = await page.locator('button, a').allInnerTexts();
  console.log('Events page buttons:', buttons.filter(b => b.trim().length > 0 && b.trim().length < 40).slice(0, 20));

  // Find create event button
  const createBtn = page.locator('button:has-text("Tạo sự kiện"), button:has-text("Thêm sự kiện"), a:has-text("Tạo sự kiện")').first();
  if (await createBtn.count() > 0) {
    console.log('Found create button:', await createBtn.innerText());
    await createBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(__dirname, '../document/images/evidence/test_crm_event_create_modal.png') });
    console.log('Saved test_crm_event_create_modal.png');
  }

  // Also check seating map button or tab
  const seatBtn = page.locator('button:has-text("sơ đồ"), a:has-text("sơ đồ"), button:has-text("chỗ ngồi")').first();
  console.log('Seat button count:', await seatBtn.count());

  await browser.close();
}

testCrmEvents().catch(console.error);
