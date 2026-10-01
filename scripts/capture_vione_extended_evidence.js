const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const DIRS = [
  path.resolve(__dirname, '../../vione_project/document/images/evidence'),
  path.resolve(__dirname, '../../vione_project/apps/vione_app_fe/public/docs/images/evidence'),
  path.resolve(__dirname, '../document/images/evidence'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs/images/evidence'),
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

async function captureAllVioneEvidence() {
  console.log('=== BẮT ĐẦU CHỤP ẢNH TOÀN DIỆN VIONE TRÊN SERVER DEV (PORT 5445) ===\n');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true
  });

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
    isMobile: true,
    hasTouch: true
  });

  // =========================================================================
  // PHẦN 1: HỆ THỐNG WEB CRM VIONE ENTERPRISE (DESKTOP)
  // =========================================================================
  console.log('>>> [1/2] CHỤP ẢNH WEB CRM VIONE ENTERPRISE...');
  const crm = await desktop.newPage();

  try {
    // 1. CRM Login
    console.log('1. CRM Login screen...');
    await crm.goto('https://14.225.217.232:5445/auth', { waitUntil: 'networkidle', timeout: 20000 });
    await crm.waitForTimeout(1000);
    saveImage('crm_vione_01_login.png', await crm.screenshot());

    // Submit Login
    await crm.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
    await crm.locator('input[type="password"]').first().fill('123456');
    await crm.locator('button[type="submit"]').first().click();
    await crm.waitForTimeout(4000);

    // 2. Dashboard
    console.log('2. CRM Dashboard...');
    await crm.goto('https://14.225.217.232:5445/', { waitUntil: 'networkidle', timeout: 20000 });
    await crm.waitForTimeout(2000);
    saveImage('crm_vione_02_dashboard.png', await crm.screenshot());

    // 3. Members & Partners
    console.log('3. CRM Members & Partners...');
    await crm.goto('https://14.225.217.232:5445/members', { waitUntil: 'networkidle', timeout: 20000 });
    await crm.waitForTimeout(2000);
    saveImage('crm_vione_03_members_partners.png', await crm.screenshot());

    // 4. Companies
    console.log('4. CRM Companies...');
    await crm.goto('https://14.225.217.232:5445/companies', { waitUntil: 'networkidle', timeout: 20000 });
    await crm.waitForTimeout(2000);
    saveImage('crm_vione_04_companies.png', await crm.screenshot());

    // 5. Opportunities Pipeline
    console.log('5. CRM Opportunities Pipeline...');
    await crm.goto('https://14.225.217.232:5445/opportunities', { waitUntil: 'networkidle', timeout: 20000 });
    await crm.waitForTimeout(2000);
    saveImage('crm_vione_05_opportunities_pipeline.png', await crm.screenshot());

    // 6. Marketplace Catalog
    console.log('6. CRM Marketplace Catalog...');
    await crm.goto('https://14.225.217.232:5445/marketplace', { waitUntil: 'networkidle', timeout: 20000 });
    await crm.waitForTimeout(2000);
    saveImage('crm_vione_06_marketplace_catalog.png', await crm.screenshot());

    // 7. Finance Income
    console.log('7. CRM Finance Income...');
    await crm.goto('https://14.225.217.232:5445/income', { waitUntil: 'networkidle', timeout: 20000 });
    await crm.waitForTimeout(2000);
    saveImage('crm_vione_07_finance_income.png', await crm.screenshot());

    // 8. Finance Expenses
    console.log('8. CRM Finance Expenses...');
    await crm.goto('https://14.225.217.232:5445/expenses', { waitUntil: 'networkidle', timeout: 20000 });
    await crm.waitForTimeout(2000);
    saveImage('crm_vione_08_finance_expenses.png', await crm.screenshot());

    // 9. Finance Report
    console.log('9. CRM Finance Report...');
    await crm.goto('https://14.225.217.232:5445/finance-report', { waitUntil: 'networkidle', timeout: 20000 });
    await crm.waitForTimeout(2000);
    saveImage('crm_vione_09_finance_report.png', await crm.screenshot());

    // 10. Documents & Contracts
    console.log('10. CRM Documents & Contracts...');
    await crm.goto('https://14.225.217.232:5445/documents', { waitUntil: 'networkidle', timeout: 20000 });
    await crm.waitForTimeout(2000);
    saveImage('crm_vione_10_documents_contracts.png', await crm.screenshot());

    // 11. Meetings Calendar
    console.log('11. CRM Meetings Calendar...');
    await crm.goto('https://14.225.217.232:5445/meetings', { waitUntil: 'networkidle', timeout: 20000 });
    await crm.waitForTimeout(2000);
    saveImage('crm_vione_11_meetings_calendar.png', await crm.screenshot());

    // 12. Digital Cards Admin
    console.log('12. CRM Digital Cards Admin...');
    await crm.goto('https://14.225.217.232:5445/business-cards', { waitUntil: 'networkidle', timeout: 20000 });
    await crm.waitForTimeout(2000);
    saveImage('crm_vione_12_business_cards_admin.png', await crm.screenshot());

    // 13. Account Settings
    console.log('13. CRM Account Settings...');
    await crm.goto('https://14.225.217.232:5445/account-settings', { waitUntil: 'networkidle', timeout: 20000 });
    await crm.waitForTimeout(2000);
    saveImage('crm_vione_13_account_settings.png', await crm.screenshot());

    // 14. Company Create Modal
    console.log('14. CRM Company Create Modal...');
    await crm.goto('https://14.225.217.232:5445/companies', { waitUntil: 'networkidle', timeout: 20000 });
    await crm.waitForTimeout(1500);
    const addCompanyBtn = crm.locator('button:has-text("Thêm công ty"), button:has-text("Tạo công ty"), button:has-text("Thêm mới")').first();
    if (await addCompanyBtn.count() > 0) {
      await addCompanyBtn.click().catch(() => {});
      await crm.waitForTimeout(1000);
      saveImage('crm_vione_14_company_create_modal.png', await crm.screenshot());
      const closeBtn = crm.locator('button:has-text("Đóng"), button:has-text("Hủy"), button[aria-label="Close"]').first();
      if (await closeBtn.count() > 0) await closeBtn.click().catch(() => {});
    }

  } catch (err) {
    console.error('Lỗi khi chụp CRM ViOne:', err);
  } finally {
    await crm.close();
  }

  // =========================================================================
  // PHẦN 2: ỨNG DỤNG DI ĐỘNG VIONE CONNECT (MOBILE SMARTPHONE PORTRAIT)
  // =========================================================================
  console.log('\n>>> [2/2] CHỤP ẢNH APP VIONE CONNECT (SMARTPHONE 390x844)...');
  const app = await mobile.newPage();

  try {
    // 1. Mobile Login
    console.log('1. App ViOne Login screen...');
    await app.goto('https://14.225.217.232:5445/vione/login', { waitUntil: 'networkidle', timeout: 20000 });
    await app.waitForTimeout(1000);
    saveImage('app_vione_01_login.png', await app.screenshot());

    // Submit Login
    await app.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
    await app.locator('input[type="password"]').first().fill('123456');
    await app.locator('button[type="submit"]').first().click();
    await app.waitForTimeout(4000);

    // 2. Home Executive Today
    console.log('2. App ViOne Executive Today...');
    await app.goto('https://14.225.217.232:5445/connect-app', { waitUntil: 'networkidle', timeout: 20000 });
    await app.waitForTimeout(2000);
    saveImage('app_vione_02_home_agenda.png', await app.screenshot());

    // 3. Quick Action "V"
    console.log('3. App ViOne Quick Action V Button...');
    const vButton = app.locator('button:has-text("V"), button[aria-label*="connect"], button[class*="rounded-full"]').nth(2);
    if (await vButton.count() > 0) {
      await vButton.click().catch(() => {});
      await app.waitForTimeout(1000);
      saveImage('app_vione_03_quick_action_v.png', await app.screenshot());
      await app.mouse.click(50, 50);
    } else {
      saveImage('app_vione_03_quick_action_v.png', await app.screenshot());
    }

    // 4. Network Directory
    console.log('4. App ViOne Network Directory...');
    await app.goto('https://14.225.217.232:5445/connect-app/network', { waitUntil: 'networkidle', timeout: 20000 });
    await app.waitForTimeout(2000);
    saveImage('app_vione_04_network_directory.png', await app.screenshot());

    // 5. Moments Feed
    console.log('5. App ViOne Moments Feed...');
    await app.goto('https://14.225.217.232:5445/connect-app/moment', { waitUntil: 'networkidle', timeout: 20000 });
    await app.waitForTimeout(2000);
    saveImage('app_vione_05_moments_feed.png', await app.screenshot());

    // 6. Chat Inbox
    console.log('6. App ViOne Chat Inbox...');
    await app.goto('https://14.225.217.232:5445/connect-app/inbox', { waitUntil: 'networkidle', timeout: 20000 });
    await app.waitForTimeout(2000);
    saveImage('app_vione_06_chat_inbox.png', await app.screenshot());

    // 7. Community & Opportunities
    console.log('7. App ViOne Community & Opportunities...');
    await app.goto('https://14.225.217.232:5445/connect-app/community', { waitUntil: 'networkidle', timeout: 20000 });
    await app.waitForTimeout(2000);
    saveImage('app_vione_07_community_opportunities.png', await app.screenshot());

    // 8. Me / Titanium Digital Card Center
    console.log('8. App ViOne Me / Titanium Digital Card...');
    await app.goto('https://14.225.217.232:5445/connect-app/me', { waitUntil: 'networkidle', timeout: 20000 });
    await app.waitForTimeout(2000);
    saveImage('app_vione_08_digital_card_me.png', await app.screenshot());

    // 9. NFC Activation
    console.log('9. App ViOne NFC Activation...');
    await app.goto('https://14.225.217.232:5445/connect-app/activate', { waitUntil: 'networkidle', timeout: 20000 });
    await app.waitForTimeout(2000);
    saveImage('app_vione_09_nfc_activation.png', await app.screenshot());

    // 10. Security & Sessions
    console.log('10. App ViOne Security Settings...');
    await app.goto('https://14.225.217.232:5445/connect-app/me/security', { waitUntil: 'networkidle', timeout: 20000 });
    await app.waitForTimeout(2000);
    saveImage('app_vione_10_security_settings.png', await app.screenshot());

    // 11. Profile / Identity Edit
    console.log('11. App ViOne Profile / Identity Edit...');
    await app.goto('https://14.225.217.232:5445/connect-app/me/edit', { waitUntil: 'networkidle', timeout: 20000 });
    await app.waitForTimeout(2000);
    saveImage('app_vione_11_identity_edit.png', await app.screenshot());

  } catch (err) {
    console.error('Lỗi khi chụp App ViOne:', err);
  } finally {
    await app.close();
  }

  await browser.close();
  console.log('\n=== HOÀN TẤT CHỤP ẢNH THỰC TẾ TOÀN BỘ VIONE! ===');
}

captureAllVioneEvidence().catch(console.error);
