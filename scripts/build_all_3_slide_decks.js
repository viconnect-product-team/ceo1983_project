/**
 * BUILD_ALL_3_SLIDE_DECKS.JS
 * Tạo mới hoàn toàn 3 bản Slide thuyết trình chuyên nghiệp cho CEO 1983:
 * 1. SLIDE_CRM_QUAN_TRI_CEO1983 (Web CRM)
 * 2. SLIDE_APP_HIEP_HOI_CEO1983 (Mobile App)
 * 3. SLIDE_TONG_THE_HE_SINH_THAI_CEO1983 (Tổng thể gộp cả hai)
 *
 * Định dạng:
 * - HTML Presentation 16:9 mượt mà, responsive, không bao giờ lỗi font, màu chuẩn CEO 1983
 * - PPTX Presentation 16:9 dùng pptxgenjs
 * - Markdown Documentation trong document/
 */

const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');

const DOC_DIR = path.resolve(__dirname, '../document');
const DOCS_DIR = path.resolve(__dirname, '../docs');
const FE_DOCS_DIR = path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs');

[DOC_DIR, DOCS_DIR, FE_DOCS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Bảng màu chuẩn thương hiệu CEO 1983 (HanoiBA)
const C = {
  NAVY_DARK: '0A192F',
  NAVY_PRIMARY: '003B95',
  NAVY_LIGHT: '1E3A8A',
  GOLD_ACCENT: 'F59E0B',
  GOLD_DARK: 'D97706',
  GOLD_LIGHT: 'FEF3C7',
  BG_LIGHT: 'F8FAFC',
  WHITE: 'FFFFFF',
  TEXT_DARK: '0F172A',
  TEXT_BODY: '334155',
  TEXT_MUTED: '64748B',
  BORDER: 'E2E8F0',
  EMERALD: '10B981',
};

// -------------------------------------------------------------
// [A] DỮ LIỆU NỘI DUNG 3 BẢN SLIDE (Ít chữ, câu từ thông minh, súc tích)
// -------------------------------------------------------------

// DECK 1: WEB CRM
const CRM_SLIDES = [
  {
    type: 'cover',
    tag: 'CỔNG QUẢN TRỊ & ĐIỀU HÀNH HIỆP HỘI',
    title: 'HỆ THỐNG WEB CRM CEO 1983',
    subtitle: 'Chuẩn hóa quy trình vận hành · Minh bạch tài chính · Tối ưu hiệu suất lãnh đạo',
    footer: 'CLB Doanh Nhân CEO 1983 · Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA)',
  },
  {
    type: 'comparison',
    title: 'Thách Thức Quản Trị & Giải Pháp Số Hóa',
    subtitle: 'Chuyển đổi từ mô hình quản lý phân tán sang nền tảng tập trung duy nhất',
    col1_title: 'Quản Trị Thủ Công Trước Đây',
    col1_items: [
      'Dữ liệu hội viên lưu file rời rạc, khó đối soát',
      'Thất thoát và chậm trễ thu hội phí thường niên',
      'Sắp xếp chỗ ngồi Gala nhầm lẫn, mất thời gian',
      'Phân quyền lỏng lẻo, rủi ro bảo mật thông tin',
    ],
    col2_title: 'Hệ Thống CRM CEO 1983',
    col2_items: [
      'Hồ sơ doanh nghiệp 360° chính danh, chuẩn hóa',
      'Tự động sinh mã VietQR Napas 247, gạch nợ tức thì',
      'Sơ đồ xếp chỗ Cinema Map & Soát vé QR 0.1s',
      'Ma trận phân quyền Sticky 2 cột cho 10 vai trò',
    ],
  },
  {
    type: 'kpi',
    title: 'Hiệu Quả Vận Hành Đo Lường Bằng Số Liệu',
    subtitle: 'Các chỉ số ấn tượng khẳng định năng lực quản trị vượt bậc của hệ sinh thái',
    kpis: [
      { num: '500+', label: 'Doanh Nghiệp Hội Viên', desc: 'Thẩm định pháp lý chính danh 100%' },
      { num: '100%', label: 'Đối Soát Tự Động', desc: 'Gạch nợ hội phí tức thời qua VietQR' },
      { num: '0.1s', label: 'Tốc Độ Soát Vé QR', desc: 'Check-in sự kiện không chạm qua camera' },
      { num: '0', label: 'Sai Sót Xếp Chỗ', desc: 'Khán phòng trực quan Cinema Seating Map' },
    ],
  },
  {
    type: 'feature',
    title: 'Quản Trị Hội Viên & Hồ Sơ Doanh Nghiệp 360°',
    subtitle: 'Nền tảng lưu trữ và thẩm định năng lực thành viên tin cậy bậc nhất',
    bullets: [
      { strong: 'Hồ sơ pháp lý đầy đủ:', text: 'Mã số thuế, giấy phép ĐKKD, ban chuyên môn và nhiệm kỳ.' },
      { strong: 'Xác thực chính ngạch:', text: 'Quy trình xét duyệt hội viên 3 cấp (Thư ký -> Trưởng ban -> Ban Điều Hành).' },
      { strong: 'Phân loại ngành nghề:', text: 'Gắn thẻ lĩnh vực B2B giúp gợi ý giao thương trúng đích.' },
      { strong: 'Lịch sử hoạt động:', text: 'Theo dõi điểm chuyên cần, sự kiện tham gia và đóng góp phong trào.' },
    ],
  },
  {
    type: 'feature',
    title: 'Sơ Đồ Xếp Chỗ Rạp Phim (Cinema Seating Studio)',
    subtitle: 'Đột phá tổ chức sự kiện: Phân khu bàn ghế thông minh không nhầm lẫn',
    bullets: [
      { strong: 'Mô phỏng sân khấu thực tế:', text: 'Giao diện Screen trung tâm và lưới hàng ghế A, B, C, D trực quan.' },
      { strong: 'Phân khu màu sắc chuyên nghiệp:', text: 'Khu VIP Lãnh đạo (Vàng), Ban Chấp Hành (Xanh), Hội viên (Ngọc).' },
      { strong: 'Gán chỗ 1 chạm:', text: 'Click chọn đại biểu để xếp ghế; tự động khóa ghế chống trùng lặp.' },
      { strong: 'Đón tiếp chuẩn xác:', text: 'Lễ tân quét vé thấy ngay số ghế để dẫn khách về đúng vị trí.' },
    ],
  },
  {
    type: 'feature',
    title: 'Cổng Soát Vé QR Gatekeeper & Standee Zalo',
    subtitle: 'Đón tiếp đại biểu thần tốc, linh hoạt cho cả hội viên và khách mời ngoài',
    bullets: [
      { strong: 'Soát vé QR 0.1 giây:', text: 'Nhận diện tức thì qua camera máy tính bảng/điện thoại lễ tân.' },
      { strong: 'Standee Zalo sảnh chờ:', text: 'Mã QR công khai cho khách ngoài quét Zalo mở ngay form đăng ký.' },
      { strong: 'Mã may mắn Lucky Draw:', text: 'Tự động cấp số bốc thăm trúng thưởng (#8388) dập nổi trên vé.' },
      { strong: 'Gửi Email tự động:', text: 'Xác nhận vé điện tử E-Ticket tức thì qua hộp thư của đại biểu.' },
    ],
  },
  {
    type: 'feature',
    title: 'Quản Trị Tài Chính & Đối Soát Hội Phí VietQR',
    subtitle: 'Minh bạch từng đồng thu chi, gạch nợ tự động không cần kế toán kiểm đếm',
    bullets: [
      { strong: 'Mã VietQR động Napas 247:', text: 'Nhúng sẵn số tiền và cú pháp hóa đơn, quét là chuyển tiền chuẩn 100%.' },
      { strong: 'Gạch nợ tức thời:', text: 'Hệ thống tự động kích hoạt trạng thái hội viên ngay khi tiền về tài khoản.' },
      { strong: 'Sổ quỹ thu chi minh bạch:', text: 'Theo dõi quỹ hoạt động, tài trợ sự kiện và giải ngân chi tiết.' },
      { strong: 'Xuất báo cáo tài chính:', text: 'Trích xuất báo cáo kế toán chuẩn mực phục vụ đại hội thường niên.' },
    ],
  },
  {
    type: 'feature',
    title: 'Ma Trận Phân Quyền Sticky 2 Cột (Advanced RBAC)',
    subtitle: 'Kiểm soát an toàn thông tin tuyệt đối với 10 vai trò trên 11 module chức năng',
    bullets: [
      { strong: '10 Vai trò hành chính:', text: 'Chủ tịch, Phó Chủ tịch, Tổng thư ký, Trưởng ban, Kế toán, Hội viên...' },
      { strong: 'Giao diện Sticky chống trôi:', text: 'Cố định cột Vai trò và Nhóm quyền khi cuộn ngang dọc tiện lợi.' },
      { strong: 'Cập nhật phân quyền tức thì:', text: 'Áp dụng quyền mới ngay lập tức mà không cần đăng nhập lại.' },
      { strong: 'Nhật ký kiểm toán (Audit Log):', text: 'Ghi vết 100% thao tác sửa đổi dữ liệu bảo vệ hệ thống.' },
    ],
  },
  {
    type: 'flow',
    title: 'Điều Hành Công Việc Kanban & Biểu Quyết Số',
    subtitle: 'Giao việc minh bạch theo ban chuyên môn và bỏ phiếu đại hội bảo mật',
    steps: [
      { num: '01', title: 'Giao Việc Phân Ban', desc: 'Chủ tịch/Trưởng ban tạo task, gán người phụ trách và hạn chót.' },
      { num: '02', title: 'Báo Cáo Tiến Độ', desc: 'Kéo thả thẻ Kanban, cập nhật % hoàn thành và đính kèm hồ sơ.' },
      { num: '03', title: 'Tạo Phiên Biểu Quyết', desc: 'Ban Thư Ký thiết lập câu hỏi bầu cử và danh sách cử tri hợp lệ.' },
      { num: '04', title: 'Bỏ Phiếu & Xuất Kết Quả', desc: 'Bỏ phiếu điện tử mã hóa, công bố tỷ lệ % chuẩn xác theo thời gian thực.' },
    ],
  },
  {
    type: 'closing',
    tag: 'CAM KẾT VẬN HÀNH',
    title: 'VẬN HÀNH BỀN VỮNG · DẪN ĐẦU KỶ NGUYÊN SỐ',
    subtitle: 'Sẵn sàng phục vụ toàn diện công tác điều hành của Ban Lãnh Đạo CLB CEO 1983',
    bullets: [
      'Hạ tầng Cloud ổn định 99.9% uptime, sao lưu dữ liệu tự động hàng ngày',
      'Đội ngũ kỹ sư ViConnect đồng hành hỗ trợ kỹ thuật và đào tạo 24/7',
      'Bảo mật tuyệt đối thông tin danh bạ và bí mật kinh doanh doanh nghiệp',
    ],
  },
];

// DECK 2: MOBILE APP
const APP_SLIDES = [
  {
    type: 'cover',
    tag: 'ỨNG DỤNG DI ĐỘNG HỘI VIÊN',
    title: 'CEO 1983 MOBILE APP',
    subtitle: 'Hiệp hội Doanh nhân bỏ túi · Thẻ VIP quyền năng · Kết nối giao thương B2B thực chiến',
    footer: 'CLB Doanh Nhân CEO 1983 · Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA)',
  },
  {
    type: 'comparison',
    title: 'Bước Tiến Kết Nối Của Doanh Nhân 1983',
    subtitle: 'Chuyển dịch từ kết nối thụ động sang công cụ số chủ động và chuyên nghiệp',
    col1_title: 'Cách Thức Kết Nối Cũ',
    col1_items: [
      'Dùng danh thiếp giấy dễ thất lạc, tốn kém',
      'Hỏi thăm cơ hội kinh doanh qua tin nhắn rời rạc',
      'Đến sự kiện phải xếp hàng tìm tên trên giấy',
      'Khó nhớ lĩnh vực hoạt động của 500+ hội viên',
    ],
    col2_title: 'CEO 1983 Mobile App',
    col2_items: [
      'Thẻ VIP điện tử & Mã QR lưu danh bạ vCard 1 chạm',
      'Sàn B2B niêm yết sản phẩm ưu đãi đặc quyền',
      'Ví vé E-ticket QR check-in 0.1s kèm số ghế VIP',
      'Danh bạ chính danh 100% tích xanh, hẹn 1-on-1',
    ],
  },
  {
    type: 'feature',
    title: 'Thẻ Hội Viên VIP Mạ Vàng & Danh Thiếp vCard',
    subtitle: 'Tấm danh thiếp số quyền năng định danh đẳng cấp doanh nhân bản lĩnh',
    bullets: [
      { strong: 'Thiết kế hoàng gia Warm Amber Gold:', text: 'Tông xanh Cobalt Navy kết hợp vàng ánh kim tinh tế.' },
      { strong: 'Xoay lật 2 mặt mượt mà:', text: 'Mặt trước hiển thị họ tên, chức vụ; mặt sau là mã QR Code động độc bản.' },
      { strong: 'Xuất danh bạ vCard 1 chạm:', text: 'Đối tác quét mã là lưu thẳng tên, SĐT, email vào danh bạ không cần app.' },
      { strong: 'Hồ sơ năng lực 360°:', text: 'Tích hợp liên kết website, catalog và nhu cầu kết nối kinh doanh.' },
    ],
  },
  {
    type: 'feature',
    title: 'Sàn Giao Thương B2B Khớp Nối Cung - Cầu',
    subtitle: 'Thúc đẩy mua bán nội bộ: Ưu tiên dùng sản phẩm của nhau không qua trung gian',
    bullets: [
      { strong: 'Gian hàng doanh nghiệp:', text: 'Mỗi CEO sở hữu không gian giới thiệu sản phẩm và giải pháp mũi nhọn.' },
      { strong: 'Chính sách ưu đãi độc quyền:', text: 'Cam kết mức chiết khấu B2B dành riêng cho cộng đồng CEO 1983.' },
      { strong: 'Bộ lọc ngành nghề thông minh:', text: 'Tìm kiếm nhanh theo Xây dựng, Bất động sản, Tài chính, Công nghệ...' },
      { strong: 'Phân trang mượt mà:', text: 'Tải nhanh, hiển thị hình ảnh sản phẩm sắc nét tối ưu di động.' },
    ],
  },
  {
    type: 'feature',
    title: 'Mạng Lưới Doanh Nhân Chính Danh & Hẹn 1-on-1',
    subtitle: 'Tìm kiếm đối tác tin cậy và đặt lịch cà phê giao thương trong 30 giây',
    bullets: [
      { strong: 'Danh bạ 500+ CEO xác thực:', text: 'Hội viên chính thức với huy hiệu Verified tích xanh uy tín.' },
      { strong: 'Đặt lịch hẹn 1-on-1 tự động:', text: 'Chọn khung giờ trống và gửi lời mời cà phê kết nối kinh doanh.' },
      { strong: 'Đồng bộ lịch điện thoại:', text: 'Lịch hẹn tự động cập nhật vào Google Calendar / Apple Calendar.' },
      { strong: 'Ghi chú đối tác:', text: 'Lưu trữ thông tin nhu cầu và tiềm năng hợp tác sau buổi gặp gỡ.' },
    ],
  },
  {
    type: 'feature',
    title: 'Trải Nghiệm Sự Kiện: Ví Vé E-Ticket & Lucky Draw',
    subtitle: 'Check-in không chạm, xem sơ đồ chỗ ngồi và nhận quà may mắn tại Gala',
    bullets: [
      { strong: 'Ví vé điện tử E-Ticket:', text: 'Lưu cuống vé sự kiện kèm mã QR soát vé cá nhân hóa.' },
      { strong: 'Hiển thị số ghế & phân khu:', text: 'Biết trước vị trí bàn tiệc VIP được Ban Tổ Chức trân trọng bố trí.' },
      { strong: 'Mã quay thưởng Lucky Draw:', text: 'Mã số may mắn (#8388) tự động kích hoạt khi bước qua cửa soát vé.' },
      { strong: 'Tài liệu sự kiện số:', text: 'Tải nhanh kỷ yếu và tài liệu diễn đàn ngay trên ứng dụng.' },
    ],
  },
  {
    type: 'feature',
    title: 'Đàm Thoại Nội Bộ Mã Hóa & Thông Báo Cuộc Gọi Nền',
    subtitle: 'Bảo vệ bí mật kinh doanh, kết nối đàm thoại chất lượng cao không giật trễ',
    bullets: [
      { strong: 'Cuộc gọi thoại & video HD:', text: 'Đàm thoại trực tiếp 1-1 với chất lượng âm thanh trong trẻo, bảo mật.' },
      { strong: 'Dịch vụ thông báo nền Native:', text: 'Đổ chuông ngay trên màn hình khóa kể cả khi ứng dụng đang đóng.' },
      { strong: 'Ngắt máy 0ms không độ trễ:', text: 'Một bên gác máy là cả hai đầu kết thúc tức thời, không chuông ảo.' },
      { strong: 'Không bị làm phiền:', text: 'Chỉ các hội viên chính danh trong hệ sinh thái mới có thể kết nối.' },
    ],
  },
  {
    type: 'feature',
    title: 'Trợ Lý Giọng Nói Doanh Nhân Thông Minh (Voice AI)',
    subtitle: 'Tương tác thông minh bằng giọng nói tiếng Việt tự nhiên điều hướng tức thì',
    bullets: [
      { strong: 'Điều khiển giọng nói rảnh tay:', text: '"Mở sự kiện sắp tới", "Xem hội phí của tôi", "Tìm đối tác xây dựng".' },
      { strong: 'Phân tích ngữ cảnh chuẩn xác:', text: 'Hiểu các thuật ngữ kinh doanh và thói quen xưng hô của doanh nhân.' },
      { strong: 'Tự động mở màn hình:', text: 'Chuyển hướng trang tức thời không cần người dùng phải bấm chọn.' },
      { strong: 'Phản hồi giọng đọc lịch thiệp:', text: 'Âm sắc tự nhiên, tinh tế, đậm tinh thần văn hóa CEO 1983.' },
    ],
  },
  {
    type: 'kpi',
    title: 'Chuẩn Mực Trải Nghiệm Người Dùng (Mobile UX)',
    subtitle: 'Tối ưu hóa từng chi tiết nhỏ nhằm mang lại cảm giác thoải mái nhất khi dùng',
    kpis: [
      { num: '< 1.5s', label: 'Khởi Động Ứng Dụng', desc: 'Mở app tức thì, không màn hình chờ lâu' },
      { num: '< 0.1s', label: 'Tốc Độ Phản Hồi', desc: 'Thao tác chạm vuốt mượt mà 60 FPS' },
      { num: 'Face ID', label: 'Bảo Mật Sinh Trắc Học', desc: 'Đăng nhập vân tay & nhận diện khuôn mặt' },
      { num: '100%', label: 'Nhận Diện Thương Hiệu', desc: 'Chuẩn màu Deep Cobalt Navy & Amber Gold' },
    ],
  },
  {
    type: 'closing',
    tag: 'KẾT NỐI NGAY HÔM NAY',
    title: 'GIA NHẬP HỆ SINH THÁI DOANH NHÂN BẢN LĨNH',
    subtitle: 'Tải ứng dụng trên App Store & Google Play để trải nghiệm đặc quyền hội viên',
    bullets: [
      'Quét mã QR để cài đặt ứng dụng CEO 1983 trên iOS và Android',
      'Đăng nhập bằng tài khoản chính danh do Ban Thư Ký hiệp hội cấp',
      'Kích hoạt Thẻ VIP điện tử và bắt đầu hành trình giao thương bứt phá',
    ],
  },
];

// DECK 3: TỔNG THỂ HỆ SINH THÁI (MASTER)
const MASTER_SLIDES = [
  {
    type: 'cover',
    tag: 'BÁO CÁO TỔNG THỂ HỆ SINH THÁI',
    title: 'HỆ SINH THÁI CHUYỂN ĐỔI SỐ KÉP CEO 1983',
    subtitle: 'Đồng bộ toàn diện Web CRM Quản trị & Mobile App Hội viên · Kiến tạo tương lai HanoiBA',
    footer: 'CLB Doanh Nhân CEO 1983 · Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA)',
  },
  {
    type: 'feature',
    title: 'Bối Cảnh & Tầm Nhìn Chuyển Đổi Số Hiệp Hội',
    subtitle: 'Liên kết 500+ doanh nhân Quý Hợi 1983 thành khối liên minh kinh tế hùng mạnh',
    bullets: [
      { strong: 'Tập hợp tinh hoa thế hệ 1983:', text: 'Quy tụ các nhà sáng lập, CEO đang bước vào độ chín của sự nghiệp.' },
      { strong: 'Tiên phong chuyển đổi số:', text: 'Xây dựng mô hình hiệp hội doanh nhân số kiểu mẫu đầu tiên tại Việt Nam.' },
      { strong: 'Liên minh kinh tế thực chiến:', text: 'Hợp tác phát triển kinh doanh bền vững, tương trợ và đồng hành lâu dài.' },
      { strong: 'Đồng bộ dữ liệu thời gian thực:', text: 'Kết nối thông suốt giữa Ban Chấp Hành và từng hội viên thành viên.' },
    ],
  },
  {
    type: 'comparison',
    title: 'Kiến Trúc Kép: Web CRM & Mobile App',
    subtitle: 'Hai bánh đà công nghệ tương hỗ tạo nên sức mạnh vận hành vượt trội',
    col1_title: '1. Cổng Quản Trị Web CRM',
    col1_items: [
      'Dành cho Ban Điều Hành, Ban Thư Ký & Trưởng Ban',
      'Quản lý dữ liệu hội viên, phân ban và nhiệm kỳ',
      'Sơ đồ xếp chỗ Cinema Map & Soát vé Gatekeeper',
      'Kế toán đối soát VietQR và báo cáo thu chi minh bạch',
      'Ma trận phân quyền Sticky 2 cột cho 10 vai trò',
    ],
    col2_title: '2. Ứng Dụng Di Động Mobile App',
    col2_items: [
      'Dành cho 500+ Doanh nhân hội viên chính danh',
      'Thẻ VIP điện tử mạ vàng & QR vCard lưu danh bạ',
      'Sàn B2B niêm yết sản phẩm ưu đãi nội bộ đặc quyền',
      'Ví vé E-ticket sự kiện kèm số ghế và Lucky Draw',
      'Đàm thoại nội bộ bảo mật và Trợ lý Voice AI',
    ],
  },
  {
    type: 'kpi',
    title: '5 Trụ Cột Giá Trị Cốt Lõi Của Hệ Sinh Thái',
    subtitle: 'Hiện đại hóa toàn bộ các hoạt động thường nhật của hiệp hội doanh nhân',
    kpis: [
      { num: 'HỘI VIÊN', label: 'Số Hóa Hồ Sơ 360°', desc: 'Thẩm định minh bạch, thẻ VIP định danh độc bản' },
      { num: 'GIAO THƯƠNG', label: 'Sàn B2B & Hẹn 1-on-1', desc: 'Khớp nối cung cầu thực chiến không trung gian' },
      { num: 'SỰ KIỆN', label: 'Cinema Map & Lucky Draw', desc: 'Xếp chỗ rạp phim, soát vé QR 0.1s tốc độ cao' },
      { num: 'TÀI CHÍNH', label: 'VietQR Napas 247', desc: 'Gạch nợ tức thời, sổ quỹ công khai minh bạch' },
    ],
  },
  {
    type: 'feature',
    title: 'Trụ Cột 1: Quản Trị Trung Ương Trên Web CRM',
    subtitle: 'Công cụ đắc lực giúp Ban Lãnh Đạo điều hành khoa học, tiết kiệm 85% thời gian',
    bullets: [
      { strong: 'Dashboard tổng quan trực quan:', text: 'Nắm bắt biến động hội viên, tiến độ công việc và số dư tài chính.' },
      { strong: 'Quản trị hồ sơ doanh nghiệp:', text: 'Lưu trữ hợp đồng, giấy phép kinh doanh và lịch sử đóng góp.' },
      { strong: 'Giao việc phân ban Kanban:', text: 'Giao nhiệm vụ, đính kèm file tài liệu và theo dõi deadline sát sao.' },
      { strong: 'Biểu quyết điện tử đại hội:', text: 'Tạo phiếu bầu tín nhiệm, kiểm phiếu tự động chuẩn xác 100%.' },
    ],
  },
  {
    type: 'feature',
    title: 'Trụ Cột 2: Văn Phòng Bỏ Túi Trên Mobile App',
    subtitle: 'Đồng hành cùng doanh nhân mọi lúc mọi nơi trên chiếc điện thoại thông minh',
    bullets: [
      { strong: 'Thẻ Hội Viên VIP mạ vàng:', text: 'Tự hào xuất trình thẻ số định danh tại các diễn đàn kinh tế lớn.' },
      { strong: 'Chia sẻ danh thiếp không giới hạn:', text: 'Quét mã QR là đối tác lưu ngay danh bạ mà không cần cài app.' },
      { strong: 'Nhận chỉ đạo tức thời:', text: 'Thông báo nhiệm vụ khẩn và văn bản nội bộ gửi thẳng về điện thoại.' },
      { strong: 'Trợ lý Voice AI tiếng Việt:', text: 'Điều khiển bằng giọng nói thông minh, tra cứu dữ liệu trong chớp mắt.' },
    ],
  },
  {
    type: 'flow',
    title: 'Quy Trình Trải Nghiệm Sự Kiện Toàn Diện (End-to-End)',
    subtitle: 'Khép kín từ khâu truyền thông, đăng ký, xếp chỗ đến soát vé và bốc thăm',
    steps: [
      { num: '01', title: 'Quét Standee Zalo', desc: 'Khách ngoài quét mã tại sảnh để điền form đăng ký tham dự.' },
      { num: '02', title: 'Nhận Vé & Lucky Draw', desc: 'Hệ thống sinh mã vé E-Ticket, mã số may mắn (#8388) và gửi email.' },
      { num: '03', title: 'Xếp Ghế Cinema Map', desc: 'Ban Tổ Chức định vị hàng ghế VIP và số chỗ ngồi trên sơ đồ trực quan.' },
      { num: '04', title: 'Soát Vé Gatekeeper', desc: 'Lễ tân quét mã QR trong 0.1s, màn hình hiện số ghế để đón tiếp chu đáo.' },
    ],
  },
  {
    type: 'flow',
    title: 'Chu Trình Khớp Nối Giao Thương B2B Thực Chiến',
    subtitle: 'Biến mối quan hệ đồng niên thành cơ hội kinh doanh sinh lời bền vững',
    steps: [
      { num: '01', title: 'Đăng Gian Hàng B2B', desc: 'Doanh nghiệp niêm yết sản phẩm kèm chính sách chiết khấu ưu đãi.' },
      { num: '02', title: 'Khám Phá Nhu Cầu', desc: 'Hội viên lọc tìm kiếm theo ngành hàng cần mua sắm hoặc hợp tác.' },
      { num: '03', title: 'Đặt Lịch Hẹn 1-on-1', desc: 'Gửi lời mời cà phê giao thương, đồng bộ tự động vào lịch điện thoại.' },
      { num: '04', title: 'Ký Kết & Báo Doanh Thu', desc: 'Giao dịch thành công, ghi nhận thành tích thi đua cho ban chuyên môn.' },
    ],
  },
  {
    type: 'feature',
    title: 'Tự Động Hóa Kế Toán & Minh Bạch Tài Chính',
    subtitle: 'Chuẩn hóa quy trình thu hội phí và kiểm soát dòng tiền hiệp hội',
    bullets: [
      { strong: 'Sinh mã VietQR Napas 247:', text: 'Mã QR thanh toán chứa sẵn số tiền và nội dung hóa đơn tự động.' },
      { strong: 'Gạch nợ tức thời 24/7:', text: 'Webhook ngân hàng thông báo là hệ thống tự động duyệt trạng thái hoàn tất.' },
      { strong: 'Báo cáo thu chi công khai:', text: 'Báo cáo tài chính rõ ràng từng khoản mục thu chi, tài trợ sự kiện.' },
      { strong: 'Nhắc phí lịch thiệp:', text: 'Hệ thống gửi thông báo nhắc gia hạn tự động tới email và app hội viên.' },
    ],
  },
  {
    type: 'feature',
    title: 'Hạ Tầng Công Nghệ Đỉnh Cao & An Toàn Bảo Mật',
    subtitle: 'Nền tảng kiến trúc hiện đại đáp ứng quy mô mở rộng hàng ngàn doanh nghiệp',
    bullets: [
      { strong: 'Kiến trúc hiện đại:', text: 'NestJS Backend + PostgreSQL + React Vite SPA + Capacitor Mobile Native.' },
      { strong: 'Bảo mật cấp doanh nghiệp:', text: 'Mã hóa SSL 256-bit, token xác thực an toàn, kiểm soát truy cập RBAC.' },
      { strong: 'Tối ưu tốc độ cao:', text: 'CDN phân phối hình ảnh siêu tốc, bộ nhớ đệm cache giảm tải máy chủ.' },
      { strong: 'Sao lưu dữ liệu định kỳ:', text: 'Tự động backup dữ liệu hàng ngày đảm bảo an toàn tuyệt đối.' },
    ],
  },
  {
    type: 'comparison',
    title: 'Giá Trị Gia Tăng Cho Các Bên Liên Quan',
    subtitle: 'Hệ sinh thái đem lại lợi ích thiết thực, bền vững cho toàn bộ cộng đồng',
    col1_title: 'Cho Doanh Nhân Hội Viên',
    col1_items: [
      'Nâng tầm hình ảnh chuyên nghiệp với Thẻ VIP & Danh thiếp vCard',
      'Mở rộng kênh bán hàng B2B nội bộ không tốn chi phí quảng cáo',
      'Được bảo vệ quyền lợi thương mại và tương trợ lúc khó khăn',
      'Trải nghiệm sự kiện đẳng cấp với vị trí ngồi VIP trân trọng',
    ],
    col2_title: 'Cho Ban Điều Hành & HanoiBA',
    col2_items: [
      'Giảm 85% thời gian thủ tục hành chính và đối soát sổ sách',
      'Nắm bắt dữ liệu hiệp hội theo thời gian thực để ra quyết định nhanh',
      'Tạo dựng hình ảnh CLB CEO 1983 mẫu mực, hiện đại hàng đầu',
      'Thu hút thêm nhiều doanh nhân ưu tú gia nhập câu lạc bộ',
    ],
  },
  {
    type: 'closing',
    tag: 'ĐỒNG HÀNH PHÁT TRIỂN',
    title: 'GẮN KẾT BẢN LĨNH · KIẾN TẠO TƯƠNG LAI',
    subtitle: 'Hệ sinh thái số CEO 1983 - Bệ phóng vững chắc cho sự thịnh vượng của cộng đồng',
    bullets: [
      'ViConnect cam kết liên tục nâng cấp tính năng và đồng hành dài hạn',
      'Hotline Ban Thư Ký hỗ trợ: 0983 1983 83 / 0988 66 55 44',
      'Truy cập Cổng CRM: https://crm.ceo1983.viconnect.vn | App: https://ceo1983.viconnect.vn',
    ],
  },
];

// -------------------------------------------------------------
// [B] HÀM GENERATE HTML PRESENTATION 16:9 CHUẨN MỰC
// -------------------------------------------------------------
function generateHtmlPresentation(deckTitle, slides, outFileName) {
  const slidesJson = JSON.stringify(slides);

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${deckTitle} | CLB Doanh Nhân CEO 1983</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0A192F;
      color: #0F172A;
      overflow: hidden;
      margin: 0;
      padding: 0;
      height: 100vh;
      width: 100vw;
    }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .slide-container {
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      box-sizing: border-box;
    }
    .slide-card {
      width: 100%;
      max-width: 1400px;
      aspect-ratio: 16 / 9;
      max-height: 88vh;
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
      position: relative;
      display: flex;
      flex-direction: column;
      background: #FFFFFF;
      transition: all 0.3s ease;
    }
    .gold-gradient {
      background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
    }
    .navy-gradient {
      background: linear-gradient(135deg, #0A192F 0%, #003B95 60%, #0A4DB0 100%);
    }
  </style>
</head>
<body>
  <div class="slide-container">
    <div id="slideCard" class="slide-card">
      <!-- Nội dung slide sẽ render tự động qua JS -->
    </div>
  </div>

  <!-- THANH ĐIỀU KHIỂN DƯỚI ĐÁY -->
  <div class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-6 py-2.5 rounded-full border border-slate-700/60 shadow-xl flex items-center gap-6 z-50 text-white text-xs">
    <button onclick="prevSlide()" class="hover:text-amber-400 font-bold transition flex items-center gap-1 cursor-pointer">
      ◀ Trước
    </button>
    <span class="font-mono text-amber-400 font-bold tracking-wider" id="slideIndicator">1 / 10</span>
    <button onclick="nextSlide()" class="hover:text-amber-400 font-bold transition flex items-center gap-1 cursor-pointer">
      Sau ▶
    </button>
    <div class="w-px h-4 bg-slate-700"></div>
    <span class="text-slate-400 hidden sm:inline">Phím: [←] [→] hoặc [Space]</span>
    <button onclick="toggleFullscreen()" class="text-slate-300 hover:text-white transition">
      ⛶ Toàn màn hình
    </button>
  </div>

  <script>
    const slides = ${slidesJson};
    let currentIndex = 0;

    function renderSlide(index) {
      const s = slides[index];
      const card = document.getElementById('slideCard');
      document.getElementById('slideIndicator').innerText = (index + 1) + ' / ' + slides.length;

      let html = '';

      if (s.type === 'cover') {
        html = \`
          <div class="w-full h-full navy-gradient text-white flex flex-col justify-between p-12 sm:p-16 relative overflow-hidden">
            <div class="absolute -right-20 -bottom-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div class="flex items-center justify-between z-10 border-b border-white/10 pb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-lg shadow-md">
                  83
                </div>
                <span class="font-extrabold tracking-wider text-sm uppercase text-amber-300">CLB DOANH NHÂN CEO 1983</span>
              </div>
              <span class="text-xs bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 text-blue-100 font-semibold">\${s.tag}</span>
            </div>

            <div class="z-10 my-auto py-8">
              <div class="inline-block px-3.5 py-1 bg-amber-400/20 border border-amber-400/40 text-amber-300 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                ✦ BẢN TRÌNH CHIẾU DOANH NGHIỆP CHUẨN MỰC ✦
              </div>
              <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                \${s.title}
              </h1>
              <p class="text-base sm:text-xl text-blue-100 mt-4 max-w-3xl font-medium leading-relaxed">
                \${s.subtitle}
              </p>
            </div>

            <div class="z-10 border-t border-white/10 pt-4 flex flex-col sm:flex-row justify-between text-xs text-blue-200">
              <span>\${s.footer}</span>
              <span class="text-amber-300 font-bold mt-1 sm:mt-0">ViConnect Technology Ecosystem · 2026</span>
            </div>
          </div>
        \`;
      } else if (s.type === 'comparison') {
        html = \`
          <div class="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-10 sm:p-14">
            <div>
              <span class="text-xs font-black text-amber-600 uppercase tracking-widest block mb-1">SO SÁNH MÔ HÌNH VẬN HÀNH</span>
              <h2 class="text-2xl sm:text-3xl font-black text-[#003B95]">\${s.title}</h2>
              <p class="text-xs sm:text-sm text-slate-500 mt-1">\${s.subtitle}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto pt-4">
              <!-- Cột 1 -->
              <div class="bg-rose-50/70 border border-rose-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-2 text-rose-800 font-extrabold text-base mb-4 border-b border-rose-200 pb-3">
                    <span class="w-6 h-6 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center text-xs">✕</span>
                    \${s.col1_title}
                  </div>
                  <ul class="space-y-3 text-xs sm:text-sm text-rose-950 font-medium">
                    \${s.col1_items.map(it => \`<li class="flex items-start gap-2.5"><span class="text-rose-500 font-bold mt-0.5">•</span><span>\${it}</span></li>\`).join('')}
                  </ul>
                </div>
              </div>

              <!-- Cột 2 -->
              <div class="bg-emerald-50/70 border-2 border-emerald-400/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-2 text-emerald-900 font-extrabold text-base mb-4 border-b border-emerald-200 pb-3">
                    <span class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">✓</span>
                    \${s.col2_title}
                  </div>
                  <ul class="space-y-3 text-xs sm:text-sm text-emerald-950 font-semibold">
                    \${s.col2_items.map(it => \`<li class="flex items-start gap-2.5"><span class="text-emerald-600 font-bold mt-0.5">✓</span><span>\${it}</span></li>\`).join('')}
                  </ul>
                </div>
              </div>
            </div>

            <div class="border-t border-slate-200 pt-3 flex justify-between text-[11px] text-slate-400">
              <span>Hệ Thống CEO 1983 · ViConnect</span>
              <span>Trang \${index + 1} / \${slides.length}</span>
            </div>
          </div>
        \`;
      } else if (s.type === 'kpi') {
        html = \`
          <div class="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-10 sm:p-14">
            <div>
              <span class="text-xs font-black text-amber-600 uppercase tracking-widest block mb-1">CHỈ SỐ NĂNG LỰC HỆ THỐNG</span>
              <h2 class="text-2xl sm:text-3xl font-black text-[#003B95]">\${s.title}</h2>
              <p class="text-xs sm:text-sm text-slate-500 mt-1">\${s.subtitle}</p>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 my-auto pt-4">
              \${s.kpis.map(k => \`
                <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-amber-400 transition">
                  <div class="text-3xl sm:text-4xl font-black text-amber-600 font-mono tracking-tight mb-2">
                    \${k.num}
                  </div>
                  <div>
                    <div class="font-extrabold text-slate-900 text-sm mb-1">\${k.label}</div>
                    <div class="text-xs text-slate-500 leading-relaxed">\${k.desc}</div>
                  </div>
                </div>
              \`).join('')}
            </div>

            <div class="border-t border-slate-200 pt-3 flex justify-between text-[11px] text-slate-400">
              <span>Hệ Thống CEO 1983 · ViConnect</span>
              <span>Trang \${index + 1} / \${slides.length}</span>
            </div>
          </div>
        \`;
      } else if (s.type === 'feature') {
        html = \`
          <div class="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-10 sm:p-14">
            <div>
              <span class="text-xs font-black text-amber-600 uppercase tracking-widest block mb-1">TÍNH NĂNG ĐỘT PHÁ</span>
              <h2 class="text-2xl sm:text-3xl font-black text-[#003B95]">\${s.title}</h2>
              <p class="text-xs sm:text-sm text-slate-500 mt-1">\${s.subtitle}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 my-auto pt-3">
              \${s.bullets.map((b, idx) => \`
                <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-start gap-4">
                  <div class="w-8 h-8 rounded-xl bg-[#003B95]/10 text-[#003B95] font-black text-sm flex items-center justify-center shrink-0 mt-0.5">
                    0\${idx + 1}
                  </div>
                  <div>
                    <div class="font-extrabold text-slate-900 text-sm sm:text-base mb-1">\${b.strong}</div>
                    <div class="text-xs sm:text-sm text-slate-600 leading-relaxed">\${b.text}</div>
                  </div>
                </div>
              \`).join('')}
            </div>

            <div class="border-t border-slate-200 pt-3 flex justify-between text-[11px] text-slate-400">
              <span>Hệ Thống CEO 1983 · ViConnect</span>
              <span>Trang \${index + 1} / \${slides.length}</span>
            </div>
          </div>
        \`;
      } else if (s.type === 'flow') {
        html = \`
          <div class="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-10 sm:p-14">
            <div>
              <span class="text-xs font-black text-amber-600 uppercase tracking-widest block mb-1">QUY TRÌNH THỰC THI</span>
              <h2 class="text-2xl sm:text-3xl font-black text-[#003B95]">\${s.title}</h2>
              <p class="text-xs sm:text-sm text-slate-500 mt-1">\${s.subtitle}</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-auto pt-4">
              \${s.steps.map(step => \`
                <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative flex flex-col justify-between">
                  <div class="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center font-mono mb-3 shadow-xs">
                    \${step.num}
                  </div>
                  <div>
                    <div class="font-extrabold text-slate-900 text-sm mb-1.5">\${step.title}</div>
                    <div class="text-xs text-slate-600 leading-relaxed">\${step.desc}</div>
                  </div>
                </div>
              \`).join('')}
            </div>

            <div class="border-t border-slate-200 pt-3 flex justify-between text-[11px] text-slate-400">
              <span>Hệ Thống CEO 1983 · ViConnect</span>
              <span>Trang \${index + 1} / \${slides.length}</span>
            </div>
          </div>
        \`;
      } else if (s.type === 'closing') {
        html = \`
          <div class="w-full h-full navy-gradient text-white flex flex-col justify-between p-12 sm:p-16 relative overflow-hidden">
            <div class="z-10 flex items-center justify-between border-b border-white/10 pb-6">
              <span class="text-xs bg-amber-400 text-slate-950 px-3.5 py-1 rounded-full font-black uppercase tracking-wider">\${s.tag}</span>
              <span class="text-xs text-blue-200 font-mono">CEO 1983 CLOUD</span>
            </div>

            <div class="z-10 my-auto py-6">
              <h2 class="text-3xl sm:text-5xl font-black text-white leading-tight mb-3">
                \${s.title}
              </h2>
              <p class="text-base sm:text-xl text-blue-100 mb-8 max-w-2xl font-medium">
                \${s.subtitle}
              </p>

              <div class="space-y-3.5 max-w-2xl">
                \${s.bullets.map(b => \`
                  <div class="flex items-center gap-3 bg-white/10 border border-white/15 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-blue-50">
                    <span class="text-amber-400 font-bold">✓</span>
                    <span>\${b}</span>
                  </div>
                \`).join('')}
              </div>
            </div>

            <div class="z-10 border-t border-white/10 pt-4 flex justify-between text-xs text-blue-300">
              <span>Hệ Sinh Thái Doanh Nhân CLB CEO 1983</span>
              <span class="text-amber-300 font-bold">Trân trọng cảm ơn!</span>
            </div>
          </div>
        \`;
      }

      card.innerHTML = html;
    }

    function prevSlide() {
      if (currentIndex > 0) {
        currentIndex--;
        renderSlide(currentIndex);
      }
    }

    function nextSlide() {
      if (currentIndex < slides.length - 1) {
        currentIndex++;
        renderSlide(currentIndex);
      }
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
    });

    renderSlide(0);
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(DOC_DIR, outFileName), html, 'utf8');
  fs.writeFileSync(path.join(DOCS_DIR, outFileName), html, 'utf8');
  fs.writeFileSync(path.join(FE_DOCS_DIR, outFileName), html, 'utf8');
  console.log(`  ✓ Đã xuất HTML Presentation: ${outFileName}`);
}

// -------------------------------------------------------------
// [C] HÀM GENERATE PPTX 16:9 CHUẨN MỰC
// -------------------------------------------------------------
async function generatePptxDeck(deckTitle, slides, outFileName) {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9'; // 13.33 x 7.5 inches
  pres.title = deckTitle;
  pres.company = 'CLB Doanh Nhân CEO 1983 - HanoiBA';

  const FONT_TITLE = 'Arial';
  const FONT_BODY = 'Arial';

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const slide = pres.addSlide();

    if (s.type === 'cover') {
      // Background Navy
      slide.background = { color: C.NAVY_DARK };

      // Top Tag
      slide.addText(s.tag || 'BÁO CÁO DOANH NGHIỆP', {
        x: 0.8, y: 0.8, w: 11.7, h: 0.4,
        color: C.GOLD_ACCENT, fontSize: 13, bold: true, fontFace: FONT_BODY,
      });

      // Title lớn
      slide.addText(s.title, {
        x: 0.8, y: 1.8, w: 11.7, h: 1.8,
        color: C.WHITE, fontSize: 34, bold: true, fontFace: FONT_TITLE,
      });

      // Subtitle
      slide.addText(s.subtitle, {
        x: 0.8, y: 3.8, w: 11.0, h: 1.0,
        color: '93C5FD', fontSize: 16, fontFace: FONT_BODY, lineSpacing: 24,
      });

      // Gold Accent Line
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: 5.2, w: 4.0, h: 0.06,
        fill: { color: C.GOLD_ACCENT },
      });

      // Footer
      slide.addText(s.footer || 'CLB Doanh Nhân CEO 1983 · ViConnect Technology', {
        x: 0.8, y: 6.5, w: 11.7, h: 0.4,
        color: '94A3B8', fontSize: 11, fontFace: FONT_BODY,
      });

    } else if (s.type === 'comparison') {
      slide.background = { color: C.BG_LIGHT };

      // Title & Subtitle
      slide.addText(s.title, {
        x: 0.8, y: 0.6, w: 11.7, h: 0.6,
        color: C.NAVY_PRIMARY, fontSize: 24, bold: true, fontFace: FONT_TITLE,
      });
      slide.addText(s.subtitle, {
        x: 0.8, y: 1.2, w: 11.7, h: 0.4,
        color: C.TEXT_MUTED, fontSize: 12, fontFace: FONT_BODY,
      });

      // Col 1 (Red Box)
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: 1.8, w: 5.6, h: 4.8,
        fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 },
      });
      slide.addText(s.col1_title, {
        x: 1.1, y: 2.1, w: 5.0, h: 0.5,
        color: '9F1239', fontSize: 15, bold: true, fontFace: FONT_TITLE,
      });
      const col1Bullets = s.col1_items.map((it) => ({ text: it, options: { bullet: true, color: '881337', fontSize: 12, fontFace: FONT_BODY } }));
      slide.addText(col1Bullets, {
        x: 1.1, y: 2.7, w: 5.0, h: 3.5,
        lineSpacing: 22,
      });

      // Col 2 (Green Box)
      slide.addShape(pres.ShapeType.rect, {
        x: 6.9, y: 1.8, w: 5.6, h: 4.8,
        fill: { color: 'ECFDF5' }, line: { color: '6EE7B7', width: 2 },
      });
      slide.addText(s.col2_title, {
        x: 7.2, y: 2.1, w: 5.0, h: 0.5,
        color: '065F46', fontSize: 15, bold: true, fontFace: FONT_TITLE,
      });
      const col2Bullets = s.col2_items.map((it) => ({ text: it, options: { bullet: true, color: '064E3B', fontSize: 12, bold: true, fontFace: FONT_BODY } }));
      slide.addText(col2Bullets, {
        x: 7.2, y: 2.7, w: 5.0, h: 3.5,
        lineSpacing: 22,
      });

    } else if (s.type === 'kpi') {
      slide.background = { color: C.BG_LIGHT };

      slide.addText(s.title, {
        x: 0.8, y: 0.6, w: 11.7, h: 0.6,
        color: C.NAVY_PRIMARY, fontSize: 24, bold: true, fontFace: FONT_TITLE,
      });
      slide.addText(s.subtitle, {
        x: 0.8, y: 1.2, w: 11.7, h: 0.4,
        color: C.TEXT_MUTED, fontSize: 12, fontFace: FONT_BODY,
      });

      // 4 KPI Cards
      const kpis = s.kpis || [];
      const cardW = 2.7;
      const cardGap = 0.3;
      kpis.forEach((k, idx) => {
        const xPos = 0.8 + idx * (cardW + cardGap);
        slide.addShape(pres.ShapeType.rect, {
          x: xPos, y: 2.2, w: cardW, h: 4.2,
          fill: { color: C.WHITE }, line: { color: C.BORDER, width: 1 },
        });
        slide.addText(k.num, {
          x: xPos + 0.2, y: 2.6, w: cardW - 0.4, h: 0.8,
          color: C.GOLD_DARK, fontSize: 24, bold: true, fontFace: FONT_TITLE, align: 'center',
        });
        slide.addText(k.label, {
          x: xPos + 0.2, y: 3.6, w: cardW - 0.4, h: 0.6,
          color: C.TEXT_DARK, fontSize: 13, bold: true, fontFace: FONT_TITLE, align: 'center',
        });
        slide.addText(k.desc, {
          x: xPos + 0.2, y: 4.3, w: cardW - 0.4, h: 1.6,
          color: C.TEXT_MUTED, fontSize: 11, fontFace: FONT_BODY, align: 'center',
        });
      });

    } else if (s.type === 'feature') {
      slide.background = { color: C.BG_LIGHT };

      slide.addText(s.title, {
        x: 0.8, y: 0.6, w: 11.7, h: 0.6,
        color: C.NAVY_PRIMARY, fontSize: 24, bold: true, fontFace: FONT_TITLE,
      });
      slide.addText(s.subtitle, {
        x: 0.8, y: 1.2, w: 11.7, h: 0.4,
        color: C.TEXT_MUTED, fontSize: 12, fontFace: FONT_BODY,
      });

      // 4 Feature boxes in 2x2 grid
      const bullets = s.bullets || [];
      const boxW = 5.65;
      const boxH = 2.1;
      bullets.forEach((b, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const xPos = 0.8 + col * (boxW + 0.4);
        const yPos = 1.9 + row * (boxH + 0.35);

        slide.addShape(pres.ShapeType.rect, {
          x: xPos, y: yPos, w: boxW, h: boxH,
          fill: { color: C.WHITE }, line: { color: C.BORDER, width: 1 },
        });

        // Number Badge
        slide.addShape(pres.ShapeType.rect, {
          x: xPos + 0.3, y: yPos + 0.3, w: 0.6, h: 0.6,
          fill: { color: C.GOLD_LIGHT },
        });
        slide.addText(`0${idx + 1}`, {
          x: xPos + 0.3, y: yPos + 0.3, w: 0.6, h: 0.6,
          color: C.GOLD_DARK, fontSize: 12, bold: true, align: 'center', fontFace: FONT_BODY,
        });

        // Strong text
        slide.addText(b.strong, {
          x: xPos + 1.1, y: yPos + 0.25, w: boxW - 1.4, h: 0.4,
          color: C.TEXT_DARK, fontSize: 13, bold: true, fontFace: FONT_TITLE,
        });

        // Body text
        slide.addText(b.text, {
          x: xPos + 1.1, y: yPos + 0.75, w: boxW - 1.4, h: 1.1,
          color: C.TEXT_BODY, fontSize: 11.5, fontFace: FONT_BODY, lineSpacing: 18,
        });
      });

    } else if (s.type === 'flow') {
      slide.background = { color: C.BG_LIGHT };

      slide.addText(s.title, {
        x: 0.8, y: 0.6, w: 11.7, h: 0.6,
        color: C.NAVY_PRIMARY, fontSize: 24, bold: true, fontFace: FONT_TITLE,
      });
      slide.addText(s.subtitle, {
        x: 0.8, y: 1.2, w: 11.7, h: 0.4,
        color: C.TEXT_MUTED, fontSize: 12, fontFace: FONT_BODY,
      });

      // 4 Flow steps
      const steps = s.steps || [];
      const stepW = 2.7;
      const stepGap = 0.3;
      steps.forEach((step, idx) => {
        const xPos = 0.8 + idx * (stepW + stepGap);
        slide.addShape(pres.ShapeType.rect, {
          x: xPos, y: 2.2, w: stepW, h: 4.2,
          fill: { color: C.WHITE }, line: { color: C.BORDER, width: 1 },
        });

        slide.addShape(pres.ShapeType.rect, {
          x: xPos + 0.3, y: 2.5, w: 0.8, h: 0.8,
          fill: { color: C.GOLD_ACCENT },
        });
        slide.addText(step.num, {
          x: xPos + 0.3, y: 2.5, w: 0.8, h: 0.8,
          color: C.NAVY_DARK, fontSize: 14, bold: true, align: 'center', fontFace: FONT_TITLE,
        });

        slide.addText(step.title, {
          x: xPos + 0.3, y: 3.5, w: stepW - 0.6, h: 0.7,
          color: C.TEXT_DARK, fontSize: 13, bold: true, fontFace: FONT_TITLE,
        });
        slide.addText(step.desc, {
          x: xPos + 0.3, y: 4.3, w: stepW - 0.6, h: 1.8,
          color: C.TEXT_BODY, fontSize: 11, fontFace: FONT_BODY, lineSpacing: 18,
        });
      });

    } else if (s.type === 'closing') {
      slide.background = { color: C.NAVY_DARK };

      slide.addText(s.tag || 'TỔNG KẾT', {
        x: 0.8, y: 0.8, w: 11.7, h: 0.4,
        color: C.GOLD_ACCENT, fontSize: 13, bold: true, fontFace: FONT_BODY,
      });
      slide.addText(s.title, {
        x: 0.8, y: 1.6, w: 11.7, h: 1.2,
        color: C.WHITE, fontSize: 30, bold: true, fontFace: FONT_TITLE,
      });
      slide.addText(s.subtitle, {
        x: 0.8, y: 3.0, w: 11.0, h: 0.8,
        color: '93C5FD', fontSize: 15, fontFace: FONT_BODY,
      });

      const bullets = s.bullets || [];
      bullets.forEach((b, idx) => {
        slide.addShape(pres.ShapeType.rect, {
          x: 0.8, y: 4.0 + idx * 0.9, w: 10.5, h: 0.7,
          fill: { color: '132A56' }, line: { color: '1E3A8A', width: 1 },
        });
        slide.addText(`✓  ${b}`, {
          x: 1.1, y: 4.0 + idx * 0.9, w: 10.0, h: 0.7,
          color: 'F1F5F9', fontSize: 12.5, fontFace: FONT_BODY,
        });
      });
    }

    // Slide Footer (trừ slide bìa)
    if (s.type !== 'cover') {
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: 6.85, w: 11.7, h: 0.015,
        fill: { color: C.BORDER },
      });
      slide.addText('Hệ Sinh Thái Doanh Nhân CLB CEO 1983 · ViConnect Technology', {
        x: 0.8, y: 6.95, w: 8.0, h: 0.3,
        color: C.TEXT_MUTED, fontSize: 9.5, fontFace: FONT_BODY,
      });
      slide.addText(`${i + 1} / ${slides.length}`, {
        x: 11.0, y: 6.95, w: 1.5, h: 0.3,
        color: C.TEXT_MUTED, fontSize: 9.5, align: 'right', fontFace: FONT_BODY,
      });
    }
  }

  const outDocPath = path.join(DOC_DIR, outFileName);
  await pres.writeFile({ fileName: outDocPath });
  console.log(`  ✓ Đã xuất PowerPoint PPTX: ${outFileName}`);
}

// -------------------------------------------------------------
// [D] HÀM GENERATE MARKDOWN SLIDE NOTES
// -------------------------------------------------------------
function generateMarkdownSlideDoc(deckTitle, slides, outFileName) {
  let md = `# ${deckTitle.toUpperCase()}\n## CLB DOANH NHÂN CEO 1983 (HANOIBA)\n*Bản quyền © 2026 CLB Doanh Nhân CEO 1983 & ViConnect*\n\n---\n\n`;

  slides.forEach((s, idx) => {
    md += `### SLIDE ${idx + 1}: ${s.title.toUpperCase()}\n`;
    if (s.subtitle) md += `*${s.subtitle}*\n\n`;

    if (s.type === 'comparison') {
      md += `**${s.col1_title}:**\n`;
      s.col1_items.forEach((it) => (md += `- ❌ ${it}\n`));
      md += `\n**${s.col2_title}:**\n`;
      s.col2_items.forEach((it) => (md += `- ✅ ${it}\n`));
    } else if (s.type === 'kpi') {
      s.kpis.forEach((k) => (md += `- **${k.num}** | ${k.label}: ${k.desc}\n`));
    } else if (s.type === 'feature') {
      s.bullets.forEach((b) => (md += `- **${b.strong}** ${b.text}\n`));
    } else if (s.type === 'flow') {
      s.steps.forEach((step) => (md += `1. **Bước ${step.num} - ${step.title}:** ${step.desc}\n`));
    } else if (s.type === 'closing') {
      s.bullets.forEach((b) => (md += `- ✨ ${b}\n`));
    }
    md += `\n---\n\n`;
  });

  fs.writeFileSync(path.join(DOC_DIR, outFileName), md, 'utf8');
  console.log(`  ✓ Đã xuất Markdown Slide Notes: ${outFileName}`);
}

// -------------------------------------------------------------
// [E] HÀM THỰC THI MASTER CHO CẢ 3 BỘ SLIDE
// -------------------------------------------------------------
async function main() {
  console.log('================================================================');
  console.log('BẮT ĐẦU XUẤT BẢN HOÀN TOÀN MỚI 3 BỘ SLIDE THUYẾT TRÌNH CEO 1983');
  console.log('================================================================');

  try {
    // 1. SLIDE CRM
    console.log('\n>>> [1/3] Đang xuất Slide Web CRM...');
    generateHtmlPresentation('Bản Trình Chiếu Hệ Thống Web CRM CEO 1983', CRM_SLIDES, 'SLIDE_CRM_QUAN_TRI_CEO1983.html');
    await generatePptxDeck('Hệ Thống Web CRM CLB CEO 1983', CRM_SLIDES, 'SLIDE_CRM_QUAN_TRI_CEO1983.pptx');
    generateMarkdownSlideDoc('Tài Liệu Thuyết Trình Web CRM CEO 1983', CRM_SLIDES, 'SLIDE_CRM_QUAN_TRI_CEO1983.md');

    // 2. SLIDE MOBILE APP
    console.log('\n>>> [2/3] Đang xuất Slide Mobile App...');
    generateHtmlPresentation('Bản Trình Chiếu Mobile App Hiệp Hội CEO 1983', APP_SLIDES, 'SLIDE_APP_HIEP_HOI_CEO1983.html');
    await generatePptxDeck('Ứng Dụng Di Động CLB CEO 1983', APP_SLIDES, 'SLIDE_APP_HIEP_HOI_CEO1983.pptx');
    generateMarkdownSlideDoc('Tài Liệu Thuyết Trình Mobile App CEO 1983', APP_SLIDES, 'SLIDE_APP_HIEP_HOI_CEO1983.md');

    // 3. SLIDE MASTER TỔNG THỂ
    console.log('\n>>> [3/3] Đang xuất Slide Master Tổng Thể...');
    generateHtmlPresentation('Bản Trình Chiếu Tổng Thể Hệ Sinh Thái CEO 1983', MASTER_SLIDES, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.html');
    await generatePptxDeck('Tổng Thể Hệ Sinh Thái Số CEO 1983', MASTER_SLIDES, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pptx');
    generateMarkdownSlideDoc('Tài Liệu Thuyết Trình Tổng Thể Hệ Sinh Thái CEO 1983', MASTER_SLIDES, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.md');

    console.log('\n================================================================');
    console.log('HOÀN TẤT XUẤT BẢN THÀNH CÔNG 100% TOÀN BỘ 3 BỘ SLIDE THUYẾT TRÌNH!');
    console.log('================================================================');
  } catch (err) {
    console.error('Lỗi khi xuất slide:', err);
    process.exit(1);
  }
}

main();
