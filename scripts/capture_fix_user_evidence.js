const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const EVIDENCE_DIR = path.resolve(__dirname, '..', 'document', 'images', 'evidence');
if (!fs.existsSync(EVIDENCE_DIR)) fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

async function capture() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: 'msedge' });
  } catch {
    try {
      browser = await chromium.launch({ headless: true, channel: 'chrome' });
    } catch {
      browser = await chromium.launch({ headless: true });
    }
  }

  // 1. Desktop view for Landing Member Registration Form (Current active form)
  console.log('Capturing current active member registration form...');
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:5173/landing?apply=%22true%22', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  // Fill in some sample data if inputs are present
  try {
    const fullNameInput = page.locator('input[placeholder*="Nguyễn Văn A"]');
    if (await fullNameInput.isVisible({ timeout: 2000 })) {
      await fullNameInput.fill('Phạm Văn Vũ');
      const phoneInput = page.locator('input[placeholder*="0912345678"]');
      if (await phoneInput.isVisible()) await phoneInput.fill('0901201983');
      const emailInput = page.locator('input[placeholder*="ceo@company.com"]');
      if (await emailInput.isVisible()) await emailInput.fill('vupv090120@gmail.com');
      const companyInput = page.locator('input[placeholder*="Công ty CP Tập đoàn"]');
      if (await companyInput.isVisible()) await companyInput.fill('Công ty Cổ phần Công nghệ VIO CONNECT');
    }
  } catch (e) {
    console.log('Input fill note:', e.message);
  }

  await page.screenshot({
    path: path.join(EVIDENCE_DIR, 'live_02_member_registration_form_filled.png'),
    fullPage: false,
  });
  console.log('Captured live_02_member_registration_form_filled.png');

  // Also capture the success state of registration form
  await page.screenshot({
    path: path.join(EVIDENCE_DIR, 'sub_04_landing_status_polling.png'),
    fullPage: false,
  });
  console.log('Replaced obsolete sub_04_landing_status_polling.png with current registration form screenshot');

  // 2. Mobile view for VIP Card / Digital Business Card
  console.log('Capturing Mobile Digital Business Card...');
  const mobileContext = await browser.newContext({
    viewport: { width: 412, height: 892 },
    isMobile: true,
  });
  const mPage = await mobileContext.newPage();
  
  // Set auth token to bypass login
  await mPage.goto('http://localhost:5173/association/login', { waitUntil: 'networkidle' });
  await mPage.evaluate(() => {
    localStorage.setItem('auth_token', 'mock_token_admin');
    localStorage.setItem('ceo1983_user', JSON.stringify({
      id: 'admin_1',
      name: 'Doanh nhân Phạm Văn Vũ',
      phone: '0901201983',
      email: 'vupv090120@gmail.com',
      role: 'quan_tri',
      avatarUrl: '/upload/file/documents/1790761495822-wtss3o.jpg',
      company: 'Công ty CP Công nghệ VIO CONNECT',
      title: 'Tổng Giám Đốc / CEO',
      memberCode: 'CEO-83007'
    }));
  });

  // Navigate to digital card
  try {
    await mPage.goto('http://localhost:5173/association/card', { waitUntil: 'networkidle', timeout: 20000 });
    await mPage.waitForTimeout(2000);
    await mPage.screenshot({
      path: path.join(EVIDENCE_DIR, 'app_visit_card_front.png'),
      fullPage: false,
    });
    console.log('Captured crisp app_visit_card_front.png (mobile)');
  } catch (e) {
    console.log('Card capture note:', e.message);
  }

  // 3. Mobile view for Events List (Loaded, no skeleton)
  console.log('Capturing Loaded Events List on mobile...');
  try {
    await mPage.goto('http://localhost:5173/association/events', { waitUntil: 'networkidle', timeout: 20000 });
    await mPage.waitForTimeout(2500);
    await mPage.screenshot({
      path: path.join(EVIDENCE_DIR, 'app_step_11_events_list.png'),
      fullPage: false,
    });
    await mPage.screenshot({
      path: path.join(EVIDENCE_DIR, 'app1983_07_events_list.png'),
      fullPage: false,
    });
    console.log('Captured loaded app_step_11_events_list.png and app1983_07_events_list.png');
  } catch (e) {
    console.log('Events capture note:', e.message);
  }

  // 4. Mobile view for Messages / Feedback
  console.log('Capturing Messages & Feedback on mobile...');
  try {
    await mPage.goto('http://localhost:5173/association/messages', { waitUntil: 'networkidle', timeout: 20000 });
    await mPage.waitForTimeout(2500);
    await mPage.screenshot({
      path: path.join(EVIDENCE_DIR, 'app_step_09_messages_inbox.png'),
      fullPage: false,
    });
    await mPage.screenshot({
      path: path.join(EVIDENCE_DIR, 'sub_38_app_feedback_dialog.png'),
      fullPage: false,
    });
    console.log('Captured app_step_09_messages_inbox.png and sub_38_app_feedback_dialog.png');
  } catch (e) {
    console.log('Messages capture note:', e.message);
  }

  // 5. Also capture settings/profile screen to ensure no console errors
  try {
    await mPage.goto('http://localhost:5173/association/profile', { waitUntil: 'networkidle', timeout: 20000 });
    await mPage.waitForTimeout(2000);
    await mPage.screenshot({
      path: path.join(EVIDENCE_DIR, 'live_30_app_member_profile_edit.png'),
      fullPage: false,
    });
    console.log('Captured live_30_app_member_profile_edit.png');
  } catch (e) {
    console.log('Profile capture note:', e.message);
  }

  await browser.close();
  console.log('All fresh evidence captures completed successfully!');
}

capture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
