import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('D:/download/node_modules/playwright');

async function testAuth() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  console.log('--- TEST CRM LOGIN ---');
  const crmContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const crmPage = await crmContext.newPage();
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/auth', { waitUntil: 'networkidle' });
  
  // Fill credentials
  await crmPage.fill('input[type="text"], input[type="email"]', 'admin@connect.vn');
  await crmPage.fill('input[type="password"]', '123456');
  await crmPage.click('button[type="submit"]');
  await crmPage.waitForTimeout(3000);
  console.log('CRM Current URL after login:', crmPage.url());

  console.log('--- TEST MOBILE LOGIN ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 414, height: 896 },
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();
  // Prevent PWA prompt on mobile
  await mobilePage.addInitScript(() => {
    localStorage.setItem('ceo1983_ios_prompt_dismissed', 'true');
    sessionStorage.setItem('ceo1983_ios_prompt_dismissed', 'true');
  });

  await mobilePage.goto('https://ceo1983.viconnect.vn/association/login', { waitUntil: 'networkidle' });
  await mobilePage.fill('input[type="text"], input[type="email"]', 'admin@connect.vn');
  await mobilePage.fill('input[type="password"]', '123456');
  await mobilePage.click('button[type="submit"]');
  await mobilePage.waitForTimeout(3000);
  console.log('Mobile Current URL after login:', mobilePage.url());

  await browser.close();
}

testAuth().catch(console.error);
