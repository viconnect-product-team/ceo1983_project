const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const DIRS = [
  path.resolve(__dirname, '../document/images/evidence'),
  path.resolve(__dirname, '../../vione_project/document/images/evidence'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs/images/evidence'),
  path.resolve(__dirname, '../../vione_project/apps/vione_app_fe/public/docs/images/evidence'),
];

DIRS.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

function saveImage(filename, buffer) {
  for (const dir of DIRS) {
    fs.writeFileSync(path.join(dir, filename), buffer);
  }
  console.log(`  ✓ Saved [${filename}] (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function captureAll() {
  console.log('=== BẮT ĐẦU CHỤP ẢNH TOÀN DIỆN CẢ 4 HỆ THỐNG TRÊN SERVER DEV ===\n');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
    isMobile: true,
    hasTouch: true,
  });

  // =========================================================================
  // HỆ THỐNG 1: QUẢN TRỊ HIỆP HỘI CEO 1983 (https://14.225.217.232:5443)
  // =========================================================================
  console.log('>>> [1/4] Chụp ảnh Hệ thống Quản trị Hiệp hội CEO 1983 (Port 5443)...');
  const crm1983 = await desktopContext.newPage();

  try {
    // 1. Login
    await crm1983.goto('https://14.225.217.232:5443/auth', { waitUntil: 'networkidle', timeout: 15000 });
    await crm1983.waitForTimeout(1000);
    saveImage('crm1983_01_login.png', await crm1983.screenshot());

    // Submit Login
    await crm1983.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
    await crm1983.locator('input[type="password"]').first().fill('123456');
    await crm1983.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await crm1983.waitForTimeout(3000);

    // 2. Dashboard
    await crm1983.goto('https://14.225.217.232:5443/', { waitUntil: 'networkidle', timeout: 15000 });
    await crm1983.waitForTimeout(1500);
    saveImage('crm1983_02_dashboard_overview.png', await crm1983.screenshot());

    // 3. Members
    await crm1983.goto('https://14.225.217.232:5443/members', { waitUntil: 'networkidle', timeout: 15000 });
    await crm1983.waitForTimeout(1500);
    saveImage('crm1983_03_members_management.png', await crm1983.screenshot());

    // 4. Member Drawer
    const viewMemberBtn = crm1983.locator('button:has-text("Xem"), button:has-text("Chi tiết")').first();
    if (await viewMemberBtn.count() > 0) {
      await viewMemberBtn.click();
      await crm1983.waitForTimeout(1200);
      saveImage('crm1983_04_member_detail_drawer.png', await crm1983.screenshot());
      // Close drawer if button exists
      const closeBtn = crm1983.locator('button:has-text("Đóng"), button[aria-label="Close"]').first();
      if (await closeBtn.count() > 0) await closeBtn.click().catch(() => {});
    }

    // 5. Companies
    await crm1983.goto('https://14.225.217.232:5443/companies', { waitUntil: 'networkidle', timeout: 15000 });
    await crm1983.waitForTimeout(1500);
    saveImage('crm1983_05_companies_management.png', await crm1983.screenshot());

    // 6. Events
    await crm1983.goto('https://14.225.217.232:5443/events', { waitUntil: 'networkidle', timeout: 15000 });
    await crm1983.waitForTimeout(1500);
    saveImage('crm1983_06_events_list.png', await crm1983.screenshot());

    // 7. Event Create Modal
    const createEventBtn = crm1983.locator('button:has-text("Tạo sự kiện"), button:has-text("Thêm sự kiện")').first();
    if (await createEventBtn.count() > 0) {
      await createEventBtn.click();
      await crm1983.waitForTimeout(1200);
      saveImage('crm1983_07_event_create_modal.png', await crm1983.screenshot());
      const cancelBtn = crm1983.locator('button:has-text("Hủy"), button[aria-label="Close"]').first();
      if (await cancelBtn.count() > 0) await cancelBtn.click().catch(() => {});
    }

    // 8. Event Checkin QR
    await crm1983.goto('https://14.225.217.232:5443/checkin-qr', { waitUntil: 'networkidle', timeout: 15000 });
    await crm1983.waitForTimeout(1500);
    saveImage('crm1983_08_event_checkin_qr.png', await crm1983.screenshot());

    // 9. Meetings
    await crm1983.goto('https://14.225.217.232:5443/meetings', { waitUntil: 'networkidle', timeout: 15000 });
    await crm1983.waitForTimeout(1500);
    saveImage('crm1983_09_meetings_calendar.png', await crm1983.screenshot());

    // 10. Voting
    await crm1983.goto('https://14.225.217.232:5443/voting', { waitUntil: 'networkidle', timeout: 15000 });
    await crm1983.waitForTimeout(1500);
    saveImage('crm1983_10_voting_management.png', await crm1983.screenshot());

    // 11. Fees
    await crm1983.goto('https://14.225.217.232:5443/fees', { waitUntil: 'networkidle', timeout: 15000 });
    await crm1983.waitForTimeout(1500);
    saveImage('crm1983_11_fees_management.png', await crm1983.screenshot());

    // 12. Income
    await crm1983.goto('https://14.225.217.232:5443/income', { waitUntil: 'networkidle', timeout: 15000 });
    await crm1983.waitForTimeout(1500);
    saveImage('crm1983_12_income_management.png', await crm1983.screenshot());

    // 13. Expenses
    await crm1983.goto('https://14.225.217.232:5443/expenses', { waitUntil: 'networkidle', timeout: 15000 });
    await crm1983.waitForTimeout(1500);
    saveImage('crm1983_13_expenses_management.png', await crm1983.screenshot());

    // 14. Finance Report
    await crm1983.goto('https://14.225.217.232:5443/finance-report', { waitUntil: 'networkidle', timeout: 15000 });
    await crm1983.waitForTimeout(1500);
    saveImage('crm1983_14_finance_report.png', await crm1983.screenshot());

    // 15. Sponsors
    await crm1983.goto('https://14.225.217.232:5443/sponsors', { waitUntil: 'networkidle', timeout: 15000 });
    await crm1983.waitForTimeout(1500);
    saveImage('crm1983_15_sponsors_management.png', await crm1983.screenshot());

    // 16. Benefits & Perks
    await crm1983.goto('https://14.225.217.232:5443/benefits', { waitUntil: 'networkidle', timeout: 15000 });
    await crm1983.waitForTimeout(1500);
    saveImage('crm1983_16_benefits_perks.png', await crm1983.screenshot());

    // 17. Marketplace
    await crm1983.goto('https://14.225.217.232:5443/marketplace', { waitUntil: 'networkidle', timeout: 15000 });
    await crm1983.waitForTimeout(1500);
    saveImage('crm1983_17_marketplace_b2b.png', await crm1983.screenshot());

    // 18. News
    await crm1983.goto('https://14.225.217.232:5443/news', { waitUntil: 'networkidle', timeout: 15000 });
    await crm1983.waitForTimeout(1500);
    saveImage('crm1983_18_news_announcements.png', await crm1983.screenshot());

    // 19. Email Marketing
    await crm1983.goto('https://14.225.217.232:5443/email-marketing', { waitUntil: 'networkidle', timeout: 15000 });
    await crm1983.waitForTimeout(1500);
    saveImage('crm1983_19_email_marketing.png', await crm1983.screenshot());

    // 20. Permissions Matrix
    await crm1983.goto('https://14.225.217.232:5443/permissions', { waitUntil: 'networkidle', timeout: 15000 });
    await crm1983.waitForTimeout(1500);
    saveImage('crm1983_20_rbac_permissions.png', await crm1983.screenshot());

  } catch (err) {
    console.error('Lỗi khi chụp CRM CEO 1983:', err);
  } finally {
    await crm1983.close();
  }

  // =========================================================================
  // HỆ THỐNG 2: APP HIỆP HỘI CEO 1983 (https://14.225.217.232:5444)
  // =========================================================================
  console.log('\n>>> [2/4] Chụp ảnh App Hiệp hội CEO 1983 (Port 5444)...');
  const app1983 = await mobileContext.newPage();

  try {
    // 1. Login
    await app1983.goto('https://14.225.217.232:5444/association/login', { waitUntil: 'networkidle', timeout: 15000 });
    await app1983.waitForTimeout(1000);
    saveImage('app1983_01_login.png', await app1983.screenshot());

    // Submit Login
    await app1983.fill('#assoc-auth-id', 'admin@connect.vn');
    await app1983.fill('#assoc-auth-password', '123456');
    await app1983.click('button[type="submit"]');
    await app1983.waitForTimeout(3000);

    // 2. Home
    await app1983.goto('https://14.225.217.232:5444/association', { waitUntil: 'networkidle', timeout: 15000 });
    await app1983.waitForTimeout(2000);
    saveImage('app1983_02_home_feed.png', await app1983.screenshot());

    // 3. Members Directory
    await app1983.goto('https://14.225.217.232:5444/association/members', { waitUntil: 'networkidle', timeout: 15000 });
    await app1983.waitForTimeout(1500);
    saveImage('app1983_03_members_directory.png', await app1983.screenshot());

    // 4. Member Profile Modal
    const memberCard = app1983.locator('div[class*="cursor-pointer"], button[class*="cursor-pointer"]').nth(3);
    if (await memberCard.count() > 0) {
      await memberCard.click();
      await app1983.waitForTimeout(1200);
      saveImage('app1983_04_member_profile_modal.png', await app1983.screenshot());
      // Close modal
      const closeBtn = app1983.locator('button[aria-label="Close"], button:has-text("✕")').first();
      if (await closeBtn.count() > 0) await closeBtn.click().catch(() => {});
    }

    // 5. VIP Card 3D
    await app1983.goto('https://14.225.217.232:5444/association/card', { waitUntil: 'networkidle', timeout: 15000 });
    await app1983.waitForTimeout(2000);
    saveImage('app1983_05_vip_card_3d.png', await app1983.screenshot());

    // 6. Digital Visit Card
    await app1983.goto('https://14.225.217.232:5444/association/business-cards', { waitUntil: 'networkidle', timeout: 15000 });
    await app1983.waitForTimeout(2000);
    saveImage('app1983_06_digital_visit_card.png', await app1983.screenshot());

    // 7. Events
    await app1983.goto('https://14.225.217.232:5444/association/events', { waitUntil: 'networkidle', timeout: 15000 });
    await app1983.waitForTimeout(1500);
    saveImage('app1983_07_events_list.png', await app1983.screenshot());

    // 8. Event Checkin Ticket QR
    await app1983.goto('https://14.225.217.232:5444/association/checkin', { waitUntil: 'networkidle', timeout: 15000 });
    await app1983.waitForTimeout(1500);
    saveImage('app1983_08_event_ticket_qr.png', await app1983.screenshot());

    // 9. Fees VietQR
    await app1983.goto('https://14.225.217.232:5444/association/renew', { waitUntil: 'networkidle', timeout: 15000 });
    await app1983.waitForTimeout(1500);
    saveImage('app1983_09_fees_vietqr.png', await app1983.screenshot());

    // 10. Marketplace Shopee Style
    await app1983.goto('https://14.225.217.232:5444/association/products', { waitUntil: 'networkidle', timeout: 15000 });
    await app1983.waitForTimeout(1500);
    saveImage('app1983_10_marketplace_shopee.png', await app1983.screenshot());

    // 11. Perks
    await app1983.goto('https://14.225.217.232:5444/association/perks', { waitUntil: 'networkidle', timeout: 15000 });
    await app1983.waitForTimeout(1500);
    saveImage('app1983_11_perks_benefits.png', await app1983.screenshot());

    // 12. News
    await app1983.goto('https://14.225.217.232:5444/association/news', { waitUntil: 'networkidle', timeout: 15000 });
    await app1983.waitForTimeout(1500);
    saveImage('app1983_12_news_feed.png', await app1983.screenshot());

    // 13. Voting
    await app1983.goto('https://14.225.217.232:5444/association/voting', { waitUntil: 'networkidle', timeout: 15000 });
    await app1983.waitForTimeout(1500);
    saveImage('app1983_13_voting_online.png', await app1983.screenshot());

    // 14. Meetings
    await app1983.goto('https://14.225.217.232:5444/association/meetings', { waitUntil: 'networkidle', timeout: 15000 });
    await app1983.waitForTimeout(1500);
    saveImage('app1983_14_meetings_schedule.png', await app1983.screenshot());

    // 15. Messages
    await app1983.goto('https://14.225.217.232:5444/association/messages', { waitUntil: 'networkidle', timeout: 15000 });
    await app1983.waitForTimeout(1500);
    saveImage('app1983_15_messages_secretary.png', await app1983.screenshot());

    // 16. Profile
    await app1983.goto('https://14.225.217.232:5444/association/profile', { waitUntil: 'networkidle', timeout: 15000 });
    await app1983.waitForTimeout(1500);
    saveImage('app1983_16_profile_settings.png', await app1983.screenshot());

  } catch (err) {
    console.error('Lỗi khi chụp App CEO 1983:', err);
  } finally {
    await app1983.close();
  }

  // =========================================================================
  // HỆ THỐNG 3: QUẢN TRỊ VIONE (WEB CRM VIONE ENTERPRISE) (https://14.225.217.232:5445)
  // =========================================================================
  console.log('\n>>> [3/4] Chụp ảnh Hệ thống Quản trị ViOne Enterprise (Port 5445 Desktop)...');
  const crmViOne = await desktopContext.newPage();

  try {
    // 1. CRM Login
    await crmViOne.goto('https://14.225.217.232:5445/auth', { waitUntil: 'networkidle', timeout: 15000 });
    await crmViOne.waitForTimeout(1000);
    saveImage('crm_vione_01_login.png', await crmViOne.screenshot());

    // Submit CRM Login
    await crmViOne.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
    await crmViOne.locator('input[type="password"]').first().fill('123456');
    await crmViOne.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await crmViOne.waitForTimeout(3000);

    // 2. Dashboard
    await crmViOne.goto('https://14.225.217.232:5445/', { waitUntil: 'networkidle', timeout: 15000 });
    await crmViOne.waitForTimeout(1500);
    saveImage('crm_vione_02_dashboard.png', await crmViOne.screenshot());

    // 3. Members / Partners
    await crmViOne.goto('https://14.225.217.232:5445/members', { waitUntil: 'networkidle', timeout: 15000 });
    await crmViOne.waitForTimeout(1500);
    saveImage('crm_vione_03_members_partners.png', await crmViOne.screenshot());

    // 4. Companies
    await crmViOne.goto('https://14.225.217.232:5445/companies', { waitUntil: 'networkidle', timeout: 15000 });
    await crmViOne.waitForTimeout(1500);
    saveImage('crm_vione_04_companies.png', await crmViOne.screenshot());

    // 5. Opportunities / Sales Leads
    await crmViOne.goto('https://14.225.217.232:5445/opportunities', { waitUntil: 'networkidle', timeout: 15000 });
    await crmViOne.waitForTimeout(1500);
    saveImage('crm_vione_05_opportunities_pipeline.png', await crmViOne.screenshot());

    // 6. Marketplace
    await crmViOne.goto('https://14.225.217.232:5445/marketplace', { waitUntil: 'networkidle', timeout: 15000 });
    await crmViOne.waitForTimeout(1500);
    saveImage('crm_vione_06_marketplace_catalog.png', await crmViOne.screenshot());

    // 7. Finance Income
    await crmViOne.goto('https://14.225.217.232:5445/income', { waitUntil: 'networkidle', timeout: 15000 });
    await crmViOne.waitForTimeout(1500);
    saveImage('crm_vione_07_finance_income.png', await crmViOne.screenshot());

    // 8. Finance Expenses
    await crmViOne.goto('https://14.225.217.232:5445/expenses', { waitUntil: 'networkidle', timeout: 15000 });
    await crmViOne.waitForTimeout(1500);
    saveImage('crm_vione_08_finance_expenses.png', await crmViOne.screenshot());

    // 9. Finance Report
    await crmViOne.goto('https://14.225.217.232:5445/finance-report', { waitUntil: 'networkidle', timeout: 15000 });
    await crmViOne.waitForTimeout(1500);
    saveImage('crm_vione_09_finance_report.png', await crmViOne.screenshot());

    // 10. Documents
    await crmViOne.goto('https://14.225.217.232:5445/documents', { waitUntil: 'networkidle', timeout: 15000 });
    await crmViOne.waitForTimeout(1500);
    saveImage('crm_vione_10_documents_contracts.png', await crmViOne.screenshot());

    // 11. Meetings
    await crmViOne.goto('https://14.225.217.232:5445/meetings', { waitUntil: 'networkidle', timeout: 15000 });
    await crmViOne.waitForTimeout(1500);
    saveImage('crm_vione_11_meetings_calendar.png', await crmViOne.screenshot());

    // 12. Digital Cards Admin
    await crmViOne.goto('https://14.225.217.232:5445/business-cards', { waitUntil: 'networkidle', timeout: 15000 });
    await crmViOne.waitForTimeout(1500);
    saveImage('crm_vione_12_business_cards_admin.png', await crmViOne.screenshot());

    // 13. Settings & Permissions
    await crmViOne.goto('https://14.225.217.232:5445/account-settings', { waitUntil: 'networkidle', timeout: 15000 });
    await crmViOne.waitForTimeout(1500);
    saveImage('crm_vione_13_account_settings.png', await crmViOne.screenshot());

  } catch (err) {
    console.error('Lỗi khi chụp Web CRM ViOne:', err);
  } finally {
    await crmViOne.close();
  }

  // =========================================================================
  // HỆ THỐNG 4: APP VIONE (VIONE CONNECT) (https://14.225.217.232:5445/connect-app)
  // =========================================================================
  console.log('\n>>> [4/4] Chụp ảnh App ViOne Connect (Port 5445 Mobile)...');
  const appViOne = await mobileContext.newPage();

  try {
    // 1. Login
    await appViOne.goto('https://14.225.217.232:5445/vione/login', { waitUntil: 'networkidle', timeout: 15000 });
    await appViOne.waitForTimeout(1000);
    saveImage('app_vione_01_login.png', await appViOne.screenshot());

    // Submit Login
    await appViOne.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
    await appViOne.locator('input[type="password"]').first().fill('123456');
    await appViOne.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await appViOne.waitForTimeout(3000);

    // 2. Home Executive Today
    await appViOne.goto('https://14.225.217.232:5445/connect-app', { waitUntil: 'networkidle', timeout: 15000 });
    await appViOne.waitForTimeout(2000);
    saveImage('app_vione_02_home_agenda.png', await appViOne.screenshot());

    // 3. Quick Action "V" / Tap to connect
    const vButton = appViOne.locator('button:has-text("V"), button[aria-label*="connect"], button[class*="rounded-full"]').nth(2);
    if (await vButton.count() > 0) {
      await vButton.click().catch(() => {});
      await appViOne.waitForTimeout(1000);
      saveImage('app_vione_03_quick_action_v.png', await appViOne.screenshot());
      // Dismiss sheet
      await appViOne.mouse.click(50, 50);
    } else {
      saveImage('app_vione_03_quick_action_v.png', await appViOne.screenshot());
    }

    // 4. Network Directory
    await appViOne.goto('https://14.225.217.232:5445/connect-app/network', { waitUntil: 'networkidle', timeout: 15000 });
    await appViOne.waitForTimeout(1500);
    saveImage('app_vione_04_network_directory.png', await appViOne.screenshot());

    // 5. Moments Feed
    await appViOne.goto('https://14.225.217.232:5445/connect-app/moment', { waitUntil: 'networkidle', timeout: 15000 });
    await appViOne.waitForTimeout(1500);
    saveImage('app_vione_05_moments_feed.png', await appViOne.screenshot());

    // 6. Chat Inbox
    await appViOne.goto('https://14.225.217.232:5445/connect-app/inbox', { waitUntil: 'networkidle', timeout: 15000 });
    await appViOne.waitForTimeout(1500);
    saveImage('app_vione_06_chat_inbox.png', await appViOne.screenshot());

    // 7. Community & Opportunities
    await appViOne.goto('https://14.225.217.232:5445/connect-app/community', { waitUntil: 'networkidle', timeout: 15000 });
    await appViOne.waitForTimeout(1500);
    saveImage('app_vione_07_community_opportunities.png', await appViOne.screenshot());

    // 8. Me / Titanium Digital Card Center
    await appViOne.goto('https://14.225.217.232:5445/connect-app/me', { waitUntil: 'networkidle', timeout: 15000 });
    await appViOne.waitForTimeout(1500);
    saveImage('app_vione_08_digital_card_me.png', await appViOne.screenshot());

    // 9. NFC Activation
    await appViOne.goto('https://14.225.217.232:5445/connect-app/activate', { waitUntil: 'networkidle', timeout: 15000 });
    await appViOne.waitForTimeout(1500);
    saveImage('app_vione_09_nfc_activation.png', await appViOne.screenshot());

    // 10. Security & Sessions
    await appViOne.goto('https://14.225.217.232:5445/connect-app/me/security', { waitUntil: 'networkidle', timeout: 15000 });
    await appViOne.waitForTimeout(1500);
    saveImage('app_vione_10_security_settings.png', await appViOne.screenshot());

  } catch (err) {
    console.error('Lỗi khi chụp App ViOne:', err);
  } finally {
    await appViOne.close();
  }

  await browser.close();
  console.log('\n=== HOÀN TẤT CHỤP ẢNH MÀN HÌNH TOÀN DIỆN CHO CẢ 4 HỆ THỐNG! ===');
}

captureAll().catch(console.error);
