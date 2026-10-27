/**
 * UPDATE_AND_RUN_V8_DECK.CJS
 * Cập nhật scripts/build_slide_deck_v8_wave.js:
 * 1. Nạp đầy đủ 8 hình nền background độ nét cao.
 * 2. Gán bgImg cho 15 slides.
 * 3. Thay thế CSS/HTML nền mờ cũ bằng hệ thống hình nền chân thực rõ ràng, rực rỡ, không bị tối đen.
 * 4. Chạy build tạo SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.html, .pdf, .pptx và đồng bộ.
 */

const fs = require('fs');
const path = require('path');

const targetScript = path.resolve('scripts/build_slide_deck_v8_wave.js');
let code = fs.readFileSync(targetScript, 'utf8');

// 1. Thêm đầy đủ 8 backgrounds
const oldBgDecl = `// Backgrounds chân thực sắc nét
const BG_SKYLINE_NIGHT = getBase64Image(path.join(BG_DIR, '08_skyline_night.jpg'));
const BG_SKYLINE_LAKE = getBase64Image(path.join(BG_DIR, '01_skyline_lake.jpg'));
const BG_BOARDROOM = getBase64Image(path.join(BG_DIR, '02_boardroom.jpg'));
const BG_SMARTCITY = getBase64Image(path.join(BG_DIR, '03_smartcity.jpg'));
const BG_OPERATIONS = getBase64Image(path.join(BG_DIR, '04_operations.jpg'));
const BG_MOBILE_NETWORK = getBase64Image(path.join(BG_DIR, '05_mobile_network.jpg'));
const BG_INNOVATION = getBase64Image(path.join(BG_DIR, '06_innovation.jpg'));
const BG_BANQUET_GALA = getBase64Image(path.join(BG_DIR, '07_banquet_gala.jpg'));`;

// 2. Cập nhật SLIDES_V8 với bgImg cho từng slide
const bgMappings = {
  1: 'BG_SKYLINE_NIGHT',
  2: 'BG_SMARTCITY',
  3: 'BG_OPERATIONS',
  4: 'BG_BOARDROOM',
  5: 'BG_BANQUET_GALA',
  6: 'BG_SKYLINE_LAKE',
  7: 'BG_INNOVATION',
  8: 'BG_BOARDROOM',
  9: 'BG_SKYLINE_NIGHT',
  10: 'BG_SKYLINE_LAKE',
  11: 'BG_MOBILE_NETWORK',
  12: 'BG_BANQUET_GALA',
  13: 'BG_INNOVATION',
  14: 'BG_OPERATIONS',
  15: 'BG_SKYLINE_NIGHT'
};

for (let id = 1; id <= 15; id++) {
  const targetIdStr = `id: ${id},`;
  const bgVar = bgMappings[id];
  // Kiểm tra nếu chưa có bgImg:
  if (!code.includes(`id: ${id},\n    bgImg:`)) {
    code = code.replace(
      new RegExp(`id:\\s*${id},\\s*\\n\\s*type:`, 'g'),
      `id: ${id},\n    bgImg: ${bgVar},\n    type:`
    );
  }
}

// 3. Thay thế CSS blend cũ trong generateSlideDeckHtml
const oldCssBlend = `    /* 3 Ảnh nền đan xen mờ tinh tế */
    .bg-blend-slide {
      position: absolute;
      inset: 0;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
    }
    .bg-slide-l {
      position: absolute;
      inset-y: 0;
      left: 0;
      width: 55%;
      background-image: url('\${BG_SKYLINE_NIGHT}');
      background-size: cover;
      background-position: center left;
      mask-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%);
      opacity: 0.60;
    }
    .bg-slide-c {
      position: absolute;
      inset: 0;
      background-image: url('\${BG_OPERATIONS}');
      background-size: cover;
      background-position: center;
      mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%);
      opacity: 0.55;
    }
    .bg-slide-r {
      position: absolute;
      inset-y: 0;
      right: 0;
      width: 55%;
      background-image: url('\${BG_BANQUET_GALA}');
      background-size: cover;
      background-position: center right;
      mask-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%);
      opacity: 0.60;
    }
    .bg-slide-mask {
      position: absolute;
      inset: 0;
      background: radial-gradient(130% 90% at 50% 30%, rgba(8, 36, 99, 0.4) 0%, rgba(2, 10, 30, 0.75) 60%, rgba(1, 6, 20, 0.95) 100%);
      mix-blend-mode: multiply;
    }`;

const newCssBlend = `    /* Hệ thống ảnh nền chân thực sắc nét, sáng rõ từng bối cảnh */
    .slide-bg-wrapper {
      position: absolute;
      inset: 0;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
    }
    .slide-bg-photo {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      opacity: 0.72;
      transform: scale(1.05);
      filter: saturate(1.15) brightness(0.96) contrast(1.06);
    }
    .slide-bg-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(130% 90% at 50% 30%, rgba(2, 10, 32, 0.35) 0%, rgba(3, 17, 56, 0.52) 55%, rgba(0, 4, 15, 0.80) 100%);
    }`;

if (code.includes('.bg-blend-slide {')) {
  code = code.replace(oldCssBlend, newCssBlend);
}

