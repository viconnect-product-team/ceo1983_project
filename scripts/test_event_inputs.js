const { chromium } = require('playwright');

async function testEventInputs() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();

  console.log('Navigating to /events/EV-MUOGTPO1/register...');
  await page.goto('https://14.225.217.232:5444/events/EV-MUOGTPO1/register', { waitUntil: 'networkidle', timeout: 30000 });
  
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, select, textarea, button')).map(el => ({
      tag: el.tagName,
      type: el.getAttribute('type'),
      placeholder: el.getAttribute('placeholder'),
      text: el.innerText.trim(),
      name: el.getAttribute('name'),
      id: el.getAttribute('id')
    }));
  });

  console.log('Inputs found:', JSON.stringify(inputs, null, 2));
  await browser.close();
}

testEventInputs().catch(console.error);
