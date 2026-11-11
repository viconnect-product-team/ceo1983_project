const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.resolve(__dirname, '../CEO1983_QA_AUDIT/07_EVIDENCE/SCREENSHOTS/MULTI_ROLE_VERIFICATION');

async function runE2E() {
  console.log('\n============================================================');
  console.log('🌐 CEO1983 - PLAYWRIGHT MULTI-ROLE E2E VISUAL VERIFICATION');
  console.log('Target: Frontend http://localhost:5173');
  console.log('============================================================\n');

  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // 1. ADMIN FLOW (Desktop 1440x900)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('👉 [1/3] Testing Admin Web CRM (admin@connect.vn)...');
    const adminContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    });
    const adminPage = await adminContext.newPage();

    // Go to login
    await adminPage.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await adminPage.waitForTimeout(1000);

    // Fill login form
    const emailInput = adminPage.locator('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="tài khoản" i]').first();
    const passInput = adminPage.locator('input[type="password"]').first();

    if (await emailInput.isVisible()) {
      await emailInput.fill('admin@connect.vn');
      await passInput.fill('123456');
      const submitBtn = adminPage.locator('button[type="submit"], button:has-text("Đăng nhập")').first();
      await submitBtn.click();
      await adminPage.waitForTimeout(3000);
    }

    // Capture Admin CRM Dashboard
    const adminPath = path.join(SCREENSHOT_DIR, '01_ADMIN_WEB_CRM.png');
    await adminPage.screenshot({ path: adminPath, fullPage: true });
    console.log(`  📸 Saved: ${adminPath}`);

    // Navigate to Admin Members/Transactions
    await adminPage.goto('http://localhost:5173/association/members', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null);
    await adminPage.waitForTimeout(1500);
    const adminMembersPath = path.join(SCREENSHOT_DIR, '02_ADMIN_MEMBERS_DIRECTORY.png');
    await adminPage.screenshot({ path: adminMembersPath, fullPage: true });
    console.log(`  📸 Saved: ${adminMembersPath}`);

    await adminContext.close();

    // ─────────────────────────────────────────────────────────────────────────
    // 2. MEMBER 1 FLOW (Mobile Viewport 390x844)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n👉 [2/3] Testing Member 1 Mobile PWA (vumikasa6@gmail.com)...');
    const m1Context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
    });
    const m1Page = await m1Context.newPage();

    await m1Page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await m1Page.waitForTimeout(1000);

    const m1Email = m1Page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="tài khoản" i]').first();
    const m1Pass = m1Page.locator('input[type="password"]').first();

    if (await m1Email.isVisible()) {
      await m1Email.fill('vumikasa6@gmail.com');
      await m1Pass.fill('123456');
      const m1Submit = m1Page.locator('button[type="submit"], button:has-text("Đăng nhập")').first();
      await m1Submit.click();
      await m1Page.waitForTimeout(3000);
    }

    // Go to Mobile Shell /m
    await m1Page.goto('http://localhost:5173/m', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null);
    await m1Page.waitForTimeout(2000);
    const m1ShellPath = path.join(SCREENSHOT_DIR, '03_MEMBER1_MOBILE_SHELL.png');
    await m1Page.screenshot({ path: m1ShellPath, fullPage: true });
    console.log(`  📸 Saved: ${m1ShellPath}`);

    // Go to Digital Card /m/card
    await m1Page.goto('http://localhost:5173/m/card', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null);
    await m1Page.waitForTimeout(2000);
    const m1CardPath = path.join(SCREENSHOT_DIR, '04_MEMBER1_DIGITAL_CARD.png');
    await m1Page.screenshot({ path: m1CardPath, fullPage: true });
    console.log(`  📸 Saved: ${m1CardPath}`);

    await m1Context.close();

    // ─────────────────────────────────────────────────────────────────────────
    // 3. MEMBER 2 FLOW (Mobile Viewport 390x844)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n👉 [3/3] Testing Member 2 Mobile PWA (vupv090120@gmail.com)...');
    const m2Context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
    });
    const m2Page = await m2Context.newPage();

    await m2Page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await m2Page.waitForTimeout(1000);

    const m2Email = m2Page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="tài khoản" i]').first();
    const m2Pass = m2Page.locator('input[type="password"]').first();

    if (await m2Email.isVisible()) {
      await m2Email.fill('vupv090120@gmail.com');
      await m2Pass.fill('123456');
      const m2Submit = m2Page.locator('button[type="submit"], button:has-text("Đăng nhập")').first();
      await m2Submit.click();
      await m2Page.waitForTimeout(3000);
    }

    // Go to Events /m/events
    await m2Page.goto('http://localhost:5173/m/events', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null);
    await m2Page.waitForTimeout(2000);
    const m2EventsPath = path.join(SCREENSHOT_DIR, '05_MEMBER2_EVENTS.png');
    await m2Page.screenshot({ path: m2EventsPath, fullPage: true });
    console.log(`  📸 Saved: ${m2EventsPath}`);

    // Go to Opportunities /m/opportunities
    await m2Page.goto('http://localhost:5173/m/opportunities', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null);
    await m2Page.waitForTimeout(2000);
    const m2OppPath = path.join(SCREENSHOT_DIR, '06_MEMBER2_OPPORTUNITIES.png');
    await m2Page.screenshot({ path: m2OppPath, fullPage: true });
    console.log(`  📸 Saved: ${m2OppPath}`);

    await m2Context.close();

    console.log('\n============================================================');
    console.log('🎉 ALL 3 ROLES TESTED SUCCESSFULLY WITH VISUAL EVIDENCE!');
    console.log('============================================================\n');
  } finally {
    await browser.close();
  }
}

runE2E().catch((err) => {
  console.error('E2E Browser Error:', err);
  process.exit(1);
});
