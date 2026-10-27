/**
 * BUILD_ALL_V2.CJS
 * 
 * Script thực thi toàn diện:
 * 1. Render 3 Poster Showcase mới theo yêu cầu 2:
 *    - POSTER_SHOWCASE_APP_PANORAMA: Dàn 4 iPhone nằm ngang (chuẩn theo Ảnh 1)
 *    - POSTER_SHOWCASE_CRM_PANORAMA: Dàn 3 màn hình Desktop CRM nằm ngang (chuẩn theo Ảnh 2)
 *    - POSTER_MASTER_HE_SINH_THAI_CEO1983: Poster Master khổ đứng kết hợp cả CRM và App với nền nửa xanh nửa trắng.
 * 2. Render Bộ Slide 15 trang 16:9 mới theo yêu cầu 1:
 *    - Nền nửa xanh nửa trắng (Corporate Dual-Tone Split)
 *    - Ảnh background chân thực (Skyline Hà Nội, Hội nghị Dạ tiệc Gala, Phòng họp)
 *    - Giao diện các chức năng CRM hiển thị to rõ toàn diện, không bị cắt xén hay che mờ.
 * 3. Đồng bộ toàn bộ sang apps/ceo1983_app_fe/public/docs/
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const showcaseGen = require('./generate_showcase_posters.cjs');
const slidesGen = require('./generate_hd_presentation_slides.cjs');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_DIR = path.join(ROOT_DIR, 'document');
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps/ceo1983_app_fe/public/docs');

[DOC_DIR, FE_DOCS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

(async () => {
  console.log('=============================================================================');
  console.log('🚀 BẮT ĐẦU XUẤT BẢN POSTER SHOWCASE MỚI & BỘ SLIDE NỬA XANH NỬA TRẮNG SIÊU NÉT');
  console.log('=============================================================================');

  // 1. Ghi các file HTML Poster Showcase mới
  console.log('\n>>> [1/4] Tạo các file HTML Poster Showcase...');
  const appPanoHtml = showcaseGen.generateShowcaseAppPanoramaHtml();
  const crmPanoHtml = showcaseGen.generateShowcaseCrmPanoramaHtml();
  const masterHtml = showcaseGen.generatePosterMasterAllInOneHtml();

  const pAppPanoPath = path.join(DOC_DIR, 'POSTER_SHOWCASE_APP_PANORAMA.html');
  const pCrmPanoPath = path.join(DOC_DIR, 'POSTER_SHOWCASE_CRM_PANORAMA.html');
  const pMasterPath = path.join(DOC_DIR, 'POSTER_MASTER_HE_SINH_THAI_CEO1983.html');

  fs.writeFileSync(pAppPanoPath, appPanoHtml, 'utf8');
  fs.writeFileSync(pCrmPanoPath, crmPanoHtml, 'utf8');
  fs.writeFileSync(pMasterPath, masterHtml, 'utf8');
  console.log('✓ Đã ghi 3 file HTML Poster Showcase vào document/');

  // 2. Khởi động Playwright Edge render các Poster Showcase ra PNG và PDF
  console.log('\n>>> [2/4] Khởi động Edge Playwright render Poster Showcase...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Render POSTER_SHOWCASE_APP_PANORAMA (2560x1440)
  console.log('   -> Render POSTER_SHOWCASE_APP_PANORAMA (Dàn 4 iPhone kiểu Ảnh 1)...');
  const pageAppPano = await browser.newPage({
    viewport: { width: 2560, height: 1440 },
    deviceScaleFactor: 2.0
  });
  await pageAppPano.goto('file:///' + pAppPanoPath.replace(/\\/g, '/'), { waitUntil: 'networkidle', timeout: 60000 });
  await pageAppPano.waitForTimeout(1500);

  const outAppPanoPdf = path.join(DOC_DIR, 'POSTER_SHOWCASE_APP_PANORAMA.pdf');
  const outAppPanoPng = path.join(DOC_DIR, 'POSTER_SHOWCASE_APP_PANORAMA.png');
  await pageAppPano.pdf({
    path: outAppPanoPdf,
    width: '2560px',
    height: '1440px',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await pageAppPano.screenshot({ path: outAppPanoPng, fullPage: true });
  await pageAppPano.close();
  console.log('      ✓ Hoàn tất POSTER_SHOWCASE_APP_PANORAMA.pdf và .png');

  // Render POSTER_SHOWCASE_CRM_PANORAMA (2560x1440)
  console.log('   -> Render POSTER_SHOWCASE_CRM_PANORAMA (Dàn 3 màn hình Desktop kiểu Ảnh 2)...');
  const pageCrmPano = await browser.newPage({
    viewport: { width: 2560, height: 1440 },
    deviceScaleFactor: 2.0
  });
  await pageCrmPano.goto('file:///' + pCrmPanoPath.replace(/\\/g, '/'), { waitUntil: 'networkidle', timeout: 60000 });
  await pageCrmPano.waitForTimeout(1500);

  const outCrmPanoPdf = path.join(DOC_DIR, 'POSTER_SHOWCASE_CRM_PANORAMA.pdf');
  const outCrmPanoPng = path.join(DOC_DIR, 'POSTER_SHOWCASE_CRM_PANORAMA.png');
  await pageCrmPano.pdf({
    path: outCrmPanoPdf,
    width: '2560px',
    height: '1440px',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await pageCrmPano.screenshot({ path: outCrmPanoPng, fullPage: true });
  await pageCrmPano.close();
  console.log('      ✓ Hoàn tất POSTER_SHOWCASE_CRM_PANORAMA.pdf và .png');

  // Render POSTER_MASTER_HE_SINH_THAI_CEO1983 (1400x1980)
  console.log('   -> Render POSTER_MASTER_HE_SINH_THAI_CEO1983 (Khổ đứng A3/A2)...');
  const pageMaster = await browser.newPage({
    viewport: { width: 1400, height: 1980 },
    deviceScaleFactor: 2.5
  });
  await pageMaster.goto('file:///' + pMasterPath.replace(/\\/g, '/'), { waitUntil: 'networkidle', timeout: 60000 });
  await pageMaster.waitForTimeout(1500);

  const outMasterPdf = path.join(DOC_DIR, 'POSTER_MASTER_HE_SINH_THAI_CEO1983.pdf');
  const outMasterPng = path.join(DOC_DIR, 'POSTER_MASTER_HE_SINH_THAI_CEO1983.png');
  await pageMaster.pdf({
    path: outMasterPdf,
    width: '1400px',
    height: '1980px',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await pageMaster.screenshot({ path: outMasterPng, fullPage: true });
  await pageMaster.close();
  console.log('      ✓ Hoàn tất POSTER_MASTER_HE_SINH_THAI_CEO1983.pdf và .png');

  // 3. Tạo và Render Bộ Slide 15 trang 16:9 mới (Nền nửa xanh nửa trắng)
  console.log('\n>>> [3/4] Render Bộ Slide 15 trang 16:9 mới (Nền nửa xanh nửa trắng, CRM to rõ)...');
  const slideHtml = slidesGen.generateHdSlideDeckHtml();
  const slideHtmlPath = path.join(DOC_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.html');
  fs.writeFileSync(slideHtmlPath, slideHtml, 'utf8');

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

  // 4. Đồng bộ hóa toàn bộ sang apps/ceo1983_app_fe/public/docs/
  console.log('\n>>> [4/4] Đồng bộ hóa tài liệu sang apps/ceo1983_app_fe/public/docs/...');
  const filesToSync = [
    'POSTER_SHOWCASE_APP_PANORAMA.html',
    'POSTER_SHOWCASE_APP_PANORAMA.pdf',
    'POSTER_SHOWCASE_APP_PANORAMA.png',
    'POSTER_SHOWCASE_CRM_PANORAMA.html',
    'POSTER_SHOWCASE_CRM_PANORAMA.pdf',
    'POSTER_SHOWCASE_CRM_PANORAMA.png',
    'POSTER_MASTER_HE_SINH_THAI_CEO1983.html',
    'POSTER_MASTER_HE_SINH_THAI_CEO1983.pdf',
    'POSTER_MASTER_HE_SINH_THAI_CEO1983.png',
    'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.html',
    'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pdf'
  ];

  let syncedCount = 0;
  filesToSync.forEach(file => {
    const src = path.join(DOC_DIR, file);
    const dest = path.join(FE_DOCS_DIR, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      syncedCount++;
    }
  });

  console.log(`✓ Đã đồng bộ thành công ${syncedCount} tệp mới sang FE public docs.`);
  console.log('=============================================================================');
  console.log('🎉 XUẤT BẢN THÀNH CÔNG TOÀN DIỆN CẢ 2 YÊU CẦU CỦA NGƯỜI DÙNG!');
  console.log('=============================================================================');
})();
