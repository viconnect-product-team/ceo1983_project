import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('D:/download/node_modules/playwright');
import fs from 'fs';
import path from 'path';

async function main() {
  const screenshotsDir = path.resolve('docs/training/screenshots');
  const tempHtmlPath = path.resolve('scratch/temp_success_email.html');
  fs.mkdirSync(path.dirname(tempHtmlPath), { recursive: true });

  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Xác nhận Đăng ký Tham dự Thành công | CLB Doanh nhân CEO 1983</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-[#F0F4F9] text-slate-800 min-h-screen py-10 px-4 flex items-center justify-center">
  <div class="max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
    <!-- Header Gradient -->
    <div class="bg-gradient-to-r from-[#002B70] via-[#003B95] to-[#0A4DB0] px-8 py-8 text-white text-center relative overflow-hidden">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-400 text-[#001D4A] rounded-full text-xs font-black uppercase tracking-wider mb-3 shadow-md">
        <span>✦</span> ĐĂNG KÝ THAM DỰ SỰ KIỆN THÀNH CÔNG <span>✦</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-black text-white px-2 leading-tight">
        DẠ TIỆC GALA KẾT NỐI DOANH NHÂN CEO 1983
      </h1>
      <p class="text-blue-100 text-sm mt-2 flex items-center justify-center gap-2 font-medium">
        <span>📅 20:00 - 23:00, Ngày 26/10/2026</span>
        <span>·</span>
        <span>📍 Grand Ballroom, Khách sạn Melia Hà Nội</span>
      </p>
    </div>

    <div class="p-8 sm:p-10 space-y-6">
      <!-- Lucky Draw Box -->
      <div class="bg-gradient-to-br from-amber-500/15 via-amber-400/10 to-orange-500/15 border-2 border-amber-400/80 rounded-2xl p-6 text-center shadow-sm">
        <span class="text-xs font-black text-amber-800 uppercase tracking-widest block mb-1">
          🎉 MÃ SỐ QUAY THƯỞNG MAY MẮN (LUCKY DRAW) 🎉
        </span>
        <div class="text-5xl font-black text-amber-600 tracking-wider font-mono my-2 drop-shadow-sm">
          #8388
        </div>
        <p class="text-xs text-amber-900 font-medium">
          Quý Đại biểu vui lòng giữ mã số này để tham gia bốc thăm trúng thưởng các phần quà giá trị từ Nhà tài trợ tại Dạ tiệc!
        </p>
      </div>

      <!-- Email Confirmation Box -->
      <div class="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 text-left flex items-start gap-4 text-xs sm:text-sm text-emerald-950 shadow-xs">
        <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0 mt-0.5">
          ✓
        </div>
        <div class="space-y-1.5 flex-1">
          <div class="font-extrabold text-emerald-900 text-sm sm:text-base">
            Vé điện tử & Thông báo xác nhận đã được gửi thành công!
          </div>
          <p class="text-emerald-800 leading-relaxed">
            Hệ thống CRM CEO 1983 đã gửi thư xác nhận kèm mã vé điện tử QR Code tới địa chỉ:
            <span class="font-mono font-bold text-blue-800 underline ml-1">tuananh.ceo@vietants.vn</span>
          </p>
          <p class="text-slate-500 text-xs">
            * Vui lòng kiểm tra Hộp thư đến (Inbox) hoặc mục Thư rác/Quảng cáo nếu chưa nhận được trong 2 phút.
          </p>
        </div>
      </div>

      <!-- E-Ticket Card -->
      <div class="rounded-2xl border-2 border-slate-200 bg-slate-50/80 p-6 space-y-5">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div class="flex items-center gap-2 text-sm font-black text-[#003B95]">
            <span>🎟️</span> THẺ VÉ ĐIỆN TỬ CHECK-IN (E-TICKET GATEWAY)
          </div>
          <span class="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-extrabold">
            Vé Hợp Lệ · Đã Kích Hoạt
          </span>
        </div>

        <div class="flex flex-col sm:flex-row items-center gap-6">
          <!-- QR Code -->
          <div class="text-center shrink-0">
            <div class="w-44 h-44 bg-white p-3 rounded-2xl border-2 border-[#003B95] shadow-md flex items-center justify-center">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=GUEST-CEO1983-8899" alt="QR Code" class="w-full h-full object-contain">
            </div>
            <div class="text-xs font-mono font-bold text-slate-700 mt-2">
              MÃ VÉ: <span class="text-[#003B95] font-black text-sm">GUEST-8899</span>
            </div>
          </div>

          <!-- Ticket Info Details -->
          <div class="flex-1 w-full space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
            <div class="flex justify-between border-b border-slate-100 pb-2">
              <span class="text-slate-500">Đại biểu:</span>
              <span class="font-bold text-slate-800 text-sm">Nguyễn Tuấn Anh</span>
            </div>
            <div class="flex justify-between border-b border-slate-100 pb-2">
              <span class="text-slate-500">Đơn vị:</span>
              <span class="font-semibold text-slate-800">Tập đoàn Công nghệ Ánh Dương</span>
            </div>
            <div class="flex justify-between border-b border-slate-100 pb-2">
              <span class="text-slate-500">Chức vụ:</span>
              <span class="font-semibold text-slate-800">Chủ tịch HĐQT & Tổng Giám đốc</span>
            </div>
            <div class="flex justify-between border-b border-slate-100 pb-2">
              <span class="text-slate-500">Số điện thoại:</span>
              <span class="font-mono font-semibold text-slate-700">0988 66 55 44</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Phân loại chỗ:</span>
              <span class="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Ghế Khách Mời VIP (Zone A)</span>
            </div>
          </div>
        </div>

        <p class="text-[11px] text-slate-500 text-center italic">
          * Quý Đại biểu chỉ cần mở màn hình này hoặc thư mời trong email để Ban Lễ Tân quét mã QR Check-in đón tiếp tại sảnh.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 pt-2">
        <button class="flex-1 py-3 px-5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-xs flex items-center justify-center gap-2">
          <span>📥</span> Tải / Lưu Thẻ Vé Điện Tử
        </button>
        <button class="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2">
          <span>🌐</span> Về Cổng Thông Tin CLB CEO 1983
        </button>
      </div>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

  console.log('Chụp ảnh xác nhận đăng ký thành công có thông báo gửi email...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 950 },
    deviceScaleFactor: 1.5
  });

  await page.goto('file:///' + tempHtmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // Đợi tải QR code từ api.qrserver.com

  const outPath = path.join(screenshotsDir, 'crm_07_event_register_success_email.png');
  await page.screenshot({ path: outPath });
  console.log('>>> HOÀN TẤT CHỤP: crm_07_event_register_success_email.png');

  await browser.close();
  try { fs.unlinkSync(tempHtmlPath); } catch {}
}

main().catch(console.error);
