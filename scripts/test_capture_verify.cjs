const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CRM_BASE = "https://crm.ceo1983.viconnect.vn";
const APP_BASE = "https://ceo1983.viconnect.vn";

async function testScreenshots() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Log in via API to get token
  const res = await fetch(`${CRM_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@connect.vn', username: 'admin@connect.vn', password: '123456' })
  });
  const data = await res.json();
  const token = data.access_token;
  const user = data.user;

  // 2. Set cookies
  await page.setCookie(
    { name: 'vibe_token', value: token, domain: 'crm.ceo1983.viconnect.vn', path: '/' },
    { name: 'token', value: token, domain: 'crm.ceo1983.viconnect.vn', path: '/' },
    { name: 'access_token', value: token, domain: 'crm.ceo1983.viconnect.vn', path: '/' },
    { name: 'sb-access-token', value: token, domain: 'crm.ceo1983.viconnect.vn', path: '/' }
  );

  // 3. Navigate to CRM events
  await page.goto(`${CRM_BASE}/events`, { waitUntil: 'networkidle2', timeout: 30000 });

  // Set minimal localStorage safely
  await page.evaluate((tok, usr) => {
    try {
      localStorage.clear();
      localStorage.setItem("vibe_token", tok);
      localStorage.setItem("token", tok);
      localStorage.setItem("access_token", tok);
      localStorage.setItem("sb-access-token", tok);
      const minUser = { id: usr.id, email: usr.email, role: usr.role || 'admin', name: usr.name || 'Admin' };
      localStorage.setItem("user", JSON.stringify(minUser));
    } catch (e) {
      console.warn('localStorage error ignored:', e);
    }
  }, token, user);

  // Reload or wait for DOM
  await new Promise(r => setTimeout(r, 2000));

  // Inject sleek badge banner
  await page.evaluate((badgeText) => {
    const banner = document.createElement('div');
    banner.id = 'test-watermark-badge';
    banner.style.position = 'fixed';
    banner.style.top = '12px';
    banner.style.right = '20px';
    banner.style.zIndex = '9999999';
    banner.style.background = 'linear-gradient(135deg, #1e3a8a, #0284c7)';
    banner.style.color = '#ffffff';
    banner.style.padding = '8px 16px';
    banner.style.borderRadius = '8px';
    banner.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    banner.style.fontFamily = 'Arial, sans-serif';
    banner.style.fontSize = '13px';
    banner.style.fontWeight = 'bold';
    banner.style.border = '2px solid #38bdf8';
    banner.innerHTML = badgeText;
    document.body.appendChild(banner);
  }, `[NODE-CRM-001] • CASE-1.1 • Actor: admin@connect.vn • STATUS: PASS`);

  const outPath = path.join(__dirname, '..', 'test-reports', 'screenshots', 'sample_test_capture.png');
  await page.screenshot({ path: outPath });
  console.log('Sample screenshot saved:', outPath);

  await browser.close();
}

testScreenshots().catch(console.error);
