const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, '../document/images/evidence');
const BASE_URL = 'http://127.0.0.1:5173';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function captureAllLocalhostEvidence() {
  ensureDir(OUT_DIR);
  console.log('================================================================');
  console.log('🚀 CAPTURING FULL EVIDENCE SCREENSHOTS ON LOCALHOST (127.0.0.1:5173)');
  console.log('   Target Directory:', OUT_DIR);
  console.log('================================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  // Desktop context
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await desktopCtx.newPage();
  page.on('dialog', async d => {
    console.log('Dialog:', d.message());
    await d.accept();
  });

  // Mobile context
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
    isMobile: true,
    hasTouch: true,
  });
  const mPage = await mobileCtx.newPage();
  mPage.on('dialog', async d => {
    console.log('Mobile Dialog:', d.message());
    await d.accept();
  });

  try {
    // ----------------------------------------------------
    // 1. LANDING & PUBLIC REGISTRATION (vupv090120@gmail.com)
    // ----------------------------------------------------
    console.log('▶ [1/4] Public Portal & Member Registration Flow...');
    await page.goto(`${BASE_URL}/landing/ceo1983`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, '01_landing_hero.png') });
    console.log('   ✔ 01_landing_hero.png');

    await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1500);

    const nameInput = page.locator('input[placeholder*="Họ và tên"], input[name="name"], input[placeholder*="Nguyễn Văn"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill('Phạm Văn Vũ');
      await page.locator('input[type="tel"], input[placeholder*="Số điện thoại"]').first().fill('0901201983');
      await page.locator('input[type="email"], input[placeholder*="email"], input[placeholder*="Email"]').first().fill('vupv090120@gmail.com');
      const compInput = page.locator('input[placeholder*="Công ty"], input[name="company"]').first();
      if (await compInput.count() > 0) await compInput.fill('Công ty Cổ phần Công nghệ VIO CONNECT');
      const taxInput = page.locator('input[placeholder*="Mã số thuế"], input[placeholder*="MST"]').first();
      if (await taxInput.count() > 0) await taxInput.fill('0109831983');
      const titleInput = page.locator('input[placeholder*="Chức vụ"]').first();
      if (await titleInput.count() > 0) await titleInput.fill('Tổng Giám đốc (CEO)');
    }
    await page.screenshot({ path: path.join(OUT_DIR, 'live_02_member_registration_form_filled.png') });
    console.log('   ✔ live_02_member_registration_form_filled.png (Phạm Văn Vũ - vupv090120@gmail.com)');

    // ----------------------------------------------------
    // 2. CRM PORTAL - ADMIN & 6 BAN COMMITTEES
    // ----------------------------------------------------
    console.log('\n▶ [2/4] CRM Management Portal & Ban Thành Viên Approval...');
    await page.goto(`${BASE_URL}/auth`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT_DIR, '03_crm_login_page.png') });

    // Login as Ban Thành Viên to approve
    await page.locator('input[type="email"], input[type="text"]').first().fill('ceo.thanhvien@ceo1983.com');
    await page.locator('input[type="password"]').first().fill('123456');
    await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await page.waitForTimeout(3000);

    // Dashboard Overview
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm_02_dashboard_kpi.png') });
    console.log('   ✔ crm_02_dashboard_kpi.png');

    // Members Management
    await page.goto(`${BASE_URL}/members`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm_03_members_list.png') });
    console.log('   ✔ crm_03_members_list.png');

    // Member detail drawer
    const firstRow = page.locator('table tbody tr, div[class*="member-card"]').first();
    if (await firstRow.count() > 0) {
      await firstRow.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(OUT_DIR, 'crm_04_member_detail_drawer.png') });
      console.log('   ✔ crm_04_member_detail_drawer.png');
    }

    // Companies Management
    await page.goto(`${BASE_URL}/companies`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm_09_companies_management.png') });
    console.log('   ✔ crm_09_companies_management.png');

    // Events Management & Seating Map
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm_05_events_list.png') });
    console.log('   ✔ crm_05_events_list.png');

    // Event Registrations
    await page.goto(`${BASE_URL}/event-registrations`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'live_22_crm_event_registrations_paid_confirm.png') });
    console.log('   ✔ live_22_crm_event_registrations_paid_confirm.png');

    // Gate Check-in
    await page.goto(`${BASE_URL}/checkin`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm_checkin_management.png') });
    console.log('   ✔ crm_checkin_management.png');

    // Meetings
    await page.goto(`${BASE_URL}/meetings`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm1983_09_meetings_calendar.png') });
    console.log('   ✔ crm1983_09_meetings_calendar.png');

    // Voting & Lucky Draw
    await page.goto(`${BASE_URL}/voting`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm_12_voting_luckydraw.png') });
    console.log('   ✔ crm_12_voting_luckydraw.png');

    // Fees Management & VietQR
    await page.goto(`${BASE_URL}/fees`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm_08_fees_management.png') });
    console.log('   ✔ crm_08_fees_management.png');

    // Income & Expenses
    await page.goto(`${BASE_URL}/income`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm1983_12_income_management.png') });
    console.log('   ✔ crm1983_12_income_management.png');

    await page.goto(`${BASE_URL}/expenses`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm1983_13_expenses_management.png') });
    console.log('   ✔ crm1983_13_expenses_management.png');

    // Finance Report
    await page.goto(`${BASE_URL}/finance-report`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm1983_14_finance_report.png') });
    console.log('   ✔ crm1983_14_finance_report.png');

    // Sponsors
    await page.goto(`${BASE_URL}/sponsors`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm1983_15_sponsors_management.png') });
    console.log('   ✔ crm1983_15_sponsors_management.png');

    // Tasks Management
    await page.goto(`${BASE_URL}/tasks`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm_tasks_management.png') });
    console.log('   ✔ crm_tasks_management.png');

    // Marketplace Moderation
    await page.goto(`${BASE_URL}/marketplace`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm_10_marketplace_sync.png') });
    console.log('   ✔ crm_10_marketplace_sync.png');

    // Opportunities Sync
    await page.goto(`${BASE_URL}/opportunities`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm_11_opportunities_sync.png') });
    console.log('   ✔ crm_11_opportunities_sync.png');

    // News
    await page.goto(`${BASE_URL}/news`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm_13_news_management.png') });
    console.log('   ✔ crm_13_news_management.png');

    // Email Marketing
    await page.goto(`${BASE_URL}/email-marketing`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm1983_19_email_marketing.png') });
    console.log('   ✔ crm1983_19_email_marketing.png');

    // Permissions RBAC
    await page.goto(`${BASE_URL}/permissions`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm_roles_permissions.png') });
    console.log('   ✔ crm_roles_permissions.png');

    // Demo Leads
    await page.goto(`${BASE_URL}/admin/demo-leads`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'bqt_screen.png') });
    console.log('   ✔ bqt_screen.png');

    // Themes
    await page.goto(`${BASE_URL}/admin/landing-templates`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm_theme_management.png') });
    console.log('   ✔ crm_theme_management.png');

    // Documents
    await page.goto(`${BASE_URL}/documents`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'crm_documents_library.png') });
    console.log('   ✔ crm_documents_library.png');

    // ----------------------------------------------------
    // 3. MEMBER APP - AUTH & MODULES (vupv090120@gmail.com)
    // ----------------------------------------------------
    console.log('\n▶ [3/4] Member Application Desktop & Mobile Flows (vupv090120@gmail.com)...');
    
    // Member Login on Desktop with fresh context
    const memberCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
    });
    const memberPage = await memberCtx.newPage();
    await memberPage.goto(`${BASE_URL}/auth`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await memberPage.waitForTimeout(1500);
    await memberPage.locator('input[type="email"], input[type="text"]').first().fill('vupv090120@gmail.com');
    await memberPage.locator('input[type="password"]').first().fill('123456');
    await memberPage.screenshot({ path: path.join(OUT_DIR, 'live_11_app_login_filled_vu.png') });
    console.log('   ✔ live_11_app_login_filled_vu.png');
    await memberPage.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await memberPage.waitForTimeout(3000);

    // Member Home Dashboard
    await memberPage.goto(`${BASE_URL}/association`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await memberPage.waitForTimeout(2500);
    await memberPage.screenshot({ path: path.join(OUT_DIR, 'app_02_home_dashboard.png') });
    console.log('   ✔ app_02_home_dashboard.png');

    // VIP 3D Card
    await memberPage.goto(`${BASE_URL}/association/card`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await memberPage.waitForTimeout(2500);
    await memberPage.screenshot({ path: path.join(OUT_DIR, 'app_identity_card_vip.png') });
    console.log('   ✔ app_identity_card_vip.png');

    // Members Directory
    await memberPage.goto(`${BASE_URL}/association/members`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await memberPage.waitForTimeout(2500);
    await memberPage.screenshot({ path: path.join(OUT_DIR, 'app_step_07_members_directory.png') });
    console.log('   ✔ app_step_07_members_directory.png');

    // Member Profile
    await memberPage.goto(`${BASE_URL}/association/profile`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await memberPage.waitForTimeout(2500);
    await memberPage.screenshot({ path: path.join(OUT_DIR, 'live_30_app_member_profile_edit.png') });
    console.log('   ✔ live_30_app_member_profile_edit.png');

    // Events Screen
    await memberPage.goto(`${BASE_URL}/association/events`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await memberPage.waitForTimeout(2500);
    await memberPage.screenshot({ path: path.join(OUT_DIR, 'app_step_11_events_list.png') });
    console.log('   ✔ app_step_11_events_list.png');

    // Check-in Scanner
    await memberPage.goto(`${BASE_URL}/association/checkin`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await memberPage.waitForTimeout(2000);
    await memberPage.screenshot({ path: path.join(OUT_DIR, 'sub_31b_app_checkin_screen.png') });
    console.log('   ✔ sub_31b_app_checkin_screen.png');

    // B2B Marketplace Products
    await memberPage.goto(`${BASE_URL}/association/products`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await memberPage.waitForTimeout(2500);
    await memberPage.screenshot({ path: path.join(OUT_DIR, 'app_step_15_marketplace_grid.png') });
    console.log('   ✔ app_step_15_marketplace_grid.png');

    // Opportunities Feed
    await memberPage.goto(`${BASE_URL}/association/opportunities`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await memberPage.waitForTimeout(2500);
    await memberPage.screenshot({ path: path.join(OUT_DIR, 'app_step_18_opportunities_feed.png') });
    console.log('   ✔ app_step_18_opportunities_feed.png');

    // Messages Inbox
    await memberPage.goto(`${BASE_URL}/association/messages`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await memberPage.waitForTimeout(2500);
    await memberPage.screenshot({ path: path.join(OUT_DIR, 'app_step_09_messages_inbox.png') });
    console.log('   ✔ app_step_09_messages_inbox.png');

    // Voting
    await memberPage.goto(`${BASE_URL}/association/voting`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await memberPage.waitForTimeout(2500);
    await memberPage.screenshot({ path: path.join(OUT_DIR, 'app_step_14_voting_luckydraw.png') });
    console.log('   ✔ app_step_14_voting_luckydraw.png');

    // News
    await memberPage.goto(`${BASE_URL}/association/news`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await memberPage.waitForTimeout(2500);
    await memberPage.screenshot({ path: path.join(OUT_DIR, 'app_step_22_news_screen.png') });
    console.log('   ✔ app_step_22_news_screen.png');

    // Annual Fee Renew
    await memberPage.goto(`${BASE_URL}/association/renew`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await memberPage.waitForTimeout(2500);
    await memberPage.screenshot({ path: path.join(OUT_DIR, 'app_step_20_annual_fee_renewal.png') });
    console.log('   ✔ app_step_20_annual_fee_renewal.png');

    // Notifications
    await memberPage.goto(`${BASE_URL}/association/notifications`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await memberPage.waitForTimeout(2500);
    await memberPage.screenshot({ path: path.join(OUT_DIR, 'app_step_21_notifications_screen.png') });
    console.log('   ✔ app_step_21_notifications_screen.png');

    // Settings
    await memberPage.goto(`${BASE_URL}/association/settings`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await memberPage.waitForTimeout(2000);
    await memberPage.screenshot({ path: path.join(OUT_DIR, 'sub_47_app_settings_password_security.png') });
    console.log('   ✔ sub_47_app_settings_password_security.png');

    // ----------------------------------------------------
    // 4. MOBILE VIEWS (mPage 390x844)
    // ----------------------------------------------------
    console.log('\n▶ [4/4] Mobile App Views (390x844 iPhone Viewport)...');
    
    // Login on Mobile
    await mPage.goto(`${BASE_URL}/auth`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await mPage.waitForTimeout(1000);
    await mPage.locator('input[type="email"], input[type="text"]').first().fill('vupv090120@gmail.com');
    await mPage.locator('input[type="password"]').first().fill('123456');
    await mPage.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await mPage.waitForTimeout(3000);

    // Mobile Home
    await mPage.goto(`${BASE_URL}/m`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await mPage.waitForTimeout(2500);
    await mPage.screenshot({ path: path.join(OUT_DIR, 'app1983_02_home_feed.png') });
    console.log('   ✔ app1983_02_home_feed.png');

    // Mobile Card
    await mPage.goto(`${BASE_URL}/m/card`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await mPage.waitForTimeout(2500);
    await mPage.screenshot({ path: path.join(OUT_DIR, 'app1983_05_vip_card_3d.png') });
    console.log('   ✔ app1983_05_vip_card_3d.png');

    // Mobile Members
    await mPage.goto(`${BASE_URL}/m/members`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await mPage.waitForTimeout(2000);
    await mPage.screenshot({ path: path.join(OUT_DIR, 'app1983_03_members_directory.png') });
    console.log('   ✔ app1983_03_members_directory.png');

    // Mobile Events
    await mPage.goto(`${BASE_URL}/m/events`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await mPage.waitForTimeout(2000);
    await mPage.screenshot({ path: path.join(OUT_DIR, 'app1983_07_events_list.png') });
    console.log('   ✔ app1983_07_events_list.png');

    // Mobile Products
    await mPage.goto(`${BASE_URL}/m/products`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await mPage.waitForTimeout(2000);
    await mPage.screenshot({ path: path.join(OUT_DIR, 'app1983_10_marketplace_shopee.png') });
    console.log('   ✔ app1983_10_marketplace_shopee.png');

    // Mobile Opportunities
    await mPage.goto(`${BASE_URL}/m/opportunities`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await mPage.waitForTimeout(2000);
    await mPage.screenshot({ path: path.join(OUT_DIR, 'live_29_app_opportunities_feed_1on1.png') });
    console.log('   ✔ live_29_app_opportunities_feed_1on1.png');

    // Mobile Messages
    await mPage.goto(`${BASE_URL}/m/messages`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await mPage.waitForTimeout(2000);
    await mPage.screenshot({ path: path.join(OUT_DIR, 'app1983_15_messages_secretary.png') });
    console.log('   ✔ app1983_15_messages_secretary.png');

    // Mobile Profile
    await mPage.goto(`${BASE_URL}/m/profile`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await mPage.waitForTimeout(2000);
    await mPage.screenshot({ path: path.join(OUT_DIR, 'app1983_16_profile_settings.png') });
    console.log('   ✔ app1983_16_profile_settings.png');

    console.log('\n================================================================');
    console.log('🎉 ALL EXHAUSTIVE SCREENSHOTS CAPTURED AND SAVED SUCCESSFULLY!');
    console.log('================================================================');

  } catch (err) {
    console.error('❌ Error during capture:', err);
  } finally {
    await browser.close();
  }
}

captureAllLocalhostEvidence().catch(console.error);
