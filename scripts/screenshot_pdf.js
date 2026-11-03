const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  const pdfPath = 'file:///' + path.resolve('scripts/EVENT_VISUAL_DESIGN_CEO1983.pdf').replace(/\\/g, '/');
  console.log('Opening:', pdfPath);
  await page.goto(pdfPath, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  fs.mkdirSync('scripts/pdf_pages', { recursive: true });
  await page.screenshot({ path: 'scripts/pdf_pages/page_view.png', fullPage: false });
  console.log('Saved page_view.png');
  
  await browser.close();
}

main().catch(console.error);