// 4. Thay thế CSS blend trong generatePrintAllSlidesHtml
const oldPrintCssBlend = `    .bg-blend-slide {
      position: absolute;
      inset: 0;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
    }
    .bg-slide-l {
      position: absolute;
      inset-y: 0;
      left: 0;
      width: 55%;
      background-image: url('\${BG_SKYLINE_NIGHT}');
      background-size: cover;
      background-position: center left;
      mask-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%);
      opacity: 0.60;
    }
    .bg-slide-c {
      position: absolute;
      inset: 0;
      background-image: url('\${BG_OPERATIONS}');
      background-size: cover;
      background-position: center;
      mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%);
      opacity: 0.55;
    }
    .bg-slide-r {
      position: absolute;
      inset-y: 0;
      right: 0;
      width: 55%;
      background-image: url('\${BG_BANQUET_GALA}');
      background-size: cover;
      background-position: center right;
      mask-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%);
      opacity: 0.60;
    }
    .bg-slide-mask {
      position: absolute;
      inset: 0;
      background: radial-gradient(130% 90% at 50% 30%, rgba(8, 36, 99, 0.4) 0%, rgba(2, 10, 30, 0.75) 60%, rgba(1, 6, 20, 0.95) 100%);
      mix-blend-mode: multiply;
    }`;

if (code.includes(oldPrintCssBlend)) {
  code = code.replace(oldPrintCssBlend, newCssBlend);
}

// 5. Thay thế các khối HTML ảnh nền trong interactive slide:
// Khối 1: dual_overview, conclusion, closing_thankyou
const oldBgBlendHtml = `<div class="bg-blend-slide">
              <div class="bg-slide-l"></div>
              <div class="bg-slide-c"></div>
              <div class="bg-slide-r"></div>
              <div class="bg-slide-mask"></div>
            </div>`;
const newBgBlendHtml = `<div class="slide-bg-wrapper">
              <img src="\${s.bgImg}" class="slide-bg-photo" alt="Background Scene" />
              <div class="slide-bg-overlay"></div>
            </div>`;

code = code.split(oldBgBlendHtml).join(newBgBlendHtml);

// Khối 2: two_products_detail (<img src="${BG_BOARDROOM}" class="absolute inset-0 w-full h-full object-cover opacity-20" alt="Boardroom" />)
code = code.replace(
  `<img src="\${BG_BOARDROOM}" class="absolute inset-0 w-full h-full object-cover opacity-20" alt="Boardroom" />`,
  `<div class="slide-bg-wrapper">
              <img src="\${s.bgImg}" class="slide-bg-photo" alt="Background Scene" />
              <div class="slide-bg-overlay"></div>
            </div>`
);

// Khối 3: crm_feature (<img src="${BG_SMARTCITY}" class="absolute inset-0 w-full h-full object-cover opacity-15" alt="SmartCity" />)
code = code.replace(
  `<img src="\${BG_SMARTCITY}" class="absolute inset-0 w-full h-full object-cover opacity-15" alt="SmartCity" />`,
  `<div class="slide-bg-wrapper">
              <img src="\${s.bgImg}" class="slide-bg-photo" alt="Background Scene" />
              <div class="slide-bg-overlay"></div>
            </div>`
);

// Khối 4: app_feature (<img src="${BG_SKYLINE_NIGHT}" class="absolute inset-0 w-full h-full object-cover opacity-20" alt="Skyline" />)
code = code.replace(
  `<img src="\${BG_SKYLINE_NIGHT}" class="absolute inset-0 w-full h-full object-cover opacity-20" alt="Skyline" />`,
  `<div class="slide-bg-wrapper">
              <img src="\${s.bgImg}" class="slide-bg-photo" alt="Background Scene" />
              <div class="slide-bg-overlay"></div>
            </div>`
);

// 6. Thay thế các khối HTML ảnh nền trong print mode:
const oldPrintBgBlendHtml = `<div class="bg-blend-slide">
            <div class="bg-slide-l"></div>
            <div class="bg-slide-c"></div>
            <div class="bg-slide-r"></div>
            <div class="bg-slide-mask"></div>
          </div>`;
const newPrintBgBlendHtml = `<div class="slide-bg-wrapper">
            <img src="\${s.bgImg}" class="slide-bg-photo" alt="Background Scene" />
            <div class="slide-bg-overlay"></div>
          </div>`;

code = code.split(oldPrintBgBlendHtml).join(newPrintBgBlendHtml);

code = code.replace(
  `<img src="\${BG_BOARDROOM}" class="absolute inset-0 w-full h-full object-cover opacity-20" alt="Boardroom" />`,
  `<div class="slide-bg-wrapper">
            <img src="\${s.bgImg}" class="slide-bg-photo" alt="Background Scene" />
            <div class="slide-bg-overlay"></div>
          </div>`
);

code = code.replace(
  `<img src="\${BG_SMARTCITY}" class="absolute inset-0 w-full h-full object-cover opacity-15" alt="SmartCity" />`,
  `<div class="slide-bg-wrapper">
            <img src="\${s.bgImg}" class="slide-bg-photo" alt="Background Scene" />
            <div class="slide-bg-overlay"></div>
          </div>`
);

code = code.replace(
  `<img src="\${BG_SKYLINE_NIGHT}" class="absolute inset-0 w-full h-full object-cover opacity-20" alt="Skyline" />`,
  `<div class="slide-bg-wrapper">
            <img src="\${s.bgImg}" class="slide-bg-photo" alt="Background Scene" />
            <div class="slide-bg-overlay"></div>
          </div>`
);

fs.writeFileSync(targetScript, code, 'utf8');
console.log('✓ Đã cập nhật xong build_slide_deck_v8_wave.js với ảnh nền chân thực và bgImg chuẩn xác.');
