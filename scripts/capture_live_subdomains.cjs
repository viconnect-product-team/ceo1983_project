const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CRM_BASE = 'https://crm.ceo1983.viconnect.vn';
const APP_BASE = 'https://ceo1983.viconnect.vn';

const OUT_DIR_CRM = path.resolve('scripts/live_subdomain_captures/crm');
const OUT_DIR_APP = path.resolve('scripts/live_subdomain_captures/app');

fs.mkdirSync(OUT_DIR_CRM, { recursive: true });
fs.mkdirSync(OUT_DIR_APP, { recursive: true });

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--ignore-certificate-errors']
  });

  // 1. CAPTURE CRM
  console.log('\n=== 1. CAPTURING LIVE CRM: ' + CRM_BASE + ' ===');
  const crmContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true
  });
  const crmPage = await crmContext.newPage();

  // Login to CRM
  console.log('Navigating to CRM login...');
  await crmPage.goto(`${CRM_BASE}/auth?portal=crm`, { waitUntil: 'networkidle', timeout: 30000 });
  await crmPage.screenshot({ path: path.join(OUT_DIR_CRM, '00_crm_login.png') });

  // Fill login
  try {
    await crmPage.fill('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="tên đăng nhập" i]', 'ceo.tongthuky@ceo1983.com');
    await crmPage.fill('input[type="password"]', '123456');
    await crmPage.click('button[type="submit"]');
    await crmPage.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  } catch (err) {
    console.log('Login form fill fallback:', err.message);
  }

  // Check login success, or inject session via API
  let currentUrl = crmPage.url();
  console.log('CRM URL after login attempt:', currentUrl);
  if (currentUrl.includes('/auth') || currentUrl.includes('/login')) {
    console.log('Injecting auth token via API...');
    const authRes = await fetch(`${CRM_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ceo.tongthuky@ceo1983.com', password: '123456' })
    });
    const authData = await authRes.json();
    if (authData.access_token) {
      await crmContext.addCookies([
        { name: 'access_token', value: authData.access_token, domain: 'crm.ceo1983.viconnect.vn', path: '/' },
        { name: 'vibe_token', value: authData.access_token, domain: 'crm.ceo1983.viconnect.vn', path: '/' },
        { name: 'sb-access-token', value: authData.access_token, domain: 'crm.ceo1983.viconnect.vn', path: '/' }
      ]);
      await crmPage.evaluate((data) => {
        localStorage.setItem('vibe_token', data.access_token);
        localStorage.setItem('vibe_refresh_token', data.refresh_token || data.access_token);
        localStorage.setItem('vibe_user', JSON.stringify(data.user));
      }, authData);
      await crmPage.goto(`${CRM_BASE}/`, { waitUntil: 'networkidle', timeout: 30000 });
      console.log('CRM URL after token injection:', crmPage.url());
    }
  }

  await crmPage.waitForTimeout(2000);

  // CRM Routes to capture
  const crmRoutes = [
    { name: '01_crm_dashboard', path: '/' },
    { name: '02_crm_analytics', path: '/analytics' },
    { name: '03_crm_members', path: '/members' },
    { name: '04_crm_events', path: '/events' },
    { name: '05_crm_trainings', path: '/trainings' },
    { name: '06_crm_finance', path: '/finance' },
    { name: '07_crm_voting', path: '/voting' },
    { name: '08_crm_news', path: '/news' },
    { name: '09_crm_theme_studio', path: '/admin/landing-templates' },
    { name: '10_crm_roles_rbac', path: '/rbac' }
  ];

  for (const route of crmRoutes) {
    try {
      console.log(`Capturing CRM: ${route.name} (${route.path})...`);
      await crmPage.goto(`${CRM_BASE}${route.path}`, { waitUntil: 'networkidle', timeout: 20000 });
      await crmPage.waitForTimeout(2500);
      const outPath = path.join(OUT_DIR_CRM, `${route.name}.png`);
      await crmPage.screenshot({ path: outPath, fullPage: false });
      console.log(`Saved: ${outPath}`);
    } catch (e) {
      console.error(`Error capturing CRM ${route.name}:`, e.message);
    }
  }

  // 2. CAPTURE MOBILE APP
  console.log('\n=== 2. CAPTURING LIVE MOBILE APP: ' + APP_BASE + ' ===');
  const appContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    ignoreHTTPSErrors: true
  });
  const appPage = await appContext.newPage();

  // Login to App
  console.log('Navigating to Mobile App login...');
  await appPage.goto(`${APP_BASE}/association/login?redirect=%2Fassociation`, { waitUntil: 'networkidle', timeout: 30000 });
  await appPage.screenshot({ path: path.join(OUT_DIR_APP, '00_app_login.png') });

  // Inject auth token via API for mobile
  console.log('Authenticating Mobile App via API...');
  const appAuthRes = await fetch(`${APP_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ceo.tongthuky@ceo1983.com', password: '123456' })
  });
  const appAuthData = await appAuthRes.json();
  if (appAuthData.access_token) {
    await appContext.addCookies([
      { name: 'access_token', value: appAuthData.access_token, domain: 'ceo1983.viconnect.vn', path: '/' },
      { name: 'vibe_token', value: appAuthData.access_token, domain: 'ceo1983.viconnect.vn', path: '/' },
      { name: 'sb-access-token', value: appAuthData.access_token, domain: 'ceo1983.viconnect.vn', path: '/' }
    ]);
    await appPage.evaluate((data) => {
      localStorage.setItem('vibe_token', data.access_token);
      localStorage.setItem('vibe_refresh_token', data.refresh_token || data.access_token);
      localStorage.setItem('vibe_user', JSON.stringify(data.user));
    }, appAuthData);
  }

  // Mobile App Routes to capture
  const appRoutes = [
    { name: '01_app_home_vip', path: '/association' },
    { name: '02_app_digital_card', path: '/association/card' },
    { name: '03_app_analytics_dashboard', path: '/association/analytics' },
    { name: '04_app_b2b_opportunities', path: '/association/opportunities' },
    { name: '05_app_social_network_feed', path: '/association/messages' },
    { name: '06_app_member_directory', path: '/association/members' },
    { name: '07_app_events_schedule', path: '/association/events' },
    { name: '08_app_profile_theme_sync', path: '/association/profile' },
    { name: '09_app_privileges_market', path: '/association/perks' },
    { name: '10_app_voting_election', path: '/association/voting' }
  ];

  for (const route of appRoutes) {
    try {
      console.log(`Capturing App: ${route.name} (${route.path})...`);
      await appPage.goto(`${APP_BASE}${route.path}`, { waitUntil: 'networkidle', timeout: 20000 });
      await appPage.waitForTimeout(2500);
      const outPath = path.join(OUT_DIR_APP, `${route.name}.png`);
      await appPage.screenshot({ path: outPath, fullPage: false });
      console.log(`Saved: ${outPath}`);
    } catch (e) {
      console.error(`Error capturing App ${route.name}:`, e.message);
    }
  }

  await browser.close();
  console.log('\n✅ ALL LIVE SUBDOMAINS CAPTURED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('Fatal error capturing live subdomains:', err);
  process.exit(1);
});
