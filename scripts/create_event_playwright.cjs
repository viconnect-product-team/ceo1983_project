const { chromium } = require('playwright');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const token = jwt.sign(
  {
    sub: '00000000-0000-4000-8000-000000000002',
    username: 'admin@connect.vn',
    email: 'admin@connect.vn',
    role: 'admin',
    roles: ['admin']
  },
  'super-secret-jwt-key',
  { expiresIn: '7d' }
);

const adminUser = {
  id: '00000000-0000-4000-8000-000000000002',
  email: 'admin@connect.vn',
  name: 'Quản Trị Viên Hệ Thống',
  role: 'admin',
  roles: ['admin']
};

const bannerImagePath = 'C:/Users/vumik/.gemini/antigravity/brain/d9c75d33-1020-4218-8204-2ef7f8536309/.user_uploaded/media_1794423178834_96fd621b.jpg';

async function main() {
  console.log('Starting Playwright automation on crm.ceo1983.viconnect.vn...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (!text.includes('[vite]') && !text.includes('Download the React DevTools')) {
      console.log('BROWSER LOG:', text);
    }
  });

  page.on('response', res => {
    if (res.url().includes('/api/')) {
      console.log('API RES:', res.status(), res.url());
    }
  });

  await page.goto('https://crm.ceo1983.viconnect.vn');
  await page.evaluate(({ t, u }) => {
    localStorage.setItem('vibe_token', t);
    localStorage.setItem('token', t);
    localStorage.setItem('access_token', t);
    localStorage.setItem('vibe_user', JSON.stringify(u));
  }, { t: token, u: adminUser });

  console.log('Navigating to /events...');
  await page.goto('https://crm.ceo1983.viconnect.vn/events');
  await page.waitForLoadState('networkidle');

  console.log('Opening EventWizard...');
  const createBtn = page.locator('button:has-text("Tạo sự kiện")').first();
  await createBtn.click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'scripts/wizard_step0.png' });
  console.log('Screenshot saved: scripts/wizard_step0.png');

  // Fill in Step 0
  console.log('Filling in Step 0 (Thông tin sự kiện)...');
  
  // Event Name
  const nameInput = page.locator('input#ewz-name, input[placeholder*="tên sự kiện"], input[placeholder*="Tên sự kiện"]').first();
  await nameInput.fill('Kỷ Niệm 4 Năm Thành Lập Viện Doanh Trí & Tọa Đàm Kinh Tế: Doanh Nghiệp Việt 2027');

  // Tagline
  const taglineInput = page.locator('input#ewz-tagline, input[placeholder*="chủ đề"], input[placeholder*="Slogan"]').first();
  if (await taglineInput.count() > 0) {
    await taglineInput.fill('Củng cố nội lực - Tạo đà tăng trưởng | Thị trường - Dòng tiền - Năng suất trong kỷ nguyên AI & Tri ân Ngày Nhà giáo Việt Nam 20/11');
  }

  // Upload file banner
  console.log('Uploading banner image...');
  const fileInput = page.locator('input[type="file"][accept*="image"]').first();
  if (await fileInput.count() > 0) {
    await fileInput.setInputFiles(bannerImagePath);
    console.log('Banner image selected, waiting for upload...');
    await page.waitForTimeout(3000);
  }

  // Date: 21/11/2026
  const dateInput = page.locator('input#ewz-date, input[placeholder*="dd/mm/yyyy"]').first();
  if (await dateInput.count() > 0) {
    await dateInput.fill('21/11/2026');
  }

  // Time
  const startTimeInput = page.locator('input#ewz-start-time').first();
  if (await startTimeInput.count() > 0) {
    await startTimeInput.fill('15:00');
  }
  const endTimeInput = page.locator('input#ewz-end-time').first();
  if (await endTimeInput.count() > 0) {
    await endTimeInput.fill('22:00');
  }

  // Location with real keystrokes
  console.log('Filling location with pressSequentially...');
  const locationInput = page.locator('#ewz-location');
  await locationInput.click();
  await locationInput.fill('');
  await locationInput.pressSequentially('Nhà hàng Long Phụng - Tầng 2, Tòa nhà 29T2, Hoàng Đạo Thúy, Cầu Giấy, Hà Nội', { delay: 10 });
  await page.waitForTimeout(500);

  // Capacity
  const capacityInput = page.locator('input#ewz-capacity, input[placeholder*="sức chứa"]').first();
  if (await capacityInput.count() > 0) {
    await capacityInput.fill('200');
  }

  // Description
  const descTextarea = page.locator('textarea#ewz-desc, textarea[placeholder*="Mô tả"]').first();
  if (await descTextarea.count() > 0) {
    await descTextarea.fill('Chương trình Kỷ niệm 4 năm Thành lập Viện Doanh Trí & Tọa đàm Kinh tế: Doanh Nghiệp Việt 2027 kết hợp Tri ân Ngày Nhà giáo Việt Nam 20/11. Chương trình quy tụ các chuyên gia kinh tế, các diễn giả và cộng đồng doanh nhân CEO 1983 cùng thảo luận về giải pháp củng cố nội lực, khơi thông dòng tiền và nâng cao năng suất trong kỷ nguyên số và trí tuệ nhân tạo.');
  }

  await page.screenshot({ path: 'scripts/wizard_step0_filled.png' });
  console.log('Screenshot saved: scripts/wizard_step0_filled.png');

  // Verify values
  console.log('INPUT VALUES:');
  console.log('Name:', await nameInput.inputValue());
  console.log('Date:', await dateInput.inputValue());
  console.log('Location:', await locationInput.inputValue());
  console.log('Capacity:', await capacityInput.inputValue());

  // Click Next to Step 1 (Tickets)
  console.log('Clicking Next to Step 1 (button:has-text("Tiếp tục"))...');
  const nextBtn = page.locator('button:has-text("Tiếp tục")').first();
  await nextBtn.click();
  await page.waitForTimeout(1000);

  // Check any validation error messages on page
  const pageErrors = await page.locator('.text-destructive').allInnerTexts();
  console.log('Validation errors on page:', pageErrors);

  await page.screenshot({ path: 'scripts/wizard_step1.png' });
  console.log('Screenshot saved: scripts/wizard_step1.png');

  // Step 1: Tickets - Click Next to Step 2
  console.log('Clicking Next to Step 2 (QR)...');
  await nextBtn.click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'scripts/wizard_step2.png' });
  console.log('Screenshot saved: scripts/wizard_step2.png');

  // Check any active toasts
  const toastsOnStep2 = await page.locator('[data-sonner-toast]').allInnerTexts();
  console.log('Toasts on Step 2:', toastsOnStep2);

  // Submit Event
  console.log('Submitting event creation inside modal dialog...');
  const submitBtn = page.locator('div[role="dialog"] button:has-text("Tạo sự kiện")');
  await submitBtn.click({ force: true });
  console.log('Clicked submit button, waiting for API response...');
  
  // Wait up to 10 seconds for events API POST response
  await page.waitForTimeout(5000);
  const toastsAfterSubmit = await page.locator('[data-sonner-toast]').allInnerTexts();
  console.log('Toasts after submit:', toastsAfterSubmit);

  await page.screenshot({ path: 'scripts/wizard_finished.png' });
  console.log('Screenshot saved: scripts/wizard_finished.png');

  await browser.close();
  console.log('Automation complete!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
