const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--ignore-certificate-errors']
  });

  console.log('--- Checking CRM: https://crm.ceo1983.viconnect.vn ---');
  const crmContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const crmPage = await crmContext.newPage();
  try {
    await crmPage.goto('https://crm.ceo1983.viconnect.vn', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('CRM Page Title:', await crmPage.title());
    console.log('CRM Page URL:', crmPage.url());
    await crmPage.screenshot({ path: 'scripts/crm_subdomain_init.png' });
  } catch (err) {
    console.error('CRM Load Error:', err.message);
  }

  console.log('--- Checking App: https://ceo1983.viconnect.vn ---');
  const appContext = await browser.newContext({ 
    viewport: { width: 414, height: 896 },
    isMobile: true,
    hasTouch: true
  });
  const appPage = await appContext.newPage();
  try {
    await appPage.goto('https://ceo1983.viconnect.vn', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('App Page Title:', await appPage.title());
    console.log('App Page URL:', appPage.url());
    await appPage.screenshot({ path: 'scripts/app_subdomain_init.png' });
  } catch (err) {
    console.error('App Load Error:', err.message);
  }

  await browser.close();
  console.log('Done subdomain inspection!');
})();
