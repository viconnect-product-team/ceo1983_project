const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const pptxgen = require('pptxgenjs');
const JSZip = require('jszip');

const DOC_DIR = path.resolve(__dirname, '../document');
const NOTEBOOK_DIR = path.resolve(DOC_DIR, 'notebooklm');

if (!fs.existsSync(NOTEBOOK_DIR)) fs.mkdirSync(NOTEBOOK_DIR, { recursive: true });

// 15 items data structured for executive readability
const groupsData = [
  {
    code: 'A',
    title: 'GIAO DIỆN & THẺ HỘI VIÊN',
    desc: 'Đơn giản hóa trải nghiệm, tập trung giá trị cốt lõi & bảo mật danh tính doanh nhân',
    items: [
      {
        stt: 1,
        title: 'Trang chủ ứng dụng',
        issue: 'Trang chủ có 8 ô tính năng nhanh, dàn trải, gây ngợp khi sử dụng.',
        solution: 'Rút gọn 4 tính năng cốt lõi (Sự kiện, Danh bạ, Cơ hội, Mạng lưới) + Cho phép tự chọn phím tắt cá nhân hóa.',
        status: '🟢 ĐÃ SẴN SÀNG',
        statusType: 'READY',
        deadline: 'Nền tảng sẵn có (Đợt 1)'
      },
      {
        stt: 2,
        title: 'Thẻ hội viên thông minh',
        issue: 'Chưa có tùy chọn ẩn/hiện email, số điện thoại để bảo vệ quyền riêng tư.',
        solution: 'Bổ sung công tắc Ẩn/Hiện SĐT & Email độc lập; tự động gắn huy hiệu xác thực bảo mật khi chia sẻ đối ngoại.',
        status: '🟢 ĐÃ SẴN SÀNG',
        statusType: 'READY',
        deadline: 'Nền tảng sẵn có (Đợt 1)'
      },
      {
        stt: 3,
        title: 'Đặc quyền & Gian hàng số',
        issue: 'Đang nằm chung tính năng nhanh, chưa có không gian quyền lợi và gian hàng riêng.',
        solution: 'Tách phân hệ Đặc Quyền chuyên biệt + Xây dựng "Gian Hàng Doanh Nghiệp Số" độc quyền (5 sản phẩm tiêu biểu / MST).',
        status: '🟡 ĐANG TRIỂN KHAI',
        statusType: 'IN_PROGRESS',
        deadline: 'Hoàn thiện trước 05/11/2026'
      }
    ]
  },
  {
    code: 'B',
    title: 'XÚC TIẾN THƯƠNG MẠI B2B',
    desc: 'Chuẩn hóa hạn mức, phân luồng giao thương 2 chiều & ghi nhận doanh số thực tế',
    items: [
      {
        stt: 4,
        title: 'Hạn mức Sàn B2B',
        issue: 'Chưa giới hạn sản phẩm mỗi doanh nghiệp, nguy cơ spam và quá tải hạ tầng.',
        solution: 'Áp dụng hạn mức chuẩn tối đa 5 sản phẩm/doanh nghiệp; tối ưu 80% hạ tầng lưu trữ với công nghệ nén ảnh WebP.',
        status: '🟡 ĐANG TRIỂN KHAI',
        statusType: 'IN_PROGRESS',
        deadline: 'Hoàn thiện trước 05/11/2026'
      },
      {
        stt: 5,
        title: 'Bộ lọc Cơ hội hợp tác',
        issue: 'Khó tìm đúng đối tác theo ngành nghề; thông tin cơ hội dàn trải.',
        solution: 'Phân luồng 2 chiều (🛒 Cần Mua / 📦 Cần Bán) + Tích hợp bộ lọc 10 ngành nghề trọng điểm HanoiBA.',
        status: '🟡 ĐANG TRIỂN KHAI',
        statusType: 'IN_PROGRESS',
        deadline: 'Hoàn thiện trước 05/11/2026'
      },
      {
        stt: 6,
        title: 'Giới thiệu hội viên (Voucher)',
        issue: 'Chưa có cơ chế giới thiệu văn minh; mục quảng cáo menu CRM chưa phù hợp.',
        solution: 'Cấp mã mời / QR định danh riêng; tặng Voucher đặc quyền VIP khi giới thiệu thành công (tuyệt đối không làm affiliate).',
        status: '🟡 ĐANG TRIỂN KHAI',
        statusType: 'IN_PROGRESS',
        deadline: 'Hoàn thiện trước 05/11/2026'
      },
      {
        stt: 7,
        title: 'Ghi nhận doanh số B2B',
        issue: 'Chưa tách Cơ hội với Kết nối có doanh thu; chưa đo được hiệu quả giao thương.',
        solution: 'Tách quy trình 2 bước (Cơ hội -> Kết nối 1-1); xác thực hợp đồng chéo 2 bên để đo lường chính xác dòng tiền CLB.',
        status: '🟡 ĐANG TRIỂN KHAI',
        statusType: 'IN_PROGRESS',
        deadline: 'Hoàn thiện trước 05/11/2026'
      }
    ]
  },
  {
    code: 'C',
    title: 'SỰ KIỆN & SINH HOẠT',
    desc: 'Vé điện tử tự động đa kênh, Check-in gắn lợi ích & phễu Onboarding chuyên nghiệp',
    items: [
      {
        stt: 8,
        title: 'Vé điện tử & Thanh toán',
        issue: 'Vé chỉ gửi qua email dễ rơi spam; chưa kết nối Zalo OA và VNPAY.',
        solution: 'Vé QR gắn mã chống spam + Tự động gửi thông báo vé qua Zalo OA (ZNS) + Sẵn sàng tích hợp cổng VietQR & VNPAY.',
        status: '🔵 KẾ HOẠCH TIẾP THEO',
        statusType: 'PLANNED',
        deadline: 'Phối hợp kết nối trước 10/11/2026'
      },
      {
        stt: 9,
        title: 'Check-in gắn 2 dòng lợi ích',
        issue: 'Quét check-in chưa tạo động lực và giá trị thiết thực cho hội viên tham dự.',
        solution: 'Dòng 1: Mở khóa danh bạ hội trường để kết nối tức thì; Dòng 2: Tích điểm chuyên cần & Quay số may mắn Lucky Draw.',
        status: '🟡 ĐANG TRIỂN KHAI',
        statusType: 'IN_PROGRESS',
        deadline: 'Hoàn thiện trước 05/11/2026'
      },
      {
        stt: 10,
        title: 'Lịch họp & Phễu Onboarding',
        issue: 'Lịch họp thiếu thống kê; chưa có điều kiện họp định hướng trước khi vào CLB.',
        solution: 'Số hóa quản trị lịch họp các ban kèm link/QR điểm danh; buộc tham gia buổi đào tạo định hướng mới phê duyệt hội viên.',
        status: '🟡 ĐANG TRIỂN KHAI',
        statusType: 'IN_PROGRESS',
        deadline: 'Hoàn thiện trước 05/11/2026'
      }
    ]
  },
  {
    code: 'D',
    title: 'QUẢN TRỊ CRM & BÁO CÁO ĐIỀU HÀNH',
    desc: 'Chỉ số sức khỏe hội viên, cảnh báo trầm lắng, quản lý niên liễm VietQR & xuất báo cáo',
    items: [
      {
        stt: 11,
        title: 'Chuẩn hóa CSDL hội viên',
        issue: 'Dữ liệu thành viên và ngày sinh chưa cập nhật đầy đủ, khó chăm sóc.',
        solution: 'Công cụ Import Excel đối soát lỗi tự động; gửi nhắc cập nhật ngày sinh nhận quà; ViConnect hỗ trợ làm sạch trong 24h.',
        status: '🔵 KẾ HOẠCH TIẾP THEO',
        statusType: 'PLANNED',
        deadline: 'Hỗ trợ nạp CSDL trước 10/11/2026'
      },
      {
        stt: 12,
        title: 'Chỉ số sức khỏe & Cảnh báo',
        issue: 'Dashboard thiếu chỉ số tích cực theo người/ban; chưa cảnh báo hội viên trầm lắng.',
        solution: 'Đồ thị Bar & Line tăng/giảm, bục vinh danh Top 3 gọn 1 hàng; tự động gắn cờ hội viên ít tương tác để BĐH chăm sóc.',
        status: '🟡 ĐANG TRIỂN KHAI',
        statusType: 'IN_PROGRESS',
        deadline: 'Hoàn thiện trước 05/11/2026'
      },
      {
        stt: 13,
        title: 'Quản lý hội phí VietQR',
        issue: 'Chưa có báo cáo thu phí và cơ chế nhắc phí định kỳ đa kênh.',
        solution: 'Theo dõi niên độ 365 ngày (Hiệu lực / Sắp hạn / Nợ phí); tạo thông báo gắn VietQR động khớp tiền tự động; sẵn sàng nhắc Zalo.',
        status: '🟡 ĐANG TRIỂN KHAI',
        statusType: 'IN_PROGRESS',
        deadline: 'Hoàn thiện trước 05/11/2026'
      },
      {
        stt: 14,
        title: 'Bộ Báo cáo Tháng/Quý/Năm',
        issue: 'Chưa có mẫu báo cáo chuẩn kỳ phục vụ họp Ban Điều Hành.',
        solution: 'Mẫu báo cáo điều hành 4 trụ cột (Tài chính, Tích cực, Giao thương, Hội viên mới) xuất bản in A4 và file Excel tức thì.',
        status: '🟡 ĐANG TRIỂN KHAI',
        statusType: 'IN_PROGRESS',
        deadline: 'Hoàn thiện trước 05/11/2026'
      }
    ]
  },
  {
    code: 'E',
    title: 'TRANG CÁ NHÂN HỘI VIÊN',
    desc: 'Dòng thời gian hoạt động & danh thiếp số doanh nhân tích hợp 1 chạm',
    items: [
      {
        stt: 15,
        title: 'Trang cá nhân & Lịch sử',
        issue: 'Chưa có trang tổng hợp quá trình tham gia sự kiện và kết nối giao thương.',
        solution: 'Tái cấu trúc hồ sơ số sang trọng; xây dựng Dòng Thời Gian Hoạt Động (Timeline sự kiện, cơ hội, hợp đồng và kết nối 1-1).',
        status: '🟡 ĐANG TRIỂN KHAI',
        statusType: 'IN_PROGRESS',
        deadline: 'Hoàn thiện trước 05/11/2026'
      }
    ]
  }
];

// 1. GENERATE NOTEBOOKLM MARKDOWN FILE
function generateNotebookLmMarkdown() {
  let md = `# [CEO 1983] TỔNG HỢP Ý KIẾN HỌP & PHƯƠNG ÁN XỬ LÝ CÔNG NGHỆ VICONNECT (BẢN TINH GỌN ĐIỀU HÀNH)
*Tài liệu tóm lược điều hành dành cho Ban Điều Hành CLB Doanh Nhân CEO 1983 (HanoiBA)*  
*Căn cứ buổi họp ngày 21/10/2026  ·  Đơn vị thực hiện: ViConnect  ·  Ngày lập: 23/10/2026*

---

## 📌 TỔNG QUAN CHIẾN LƯỢC & CAM KẾT TIẾN ĐỘ ĐỢT 1
- **Định hướng cốt lõi:** *"Đơn giản hóa ứng dụng để hội viên dùng thường xuyên; biến dữ liệu hoạt động thành công cụ quản trị sắc bén cho Ban Điều Hành."*
- **Quy mô xử lý:** 15 hạng mục trọng điểm / 5 nhóm nghiệp vụ.
- **Tiến độ cam kết Đợt 1:** Hoàn thành toàn diện trước ngày **05/11/2026**.
- **Phân định 3 trạng thái:**
  - 🟢 **02 hạng mục ĐÃ SẴN SÀNG:** Nền tảng giao diện tinh giản & bảo mật thẻ hội viên.
  - 🟡 **11 hạng mục ĐANG TRIỂN KHAI:** Hoàn thiện trước **05/11/2026**.
  - 🔵 **02 hạng mục KẾ HOẠCH TIẾP THEO:** Phối hợp kết nối Zalo OA, VNPAY & nạp CSDL trước **10/11/2026**.

---

`;

  groupsData.forEach(g => {
    md += `## 🔹 NHÓM ${g.code}: ${g.title}\n*${g.desc}*\n\n`;
    g.items.forEach(it => {
      md += `### ${it.stt}. ${it.title} [${it.status}]\n`;
      md += `- **Vấn đề CLB phản ánh:** ${it.issue}\n`;
      md += `- **Giải pháp ViConnect đề xuất:** ${it.solution}\n`;
      md += `- **Thời hạn:** ${it.deadline}\n\n`;
    });
    md += `---\n\n`;
  });

  md += `## 📝 KẾT LUẬN & THÔNG ĐIỆP ĐỒNG HÀNH
*Kính mời các Anh/Chị trong Ban Điều Hành xem xét Bảng đề xuất giải pháp chi tiết đính kèm và cho ý kiến chỉ đạo để ViConnect phối hợp triển khai đạt hiệu quả cao nhất phục vụ Hiệp hội. Trân trọng cảm ơn và kính chúc các Anh/Chị trong Ban Điều Hành luôn dồi dào sức khỏe, chúc CLB Doanh Nhân CEO 1983 ngày càng phát triển vững mạnh!*

**ĐƠN VỊ PHÁT TRIỂN CÔNG NGHỆ VICONNECT**  
*Hà Nội, ngày 23 tháng 10 năm 2026*
`;

  const targetPath = path.resolve(NOTEBOOK_DIR, '06_BAO_CAO_TINH_GON_SLIDE_HOA_Y_KIEN_VA_GIAI_PHAP_VICONNECT.md');
  fs.writeFileSync(targetPath, md, 'utf8');
  console.log('Generated NotebookLM Markdown:', targetPath);
}

