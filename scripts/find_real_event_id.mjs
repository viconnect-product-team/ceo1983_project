import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('D:/download/node_modules/playwright');

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  
  await page.goto('https://crm.ceo1983.viconnect.vn/auth', { waitUntil: 'networkidle' });
  await page.fill('input[type="text"], input[type="email"]', 'admin@connect.vn');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  await page.goto('https://crm.ceo1983.viconnect.vn/events', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);

  const eventInfo = await page.evaluate(() => {
    // Tìm các link hoặc button có chứa id
    const rows = Array.from(document.querySelectorAll('tr, .event-card, [data-event-id]'));
    return rows.map(r => ({
      text: r.innerText.slice(0, 100).replace(/\n/g, ' '),
      html: r.innerHTML.slice(0, 200)
    })).slice(0, 10);
  });
  console.log('Event rows:', JSON.stringify(eventInfo, null, 2));

  // Thử gọi API events từ console của page
  const apiEvents = await page.evaluate(async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) return await res.json();
    } catch (e) {}
    try {
      const res2 = await fetch('https://crm.ceo1983.viconnect.vn/api/events');
      if (res2.ok) return await res2.json();
    } catch (e) {}
    return null;
  });
  console.log('API events count:', apiEvents ? (apiEvents.data || apiEvents).length : 'null');
  if (apiEvents) {
    const list = apiEvents.data || apiEvents;
    console.log('First event:', list[0]);
  }

  await browser.close();
}

main().catch(console.error);
