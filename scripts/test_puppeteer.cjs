const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function test() {
  const screenshotsDir = path.join(__dirname, '..', 'test-reports', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    console.log('Navigating to CRM...');
    await page.goto('https://crm.ceo1983.viconnect.vn/auth', { waitUntil: 'networkidle2', timeout: 30000 });
    const crmShot = path.join(screenshotsDir, 'crm_auth_page.png');
    await page.screenshot({ path: crmShot });
    console.log('CRM Screenshot saved to:', crmShot);

    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    console.log('Navigating to Mobile App...');
    await mobilePage.goto('https://ceo1983.viconnect.vn/association/login', { waitUntil: 'networkidle2', timeout: 30000 });
    const appShot = path.join(screenshotsDir, 'app_login_page.png');
    await mobilePage.screenshot({ path: appShot });
    console.log('Mobile App Screenshot saved to:', appShot);

  } finally {
    await browser.close();
  }
}

test().catch(console.error);

