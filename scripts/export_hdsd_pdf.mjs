import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

console.log('>>> BẮT ĐẦU XUẤT TÀI LIỆU HDSD CEO 1983 SANG ĐỊNH DẠNG PDF (CHẨN A4 IN ẤN)...');

const htmlPath = path.resolve('docs/training/HDSD_HE_THONG_CEO1983_CHUAN_HOA.html');
const outputPdfDoc = path.resolve('document/HDSD_HE_THONG_CEO1983_CHUAN_HOA.pdf');
const outputPdfDocs = path.resolve('docs/training/HDSD_HE_THONG_CEO1983_CHUAN_HOA.pdf');
const outputPdfFe = path.resolve('apps/ceo1983_app_fe/public/docs/HDSD_HE_THONG_CEO1983_CHUAN_HOA.pdf');

// Đảm bảo thư mục đích tồn tại
[path.dirname(outputPdfDoc), path.dirname(outputPdfDocs), path.dirname(outputPdfFe)].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Set viewport chuẩn màn hình lớn để load đầy đủ tài nguyên
  await page.setViewportSize({ width: 1440, height: 1800 });

  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  console.log('Đang nạp tài liệu từ:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 120000 });

  // Đợi font chữ nạp xong
  console.log('Đang đợi toàn bộ Web Fonts nạp hoàn tất...');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  // Đợi toàn bộ 38 ảnh nạp xong
  console.log('Đang kiểm tra và đợi toàn bộ ảnh chụp màn hình sẵn sàng...');
  await page.evaluate(async () => {
    const selectors = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      selectors.map(img => {
        if (img.complete) return;
        return new Promise((resolve, reject) => {
          img.addEventListener('load', resolve);
          img.addEventListener('error', resolve); // Tránh bị treo nếu có lỗi
        });
      })
    );
  });

  // Tạm nghỉ 1.5 giây để đảm bảo layout và CSS print ổn định
  await page.waitForTimeout(1500);

  console.log('Đang tiến hành kết xuất PDF chuẩn in ấn A4...');
  await page.pdf({
    path: outputPdfDoc,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false
  });

  await browser.close();

  // Copy sang các thư mục docs/ và public/docs/
  fs.copyFileSync(outputPdfDoc, outputPdfDocs);
  fs.copyFileSync(outputPdfDoc, outputPdfFe);

  const stats = fs.statSync(outputPdfDoc);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`>>> XUẤT PDF THÀNH CÔNG RỰC RỠ!`);
  console.log(` - File chính: ${outputPdfDoc} (${sizeMb} MB)`);
  console.log(` - Bản sao chép 1: ${outputPdfDocs}`);
  console.log(` - Bản sao chép 2: ${outputPdfFe}`);
})();
