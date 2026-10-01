const { chromium } = require('playwright');
const path = require('path');

async function testClickRegister() {
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

  // Click event card
  const eventCard = page.locator('div:has-text("DIỄN ĐÀN DOANH NHÂN")').last();
  await eventCard.click();
  await page.waitForTimeout(2000);

  // Click 'Đăng ký tham gia ngay'
  const regBtn = page.locator('button:has-text("Đăng ký tham gia ngay")');
  console.log('Reg button count:', await regBtn.count());
  if (await regBtn.count() > 0) {
    await regBtn.click();
    await page.waitForTimeout(3000);
    console.log('URL after click:', page.url());
    await page.screenshot({ path: path.join(__dirname, '../document/images/evidence/test_after_reg_click.png') });
    console.log('Saved test_after_reg_click.png');
  }

  await browser.close();
}

testClickRegister().catch(console.error);
