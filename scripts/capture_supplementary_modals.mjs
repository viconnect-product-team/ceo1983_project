import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('D:/download/node_modules/playwright');
import fs from 'fs';
import path from 'path';

async function main() {
  const screenshotsDir = path.resolve('docs/training/screenshots');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const crmContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5
  });
  const crmPage = await crmContext.newPage();

  // Đăng nhập CRM
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/auth', { waitUntil: 'networkidle', timeout: 30000 });
  await crmPage.fill('input[type="text"], input[type="email"]', 'admin@connect.vn');
  await crmPage.fill('input[type="password"]', '123456');
  await crmPage.click('button[type="submit"]');
  await crmPage.waitForTimeout(3500);

  // 1. Modal Thêm Ban Chuyên Môn
  console.log('1. Chụp Modal Thêm Ban Chuyên Môn...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/departments', { waitUntil: 'networkidle', timeout: 30000 });
  await crmPage.waitForTimeout(3500);
  const addDeptBtn = crmPage.locator('button:has-text("Thêm ban"), button:has-text("+ Thêm"), button:has-text("Tạo ban")').first();
  if (await addDeptBtn.isVisible().catch(() => false)) {
    await addDeptBtn.click();
    await crmPage.waitForTimeout(2000);
    await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_03_department_create_modal.png') });
    const closeBtn = crmPage.locator('button:has-text("Hủy"), button[aria-label="Close"], button:has-text("Đóng")').first();
    if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click().catch(() => {});
  }

  // 2. Modal Thêm Tài Khoản Vận Hành
  console.log('2. Chụp Modal Thêm Tài Khoản...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/accounts', { waitUntil: 'networkidle', timeout: 30000 });
  await crmPage.waitForTimeout(3500);
  const addAccBtn = crmPage.locator('button:has-text("Thêm tài khoản"), button:has-text("+ Thêm"), button:has-text("Tạo mới")').first();
  if (await addAccBtn.isVisible().catch(() => false)) {
    await addAccBtn.click();
    await crmPage.waitForTimeout(2000);
    await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_04_account_create_modal.png') });
    const closeBtn = crmPage.locator('button:has-text("Hủy"), button[aria-label="Close"], button:has-text("Đóng")').first();
    if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click().catch(() => {});
  }

  // 3. Chi tiết Hội viên / Duyệt hồ sơ
  console.log('3. Chụp Chi Tiết Hội Viên...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/members', { waitUntil: 'networkidle', timeout: 30000 });
  await crmPage.waitForTimeout(3500);
  const viewMemberBtn = crmPage.locator('table tr a, table tr button[title*="Xem"], table tr button:has-text("Xem"), table tr td:first-child').first();
  if (await viewMemberBtn.isVisible().catch(() => false)) {
    await viewMemberBtn.click();
    await crmPage.waitForTimeout(2500);
    await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_06_member_detail_modal.png') });
  }

  // 4. Modal Tạo sự kiện 3 bước (Cinema map)
  console.log('4. Chụp Modal Tạo Sự Kiện Mới...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/events', { waitUntil: 'networkidle', timeout: 30000 });
  await crmPage.waitForTimeout(3500);
  const createEvtBtn = crmPage.locator('button:has-text("Tạo sự kiện"), button:has-text("+ Tạo"), button:has-text("Thêm sự kiện")').first();
  if (await createEvtBtn.isVisible().catch(() => false)) {
    await createEvtBtn.click();
    await crmPage.waitForTimeout(2500);
    await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_08_event_create_modal.png') });
  }

  // 5. Modal Tạo cuộc họp mới
  console.log('5. Chụp Modal Tạo Cuộc Họp Mới...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/meetings', { waitUntil: 'networkidle', timeout: 30000 });
  await crmPage.waitForTimeout(3500);
  const createMeetBtn = crmPage.locator('button:has-text("Tạo cuộc họp"), button:has-text("+ Tạo"), button:has-text("Thêm cuộc họp")').first();
  if (await createMeetBtn.isVisible().catch(() => false)) {
    await createMeetBtn.click();
    await crmPage.waitForTimeout(2000);
    await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_12_meeting_create_modal.png') });
  }

  await crmContext.close();

  // Mobile: Cuộn xuống form đăng ký gia nhập
  console.log('6. Chụp Mobile Đơn Đăng Ký Hội Viên...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.addInitScript(() => {
    localStorage.setItem('ceo1983_ios_prompt_dismissed', 'true');
    sessionStorage.setItem('ceo1983_ios_prompt_dismissed', 'true');
  });
  await mobilePage.goto('https://ceo1983.viconnect.vn/landing', { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.waitForTimeout(3500);
  // Cuộn xuống đơn đăng ký
  const regForm = mobilePage.locator('form, #register-form, section:has-text("Đăng ký gia nhập")').first();
  if (await regForm.isVisible().catch(() => false)) {
    await regForm.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(2000);
    await mobilePage.screenshot({ path: path.join(screenshotsDir, 'app_01_landing_form.png') });
  }

  await mobileContext.close();
  await browser.close();
  console.log('>>> HOÀN TẤT CHỤP CÁC MODAL BỔ SUNG!');
}

main().catch(console.error);
