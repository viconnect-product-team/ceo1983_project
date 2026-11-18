const puppeteer = require('puppeteer-core');

async function testPuppeteer() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 600, deviceScaleFactor: 2 });
  await page.setContent('<h1 style="color:red; background: yellow; padding: 20px;">TEST PUPPETEER CORE CEO1983</h1>');
  await page.screenshot({ path: 'test_puppeteer.png' });
  await browser.close();
  console.log('SUCCESS: test_puppeteer.png created');
}

testPuppeteer().catch(console.error);
