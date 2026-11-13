const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const CRM_URL = 'https://crm.ceo1983.viconnect.vn';
const OUT_DIR = path.resolve(__dirname, '../document/images/guide_crm');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function run() {
  console.log('=== RESUMING CRM FULL CAPTURE (PAGES 14 -> 30) ===');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1440, height: 900 }
  });
  const page = await ctx.newPage();

  try {
    // Login
    console.log('Logging in to CRM...');
    await page.goto(`${CRM_URL}/auth`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
    await page.locator('input[type="password"]').first().fill('123456');
    await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await page.waitForTimeout(4000);

    const routes = [
      { name: '14_crm_income_list.png', url: '/income' },
      { name: '15_crm_expenses_list.png', url: '/expenses' },
      { name: '16_crm_finance_report.png', url: '/finance-report' },
      { name: '17_crm_tasks_kanban.png', url: '/tasks' },
      { name: '19_crm_sponsors_list.png', url: '/sponsors' },
      { name: '20_crm_documents_list.png', url: '/documents' },
      { name: '21_crm_voting_and_luckydraw.png', url: '/voting' },
      { name: '22_crm_news_admin.png', url: '/news-admin' },
      { name: '23_crm_renewal_list.png', url: '/renewal' },
      { name: '24_crm_trainings_list.png', url: '/trainings' },
      { name: '25_crm_activity_logs.png', url: '/activity-logs' },
      { name: '26_crm_opportunities_list.png', url: '/opportunities' },
      { name: '27_crm_theme_studio.png', url: '/admin/landing-templates' },
      { name: '28_crm_notifications_hub.png', url: '/notifications' },
      { name: '29_crm_landing_webs.png', url: '/admin/landing-webs' },
      { name: '30_crm_templates_hub.png', url: '/templates' }
    ];

    for (const r of routes) {
      try {
        console.log(`Capturing ${r.name} from ${r.url}...`);
        await page.goto(`${CRM_URL}${r.url}`, { waitUntil: 'networkidle', timeout: 25000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(OUT_DIR, r.name) });
        console.log(`Saved ${r.name}`);
      } catch (e) {
        console.error(`Failed ${r.name}:`, e.message);
      }
    }

    console.log('=== COMPLETED CRM REMAINING PAGES ===');
  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await browser.close();
  }
}

run();

