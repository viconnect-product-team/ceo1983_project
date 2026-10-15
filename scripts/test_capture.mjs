import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('D:/download/node_modules/playwright');
import fs from 'fs';
import path from 'path';

async function testScreenshots() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  // Mobile Context
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
  });

  const mobilePage = await mobileContext.newPage();
  console.log('1. Navigating to Mobile Landing / Register...');
  await mobilePage.goto('https://ceo1983.viconnect.vn/landing', { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.screenshot({ path: 'document/images/guide_mobile/01_dang_ky_gia_nhap.png', fullPage: false });
  console.log('Saved 01_dang_ky_gia_nhap.png');

  console.log('2. Navigating to Mobile Login...');
  await mobilePage.goto('https://ceo1983.viconnect.vn/association/login', { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.screenshot({ path: 'document/images/guide_mobile/02_dang_nhap_mobile.png', fullPage: false });
  console.log('Saved 02_dang_nhap_mobile.png');

  // CRM Context
  const crmContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5
  });

  const crmPage = await crmContext.newPage();
  console.log('3. Navigating to CRM Auth...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/auth', { waitUntil: 'networkidle', timeout: 30000 });
  await crmPage.screenshot({ path: 'document/images/guide_crm/01_dang_nhap_crm.png', fullPage: false });
  console.log('Saved 01_dang_nhap_crm.png');

  await browser.close();
  console.log('Test completed successfully!');
}

testScreenshots().catch(console.error);
