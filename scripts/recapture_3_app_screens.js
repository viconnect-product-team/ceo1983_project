const { chromium } = require('playwright');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '../document/images/live_captures_fresh');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--ignore-certificate-errors', '--no-sandbox']
  });

  const appContext = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    ignoreHTTPSErrors: true
  });
  const appPage = await appContext.newPage();

  const appAuthRes = await fetch('https://ceo1983.viconnect.vn/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ceo.tongthuky@ceo1983.com', password: '123456' })
  });
  const appAuthData = await appAuthRes.json();
  const token = appAuthData.access_token;
  const user = appAuthData.user;

  await appContext.addCookies([
    { name: 'access_token', value: token, domain: 'ceo1983.viconnect.vn', path: '/' },
    { name: 'vibe_token', value: token, domain: 'ceo1983.viconnect.vn', path: '/' },
    { name: 'sb-access-token', value: token, domain: 'ceo1983.viconnect.vn', path: '/' }
  ]);

  // Navigate to inject storage with modal disabled
  await appPage.goto('https://ceo1983.viconnect.vn/association', { waitUntil: 'domcontentloaded' });
  await appPage.evaluate(({ token, user }) => {
    localStorage.setItem('vibe_token', token);
    localStorage.setItem('vibe_refresh_token', token);
    localStorage.setItem('vba_auth_token', token);
    localStorage.setItem('vba_token', token);
    localStorage.setItem('vba_user', JSON.stringify(user));
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('ceo1983_welcome_shown', 'true');
    if (user && user.id) {
      localStorage.setItem('ceo1983_welcome_shown_' + user.id, 'true');
    }
  }, { token, user });

  const routes = [
    { url: 'https://ceo1983.viconnect.vn/association/card', file: 'app_02_the_hoivien_so_vip.png' },
    { url: 'https://ceo1983.viconnect.vn/association/opportunities', file: 'app_04_san_giaothuong_b2b.png' },
    { url: 'https://ceo1983.viconnect.vn/association/events', file: 'app_05_sukien_ve_dien_tu.png' }
  ];

  for (const r of routes) {
    await appPage.goto(r.url, { waitUntil: 'networkidle', timeout: 20000 });
    // Dismiss any modal if present
    try {
      const dismissBtn = await appPage.$('button:has-text("Bắt đầu trải nghiệm ngay"), button:has-text("Đóng"), button:has(svg.lucide-x)');
      if (dismissBtn) {
        await dismissBtn.click();
        await appPage.waitForTimeout(1000);
      }
    } catch (e) {}

    await appPage.waitForTimeout(2000);
    await appPage.screenshot({ path: path.join(OUT_DIR, r.file) });
    console.log('Recaptured clean screen:', r.file);
  }

  await browser.close();
  console.log('Done recapturing 3 clean app screens!');
})();