// 2. GENERATE POWERPOINT (PPTX)
async function generatePowerPoint() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = 'Báo Cáo Phương Án Xử Lý & Cam Kết Tiến Độ CEO 1983 - ViConnect';

  const NAVY = '1F3864';
  const GOLD = 'B8860B';
  const LIGHT_BG = 'F8FAFC';
  const WHITE = 'FFFFFF';
  const TEXT_DARK = '1E293B';
  const TEXT_MUTED = '64748B';

  // SLIDE 1: COVER WITH SKYLINE BACKGROUND & POSTER
  const slide1 = pptx.addSlide();
  
  const coverBgPath = path.resolve(DOC_DIR, 'images/backgrounds/01_skyline_lake.jpg');
  if (fs.existsSync(coverBgPath)) {
    slide1.addImage({
      path: coverBgPath,
      x: 0,
      y: 0,
      w: 13.333,
      h: 7.5,
    });
  }

  // Semi-transparent Dark Navy Gradient Overlay
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 7.5,
    fill: { color: '001F54', transparency: 22 },
    line: { color: '00D2FF', width: 2 },
  });

  // Left Elevated Card
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 0.9,
    w: 7.6,
    h: 5.7,
    fill: { color: WHITE, transparency: 4 },
    line: { color: 'CBD5E1', width: 1.5 },
    rectRadius: 0.18,
  });

  const ceoLogoPath = path.resolve(DOC_DIR, 'images/ceo1983-official-logo.png');
  const viconnectLogoPath = path.resolve(DOC_DIR, 'images/viconnect-logo.png');

  // Top Logos on Left Card (CEO 1983 & ViConnect)
  if (fs.existsSync(ceoLogoPath)) {
    slide1.addImage({
      path: ceoLogoPath,
      x: 1.15,
      y: 1.05,
      w: 1.25,
      h: 0.65,
    });
  }

  slide1.addShape(pptx.ShapeType.line, {
    x: 2.55,
    y: 1.15,
    w: 0,
    h: 0.45,
    line: { color: 'CBD5E1', width: 1.5 }
  });

  if (fs.existsSync(viconnectLogoPath)) {
    slide1.addImage({
      path: viconnectLogoPath,
      x: 2.75,
      y: 1.15,
      w: 1.55,
      h: 0.50,
    });
  }

  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 4.60,
    y: 1.18,
    w: 3.40,
    h: 0.40,
    fill: { color: '003B95' },
    line: { color: '00D2FF', width: 1 },
    rectRadius: 0.08,
  });

  slide1.addText('HỢP TÁC CÔNG NGHỆ', {
    x: 4.60,
    y: 1.18,
    w: 3.40,
    h: 0.40,
    fontSize: 9.5,
    bold: true,
    color: '00D2FF',
    align: 'center',
    fontFace: 'Arial',
  });

  // Title
  slide1.addText('BÁO CÁO TIẾP THU Ý KIẾN HỌP &\nPHƯƠNG ÁN NÂNG CẤP HỆ THỐNG CEO 1983', {
    x: 1.1,
    y: 1.80,
    w: 7.0,
    h: 1.35,
    fontSize: 21,
    color: NAVY,
    bold: true,
    fontFace: 'Arial',
  });

  // Subtitle
  slide1.addText('Đơn giản hóa ứng dụng cho hội viên dễ dùng thường xuyên · Biến dữ liệu thành công cụ quản trị sắc bén cho Ban Điều Hành.\nToàn bộ 15 hạng mục Đợt 1 cam kết hoàn thành trước 05/11/2026.', {
    x: 1.1,
    y: 3.20,
    w: 7.0,
    h: 0.85,
    fontSize: 11.5,
    color: '334155',
    fontFace: 'Arial',
  });

  // Meeting Info Box
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 1.1,
    y: 4.15,
    w: 7.0,
    h: 1.6,
    fill: { color: 'FFF7ED' },
    line: { color: 'FED7AA', width: 1 },
    rectRadius: 0.08,
  });

  slide1.addText('📅 Căn cứ cuộc họp Ban Điều Hành: Ngày 21/10/2026\n🏢 Đơn vị chủ trì: CLB Doanh Nhân CEO 1983 (HanoiBA)\n⚙️ Đơn vị công nghệ: Tập đoàn ViConnect (Ngày lập: 23/10/2026)\n✦ Cam kết đồng hành vì sự phát triển bền vững của cộng đồng doanh nhân', {
    x: 1.3,
    y: 4.3,
    w: 6.6,
    h: 1.3,
    fontSize: 11,
    color: '78350F',
    lineSpacing: 18,
    fontFace: 'Arial',
  });

  slide1.addText('Hà Nội, ngày 23 tháng 10 năm 2026  ·  Đơn vị thực hiện: ViConnect', {
    x: 1.1,
    y: 5.95,
    w: 7.0,
    h: 0.35,
    fontSize: 10,
    italic: true,
    color: '64748B',
    fontFace: 'Arial',
  });

  // Right Side: Official Poster Image Card
  const posterPath = path.resolve(DOC_DIR, 'images/image1_invitation_poster.png');
  if (fs.existsSync(posterPath)) {
    slide1.addShape(pptx.ShapeType.roundRect, {
      x: 8.7,
      y: 0.9,
      w: 3.8,
      h: 5.7,
      fill: { color: WHITE },
      line: { color: '00D2FF', width: 2 },
      rectRadius: 0.18,
    });

    slide1.addImage({
      path: posterPath,
      x: 8.78,
      y: 0.98,
      w: 3.64,
      h: 5.54,
    });
  }

  // SLIDE 2: STRATEGIC OVERVIEW & 3 STATUS DASHBOARD
  const slide2 = pptx.addSlide();
  slide2.background = { color: LIGHT_BG };

  slide2.addText('TỔNG QUAN ĐỐI SOÁT & CAM KẾT TIẾN ĐỘ ĐỢT 1', {
    x: 0.8,
    y: 0.45,
    w: 8.8,
    h: 0.5,
    fontSize: 22,
    color: NAVY,
    bold: true,
    fontFace: 'Arial'
  });

  slide2.addText('Mục tiêu chiến lược: "Đơn giản hóa để hội viên dùng thường xuyên - Biến dữ liệu thành công cụ quản trị sắc bén cho BĐH"', {
    x: 0.8,
    y: 1.0,
    w: 8.8,
    h: 0.35,
    fontSize: 12.5,
    color: TEXT_MUTED,
    italic: true,
    fontFace: 'Arial'
  });

  // Top right paired logos on Slide 2
  if (fs.existsSync(ceoLogoPath)) {
    slide2.addImage({ path: ceoLogoPath, x: 9.9, y: 0.38, w: 1.1, h: 0.58 });
  }
  slide2.addShape(pptx.ShapeType.line, { x: 11.15, y: 0.42, w: 0, h: 0.45, line: { color: 'CBD5E1', width: 1.5 } });
  if (fs.existsSync(viconnectLogoPath)) {
    slide2.addImage({ path: viconnectLogoPath, x: 11.3, y: 0.45, w: 1.35, h: 0.44 });
  }

  // 3 KPI Cards
  const cards = [
    { title: '🟢 ĐÃ SẴN SÀNG', count: '02 HẠNG MỤC', sub: 'Trang chủ tinh gọn & Bảo mật thẻ', bg: 'D1FAE5', border: '059669', color: '065F46' },
    { title: '🟡 ĐANG TRIỂN KHAI', count: '11 HẠNG MỤC', sub: 'Cam kết bàn giao trước 05/11/2026', bg: 'FEF3C7', border: 'D97706', color: '92400E' },
    { title: '🔵 KẾ HOẠCH TIẾP THEO', count: '02 HẠNG MỤC', sub: 'Zalo OA / VNPAY & CSDL (trước 10/11)', bg: 'DBEAFE', border: '2563EB', color: '1E40AF' }
  ];

  cards.forEach((c, idx) => {
    const xPos = 0.8 + idx * 4.0;
    slide2.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.45,
      w: 3.7,
      h: 1.85,
      fill: { color: c.bg },
      line: { color: c.border, width: 2 },
      rectRadius: 0.1
    });

    slide2.addText(c.title, {
      x: xPos + 0.2,
      y: 1.6,
      w: 3.3,
      h: 0.35,
      fontSize: 13,
      bold: true,
      color: c.color,
      fontFace: 'Arial'
    });

    slide2.addText(c.count, {
      x: xPos + 0.2,
      y: 1.95,
      w: 3.3,
      h: 0.65,
      fontSize: 20,
      bold: true,
      color: NAVY,
      fontFace: 'Arial'
    });

    slide2.addText(c.sub, {
      x: xPos + 0.2,
      y: 2.6,
      w: 3.3,
      h: 0.55,
      fontSize: 11,
      color: TEXT_DARK,
      fontFace: 'Arial'
    });
  });

  // Bottom Leader Feedback Cards in 2x2 Grid on Slide 2
  const leaders = [
    {
      name: '👤 Anh Thành (Phó Tổng Thư ký)',
      tag: 'SÀN B2B & VOUCHER',
      tagBg: 'FEF3C7',
      tagColor: '92400E',
      issue: '⚠️ Góp ý: Giới hạn 5 SP/DN tránh spam sàn; bộ lọc ngành mua/bán; voucher tri ân.',
      sol: '💡 ViConnect: Đã áp dụng hạn mức 5 SP/DN, nén WebP, bộ lọc 10 ngành, cấp mã Voucher riêng.'
    },
    {
      name: '👤 Anh Tuấn (Phó Chủ tịch)',
      tag: 'TRANG CHỦ & ĐẶC QUYỀN',
      tagBg: 'D1FAE5',
      tagColor: '065F46',
      issue: '⚠️ Góp ý: Rút gọn trang chủ quanh 4 chức năng chính; tách đặc quyền thành gian hàng số.',
      sol: '💡 ViConnect: Tinh giản trang chủ 4 luồng; xây dựng Gian Hàng Doanh Nghiệp Số riêng biệt.'
    },
    {
      name: '👤 Chị Phương (Phó ban Hội viên)',
      tag: 'DOANH SỐ & HỘI PHÍ',
      tagBg: 'DBEAFE',
      tagColor: '1E40AF',
      issue: '⚠️ Góp ý: Phân định cơ hội & kết nối có doanh thu thực tế; cảnh báo trầm lắng; báo cáo phí.',
      sol: '💡 ViConnect: Xác thực hợp đồng 2 chiều; gắn cờ trầm lắng; quản lý phí niên độ 365 ngày VietQR.'
    },
    {
      name: '👤 Chị Dung (Phó Chánh Văn phòng)',
      tag: 'HỒ SƠ & DÒNG THỜI GIAN',
      tagBg: 'EDE9FE',
      tagColor: '5B21B6',
      issue: '⚠️ Góp ý: Trang cá nhân tổng hợp lịch sử tham gia sự kiện, cơ hội và kết nối 1-on-1.',
      sol: '💡 ViConnect: Xây dựng Dòng Thời Gian Hoạt Động (Timeline) và danh thiếp số 1 chạm.'
    }
  ];

  leaders.forEach((ld, lIdx) => {
    const col = lIdx % 2;
    const row = Math.floor(lIdx / 2);
    const xPos = 0.8 + col * 6.0;
    const yPos = 3.55 + row * 1.65;

    slide2.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: yPos,
      w: 5.7,
      h: 1.5,
      fill: { color: WHITE },
      line: { color: 'CBD5E1', width: 1 },
      rectRadius: 0.08
    });

    slide2.addText(ld.name, {
      x: xPos + 0.15,
      y: yPos + 0.1,
      w: 3.6,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: NAVY,
      fontFace: 'Arial'
    });

    slide2.addShape(pptx.ShapeType.roundRect, {
      x: xPos + 3.8,
      y: yPos + 0.1,
      w: 1.75,
      h: 0.25,
      fill: { color: ld.tagBg },
      line: { color: ld.tagColor, width: 0.5 },
      rectRadius: 0.04
    });

    slide2.addText(ld.tag, {
      x: xPos + 3.8,
      y: yPos + 0.1,
      w: 1.75,
      h: 0.25,
      fontSize: 8.5,
      bold: true,
      color: ld.tagColor,
      align: 'center',
      fontFace: 'Arial'
    });

    slide2.addText(ld.issue, {
      x: xPos + 0.15,
      y: yPos + 0.42,
      w: 5.4,
      h: 0.45,
      fontSize: 9.5,
      color: '991B1B',
      fontFace: 'Arial'
    });

    slide2.addShape(pptx.ShapeType.roundRect, {
      x: xPos + 0.15,
      y: yPos + 0.92,
      w: 5.4,
      h: 0.48,
      fill: { color: 'F0FDF4' },
      line: { color: '10B981', width: 0.5 },
      rectRadius: 0.04
    });

    slide2.addText(ld.sol, {
      x: xPos + 0.2,
      y: yPos + 0.95,
      w: 5.3,
      h: 0.42,
      fontSize: 9.5,
      bold: true,
      color: '065F46',
      fontFace: 'Arial'
    });
  });

  // SLIDES 3 - 7: FOR EACH OF THE 5 GROUPS
  groupsData.forEach((grp, gIdx) => {
    const sl = pptx.addSlide();
    sl.background = { color: LIGHT_BG };

    // Header bar
    sl.addText(`NHÓM ${grp.code}: ${grp.title}`, {
      x: 0.8,
      y: 0.45,
      w: 8.8,
      h: 0.45,
      fontSize: 20,
      color: NAVY,
      bold: true,
      fontFace: 'Arial'
    });

    sl.addText(grp.desc, {
      x: 0.8,
      y: 0.95,
      w: 8.8,
      h: 0.35,
      fontSize: 12,
      color: TEXT_MUTED,
      italic: true,
      fontFace: 'Arial'
    });

    // Top right brand logos
    if (fs.existsSync(ceoLogoPath)) {
      sl.addImage({ path: ceoLogoPath, x: 9.9, y: 0.38, w: 1.1, h: 0.58 });
    }
    sl.addShape(pptx.ShapeType.line, { x: 11.15, y: 0.42, w: 0, h: 0.45, line: { color: 'CBD5E1', width: 1.5 } });
    if (fs.existsSync(viconnectLogoPath)) {
      sl.addImage({ path: viconnectLogoPath, x: 11.3, y: 0.45, w: 1.35, h: 0.44 });
    }

    if (grp.code === 'E') {
      // Group E: Item 15 + 3 Feature Columns
      const it = grp.items[0];
      sl.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 1.45,
        w: 11.73,
        h: 1.55,
        fill: { color: WHITE },
        line: { color: 'CBD5E1', width: 1 },
        rectRadius: 0.08
      });

      sl.addText(`${it.stt}. ${it.title}`, {
        x: 1.0,
        y: 1.55,
        w: 6.5,
        h: 0.35,
        fontSize: 13.5,
        bold: true,
        color: NAVY,
        fontFace: 'Arial'
      });

      sl.addShape(pptx.ShapeType.roundRect, {
        x: 7.8,
        y: 1.55,
        w: 4.5,
        h: 0.32,
        fill: { color: 'FEF3C7' },
        line: { color: 'F59E0B', width: 1 },
        rectRadius: 0.05
      });

      sl.addText(`${it.status} (${it.deadline})`, {
        x: 7.8,
        y: 1.55,
        w: 4.5,
        h: 0.32,
        fontSize: 10,
        bold: true,
        color: '92400E',
        align: 'center',
        fontFace: 'Arial'
      });

      sl.addText(`⚠️ Vấn đề CLB: ${it.issue}`, {
        x: 1.0,
        y: 1.95,
        w: 11.3,
        h: 0.40,
        fontSize: 10.5,
        color: '991B1B',
        fontFace: 'Arial'
      });

      sl.addText(`💡 Giải pháp ViConnect: ${it.solution}`, {
        x: 1.0,
        y: 2.40,
        w: 11.3,
        h: 0.45,
        fontSize: 11,
        bold: true,
        color: '065F46',
        fontFace: 'Arial'
      });

      // 3 Member Portfolio Feature Columns below
      const portfolioCols = [
        {
          icon: '🗓️',
          title: 'NHẬT KÝ SỰ KIỆN CLB',
          color: '1E40AF',
          border: 'BFDBFE',
          bullets: '• Lịch sử check-in QR các kỳ họp HanoiBA.\n• Danh sách sự kiện đã tham gia.\n• Chứng nhận hoàn thành đào tạo.\n• Ghi nhận đóng góp ban chuyên môn.'
        },
        {
          icon: '💼',
          title: 'GIAO THƯƠNG & DEAL FLOW',
          color: '065F46',
          border: 'A7F3D0',
          bullets: '• Theo dõi cơ hội B2B gửi & nhận.\n• Nhật ký phiên kết nối Cafe 1-1.\n• Hợp đồng ký kết & doanh thu thực tế.\n• Đánh giá uy tín đối tác giao thương.'
        },
        {
          icon: '🎖️',
          title: 'ĐẶC QUYỀN & GIAN HÀNG SỐ',
          color: '9A3412',
          border: 'FED7AA',
          bullets: '• Thẻ hội viên số kèm huy hiệu bảo mật.\n• Kho Voucher ưu đãi VIP cho CLB.\n• Gian hàng số 5 sản phẩm tiêu biểu.\n• Danh thiếp thông minh chia sẻ 1 chạm.'
        }
      ];

      portfolioCols.forEach((col, cIdx) => {
        const xPos = 0.8 + cIdx * 4.0;
        sl.addShape(pptx.ShapeType.roundRect, {
          x: xPos,
          y: 3.25,
          w: 3.7,
          h: 3.45,
          fill: { color: WHITE },
          line: { color: col.border, width: 1.5 },
          rectRadius: 0.1
        });

        sl.addText(`${col.icon} ${col.title}`, {
          x: xPos + 0.2,
          y: 3.45,
          w: 3.3,
          h: 0.35,
          fontSize: 11.5,
          bold: true,
          color: col.color,
          fontFace: 'Arial'
        });

        sl.addText(col.bullets, {
          x: xPos + 0.2,
          y: 3.90,
          w: 3.3,
          h: 2.6,
          fontSize: 10,
          color: '334155',
          lineSpacing: 18,
          fontFace: 'Arial'
        });
      });
      return;
    }

    // Normal items rendering (Groups A, B, C, D)
    const itemCount = grp.items.length;
    let itemHeight = itemCount === 4 ? 1.05 : 1.35;
    let startY = 1.45;
    let gap = itemCount === 4 ? 0.08 : 0.12;

    grp.items.forEach((it, iIdx) => {
      const curY = startY + iIdx * (itemHeight + gap);

      let cardBg = WHITE;
      let badgeBg = 'FEF3C7';
      let badgeColor = '92400E';
      if (it.statusType === 'READY') {
        badgeBg = 'D1FAE5';
        badgeColor = '065F46';
      } else if (it.statusType === 'PLANNED') {
        badgeBg = 'DBEAFE';
        badgeColor = '1E40AF';
      }

      sl.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: curY,
        w: 11.73,
        h: itemHeight,
        fill: { color: cardBg },
        line: { color: 'CBD5E1', width: 1 },
        rectRadius: 0.06
      });

      sl.addText(`${it.stt}. ${it.title}`, {
        x: 1.0,
        y: curY + 0.08,
        w: 7.0,
        h: 0.32,
        fontSize: itemCount === 4 ? 12 : 13,
        bold: true,
        color: NAVY,
        fontFace: 'Arial'
      });

      sl.addShape(pptx.ShapeType.roundRect, {
        x: 8.2,
        y: curY + 0.08,
        w: 4.1,
        h: 0.28,
        fill: { color: badgeBg },
        line: { color: badgeColor, width: 1 },
        rectRadius: 0.04
      });

      sl.addText(`${it.status} (${it.deadline})`, {
        x: 8.2,
        y: curY + 0.08,
        w: 4.1,
        h: 0.28,
        fontSize: 9.5,
        bold: true,
        color: badgeColor,
        align: 'center',
        fontFace: 'Arial'
      });

      sl.addText(`⚠️ Vấn đề CLB: ${it.issue}`, {
        x: 1.0,
        y: curY + 0.38,
        w: 11.3,
        h: 0.32,
        fontSize: 10,
        color: '991B1B',
        fontFace: 'Arial'
      });

      sl.addText(`💡 Giải pháp ViConnect: ${it.solution}`, {
        x: 1.0,
        y: curY + 0.70,
        w: 11.3,
        h: 0.35,
        fontSize: 10.5,
        bold: true,
        color: '065F46',
        fontFace: 'Arial'
      });
    });

    if (grp.code === 'A' || grp.code === 'B' || grp.code === 'C') {
      const bannerY = startY + itemCount * (itemHeight + gap) + 0.05;
      sl.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: bannerY,
        w: 11.73,
        h: 0.65,
        fill: { color: grp.code === 'B' ? 'FFFBEB' : 'F0FDF4' },
        line: { color: grp.code === 'B' ? 'F59E0B' : '10B981', width: 1 },
        rectRadius: 0.06
      });

      const bannerText = grp.code === 'B'
        ? '💡 Trọng tâm Nhóm B: Chuẩn hóa 5 sản phẩm/DN, kết nối trực tiếp cung - cầu 10 ngành nghề trọng điểm HanoiBA và phát hành voucher tri ân hội viên.'
        : grp.code === 'A'
        ? '✦ Trọng tâm Nhóm A: Tinh giản giao diện di động 1 chạm; bảo vệ dữ liệu cá nhân theo tiêu chuẩn an toàn thông tin doanh nghiệp.'
        : '✦ Trọng tâm Nhóm C: Số hóa 100% check-in QR sự kiện; phân định rõ cơ hội giao thương và kết nối có doanh số thực tế.';

      sl.addText(bannerText, {
        x: 1.0,
        y: bannerY + 0.12,
        w: 11.3,
        h: 0.42,
        fontSize: 10.5,
        bold: true,
        color: grp.code === 'B' ? '92400E' : '065F46',
        fontFace: 'Arial'
      });
    }
  });

  // SLIDE 8: COMMITMENT & CONCLUSION (RICH ROYAL NAVY WITH 3 PHASE CARDS)
  const slide8 = pptx.addSlide();
  slide8.background = { color: '001F54' };

  slide8.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 0.5,
    w: 3.2,
    h: 0.35,
    fill: { color: '003B95' },
    line: { color: 'FDE047', width: 1 },
    rectRadius: 0.08
  });

  slide8.addText('CAM KẾT ĐỒNG HÀNH & KẾ HOẠCH BÀN GIAO', {
    x: 0.8,
    y: 0.5,
    w: 3.2,
    h: 0.35,
    fontSize: 9.5,
    bold: true,
    color: 'FDE047',
    align: 'center',
    fontFace: 'Arial'
  });

  slide8.addText('LỘ TRÌNH TRIỂN KHAI TOÀN DIỆN & CAM KẾT VICONNECT', {
    x: 0.8,
    y: 0.95,
    w: 11.73,
    h: 0.5,
    fontSize: 22,
    color: WHITE,
    bold: true,
    fontFace: 'Arial'
  });

  // 3 Phase Cards Side-by-Side in PPTX
  const phases = [
    {
      title: '🟢 GIAI ĐOẠN 1: NỀN TẢNG',
      status: 'ĐÃ SẴN SÀNG',
      borderColor: '10B981',
      titleColor: '34D399',
      bullets: '• Tinh gọn Trang chủ quanh 4 luồng cốt lõi.\n• Bảo mật thẻ hội viên (công tắc ẩn/hiện SĐT).\n• Tối ưu tốc độ & giao diện di động mượt mà.'
    },
    {
      title: '🟡 GIAI ĐOẠN 2: TÍNH NĂNG',
      status: 'TRƯỚC 05/11/2026',
      borderColor: 'F59E0B',
      titleColor: 'FBBF24',
      bullets: '• Hoàn thiện Sàn B2B (5 SP/DN, lọc ngành).\n• Kết nối 1-1 có xác thực hợp đồng & deal.\n• Check-in QR sự kiện & tài liệu họp.\n• Dashboard CRM & Báo cáo điều hành 4 trụ cột.'
    },
    {
      title: '🔵 GIAI ĐOẠN 3: ĐỒNG BỘ',
      status: 'TRƯỚC 10/11/2026',
      borderColor: '3B82F6',
      titleColor: '60A5FA',
      bullets: '• Phối hợp Ban Thư Ký nạp chuẩn CSDL.\n• Tích hợp Zalo OA gửi thông báo tự động.\n• Cổng VNPAY Merchant & VietQR động.\n• Bàn giao tài liệu & hướng dẫn vận hành.'
    }
  ];

  phases.forEach((ph, pIdx) => {
    const xPos = 0.8 + pIdx * 4.0;
    slide8.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.6,
      w: 3.7,
      h: 2.7,
      fill: { color: '002D72' },
      line: { color: ph.borderColor, width: 1.5 },
      rectRadius: 0.1
    });

    slide8.addText(ph.title, {
      x: xPos + 0.2,
      y: 1.75,
      w: 3.3,
      h: 0.35,
      fontSize: 11,
      bold: true,
      color: ph.titleColor,
      fontFace: 'Arial'
    });

    slide8.addText(ph.bullets, {
      x: xPos + 0.2,
      y: 2.2,
      w: 3.3,
      h: 1.9,
      fontSize: 10,
      color: 'F1F5F9',
      lineSpacing: 18,
      fontFace: 'Arial'
    });
  });

  // Quote Box
  slide8.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 4.55,
    w: 11.73,
    h: 1.35,
    fill: { color: '003B95' },
    line: { color: '00D2FF', width: 1.5 },
    rectRadius: 0.08
  });

  slide8.addText(
    '"Kính mời các Anh/Chị trong Ban Điều Hành xem xét Báo cáo phương án chi tiết đính kèm và cho ý kiến chỉ đạo để ViConnect phối hợp triển khai đạt hiệu quả cao nhất phục vụ Hiệp hội. ViConnect cam kết đồng hành dài hạn vì sự phát triển thịnh vượng của CLB Doanh Nhân CEO 1983!"',
    {
      x: 1.1,
      y: 4.7,
      w: 11.1,
      h: 1.0,
      fontSize: 11.5,
      color: WHITE,
      italic: true,
      fontFace: 'Arial'
    }
  );

  // Logos in Slide 8 Footer
  slide8.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 6.1,
    w: 3.2,
    h: 0.55,
    fill: { color: WHITE },
    line: { color: 'CBD5E1', width: 1 },
    rectRadius: 0.06
  });

  if (fs.existsSync(ceoLogoPath)) {
    slide8.addImage({ path: ceoLogoPath, x: 0.9, y: 6.15, w: 0.9, h: 0.45 });
  }
  slide8.addShape(pptx.ShapeType.line, { x: 1.95, y: 6.18, w: 0, h: 0.38, line: { color: 'CBD5E1', width: 1.5 } });
  if (fs.existsSync(viconnectLogoPath)) {
    slide8.addImage({ path: viconnectLogoPath, x: 2.1, y: 6.2, w: 1.2, h: 0.35 });
  }

  // Save PPTX
  const pptxPath = path.resolve(DOC_DIR, 'SLIDE_BAO_CAO_TIEP_THU_Y_KIEN_VA_GIAI_PHAP_VICONNECT.pptx');
  const fallbackPptxPath = path.resolve(DOC_DIR, 'SLIDE_BAO_CAO_TIEP_THU_Y_KIEN_VA_GIAI_PHAP_VICONNECT_BAN_MOI_NHAT.pptx');
  try {
    await pptx.writeFile({ fileName: pptxPath });
    console.log('Generated PowerPoint Presentation:', pptxPath);
  } catch (err) {
    console.warn(`File ${pptxPath} might be locked. Writing to fallback: ${fallbackPptxPath}`);
    await pptx.writeFile({ fileName: fallbackPptxPath });
    console.log('Generated PowerPoint Presentation (Fallback):', fallbackPptxPath);
  }
}

