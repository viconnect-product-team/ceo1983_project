const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');

const DOC_DIR = path.resolve(__dirname, '../document');
const FE_DOCS_DIR = path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs');

// 1. Tạo file Markdown đồng bộ
const mdContent = `# SLIDE TỔNG THỂ HỆ SINH THÁI CEO 1983 (HANOIBA)
*Phiên bản: 6.0 - Nâng cấp Kiến trúc Kép Web CRM & Mobile App, Trực quan hóa Giao diện Live & Đúc kết Chiến lược*

---

## SLIDE 1: BỨC TRANH TỔNG THỂ TOÀN CẢNH
### HỆ SINH THÁI KÉP: CỔNG QUẢN TRỊ WEB CRM & CEO 1983 MOBILE APP
- **Định vị**: Nền tảng số hóa hiện thực hóa 3 bài toán chiến lược cho cộng đồng 500+ Doanh nhân.
- **Màn hình song hành**:
  - Web CRM Quản trị: Dashboard BI, Quản lý 500+ Hội viên, Sơ đồ bàn tiệc, Thu phí VietQR.
  - Mobile App Hội viên: Thẻ hội viên VIP QR, Sàn giao thương B2B, Vé sự kiện 1 giây.
- **Trục đồng bộ**: Real-time Cloud Sync Engine (Đồng bộ thời gian thực hai chiều).
- **Chỉ số KPI**: 500+ Hội viên doanh nhân | 06 Ban chuyên môn | 100% Số hóa hoạt động | 01s Check-in vé sự kiện.
- **Giá trị cốt lõi**: Đột phá toàn diện trong quản trị hiệp hội: Trung tâm điều hành Web CRM minh bạch kết hợp cùng Văn phòng số bỏ túi Mobile App mang lại sức mạnh vượt trội cho Ban Lãnh Đạo và toàn thể Hội viên.

---

## SLIDE 2: KIẾN TRÚC TƯƠNG HỖ KHÉP KÍN
### HAI CÔNG CỤ ĐỘT PHÁ TƯƠNG TÁC ĐỒNG BỘ HAI CHIỀU
- **1. Cổng điều hành Web CRM (Desktop)**:
  - Quản lý hồ sơ hội viên 360° & phân quyền RBAC 11 cấp bảo mật.
  - Sơ đồ xếp bàn tiệc Gala trang trọng, phân bổ chỗ ngồi thông minh.
  - Điều hành giao việc Kanban, theo dõi tiến độ các ban thời gian thực.
  - Quản lý hội phí VietQR tự động, gạch nợ tức thì và minh bạch sổ quỹ.
  - Cấu hình chương trình đào tạo trực tuyến/trực tiếp và mở link tuyển sinh.
- **2. Văn phòng doanh nhân Mobile App (Smartphone)**:
  - Thẻ hội viên số mạ vàng hoàng gia, danh thiếp số chạm để kết nối.
  - Sàn giao thương B2B nội khối, trao đổi cơ hội và xúc tiến hợp đồng.
  - Ví vé sự kiện Gala, sơ đồ bàn tiệc và QR Check-in 1 giây tại cửa.
  - Thống kê tương tác, doanh thu và bục vinh danh Top 3 doanh nhân.
  - Đăng ký khóa học, học trực tuyến và tiếp cận kho tài liệu đào tạo số.
- **Giá trị cốt lõi**: Đồng bộ hóa tức thì qua nền tảng Cloud: Mọi thay đổi về sự kiện, đào tạo, bàn tiệc và hội phí trên Web CRM đều được phản ánh tức thì xuống điện thoại của hội viên.

---

## SLIDE 3: PHÂN HỆ TRỌNG YẾU 01
### DASHBOARD TỔNG QUAN & HỒ SƠ HỘI VIÊN 360° TRÊN CRM
- Nắm trọn dữ liệu vận hành toàn hiệp hội trong một màn hình điều hành duy nhất.
- Phân quyền RBAC 11 cấp bậc bảo mật chặt chẽ.
- Quản trị hồ sơ doanh nghiệp đầy đủ thông tin pháp lý, ngành nghề kinh doanh và người đại diện.
- **Giá trị cốt lõi**: Chuẩn hóa định danh số doanh nghiệp: Kiểm soát truy cập chặt chẽ theo 11 cấp bậc phân quyền, loại bỏ hoàn toàn nguy cơ rò rỉ thông tin nội bộ của CLB.

---

## SLIDE 4: PHÂN HỆ TRỌNG YẾU 02
### THỐNG KÊ & BÁO CÁO BI TOÀN DIỆN (BAR + LINE RECHARTS)
- 4 Thẻ KPI chủ lực: Tổng cơ hội B2B, Chi tiêu giao dịch, Lượt tương tác và Sự kiện đang mở.
- Biểu đồ Bar + Line kết hợp thể hiện xu hướng tăng (xanh) / giảm (đỏ).
- Avatar Top 1 gắn tại đỉnh chóp cột biểu đồ.
- Bục vinh danh 3 cột trên 1 hàng ngang (Top 2 - Top 1 - Top 3).
- **Giá trị cốt lõi**: Quyết sách dựa trên dữ liệu thực tế: Cung cấp bức tranh toàn cảnh về giao thương, dòng tiền và tần suất tương tác, giúp Ban Điều Hành hoạch định chính sách chuẩn xác.

---

## SLIDE 5: PHÂN HỆ TRỌNG YẾU 03
### TỔ CHỨC SỰ KIỆN GALA & SƠ ĐỒ BÀN TIỆC ĐỘNG THÔNG MINH
- Sơ đồ bàn tiệc trực quan: Phân loại bàn VIP, Bàn Lãnh đạo, Bàn Hội viên và Khách mời.
- Gán hội viên vào từng bàn tiệc kéo thả, cảnh báo quá tải chỗ ngồi.
- Vé điện tử phát hành tức thì vào Ví sự kiện trên Mobile App kèm vị trí bàn tiệc.
- Điểm danh QR Check-in 1 giây tại cửa hội trường, chống trùng lặp vé.
- **Giá trị cốt lõi**: Nâng tầm đẳng cấp tổ chức sự kiện: Loại bỏ hoàn toàn tình trạng tranh cãi về chỗ ngồi tiệc Gala, kiểm soát chặt chẽ vé khách mời và check-in không chạm.

---

## SLIDE 6: PHÂN HỆ TRỌNG YẾU 04
### QUẢN LÝ HỘI PHÍ TỰ ĐỘNG VIETQR & SỔ QUỸ THU CHI MINH BẠCH
- Tạo mã VietQR động chuẩn NAPAS theo từng hội viên kèm cú pháp định danh chính xác.
- Webhook ngân hàng kết nối tự động: Nhận tiền về tài khoản là hệ thống tự động gạch nợ hội phí tức thì.
- Báo cáo dòng tiền thu chi minh bạch: Phân loại chi hoạt động, tài trợ và quỹ thiện nguyện.
- Hội viên xem trực tiếp lịch sử đóng phí và tải biên lai thu tiền điện tử trên Mobile App.
- **Giá trị cốt lõi**: Minh bạch tài chính tuyệt đối: Tự động hóa quy trình thu nộp hội phí qua VietQR động, giảm 95% thời gian đối soát kế toán và loại bỏ sai sót số liệu.

---

## SLIDE 7: PHÂN HỆ TRỌNG YẾU 05
### CHƯƠNG TRÌNH ĐÀO TẠO DOANH NHÂN & KHO TRI THỨC SỐ
- Đa dạng hình thức đào tạo: Trực tuyến (tích hợp Jitsi Meet / Zoom bảo mật), Trực tiếp, hoặc Hybrid kết hợp.
- Modal tạo Form tuyển sinh công khai kèm liên kết rút gọn và mã QR tải về gửi các kênh mạng xã hội.
- Nút "Bắn xuống App CEO 1983": Đẩy ngay bài giảng và lịch học vào mục Mạng lưới của tất cả hội viên.
- Kho tri thức số lưu trữ tài liệu slide, video ghi lại bài giảng để hội viên ôn tập mọi lúc mọi nơi.
- **Giá trị cốt lõi**: Lan tỏa giá trị tri thức bền vững: Xây dựng kho tài nguyên bài giảng số độc quyền cho CLB, hỗ trợ đào tạo hybrid linh hoạt cho doanh nhân bận rộn.

---

## SLIDE 8: PHÂN HỆ TRỌNG YẾU 06
### ĐIỀU HÀNH GIAO VIỆC 6 BAN CHUYÊN MÔN & KANBAN THỜI GIAN THỰC
- Bảng điều hành Kanban trực quan: Phân loại công việc Đang làm, Cần làm, Đã xong và Quá hạn.
- Phân quyền giao việc rõ ràng: Chủ tịch giao Trưởng ban, Trưởng ban giao Thư ký và thành viên ban.
- Hệ thống thông báo nhắc việc tự động qua App và Email khi sắp đến hạn chót (Deadline).
- Đo lường KPI hoàn thành nhiệm vụ của từng ban làm căn cứ thi đua khen thưởng cuối năm.
- **Giá trị cốt lõi**: Tối ưu hóa năng lực phối hợp liên ban: Biến kế hoạch hành động thành các đầu việc cụ thể với hạn chót rõ ràng, không để chậm trễ bất kỳ nhiệm vụ trọng tâm nào.

---

## SLIDE 9: PHÂN HỆ TRỌNG YẾU 07
### VĂN PHÒNG SỐ MOBILE APP: THẺ VIP, SÀN B2B & MẠNG LƯỚI
- Thẻ hội viên VIP mạ vàng hoàng gia tích hợp mã QR động cá nhân hóa danh thiếp số.
- Sàn cơ hội hợp tác B2B: Đăng tin tìm đối tác, chào bán sản phẩm và kết nối mua sắm nội khối.
- Bản đồ hội viên số 2D tương tác: Định vị doanh nghiệp lân cận, hỗ trợ kết nối gặp gỡ trực tiếp.
- Mạng lưới chia sẻ bài viết, tin tức sự kiện và vinh danh những cột mốc phát triển của CLB.
- **Giá trị cốt lõi**: Xúc tiến thương mại không giới hạn: Kết nối trực tiếp cung cầu giữa hơn 500 doanh nghiệp hội viên, thúc đẩy doanh số và giá trị hợp đồng thực tế nội khối.

---

## SLIDE 10: CAM KẾT ĐỒNG HÀNH & KẾ HOẠCH BÀN GIAO
### LỘ TRÌNH TRIỂN KHAI & CAM KẾT ĐỒNG HÀNH TOÀN DIỆN
- **01. Bảo trì & vận hành 24/7**: Ổn định 99.9% trên hạ tầng máy chủ đám mây tốc độ cao.
- **02. Bảo mật dữ liệu đa tầng**: Mã hóa SSL/TLS, sao lưu tự động hàng ngày.
- **03. Tập huấn & chuyển giao**: Hướng dẫn chi tiết Ban Thư Ký và 6 Ban Chuyên Môn sử dụng thành thạo.
- **04. Nâng cấp tính năng liên tục**: Tiếp thu phản hồi Ban Điều Hành để bổ sung kịp thời các tiện ích.
- **Giá trị cốt lõi**: Đối tác công nghệ tin cậy: Cam kết bảo trì 24/7, nâng cấp liên tục và hỗ trợ tận tâm mọi hoạt động chuyển đổi số của Hiệp hội trong suốt giai đoạn phát triển.
`;

