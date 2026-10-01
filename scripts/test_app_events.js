const { chromium } = require('playwright');
const path = require('path');

async function testAppEvents() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await ctx.newPage();

  // Login
  await page.goto('https://14.225.217.232:5444/association/login', { waitUntil: 'networkidle' });
  await page.locator('#assoc-auth-id').first().fill('admin@connect.vn');
  await page.locator('#assoc-auth-password').first().fill('123456');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3000);

  // Navigate to /association/events
  await page.goto('https://14.225.217.232:5444/association/events', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('App Events URL:', page.url());

  await page.screenshot({ path: path.join(__dirname, '../document/images/evidence/test_app_events_screen.png') });
  console.log('Saved test_app_events_screen.png');

  // Check event card click to see detail modal or ticket pass
  const eventCard = page.locator('div:has-text("DIỄN ĐÀN DOANH NHÂN"), div:has-text("Sự kiện")').last();
  if (await eventCard.count() > 0) {
    await eventCard.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(__dirname, '../document/images/evidence/test_app_event_modal.png') });
    console.log('Saved test_app_event_modal.png');
  }

  await browser.close();
}

testAppEvents().catch(console.error);