// 3. GENERATE STANDALONE HTML PRESENTATION & VIEWER
function generateHtmlSlideViewer() {
  const ceoLogoPath = path.resolve(DOC_DIR, 'images/ceo1983-official-logo.png');
  const viconnectLogoPath = path.resolve(DOC_DIR, 'images/viconnect-logo.png');
  const posterPath = path.resolve(DOC_DIR, 'images/image1_invitation_poster.png');

  const ceoLogoDataUrl = fs.existsSync(ceoLogoPath)
    ? `data:image/png;base64,${fs.readFileSync(ceoLogoPath).toString('base64')}`
    : '';
  const viconnectLogoDataUrl = fs.existsSync(viconnectLogoPath)
    ? `data:image/png;base64,${fs.readFileSync(viconnectLogoPath).toString('base64')}`
    : '';
  const posterDataUrl = fs.existsSync(posterPath)
    ? `data:image/png;base64,${fs.readFileSync(posterPath).toString('base64')}`
    : '';

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>[CEO 1983] Slide Báo Cáo Ý Kiến &amp; Phương Án Xử Lý - ViConnect</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { background: #0F172A; color: #1E293B; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .deck-container { width: 100%; max-width: 1056px; aspect-ratio: 16/9; background: #F8FAFC; border-radius: 14px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); position: relative; overflow: hidden; display: flex; flex-direction: column; }
    .slide { display: none; width: 100%; height: 100%; padding: 22px 30px; flex-direction: column; justify-content: flex-start; gap: 8px; }
    .slide.active { display: flex; animation: fadeIn 0.25s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.99); } to { opacity: 1; transform: scale(1); } }
    
    /* Cover Slide */
    .slide-cover { color: #FFFFFF; justify-content: space-between; }
    .badge-top { display: inline-block; background: rgba(253, 224, 71, 0.2); color: #FDE047; border: 1px solid #FDE047; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; width: fit-content; }
    .cover-title { font-size: 23px; font-weight: 800; line-height: 1.3; color: #FFFFFF; }
    .cover-sub { font-size: 12.5px; color: #F1F5F9; line-height: 1.6; }
    .cover-footer { font-size: 11.5px; color: #FDE047; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px; }

    /* Slide Header */
    .slide-header { border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 2px; }
    .group-code { font-size: 11px; font-weight: 800; color: #B8860B; text-transform: uppercase; letter-spacing: 0.5px; }
    .group-title { font-size: 19px; font-weight: 800; color: #1F3864; line-height: 1.25; }
    .group-desc { font-size: 11.5px; color: #64748B; margin-top: 2px; }

    /* Items Grid */
    .items-container { display: flex; flex-direction: column; gap: 6px; width: 100%; }
    .item-card { background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 8px; padding: 7px 12px; display: flex; flex-direction: column; gap: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
    .item-header { display: flex; justify-content: space-between; align-items: center; }
    .item-name { font-size: 13px; font-weight: 700; color: #1F3864; }
    .status-tag { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; }
    .status-tag.READY { background: #D1FAE5; color: #065F46; border: 1px solid #10B981; }
    .status-tag.IN_PROGRESS { background: #FEF3C7; color: #92400E; border: 1px solid #F59E0B; }
    .status-tag.PLANNED { background: #DBEAFE; color: #1E40AF; border: 1px solid #3B82F6; }
    
    .issue-box { font-size: 11px; color: #991B1B; background: #FEF2F2; border-left: 3px solid #EF4444; padding: 4px 8px; border-radius: 4px; line-height: 1.4; }
    .sol-box { font-size: 11px; color: #065F46; font-weight: 600; background: #F0FDF4; border-left: 3px solid #10B981; padding: 4px 8px; border-radius: 4px; line-height: 1.4; }

    /* Dashboard Cards */
    .dash-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 4px 0; }
    .dash-card { border-radius: 10px; padding: 12px 10px; text-align: center; }
    .dash-card.green { background: #D1FAE5; border: 1.5px solid #059669; color: #065F46; }
    .dash-card.yellow { background: #FEF3C7; border: 1.5px solid #D97706; color: #92400E; }
    .dash-card.blue { background: #DBEAFE; border: 1.5px solid #2563EB; color: #1E40AF; }
    .dash-num { font-size: 20px; font-weight: 800; margin: 4px 0; }

    /* Dark Ending Slide */
    .slide-dark { background-color: #001F54 !important; background: linear-gradient(135deg, #001F54 0%, #0A2540 60%, #003B95 100%) !important; color: #FFFFFF !important; justify-content: space-between !important; }

    /* Controls */
    .controls { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; background: #FFFFFF; border-top: 1px solid #E2E8F0; }
    .btn { background: #1F3864; color: #FFFFFF; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.2s; font-size: 12px; }
    .btn:hover { background: #152744; }
    .btn:disabled { background: #CBD5E1; cursor: not-allowed; }
    .counter { font-size: 12px; font-weight: 600; color: #64748B; }

    @media print {
      @page {
        size: 11in 6.1875in;
        margin: 0;
      }
      *, *::before, *::after {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      html, body {
        background: #0F172A !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 11in !important;
        height: 6.1875in !important;
        display: block !important;
      }
      .deck-container {
        width: 11in !important;
        max-width: none !important;
        aspect-ratio: auto !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        overflow: visible !important;
        margin: 0 !important;
        padding: 0 !important;
        display: block !important;
        background: transparent !important;
      }
      .slide {
        display: flex !important;
        width: 11in !important;
        height: 6.1875in !important;
        max-width: 11in !important;
        max-height: 6.1875in !important;
        page-break-after: always !important;
        page-break-inside: avoid !important;
        break-after: page !important;
        break-inside: avoid !important;
        padding: 22px 30px !important;
        box-sizing: border-box !important;
        border-radius: 0 !important;
        background: #F8FAFC !important;
        position: relative !important;
        overflow: hidden !important;
        justify-content: flex-start !important;
        gap: 8px !important;
      }
      .slide.slide-cover {
        background-color: #001F54 !important;
        background: linear-gradient(135deg, #001F54 0%, #003B95 100%) !important;
        color: #FFFFFF !important;
        padding: 22px 28px !important;
        justify-content: space-between !important;
      }
      .slide.slide-dark {
        background-color: #001F54 !important;
        background: linear-gradient(135deg, #001F54 0%, #0A2540 60%, #003B95 100%) !important;
        color: #FFFFFF !important;
        padding: 22px 30px !important;
        justify-content: space-between !important;
      }
      .slide.slide-dark * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .controls {
        display: none !important;
      }
    }
  </style>
</head>
<body>

<div class="deck-container">
  <!-- SLIDE 1: COVER WITH SKYLINE & POSTER -->
  <div class="slide slide-cover active" style="background-color: #001F54 !important; background: linear-gradient(135deg, #001F54 0%, #003B95 100%) !important; color: #FFFFFF !important; display: flex; flex-direction: row; gap: 20px; align-items: stretch; justify-content: space-between; padding: 22px 28px;">
    <!-- Left Elevated Card -->
    <div style="flex: 1.35; background: #FFFFFF !important; border-radius: 12px; padding: 18px 22px; box-shadow: 0 15px 30px rgba(0,0,0,0.3); display: flex; flex-direction: column; justify-content: space-between; height: 100%; box-sizing: border-box;">
      <div>
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">
          <img src="${ceoLogoDataUrl}" style="height: 32px; object-fit: contain;" alt="Logo CEO 1983">
          <div style="width: 1px; height: 24px; background: #CBD5E1;"></div>
          <a href="https://viconnect.vn" target="_blank" style="display: flex; align-items: center;">
            <img src="${viconnectLogoDataUrl}" style="height: 24px; object-fit: contain;" alt="Logo ViConnect - https://viconnect.vn">
          </a>
          <div style="margin-left: auto; background: #003B95; color: #00D2FF; padding: 3px 10px; border-radius: 16px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">HỢP TÁC CÔNG NGHỆ</div>
        </div>
        <h1 style="font-size: 19px; font-weight: 800; line-height: 1.3; color: #001F54; margin: 6px 0 6px 0;">BÁO CÁO TIẾP THU Ý KIẾN HỌP &amp;<br>PHƯƠNG ÁN NÂNG CẤP HỆ THỐNG CEO 1983</h1>
        <p style="font-size: 11px; color: #334155; line-height: 1.45; margin-bottom: 10px;">Đơn giản hóa cho hội viên dùng thường xuyên · Biến dữ liệu thành công cụ quản trị sắc bén cho Ban Điều Hành. Toàn bộ 15 hạng mục Đợt 1 cam kết hoàn thành trước 05/11/2026.</p>
        
        <div style="background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 8px; padding: 8px 12px; font-size: 10.5px; color: #78350F; line-height: 1.5; margin-bottom: 8px;">
          📅 <strong>Căn cứ cuộc họp Ban Điều Hành:</strong> Ngày 21/10/2026<br>
          🏢 <strong>Đơn vị chủ trì:</strong> CLB Doanh Nhân CEO 1983 (HanoiBA)<br>
          ⚙️ <strong>Đơn vị công nghệ:</strong> Tập đoàn ViConnect (Ngày lập: 23/10/2026)
        </div>

        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <span style="background: #D1FAE5; color: #065F46; font-size: 9.5px; font-weight: 700; padding: 3px 8px; border-radius: 4px;">🟢 02 ĐÃ SẴN SÀNG</span>
          <span style="background: #FEF3C7; color: #92400E; font-size: 9.5px; font-weight: 700; padding: 3px 8px; border-radius: 4px;">🟡 11 ĐANG TRIỂN KHAI (TRƯỚC 05/11)</span>
          <span style="background: #DBEAFE; color: #1E40AF; font-size: 9.5px; font-weight: 700; padding: 3px 8px; border-radius: 4px;">🔵 02 KẾ HOẠCH (TRƯỚC 10/11)</span>
        </div>
      </div>
      <div style="font-size: 10px; color: #64748B; font-style: italic; border-top: 1px solid #E2E8F0; padding-top: 6px; margin-top: 6px;">
        ✦ Cam kết đồng hành vì sự phát triển bền vững của cộng đồng doanh nhân HanoiBA
      </div>
    </div>

    <!-- Right Poster Card -->
    <div style="flex: 0.9; display: flex; align-items: center; justify-content: center; height: 100%; box-sizing: border-box;">
      <img src="${posterDataUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 12px 28px rgba(0,0,0,0.3); border: 2px solid #00D2FF;" alt="Poster Thư Mời CEO 1983">
    </div>
  </div>

  <!-- SLIDE 2: TỔNG QUAN ĐIỀU HÀNH -->
  <div class="slide">
    <div class="slide-header" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div class="group-code">TỔNG QUAN ĐIỀU HÀNH</div>
        <div class="group-title">MỤC TIÊU CHIẾN LƯỢC &amp; CAM KẾT TIẾN ĐỘ ĐỢT 1</div>
        <div class="group-desc">Đơn giản hóa cho hội viên - Sắc bén cho Ban Điều Hành (Hoàn thiện toàn diện trước 05/11/2026)</div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; background: #FFFFFF; padding: 4px 10px; border-radius: 8px; border: 1px solid #E2E8F0; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
        <img src="${ceoLogoDataUrl}" style="height: 22px; object-fit: contain;" alt="CEO 1983">
        <div style="width: 1px; height: 16px; background: #CBD5E1;"></div>
        <a href="https://viconnect.vn" target="_blank" style="display: flex; align-items: center;">
          <img src="${viconnectLogoDataUrl}" style="height: 18px; object-fit: contain;" alt="ViConnect">
        </a>
      </div>
    </div>
    <div class="dash-grid" style="grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 4px 0 6px 0;">
      <div class="dash-card green" style="padding: 8px 10px;">
        <div style="font-weight: 700; font-size: 10.5px;">🟢 ĐÃ SẴN SÀNG</div>
        <div class="dash-num" style="font-size: 18px; margin: 2px 0;">02 HẠNG MỤC</div>
        <div style="font-size: 10px;">Trang chủ tinh gọn &amp; Bảo mật thẻ hội viên</div>
      </div>
      <div class="dash-card yellow" style="padding: 8px 10px;">
        <div style="font-weight: 700; font-size: 10.5px;">🟡 ĐANG TRIỂN KHAI</div>
        <div class="dash-num" style="font-size: 18px; margin: 2px 0;">11 HẠNG MỤC</div>
        <div style="font-size: 10px;">Cam kết hoàn thiện trước 05/11/2026</div>
      </div>
      <div class="dash-card blue" style="padding: 8px 10px;">
        <div style="font-weight: 700; font-size: 10.5px;">🔵 KẾ HOẠCH TIẾP THEO</div>
        <div class="dash-num" style="font-size: 18px; margin: 2px 0;">02 HẠNG MỤC</div>
        <div style="font-size: 10px;">Zalo OA / VNPAY &amp; CSDL (trước 10/11)</div>
      </div>
    </div>
    
    <!-- 4 Leader Feedback Cards in 2x2 Grid -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; flex: 1;">
      <!-- Leader 1 -->
      <div style="background: #FFFFFF; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 12px; font-weight: 800; color: #1F3864;">👤 Anh Thành (Phó Tổng Thư ký)</div>
          <span style="font-size: 9px; font-weight: 700; background: #FEF3C7; color: #92400E; padding: 2px 7px; border-radius: 4px; border: 1px solid #F59E0B;">SÀN B2B &amp; VOUCHER</span>
        </div>
        <div style="font-size: 10.5px; color: #991B1B; background: #FEF2F2; border-left: 3px solid #EF4444; padding: 5px 8px; border-radius: 4px; line-height: 1.45;">
          <strong>⚠️ Góp ý BĐH:</strong> Giới hạn 5 SP/DN tránh spam; bộ lọc ngành mua/bán; cơ chế voucher tri ân.
        </div>
        <div style="font-size: 10.5px; color: #065F46; font-weight: 600; background: #F0FDF4; border-left: 3px solid #10B981; padding: 5px 8px; border-radius: 4px; line-height: 1.45;">
          <strong>💡 Giải pháp ViConnect:</strong> Chuẩn hóa 5 SP, nén WebP, bộ lọc 10 ngành, mã Voucher định danh riêng.
        </div>
        <div style="font-size: 9px; color: #64748B; margin-top: auto; border-top: 1px dashed #E2E8F0; padding-top: 4px;">
          ✦ Tiến độ: Hoàn thành trước 05/11/2026 · Nền tảng: Mobile App &amp; Web CRM
        </div>
      </div>

      <!-- Leader 2 -->
      <div style="background: #FFFFFF; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 12px; font-weight: 800; color: #1F3864;">👤 Anh Tuấn (Phó Chủ tịch)</div>
          <span style="font-size: 9px; font-weight: 700; background: #D1FAE5; color: #065F46; padding: 2px 7px; border-radius: 4px; border: 1px solid #10B981;">TRANG CHỦ &amp; GIAN HÀNG</span>
        </div>
        <div style="font-size: 10.5px; color: #991B1B; background: #FEF2F2; border-left: 3px solid #EF4444; padding: 5px 8px; border-radius: 4px; line-height: 1.45;">
          <strong>⚠️ Góp ý BĐH:</strong> Rút gọn trang chủ quanh 4 chức năng cốt lõi; tạo không gian đặc quyền riêng.
        </div>
        <div style="font-size: 10.5px; color: #065F46; font-weight: 600; background: #F0FDF4; border-left: 3px solid #10B981; padding: 5px 8px; border-radius: 4px; line-height: 1.45;">
          <strong>💡 Giải pháp ViConnect:</strong> Tinh giản trang chủ 4 luồng; kiến tạo Gian Hàng Số Doanh Nghiệp độc quyền.
        </div>
        <div style="font-size: 9px; color: #64748B; margin-top: auto; border-top: 1px dashed #E2E8F0; padding-top: 4px;">
          ✦ Tiến độ: Đã sẵn sàng Trang chủ · Gian hàng hoàn thành trước 05/11/2026
        </div>
      </div>

      <!-- Leader 3 -->
      <div style="background: #FFFFFF; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 12px; font-weight: 800; color: #1F3864;">👤 Chị Phương (Phó ban Hội viên)</div>
          <span style="font-size: 9px; font-weight: 700; background: #DBEAFE; color: #1E40AF; padding: 2px 7px; border-radius: 4px; border: 1px solid #3B82F6;">DOANH SỐ &amp; HỘI PHÍ</span>
        </div>
        <div style="font-size: 10.5px; color: #991B1B; background: #FEF2F2; border-left: 3px solid #EF4444; padding: 5px 8px; border-radius: 4px; line-height: 1.45;">
          <strong>⚠️ Góp ý BĐH:</strong> Phân định cơ hội &amp; kết nối có doanh thu; cảnh báo trầm lắng; báo cáo phí.
        </div>
        <div style="font-size: 10.5px; color: #065F46; font-weight: 600; background: #F0FDF4; border-left: 3px solid #10B981; padding: 5px 8px; border-radius: 4px; line-height: 1.45;">
          <strong>💡 Giải pháp ViConnect:</strong> Xác thực hợp đồng 2 bên; gắn cờ trầm lắng; quản trị phí niên độ 365 ngày.
        </div>
        <div style="font-size: 9px; color: #64748B; margin-top: auto; border-top: 1px dashed #E2E8F0; padding-top: 4px;">
          ✦ Tiến độ: Hoàn thành trước 05/11/2026 · Nền tảng: Mobile App &amp; Web CRM
        </div>
      </div>

      <!-- Leader 4 -->
      <div style="background: #FFFFFF; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 12px; font-weight: 800; color: #1F3864;">👤 Chị Dung (Phó Chánh Văn phòng)</div>
          <span style="font-size: 9px; font-weight: 700; background: #EDE9FE; color: #5B21B6; padding: 2px 7px; border-radius: 4px; border: 1px solid #8B5CF6;">HỒ SƠ &amp; DÒNG THỜI GIAN</span>
        </div>
        <div style="font-size: 10.5px; color: #991B1B; background: #FEF2F2; border-left: 3px solid #EF4444; padding: 5px 8px; border-radius: 4px; line-height: 1.45;">
          <strong>⚠️ Góp ý BĐH:</strong> Trang cá nhân tổng hợp lịch sử tham gia sự kiện, cơ hội và kết nối 1-on-1.
        </div>
        <div style="font-size: 10.5px; color: #065F46; font-weight: 600; background: #F0FDF4; border-left: 3px solid #10B981; padding: 5px 8px; border-radius: 4px; line-height: 1.45;">
          <strong>💡 Giải pháp ViConnect:</strong> Xây dựng Dòng Thời Gian Hoạt Động (Timeline) và danh thiếp số 1 chạm.
        </div>
        <div style="font-size: 9px; color: #64748B; margin-top: auto; border-top: 1px dashed #E2E8F0; padding-top: 4px;">
          ✦ Tiến độ: Hoàn thành trước 05/11/2026 · Nền tảng: Mobile App CEO 1983
        </div>
      </div>
    </div>
  </div>

  ${groupsData
    .map(
      (grp, idx) => {
        if (grp.code === 'E') {
          const it = grp.items[0];
          return `
  <!-- SLIDE ${idx + 3}: NHÓM E - MEMBER PORTFOLIO -->
  <div class="slide">
    <div class="slide-header" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div class="group-code">PHÂN HỆ NGHIỆP VỤ E</div>
        <div class="group-title">${grp.title}</div>
        <div class="group-desc">${grp.desc}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; background: #FFFFFF; padding: 4px 10px; border-radius: 8px; border: 1px solid #E2E8F0; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
        <img src="${ceoLogoDataUrl}" style="height: 22px; object-fit: contain;" alt="CEO 1983">
        <div style="width: 1px; height: 16px; background: #CBD5E1;"></div>
        <a href="https://viconnect.vn" target="_blank" style="display: flex; align-items: center;">
          <img src="${viconnectLogoDataUrl}" style="height: 18px; object-fit: contain;" alt="ViConnect">
        </a>
      </div>
    </div>

    <!-- Item 15 Card -->
    <div class="item-card" style="padding: 10px 14px; margin-bottom: 6px;">
      <div class="item-header" style="margin-bottom: 3px;">
        <div class="item-name" style="font-size: 13.5px; font-weight: 800;">${it.stt}. ${it.title}</div>
        <span class="status-tag ${it.statusType}">${it.status} (${it.deadline})</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1.35fr; gap: 8px;">
        <div class="issue-box" style="padding: 6px 10px; font-size: 11px; line-height: 1.45;">
          <div style="font-weight: 700; margin-bottom: 2px;">⚠️ Vấn đề CLB phản ánh:</div>
          ${it.issue}
        </div>
        <div class="sol-box" style="padding: 6px 10px; font-size: 11px; line-height: 1.45;">
          <div style="font-weight: 700; margin-bottom: 2px;">💡 Giải pháp trọng tâm ViConnect:</div>
          ${it.solution}
        </div>
      </div>
    </div>

    <!-- 3 Member Portfolio Feature Columns -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; flex: 1;">
      <!-- Column 1 -->
      <div style="background: #FFFFFF; border: 1.5px solid #BFDBFE; border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; height: 100%; box-sizing: border-box;">
        <div style="display: flex; align-items: center; gap: 6px; border-bottom: 1.5px solid #DBEAFE; padding-bottom: 6px;">
          <span style="font-size: 17px;">🗓️</span>
          <div style="font-weight: 800; font-size: 12.5px; color: #1E40AF;">NHẬT KÝ SỰ KIỆN CLB</div>
        </div>
        <div style="flex: 1; background: #EFF6FF; border-radius: 6px; padding: 8px 10px; font-size: 10.5px; color: #1E3A8A; line-height: 1.45; display: flex; align-items: center;">
          <span><strong>🎫 Check-in QR:</strong> Tự động điểm danh &amp; ghi nhận có mặt tại các kỳ họp HanoiBA.</span>
        </div>
        <div style="flex: 1; background: #EFF6FF; border-radius: 6px; padding: 8px 10px; font-size: 10.5px; color: #1E3A8A; line-height: 1.45; display: flex; align-items: center;">
          <span><strong>📜 Lịch sử sinh hoạt:</strong> Lưu vết tất cả sự kiện đã tham dự &amp; tài liệu họp kèm theo.</span>
        </div>
        <div style="flex: 1; background: #EFF6FF; border-radius: 6px; padding: 8px 10px; font-size: 10.5px; color: #1E3A8A; line-height: 1.45; display: flex; align-items: center;">
          <span><strong>🎓 Đào tạo:</strong> Lưu chứng nhận hoàn thành các khóa huấn luyện quản trị doanh nghiệp.</span>
        </div>
        <div style="flex: 1; background: #EFF6FF; border-radius: 6px; padding: 8px 10px; font-size: 10.5px; color: #1E3A8A; line-height: 1.45; display: flex; align-items: center;">
          <span><strong>🏆 Điểm chuyên cần:</strong> Tích lũy huy hiệu hội viên tích cực &amp; vai trò ban điều hành.</span>
        </div>
      </div>

      <!-- Column 2 -->
      <div style="background: #FFFFFF; border: 1.5px solid #A7F3D0; border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; height: 100%; box-sizing: border-box;">
        <div style="display: flex; align-items: center; gap: 6px; border-bottom: 1.5px solid #D1FAE5; padding-bottom: 6px;">
          <span style="font-size: 17px;">💼</span>
          <div style="font-weight: 800; font-size: 12.5px; color: #065F46;">GIAO THƯƠNG &amp; DEAL FLOW</div>
        </div>
        <div style="flex: 1; background: #F0FDF4; border-radius: 6px; padding: 8px 10px; font-size: 10.5px; color: #064E3B; line-height: 1.45; display: flex; align-items: center;">
          <span><strong>🤝 Cơ hội B2B:</strong> Đăng tải &amp; kết nối nhu cầu mua/bán theo 10 ngành nghề trọng điểm.</span>
        </div>
        <div style="flex: 1; background: #F0FDF4; border-radius: 6px; padding: 8px 10px; font-size: 10.5px; color: #064E3B; line-height: 1.45; display: flex; align-items: center;">
          <span><strong>☕ Cafe 1-on-1:</strong> Đặt lịch hẹn &amp; lưu biên bản kết nối giữa các lãnh đạo doanh nghiệp.</span>
        </div>
        <div style="flex: 1; background: #F0FDF4; border-radius: 6px; padding: 8px 10px; font-size: 10.5px; color: #064E3B; line-height: 1.45; display: flex; align-items: center;">
          <span><strong>💰 Doanh số thực tế:</strong> Ghi nhận giá trị hợp đồng ký kết &amp; doanh thu thực phát sinh.</span>
        </div>
        <div style="flex: 1; background: #F0FDF4; border-radius: 6px; padding: 8px 10px; font-size: 10.5px; color: #064E3B; line-height: 1.45; display: flex; align-items: center;">
          <span><strong>⭐ Đánh giá uy tín:</strong> Chấm điểm đối tác giao thương minh bạch, văn minh trong CLB.</span>
        </div>
      </div>

      <!-- Column 3 -->
      <div style="background: #FFFFFF; border: 1.5px solid #FED7AA; border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; height: 100%; box-sizing: border-box;">
        <div style="display: flex; align-items: center; gap: 6px; border-bottom: 1.5px solid #FFEDD5; padding-bottom: 6px;">
          <span style="font-size: 17px;">🎖️</span>
          <div style="font-weight: 800; font-size: 12px; color: #9A3412;">ĐẶC QUYỀN &amp; GIAN HÀNG SỐ</div>
        </div>
        <div style="flex: 1; background: #FFF7ED; border-radius: 6px; padding: 8px 10px; font-size: 10.5px; color: #7C2D12; line-height: 1.45; display: flex; align-items: center;">
          <span><strong>🪪 Thẻ hội viên VIP:</strong> Danh thiếp số NFC/QR, kiểm soát bật/tắt bảo mật SĐT.</span>
        </div>
        <div style="flex: 1; background: #FFF7ED; border-radius: 6px; padding: 8px 10px; font-size: 10.5px; color: #7C2D12; line-height: 1.45; display: flex; align-items: center;">
          <span><strong>🎁 Kho Voucher:</strong> Ưu đãi chiết khấu đặc quyền dành riêng thành viên CEO 1983.</span>
        </div>
        <div style="flex: 1; background: #FFF7ED; border-radius: 6px; padding: 8px 10px; font-size: 10.5px; color: #7C2D12; line-height: 1.45; display: flex; align-items: center;">
          <span><strong>🏬 Gian hàng số:</strong> Trưng bày 5 sản phẩm/dịch vụ tiêu biểu của mỗi doanh nghiệp.</span>
        </div>
        <div style="flex: 1; background: #FFF7ED; border-radius: 6px; padding: 8px 10px; font-size: 10.5px; color: #7C2D12; line-height: 1.45; display: flex; align-items: center;">
          <span><strong>🌐 Hồ sơ doanh nghiệp:</strong> Đính kèm hồ sơ năng lực PDF &amp; website 1 chạm.</span>
        </div>
      </div>
    </div>
  </div>`;
        }

        // Groups A, B, C, D
        const isDense = grp.items.length === 4;
        return `
  <!-- SLIDE ${idx + 3}: NHÓM ${grp.code} -->
  <div class="slide">
    <div class="slide-header" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div class="group-code">PHÂN HỆ NGHIỆP VỤ ${grp.code}</div>
        <div class="group-title">${grp.title}</div>
        <div class="group-desc">${grp.desc}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; background: #FFFFFF; padding: 4px 10px; border-radius: 8px; border: 1px solid #E2E8F0; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
        <img src="${ceoLogoDataUrl}" style="height: 22px; object-fit: contain;" alt="CEO 1983">
        <div style="width: 1px; height: 16px; background: #CBD5E1;"></div>
        <a href="https://viconnect.vn" target="_blank" style="display: flex; align-items: center;">
          <img src="${viconnectLogoDataUrl}" style="height: 18px; object-fit: contain;" alt="ViConnect">
        </a>
      </div>
    </div>
    <div class="items-container" style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: ${isDense ? '5px' : '8px'};">
      ${grp.items
        .map(
          it => `
      <div class="item-card" style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; padding: ${isDense ? '6px 12px' : '8px 14px'};">
        <div class="item-header" style="margin-bottom: 2px;">
          <div class="item-name" style="font-size: ${isDense ? '12.5px' : '13.5px'}; font-weight: 800;">${it.stt}. ${it.title}</div>
          <span class="status-tag ${it.statusType}">${it.status} (${it.deadline})</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1.35fr; gap: 8px; flex: 1;">
          <div class="issue-box" style="font-size: ${isDense ? '10px' : '10.5px'}; padding: 5px 8px; line-height: 1.45; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;">
            <div style="font-weight: 700; margin-bottom: 2px;">⚠️ Vấn đề CLB phản ánh:</div>
            ${it.issue}
          </div>
          <div class="sol-box" style="font-size: ${isDense ? '10px' : '10.5px'}; padding: 5px 8px; line-height: 1.45; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;">
            <div style="font-weight: 700; margin-bottom: 2px;">💡 Giải pháp trọng tâm ViConnect:</div>
            ${it.solution}
          </div>
        </div>
      </div>`
        )
        .join('')}
      ${
        grp.code === 'A'
          ? `<div style="background: #F0FDF4; border: 1.5px dashed #10B981; border-radius: 8px; padding: 7px 14px; font-size: 10.5px; color: #065F46;">
               <strong>✦ Trọng tâm Nhóm A:</strong> Tối ưu trải nghiệm 1 chạm trên di động; bảo vệ dữ liệu cá nhân theo tiêu chuẩn an toàn thông tin doanh nghiệp.
             </div>`
          : ''
      }
      ${
        grp.code === 'B'
          ? `<div style="background: #FFFBEB; border: 1px dashed #F59E0B; border-radius: 8px; padding: 5px 12px; font-size: 10px; color: #92400E;">
               <strong>💡 Trọng tâm chiến lược Nhóm B:</strong> ViConnect triển khai bộ lọc danh mục ngành nghề đa tầng, kết nối trực tiếp cung - cầu và phát hành voucher tri ân hội viên.
             </div>`
          : ''
      }
      ${
        grp.code === 'C'
          ? `<div style="background: #EFF6FF; border: 1.5px dashed #3B82F6; border-radius: 8px; padding: 7px 14px; font-size: 10.5px; color: #1E40AF;">
               <strong>✦ Trọng tâm Nhóm C:</strong> Số hóa 100% check-in QR sự kiện; phân định rõ cơ hội giao thương và các phiên kết nối 1-1 có phát sinh deal thực tế.
             </div>`
          : ''
      }
    </div>
  </div>`;
      }
    )
    .join('')}

  <!-- SLIDE 8: KẾT LUẬN & CAM KẾT (RICH ROYAL NAVY) -->
  <div class="slide slide-dark" style="background-color: #001F54 !important; background: linear-gradient(135deg, #001F54 0%, #0A2540 60%, #003B95 100%) !important; color: #FFFFFF !important; display: flex; flex-direction: column; justify-content: space-between; padding: 22px 30px;">
    <!-- Top Header -->
    <div>
      <div class="badge-top" style="background: rgba(253, 224, 71, 0.2); color: #FDE047; border: 1px solid #FDE047; padding: 3px 12px; border-radius: 20px; font-size: 10.5px; font-weight: 700; margin-bottom: 4px;">CAM KẾT ĐỒNG HÀNH &amp; KẾ HOẠCH BÀN GIAO</div>
      <h1 style="font-size: 19px; font-weight: 800; color: #FFFFFF; margin: 4px 0 6px 0; line-height: 1.25;">LỘ TRÌNH TRIỂN KHAI TOÀN DIỆN &amp; CAM KẾT VICONNECT</h1>
    </div>

    <!-- 3 Phase Cards Side-by-Side -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 6px 0;">
      <!-- Phase 1 -->
      <div style="background: rgba(255, 255, 255, 0.08); border: 1.5px solid #10B981; border-radius: 8px; padding: 12px 14px; display: flex; flex-direction: column; justify-content: space-between; gap: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(16, 185, 129, 0.3); padding-bottom: 6px;">
          <div style="font-weight: 800; font-size: 11.5px; color: #34D399;">🟢 GIAI ĐOẠN 1: NỀN TẢNG</div>
          <span style="font-size: 9px; font-weight: 700; background: rgba(16, 185, 129, 0.25); color: #A7F3D0; padding: 2px 6px; border-radius: 4px;">ĐÃ SẴN SÀNG</span>
        </div>
        <div style="font-size: 10px; color: #F1F5F9; line-height: 1.6;">
          • Tinh gọn Trang chủ quanh 4 luồng cốt lõi.<br>
          • Bảo mật thẻ hội viên (công tắc ẩn/hiện SĐT &amp; Email).<br>
          • Tối ưu tốc độ &amp; giao diện di động mượt mà.<br>
          • Kiểm soát chặt chẽ phân quyền truy cập thông tin.
        </div>
      </div>

      <!-- Phase 2 -->
      <div style="background: rgba(255, 255, 255, 0.08); border: 1.5px solid #F59E0B; border-radius: 8px; padding: 12px 14px; display: flex; flex-direction: column; justify-content: space-between; gap: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(245, 158, 11, 0.3); padding-bottom: 6px;">
          <div style="font-weight: 800; font-size: 11.5px; color: #FBBF24;">🟡 GIAI ĐOẠN 2: TÍNH NĂNG</div>
          <span style="font-size: 9px; font-weight: 700; background: rgba(245, 158, 11, 0.25); color: #FDE68A; padding: 2px 6px; border-radius: 4px;">TRƯỚC 05/11</span>
        </div>
        <div style="font-size: 10px; color: #F1F5F9; line-height: 1.6;">
          • Hoàn thiện Sàn B2B (hạn mức 5 SP/DN, bộ lọc ngành).<br>
          • Kết nối Cafe 1-1 có xác thực hợp đồng &amp; deal thực tế.<br>
          • Check-in QR sự kiện &amp; phân phối vé điện tử.<br>
          • Dashboard CRM &amp; Báo cáo điều hành 4 trụ cột.
        </div>
      </div>

      <!-- Phase 3 -->
      <div style="background: rgba(255, 255, 255, 0.08); border: 1.5px solid #3B82F6; border-radius: 8px; padding: 12px 14px; display: flex; flex-direction: column; justify-content: space-between; gap: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(59, 130, 246, 0.3); padding-bottom: 6px;">
          <div style="font-weight: 800; font-size: 11.5px; color: #60A5FA;">🔵 GIAI ĐOẠN 3: ĐỒNG BỘ</div>
          <span style="font-size: 9px; font-weight: 700; background: rgba(59, 130, 246, 0.25); color: #BFDBFE; padding: 2px 6px; border-radius: 4px;">TRƯỚC 10/11</span>
        </div>
        <div style="font-size: 10px; color: #F1F5F9; line-height: 1.6;">
          • Phối hợp Ban Thư Ký nạp &amp; chuẩn hóa CSDL hội viên.<br>
          • Tích hợp Zalo OA tự động gửi thông báo &amp; vé mời.<br>
          • Cổng thanh toán VietQR động &amp; VNPAY Merchant.<br>
          • Bàn giao trọn bộ tài liệu &amp; quy chuẩn vận hành.
        </div>
      </div>
    </div>

    <!-- 3 Strategic Value Pillars -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 4px 0;">
      <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.18); border-radius: 6px; padding: 7px 10px; font-size: 9.5px; color: #E2E8F0; text-align: center;">
        🛡️ <strong>BẢO MẬT &amp; ĐỘC LẬP:</strong> Dữ liệu hội viên lưu trữ riêng biệt, phân quyền chặt chẽ.
      </div>
      <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.18); border-radius: 6px; padding: 7px 10px; font-size: 9.5px; color: #E2E8F0; text-align: center;">
        ⚡ <strong>TRẢI NGHIỆM 1 CHẠM:</strong> Mọi thao tác hội viên diễn ra dưới 3 giây, trực quan dễ dùng.
      </div>
      <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.18); border-radius: 6px; padding: 7px 10px; font-size: 9.5px; color: #E2E8F0; text-align: center;">
        📊 <strong>DỮ LIỆU ĐIỀU HÀNH:</strong> Báo cáo thời gian thực, đo lường chính xác hiệu quả giao thương.
      </div>
    </div>

    <!-- Quote Box -->
    <div style="background: rgba(0, 210, 255, 0.12); border-left: 4px solid #00D2FF; padding: 12px 16px; border-radius: 6px; font-style: italic; font-size: 11.5px; color: #E0F2FE; line-height: 1.55;">
      "Kính mời các Anh/Chị trong Ban Điều Hành xem xét Bảng đề xuất giải pháp chi tiết đính kèm và cho ý kiến chỉ đạo để ViConnect phối hợp triển khai đạt hiệu quả cao nhất phục vụ Hiệp hội. ViConnect cam kết đồng hành dài hạn vì sự phát triển thịnh vượng của CLB Doanh Nhân CEO 1983!"
    </div>

    <!-- Footer with Dual Logos -->
    <div class="cover-footer" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 8px; margin-top: 2px;">
      <div style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.95); padding: 4px 10px; border-radius: 8px;">
        <img src="${ceoLogoDataUrl}" style="height: 22px; object-fit: contain;" alt="CEO 1983">
        <div style="width: 1px; height: 16px; background: #CBD5E1;"></div>
        <a href="https://viconnect.vn" target="_blank" style="display: flex; align-items: center;">
          <img src="${viconnectLogoDataUrl}" style="height: 18px; object-fit: contain;" alt="ViConnect - https://viconnect.vn">
        </a>
      </div>
      <div style="font-size: 10.5px; color: #FDE047; font-weight: 700;">ĐƠN VỊ PHÁT TRIỂN CÔNG NGHỆ: VICONNECT (<a href="https://viconnect.vn" target="_blank" style="color: #00D2FF; text-decoration: none;">https://viconnect.vn</a>) · HÀ NỘI, 23/10/2026</div>
    </div>
  </div>

  <!-- NAVIGATION BAR -->
  <div class="controls">
    <button class="btn" id="prevBtn" onclick="changeSlide(-1)">◀ Slide Trước</button>
    <div class="counter" id="slideNum">Slide 1 / 8</div>
    <button class="btn" id="nextBtn" onclick="changeSlide(1)">Slide Tiếp Theo ▶</button>
  </div>
</div>

<script>
  let currentSlide = 0;
  const slides = document.querySelectorAll('.slide');
  const slideNum = document.getElementById('slideNum');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  function updateSlide() {
    slides.forEach((s, idx) => s.classList.toggle('active', idx === currentSlide));
    slideNum.textContent = 'Slide ' + (currentSlide + 1) + ' / ' + slides.length;
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === slides.length - 1;
  }

  function changeSlide(dir) {
    currentSlide += dir;
    if (currentSlide < 0) currentSlide = 0;
    if (currentSlide >= slides.length) currentSlide = slides.length - 1;
    updateSlide();
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') changeSlide(1);
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') changeSlide(-1);
  });

  updateSlide();
</script>
</body>
</html>`;

  const htmlPath = path.resolve(DOC_DIR, 'SLIDE_BAO_CAO_TIEP_THU_Y_KIEN_VA_GIAI_PHAP_VICONNECT.html');
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('Generated Standalone HTML Presentation:', htmlPath);
}

// 4. GENERATE CONCISE WORD DOCUMENT (BẢN TINH GỌN ÍT CHỮ)
async function generateConciseWordDoc() {
  const origPath = path.join(__dirname, '../document/[CEO 1983] BÁO CÁO TỔNG HỢP Ý KIẾN HỌP (1).docx');
  const targetPath = path.join(__dirname, '../document/[CEO 1983] BÁO CÁO TỔNG HỢP Ý KIẾN VÀ PHƯƠNG ÁN XỬ LÝ - VICONNECT (BẢN TINH GỌN).docx');

  const content = fs.readFileSync(origPath);
  const zip = await JSZip.loadAsync(content);

  // Helper to escape XML
  function xmlEscape(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  const colWidths = [560, 1400, 1900, 1400, 1900, 900, 1100, 4078, 1900];
  const totalWidth = 15138;

  function buildCellXml(text, width, options = {}) {
    const { fill = 'auto', vAlign = 'top', bold = false, color = '000000', align = 'left', gridSpan = null, fontSize = 17 } = options;
    let tcPr = `<w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>`;
    if (gridSpan) tcPr += `<w:gridSpan w:val="${gridSpan}"/>`;
    tcPr += `<w:tcBorders><w:top w:val="single" w:color="BFC8D6" w:sz="4" w:space="0"/><w:left w:val="single" w:color="BFC8D6" w:sz="4" w:space="0"/><w:bottom w:val="single" w:color="BFC8D6" w:sz="4" w:space="0"/><w:right w:val="single" w:color="BFC8D6" w:sz="4" w:space="0"/></w:tcBorders>`;
    if (fill !== 'auto') tcPr += `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>`;
    tcPr += `<w:tcMar><w:top w:w="70" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="50" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tcMar>`;
    tcPr += `<w:vAlign w:val="${vAlign}"/></w:tcPr>`;

    const lines = text ? text.split('\n') : [''];
    const pXml = lines
      .map(
        line =>
          `<w:p><w:pPr><w:spacing w:before="0" w:after="30" w:line="240" w:lineRule="auto"/><w:jc w:val="${align}"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:sz w:val="${fontSize}"/><w:szCs w:val="${fontSize}"/><w:color w:val="${color}"/>${bold ? '<w:b/><w:bCs/>' : ''}</w:rPr><w:t xml:space="preserve">${xmlEscape(line)}</w:t></w:r></w:p>`
      )
      .join('');

    return `<w:tc>${tcPr}${pXml}</w:tc>`;
  }

  function buildHeaderRow() {
    const headers = [
      { text: 'STT', width: colWidths[0] },
      { text: 'Hạng mục', width: colWidths[1] },
      { text: 'Vấn đề cần sửa (CLB)', width: colWidths[2] },
      { text: 'Mục đích', width: colWidths[3] },
      { text: 'Đề xuất giải pháp (CLB)', width: colWidths[4] },
      { text: 'Người góp ý', width: colWidths[5] },
      { text: 'Ưu tiên', width: colWidths[6] },
      { text: 'Giải Pháp & Ý Tưởng ViConnect\n(Bản Tinh Gọn - Trọng Tâm)', width: colWidths[7] },
      { text: 'Trạng Thái & Kế Hoạch\n(Đợt 1: Trước 05/11/2026)', width: colWidths[8] }
    ];

    const cellsXml = headers
      .map(h => buildCellXml(h.text, h.width, { fill: '1F3864', color: 'FFFFFF', bold: true, align: 'center', fontSize: 17, vAlign: 'center' }))
      .join('');
    return `<w:tr><w:trPr><w:cantSplit/><w:tblHeader/></w:trPr>${cellsXml}</w:tr>`;
  }

  function buildGroupRow(title) {
    const cellXml = buildCellXml(title, totalWidth, { gridSpan: 9, fill: 'DCE6F2', color: '1F3864', bold: true, fontSize: 19, align: 'left', vAlign: 'center' });
    return `<w:tr><w:trPr><w:cantSplit/></w:trPr>${cellXml}</w:tr>`;
  }

  function buildDataRow(item, origIssue, origGoal, origDeXuat, origPerson, origPriority) {
    let statusBg = 'D1FAE5';
    let statusColor = '065F46';
    if (item.statusType === 'IN_PROGRESS') {
      statusBg = 'FEF3C7';
      statusColor = '92400E';
    } else if (item.statusType === 'PLANNED') {
      statusBg = 'DBEAFE';
      statusColor = '1E40AF';
    }

    const rowCells = [
      buildCellXml(String(item.stt), colWidths[0], { align: 'center', bold: true, color: '1F3864' }),
      buildCellXml(item.title, colWidths[1], { bold: true }),
      buildCellXml(origIssue, colWidths[2]),
      buildCellXml(origGoal, colWidths[3]),
      buildCellXml(origDeXuat, colWidths[4]),
      buildCellXml(origPerson, colWidths[5], { align: 'center' }),
      buildCellXml(origPriority, colWidths[6], { bold: true, color: 'B54708', align: 'center', fontSize: 15 }),
      buildCellXml(`• ${item.solution}`, colWidths[7], { bold: false, color: '111827', fontSize: 16 }),
      buildCellXml(`${item.status}\n(${item.deadline})`, colWidths[8], { fill: statusBg, bold: true, color: statusColor, align: 'center', vAlign: 'center', fontSize: 16 })
    ];

    return `<w:tr><w:trPr><w:cantSplit/></w:trPr>${rowCells.join('')}</w:tr>`;
  }

  // Raw details mapped from groupsData
  const rawDetails = {
    1: { issue: 'Trang chủ có 8 ô tính năng nhanh, dàn trải.', goal: 'Đơn giản hóa để hội viên dùng thường xuyên.', clb: 'Rút gọn quanh 4 chức năng: Sự kiện, Tìm hội viên, Cơ hội, Góc hội viên.', person: 'Anh Tuấn\nAnh Thành', p: 'Cao · Đợt 1' },
    2: { issue: 'Chưa có tùy chọn ẩn/hiện email, SĐT trên thẻ.', goal: 'Bảo vệ quyền riêng tư của hội viên.', clb: 'Thêm công tắc ẩn/hiện email, SĐT. Tinh giản giao diện thẻ.', person: 'Ban Thư ký', p: 'Cao · Đợt 1' },
    3: { issue: 'Đặc quyền đang nằm chung tính năng nhanh.', goal: 'Tạo kênh quyền lợi riêng; mở hướng gian hàng số.', clb: 'Tách thành tính năng riêng. Nghiên cứu mô hình gian hàng triển lãm.', person: 'Anh Tuấn', p: 'Trung bình' },
    4: { issue: 'Chưa giới hạn số sản phẩm mỗi doanh nghiệp.', goal: 'Giữ sàn gọn, đủ tải; chống spam.', clb: 'Giới hạn tối đa 5 sản phẩm cần bán cho mỗi doanh nghiệp.', person: 'Anh Thành', p: 'Cao · Đợt 1' },
    5: { issue: 'Cần tra cứu theo ngành nghề; thông tin cần thu gọn.', goal: 'Doanh nghiệp tìm đúng đối tượng cần.', clb: 'Bổ sung tra cứu, lọc ngành nghề; giữ mức cơ bản mua/bán.', person: 'Anh Thành\nAnh Tuấn', p: 'Cao · Đợt 1' },
    6: { issue: 'Chưa có cơ chế giới thiệu & voucher; mục quảng cáo chưa rõ.', goal: 'Khuyến khích hội viên giới thiệu mở rộng mạng lưới.', clb: 'Giới thiệu nhận voucher tri ân; không làm affiliate.', person: 'Anh Thành', p: 'Trung bình' },
    7: { issue: 'Chưa phân biệt Cơ hội với Kết nối có doanh thu.', goal: 'Đo được hiệu quả giao thương thực tế của CLB.', clb: 'Tách 2 trạng thái Cơ hội & Kết nối. Ghi nhận giao dịch.', person: 'Chị Phương', p: 'Cao · Đợt 1' },
    8: { issue: 'Vé chỉ gửi qua email; chưa có Zalo OA & VNPAY.', goal: 'Thuận tiện thanh toán; nhận tin kênh quen thuộc.', clb: 'Gửi vé qua Zalo OA; tích hợp thanh toán VNPAY/VietQR.', person: 'BĐH', p: 'Cao · Đợt 1' },
    9: { issue: 'Check-in chưa gắn với lợi ích cụ thể.', goal: 'Khuyến khích hội viên tham gia sự kiện.', clb: 'Phát triển 2 dòng tính năng check-in gắn với lợi ích hội viên.', person: 'BĐH', p: 'Cần làm rõ' },
    10: { issue: 'Lịch họp chưa kèm thống kê; chưa có tiêu chí gia nhập.', goal: 'Đánh giá mức độ gặp gỡ; đặt điều kiện gia nhập.', clb: 'Lịch họp kèm thống kê; buộc tham gia họp định hướng mới vào CLB.', person: 'Chị Phương', p: 'Trung bình' },
    11: { issue: 'Thông tin hồ sơ cần chuẩn hóa; ngày sinh chưa đủ.', goal: 'Làm nền cho chăm sóc hội viên và báo cáo.', clb: 'Rà soát chuẩn hóa hồ sơ hội viên. Cập nhật ngày sinh.', person: 'Chị Phương', p: 'Cao · Trước triển khai' },
    12: { issue: 'Chưa có chỉ số tích cực; chưa cảnh báo ít hoạt động.', goal: 'Biến dữ liệu thành công cụ quản trị sắc bén.', clb: 'Chỉ số sự kiện, họp, giao thương; cảnh báo hội viên trầm lắng.', person: 'Chị Phương\nAnh Tuấn', p: 'Cao · Đợt 1' },
    13: { issue: 'Chưa có báo cáo phí và nhắc phí định kỳ.', goal: 'Theo dõi, thu phí đúng hạn.', clb: 'Báo cáo tình hình đóng phí. Nhắc phí định kỳ qua Zalo/SMS.', person: 'Chị Phương', p: 'Cao · Đợt 1' },
    14: { issue: 'Chưa có mẫu báo cáo định kỳ theo kỳ.', goal: 'Ban Điều Hành nắm tình hình CLB theo từng kỳ.', clb: 'Thiết kế mẫu báo cáo tháng/quý: tài chính, giao thương, tích cực.', person: 'Chị Phương', p: 'Trung bình' },
    15: { issue: 'Chưa có trang tổng hợp lịch sử sự kiện & cơ hội.', goal: 'Hội viên xem lại hành trình gắn bó CLB.', clb: 'Tổng hợp trên trang cá nhân: sự kiện, cơ hội, lịch sử giao thương.', person: 'Chị Dung', p: 'Trung bình' }
  };

  const gridColsXml = colWidths.map(w => `<w:gridCol w:w="${w}"/>`).join('');
  let rowsXml = buildHeaderRow();
  groupsData.forEach(grp => {
    rowsXml += buildGroupRow(`${grp.code}. ${grp.title}`);
    grp.items.forEach(item => {
      const raw = rawDetails[item.stt];
      rowsXml += buildDataRow(item, raw.issue, raw.goal, raw.clb, raw.person, raw.p);
    });
  });

  const tblPr = `<w:tblPr><w:tblW w:w="${totalWidth}" w:type="dxa"/><w:tblInd w:w="0" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:color="auto" w:sz="4" w:space="0"/><w:left w:val="single" w:color="auto" w:sz="4" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="4" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="4" w:space="0"/><w:insideH w:val="single" w:color="auto" w:sz="4" w:space="0"/><w:insideV w:val="single" w:color="auto" w:sz="4" w:space="0"/></w:tblBorders><w:tblLayout w:type="autofit"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="10" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="10" w:type="dxa"/></w:tblCellMar></w:tblPr>`;
  const tableXml = `<w:tbl>${tblPr}<w:tblGrid>${gridColsXml}</w:tblGrid>${rowsXml}</w:tbl>`;

  const conciseDocXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" mc:Ignorable="w14">
<w:body>
  <w:p><w:pPr><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:color w:val="B8860B"/><w:sz w:val="22"/></w:rPr><w:t>CLB DOANH NHÂN CEO 1983 (HANOIBA)  ·  ĐƠN VỊ CÔNG NGHỆ VICONNECT</w:t></w:r></w:p>
  <w:p><w:pPr><w:spacing w:after="60"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:color w:val="1F3864"/><w:sz w:val="32"/></w:rPr><w:t>BẢNG TỔNG HỢP TIẾP THU Ý KIẾN &amp; GIẢI PHÁP VICONNECT (BẢN TINH GỌN)</w:t></w:r></w:p>
  <w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:color="B8860B" w:sz="12" w:space="6"/></w:pBdr><w:spacing w:after="140"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:color w:val="475467"/><w:sz w:val="18"/></w:rPr><w:t>Căn cứ buổi họp ngày 21/10/2026  ·  Bản tóm tắt điều hành ít chữ, trực quan  ·  Ngày lập: 23/10/2026</w:t></w:r></w:p>

  <w:p><w:pPr><w:spacing w:before="100" w:after="60"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:color w:val="1F3864"/><w:sz w:val="22"/></w:rPr><w:t>I. TỔNG QUAN CAM KẾT TIẾN ĐỘ ĐỢT 1 (HOÀN THÀNH TRƯỚC 05/11/2026)</w:t></w:r></w:p>
  <w:p><w:pPr><w:spacing w:after="60"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:color w:val="1F3864"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Mục tiêu cốt lõi: </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="18"/></w:rPr><w:t>Đơn giản hóa cho hội viên dùng thường xuyên · Biến dữ liệu thành công cụ quản trị sắc bén cho Ban Điều Hành.</w:t></w:r></w:p>
  <w:p><w:pPr><w:spacing w:after="140"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:color w:val="1F3864"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">3 Trạng thái triển khai: </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:color w:val="059669"/><w:sz w:val="18"/></w:rPr><w:t>🟢 ĐÃ SẴN SÀNG (02 mục)</w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">  ·  </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:color w:val="D97706"/><w:sz w:val="18"/></w:rPr><w:t>🟡 ĐANG TRIỂN KHAI (11 mục - trước 05/11)</w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">  ·  </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:color w:val="1D4ED8"/><w:sz w:val="18"/></w:rPr><w:t>🔵 KẾ HOẠCH TIẾP THEO (02 mục - trước 10/11)</w:t></w:r></w:p>

  <w:p><w:pPr><w:spacing w:before="140" w:after="100"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:color w:val="1F3864"/><w:sz w:val="22"/></w:rPr><w:t>II. BẢNG ĐỐI SOÁT 15 Ý KIẾN HỌP &amp; GIẢI PHÁP TRỌNG TÂM</w:t></w:r></w:p>
  ${tableXml}

  <w:p><w:pPr><w:spacing w:before="160" w:after="100" w:line="260"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:i/><w:sz w:val="18"/><w:color w:val="1F3864"/></w:rPr><w:t xml:space="preserve">Kính mời các Anh/Chị trong Ban Điều Hành xem xét Bảng đề xuất giải pháp chi tiết đính kèm và cho ý kiến chỉ đạo để ViConnect phối hợp triển khai đạt hiệu quả cao nhất phục vụ Hiệp hội. Trân trọng cảm ơn và kính chúc các Anh/Chị trong Ban Điều Hành luôn dồi dào sức khỏe, chúc CLB Doanh Nhân CEO 1983 ngày càng phát triển vững mạnh!</w:t></w:r></w:p>

  <w:p><w:pPr><w:spacing w:before="200" w:after="40"/><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:i/><w:sz w:val="18"/><w:color w:val="475467"/></w:rPr><w:t>Hà Nội, ngày 23 tháng 10 năm 2026</w:t></w:r></w:p>
  <w:p><w:pPr><w:spacing w:before="0" w:after="200"/><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:color w:val="1F3864"/><w:sz w:val="20"/></w:rPr><w:t>ĐƠN VỊ PHÁT TRIỂN CÔNG NGHỆ VICONNECT   </w:t></w:r></w:p>

  <w:sectPr>
    <w:footerReference r:id="rId3" w:type="default"/>
    <w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>
    <w:pgMar w:top="700" w:right="850" w:bottom="700" w:left="850" w:header="708" w:footer="708" w:gutter="0"/>
    <w:cols w:space="720" w:num="1"/>
    <w:docGrid w:linePitch="360" w:charSpace="0"/>
  </w:sectPr>
</w:body>
</w:document>`;

  zip.file('word/document.xml', conciseDocXml);
  const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } });
  fs.writeFileSync(targetPath, buffer);
  console.log('Generated Concise Word Document:', targetPath);
}

// 5. GENERATE VECTOR PDF SLIDE DECK
function generatePdf() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const htmlPath = path.resolve(DOC_DIR, 'SLIDE_BAO_CAO_TIEP_THU_Y_KIEN_VA_GIAI_PHAP_VICONNECT.html');
  const pdfPath = path.resolve(DOC_DIR, 'SLIDE_BAO_CAO_TIEP_THU_Y_KIEN_VA_GIAI_PHAP_VICONNECT.pdf');

  if (fs.existsSync(edgePath)) {
    const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=3000 --print-to-pdf="${pdfPath}" --no-pdf-header-footer "${htmlPath}"`;
    try {
      execSync(cmd, { stdio: 'inherit' });
      console.log('Generated Vector PDF Slide Deck:', pdfPath);
    } catch (e) {
      console.error('Failed to export PDF via Edge:', e);
    }
  }
}

async function main() {
  console.log('--- STARTING EXECUTIVE SLIDES & NOTEBOOKLM GENERATION ---');
  generateNotebookLmMarkdown();
  generateHtmlSlideViewer();
  generatePdf();
  await generatePowerPoint();
  await generateConciseWordDoc();
  console.log('--- ALL ARTIFACTS SUCCESSFULLY GENERATED ---');
}

main().catch(console.error);
