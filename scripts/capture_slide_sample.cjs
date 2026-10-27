const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1.5
  });

  const htmlPath = path.resolve('document/SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.html');
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Chụp Slide 1
  await page.screenshot({ path: 'document/images/slide_check_1.png' });
  console.log('✓ Captured Slide 1');

  // Next sang Slide 3
  await page.evaluate(() => { renderSlide(2); });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'document/images/slide_check_3.png' });
  console.log('✓ Captured Slide 3 (CRM Dashboard)');

  // Next sang Slide 5
  await page.evaluate(() => { renderSlide(4); });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'document/images/slide_check_5.png' });
  console.log('✓ Captured Slide 5 (CRM Gala Banquet)');

  // Next sang Slide 9
  await page.evaluate(() => { renderSlide(8); });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'document/images/slide_check_9.png' });
  console.log('✓ Captured Slide 9 (App Home)');

  await browser.close();
  console.log('ALL SAMPLE SLIDES CAPTURED!');
})();
