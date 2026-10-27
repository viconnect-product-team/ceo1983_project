/**
 * =============================================================================
 * SCRIPT XUẤT BẢN MASTER SLIDE DECK V8.5 MONUMENTAL WAVE (15 SLIDES HOÀN HẢO)
 * HỆ THỐNG CÔNG NGHỆ CHUYỂN ĐỔI SỐ TOÀN DIỆN CLB DOANH NHÂN CEO 1983 (HANOIBA)
 * ĐƠN VỊ PHÁT TRIỂN: VICONNECT TECHNOLOGY JOINT STOCK COMPANY
 * =============================================================================
 * ĐẶC TÍNH NÂNG CẤP V8.5 ĐÁP ỨNG TOÀN DIỆN YÊU CẦU:
 * 1. BỀ THẾ, RỘNG MỞ HEADER & FOOTER:
 *    - Header Wave nở rộng (pt-7 pb-2.5 px-14), cụm logo kép to rõ sắc nét (h-11 & h-10).
 *    - Vạch sóng Header uốn lượn đa màu kép (h-12, stroke 4px neon drop-shadow).
 *    - Footer Wave bề thế (min-h-[115px], py-6 px-14), hệ sóng 3 lớp chuyển động đại dương.
 *    - Đỉnh sóng Footer mạ Neon Crest đa dải màu (Cyan - Gold - Sapphire) phát quang 3D.
 *    - Text đúc kết chiến lược hiển thị đầy đủ, trang trọng, KHÔNG BỊ TRUNCATE cắt chữ.
 * 2. TRIỆT TIÊU TÌNH TRẠNG BỐ CỤC DÃN NHAU:
 *    - Tất cả Slide được bảo vệ trong Stage Container kính mờ (backdrop-blur-xl, max-w-[1720px]).
 *    - Tỷ lệ các cột được bố trí chặt chẽ, lấp đầy không gian hài hòa, cân đối.
 *    - Các slide App bố trí 3 cột (4 điểm tính năng - Khung điện thoại - 3 thẻ bảo chứng real-time).
 * 3. BỔ SUNG TRANG KẾT THÚC HOÀN HẢO (SLIDE 15):
 *    - Trang tri ân "XIN TRÂN TRỌNG CẢM ƠN!" tráng lệ, bề thế, trang trọng.
 *    - Cụm logo trung tâm phát quang, 4 khối cam kết chất lượng và thông tin liên hệ chính thức.
 * 4. NẠP 100% ẢNH LIVE PRODUCTION XÁC THỰC SẠCH (KHÔNG FORM LOGIN, KHÔNG POPUP):
 *    - Dashboard BI & Hội viên 360° đã đăng nhập xác thực.
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const pptxgen = require('pptxgenjs');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_DIR = path.join(ROOT_DIR, 'document');
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps/ceo1983_app_fe/public/docs');
const LIVE_IMG_DIR = path.join(DOC_DIR, 'images/live_captures_fresh');
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

// Logo chính thức chuẩn 100%
const LOGO_CEO1983 = getBase64Image(path.join(DOC_DIR, 'images/ceo1983-official-logo.png'));
const LOGO_VICONNECT = getBase64Image(path.join(DOC_DIR, 'images/viconnect-logo.png'));

// Backgrounds
const BG_SKYLINE_NIGHT = getBase64Image(path.join(BG_DIR, '08_skyline_night.jpg'));
const BG_OPERATIONS = getBase64Image(path.join(BG_DIR, '04_operations.jpg'));
const BG_BANQUET_GALA = getBase64Image(path.join(BG_DIR, '07_banquet_gala.jpg'));
const BG_BOARDROOM = getBase64Image(path.join(BG_DIR, '02_boardroom.jpg'));
const BG_SMARTCITY = getBase64Image(path.join(BG_DIR, '03_smartcity.jpg'));

// Ảnh CRM thực tế đã xác thực sạch
const CRM_01 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_01_dashboard_tongquan.png'));
const CRM_02 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_02_thongke_baocao_bi.png'));
const CRM_03 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_03_quanly_hoivien_360.png'));
const CRM_04 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_04_quanly_sukien_gala.png'));
const CRM_05 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_05_chuongtrinh_daotao.png'));
const CRM_06 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_06_baocao_taichinh_thuchi.png'));
const CRM_07 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_07_quanly_hoiphi_vietqr.png'));
const CRM_08 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_08_giaoviec_ban_dieuhanh.png'));

// Ảnh Mobile App thực tế sạch (không popup)
const APP_01 = getBase64Image(path.join(LIVE_IMG_DIR, 'app_01_trangchu_doanhnhan.png'));
const APP_02 = getBase64Image(path.join(LIVE_IMG_DIR, 'app_02_the_hoivien_so_vip.png'));
const APP_03 = getBase64Image(path.join(LIVE_IMG_DIR, 'app_03_danhthiep_dien_tu.png'));
const APP_04 = getBase64Image(path.join(LIVE_IMG_DIR, 'app_04_san_giaothuong_b2b.png'));
const APP_05 = getBase64Image(path.join(LIVE_IMG_DIR, 'app_05_sukien_ve_dien_tu.png'));
const APP_06 = getBase64Image(path.join(LIVE_IMG_DIR, 'app_06_chuongtrinh_daotao.png'));
const APP_07 = getBase64Image(path.join(LIVE_IMG_DIR, 'app_07_danhba_lanhdao_ceo.png'));
const APP_08 = getBase64Image(path.join(LIVE_IMG_DIR, 'app_08_hoso_doanhnghiep_360.png'));

console.log('✓ Đã nạp đầy đủ logo, backgrounds và ảnh live sạch cho V8.5.');

// =========================================================================
// DANH SÁCH TOÀN BỘ 15 SLIDES V8.5 MONUMENTAL WAVE
// =========================================================================
const SLIDES_V8 = [
  {
    id: 1,
    type: 'dual_overview',
    tag: 'BỨC TRANH TỔNG THỂ TOÀN CẢNH',
    title: 'HỆ SINH THÁI SỐ TOÀN DIỆN CLB DOANH NHÂN CEO 1983',
    subtitle: 'Nền tảng Quản trị Điều hành Web CRM & Văn phòng số bỏ túi Mobile App chuẩn hóa Hội viên',
    summaryText: 'Đột phá toàn diện trong quản trị hiệp hội: Trung tâm điều hành Web CRM minh bạch kết hợp cùng Văn phòng số bỏ túi Mobile App mang lại sức mạnh vận hành vượt trội cho 500+ doanh nhân.',
    kpis: [
      { num: '500+', label: 'Hội Viên Doanh Nhân', icon: '👥' },
      { num: '06', label: 'Ban Chuyên Môn Vận Hành', icon: '🏛️' },
      { num: '100%', label: 'Số Hóa Hoạt Động', icon: '⚡' },
      { num: '01s', label: 'Check-in Vé Sự Kiện', icon: '🎟️' },
    ]
  },
  {
    id: 2,
    type: 'two_products_detail',
    tag: 'KIẾN TRÚC TƯƠNG HỖ KHÉP KÍN',
    title: 'HAI CÔNG CỤ ĐỘT PHÁ TƯƠNG TÁC ĐỒNG BỘ HAI CHIỀU',
    subtitle: 'Web CRM chuẩn hóa quản trị điều hành — Mobile App trao quyền kết nối giao thương tức thì cho hội viên',
    summaryText: 'Đồng bộ hóa tức thì qua nền tảng Cloud: Mọi thay đổi về sự kiện, đào tạo, bàn tiệc và hội phí trên Web CRM đều được phản ánh tức thì xuống điện thoại của hội viên.',
    crm: {
      title: '1. CỔNG ĐIỀU HÀNH TRUNG TÂM WEB CRM',
      target: 'Dành cho: Chủ Tịch, Ban Thư Ký & 6 Ban Chuyên Môn',
      bullets: [
        'Quản lý hồ sơ hội viên 360° & phân quyền RBAC 11 cấp bảo mật',
        'Dashboard BI & Thống kê Recharts đo lường tương tác và dòng tiền',
        'Sơ đồ xếp bàn tiệc Gala trang trọng, phân bổ chỗ ngồi VIP thông minh',
        'Quản lý hội phí VietQR tự động, gạch nợ tức thì và minh bạch sổ quỹ',
        'Điều hành giao việc Kanban, theo dõi tiến độ các ban thời gian thực',
        'Thiết lập chương trình đào tạo doanh nhân, mở link đăng ký & kho tài liệu số',
      ]
    },
    app: {
      title: '2. VĂN PHÒNG DOANH NHÂN BỎ TÚI MOBILE APP',
      target: 'Dành cho: Toàn thể hơn 500 Doanh nhân Hội viên',
      bullets: [
        'Thẻ hội viên số nhận diện Doanh nhân VIP & danh thiếp điện tử 1 chạm',
        'Sàn giao thương B2B nội khối, trao đổi cơ hội và xúc tiến hợp đồng',
        'Ví vé sự kiện Gala, xem vị trí bàn tiệc và QR Check-in 1 giây tại cửa',
        'Bục vinh danh Top 3 doanh nhân tiêu biểu, đo lường điểm tương tác số',
        'Đăng ký khóa học, học trực tuyến và tiếp cận kho bài giảng quản trị số',
        'Nhắn tin nội bộ, gọi điện danh bạ lãnh đạo và cập nhật tin tức hiệp hội 24/7',
      ]
    }
  },
  {
    id: 3,
    type: 'crm_feature',
    tag: 'PHÂN HỆ TRỌNG YẾU 01 - CRM',
    title: 'DASHBOARD TỔNG QUAN & HỒ SƠ HỘI VIÊN 360° TRÊN CRM',
    subtitle: 'Nắm trọn dữ liệu vận hành toàn hiệp hội trong một màn hình điều hành duy nhất',
    summaryText: 'Chuẩn hóa định danh số doanh nghiệp: Kiểm soát truy cập chặt chẽ theo 11 cấp bậc phân quyền, loại bỏ hoàn toàn nguy cơ rò rỉ thông tin nội bộ của CLB.',
    crmImg: CRM_01,
    points: [
      'Dashboard BI cập nhật thời gian thực các chỉ số tài chính, sự kiện và tương tác hội viên.',
      'Hồ sơ doanh nghiệp đầy đủ thông tin pháp lý, ngành nghề kinh doanh và người đại diện.',
      'Cơ chế phân quyền 11 cấp chặt chẽ: Chủ tịch, Phó Chủ tịch, Trưởng ban, Kế toán, Thư ký, Hội viên.',
      'Xuất báo cáo danh sách hội viên chuẩn Excel phục vụ công tác đối soát của Ban Thư Ký.'
    ]
  },
  {
    id: 4,
    type: 'crm_feature',
    tag: 'PHÂN HỆ TRỌNG YẾU 02 - CRM',
    title: 'THỐNG KÊ & BÁO CÁO BI TOÀN DIỆN (BAR + LINE RECHARTS)',
    subtitle: 'Đo lường trực quan hiệu quả hoạt động, biến động dòng tiền và vinh danh hội viên tích cực',
    summaryText: 'Quyết sách dựa trên dữ liệu thực tế: Cung cấp bức tranh toàn cảnh về giao thương, dòng tiền và tần suất tương tác, giúp Ban Điều Hành hoạch định chính sách chuẩn xác.',
    crmImg: CRM_02,
    points: [
      '4 Thẻ KPI chủ lực trên cùng: Tổng cơ hội B2B, Chi tiêu giao dịch, Lượt tương tác và Sự kiện đang mở.',
      'Biểu đồ kết hợp Bar + Line: Thể hiện xu hướng tăng (xanh) / giảm (đỏ) qua từng chu kỳ hoạt động.',
      'Avatar Top 1 gắn tại đỉnh chóp cột biểu đồ thể hiện sự trang trọng và định vị thương hiệu cá nhân.',
      'Bục vinh danh 3 cột trên 1 hàng ngang: Top 2 (Nhì) - Top 1 (Nhất có vương miện) - Top 3 (Ba).'
    ]
  },
  {
    id: 5,
    type: 'crm_feature',
    tag: 'PHÂN HỆ TRỌNG YẾU 03 - CRM',
    title: 'TỔ CHỨC SỰ KIỆN GALA & SƠ ĐỒ BÀN TIỆC ĐỘNG THÔNG MINH',
    subtitle: 'Giải phóng 90% áp lực đón tiếp khách mời, sắp xếp chỗ ngồi VIP chính xác và check-in 1 giây',
    summaryText: 'Nâng tầm đẳng cấp tổ chức sự kiện: Loại bỏ hoàn toàn tình trạng tranh cãi về chỗ ngồi tiệc Gala, kiểm soát chặt chẽ vé khách mời và check-in không chạm.',
    crmImg: CRM_04,
    points: [
      'Thiết kế sơ đồ bàn tiệc trực quan: Phân loại bàn VIP, Bàn Lãnh đạo, Bàn Hội viên và Khách mời danh dự.',
      'Gán hội viên vào từng bàn tiệc chỉ với 1 click kéo thả; tự động cảnh báo khi bàn tiệc đã đủ người.',
      'Vé điện tử phát hành tức thì vào Ví sự kiện trên Mobile App của từng hội viên kèm vị trí bàn.',
      'Cổng soát vé quét QR tại cửa: Điểm danh trong 1 giây, tự động cập nhật trạng thái "Đã tham gia".'
    ]
  },
  {
    id: 6,
    type: 'crm_feature',
    tag: 'PHÂN HỆ TRỌNG YẾU 04 - CRM',
    title: 'QUẢN LÝ HỘI PHÍ TỰ ĐỘNG VIETQR & SỔ QUỸ THU CHI MINH BẠCH',
    subtitle: 'Số hóa dòng tiền hiệp hội: Webhook ngân hàng gạch nợ tức thì, báo cáo tài chính tức thời',
    summaryText: 'Minh bạch tài chính tuyệt đối: Tự động hóa quy trình thu nộp hội phí qua VietQR động, giảm 95% thời gian đối soát kế toán và loại bỏ sai sót số liệu.',
    crmImg: CRM_07,
    points: [
      'Tạo mã VietQR động chuẩn NAPAS theo từng hội viên kèm cú pháp định danh chính xác.',
      'Webhook ngân hàng kết nối tự động: Nhận tiền về tài khoản là hệ thống tự động gạch nợ hội phí tức thì.',
      'Báo cáo dòng tiền thu chi minh bạch: Phân loại các khoản chi hoạt động, tài trợ và quỹ thiện nguyện.',
      'Hội viên xem trực tiếp lịch sử đóng phí và tải biên lai thu tiền điện tử trên Mobile App.'
    ]
  },
  {
    id: 7,
    type: 'crm_feature',
    tag: 'PHÂN HỆ TRỌNG YẾU 05 - CRM',
    title: 'CHƯƠNG TRÌNH ĐÀO TẠO DOANH NHÂN & KHO TRI THỨC SỐ',
    subtitle: 'Xây dựng học viện số cho CLB: Đào tạo trực tuyến, cấp chứng chỉ và lưu trữ tài liệu vĩnh viễn',
    summaryText: 'Nâng cao năng lực lãnh đạo: Xây dựng kho học liệu chuẩn hóa, hỗ trợ hội viên tiếp cận kiến thức quản trị thực chiến từ các chuyên gia hàng đầu.',
    crmImg: CRM_05,
    points: [
      'Khởi tạo khóa học trực tiếp / trực tuyến (Hybrid) với thông tin giảng viên, tài liệu và học phí.',
      'Phát hành link đăng ký độc quyền cho hội viên; kiểm soát số lượng học viên tham gia từng khóa.',
      'Tích hợp phòng học số, lưu trữ video bài giảng và slide thuyết trình để hội viên ôn tập.',
      'Cấp chứng nhận số có mã xác thực cho hội viên hoàn thành đầy đủ chương trình đào tạo.'
    ]
  },
  {
    id: 8,
    type: 'crm_feature',
    tag: 'PHÂN HỆ TRỌNG YẾU 06 - CRM',
    title: 'ĐIỀU HÀNH GIAO VIỆC KANBAN & THEO DÕI TIẾN ĐỘ 6 BAN CHUYÊN MÔN',
    subtitle: 'Chuẩn hóa quy trình tác nghiệp của Ban Điều Hành: Không sót việc, đúng hạn và rõ trách nhiệm',
    summaryText: 'Vận hành kỷ cương, hiệu quả: Theo dõi tiến độ từng công việc theo thời gian thực, gắn kết trách nhiệm của Trưởng ban và các ủy viên phụ trách.',
    crmImg: CRM_08,
    points: [
      'Bảng Kanban trực quan phân chia rõ 4 trạng thái: Cần làm, Đang làm, Chờ duyệt và Đã hoàn thành.',
      'Giao việc trực tiếp cho từng cá nhân hoặc Ban Chuyên Môn kèm thời hạn và mức độ ưu tiên.',
      'Đính kèm tài liệu, biên bản cuộc họp và trao đổi bình luận trực tiếp ngay trên thẻ công việc.',
      'Thông báo nhắc nhở tự động qua push notification khi công việc sắp đến hạn hoặc có cập nhật mới.'
    ]
  },
  {
    id: 9,
    type: 'app_feature',
    tag: 'PHÂN HỆ TRỌNG YẾU 07 - MOBILE APP',
    title: 'TRANG CHỦ DOANH NHÂN & 14 PHÍM TẮT TÁC NGHIỆP TỨC THÌ',
    subtitle: 'Văn phòng số bỏ túi mở ra không gian giao thương, kết nối và nhận thông báo quan trọng 24/7',
    summaryText: 'Tiện ích trong tầm tay: Tích hợp đầy đủ các phím tắt nhắn tin, tra cứu danh bạ, tìm kiếm đối tác và theo dõi sự kiện sắp tới ngay tại màn hình chính.',
    appImgMain: APP_01,
    mainLabel: 'TRANG CHỦ DOANH NHÂN',
    points: [
      'Header thông minh hiển thị chức vụ, số điện thoại chính danh và số lượng thông báo chưa đọc.',
      'Cụm phím tắt nhanh 1 chạm: Nhắn tin trao đổi, Tìm hội viên theo ngành, Gửi cơ hội B2B và Góc hội viên.',
      'Đếm ngược thời gian sự kiện sắp diễn ra kèm hình ảnh bàn tiệc Gala trực quan, không bỏ lỡ hoạt động.',
      'Khu vực Ưu đãi riêng dành cho Hội viên & Đối tác, gia tăng quyền lợi độc quyền khi tham gia hiệp hội.'
    ]
  },
  {
    id: 10,
    type: 'app_feature',
    tag: 'PHÂN HỆ TRỌNG YẾU 08 - MOBILE APP',
    title: 'THẺ HỘI VIÊN SỐ & DANH THIẾP ĐIỆN TỬ 1 CHẠM CÁ NHÂN HÓA',
    subtitle: 'Định danh số Doanh nhân thời hạn thực, tích hợp mã QR động và chia sẻ thông tin bảo mật',
    summaryText: 'Định danh số sang trọng và hiện đại: Thay thế hoàn toàn danh thiếp giấy truyền thống, trao đổi thông tin doanh nghiệp trong 1 chạm quét mã QR.',
    appImgMain: APP_02,
    mainLabel: 'THẺ HỘI VIÊN SỐ VIP',
    points: [
      'Thẻ hội viên số nhận diện Doanh nhân VIP với logo Hiệp hội, họ tên, chức vụ và thời hạn thẻ minh bạch.',
      'Mã QR động cá nhân hóa: Quét để lưu danh bạ trực tiếp vào điện thoại đối tác mà không cần cài thêm app.',
      'Bộ công cụ tác nghiệp: Nút Quét QR, Chụp danh thiếp OCR, Chỉnh sửa thông tin, Chia sẻ và Tải Profile PDF.',
      'Tùy chỉnh quyền riêng tư linh hoạt: Chủ động chọn Ẩn/Hiện Số điện thoại hoặc Email khi người lạ quét thẻ.'
    ]
  },
  {
    id: 11,
    type: 'app_feature',
    tag: 'PHÂN HỆ TRỌNG YẾU 09 - MOBILE APP',
    title: 'SÀN GIAO THƯƠNG B2B & KẾT NỐI NHU CẦU MUA BÁN NỘI KHỐI',
    subtitle: 'Thúc đẩy doanh thu thực tế: Đăng tin tìm kiếm đối tác, chào bán sản phẩm dịch vụ uy tín',
    summaryText: 'Thị trường nội khối sôi động: Tạo môi trường giao thương chính danh, ưu tiên sử dụng sản phẩm dịch vụ của nhau giữa hơn 500 doanh nghiệp cùng lứa tuổi.',
    appImgMain: APP_04,
    mainLabel: 'SÀN CƠ HỘI GIAO THƯƠNG B2B',
    points: [
      'Đăng tin cơ hội hợp tác đa ngành: Tìm nhà cung ứng, tìm đại lý, kêu gọi vốn và hợp tác liên doanh.',
      'Bộ lọc tìm kiếm thông minh theo ngành nghề, khu vực địa lý và quy mô doanh nghiệp trong CLB.',
      'Kết nối trực tiếp qua nút gọi điện, nhắn tin nội bộ hoặc đặt lịch hẹn gặp mặt trao đổi công việc.',
      'Ghi nhận giá trị giao dịch và doanh số xúc tiến thương mại nội khối để vinh danh định kỳ.'
    ]
  },
  {
    id: 12,
    type: 'app_feature',
    tag: 'PHÂN HỆ TRỌNG YẾU 10 - MOBILE APP',
    title: 'VÉ SỰ KIỆN GALA ĐIỆN TỬ & CHECK-IN QR TỰ ĐỘNG 1 GIÂY',
    subtitle: 'Trải nghiệm sự kiện không chạm: Điểm danh đón tiếp chuyên nghiệp tại cửa, tự động dẫn đường đến bàn tiệc',
    summaryText: 'Vận hành sự kiện đẳng cấp 5 sao: Không lo quên vé giấy, quét mã QR trong 1 giây là nắm rõ vị trí bàn tiệc VIP và danh sách đối tác ngồi cùng bàn.',
    appImgMain: APP_05,
    mainLabel: 'VÉ SỰ KIỆN & VỊ TRÍ BÀN TIỆC',
    points: [
      'Ví vé sự kiện điện tử cập nhật tự động ngay khi hội viên đăng ký thành công trên ứng dụng.',
      'Hiển thị rõ ràng số bàn tiệc, tên bàn VIP và danh sách khách mời ngồi cùng bàn để thuận tiện giao lưu.',
      'Mã QR Check-in độc bản: Nhân viên lễ tân quét tại cửa là hệ thống tự động xác nhận tham dự tức thì.',
      'Xem lại lịch sử các kỳ Đại hội, Tọa đàm và hình ảnh sự kiện được lưu trữ vĩnh viễn trên Cloud.'
    ]
  },
  {
    id: 13,
    type: 'app_feature',
    tag: 'PHÂN HỆ TRỌNG YẾU 11 - MOBILE APP',
    title: 'CHƯƠNG TRÌNH ĐÀO TẠO HYBRID & KHO BÀI GIẢNG SỐ DÀNH CHO CEO',
    subtitle: 'Học tập liên tục mọi lúc mọi nơi: Kết nối chuyên gia hàng đầu, lan tỏa tri thức quản trị thực chiến',
    summaryText: 'Học viện số bỏ túi: Giúp các CEO cập nhật xu hướng công nghệ, quản trị nhân sự và tài chính doanh nghiệp mọi lúc mọi nơi ngay trên thiết bị di động.',
    appImgMain: APP_06,
    mainLabel: 'CHƯƠNG TRÌNH ĐÀO TẠO SỐ',
    points: [
      'Thông báo lớp học mới tự động qua push notification trên điện thoại của toàn thể hội viên.',
      'Học trực tuyến một chạm qua phòng họp bảo mật cao tích hợp sẵn, không lo gián đoạn đường truyền.',
      'Kho tài liệu bài giảng, biểu mẫu quản trị và slide thuyết trình cho phép tải về máy đọc offline.',
      'Đánh giá chất lượng khóa học và cấp chứng nhận số hoàn thành chương trình đào tạo của Hiệp hội.'
    ]
  },
  {
    id: 14,
    type: 'conclusion',
    tag: 'CAM KẾT ĐỒNG HÀNH & KẾ HOẠCH BÀN GIAO',
    title: 'LỘ TRÌNH TRIỂN KHAI & CAM KẾT ĐỒNG HÀNH TOÀN DIỆN',
    subtitle: 'ViConnect Technology đồng hành trọn đời cùng sự phát triển lớn mạnh của CLB Doanh nhân CEO 1983',
    summaryText: 'Đối tác công nghệ tin cậy: Cam kết bảo trì 24/7, nâng cấp liên tục và hỗ trợ tận tâm mọi hoạt động chuyển đổi số của Hiệp hội trong suốt giai đoạn phát triển.',
    commitments: [
      {
        title: 'Bảo Trì & Vận Hành 24/7',
        desc: 'Đảm bảo hệ thống hoạt động ổn định 99.9% trên hạ tầng máy chủ đám mây tốc độ cao, hỗ trợ kỹ thuật tức thời.'
      },
      {
        title: 'Bảo Mật Dữ Liệu Đa Tầng',
        desc: 'Mã hóa SSL/TLS, sao lưu tự động hàng ngày, tuân thủ nghiêm ngặt bảo mật thông tin kinh doanh của hội viên.'
      },
      {
        title: 'Tập Huấn & Chuyển Giao',
        desc: 'Hướng dẫn chi tiết Ban Thư Ký và 6 Ban Chuyên Môn sử dụng thành thạo toàn bộ các phân hệ quản trị.'
      },
      {
        title: 'Nâng Cấp Tính Năng Liên Tục',
        desc: 'Lắng nghe phản hồi từ Ban Điều Hành để bổ sung kịp thời các tiện ích mới phục vụ nhu cầu giao thương kết nối.'
      }
    ]
  },
  {
    id: 15,
    type: 'closing_thankyou',
    tag: 'TRI ÂN & HỢP TÁC BỀN VỮNG',
    title: 'XIN TRÂN TRỌNG CẢM ƠN!',
    subtitle: 'KÍNH CHÚC CLB DOANH NHÂN CEO 1983 NGÀY CÀNG PHÁT TRIỂN THỊNH VƯỢNG, BỀN VỮNG VÀ VƯƠN TẦM CAO MỚI',
    summaryText: 'ViConnect Technology tự hào là đối tác công nghệ chiến lược đồng hành cùng sự phát triển vươn tầm của Hiệp hội Doanh nghiệp Trẻ Hà Nội & CLB CEO 1983.',
    commitments: [
      {
        title: 'Hạ Tầng Ổn Định 99.9%',
        desc: 'Hệ thống vận hành liên tục trên hạ tầng Cloud tốc độ cao, hỗ trợ kỹ thuật 24/7 không gián đoạn.'
      },
      {
        title: 'Bảo Mật Dữ Liệu Tuyệt Đối',
        desc: 'Mã hóa SSL/TLS đa tầng, sao lưu tự động và bảo mật thông tin doanh nghiệp theo tiêu chuẩn cao cấp.'
      },
      {
        title: 'Đồng Hành Phát Triển Liên Tục',
        desc: 'Luôn lắng nghe ý kiến chỉ đạo từ Ban Điều Hành để bổ sung tính năng mới, phục vụ tối đa quyền lợi hội viên.'
      },
      {
        title: 'Chuyển Giao & Hỗ Trợ Tận Tâm',
        desc: 'Tập huấn kỹ lưỡng cho Ban Thư Ký và 6 Ban Chuyên Môn làm chủ toàn diện hệ thống điều hành số.'
      }
    ],
    contact: {
      company: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VICONNECT',
      hotline: '0983.000.001',
      email: 'contact@viconnect.vn',
      webCrm: 'https://crm.ceo1983.viconnect.vn',
      webApp: 'https://ceo1983.viconnect.vn'
    }
  }
];

// =========================================================================
// HÀM TẠO HTML BẢN TRÌNH CHIẾU TƯƠNG TÁC (15 SLIDES MONUMENTAL WAVE)
// =========================================================================
function generateSlideDeckHtml() {
  const slidesJson = JSON.stringify(SLIDES_V8);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>SLIDE TỔNG THỂ HỆ SINH THÁI CEO 1983 - BẢN NÂNG CẤP V8.5 MONUMENTAL WAVE</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      margin: 0;
      padding: 0;
      background: #010511;
      color: #fff;
    }
    .slide-wrapper {
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .slide-viewport {
      flex: 1;
      position: relative;
      background: #000;
      overflow: hidden;
    }
    .deep-navy-bg {
      background: radial-gradient(120% 90% at 50% 20%, #082463 0%, #031138 40%, #01081f 75%, #00040f 100%);
    }

    /* 3 Ảnh nền đan xen mờ tinh tế */
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
      opacity: 0.60;
    }
    .bg-slide-c {
      position: absolute;
      inset: 0;
      background-image: url('${BG_OPERATIONS}');
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
      background-image: url('${BG_BANQUET_GALA}');
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
    }

    /* Khung Smartphone chuẩn tỷ lệ không crop xén */
    .phone-mockup-v8 {
      position: relative;
      border-radius: 46px;
      padding: 10px;
      background: linear-gradient(145deg, #2b3952, #0d1527);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8),
                  0 0 35px rgba(0, 212, 255, 0.35),
                  inset 0 1px 2px rgba(255, 255, 255, 0.3);
      border: 3.5px solid #3b4e6d;
    }
    .phone-inner-v8 {
      position: relative;
      border-radius: 36px;
      overflow: hidden;
      background: #000;
      border: 1px solid #1e293b;
    }
    .phone-notch-v8 {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 88px;
      height: 22px;
      background: #000;
      border-radius: 20px;
      z-index: 30;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.5);
    }
    .phone-camera-v8 {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #141b2d;
      border: 1.5px solid #2a3754;
    }

    /* Unified Stage Container: Khắc phục triệt để bố cục bị dãn rời rạc */
    .stage-container {
      max-width: 1720px;
      width: 100%;
      margin: auto;
      padding: 1.5rem 2.2rem;
      background: rgba(3, 14, 38, 0.62);
      backdrop-filter: blur(18px);
      border: 1.5px solid rgba(255, 255, 255, 0.16);
      border-radius: 36px;
      box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.85), 0 0 50px rgba(0, 212, 255, 0.18);
    }

    /* Print mode 16:9 */
    @media print {
      @page {
        size: 16in 9in;
        margin: 0;
      }
      body {
        background: #000 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .screen-controls {
        display: none !important;
      }
      .slide-page-print {
        width: 16in !important;
        height: 9in !important;
        page-break-after: always !important;
        page-break-inside: avoid !important;
        position: relative !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
      }
    }
  </style>
