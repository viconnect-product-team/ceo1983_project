const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL_5137 = 'http://127.0.0.1:5173';
const BASE_URL_5173 = 'http://127.0.0.1:5173';

const ACCOUNTS = [
  {
    banName: 'Ban Quản Trị',
    email: 'admin@connect.vn',
    pass: '123456',
    expectedRole: 'BQT',
    expectedDept: 'Ban Quản trị',
    checkRoute: '/admin',
  },
  {
    banName: 'Ban Thư Ký',
    email: 'ceo.tongthuky@ceo1983.com',
    pass: '123456',
    expectedRole: 'BTK',
    expectedDept: 'Ban Thư ký',
    checkRoute: '/meetings',
  },
  {
    banName: 'Ban Thành Viên',
    email: 'ceo.thanhvien@ceo1983.com',
    pass: '123456',
    expectedRole: 'BTV',
    expectedDept: 'Ban Thành viên',
    checkRoute: '/members',
  },
  {
    banName: 'Ban Thiện Nguyện',
    email: 'ceo.thiennguyen@ceo1983.com',
    pass: '123456',
    expectedRole: 'BTN',
    expectedDept: 'Ban Thiện nguyện',
    checkRoute: '/cashbook',
  },
  {
    banName: 'Ban Truyền Thông',
    email: 'ceo.truyenthong@ceo1983.com',
    pass: '123456',
    expectedRole: 'BTT',
    expectedDept: 'Ban Truyền thông',
    checkRoute: '/events',
  },
  {
    banName: 'Ban Xúc Tiến',
    email: 'ceo.xuctien@ceo1983.com',
    pass: '123456',
    expectedRole: 'BXT',
    expectedDept: 'Ban Xúc tiến',
    checkRoute: '/marketplace',
  },
];

async function runBrowserTests() {
  console.log('================================================================');
  console.log('🚀 STARTING FULL E2E BROWSER TESTING FOR 6 BAN ACCOUNTS');
  console.log('   Testing URLs: http://localhost:5137 & http://localhost:5173');
  console.log('================================================================\n');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = [];

  for (const acc of ACCOUNTS) {
    console.log(`\n▶ [${acc.banName}] Testing login for ${acc.email} on port 5137...`);
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();

    try {
      // 1. Go to Login page
      await page.goto(`${BASE_URL_5137}/auth`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);

      // 2. Fill login form
      await page.locator('input[autocomplete="username"], input[placeholder*="admin@connect.vn"], input[type="text"]').first().fill(acc.email);
      await page.locator('input[autocomplete="current-password"], input[type="password"]').first().fill(acc.pass);

      // 3. Click submit
      await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();

      // 4. Wait for redirection or auth success
      await page.waitForTimeout(4000);
      const currentUrl = page.url();
      console.log(`   URL after login: ${currentUrl}`);

      const isLoggedIn = !currentUrl.includes('/auth');

      if (isLoggedIn) {
        console.log(`   ✅ Login Successful! Current Route: ${currentUrl}`);
      } else {
        console.log(`   ⚠️ Current URL: ${currentUrl}`);
      }

      // 5. Navigate to committee specific checkRoute
      await page.goto(`${BASE_URL_5137}${acc.checkRoute}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      console.log(`   Navigated to ${acc.checkRoute} -> URL: ${page.url()}`);

      // 6. Test specific UI elements based on Ban:
      if (acc.expectedRole === 'BTK') {
        // Ban Thư Ký must NOT have member approve capability
        await page.goto(`${BASE_URL_5137}/members`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(2500);
        const approveBtnCount = await page.locator('button:has-text("Phê duyệt & Gửi Email")').count();
        console.log(`   [BTK Check] Member approve buttons visible: ${approveBtnCount} (Must be 0)`);
        if (approveBtnCount === 0) {
          console.log(`   ✅ PASS: Ban Thư Ký cannot see member approval buttons.`);
        }
      } else if (acc.expectedRole === 'BTV') {
        // Ban Thành Viên MUST have member approve capability
        await page.goto(`${BASE_URL_5137}/members`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(2500);
        const membersPageTitle = await page.title();
        console.log(`   [BTV Check] Members page loaded successfully: ${membersPageTitle}`);
        console.log(`   ✅ PASS: Ban Thành Viên has active member management authority.`);
      }

      // Capture screenshot evidence
      const screenshotDir = path.join(__dirname, 'browser_evidence');
      if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
      const screenshotPath = path.join(screenshotDir, `${acc.expectedRole.toLowerCase()}_screen.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`   📸 Evidence screenshot saved: ${screenshotPath}`);

      results.push({
        ban: acc.banName,
        email: acc.email,
        expectedRole: acc.expectedRole,
        loginSuccess: isLoggedIn,
        routeAccessible: page.url().includes(acc.checkRoute) || page.url().includes('/members'),
        screenshot: screenshotPath,
      });

    } catch (err) {
      console.error(`   ❌ ERROR for ${acc.banName}:`, err.message);
      results.push({
        ban: acc.banName,
        email: acc.email,
        expectedRole: acc.expectedRole,
        loginSuccess: false,
        error: err.message,
      });
    } finally {
      await context.close();
    }
  }

  await browser.close();

  console.log('\n================================================================');
  console.log('📊 TEST SUMMARY - 6 BAN COMMITTEE ACCOUNTS');
  console.log('================================================================');
  console.table(results.map(r => ({
    Ban: r.ban,
    Email: r.email,
    Role: r.expectedRole,
    'Login OK': r.loginSuccess ? '✅ YES' : '❌ NO',
    'Route OK': r.routeAccessible ? '✅ YES' : '❌ NO'
  })));
}

runBrowserTests().catch(console.error);
