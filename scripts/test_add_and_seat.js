const { chromium } = require('playwright');
const path = require('path');

async function testAddAndSeat() {
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

  // Click '+ Quét QR / Thêm người tham gia'
  const addBtn = page.locator('button:has-text("Thêm người tham gia")').first();
  console.log('Add button count:', await addBtn.count());
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(1500);

    // Switch to manual form tab if needed
    const manualTab = page.locator('button:has-text("Nhập thủ công"), button:has-text("Thủ công")').first();
    if (await manualTab.count() > 0) {
      await manualTab.click();
      await page.waitForTimeout(500);
    }

    // Fill attendee details
    const nameInput = page.locator('input[placeholder*="họ và tên"], input[placeholder*="Nguyễn Văn"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill('Lê Thị Thủy');
    }
    const emailInput = page.locator('input[type="email"], input[placeholder*="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill('thuylt313@gmail.com');
    }
    const phoneInput = page.locator('input[placeholder*="điện thoại"], input[type="tel"]').first();
    if (await phoneInput.count() > 0) {
      await phoneInput.fill('0983313313');
    }
    const compInput = page.locator('input[placeholder*="công ty"], input[placeholder*="doanh nghiệp"]').first();
    if (await compInput.count() > 0) {
      await compInput.fill('Dược Phẩm Thủy Lê');
    }

    // Submit add attendee
    const saveBtn = page.locator('button:has-text("Xác nhận"), button:has-text("Lưu"), button:has-text("Thêm đại biểu")').last();
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  // Now check table rows and seating button
  const seatBtn = page.locator('button:has-text("Đổi"), button:has-text("+ Xếp")').first();
  console.log('Seat button after adding:', await seatBtn.count());
  if (await seatBtn.count() > 0) {
    await seatBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(__dirname, '../document/images/evidence/test_live_cinema_seating_map.png') });
    console.log('Saved test_live_cinema_seating_map.png');
  }

  // Also capture the table view with Le Thi Thuy
  await page.screenshot({ path: path.join(__dirname, '../document/images/evidence/test_live_registrations_table.png') });
  console.log('Saved test_live_registrations_table.png');

  await browser.close();
}

testAddAndSeat().catch(console.error);
