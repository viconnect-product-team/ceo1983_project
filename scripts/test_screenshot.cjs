const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ 
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true 
  });
  const page = await browser.newPage({ viewport: { width: 1056, height: 594 } });
  const htmlFile = 'file:///' + path.resolve('document/SLIDE_BAO_CAO_TIEP_THU_Y_KIEN_VA_GIAI_PHAP_VICONNECT.html').replace(/\\/g, '/');
  await page.goto(htmlFile, { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  
  const slides = await page.$$('.slide');
  console.log('Found slides:', slides.length);
  for (let i = 0; i < slides.length; i++) {
    const outPath = path.resolve('C:/Users/vumik/.gemini/antigravity-ide/brain/bf549395-b684-4fae-a721-fbb20b80cb0c/scratch/slide_' + (i + 1) + '.png');
    await slides[i].screenshot({ path: outPath });
    console.log('Saved slide ' + (i + 1) + ' to ' + outPath);
  }
  await browser.close();
  console.log('Done screenshots!');
})();
