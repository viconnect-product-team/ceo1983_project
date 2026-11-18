const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const p = await browser.newPage({ ignoreHTTPSErrors: true });
  await p.goto('https://ceo1983.viconnect.vn/association/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await p.waitForTimeout(3000);
  console.log('Final URL after /association/login:', p.url());
  const inputs = await p.locator('input').all();
  console.log('Inputs count:', inputs.length);
  for (let i = 0; i < inputs.length; i++) {
    const id = await inputs[i].getAttribute('id');
    const type = await inputs[i].getAttribute('type');
    const name = await inputs[i].getAttribute('name');
    const ph = await inputs[i].getAttribute('placeholder');
    console.log('Input ' + i + ': id=' + id + ', type=' + type + ', name=' + name + ', placeholder=' + ph);
  }

  // Also check /auth
  await p.goto('https://ceo1983.viconnect.vn/auth', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await p.waitForTimeout(3000);
  console.log('Final URL after /auth:', p.url());
  const inputsAuth = await p.locator('input').all();
  console.log('Inputs count on /auth:', inputsAuth.length);
  for (let i = 0; i < inputsAuth.length; i++) {
    const id = await inputsAuth[i].getAttribute('id');
    const type = await inputsAuth[i].getAttribute('type');
    const name = await inputsAuth[i].getAttribute('name');
    const ph = await inputsAuth[i].getAttribute('placeholder');
    console.log('Input ' + i + ': id=' + id + ', type=' + type + ', name=' + name + ', placeholder=' + ph);
  }

  await browser.close();
})();
