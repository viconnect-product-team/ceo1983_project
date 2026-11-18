const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.resolve(__dirname, '../test-reports/screenshots');
const APP_URL = 'https://ceo1983.viconnect.vn';

async function dismissModals(page) {
  try {
    const dismissBtns = page.locator('button:has-text("Để sau"), button:has-text("Đã hiểu"), button:has-text("Bỏ qua")');
    const count = await dismissBtns.count();
    for (let i = 0; i < count; i++) {
      if (await dismissBtns.nth(i).isVisible()) {
        await dismissBtns.nth(i).click({ force: true }).catch(() => {});
        await page.waitForTimeout(300);
      }
    }
  } catch {}
}

async function captureDeal() {
  console.log('🚀 Running Capture Deal Modal...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const ctx = await browser.newContext({
      viewport: { width: 414, height: 896 },
      ignoreHTTPSErrors: true,
    });
    const page = await ctx.newPage();

    console.log('Logging in as Member B (vumikasa6@gmail.com)...');
    await page.goto(`${APP_URL}/association/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await dismissModals(page);

    await page.locator('#assoc-auth-id').fill('vumikasa6@gmail.com');
    await page.locator('#assoc-auth-password').fill('123456');
    await page.locator('button[type="submit"]').click({ force: true });
    await page.waitForTimeout(4000);
    await dismissModals(page);

    console.log('Navigating to /association/opportunities...');
    await page.goto(`${APP_URL}/association/opportunities`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    await dismissModals(page);

    // Find deal button
    const dealBtn = page.locator('button:has-text("Deal chào giá")').first();
    await dealBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    if (await dealBtn.isVisible()) {
      console.log('Found Deal chào giá button, clicking...');
      await dealBtn.click({ force: true });
      await page.waitForTimeout(2000);

      // Fill in deal modal
      const dealInputs = page.locator('div.fixed.inset-0 input[type="text"]');
      if (await dealInputs.count() > 0) {
        await dealInputs.first().fill('85000000');
      }
      const dealTextarea = page.locator('div.fixed.inset-0 textarea').first();
      if (await dealTextarea.isVisible()) {
        await dealTextarea.fill('Bên em sẵn sàng 35 xe tải và kho bãi tiêu chuẩn ISO, cam kết chiết khấu hoa hồng 20% lợi nhuận cao nhất cho quý đối tác.');
      }

      const snap2 = path.join(SCREENSHOT_DIR, 'tc_02_submit_deal_proposal.png');
      await page.screenshot({ path: snap2, fullPage: false });
      console.log('📸 Screenshot saved:', snap2);

      const confirmDealBtn = page.locator('div.fixed.inset-0 button:has-text("Gửi đề xuất Deal")').first();
      if (await confirmDealBtn.isVisible()) {
        await confirmDealBtn.click({ force: true });
        await page.waitForTimeout(3000);
        console.log('Submitted deal proposal successfully!');
      }
    } else {
      console.log('Deal button not visible, taking debug screenshot...');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'debug_opps.png'), fullPage: true });
    }

  } catch (err) {
    console.error('Error in captureDeal:', err);
  } finally {
    await browser.close();
  }
}

captureDeal();