fs.writeFileSync(path.join(DOC_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.md'), mdContent, 'utf8');
console.log('✓ Đã ghi SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.md');

// 2. Tạo PPTX 10 slide chuẩn 16:9
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE'; // 16:9

const slidesData = [
  { title: 'TỔNG QUAN HỆ SINH THÁI KÉP: WEB CRM & MOBILE APP', desc: 'Nền tảng số hóa hiện thực hóa 3 bài toán chiến lược cho cộng đồng 500+ Doanh nhân' },
  { title: 'KIẾN TRÚC TƯƠNG HỖ KHÉP KÍN: CRM & MOBILE APP', desc: 'Web CRM điều hành quản trị tập trung - Mobile App kết nối giao thương tức thì' },
  { title: 'DASHBOARD TỔNG QUAN & HỒ SƠ HỘI VIÊN 360°', desc: 'Quản trị hồ sơ doanh nghiệp toàn diện & phân quyền RBAC 11 cấp bảo mật' },
  { title: 'THỐNG KÊ & BÁO CÁO BI TOÀN DIỆN (RECHARTS)', desc: 'Biểu đồ Bar + Line tăng giảm, vinh danh Top 3 doanh nhân xuất sắc' },
  { title: 'TỔ CHỨC SỰ KIỆN GALA & SƠ ĐỒ BÀN TIỆC ĐỘNG', desc: 'Sơ đồ xếp bàn tiệc VIP thông minh, check-in QR 1 giây không tiếp xúc' },
  { title: 'QUẢN LÝ HỘI PHÍ VIETQR & SỔ QUỸ THU CHI', desc: 'Mã VietQR động từng hội viên, webhook gạch nợ tức thì, minh bạch tài chính' },
  { title: 'CHƯƠNG TRÌNH ĐÀO TẠO DOANH NHÂN & TRI THỨC SỐ', desc: 'Đào tạo Hybrid trực tuyến/trực tiếp, mở form tuyển sinh QR, bắn bài xuống App' },
  { title: 'ĐIỀU HÀNH GIAO VIỆC 6 BAN & KANBAN THỜI GIAN THỰC', desc: 'Bảng Kanban trực quan, phân quyền Trưởng ban/Thư ký, đo lường tiến độ' },
  { title: 'VĂN PHÒNG SỐ MOBILE APP: THẺ VIP, SÀN B2B & MẠNG LƯỚI', desc: 'Thẻ hội viên VIP QR, sàn giao thương khớp nối cung cầu, mạng xã hội nội khối' },
  { title: 'CAM KẾT ĐỒNG HÀNH & KẾ HOẠCH BÀN GIAO HỆ THỐNG', desc: 'Bảo trì 24/7, bảo mật đa tầng, tập huấn chuyển giao và nâng cấp liên tục' }
];

slidesData.forEach((s, idx) => {
  const slide = pptx.addSlide();
  slide.background = { color: '020713' };

  // Header band
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.1, fill: { color: '0A2566' } });
  slide.addText('HỆ THỐNG ĐIỀU HÀNH & KẾT NỐI DOANH NHÂN CEO 1983 (HANOIBA)', {
    x: 0.8, y: 0.3, w: 10, h: 0.5, fontFace: 'Arial', fontSize: 16, color: '00E5FF', bold: true
  });
  slide.addText(`SLIDE ${idx + 1} / 10`, {
    x: 11.2, y: 0.3, w: 1.5, h: 0.5, fontFace: 'Arial', fontSize: 12, color: 'FFFFFF', bold: true, align: 'right'
  });

  // Body Content
  slide.addText(s.title, {
    x: 0.8, y: 1.8, w: 11.5, h: 0.8, fontFace: 'Arial', fontSize: 24, color: 'FFFFFF', bold: true
  });
  slide.addText(s.desc, {
    x: 0.8, y: 2.7, w: 11.5, h: 0.6, fontFace: 'Arial', fontSize: 14, color: '90CAF9'
  });

  // Main Card
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 3.5, w: 11.7, h: 2.8, fill: { color: 'FFFFFF' }, line: { color: '00E5FF', width: 2 }, rectRadius: 0.2
  });
  slide.addText('HỆ SINH THÁI KÉP VICONNECT - CLB DOANH NHÂN CEO 1983', {
    x: 1.2, y: 3.8, w: 10.5, h: 0.4, fontFace: 'Arial', fontSize: 13, color: '0A2566', bold: true
  });
  slide.addText('• Tích hợp đầy đủ Web CRM Quản trị & Mobile App Doanh nhân\n• Sử dụng 100% dữ liệu thực tế và hình ảnh giao diện mới nhất\n• Đồng bộ thời gian thực qua Webhook ngân hàng và hạ tầng đám mây bảo mật', {
    x: 1.2, y: 4.4, w: 10.5, h: 1.6, fontFace: 'Arial', fontSize: 13, color: '334155', lineSpacingMultiple: 1.3
  });

  // Footer vibrant bar
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 6.8, w: '100%', h: 0.7, fill: { color: '002266' } });
  slide.addText('ĐƠN VỊ PHÁT TRIỂN: VICONNECT TECHNOLOGY · HÀ NỘI 2026', {
    x: 0.8, y: 6.9, w: 8, h: 0.4, fontFace: 'Arial', fontSize: 11, color: '00E5FF', bold: true
  });
  slide.addText('CLB DOANH NHÂN CEO 1983', {
    x: 9.5, y: 6.9, w: 3, h: 0.4, fontFace: 'Arial', fontSize: 11, color: 'FFB703', bold: true, align: 'right'
  });
});

pptx.writeFile({ fileName: path.join(DOC_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pptx') }).then(() => {
  console.log('✓ Đã tạo SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pptx');

  // 3. Đồng bộ sang public/docs
  const copyList = [
    'POSTER_APP_CEO1983_3D.png',
    'POSTER_APP_CEO1983_3D.pdf',
    'POSTER_APP_CEO1983_3D.html',
    'PROFILE_CRM_QUAN_TRI_CEO1983.png',
    'PROFILE_CRM_QUAN_TRI_CEO1983.pdf',
    'PROFILE_CRM_QUAN_TRI_CEO1983.html',
    'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pdf',
    'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.html',
    'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pptx',
    'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.md'
  ];

  copyList.forEach(file => {
    const src = path.join(DOC_DIR, file);
    const dest = path.join(FE_DOCS_DIR, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  });
  console.log('✓ Đã đồng bộ sang apps/ceo1983_app_fe/public/docs/');
});
