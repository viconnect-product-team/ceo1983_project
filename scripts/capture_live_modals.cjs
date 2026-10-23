const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const CRM_BASE = 'https://crm.ceo1983.viconnect.vn';
const APP_BASE = 'https://ceo1983.viconnect.vn';

const OUT_DIR_CRM = path.resolve('scripts/live_subdomain_captures/crm');
const OUT_DIR_APP = path.resolve('scripts/live_subdomain_captures/app');

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--ignore-certificate-errors']
  });

  // 1. CRM Modals & Drawers
  console.log('--- Capturing CRM Modals & Drawers ---');
  const crmContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const crmPage = await crmContext.newPage();

  // Login
  const authRes = await fetch(`${CRM_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ceo.tongthuky@ceo1983.com', password: '123456' })
  });
  const authData = await authRes.json();
  await crmContext.addCookies([
    { name: 'access_token', value: authData.access_token, domain: 'crm.ceo1983.viconnect.vn', path: '/' },
    { name: 'vibe_token', value: authData.access_token, domain: 'crm.ceo1983.viconnect.vn', path: '/' },
    { name: 'sb-access-token', value: authData.access_token, domain: 'crm.ceo1983.viconnect.vn', path: '/' }
  ]);
  await crmPage.goto(`${CRM_BASE}/members`, { waitUntil: 'networkidle' });
  await crmPage.evaluate((data) => {
    localStorage.setItem('vibe_token', data.access_token);
    localStorage.setItem('vibe_refresh_token', data.refresh_token || data.access_token);
    localStorage.setItem('vibe_user', JSON.stringify(data.user));
  }, authData);
  await crmPage.reload({ waitUntil: 'networkidle' });
  await crmPage.waitForTimeout(2000);

  // Click on first row in members table to open Member Drawer
  try {
    const row = await crmPage.$('table tbody tr, [role="row"]');
    if (row) {
      await row.click();
      await crmPage.waitForTimeout(1500);
      await crmPage.screenshot({ path: path.join(OUT_DIR_CRM, '03b_crm_member_drawer.png') });
      console.log('Saved 03b_crm_member_drawer.png');
    }
  } catch (e) {
    console.log('Could not open member drawer:', e.message);
  }

  // Go to events and open create modal
  try {
    await crmPage.goto(`${CRM_BASE}/events`, { waitUntil: 'networkidle' });
    await crmPage.waitForTimeout(2000);
    const btnCreate = await crmPage.$('button:has-text("Tạo sự kiện"), button:has-text("Thêm sự kiện")');
    if (btnCreate) {
      await btnCreate.click();
      await crmPage.waitForTimeout(1500);
      await crmPage.screenshot({ path: path.join(OUT_DIR_CRM, '04b_crm_event_create_modal.png') });
      console.log('Saved 04b_crm_event_create_modal.png');
    }
  } catch (e) {
    console.log('Could not open event create modal:', e.message);
  }

  // 2. Mobile App Modals
  console.log('--- Capturing Mobile App Modals ---');
  const appContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    ignoreHTTPSErrors: true
  });
  const appPage = await appContext.newPage();

  const appAuthRes = await fetch(`${APP_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ceo.tongthuky@ceo1983.com', password: '123456' })
  });
  const appAuthData = await appAuthRes.json();
  await appContext.addCookies([
    { name: 'access_token', value: appAuthData.access_token, domain: 'ceo1983.viconnect.vn', path: '/' },
    { name: 'vibe_token', value: appAuthData.access_token, domain: 'ceo1983.viconnect.vn', path: '/' },
    { name: 'sb-access-token', value: appAuthData.access_token, domain: 'ceo1983.viconnect.vn', path: '/' }
  ]);
  await appPage.goto(`${APP_BASE}/association/members`, { waitUntil: 'networkidle' });
  await appPage.evaluate((data) => {
    localStorage.setItem('vibe_token', data.access_token);
    localStorage.setItem('vibe_refresh_token', data.refresh_token || data.access_token);
    localStorage.setItem('vibe_user', JSON.stringify(data.user));
  }, appAuthData);
  await appPage.reload({ waitUntil: 'networkidle' });
  await appPage.waitForTimeout(2000);

  // Click on "Bản đồ" or Map icon
  try {
    const mapBtn = await appPage.$('button:has-text("Bản đồ"), [aria-label*="bản đồ" i], button:has-text("Map")');
    if (mapBtn) {
      await mapBtn.click();
      await appPage.waitForTimeout(2500);
      await appPage.screenshot({ path: path.join(OUT_DIR_APP, '06b_app_interactive_map_leaflet.png') });
      console.log('Saved 06b_app_interactive_map_leaflet.png');
    }
  } catch (e) {
    console.log('Could not open map modal:', e.message);
  }

  // Go to digital card and open QR
  try {
    await appPage.goto(`${APP_BASE}/association/card`, { waitUntil: 'networkidle' });
    await appPage.waitForTimeout(2000);
    const qrBtn = await appPage.$('button:has-text("Mã QR"), button:has-text("QR Code"), [aria-label*="qr" i]');
    if (qrBtn) {
      await qrBtn.click();
      await appPage.waitForTimeout(1500);
      await appPage.screenshot({ path: path.join(OUT_DIR_APP, '02b_app_card_qr_modal.png') });
      console.log('Saved 02b_app_card_qr_modal.png');
    }
  } catch (e) {
    console.log('Could not open card QR modal:', e.message);
  }

  await browser.close();
  console.log('Done capturing live modals!');
}

main().catch(err => console.error(err));
