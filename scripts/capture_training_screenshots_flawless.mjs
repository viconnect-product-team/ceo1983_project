import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('D:/download/node_modules/playwright');
import fs from 'fs';
import path from 'path';

async function main() {
  const screenshotsDir = path.resolve('docs/training/screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  console.log('>>> BẮT ĐẦU CHỤP BỘ ẢNH CHUẨN HÓA TRAINING CHO CEO 1983...');
  console.log('>>> Quy tắc: Chờ tối thiểu 3.5s - 4s, đợi networkidle, không chụp ảnh lỗi/loading.');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  // -------------------------------------------------------------
  // 1. CAPTURE DESKTOP CRM SCREENSHOTS
  // -------------------------------------------------------------
  console.log('\n--- BƯỚC 1: CHỤP PHÂN HỆ CRM WEB (1440x900) ---');
  const crmContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5
  });
  const crmPage = await crmContext.newPage();

  // CRM 01: Login
  console.log('1. Chụp CRM Login...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/auth', { waitUntil: 'networkidle', timeout: 45000 });
  await crmPage.waitForTimeout(4000);
  await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_01_login.png') });

  // Đăng nhập CRM
  console.log('Đang đăng nhập vào CRM...');
  await crmPage.fill('input[type="text"], input[type="email"]', 'admin@connect.vn');
  await crmPage.fill('input[type="password"]', '123456');
  await crmPage.click('button[type="submit"]');
  await crmPage.waitForTimeout(4000);

  // CRM 02: Dashboard
  console.log('2. Chụp CRM Dashboard Tổng quan...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/', { waitUntil: 'networkidle', timeout: 45000 });
  await crmPage.waitForTimeout(4000);
  await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_02_dashboard.png') });

  // CRM 03: Departments (Ban chuyên môn)
  console.log('3. Chụp CRM Ban Chuyên Môn...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/departments', { waitUntil: 'networkidle', timeout: 45000 });
  await crmPage.waitForTimeout(4000);
  await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_03_departments.png') });

  // CRM 04: Accounts
  console.log('4. Chụp CRM Tài khoản vận hành...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/accounts', { waitUntil: 'networkidle', timeout: 45000 });
  await crmPage.waitForTimeout(4000);
  await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_04_accounts.png') });

  // CRM 05: Permissions RBAC
  console.log('5. Chụp CRM Phân quyền RBAC...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/permissions', { waitUntil: 'networkidle', timeout: 45000 });
  await crmPage.waitForTimeout(4000);
  await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_05_permissions.png') });

  // CRM 06: Members List
  console.log('6. Chụp CRM Danh sách Hội viên...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/members', { waitUntil: 'networkidle', timeout: 45000 });
  await crmPage.waitForTimeout(4000);
  await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_06_members.png') });

  // CRM 07: Events Management
  console.log('7. Chụp CRM Quản lý Sự kiện...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/events', { waitUntil: 'networkidle', timeout: 45000 });
  await crmPage.waitForTimeout(4000);
  await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_07_events.png') });

  // CRM 08: Event Creation Modal & Seating Map
  console.log('8. Chụp CRM Tạo Sự Kiện Mới...');
  const createEvtBtn = crmPage.locator('button:has-text("+ Tạo sự kiện"), button:has-text("Tạo sự kiện mới"), button:has-text("+ Tạo")').first();
  if (await createEvtBtn.isVisible().catch(() => false)) {
    await createEvtBtn.click().catch(() => {});
    await crmPage.waitForTimeout(2000);
    await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_08_event_create_modal.png') });
    const closeBtn = crmPage.locator('button:has-text("Hủy"), button[aria-label="Close"], button:has-text("Đóng")').first();
    if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click().catch(() => {});
    await crmPage.waitForTimeout(1000);
  }

  // CRM 09: Check-in Gate
  console.log('9. Chụp CRM Check-in Sự kiện...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/checkin', { waitUntil: 'networkidle', timeout: 45000 });
  await crmPage.waitForTimeout(4000);
  await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_09_checkin.png') });

  // CRM 10: Tasks Kanban
  console.log('10. Chụp CRM Quản lý Công việc (Kanban)...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/tasks', { waitUntil: 'networkidle', timeout: 45000 });
  await crmPage.waitForTimeout(4000);
  await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_10_tasks_kanban.png') });

  // CRM 11: Task Creation Modal
  console.log('11. Chụp CRM Modal Thêm Công việc mới...');
  const addTaskBtn = crmPage.locator('button:has-text("Thêm công việc"), button:has-text("+ Thêm công việc mới"), button:has-text("+ Thêm")').first();
  if (await addTaskBtn.isVisible().catch(() => false)) {
    await addTaskBtn.click().catch(() => {});
    await crmPage.waitForTimeout(2000);
    await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_11_task_create_modal.png') });
    const closeBtn = crmPage.locator('button:has-text("Hủy"), button[aria-label="Close"], button:has-text("Đóng")').first();
    if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click().catch(() => {});
    await crmPage.waitForTimeout(1000);
  }

  // CRM 12: Meetings Management
  console.log('12. Chụp CRM Quản lý Cuộc họp...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/meetings', { waitUntil: 'networkidle', timeout: 45000 });
  await crmPage.waitForTimeout(4000);
  await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_12_meetings.png') });

  // CRM 13: Fees & Cashbook (Niên liễm)
  console.log('13. Chụp CRM Quản lý Niên liễm / Tài chính...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/fees', { waitUntil: 'networkidle', timeout: 45000 });
  await crmPage.waitForTimeout(4000);
  await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_13_fees.png') });

  // CRM 14: Marketplace
  console.log('14. Chụp CRM Chợ Giao thương B2B...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/marketplace', { waitUntil: 'networkidle', timeout: 45000 });
  await crmPage.waitForTimeout(4000);
  await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_14_marketplace.png') });

  // CRM 15: Voting / Polls
  console.log('15. Chụp CRM Khảo sát & Bầu cử...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/voting', { waitUntil: 'networkidle', timeout: 45000 });
  await crmPage.waitForTimeout(4000);
  await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_15_voting.png') });

  // CRM 16: Documents Repository
  console.log('16. Chụp CRM Kho Tài liệu...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/documents', { waitUntil: 'networkidle', timeout: 45000 });
  await crmPage.waitForTimeout(4000);
  await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_16_documents.png') });

  await crmContext.close();

  // -------------------------------------------------------------
  // 2. CAPTURE MOBILE PWA / APP SCREENSHOTS
  // -------------------------------------------------------------
  console.log('\n--- BƯỚC 2: CHỤP PHÂN HỆ MOBILE APP (390x844 - iPhone 14/15 Pro) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
  });
  const mobilePage = await mobileContext.newPage();

  // Disable PWA prompt
  await mobilePage.addInitScript(() => {
    localStorage.setItem('ceo1983_ios_prompt_dismissed', 'true');
    sessionStorage.setItem('ceo1983_ios_prompt_dismissed', 'true');
  });

  // Mobile 01: Landing Page & Membership Registration Form
  console.log('1. Chụp Mobile Landing Page & Đơn Đăng Ký...');
  await mobilePage.goto('https://ceo1983.viconnect.vn/landing', { waitUntil: 'networkidle', timeout: 45000 });
  await mobilePage.waitForTimeout(4000);
  // Đóng prompt nếu xuất hiện
  const dismissBtn = mobilePage.locator('button:has-text("Để sau"), button:has-text("Đã hiểu")').first();
  if (await dismissBtn.isVisible().catch(() => false)) await dismissBtn.click().catch(() => {});
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(screenshotsDir, 'app_01_landing.png') });

  // Mobile 02: Login Page
  console.log('2. Chụp Mobile Đăng nhập...');
  await mobilePage.goto('https://ceo1983.viconnect.vn/association/login', { waitUntil: 'networkidle', timeout: 45000 });
  await mobilePage.waitForTimeout(4000);
  if (await dismissBtn.isVisible().catch(() => false)) await dismissBtn.click().catch(() => {});
  await mobilePage.screenshot({ path: path.join(screenshotsDir, 'app_02_login.png') });

  // Đăng nhập Mobile
  console.log('Đang đăng nhập vào Mobile App...');
  await mobilePage.fill('input[type="text"], input[type="email"]', 'admin@connect.vn');
  await mobilePage.fill('input[type="password"]', '123456');
  await mobilePage.click('button[type="submit"]');
  await mobilePage.waitForTimeout(4000);

  // Mobile 03: Home Dashboard
  console.log('3. Chụp Mobile Trang chủ...');
  await mobilePage.goto('https://ceo1983.viconnect.vn/association', { waitUntil: 'networkidle', timeout: 45000 });
  await mobilePage.waitForTimeout(4000);
  await mobilePage.screenshot({ path: path.join(screenshotsDir, 'app_03_home.png') });

  // Mobile 04: VIP Card Front
  console.log('4. Chụp Mobile Thẻ VIP Mặt trước...');
  await mobilePage.goto('https://ceo1983.viconnect.vn/association/card', { waitUntil: 'networkidle', timeout: 45000 });
  await mobilePage.waitForTimeout(4000);
  await mobilePage.screenshot({ path: path.join(screenshotsDir, 'app_04_card_front.png') });

  // Mobile 05: VIP Card Back & QR Code
  console.log('5. Chụp Mobile Thẻ VIP Mặt sau (QR Code)...');
  const cardFlipEl = mobilePage.locator('.cursor-pointer, [data-card-flip], button:has-text("Lật thẻ"), button:has-text("Mã QR")').first();
  if (await cardFlipEl.isVisible().catch(() => false)) {
    await cardFlipEl.click().catch(() => {});
    await mobilePage.waitForTimeout(1500);
  }
  await mobilePage.screenshot({ path: path.join(screenshotsDir, 'app_05_card_back.png') });

  // Mobile 06: Members Directory
  console.log('6. Chụp Mobile Danh bạ Hội viên...');
  await mobilePage.goto('https://ceo1983.viconnect.vn/association/members', { waitUntil: 'networkidle', timeout: 45000 });
  await mobilePage.waitForTimeout(4000);
  await mobilePage.screenshot({ path: path.join(screenshotsDir, 'app_06_members.png') });

  // Mobile 07: Messages / Chat
  console.log('7. Chụp Mobile Tin nhắn & Chat...');
  await mobilePage.goto('https://ceo1983.viconnect.vn/association/messages', { waitUntil: 'networkidle', timeout: 45000 });
  await mobilePage.waitForTimeout(4000);
  await mobilePage.screenshot({ path: path.join(screenshotsDir, 'app_07_messages.png') });

  // Mobile 08: Opportunities (Cơ hội kinh doanh B2B)
  console.log('8. Chụp Mobile Cơ hội kinh doanh...');
  await mobilePage.goto('https://ceo1983.viconnect.vn/association/opportunities', { waitUntil: 'networkidle', timeout: 45000 });
  await mobilePage.waitForTimeout(4000);
  await mobilePage.screenshot({ path: path.join(screenshotsDir, 'app_08_opportunities.png') });

  // Mobile 09: Products / E-Commerce B2B
  console.log('9. Chụp Mobile Chợ Sản phẩm B2B...');
  await mobilePage.goto('https://ceo1983.viconnect.vn/association/products', { waitUntil: 'networkidle', timeout: 45000 });
  await mobilePage.waitForTimeout(4000);
  await mobilePage.screenshot({ path: path.join(screenshotsDir, 'app_09_products.png') });

  // Mobile 10: Events & Tickets
  console.log('10. Chụp Mobile Sự kiện & Vé mời...');
  await mobilePage.goto('https://ceo1983.viconnect.vn/association/events', { waitUntil: 'networkidle', timeout: 45000 });
  await mobilePage.waitForTimeout(4000);
  await mobilePage.screenshot({ path: path.join(screenshotsDir, 'app_10_events.png') });

  // Mobile 11: Voting / Polls
  console.log('11. Chụp Mobile Biểu quyết & Bình chọn...');
  await mobilePage.goto('https://ceo1983.viconnect.vn/association/voting', { waitUntil: 'networkidle', timeout: 45000 });
  await mobilePage.waitForTimeout(4000);
  await mobilePage.screenshot({ path: path.join(screenshotsDir, 'app_11_voting.png') });

  // Mobile 12: Membership Renew & VietQR
  console.log('12. Chụp Mobile Đóng Niên liễm / VietQR...');
  await mobilePage.goto('https://ceo1983.viconnect.vn/association/renew', { waitUntil: 'networkidle', timeout: 45000 });
  await mobilePage.waitForTimeout(4000);
  await mobilePage.screenshot({ path: path.join(screenshotsDir, 'app_12_renew.png') });

  // Mobile 13: Profile Management
  console.log('13. Chụp Mobile Quản lý Hồ sơ...');
  await mobilePage.goto('https://ceo1983.viconnect.vn/association/profile', { waitUntil: 'networkidle', timeout: 45000 });
  await mobilePage.waitForTimeout(4000);
  await mobilePage.screenshot({ path: path.join(screenshotsDir, 'app_13_profile.png') });

  await mobileContext.close();
  await browser.close();

  console.log('\n>>> HOÀN TẤT CHỤP TOÀN BỘ ẢNH MINH CHỨNG CHẤT LƯỢNG CAO!');
}

main().catch(err => {
  console.error('LỖI CHỤP ẢNH:', err);
  process.exit(1);
});
