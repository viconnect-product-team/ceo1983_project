const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DOC_DIR = path.resolve(__dirname, '../document');
const FE_DOCS_DIR = path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs');
const BG_DIR = path.join(DOC_DIR, 'images/backgrounds');

function getBase64Image(filePath) {
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'svg' ? 'image/svg+xml' : 'image/png';
    const data = fs.readFileSync(filePath).toString('base64');
    return `data:${mime};base64,${data}`;
  }
  return '';
}

const BG_SKYLINE_NIGHT = getBase64Image(path.join(BG_DIR, '08_skyline_night.jpg'));
const BG_OPERATIONS = getBase64Image(path.join(BG_DIR, '04_operations.jpg'));
const BG_BANQUET_GALA = getBase64Image(path.join(BG_DIR, '07_banquet_gala.jpg'));

// Đọc script v6 hiện tại và update slide 1
const v6ScriptPath = path.join(__dirname, 'generate_all_perfect_v6.js');
let v6Content = fs.readFileSync(v6ScriptPath, 'utf8');

// Thay đổi định nghĩa ảnh nền trong v6
const blendStyleAdd = `
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
      background-image: url('${BG_SKYLINE_NIGHT}');
      background-size: cover;
      background-position: center left;
      mask-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%);
      opacity: 0.65;
      filter: contrast(130%) saturate(120%);
    }
    .bg-slide-c {
      position: absolute;
      inset: 0;
      background-image: url('${BG_OPERATIONS}');
      background-size: cover;
      background-position: center;
      mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%);
      opacity: 0.60;
      filter: contrast(125%) saturate(115%);
    }
    .bg-slide-r {
      position: absolute;
      inset-y: 0;
      right: 0;
      width: 55%;
      background-image: url('${BG_BANQUET_GALA}');
      background-size: cover;
      background-position: center right;
      mask-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%);
      opacity: 0.65;
      filter: contrast(130%) saturate(120%);
    }
    .bg-slide-mask {
      position: absolute;
      inset: 0;
      background: radial-gradient(130% 90% at 50% 30%, rgba(8, 36, 99, 0.4) 0%, rgba(2, 10, 30, 0.75) 60%, rgba(1, 6, 20, 0.95) 100%);
      mix-blend-mode: multiply;
    }
`;

v6Content = v6Content.replace('</style>', blendStyleAdd + '\n</style>');

// Thay thế thẻ img của Slide 1
const oldImg = '<img src="${BG_SKYLINE}" class="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-[0.5px]" alt="Skyline" />';
const newImgDiv = `
            <div class="bg-blend-slide">
              <div class="bg-slide-l"></div>
              <div class="bg-slide-c"></div>
              <div class="bg-slide-r"></div>
              <div class="bg-slide-mask"></div>
            </div>`;

v6Content = v6Content.replace(oldImg, newImgDiv);

const oldImgPrint = '<img src="${BG_SKYLINE}" class="absolute inset-0 w-full h-full object-cover opacity-25" alt="Skyline" />';
v6Content = v6Content.replace(oldImgPrint, newImgDiv);

fs.writeFileSync(v6ScriptPath, v6Content, 'utf8');

// Chạy lại v6 để sinh PDF slide mới
require('./generate_all_perfect_v6.js');
