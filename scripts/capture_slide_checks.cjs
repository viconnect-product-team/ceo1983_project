const playwright = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await playwright.chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const htmlPath = path.resolve('document/SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.html');
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });

  const outDir = path.resolve('C:\\Users\\vumik\\.gemini\\antigravity-ide\\brain\\b8dc03b3-10e2-4473-a7ad-8eb306b96398\\.tempmediaStorage');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const captureIndices = [0, 1, 2, 8, 14]; // Slide 1, 2, 3, 9, 15
  for (const idx of captureIndices) {
    await page.evaluate((i) => {
      renderSlide(i);
    }, idx);
    await page.waitForTimeout(500);
    const p = path.join(outDir, `slide_check_v85_${idx + 1}.png`);
    const viewport = await page.$('.slide-viewport');
    if (viewport) {
      await viewport.screenshot({ path: p });
      console.log('Saved:', p);
    }
  }
  await browser.close();
  console.log('Capture complete!');
})();
