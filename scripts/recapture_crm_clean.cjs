const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--ignore-certificate-errors']
  });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 950 },
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  const CRM_BASE = 'https://crm.ceo1983.viconnect.vn';
  try {
    const authRes = await fetch(`${CRM_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ceo.tongthuky@ceo1983.com', password: '123456' })
    });
    const authData = await authRes.json();
    console.log('API login token:', authData.access_token ? 'YES' : 'NO');
    if (authData.access_token) {
      await context.addCookies([
        { name: 'access_token', value: authData.access_token, domain: 'crm.ceo1983.viconnect.vn', path: '/' },
        { name: 'vibe_token', value: authData.access_token, domain: 'crm.ceo1983.viconnect.vn', path: '/' }
      ]);
      await page.goto(`${CRM_BASE}/`, { waitUntil: 'networkidle' });
      await page.evaluate((data) => {
        localStorage.setItem('vibe_token', data.access_token);
        localStorage.setItem('vibe_refresh_token', data.refresh_token || data.access_token);
        localStorage.setItem('vibe_user', JSON.stringify(data.user));
      }, authData);
      await page.goto(`${CRM_BASE}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2500);
      console.log('CRM Dashboard URL:', page.url());
      await page.screenshot({ path: 'document/images/live_captures_fresh/crm_01_dashboard_tongquan.png' });
      console.log('Captured crm_01_dashboard_tongquan.png!');

      await page.goto(`${CRM_BASE}/members`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2500);
      console.log('CRM Members URL:', page.url());
      await page.screenshot({ path: 'document/images/live_captures_fresh/crm_03_quanly_hoivien_360.png' });
      console.log('Captured crm_03_quanly_hoivien_360.png!');
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
  await browser.close();
})();
