/**
 * BUILD_ALL_4_POSTERS_AND_SLIDES_PDF.CJS
 * 
 * Thực thi toàn bộ tiến trình render 4 Poster Ultra-HD và Bộ Slide PDF 16:9 siêu nét.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const postersGen = require('./generate_4_posters_and_hd_slides.cjs');
const slidesGen = require('./generate_hd_presentation_slides.cjs');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_DIR = path.join(ROOT_DIR, 'document');
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps/ceo1983_app_fe/public/docs');

(async () => {
  console.log('=============================================================================');
  console.log('🚀 BẮT ĐẦU XUẤT BẢN 4 POSTER TÁCH BIỆT & BỘ SLIDE HỆ SINH THÁI CEO 1983 SIÊU NÉT');
  console.log('=============================================================================');

  // 1. Tạo các file HTML Poster
  console.log('\n>>> [1/4] Tạo các file HTML Poster...');
  const poster1Html = postersGen.generatePoster01Html();
  const poster2Html = postersGen.generatePoster02Html();
  const poster3Html = postersGen.generatePoster03Html();
  const poster4Html = postersGen.generatePoster04Html();
  const poster4in1Html = postersGen.generatePoster4in1Html();

  const p1Path = path.join(DOC_DIR, 'POSTER_01_APP_TONG_QUAN.html');
  const p2Path = path.join(DOC_DIR, 'POSTER_02_APP_DAC_QUYEN.html');
  const p3Path = path.join(DOC_DIR, 'POSTER_03_CRM_TONG_QUAN.html');
  const p4Path = path.join(DOC_DIR, 'POSTER_04_CRM_DIEU_HANH.html');
  const p4in1Path = path.join(DOC_DIR, 'POSTER_4IN1_HE_SINH_THAI_CEO1983.html');

  fs.writeFileSync(p1Path, poster1Html, 'utf8');
  fs.writeFileSync(p2Path, poster2Html, 'utf8');
  fs.writeFileSync(p3Path, poster3Html, 'utf8');
  fs.writeFileSync(p4Path, poster4Html, 'utf8');
  fs.writeFileSync(p4in1Path, poster4in1Html, 'utf8');
  console.log('✓ Đã ghi 5 file HTML Poster vào document/');

  // 2. Tạo file HTML Slide Deck
  console.log('\n>>> [2/4] Tạo file HTML Slide Deck...');
  const slideHtml = slidesGen.generateHdSlideDeckHtml();
  const slideHtmlPath = path.join(DOC_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.html');
  fs.writeFileSync(slideHtmlPath, slideHtml, 'utf8');
  console.log('✓ Đã ghi file HTML Slide Deck:', slideHtmlPath);

  // 3. Khởi động Playwright Edge render Ultra-HD
  console.log('\n>>> [3/4] Khởi động trình duyệt Edge Playwright render PDF và PNG siêu nét...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const posterConfigs = [
    { name: 'POSTER_01_APP_TONG_QUAN', htmlPath: p1Path, title: 'Poster 1 - App Tổng Quan' },
    { name: 'POSTER_02_APP_DAC_QUYEN', htmlPath: p2Path, title: 'Poster 2 - App Đặc Quyền' },
    { name: 'POSTER_03_CRM_TONG_QUAN', htmlPath: p3Path, title: 'Poster 3 - CRM Tổng Quan' },
    { name: 'POSTER_04_CRM_DIEU_HANH', htmlPath: p4Path, title: 'Poster 4 - CRM Điều Hành' },
  ];

  // Render từng Poster độc lập
  for (const cfg of posterConfigs) {
    console.log(`   -> Render ${cfg.title}...`);
    const page = await browser.newPage({
      viewport: { width: 1400, height: 1980 },
      deviceScaleFactor: 2.5
    });

    await page.goto('file:///' + cfg.htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1000);

    const outPdf = path.join(DOC_DIR, `${cfg.name}.pdf`);
    const outPng = path.join(DOC_DIR, `${cfg.name}.png`);

    await page.pdf({
      path: outPdf,
      width: '1400px',
      height: '1980px',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await page.screenshot({
      path: outPng,
      fullPage: true
    });

    await page.close();
    console.log(`      ✓ Hoàn tất ${cfg.name}.pdf và .png`);
  }

  // Render Bộ 4-in-1 Ghép 2x2 như ảnh gốc của người dùng
  console.log('   -> Render POSTER_4IN1_HE_SINH_THAI_CEO1983 (2800x3960)...');
  const page4in1 = await browser.newPage({
    viewport: { width: 2800, height: 3960 },
    deviceScaleFactor: 1.5
  });
  await page4in1.goto('file:///' + p4in1Path.replace(/\\/g, '/'), { waitUntil: 'networkidle', timeout: 60000 });
  await page4in1.waitForTimeout(1500);

  const out4in1Pdf = path.join(DOC_DIR, 'POSTER_4IN1_HE_SINH_THAI_CEO1983.pdf');
  const out4in1Png = path.join(DOC_DIR, 'POSTER_4IN1_HE_SINH_THAI_CEO1983.png');
  await page4in1.pdf({
    path: out4in1Pdf,
    width: '2800px',
    height: '3960px',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await page4in1.screenshot({
    path: out4in1Png,
    fullPage: true
  });
  await page4in1.close();
  console.log('      ✓ Hoàn tất POSTER_4IN1_HE_SINH_THAI_CEO1983.pdf và .png');

  // Render File gộp cả 4 Poster thành 1 tập sách 4 trang PDF (BO_4_POSTER_HE_SINH_THAI_CEO1983.pdf)
  console.log('   -> Tạo file PDF gộp 4 trang BO_4_POSTER_HE_SINH_THAI_CEO1983.pdf...');
  const combinedPostersHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>BỘ 4 POSTER HỆ SINH THÁI CEO 1983</title>
  <style>
    @page { size: 1400px 1980px; margin: 0; }
    body { margin: 0; padding: 0; background: #E2E8F0; }
    .page { width: 1400px; height: 1980px; page-break-after: always; page-break-inside: avoid; overflow: hidden; }
    img { width: 1400px; height: 1980px; object-fit: cover; display: block; }
  </style>
</head>
<body>
  <div class="page"><img src="./POSTER_01_APP_TONG_QUAN.png" alt="Poster 1" /></div>
  <div class="page"><img src="./POSTER_02_APP_DAC_QUYEN.png" alt="Poster 2" /></div>
  <div class="page"><img src="./POSTER_03_CRM_TONG_QUAN.png" alt="Poster 3" /></div>
  <div class="page"><img src="./POSTER_04_CRM_DIEU_HANH.png" alt="Poster 4" /></div>
</body>
</html>`;
  const combinedPostersPath = path.join(DOC_DIR, 'temp_combined_posters.html');
  fs.writeFileSync(combinedPostersPath, combinedPostersHtml, 'utf8');

  const pageCombined = await browser.newPage({
    viewport: { width: 1400, height: 1980 },
    deviceScaleFactor: 2.0
  });
  await pageCombined.goto('file:///' + combinedPostersPath.replace(/\\/g, '/'), { waitUntil: 'networkidle', timeout: 60000 });
  await pageCombined.waitForTimeout(1500);

  const outCombinedPdf = path.join(DOC_DIR, 'BO_4_POSTER_HE_SINH_THAI_CEO1983.pdf');
  await pageCombined.pdf({
    path: outCombinedPdf,
    width: '1400px',
    height: '1980px',
    printBackground: true,
    preferCSSPageSize: true,
    pageRanges: '1-4',
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await pageCombined.close();
  if (fs.existsSync(combinedPostersPath)) fs.unlinkSync(combinedPostersPath);
  console.log('      ✓ Hoàn tất BO_4_POSTER_HE_SINH_THAI_CEO1983.pdf (4 trang A3/Poster)');

  // Render Bộ Slide 15 trang PDF (16:9 Vector 1920x1080)
  console.log('\n   -> Render SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pdf (15 trang 16:9 Vector)...');
  const pageSlide = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2.0
  });
  await pageSlide.goto('file:///' + slideHtmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle', timeout: 60000 });
  await pageSlide.waitForTimeout(2000);

  const outSlidePdf = path.join(DOC_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pdf');
  await pageSlide.pdf({
    path: outSlidePdf,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    preferCSSPageSize: true,
    pageRanges: '1-15',
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await pageSlide.close();
  console.log('      ✓ Hoàn tất SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pdf');

  await browser.close();

  // 4. Đồng bộ hóa sang thư mục public docs của FE
  console.log('\n>>> [4/4] Đồng bộ hóa sang apps/ceo1983_app_fe/public/docs/...');
  const syncFiles = [
    'POSTER_01_APP_TONG_QUAN.html',
    'POSTER_01_APP_TONG_QUAN.pdf',
    'POSTER_01_APP_TONG_QUAN.png',
    'POSTER_02_APP_DAC_QUYEN.html',
    'POSTER_02_APP_DAC_QUYEN.pdf',
    'POSTER_02_APP_DAC_QUYEN.png',
    'POSTER_03_CRM_TONG_QUAN.html',
    'POSTER_03_CRM_TONG_QUAN.pdf',
    'POSTER_03_CRM_TONG_QUAN.png',
    'POSTER_04_CRM_DIEU_HANH.html',
    'POSTER_04_CRM_DIEU_HANH.pdf',
    'POSTER_04_CRM_DIEU_HANH.png',
    'POSTER_4IN1_HE_SINH_THAI_CEO1983.html',
    'POSTER_4IN1_HE_SINH_THAI_CEO1983.pdf',
    'POSTER_4IN1_HE_SINH_THAI_CEO1983.png',
    'BO_4_POSTER_HE_SINH_THAI_CEO1983.pdf',
    'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.html',
    'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pdf'
  ];

  for (const f of syncFiles) {
    const src = path.join(DOC_DIR, f);
    const dest = path.join(FE_DOCS_DIR, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  }
  console.log(`✓ Đã đồng bộ thành công ${syncFiles.length} tệp sang ${FE_DOCS_DIR}`);

  console.log('\n=============================================================================');
  console.log('🎉 XUẤT BẢN THÀNH CÔNG TOÀN BỘ 4 POSTER & BỘ SLIDE VECTOR SIÊU NÉT!');
  console.log('=============================================================================');
})();
