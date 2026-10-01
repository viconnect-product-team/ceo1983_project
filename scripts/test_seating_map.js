const { chromium } = require('playwright');
const path = require('path');

async function testSeatingMap() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Login CRM
  await page.goto('https://14.225.217.232:5443/auth', { waitUntil: 'networkidle' });
  await page.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
  await page.locator('input[type="password"]').first().fill('123456');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3000);

  // Navigate to event registrations
  await page.goto('https://14.225.217.232:5443/event-registrations', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('Event Registrations URL:', page.url());

  // Check seat button
  const seatBtn = page.locator('button:has-text("+ Xếp"), button:has-text("Đổi")').first();
  console.log('Seat button count:', await seatBtn.count());
  if (await seatBtn.count() > 0) {
    await seatBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(__dirname, '../document/images/evidence/test_cinema_seating_modal.png') });
    console.log('Saved test_cinema_seating_modal.png');
  } else {
    // If no row, check what rows exist
    console.log('Table rows count:', await page.locator('table tbody tr').count());
  }

  await browser.close();
}

testSeatingMap().catch(console.error);