</head>
<body class="overflow-hidden">

  <!-- MÀN HÌNH TRÌNH CHIẾU CHÍNH -->
  <div class="slide-wrapper">
    <div class="slide-viewport">
      <div id="slideContent" class="w-full h-full relative overflow-hidden flex flex-col justify-between"></div>
    </div>

    <!-- THANH ĐIỀU KHIỂN & BẬT TẮT SLIDE -->
    <div class="w-full h-14 bg-[#000a1c] border-t border-cyan-500/30 px-8 flex items-center justify-between text-white text-xs z-50 shrink-0 screen-controls">
      <div class="flex items-center gap-3">
        <span class="text-blue-200/80 font-bold">Phím điều khiển:</span>
        <kbd class="px-2 py-0.5 rounded bg-white/10 text-[11px] font-mono">[←] Trước</kbd>
        <kbd class="px-2 py-0.5 rounded bg-white/10 text-[11px] font-mono">[→] Tiếp theo</kbd>
      </div>

      <div class="flex items-center gap-4">
        <button onclick="prevSlide()" class="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition font-black cursor-pointer">
          ◀ TRƯỚC
        </button>
        <span id="slideIndicator" class="font-mono font-black text-cyan-300 text-sm tracking-widest px-2">
          1 / 15
        </span>
        <button onclick="nextSlide()" class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black transition cursor-pointer shadow-lg shadow-cyan-500/30">
          TIẾP THEO ▶
        </button>
      </div>

      <div class="flex items-center gap-3 text-xs text-blue-200">
        <span>Đơn vị phát triển hệ thống: <strong class="text-white font-bold">VICONNECT TECHNOLOGY</strong></span>
        <span>·</span>
        <span class="text-amber-400 font-bold">CLB DOANH NHÂN CEO 1983</span>
      </div>
    </div>
  </div>

  <script>
    const slides = ${slidesJson};
    let currentIdx = 0;

    function renderSlide(idx) {
      const s = slides[idx];
      const container = document.getElementById('slideContent');
      document.getElementById('slideIndicator').innerText = (idx + 1) + ' / ' + slides.length;

      // =========================================================================
      // [MONUMENTAL WAVE HEADER] - BỀ THẾ, UY NGHI, LOGO TO RÕ, ĐƯỜNG KẺ SÓNG DÀY DẶN
      // =========================================================================
      const commonHeader = \`
        <header class="relative z-20 shrink-0 pt-7 pb-2 px-14">
          <div class="flex items-center justify-between pb-3">
            <!-- Cụm logo kép chuẩn sắc nét không fake -->
            <div class="flex items-center gap-6">
              <div class="h-16 px-7 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md flex items-center justify-center shadow-2xl border-2 border-white/90">
                <img src="${LOGO_CEO1983}" class="h-11 w-auto object-contain" alt="Logo CEO 1983 Chuẩn" />
              </div>
              <div class="h-9 w-[2.5px] bg-gradient-to-b from-cyan-400 via-blue-500 to-amber-400"></div>
              <div class="h-16 px-7 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md flex items-center justify-center shadow-2xl border-2 border-white/90">
                <img src="${LOGO_VICONNECT}" class="h-10 w-auto object-contain" alt="Logo ViConnect Chuẩn" />
              </div>
            </div>

            <div class="flex items-center gap-5">
              <span class="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500/25 to-blue-600/35 border-2 border-cyan-400/60 text-cyan-300 text-xs font-black uppercase tracking-wider shadow-lg">
                \${s.tag}
              </span>
              <span class="font-mono text-sm font-black text-white bg-white/15 px-5 py-2.5 rounded-2xl border border-white/20 shadow">
                SLIDE \${s.id} / 15
              </span>
            </div>
          </div>

          <!-- DÒNG KẺ SÓNG HEADER UỐN LƯỢN ĐA MÀU (WAVE LINE NỞ RỘNG CAO 48PX) -->
          <div class="w-full h-12 overflow-hidden relative mt-1">
            <svg viewBox="0 0 1440 52" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full block">
              <defs>
                <linearGradient id="headerWaveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#00d4ff" stop-opacity="0.95"/>
                  <stop offset="35%" stop-color="#0055ff" stop-opacity="1"/>
                  <stop offset="70%" stop-color="#00f5d4" stop-opacity="0.95"/>
                  <stop offset="100%" stop-color="#ffb703" stop-opacity="0.95"/>
                </linearGradient>
                <linearGradient id="headerWaveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#7209b7" stop-opacity="0.4"/>
                  <stop offset="50%" stop-color="#00b4d8" stop-opacity="0.5"/>
                  <stop offset="100%" stop-color="#0055ff" stop-opacity="0.3"/>
                </linearGradient>
                <filter id="neonHeaderGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <path d="M0,32 C280,54 560,14 840,38 C1120,56 1300,18 1440,30 L1440,0 L0,0 Z" fill="url(#headerWaveGrad2)" opacity="0.25" />
              <path d="M0,28 C280,50 560,10 840,34 C1120,52 1300,14 1440,26" stroke="#7209b7" stroke-width="2.5" stroke-opacity="0.5" stroke-linecap="round" fill="none" />
              <path d="M0,20 C260,42 520,6 800,28 C1080,48 1280,12 1440,22" stroke="url(#headerWaveGrad1)" stroke-width="4" stroke-linecap="round" fill="none" filter="url(#neonHeaderGlow)" />
            </svg>
          </div>
        </header>
      \`;

      // =========================================================================
      // [MONUMENTAL WAVE FOOTER] - SÓNG NỔI 3 LỚP ĐẠI DƯƠNG BỀ THẾ, RỰC RỠ, KHÔNG HẸP
      // =========================================================================
      const commonFooter = \`
        <footer class="relative z-20 w-full overflow-hidden shrink-0 mt-auto min-h-[115px] flex flex-col justify-end">
          <!-- 3 LỚP SÓNG SVG NỔI ĐA DẢI MÀU (CAO 140PX) -->
          <div class="absolute inset-0 pointer-events-none z-0">
            <svg viewBox="0 0 1440 140" preserveAspectRatio="none" class="w-full h-full block">
              <defs>
                <linearGradient id="waveLayer1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#010920" stop-opacity="0.98"/>
                  <stop offset="50%" stop-color="#061d4a" stop-opacity="0.98"/>
                  <stop offset="100%" stop-color="#000a1c" stop-opacity="0.98"/>
                </linearGradient>
                <linearGradient id="waveLayer2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.85"/>
                  <stop offset="35%" stop-color="#0055ff" stop-opacity="0.9"/>
                  <stop offset="70%" stop-color="#00b4d8" stop-opacity="0.85"/>
                  <stop offset="100%" stop-color="#7209b7" stop-opacity="0.75"/>
                </linearGradient>
                <linearGradient id="waveLayer3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#031738" stop-opacity="0.95"/>
                  <stop offset="50%" stop-color="#06285a" stop-opacity="0.92"/>
                  <stop offset="100%" stop-color="#021028" stop-opacity="0.95"/>
                </linearGradient>
                <linearGradient id="neonWaveCrest" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#00f5d4" stop-opacity="0.95"/>
                  <stop offset="35%" stop-color="#ffb703" stop-opacity="0.98"/>
                  <stop offset="70%" stop-color="#00d4ff" stop-opacity="0.95"/>
                  <stop offset="100%" stop-color="#ff006e" stop-opacity="0.9"/>
                </linearGradient>
                <filter id="neonWaveGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <!-- Lớp 1: Sóng nền sâu nhất đại dương Midnight Navy -->
              <path d="M0,75 C320,30 640,105 960,52 C1200,22 1350,68 1440,46 L1440,140 L0,140 Z" fill="url(#waveLayer1)" />

              <!-- Lớp 2: Sóng giữa Cyan/Blue chuyển động mềm mại lấp lánh -->
              <path d="M0,50 C260,95 540,32 820,78 C1100,115 1320,38 1440,55 L1440,140 L0,140 Z" fill="url(#waveLayer2)" opacity="0.42" />

              <!-- Lớp 3: Sóng tiền cảnh pha lê sẫm ôm trọn văn bản -->
              <path d="M0,28 C220,8 460,65 720,32 C980,2 1220,52 1440,22 L1440,140 L0,140 Z" fill="url(#waveLayer3)" opacity="0.85" />
              
              <!-- Viền sáng Neon chạy dọc đỉnh sóng lớp 3 rực rỡ uốn lượn -->
              <path d="M0,28 C220,8 460,65 720,32 C980,2 1220,52 1440,22" stroke="url(#neonWaveCrest)" stroke-width="4" stroke-linecap="round" fill="none" filter="url(#neonWaveGlow)" />
            </svg>
          </div>

          <!-- NỘI DUNG FOOTER RỘNG MỞ, TRANG TRỌNG, KHÔNG BỊ TRUNCATE CẮT CHỮ -->
          <div class="relative z-10 px-14 py-5 flex items-center justify-between text-white">
            <div class="flex items-center gap-4 flex-1">
              <span class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2 border border-white/40 shrink-0">
                <span>★</span> ĐÚC KẾT CHIẾN LƯỢC
              </span>
              <span class="text-[14px] font-extrabold text-blue-50 drop-shadow-md leading-relaxed flex-1 px-5">
                \${s.summaryText}
              </span>
            </div>
            <div class="flex items-center gap-3 font-mono text-xs font-black text-cyan-300 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border border-cyan-400/50 shrink-0">
              <span>HANOIBA · CEO 1983</span>
            </div>
          </div>
        </footer>
      \`;

      let html = '';

      // =========================================================================
      // DẠNG 1: DUAL OVERVIEW (SLIDE 1 - KÉP LAPTOP CRM & 2 ĐIỆN THOẠI APP SẠCH)
      // =========================================================================
      if (s.type === 'dual_overview') {
        html = \`
          <div class="w-full h-full deep-navy-bg relative overflow-hidden flex flex-col justify-between">
            <div class="bg-blend-slide">
              <div class="bg-slide-l"></div>
              <div class="bg-slide-c"></div>
              <div class="bg-slide-r"></div>
              <div class="bg-slide-mask"></div>
            </div>
            \${commonHeader}

            <div class="stage-container my-auto">
              <div class="grid grid-cols-12 gap-8 items-center">
                
                <!-- Cột trái: Cổng điều hành Web CRM (Dashboard BI) -->
                <div class="col-span-6 flex flex-col items-center">
                  <div class="px-5 py-2 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-wider mb-2.5 shadow-lg flex items-center gap-2">
                    <span>💻</span> CỔNG ĐIỀU HÀNH TRUNG TÂM WEB CRM
                  </div>
                  <div class="w-full bg-[#1b2539] p-3.5 rounded-3xl border-2 border-cyan-400/40 shadow-2xl">
                    <div class="rounded-2xl overflow-hidden aspect-video border border-black bg-black">
                      <img src="${CRM_02}" class="w-full h-full object-cover object-top" alt="CRM Web" />
                    </div>
                  </div>
                  <div class="mt-2 text-center text-xs font-black text-cyan-300">
                    Dashboard BI · Quản Lý 500+ Hội Viên · Sơ Đồ Bàn Tiệc · Thu Phí VietQR
                  </div>
                </div>

                <!-- Cột giữa: Cột biểu tượng đồng bộ Real-Time Sync -->
                <div class="col-span-1 flex flex-col items-center justify-center">
                  <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-xl">
                    ⇄
                  </div>
                  <div class="text-[10px] font-mono text-cyan-300 font-bold uppercase mt-2 text-center">
                    REAL-TIME SYNC
                  </div>
                </div>

                <!-- Cột phải: 2 Khung Smartphone App sạch (Trang chủ & Thẻ VIP) -->
                <div class="col-span-5 flex flex-col items-center">
                  <div class="px-5 py-2 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider mb-2.5 shadow-lg flex items-center gap-2">
                    <span>📱</span> VĂN PHÒNG DOANH NHÂN BỎ TÚI MOBILE APP
                  </div>

                  <div class="flex items-center gap-5 justify-center w-full">
                    <!-- Phone 1: Trang chủ Doanh nhân -->
                    <div class="w-48 phone-mockup-v8">
                      <div class="phone-inner-v8 aspect-[9/18]">
                        <div class="phone-notch-v8">
                          <div class="phone-camera-v8"></div>
                        </div>
                        <img src="${APP_01}" class="w-full h-full object-cover object-top" alt="App Trang Chu" />
                      </div>
                      <div class="text-center text-[10px] font-extrabold text-white mt-2">1. Trang Chủ Doanh Nhân</div>
                    </div>

                    <!-- Phone 2: Thẻ Hội Viên VIP -->
                    <div class="w-48 phone-mockup-v8">
                      <div class="phone-inner-v8 aspect-[9/18]">
                        <div class="phone-notch-v8">
                          <div class="phone-camera-v8"></div>
                        </div>
                        <img src="${APP_02}" class="w-full h-full object-cover object-top" alt="App The Hoi Vien" />
                      </div>
                      <div class="text-center text-[10px] font-extrabold text-amber-300 mt-2">2. Thẻ Hội Viên Số VIP</div>
                    </div>
                  </div>

                  <div class="mt-2 text-center text-xs font-black text-amber-400">
                    Định Danh Số 1 Chạm · Sàn Giao Thương B2B · Vé Sự Kiện 1 Giây
                  </div>
                </div>

              </div>

              <!-- 4 THẺ CHỈ SỐ KPI CHỦ LỰC LIỀN MẠCH TRONG STAGE CONTAINER -->
              <div class="mt-5 grid grid-cols-4 gap-4">
                \${s.kpis.map(k => \`
                  <div class="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3.5 shadow-lg">
                    <span class="text-2xl">\${k.icon}</span>
                    <div>
                      <div class="text-lg font-black text-cyan-300 font-mono leading-none">\${k.num}</div>
                      <div class="text-[11px] font-bold text-white/90 uppercase mt-0.5">\${k.label}</div>
                    </div>
                  </div>
                \`).join('')}
              </div>
            </div>

            \${commonFooter}
          </div>
        \`;
      } 
      // =========================================================================
      // DẠNG 2: SO SÁNH 2 SẢN PHẨM CHI TIẾT (SLIDE 2 - ĐẦY ĐẶN, KHÔNG DÃN KHOẢNG TRỐNG)
      // =========================================================================
      else if (s.type === 'two_products_detail') {
        html = \`
          <div class="w-full h-full deep-navy-bg relative overflow-hidden flex flex-col justify-between">
            <img src="${BG_BOARDROOM}" class="absolute inset-0 w-full h-full object-cover opacity-20" alt="Boardroom" />
            \${commonHeader}

            <div class="stage-container my-auto">
              <div class="grid grid-cols-2 gap-8 items-stretch">
                <!-- Cột 1: CRM -->
                <div class="bg-white/95 rounded-3xl p-8 text-slate-900 shadow-2xl border border-white flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between border-b border-slate-200 pb-3">
                      <span class="px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase">
                        TRUNG TÂM ĐIỀU HÀNH
                      </span>
                      <span class="text-xs font-mono font-bold text-slate-500">DESKTOP WEB</span>
                    </div>
                    <h2 class="text-2xl font-black text-[#001F54] mt-3">\${s.crm.title}</h2>
                    <p class="text-xs font-extrabold text-blue-700 uppercase mt-1">\${s.crm.target}</p>
                    <ul class="mt-4 space-y-2.5 text-xs text-slate-700 font-medium">
                      \${s.crm.bullets.map(b => \`
                        <li class="flex items-start gap-2.5">
                          <span class="text-blue-600 font-black text-sm shrink-0">✔</span>
                          <span>\${b}</span>
                        </li>
                      \`).join('')}
                    </ul>
                  </div>
                  
                  <div class="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
                    <span class="px-3 py-1 rounded-lg bg-blue-50 text-blue-800 text-[11px] font-black">11 CẤP PHÂN QUYỀN RBAC</span>
                    <span class="text-blue-600 font-mono font-black">https://crm.ceo1983.viconnect.vn</span>
                  </div>
                </div>

                <!-- Cột 2: APP -->
                <div class="bg-white/95 rounded-3xl p-8 text-slate-900 shadow-2xl border border-white flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between border-b border-slate-200 pb-3">
                      <span class="px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase">
                        DOANH NHÂN BỎ TÚI
                      </span>
                      <span class="text-xs font-mono font-bold text-slate-500">MOBILE APP</span>
                    </div>
                    <h2 class="text-2xl font-black text-[#001F54] mt-3">\${s.app.title}</h2>
                    <p class="text-xs font-extrabold text-amber-700 uppercase mt-1">\${s.app.target}</p>
                    <ul class="mt-4 space-y-2.5 text-xs text-slate-700 font-medium">
                      \${s.app.bullets.map(b => \`
                        <li class="flex items-start gap-2.5">
                          <span class="text-amber-600 font-black text-sm shrink-0">✔</span>
                          <span>\${b}</span>
                        </li>
                      \`).join('')}
                    </ul>
                  </div>

                  <div class="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
                    <span class="px-3 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-black">ĐỒNG BỘ REAL-TIME SOCKET.IO</span>
                    <span class="text-amber-600 font-mono font-black">https://ceo1983.viconnect.vn</span>
                  </div>
                </div>
              </div>
            </div>

            \${commonFooter}
          </div>
        \`;
      }
      // =========================================================================
      // DẠNG 3: CÁC SLIDE TÍNH NĂNG CHUYÊN SÂU WEB CRM (SLIDE 3 ĐẾN 8)
      // =========================================================================
      else if (s.type === 'crm_feature') {
        html = \`
          <div class="w-full h-full deep-navy-bg relative overflow-hidden flex flex-col justify-between">
            <img src="${BG_SMARTCITY}" class="absolute inset-0 w-full h-full object-cover opacity-15" alt="SmartCity" />
            \${commonHeader}

            <div class="stage-container my-auto">
              <div class="grid grid-cols-12 gap-8 items-center">
                
                <!-- Cột trái: 4 điểm nổi bật của tính năng -->
                <div class="col-span-5 bg-white/95 rounded-3xl p-7 text-slate-900 shadow-2xl border border-white space-y-4">
                  <div>
                    <h2 class="text-2xl font-black text-[#001F54] leading-snug">\${s.title}</h2>
                    <p class="text-xs font-bold text-cyan-800 uppercase tracking-wide mt-1">\${s.subtitle}</p>
                  </div>

                  <div class="space-y-3 pt-1">
                    \${s.points.map((p, i) => \`
                      <div class="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div class="w-7 h-7 rounded-xl bg-[#001F54] text-white flex items-center justify-center font-black text-xs shrink-0">
                          0\${i + 1}
                        </div>
                        <div class="text-xs font-medium text-slate-700 leading-relaxed">
                          \${p}
                        </div>
                      </div>
                    \`).join('')}
                  </div>
                </div>

                <!-- Cột phải: Giao diện trực quan trên Web CRM (Màn hình ngang 16:9 sắc nét) -->
                <div class="col-span-7 flex flex-col gap-4">
                  <div class="bg-[#1b2539]/95 backdrop-blur-md p-3.5 rounded-3xl border-2 border-cyan-400/40 shadow-2xl">
                    <div class="flex items-center justify-between text-[11px] text-cyan-300 font-extrabold pb-2 px-1">
                      <span>GIAO DIỆN TRỰC QUAN TRÊN WEB CRM</span>
                      <span class="font-mono text-xs text-amber-300">LIVE PRODUCTION</span>
                    </div>
                    <div class="rounded-2xl overflow-hidden aspect-[16/8.8] border border-black bg-black">
                      <img src="\${s.crmImg}" class="w-full h-full object-cover object-top" alt="CRM Interface" />
                    </div>
                  </div>

                  <div class="flex items-center justify-between bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-xs text-blue-100">
                    <span class="font-bold flex items-center gap-2">
                      <span class="text-amber-400">★</span> Dữ liệu được bảo mật đa tầng và kiểm soát truy cập phân quyền nghiêm ngặt
                    </span>
                    <span class="font-mono text-cyan-300 font-bold">CEO 1983 Platform</span>
                  </div>
                </div>

              </div>
            </div>

            \${commonFooter}
          </div>
        \`;
      }
      // =========================================================================
      // DẠNG 4: CÁC SLIDE CHUYÊN SÂU MOBILE APP (SLIDE 9 ĐẾN 13 - 3 CỘT CÂN ĐỐI)
      // =========================================================================
      else if (s.type === 'app_feature') {
        html = \`
          <div class="w-full h-full deep-navy-bg relative overflow-hidden flex flex-col justify-between">
            <img src="${BG_SKYLINE_NIGHT}" class="absolute inset-0 w-full h-full object-cover opacity-20" alt="Skyline" />
            \${commonHeader}

            <div class="stage-container my-auto">
              <div class="grid grid-cols-12 gap-8 items-center">
                
                <!-- Cột trái: 4 điểm nổi bật của tính năng App -->
                <div class="col-span-6 bg-white/95 rounded-3xl p-8 text-slate-900 shadow-2xl border border-white space-y-4">
                  <div>
                    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase mb-1">
                      <span>📱</span> VĂN PHÒNG DOANH NHÂN BỎ TÚI
                    </div>
                    <h2 class="text-2xl font-black text-[#001F54] leading-snug">\${s.title}</h2>
                    <p class="text-xs font-bold text-amber-700 uppercase tracking-wide mt-1">\${s.subtitle}</p>
                  </div>

                  <div class="space-y-3 pt-1">
                    \${s.points.map((p, i) => \`
                      <div class="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div class="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center font-black text-xs shrink-0">
                          0\${i + 1}
                        </div>
                        <div class="text-xs font-medium text-slate-700 leading-relaxed">
                          \${p}
                        </div>
                      </div>
                    \`).join('')}
                  </div>
                </div>

                <!-- Cột giữa: KHUNG ĐIỆN THOẠI SMARTPHONE CHUẨN DỌC TO RÕ (h-[540px]) -->
                <div class="col-span-3 flex justify-center">
                  <div class="w-64 phone-mockup-v8">
                    <div class="flex items-center justify-between text-[11px] text-cyan-300 font-extrabold pb-1.5 px-2">
                      <span class="truncate">\${s.mainLabel}</span>
                      <span class="font-mono text-amber-300">LIVE</span>
                    </div>
                    <div class="phone-inner-v8 aspect-[9/18]">
                      <div class="phone-notch-v8">
                        <div class="phone-camera-v8"></div>
                      </div>
                      <img src="\${s.appImgMain}" class="w-full h-full object-cover object-top" alt="App Main Screenshot" />
                    </div>
                  </div>
                </div>

                <!-- Cột phải: 3 Thẻ bảo chứng công nghệ khớp chiều cao smartphone -->
                <div class="col-span-3 flex flex-col justify-between h-[540px] gap-3.5">
                  <div class="p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-white space-y-1.5 shadow-xl flex-1 flex flex-col justify-center">
                    <div class="flex items-center gap-2 text-cyan-300 font-black text-xs">
                      <span>⚡</span> TỐC ĐỘ REAL-TIME < 1 GIÂY
                    </div>
                    <p class="text-xs text-blue-100 leading-relaxed">
                      Tất cả thao tác quét QR, nhận thông báo đẩy và gạch nợ hội phí đều tức thời qua Socket.IO.
                    </p>
                  </div>

                  <div class="p-4 rounded-3xl bg-amber-500/10 backdrop-blur-md border border-amber-400/30 text-white space-y-1.5 shadow-xl flex-1 flex flex-col justify-center">
                    <div class="flex items-center gap-2 text-amber-300 font-black text-xs">
                      <span>🛡️</span> BẢO MẬT & QUYỀN RIÊNG TƯ
                    </div>
                    <p class="text-xs text-amber-100 leading-relaxed">
                      Mã hóa SSL/TLS đa tầng, doanh nhân toàn quyền ẩn/hiện thông tin liên hệ và danh thiếp cá nhân.
                    </p>
                  </div>

                  <div class="p-4 rounded-3xl bg-blue-500/10 backdrop-blur-md border border-cyan-400/30 text-white space-y-1.5 shadow-xl flex-1 flex flex-col justify-center">
                    <div class="flex items-center gap-2 text-cyan-300 font-black text-xs">
                      <span>🔄</span> ĐỒNG BỘ 100% WEB CRM
                    </div>
                    <p class="text-xs text-blue-100 leading-relaxed">
                      Dữ liệu hội viên, sự kiện và giao thương luân chuyển thông suốt hai chiều với Ban Thư Ký.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            \${commonFooter}
          </div>
        \`;
      }
      // =========================================================================
      // DẠNG 5: CONCLUSION (SLIDE 14 - KẾT LUẬN & CAM KẾT)
      // =========================================================================
      else if (s.type === 'conclusion') {
        html = \`
          <div class="w-full h-full deep-navy-bg relative overflow-hidden flex flex-col justify-between">
            <div class="bg-blend-slide">
              <div class="bg-slide-l"></div>
              <div class="bg-slide-c"></div>
              <div class="bg-slide-r"></div>
              <div class="bg-slide-mask"></div>
            </div>
            \${commonHeader}

            <div class="stage-container my-auto max-w-6xl">
              <div class="text-center space-y-2 mb-6">
                <h2 class="text-3xl font-black text-white tracking-tight">\${s.title}</h2>
                <p class="text-sm font-bold text-cyan-300 uppercase tracking-widest">\${s.subtitle}</p>
              </div>

              <div class="grid grid-cols-2 gap-5">
                \${s.commitments.map((c, i) => \`
                  <div class="p-6 rounded-3xl bg-white/95 text-slate-900 shadow-2xl border border-white space-y-2">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 text-white font-black text-sm flex items-center justify-center shadow">
                        0\${i + 1}
                      </div>
                      <h3 class="text-base font-black text-[#001F54]">\${c.title}</h3>
                    </div>
                    <p class="text-xs text-slate-600 font-medium leading-relaxed pl-13">
                      \${c.desc}
                    </p>
                  </div>
                \`).join('')}
              </div>

              <div class="mt-6 p-4 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-blue-600/30 to-amber-500/20 border border-white/20 text-center backdrop-blur-md">
                <div class="text-xs font-black text-white uppercase tracking-wider">
                  VICONNECT TECHNOLOGY ĐỒNG HÀNH CÙNG HIỆP HỘI DOANH NGHIỆP TRẺ HÀ NỘI & CLB CEO 1983
                </div>
                <div class="text-[11px] text-cyan-200 mt-1">
                  Hotline hỗ trợ kỹ thuật: 0983.000.001 · Email: contact@viconnect.vn · Website: https://viconnect.vn
                </div>
              </div>
            </div>

            \${commonFooter}
          </div>
        \`;
      }
      // =========================================================================
      // DẠNG 6: CLOSING THANK YOU (SLIDE 15 - TRANG KẾT THÚC TRÁNG LỆ)
      // =========================================================================
      else if (s.type === 'closing_thankyou') {
        html = \`
          <div class="w-full h-full deep-navy-bg relative overflow-hidden flex flex-col justify-between">
            <div class="bg-blend-slide">
              <div class="bg-slide-l"></div>
              <div class="bg-slide-c"></div>
              <div class="bg-slide-r"></div>
              <div class="bg-slide-mask"></div>
            </div>
            \${commonHeader}

            <div class="stage-container my-auto max-w-6xl text-center space-y-6">
              
              <!-- Cụm Logo trung tâm trên bục phát quang -->
              <div class="flex items-center justify-center gap-8 pt-2">
                <div class="h-20 px-8 py-3 rounded-3xl bg-white/95 backdrop-blur-md flex items-center justify-center shadow-2xl border-2 border-white">
                  <img src="${LOGO_CEO1983}" class="h-14 w-auto object-contain" alt="Logo CEO 1983" />
                </div>
                <div class="h-12 w-[3px] bg-gradient-to-b from-cyan-400 via-amber-400 to-blue-500"></div>
                <div class="h-20 px-8 py-3 rounded-3xl bg-white/95 backdrop-blur-md flex items-center justify-center shadow-2xl border-2 border-white">
                  <img src="${LOGO_VICONNECT}" class="h-12 w-auto object-contain" alt="Logo ViConnect" />
                </div>
              </div>

              <!-- Tiêu đề cảm ơn lớn trang trọng -->
              <div class="space-y-2">
                <h1 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-cyan-300 tracking-tight drop-shadow-lg">
                  \${s.title}
                </h1>
                <p class="text-sm font-extrabold text-blue-200 tracking-wider max-w-3xl mx-auto uppercase">
                  \${s.subtitle}
                </p>
              </div>

              <!-- 4 Trụ cột cam kết chất lượng -->
              <div class="grid grid-cols-4 gap-4 pt-2">
                \${s.commitments.map((c, i) => \`
                  <div class="p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-left space-y-1.5 shadow-lg">
                    <div class="text-amber-400 font-mono font-black text-xs">0\${i + 1}. CAM KẾT</div>
                    <div class="text-xs font-black text-white">\${c.title}</div>
                    <p class="text-[11px] text-blue-100/90 leading-relaxed">\${c.desc}</p>
                  </div>
                \`).join('')}
              </div>

              <!-- Thông tin liên hệ & Cổng truy cập chính thức -->
              <div class="p-5 rounded-3xl bg-slate-900/80 border border-white/20 flex items-center justify-between text-xs text-white">
                <div class="text-left space-y-0.5">
                  <div class="font-bold text-amber-300">\${s.contact.company}</div>
                  <div class="text-slate-400 text-[11px]">Đối tác chuyển đổi số chiến lược của Hiệp hội Doanh nghiệp Trẻ Hà Nội</div>
                </div>
                <div class="flex items-center gap-6 font-mono text-[11px]">
                  <div>Hotline: <strong class="text-cyan-300">\${s.contact.hotline}</strong></div>
                  <div>Email: <strong class="text-cyan-300">\${s.contact.email}</strong></div>
                  <div>Portal: <strong class="text-amber-300">\${s.contact.webApp}</strong></div>
                </div>
              </div>

            </div>

            \${commonFooter}
          </div>
        \`;
      }

      container.innerHTML = html;
    }

    function nextSlide() {
      if (currentIdx < slides.length - 1) {
        currentIdx++;
        renderSlide(currentIdx);
      }
    }

    function prevSlide() {
      if (currentIdx > 0) {
        currentIdx--;
        renderSlide(currentIdx);
      }
    }

    // Phím điều khiển
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevSlide();
      }
    });

    // Render slide đầu tiên
    renderSlide(0);
  </script>

</body>
</html>`;
}

