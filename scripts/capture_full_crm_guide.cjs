const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const CRM_URL = 'https://crm.ceo1983.viconnect.vn';
const OUT_DIR = path.resolve(__dirname, '../document/images/guide_crm');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function run() {
  console.log('=== STARTING CRM FULL CAPTURE ===');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1440, height: 900 }
  });
  const page = await ctx.newPage();
  page.on('dialog', async d => {
    console.log('CRM Dialog:', d.message());
    await d.accept();
  });

  try {
    // 00. Login Screen
    console.log('Capturing 00_crm_login.png...');
    await page.goto(`${CRM_URL}/auth`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT_DIR, '00_crm_login.png') });

    // Perform Login
    console.log('Logging in as admin@connect.vn...');
    await page.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
    await page.locator('input[type="password"]').first().fill('123456');
    await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await page.waitForTimeout(4000);

    // 01. Dashboard
    console.log('Capturing 01_crm_dashboard.png...');
    await page.goto(`${CRM_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '01_crm_dashboard.png') });

    // 02. Analytics
    console.log('Capturing 02_crm_analytics.png...');
    await page.goto(`${CRM_URL}/analytics`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '02_crm_analytics.png') });

    // 03. Members List
    console.log('Capturing 03_crm_members_list.png...');
    await page.goto(`${CRM_URL}/members`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '03_crm_members_list.png') });

    // 04. Member Detail Drawer
    console.log('Capturing 04_crm_member_detail_drawer.png...');
    const memberRow = page.locator('table tbody tr').first();
    if (await memberRow.count() > 0) {
      await memberRow.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(OUT_DIR, '04_crm_member_detail_drawer.png') });
      const closeBtn = page.locator('button[aria-label="Close"], button:has-text("Đóng"), .lucide-x').first();
      if (await closeBtn.count() > 0) await closeBtn.click();
      await page.waitForTimeout(800);
    }

    // 05. Companies List
    console.log('Capturing 05_crm_companies_list.png...');
    await page.goto(`${CRM_URL}/companies`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '05_crm_companies_list.png') });

    // 06. Company Edit Modal
    console.log('Capturing 06_crm_company_edit_modal.png...');
    const editCompanyBtn = page.locator('button:has-text("Sửa"), button[title*="Sửa"]').first();
    if (await editCompanyBtn.count() > 0) {
      await editCompanyBtn.click();
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(OUT_DIR, '06_crm_company_edit_modal.png') });
      const closeBtn = page.locator('button:has-text("Hủy"), button:has-text("Đóng"), .lucide-x').first();
      if (await closeBtn.count() > 0) await closeBtn.click();
      await page.waitForTimeout(800);
    }

    // 07. Accounts List
    console.log('Capturing 07_crm_accounts_list.png...');
    await page.goto(`${CRM_URL}/accounts`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '07_crm_accounts_list.png') });

    // 08. Account Role & Dept Modal
    console.log('Capturing 08_crm_account_role_dept_modal.png...');
    const roleDeptBtn = page.locator('button:has-text("Gán vai trò"), button:has-text("Phân ban"), button:has-text("Sửa")').first();
    if (await roleDeptBtn.count() > 0) {
      await roleDeptBtn.click();
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(OUT_DIR, '08_crm_account_role_dept_modal.png') });
      const closeBtn = page.locator('button:has-text("Hủy"), button:has-text("Đóng"), .lucide-x').first();
      if (await closeBtn.count() > 0) await closeBtn.click();
      await page.waitForTimeout(800);
    }

    // 09. Permissions Matrix
    console.log('Capturing 09_crm_permissions_matrix.png...');
    await page.goto(`${CRM_URL}/permissions`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '09_crm_permissions_matrix.png') });

    // 10. Events List
    console.log('Capturing 10_crm_events_list.png...');
    await page.goto(`${CRM_URL}/events`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '10_crm_events_list.png') });

    // 11. Event Create Modal
    console.log('Capturing 11_crm_event_create_modal.png...');
    const createEventBtn = page.locator('button:has-text("Tạo sự kiện"), button:has-text("Thêm sự kiện")').first();
    if (await createEventBtn.count() > 0) {
      await createEventBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(OUT_DIR, '11_crm_event_create_modal.png') });
      const closeBtn = page.locator('button:has-text("Hủy"), button:has-text("Đóng"), .lucide-x').first();
      if (await closeBtn.count() > 0) await closeBtn.click();
      await page.waitForTimeout(800);
    }

    // 12. Meetings List
    console.log('Capturing 12_crm_meetings_list.png...');
    await page.goto(`${CRM_URL}/meetings`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '12_crm_meetings_list.png') });

    // 13. Meeting Create Modal
    console.log('Capturing 13_crm_meeting_create_modal.png...');
    const createMeetingBtn = page.locator('button:has-text("Tạo cuộc họp"), button:has-text("Thêm cuộc họp")').first();
    if (await createMeetingBtn.count() > 0) {
      await createMeetingBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(OUT_DIR, '13_crm_meeting_create_modal.png') });
      const closeBtn = page.locator('button:has-text("Hủy"), button:has-text("Đóng"), .lucide-x').first();
      if (await closeBtn.count() > 0) await closeBtn.click();
      await page.waitForTimeout(800);
    }

    // 14. Income List
    console.log('Capturing 14_crm_income_list.png...');
    await page.goto(`${CRM_URL}/income`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '14_crm_income_list.png') });

    // 15. Expenses List
    console.log('Capturing 15_crm_expenses_list.png...');
    await page.goto(`${CRM_URL}/expenses`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '15_crm_expenses_list.png') });

    // 16. Finance Report
    console.log('Capturing 16_crm_finance_report.png...');
    await page.goto(`${CRM_URL}/finance-report`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '16_crm_finance_report.png') });

    // 17. Tasks Kanban
    console.log('Capturing 17_crm_tasks_kanban.png...');
    await page.goto(`${CRM_URL}/tasks`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '17_crm_tasks_kanban.png') });

    // 18. Task Create Modal
    console.log('Capturing 18_crm_task_create_modal.png...');
    const createTaskBtn = page.locator('button:has-text("Giao việc mới"), button:has-text("Tạo công việc")').first();
    if (await createTaskBtn.count() > 0) {
      await createTaskBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(OUT_DIR, '18_crm_task_create_modal.png') });
      const closeBtn = page.locator('button:has-text("Hủy"), button:has-text("Đóng"), .lucide-x').first();
      if (await closeBtn.count() > 0) await closeBtn.click();
      await page.waitForTimeout(800);
    }

    // 19. Sponsors List
    console.log('Capturing 19_crm_sponsors_list.png...');
    await page.goto(`${CRM_URL}/sponsors`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '19_crm_sponsors_list.png') });

    // 20. Documents List
    console.log('Capturing 20_crm_documents_list.png...');
    await page.goto(`${CRM_URL}/documents`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '20_crm_documents_list.png') });

    // 21. Voting & Lucky Draw
    console.log('Capturing 21_crm_voting_and_luckydraw.png...');
    await page.goto(`${CRM_URL}/voting`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '21_crm_voting_and_luckydraw.png') });

    // 22. News Admin
    console.log('Capturing 22_crm_news_admin.png...');
    await page.goto(`${CRM_URL}/news-admin`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '22_crm_news_admin.png') });

    // 23. Renewal
    console.log('Capturing 23_crm_renewal_list.png...');
    await page.goto(`${CRM_URL}/renewal`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '23_crm_renewal_list.png') });

    // 24. Trainings
    console.log('Capturing 24_crm_trainings_list.png...');
    await page.goto(`${CRM_URL}/trainings`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '24_crm_trainings_list.png') });

    // 25. Activity Logs (Audit)
    console.log('Capturing 25_crm_activity_logs.png...');
    await page.goto(`${CRM_URL}/activity-logs`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '25_crm_activity_logs.png') });

    // 26. Opportunities
    console.log('Capturing 26_crm_opportunities_list.png...');
    await page.goto(`${CRM_URL}/opportunities`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '26_crm_opportunities_list.png') });

    // 27. Landing Templates (Theme Studio)
    console.log('Capturing 27_crm_theme_studio.png...');
    await page.goto(`${CRM_URL}/admin/landing-templates`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '27_crm_theme_studio.png') });

    // 28. Notifications Hub
    console.log('Capturing 28_crm_notifications_hub.png...');
    await page.goto(`${CRM_URL}/notifications`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '28_crm_notifications_hub.png') });

    // 29. Dynamic Landing Webs Pinterest Showcase
    console.log('Capturing 29_crm_landing_webs.png...');
    await page.goto(`${CRM_URL}/admin/landing-webs`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '29_crm_landing_webs.png') });

    // 30. Templates Hub (Omnichannel Invitation Studio)
    console.log('Capturing 30_crm_templates_hub.png...');
    await page.goto(`${CRM_URL}/templates`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '30_crm_templates_hub.png') });

    console.log('=== ALL CRM SCREENSHOTS CAPTURED SUCCESSFULLY ===');
  } catch (err) {
    console.error('CRM capture error:', err);
  } finally {
    await browser.close();
  }
}

run();

