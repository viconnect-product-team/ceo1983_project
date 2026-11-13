const { chromium } = require('playwright');
const path = require('path');
const CRM_URL = 'https://crm.ceo1983.viconnect.vn';
const OUT_DIR_CRM = path.resolve(__dirname, '../document/images/guide_crm');

async function captureResponsive() {
  console.log('=== CHỤP LẠI RESPONSIVE VỚI AUTH TOKEN CHUẨN XÁC ===');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--ignore-certificate-errors', '--disable-web-security']
  });

  const authRes = await fetch(`${CRM_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@connect.vn', password: '123456' })
  });
  const authData = await authRes.json();
  console.log('Auth login status:', authData.access_token ? 'SUCCESS' : 'FAILED');

  const setups = [
    { name: 'responsive_crm_desktop_1440.png', width: 1440, height: 900, isMobile: false },
    { name: 'responsive_crm_tablet_1024.png', width: 1024, height: 768, isMobile: false },
    { name: 'responsive_crm_mobile_390.png', width: 390, height: 844, isMobile: true }
  ];

  for (const s of setups) {
    const ctx = await browser.newContext({
      viewport: { width: s.width, height: s.height },
      isMobile: s.isMobile,
      hasTouch: s.isMobile,
      ignoreHTTPSErrors: true
    });
    if (authData.access_token) {
      await ctx.addCookies([
        { name: 'access_token', value: authData.access_token, domain: 'crm.ceo1983.viconnect.vn', path: '/' },
        { name: 'vibe_token', value: authData.access_token, domain: 'crm.ceo1983.viconnect.vn', path: '/' }
      ]);
    }
    const page = await ctx.newPage();
    await page.goto(`${CRM_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    if (authData.access_token) {
      await page.evaluate((data) => {
        localStorage.setItem('vibe_token', data.access_token);
        localStorage.setItem('vibe_refresh_token', data.refresh_token || data.access_token);
        localStorage.setItem('vibe_user', JSON.stringify(data.user));
      }, authData);
      await page.goto(`${CRM_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    }
    await page.waitForTimeout(2000);
    console.log(`Page URL for ${s.name}: ${page.url()}`);
    await page.screenshot({ path: path.join(OUT_DIR_CRM, s.name) });
    console.log(`Saved authenticated: ${s.name}`);
    await ctx.close();
  }

  await browser.close();
  console.log('=== HOÀN TẤT CHỤP RESPONSIVE CHUẨN XÁC ===');
}

captureResponsive().catch(console.error);

