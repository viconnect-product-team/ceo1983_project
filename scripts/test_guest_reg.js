const { chromium } = require('playwright');
const path = require('path');

async function testGuestRegFlow() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await ctx.newPage();

  // Login on app first so session is active
  await page.goto('https://14.225.217.232:5444/association/login', { waitUntil: 'networkidle' });
  await page.locator('#assoc-auth-id').first().fill('admin@connect.vn');
  await page.locator('#assoc-auth-password').first().fill('123456');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3000);

  // Navigate to Guest Event Register
  console.log('Navigating to event register...');
  await page.goto('https://14.225.217.232:5444/events/EV-MUOGTPO1/register', { waitUntil: 'networkidle' });
  console.log('Event Register URL:', page.url());

  // Fill form
  await page.locator('input[placeholder*="Nguyễn Văn"], input[type="text"]').first().fill('Lê Thị Thủy');
  await page.locator('input[type="tel"]').first().fill('0983313313');
  await page.locator('input[type="email"]').first().fill('thuylt313@gmail.com');
  
  const companyInput = page.locator('input[placeholder*="Công ty"], input[placeholder*="Tên doanh nghiệp"]').first();
  if (await companyInput.count() > 0) {
    await companyInput.fill('Dược Phẩm Thủy Lê');
  }

  const posInput = page.locator('input[placeholder*="Giám đốc"], input[placeholder*="Chức vụ"]').first();
  if (await posInput.count() > 0) {
    await posInput.fill('Giám Đốc Điều Hành');
  }

  await page.screenshot({ path: path.join(__dirname, '../document/images/evidence/test_guest_free_fill.png') });
  console.log('Screenshot saved: test_guest_free_fill.png');

  // Submit
  const submitBtn = page.locator('button:has-text("Đăng Ký"), button:has-text("Xác Nhận"), button[type="submit"]').last();
  await submitBtn.click();
  await page.waitForTimeout(4000);

  await page.screenshot({ path: path.join(__dirname, '../document/images/evidence/test_guest_free_result.png') });
  console.log('Screenshot saved: test_guest_free_result.png');

  await browser.close();
}

testGuestRegFlow().catch(console.error);