// =========================================================================
// HÀM TẠO HTML PHỤC VỤ XUẤT PDF PRINT 15 TRANG (16:9 NỞ RỘNG BỀ THẾ)
// =========================================================================
function generatePrintAllSlidesHtml() {
  let pagesHtml = '';

  for (let idx = 0; idx < SLIDES_V8.length; idx++) {
    const s = SLIDES_V8[idx];

    const commonHeader = `
      <header class="relative z-20 shrink-0 pt-7 pb-2 px-14">
        <div class="flex items-center justify-between pb-3">
          <div class="flex items-center gap-6">
            <div class="h-16 px-7 py-2.5 rounded-2xl bg-white/95 flex items-center justify-center shadow-2xl border-2 border-white">
              <img src="${LOGO_CEO1983}" class="h-11 w-auto object-contain" alt="Logo CEO 1983" />
            </div>
            <div class="h-9 w-[2.5px] bg-gradient-to-b from-cyan-400 via-blue-500 to-amber-400"></div>
            <div class="h-16 px-7 py-2.5 rounded-2xl bg-white/95 flex items-center justify-center shadow-2xl border-2 border-white">
              <img src="${LOGO_VICONNECT}" class="h-10 w-auto object-contain" alt="Logo ViConnect" />
            </div>
          </div>

          <div class="flex items-center gap-5">
            <span class="px-6 py-2.5 rounded-full bg-cyan-500/20 border-2 border-cyan-400/60 text-cyan-300 text-xs font-black uppercase tracking-wider shadow">
              ${s.tag}
            </span>
            <span class="font-mono text-sm font-black text-white bg-white/10 px-5 py-2.5 rounded-2xl border border-white/20">
              SLIDE ${s.id} / 15
            </span>
          </div>
        </div>

        <div class="w-full h-12 overflow-hidden relative mt-1">
          <svg viewBox="0 0 1440 52" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full block">
            <defs>
              <linearGradient id="pHWG1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#00d4ff" stop-opacity="0.95"/>
                <stop offset="35%" stop-color="#0055ff" stop-opacity="1"/>
                <stop offset="70%" stop-color="#00f5d4" stop-opacity="0.95"/>
                <stop offset="100%" stop-color="#ffb703" stop-opacity="0.95"/>
              </linearGradient>
            </defs>
            <path d="M0,20 C260,42 520,6 800,28 C1080,48 1280,12 1440,22" stroke="url(#pHWG1)" stroke-width="4" stroke-linecap="round" fill="none" />
          </svg>
        </div>
      </header>
    `;

    const commonFooter = `
      <footer class="relative z-20 w-full overflow-hidden shrink-0 mt-auto min-h-[115px] flex flex-col justify-end">
        <div class="absolute inset-0 pointer-events-none z-0">
          <svg viewBox="0 0 1440 140" preserveAspectRatio="none" class="w-full h-full block">
            <defs>
              <linearGradient id="pWL1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#010920" stop-opacity="0.98"/>
                <stop offset="50%" stop-color="#061d4a" stop-opacity="0.98"/>
                <stop offset="100%" stop-color="#000a1c" stop-opacity="0.98"/>
              </linearGradient>
              <linearGradient id="pWL2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.85"/>
                <stop offset="35%" stop-color="#0055ff" stop-opacity="0.9"/>
                <stop offset="100%" stop-color="#7209b7" stop-opacity="0.75"/>
              </linearGradient>
              <linearGradient id="pWL3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#031738" stop-opacity="0.95"/>
                <stop offset="50%" stop-color="#06285a" stop-opacity="0.92"/>
                <stop offset="100%" stop-color="#021028" stop-opacity="0.95"/>
              </linearGradient>
              <linearGradient id="pCrest" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#00f5d4" stop-opacity="0.95"/>
                <stop offset="35%" stop-color="#ffb703" stop-opacity="0.98"/>
                <stop offset="70%" stop-color="#00d4ff" stop-opacity="0.95"/>
                <stop offset="100%" stop-color="#ff006e" stop-opacity="0.9"/>
              </linearGradient>
            </defs>
            <path d="M0,75 C320,30 640,105 960,52 C1200,22 1350,68 1440,46 L1440,140 L0,140 Z" fill="url(#pWL1)" />
            <path d="M0,50 C260,95 540,32 820,78 C1100,115 1320,38 1440,55 L1440,140 L0,140 Z" fill="url(#pWL2)" opacity="0.42" />
            <path d="M0,28 C220,8 460,65 720,32 C980,2 1220,52 1440,22 L1440,140 L0,140 Z" fill="url(#pWL3)" opacity="0.85" />
            <path d="M0,28 C220,8 460,65 720,32 C980,2 1220,52 1440,22" stroke="url(#pCrest)" stroke-width="4" stroke-linecap="round" fill="none" />
          </svg>
        </div>

        <div class="relative z-10 px-14 py-5 flex items-center justify-between text-white">
          <div class="flex items-center gap-4 flex-1">
            <span class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2 border border-white/40 shrink-0">
              <span>★</span> ĐÚC KẾT CHIẾN LƯỢC
            </span>
            <span class="text-[14px] font-extrabold text-blue-50 drop-shadow-md leading-relaxed flex-1 px-5">
              ${s.summaryText}
            </span>
          </div>
          <div class="flex items-center gap-3 font-mono text-xs font-black text-cyan-300 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border border-cyan-400/50 shrink-0">
            <span>HANOIBA · CEO 1983</span>
          </div>
        </div>
      </footer>
    `;

    let slideBody = '';

    if (s.type === 'dual_overview') {
      slideBody = `
        <div class="slide-page-print deep-navy-bg justify-between">
          <div class="bg-blend-slide">
            <div class="bg-slide-l"></div>
            <div class="bg-slide-c"></div>
            <div class="bg-slide-r"></div>
            <div class="bg-slide-mask"></div>
          </div>
          ${commonHeader}
          <div class="stage-container my-auto">
            <div class="grid grid-cols-12 gap-8 items-center">
              <div class="col-span-6 flex flex-col items-center">
                <div class="px-5 py-2 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-wider mb-2.5 shadow-lg flex items-center gap-2">
                  <span>💻</span> CỔNG ĐIỀU HÀNH TRUNG TÂM WEB CRM
                </div>
                <div class="w-full bg-[#1b2539] p-3.5 rounded-3xl border-2 border-cyan-400/40 shadow-2xl">
                  <div class="rounded-2xl overflow-hidden aspect-video border border-black bg-black">
                    <img src="${CRM_02}" class="w-full h-full object-cover object-top" alt="CRM Web" />
                  </div>
                </div>
                <div class="mt-2 text-center text-xs font-black text-cyan-300">
                  Dashboard BI · Quản Lý 500+ Hội Viên · Sơ Đồ Bàn Tiệc · Thu Phí VietQR
                </div>
              </div>

              <div class="col-span-1 flex flex-col items-center justify-center">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-xl">
                  ⇄
                </div>
                <div class="text-[10px] font-mono text-cyan-300 font-bold uppercase mt-2 text-center">
                  REAL-TIME SYNC
                </div>
              </div>

              <div class="col-span-5 flex flex-col items-center">
                <div class="px-5 py-2 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider mb-2.5 shadow-lg flex items-center gap-2">
                  <span>📱</span> VĂN PHÒNG DOANH NHÂN BỎ TÚI MOBILE APP
                </div>
                <div class="flex items-center gap-5 justify-center w-full">
                  <div class="w-48 phone-mockup-v8">
                    <div class="phone-inner-v8 aspect-[9/18]">
                      <div class="phone-notch-v8"><div class="phone-camera-v8"></div></div>
                      <img src="${APP_01}" class="w-full h-full object-cover object-top" alt="App Trang Chu" />
                    </div>
                    <div class="text-center text-[10px] font-extrabold text-white mt-2">1. Trang Chủ Doanh Nhân</div>
                  </div>
                  <div class="w-48 phone-mockup-v8">
                    <div class="phone-inner-v8 aspect-[9/18]">
                      <div class="phone-notch-v8"><div class="phone-camera-v8"></div></div>
                      <img src="${APP_02}" class="w-full h-full object-cover object-top" alt="App The Hoi Vien" />
                    </div>
                    <div class="text-center text-[10px] font-extrabold text-amber-300 mt-2">2. Thẻ Hội Viên Số VIP</div>
                  </div>
                </div>
                <div class="mt-2 text-center text-xs font-black text-amber-400">
                  Định Danh Số 1 Chạm · Sàn Giao Thương B2B · Vé Sự Kiện 1 Giây
                </div>
              </div>
            </div>

            <div class="mt-5 grid grid-cols-4 gap-4">
              ${s.kpis.map(k => `
                <div class="p-3.5 rounded-2xl bg-white/10 border border-white/20 flex items-center gap-3.5 shadow-lg">
                  <span class="text-2xl">${k.icon}</span>
                  <div>
                    <div class="text-lg font-black text-cyan-300 font-mono leading-none">${k.num}</div>
                    <div class="text-[11px] font-bold text-white/90 uppercase mt-0.5">${k.label}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          ${commonFooter}
        </div>
      `;
    } else if (s.type === 'two_products_detail') {
      slideBody = `
        <div class="slide-page-print deep-navy-bg justify-between">
          <img src="${BG_BOARDROOM}" class="absolute inset-0 w-full h-full object-cover opacity-20" alt="Boardroom" />
          ${commonHeader}
          <div class="stage-container my-auto">
            <div class="grid grid-cols-2 gap-8 items-stretch">
              <div class="bg-white/95 rounded-3xl p-8 text-slate-900 shadow-2xl border border-white flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span class="px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase">TRUNG TÂM ĐIỀU HÀNH</span>
                    <span class="text-xs font-mono font-bold text-slate-500">DESKTOP WEB</span>
                  </div>
                  <h2 class="text-2xl font-black text-[#001F54] mt-3">${s.crm.title}</h2>
                  <p class="text-xs font-extrabold text-blue-700 uppercase mt-1">${s.crm.target}</p>
                  <ul class="mt-4 space-y-2.5 text-xs text-slate-700 font-medium">
                    ${s.crm.bullets.map(b => `
                      <li class="flex items-start gap-2.5">
                        <span class="text-blue-600 font-black text-sm shrink-0">✔</span>
                        <span>${b}</span>
                      </li>
                    `).join('')}
                  </ul>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span class="px-3 py-1 rounded-lg bg-blue-50 text-blue-800 text-[11px] font-black">11 CẤP PHÂN QUYỀN RBAC</span>
                  <span class="text-blue-600 font-mono font-black">https://crm.ceo1983.viconnect.vn</span>
                </div>
              </div>

              <div class="bg-white/95 rounded-3xl p-8 text-slate-900 shadow-2xl border border-white flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span class="px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase">DOANH NHÂN BỎ TÚI</span>
                    <span class="text-xs font-mono font-bold text-slate-500">MOBILE APP</span>
                  </div>
                  <h2 class="text-2xl font-black text-[#001F54] mt-3">${s.app.title}</h2>
                  <p class="text-xs font-extrabold text-amber-700 uppercase mt-1">${s.app.target}</p>
                  <ul class="mt-4 space-y-2.5 text-xs text-slate-700 font-medium">
                    ${s.app.bullets.map(b => `
                      <li class="flex items-start gap-2.5">
                        <span class="text-amber-600 font-black text-sm shrink-0">✔</span>
                        <span>${b}</span>
                      </li>
                    `).join('')}
                  </ul>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span class="px-3 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-black">ĐỒNG BỘ REAL-TIME SOCKET.IO</span>
                  <span class="text-amber-600 font-mono font-black">https://ceo1983.viconnect.vn</span>
                </div>
              </div>
            </div>
          </div>
          ${commonFooter}
        </div>
      `;
    } else if (s.type === 'crm_feature') {
      slideBody = `
        <div class="slide-page-print deep-navy-bg justify-between">
          <img src="${BG_SMARTCITY}" class="absolute inset-0 w-full h-full object-cover opacity-15" alt="SmartCity" />
          ${commonHeader}
          <div class="stage-container my-auto">
            <div class="grid grid-cols-12 gap-8 items-center">
              <div class="col-span-5 bg-white/95 rounded-3xl p-7 text-slate-900 shadow-2xl border border-white space-y-4">
                <div>
                  <h2 class="text-2xl font-black text-[#001F54] leading-snug">${s.title}</h2>
                  <p class="text-xs font-bold text-cyan-800 uppercase tracking-wide mt-1">${s.subtitle}</p>
                </div>
                <div class="space-y-3 pt-1">
                  ${s.points.map((p, i) => `
                    <div class="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div class="w-7 h-7 rounded-xl bg-[#001F54] text-white flex items-center justify-center font-black text-xs shrink-0">0${i + 1}</div>
                      <div class="text-xs font-medium text-slate-700 leading-relaxed">${p}</div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="col-span-7 flex flex-col gap-4">
                <div class="bg-[#1b2539]/95 p-3.5 rounded-3xl border-2 border-cyan-400/40 shadow-2xl">
                  <div class="flex items-center justify-between text-[11px] text-cyan-300 font-extrabold pb-2 px-1">
                    <span>GIAO DIỆN TRỰC QUAN TRÊN WEB CRM</span>
                    <span class="font-mono text-xs text-amber-300">LIVE PRODUCTION</span>
                  </div>
                  <div class="rounded-2xl overflow-hidden aspect-[16/8.8] border border-black bg-black">
                    <img src="${s.crmImg}" class="w-full h-full object-cover object-top" alt="CRM Live Interface" />
                  </div>
                </div>
                <div class="flex items-center justify-between bg-white/10 px-5 py-3 rounded-2xl border border-white/20 text-xs text-blue-100">
                  <span class="font-bold flex items-center gap-2"><span class="text-amber-400">★</span> Dữ liệu được bảo mật đa tầng và kiểm soát truy cập phân quyền nghiêm ngặt</span>
                  <span class="font-mono text-cyan-300 font-bold">CEO 1983 Platform</span>
                </div>
              </div>
            </div>
          </div>
          ${commonFooter}
        </div>
      `;
    } else if (s.type === 'app_feature') {
      slideBody = `
        <div class="slide-page-print deep-navy-bg justify-between">
          <img src="${BG_SKYLINE_NIGHT}" class="absolute inset-0 w-full h-full object-cover opacity-20" alt="Skyline" />
          ${commonHeader}
          <div class="stage-container my-auto">
            <div class="grid grid-cols-12 gap-8 items-center">
              <div class="col-span-6 bg-white/95 rounded-3xl p-8 text-slate-900 shadow-2xl border border-white space-y-4">
                <div>
                  <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase mb-1">
                    <span>📱</span> VĂN PHÒNG DOANH NHÂN BỎ TÚI
                  </div>
                  <h2 class="text-2xl font-black text-[#001F54] leading-snug">${s.title}</h2>
                  <p class="text-xs font-bold text-amber-700 uppercase tracking-wide mt-1">${s.subtitle}</p>
                </div>
                <div class="space-y-3 pt-1">
                  ${s.points.map((p, i) => `
                    <div class="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div class="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center font-black text-xs shrink-0">0${i + 1}</div>
                      <div class="text-xs font-medium text-slate-700 leading-relaxed">${p}</div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="col-span-3 flex justify-center">
                <div class="w-64 phone-mockup-v8">
                  <div class="flex items-center justify-between text-[11px] text-cyan-300 font-extrabold pb-1.5 px-2">
                    <span class="truncate">${s.mainLabel}</span>
                    <span class="font-mono text-amber-300">LIVE</span>
                  </div>
                  <div class="phone-inner-v8 aspect-[9/18]">
                    <div class="phone-notch-v8"><div class="phone-camera-v8"></div></div>
                    <img src="${s.appImgMain}" class="w-full h-full object-cover object-top" alt="App Main Screenshot" />
                  </div>
                </div>
              </div>

              <div class="col-span-3 flex flex-col justify-between h-[540px] gap-3.5">
                <div class="p-4 rounded-3xl bg-white/10 border border-white/20 text-white space-y-1.5 shadow-xl flex-1 flex flex-col justify-center">
                  <div class="flex items-center gap-2 text-cyan-300 font-black text-xs"><span>⚡</span> TỐC ĐỘ REAL-TIME < 1 GIÂY</div>
                  <p class="text-xs text-blue-100 leading-relaxed">Tất cả thao tác quét QR, nhận thông báo đẩy và gạch nợ hội phí đều tức thời qua Socket.IO.</p>
                </div>
                <div class="p-4 rounded-3xl bg-amber-500/10 border border-amber-400/30 text-white space-y-1.5 shadow-xl flex-1 flex flex-col justify-center">
                  <div class="flex items-center gap-2 text-amber-300 font-black text-xs"><span>🛡️</span> BẢO MẬT & QUYỀN RIÊNG TƯ</div>
                  <p class="text-xs text-amber-100 leading-relaxed">Mã hóa SSL/TLS đa tầng, doanh nhân toàn quyền ẩn/hiện thông tin liên hệ và danh thiếp cá nhân.</p>
                </div>
                <div class="p-4 rounded-3xl bg-blue-500/10 border border-cyan-400/30 text-white space-y-1.5 shadow-xl flex-1 flex flex-col justify-center">
                  <div class="flex items-center gap-2 text-cyan-300 font-black text-xs"><span>🔄</span> ĐỒNG BỘ 100% WEB CRM</div>
                  <p class="text-xs text-blue-100 leading-relaxed">Dữ liệu hội viên, sự kiện và giao thương luân chuyển thông suốt hai chiều với Ban Thư Ký.</p>
                </div>
              </div>
            </div>
          </div>
          ${commonFooter}
        </div>
      `;
    } else if (s.type === 'conclusion') {
      slideBody = `
        <div class="slide-page-print deep-navy-bg justify-between">
          <div class="bg-blend-slide">
            <div class="bg-slide-l"></div>
            <div class="bg-slide-c"></div>
            <div class="bg-slide-r"></div>
            <div class="bg-slide-mask"></div>
          </div>
          ${commonHeader}
          <div class="stage-container my-auto max-w-6xl">
            <div class="text-center space-y-2 mb-6">
              <h2 class="text-3xl font-black text-white tracking-tight">${s.title}</h2>
              <p class="text-sm font-bold text-cyan-300 uppercase tracking-widest">${s.subtitle}</p>
            </div>
            <div class="grid grid-cols-2 gap-5">
              ${s.commitments.map((c, i) => `
                <div class="p-6 rounded-3xl bg-white/95 text-slate-900 shadow-2xl border border-white space-y-2">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 text-white font-black text-sm flex items-center justify-center shadow">0${i + 1}</div>
                    <h3 class="text-base font-black text-[#001F54]">${c.title}</h3>
                  </div>
                  <p class="text-xs text-slate-600 font-medium leading-relaxed pl-13">${c.desc}</p>
                </div>
              `).join('')}
            </div>
            <div class="mt-6 p-4 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-blue-600/30 to-amber-500/20 border border-white/20 text-center">
              <div class="text-xs font-black text-white uppercase tracking-wider">VICONNECT TECHNOLOGY ĐỒNG HÀNH CÙNG HIỆP HỘI DOANH NGHIỆP TRẺ HÀ NỘI & CLB CEO 1983</div>
              <div class="text-[11px] text-cyan-200 mt-1">Hotline hỗ trợ kỹ thuật: 0983.000.001 · Email: contact@viconnect.vn · Website: https://viconnect.vn</div>
            </div>
          </div>
          ${commonFooter}
        </div>
      `;
    } else if (s.type === 'closing_thankyou') {
      slideBody = `
        <div class="slide-page-print deep-navy-bg justify-between">
          <div class="bg-blend-slide">
            <div class="bg-slide-l"></div>
            <div class="bg-slide-c"></div>
            <div class="bg-slide-r"></div>
            <div class="bg-slide-mask"></div>
          </div>
          ${commonHeader}
          <div class="stage-container my-auto max-w-6xl text-center space-y-6">
            <div class="flex items-center justify-center gap-8 pt-2">
              <div class="h-20 px-8 py-3 rounded-3xl bg-white/95 flex items-center justify-center shadow-2xl border-2 border-white">
                <img src="${LOGO_CEO1983}" class="h-14 w-auto object-contain" alt="Logo CEO 1983" />
              </div>
              <div class="h-12 w-[3px] bg-gradient-to-b from-cyan-400 via-amber-400 to-blue-500"></div>
              <div class="h-20 px-8 py-3 rounded-3xl bg-white/95 flex items-center justify-center shadow-2xl border-2 border-white">
                <img src="${LOGO_VICONNECT}" class="h-12 w-auto object-contain" alt="Logo ViConnect" />
              </div>
            </div>

            <div class="space-y-2">
              <h1 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-cyan-300 tracking-tight drop-shadow-lg">
                ${s.title}
              </h1>
              <p class="text-sm font-extrabold text-blue-200 tracking-wider max-w-3xl mx-auto uppercase">
                ${s.subtitle}
              </p>
            </div>

            <div class="grid grid-cols-4 gap-4 pt-2">
              ${s.commitments.map((c, i) => `
                <div class="p-5 rounded-3xl bg-white/10 border border-white/20 text-left space-y-1.5 shadow-lg">
                  <div class="text-amber-400 font-mono font-black text-xs">0${i + 1}. CAM KẾT</div>
                  <div class="text-xs font-black text-white">${c.title}</div>
                  <p class="text-[11px] text-blue-100/90 leading-relaxed">${c.desc}</p>
                </div>
              `).join('')}
            </div>

            <div class="p-5 rounded-3xl bg-slate-900/80 border border-white/20 flex items-center justify-between text-xs text-white">
              <div class="text-left space-y-0.5">
                <div class="font-bold text-amber-300">${s.contact.company}</div>
                <div class="text-slate-400 text-[11px]">Đối tác chuyển đổi số chiến lược của Hiệp hội Doanh nghiệp Trẻ Hà Nội</div>
              </div>
              <div class="flex items-center gap-6 font-mono text-[11px]">
                <div>Hotline: <strong class="text-cyan-300">${s.contact.hotline}</strong></div>
                <div>Email: <strong class="text-cyan-300">${s.contact.email}</strong></div>
                <div>Portal: <strong class="text-amber-300">${s.contact.webApp}</strong></div>
              </div>
            </div>
          </div>
          ${commonFooter}
        </div>
      `;
    }

    pagesHtml += slideBody;
  }

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>SLIDES PRINT V8.5</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      margin: 0;
      padding: 0;
      background: #000;
      color: #fff;
    }
    .deep-navy-bg {
      background: radial-gradient(120% 90% at 50% 20%, #082463 0%, #031138 40%, #01081f 75%, #00040f 100%);
    }
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
      opacity: 0.60;
    }
    .bg-slide-c {
      position: absolute;
      inset: 0;
      background-image: url('${BG_OPERATIONS}');
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
      background-image: url('${BG_BANQUET_GALA}');
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
    }
    .phone-mockup-v8 {
      position: relative;
      border-radius: 46px;
      padding: 10px;
      background: linear-gradient(145deg, #2b3952, #0d1527);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8),
                  0 0 35px rgba(0, 212, 255, 0.35),
                  inset 0 1px 2px rgba(255, 255, 255, 0.3);
      border: 3.5px solid #3b4e6d;
    }
    .phone-inner-v8 {
      position: relative;
      border-radius: 36px;
      overflow: hidden;
      background: #000;
      border: 1px solid #1e293b;
    }
    .phone-notch-v8 {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 88px;
      height: 22px;
      background: #000;
      border-radius: 20px;
      z-index: 30;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .phone-camera-v8 {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #141b2d;
      border: 1.5px solid #2a3754;
    }
    .stage-container {
      max-width: 1720px;
      width: 100%;
      margin: auto;
      padding: 1.5rem 2.2rem;
      background: rgba(3, 14, 38, 0.62);
      backdrop-filter: blur(18px);
      border: 1.5px solid rgba(255, 255, 255, 0.16);
      border-radius: 36px;
    }
    @page {
      size: 16in 9in;
      margin: 0;
    }
    .slide-page-print {
      width: 16in !important;
      height: 9in !important;
      page-break-after: always !important;
      page-break-inside: avoid !important;
      position: relative !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;
}

// =========================================================================
// HÀM XUẤT POWERPOINT 16:9 CHUẨN ĐỒNG BỘ 15 SLIDES
// =========================================================================
async function generateSlidePptx() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'ViConnect Technology';
  pptx.company = 'CLB Doanh Nhân CEO 1983 (HanoiBA)';
  pptx.title = 'Hệ Sinh Thái Số Toàn Diện CEO 1983';

  for (const s of SLIDES_V8) {
    const slide = pptx.addSlide();
    slide.background = { color: '020B1F' };

    // Header Tag
    slide.addText(`[ ${s.tag} ]`, {
      x: 0.8,
      y: 0.4,
      w: 8.0,
      h: 0.35,
      fontSize: 10,
      color: '00D4FF',
      bold: true,
      fontFace: 'Arial'
    });

    // Số trang Slide
    slide.addText(`SLIDE ${s.id} / 15`, {
      x: 10.5,
      y: 0.4,
      w: 2.0,
      h: 0.35,
      fontSize: 10,
      color: 'FFB703',
      bold: true,
      align: 'right',
      fontFace: 'Arial'
    });

    // Tiêu đề Slide
    slide.addText(s.title, {
      x: 0.8,
      y: 0.75,
      w: 11.5,
      h: 0.6,
      fontSize: 20,
      color: 'FFFFFF',
      bold: true,
      fontFace: 'Arial'
    });

    // Phụ đề
    slide.addText(s.subtitle, {
      x: 0.8,
      y: 1.35,
      w: 11.5,
      h: 0.45,
      fontSize: 11,
      color: '94A3B8',
      fontFace: 'Arial'
    });

    // Nội dung theo type
    if (s.type === 'dual_overview') {
      slide.addText('1. CỔNG ĐIỀU HÀNH WEB CRM\n• Quản trị 500+ hội viên 360°\n• Dashboard BI & Thống kê Bar+Line\n• Xếp bàn tiệc Gala tự động\n• Thu hội phí tự động VietQR', {
        x: 0.8,
        y: 2.2,
        w: 5.5,
        h: 3.5,
        fontSize: 13,
        color: 'E2E8F0',
        fill: { color: '0A1938' },
        line: { color: '00D4FF', width: 1 },
        rectRadius: 0.2,
        margin: 0.3
      });

      slide.addText('2. VĂN PHÒNG DOANH NHÂN MOBILE APP\n• Thẻ hội viên số nhận diện Doanh nhân VIP\n• Danh thiếp số 1 chạm kết nối\n• Sàn giao thương B2B nội khối\n• Vé sự kiện Gala & Check-in QR 1 giây', {
        x: 6.8,
        y: 2.2,
        w: 5.5,
        h: 3.5,
        fontSize: 13,
        color: 'E2E8F0',
        fill: { color: '0A1938' },
        line: { color: 'FFB703', width: 1 },
        rectRadius: 0.2,
        margin: 0.3
      });
    } else if (s.type === 'two_products_detail') {
      slide.addText(`CỔNG WEB CRM QUẢN TRỊ\n\n${s.crm.bullets.map(b => '✔ ' + b).join('\n')}`, {
        x: 0.8,
        y: 2.0,
        w: 5.5,
        h: 4.2,
        fontSize: 12,
        color: '0F172A',
        fill: { color: 'FFFFFF' },
        rectRadius: 0.2,
        margin: 0.3
      });

      slide.addText(`VĂN PHÒNG SỐ MOBILE APP\n\n${s.app.bullets.map(b => '✔ ' + b).join('\n')}`, {
        x: 6.8,
        y: 2.0,
        w: 5.5,
        h: 4.2,
        fontSize: 12,
        color: '0F172A',
        fill: { color: 'FFFFFF' },
        rectRadius: 0.2,
        margin: 0.3
      });
    } else if (s.type === 'crm_feature' || s.type === 'app_feature') {
      slide.addText(s.points.map((p, i) => `0${i + 1}. ${p}`).join('\n\n'), {
        x: 0.8,
        y: 2.0,
        w: 6.0,
        h: 4.2,
        fontSize: 12,
        color: '0F172A',
        fill: { color: 'FFFFFF' },
        rectRadius: 0.2,
        margin: 0.3
      });

      slide.addText(`[HÌNH ẢNH GIAO DIỆN THỰC TẾ]\n\nPhân hệ: ${s.title}\nTruy cập hệ thống: https://ceo1983.viconnect.vn`, {
        x: 7.2,
        y: 2.0,
        w: 5.2,
        h: 4.2,
        fontSize: 13,
        color: '00D4FF',
        fill: { color: '0A1938' },
        line: { color: '00D4FF', width: 1 },
        rectRadius: 0.2,
        margin: 0.3,
        align: 'center'
      });
    } else if (s.type === 'conclusion' || s.type === 'closing_thankyou') {
      slide.addText(s.commitments.map((c, i) => `0${i + 1}. ${c.title}\n   ${c.desc}`).join('\n\n'), {
        x: 1.5,
        y: 2.0,
        w: 10.3,
        h: 4.2,
        fontSize: 13,
        color: '0F172A',
        fill: { color: 'FFFFFF' },
        rectRadius: 0.2,
        margin: 0.4
      });
    }

    // Wave Footer text
    slide.addText(`💡 ĐÚC KẾT CHIẾN LƯỢC: ${s.summaryText} | VICONNECT · CEO 1983`, {
      x: 0.8,
      y: 6.7,
      w: 11.5,
      h: 0.5,
      fontSize: 10,
      color: '00D4FF',
      fontFace: 'Arial'
    });
  }

  const pptxPath = path.join(DOC_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pptx');
  await pptx.writeFile({ fileName: pptxPath });
  console.log(`✓ Đã xuất PowerPoint: ${pptxPath}`);
}

// =========================================================================
// HÀM CHÍNH THỰC THI TOÀN BỘ TIẾN TRÌNH V8.5
// =========================================================================
(async () => {
  console.log('>>> BẮT ĐẦU TIẾN TRÌNH XUẤT BẢN MASTER SLIDE V8.5 MONUMENTAL WAVE...');

  // 1. Tạo file HTML trình chiếu Interactive
  const slideDeckHtml = generateSlideDeckHtml();
  const slideHtmlPath = path.join(DOC_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.html');
  fs.writeFileSync(slideHtmlPath, slideDeckHtml, 'utf8');
  console.log(`✓ Đã xuất Slide HTML: ${slideHtmlPath}`);

  // 2. Tạo file HTML in ấn PDF
  const printHtml = generatePrintAllSlidesHtml();
  const tempPrintPath = path.join(DOC_DIR, 'temp_print_v8.html');
  fs.writeFileSync(tempPrintPath, printHtml, 'utf8');

  // 3. Khởi động Playwright Edge xuất PDF Vector 16:9
  console.log('>>> Khởi động Playwright Edge render PDF 15 trang 16:9...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2
  });

  await page.goto(`file://${tempPrintPath}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const pdfPath = path.join(DOC_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pdf');
  await page.pdf({
    path: pdfPath,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    pageRanges: '1-15'
  });
  console.log(`✓ Đã xuất PDF Vector: ${pdfPath}`);

  // Xóa file in ấn tạm
  if (fs.existsSync(tempPrintPath)) {
    fs.unlinkSync(tempPrintPath);
  }

  await browser.close();

  // 4. Xuất file PowerPoint .pptx
  await generateSlidePptx();

  // 5. Đồng bộ sang thư mục public docs của FE
  if (fs.existsSync(FE_DOCS_DIR)) {
    fs.copyFileSync(slideHtmlPath, path.join(FE_DOCS_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.html'));
    fs.copyFileSync(pdfPath, path.join(FE_DOCS_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pdf'));
    const pptxPath = path.join(DOC_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pptx');
    if (fs.existsSync(pptxPath)) {
      fs.copyFileSync(pptxPath, path.join(FE_DOCS_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pptx'));
    }
    console.log(`✓ Đã đồng bộ sang ${FE_DOCS_DIR}`);
  }

  console.log('=========================================================================');
  console.log('🎉 XUẤT BẢN THÀNH CÔNG BỘ SLIDE V8.5 MONUMENTAL WAVE (15 SLIDES HOÀN HẢO)!');
  console.log('=========================================================================');
})();
