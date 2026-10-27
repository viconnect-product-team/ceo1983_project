/**
 * BUILD_MASTER_PRESENTATION_POSTER_PROFILE.JS
 * 
 * 1. Hoàn thiện bộ SLIDE_TONG_THE_HE_SINH_THAI_CEO1983:
 *    - Bỏ toàn bộ chữ vàng ở footer bên phải (như viconnectPartner, v.v.)
 *    - Bỏ text "doanh nghiệp ViConnect" / "Tập đoàn Công nghệ ViConnect", thay bằng "Đơn vị..." / "Đơn vị phát triển hệ thống"
 *    - Bổ sung 2 slide chuyên sâu về:
 *      + Phân hệ Thống kê & Báo cáo BI toàn cảnh (Analytics BI, thu chi, điểm danh sự kiện, B2B)
 *      + Phân hệ Chương trình Đào tạo Doanh nhân & Kho tri thức số
 *    - Sử dụng toàn bộ ảnh chụp giao diện mới nhất từ domain live https://crm.ceo1983.viconnect.vn & https://ceo1983.viconnect.vn
 *    - Xuất: HTML (trình chiếu & print mode), PDF (Playwright 16:9), PPTX (pptxgenjs), Markdown (.md)
 * 
 * 2. Tạo POSTER_APP_CEO1983_3D:
 *    - Thể hiện 3 màn chính chứa 3 chức năng quan trọng nhất của App CEO1983:
 *      (1) Thẻ Hội Viên VIP & Danh Thiếp Số 1 Chạm
 *      (2) Sàn Giao Thương B2B & Deal Đặc Quyền Nội Khối
 *      (3) Ví Vé Sự Kiện & Điểm Danh Gala / Sơ Đồ Bàn Tiệc
 *    - Hiệu ứng 3D isometric mockups, nền chìm mờ, gradient xanh cobalt/navy, ánh sáng phát quang cyan
 *    - Màu sắc chuẩn CEO 1983: Xanh trắng nhiều, vàng kim ít (chỉ accent VIP), text đen/slate tương phản cao
 *    - Xuất: HTML, PDF, PNG
 * 
 * 3. Tạo PROFILE_CRM_QUAN_TRI_CEO1983:
 *    - Thể hiện 6 chức năng chính nổi bật nhất của hệ thống Web CRM:
 *      (1) Trung Tâm Điều Hành & Thống Kê BI Toàn Cảnh
 *      (2) Quản Trị Hồ Sơ Hội Viên 360° & Phân Quyền RBAC 6 Ban
 *      (3) Quản Lý Sự Kiện Gala & Sơ Đồ Bàn Tiệc Thông Minh
 *      (4) Quản Trị Tài Chính, Thu Chi & Thu Hội Phí VietQR
 *      (5) Quản Lý Chương Trình Đào Tạo Doanh Nhân & Kho Tri Thức Số
 *      (6) Quản Lý Giao Việc Kanban & Điều Hành 6 Ban Chuyên Môn
 *    - Thiết kế 3D profile cao cấp, gradient xanh, nền chìm mờ, trắng nhiều, vàng ít, text đen rõ nét
 *    - Xuất: HTML, PDF, PNG
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const pptxgen = require('pptxgenjs');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_DIR = path.join(ROOT_DIR, 'document');
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps/ceo1983_app_fe/public/docs');
const LIVE_IMG_DIR = path.join(DOC_DIR, 'images/live_captures_fresh');

[DOC_DIR, FE_DOCS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Helper đọc base64 an toàn
function getBase64Image(filePath) {
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'svg' ? 'image/svg+xml' : 'image/png';
    const data = fs.readFileSync(filePath).toString('base64');
    return `data:${mime};base64,${data}`;
  }
  return '';
}

// =========================================================================
// [PHẦN 1] BỘ SLIDE TỔNG THỂ HỆ SINH THÁI CEO 1983 (10 SLIDES CHUẨN MỰC)
// =========================================================================

const SLIDES_MASTER = [
  {
    id: 1,
    bgImage: 'images/backgrounds/01_skyline_lake.jpg',
    type: 'cover',
    tag: 'BÁO CÁO GIẢI PHÁP CHUYỂN ĐỔI SỐ TOÀN DIỆN',
    title: 'HỆ THỐNG ĐIỀU HÀNH & KẾT NỐI DOANH NHÂN CEO 1983',
    subtitle: 'HIỆN THỰC HÓA 3 BÀI TOÁN CHIẾN LƯỢC VÌ SỰ PHÁT TRIỂN BỀN VỮNG CỦA HỘI VIÊN',
    description: 'Báo cáo toàn diện giải pháp chuyển đổi số gồm Hệ Thống Quản Trị Web CRM & Ứng Dụng Di Động Doanh Nhân do Đơn vị công nghệ nghiên cứu và phát triển theo đặt hàng từ Ban Lãnh Đạo CLB CEO 1983.',
    meetingInfo: {
      time: '09:00 – 12:00 | Thứ Tư, ngày 21/10/2026',
      location: 'Khu biệt thự HDI, 39 ngõ 29 P. Mạc Thái Tông, KĐT Nam Trung Yên, Cầu Giấy, Hà Nội',
      content: 'Báo Cáo Nghiệm Thu Thử Nghiệm & Tiếp Thu Góp Ý Hoàn Thiện',
      lunch: 'Bữa trưa thân mật tại Nhà hàng Phiến Hoan Việt Trì',
    },
    footerText: 'Rất hân hạnh được đồng hành cùng Quý Lãnh Đạo & Hội Viên CLB CEO 1983.',
  },
  {
    id: 2,
    bgImage: 'images/backgrounds/02_boardroom.jpg',
    type: 'two_products',
    tag: 'BỨC TRANH TỔNG THỂ 2 SẢN PHẨM',
    title: 'KIẾN TRÚC KÉP: WEB CRM ĐIỀU HÀNH & MOBILE APP HỘI VIÊN',
    subtitle: 'Hai công cụ tương hỗ khép kín: Trung tâm điều hành minh bạch & Văn phòng số bỏ túi của từng doanh nhân',
    crm: {
      title: '1. CỔNG ĐIỀU HÀNH TRUNG TÂM WEB CRM',
      target: 'Dành cho: Ban Điều Hành, Ban Thư Ký, Chủ Tịch & 6 Ban Chuyên Môn',
      bullets: [
        'Quản lý tập trung toàn diện hơn 500 hồ sơ doanh nghiệp hội viên chính danh',
        'Sơ đồ xếp bàn tiệc Gala trang trọng, phân bổ chỗ ngồi khoa học, chính xác',
        'Điều hành công việc, phân công nhiệm vụ và theo dõi tiến độ các ban',
        'Quản lý thu chi, hội phí và ngân sách tự động hóa, minh bạch tài chính',
        'Phân quyền vận hành đúng chức năng thẩm quyền của từng ban chuyên môn',
      ],
    },
    app: {
      title: '2. VĂN PHÒNG DOANH NHÂN BỎ TÚI MOBILE APP',
      target: 'Dành cho: Hơn 500 Doanh nhân & Lãnh đạo hội viên CLB CEO 1983',
      bullets: [
        'Thẻ Hội Viên Điện Tử Thông Minh & Danh thiếp số tiện lợi, lưu danh bạ 1 chạm',
        'Sàn giao thương B2B nội khối: Giới thiệu sản phẩm và ưu đãi đặc quyền giữa các hội viên',
        'Ví vé sự kiện Gala, xem trước số bàn tiệc, số ghế VIP và mã bốc thăm may mắn',
        'Danh bạ kết nối hơn 500 CEO chính danh 11 ngành nghề, gửi lời mời hẹn gặp 1-on-1',
        'Kênh trao đổi công việc và liên lạc trực tiếp, bảo mật riêng tư giữa các lãnh đạo',
      ],
    },
    footerHighlight: '✦ Dữ liệu đồng bộ tức thì: Mọi giao dịch và thông tin kết nối từ Mobile App cập nhật về Trung tâm điều hành tức thời.',
  },
  {
    id: 3,
    bgImage: 'images/backgrounds/03_smartcity.jpg',
    type: 'three_requirements',
    tag: 'HIỆN THỰC HÓA 3 BÀI TOÁN CHIẾN LƯỢC',
    title: 'GIẢI PHÁP SỐ HÓA TRIỆT ĐỂ CHO 3 TRĂN TRỞ CỦA BAN LÃNH ĐẠO',
    subtitle: 'Đơn vị phát triển lắng nghe và chuyển hóa trọn vẹn mọi yêu cầu của Ban Chủ Nhiệm thành công cụ điều hành thực tế',
    cols: [
      {
        num: '01',
        badge: 'BÀI TOÁN 1: QUẢN LÝ THÀNH VIÊN',
        title: 'Quản Lý Tập Trung Hồ Sơ 500+ Hội Viên',
        problem: 'Trước đây: Dữ liệu phân tán trong các file bảng tính rời rạc, khó tra cứu, thông tin doanh nghiệp không được cập nhật kịp thời.',
        solution: 'Hệ thống giải quyết: Số hóa hồ sơ doanh nghiệp 360 độ gồm pháp lý, mã số thuế, năng lực cốt lõi, ngành nghề mũi nhọn và lịch sử tham gia.',
      },
      {
        num: '02',
        badge: 'BÀI TOÁN 2: TỔ CHỨC SỰ KIỆN GALA',
        title: 'Tiếp Đón Khách Mời & Xếp Chỗ Khoa Học',
        problem: 'Trước đây: Khách đến đông dễ nhầm bàn ghế, lễ tân tìm tên thủ công mất nhiều thời gian, dễ gây ùn tắc tại sảnh đón tiếp.',
        solution: 'Hệ thống giải quyết: Sơ đồ bàn tiệc bố trí chuẩn xác, đón tiếp khách mời bằng vé điện tử trên điện thoại chỉ 1 giây, bốc thăm may mắn công khai.',
      },
      {
        num: '03',
        badge: 'BÀI TOÁN 3: XÚC TIẾN THƯƠNG MẠI',
        title: 'Thúc Đẩy Giao Thương & Hợp Tác B2B',
        problem: 'Trước đây: Giao lưu phong trào chủ yếu qua các buổi gặp trực tiếp, thiếu công cụ theo dõi nhu cầu mua sắm và hợp tác thường xuyên.',
        solution: 'Hệ thống giải quyết: Sàn B2B nội bộ niêm yết sản phẩm chiết khấu cao, danh thiếp số 1 chạm lưu danh bạ, hệ thống đặt hẹn cà phê 1-on-1 thuận tiện.',
      },
    ],
  },
  {
    id: 4,
    bgImage: 'images/backgrounds/04_operations.jpg',
    type: 'features_gallery',
    tag: 'PHÂN HỆ TRUNG TÂM ĐIỀU HÀNH',
    title: 'PHÂN HỆ WEB CRM: CÔNG CỤ VẬN HÀNH THỰC CHIẾN CỦA BAN LÃNH ĐẠO',
    subtitle: 'Chuẩn hóa toàn diện quy trình điều hành của Ban Thư Ký và 6 Ban Chuyên Môn trên một giao diện thống nhất',
    features: [
      {
        title: '1. Quản Trị Danh Bạ Hội Viên 360°',
        desc: 'Hồ sơ pháp lý, mã số thuế, phân ban chuyên môn, thẩm định và phê duyệt hội viên mới minh bạch.',
        imgFile: 'images/live_captures_fresh/crm_03_quanly_hoivien_360.png',
      },
      {
        title: '2. Sơ Đồ Bàn Tiệc & Đón Tiếp Sự Kiện',
        desc: 'Bố trí sơ đồ bàn tiệc VIP, xếp vị trí danh dự từng đại biểu, đón tiếp khách mời bằng mã vé điện tử nhanh chóng.',
        imgFile: 'images/live_captures_fresh/crm_04_quanly_sukien_gala.png',
      },
      {
        title: '3. Phân Công Nhiệm Vụ & Điều Hành Ban',
        desc: 'Giao việc rõ người chịu trách nhiệm, theo dõi tiến độ và thời hạn hoàn thành, đính kèm tài liệu họp đầy đủ.',
        imgFile: 'images/live_captures_fresh/crm_08_giaoviec_ban_dieuhanh.png',
      },
      {
        title: '4. Quản Lý Thu Chi & Sổ Quỹ Tự Động',
        desc: 'Quản lý thu hội phí, tiền tài trợ và chi phí sự kiện; tự động đối soát ngân hàng và báo cáo tài chính minh bạch.',
        imgFile: 'images/live_captures_fresh/crm_07_quanly_hoiphi_vietqr.png',
      },
    ],
  },
  {
    id: 5,
    bgImage: 'images/backgrounds/05_mobile_network.jpg',
    type: 'features_gallery',
    tag: 'PHÂN HỆ ỨNG DỤNG DOANH NHÂN',
    title: 'PHÂN HỆ MOBILE APP: VĂN PHÒNG DOANH NHÂN BỎ TÚI CỦA TỪNG CEO',
    subtitle: 'Nâng tầm hình ảnh lãnh đạo, gắn kết giao thương bền chặt ngay trên chiếc điện thoại thông minh',
    features: [
      {
        title: '1. Thẻ Hội Viên & Danh Thiếp Số Tiện Lợi',
        desc: 'Thẻ số nhận diện sang trọng, tích hợp mã QR cá nhân giúp đối tác lưu danh bạ tức thì mà không cần cài app.',
        imgFile: 'images/live_captures_fresh/app_02_the_hoivien_so_vip.png',
      },
      {
        title: '2. Sàn Giao Thương B2B & Ưu Đãi Nội Khối',
        desc: 'Gian hàng giới thiệu giải pháp mũi nhọn của từng doanh nghiệp, cam kết chiết khấu ưu đãi cho cộng đồng CEO 1983.',
        imgFile: 'images/live_captures_fresh/app_04_san_giaothuong_b2b.png',
      },
      {
        title: '3. Ví Vé Sự Kiện & Bốc Thăm May Mắn',
        desc: 'Lưu vé mời điện tử, thông báo trước số bàn tiệc và số ghế danh dự; tự động kích hoạt mã may mắn khi vào cửa.',
        imgFile: 'images/live_captures_fresh/app_05_sukien_ve_dien_tu.png',
      },
      {
        title: '4. Danh Bạ Lãnh Đạo & Hẹn Gặp 1-on-1',
        desc: 'Tìm kiếm đối tác chính danh theo 11 ngành nghề, gửi lời mời cà phê kết nối tự động cập nhật vào lịch làm việc.',
        imgFile: 'images/live_captures_fresh/app_07_danhba_lanhdao_ceo.png',
      },
    ],
  },
  {
    id: 6,
    bgImage: 'images/backgrounds/06_innovation.jpg',
    type: 'features_gallery',
    tag: 'PHÂN HỆ THỐNG KÊ & BÁO CÁO BI',
    title: 'TRUNG TÂM PHÂN TÍCH DỮ LIỆU & BÁO CÁO CHIẾN LƯỢC TOÀN DIỆN',
    subtitle: 'Trực quan hóa mọi chỉ số sức khỏe tổ chức, tài chính thu chi và hiệu quả giao thương B2B thời gian thực',
    features: [
      {
        title: '1. Dashboard BI Thống Kê Hội Viên',
        desc: 'Đo lường cơ cấu 500+ doanh nghiệp theo 11 ngành nghề chủ lực, biến động hội viên mới và tỷ lệ gắn kết hoạt động.',
        imgFile: 'images/live_captures_fresh/crm_02_thongke_baocao_bi.png',
      },
      {
        title: '2. Báo Cáo Tài Chính & Dòng Tiền Quỹ',
        desc: 'Biểu đồ Recharts theo dõi thu hội phí, tiền tài trợ và chi phí sự kiện; tự động đối soát ngân hàng chính xác 100%.',
        imgFile: 'images/live_captures_fresh/crm_06_baocao_taichinh_thuchi.png',
      },
      {
        title: '3. Thống Kê Điểm Danh & Tỷ Lệ Tham Dự',
        desc: 'Theo dõi thời gian thực tỷ lệ check-in sự kiện Gala, đại biểu tham gia theo từng ban chuyên môn và từng bàn tiệc.',
        imgFile: 'images/live_captures_fresh/crm_04_quanly_sukien_gala.png',
      },
      {
        title: '4. Đo Lường Xúc Tiến Thương Mại B2B',
        desc: 'Tổng hợp số lượng cơ hội kinh doanh được tạo lập, giá trị giao thương kết nối thành công và tần suất lịch hẹn 1-on-1.',
        imgFile: 'images/live_captures_fresh/crm_01_dashboard_tongquan.png',
      },
    ],
  },
  {
    id: 7,
    bgImage: 'images/backgrounds/07_banquet_gala.jpg',
    type: 'features_gallery',
    tag: 'PHÂN HỆ ĐÀO TẠO & TRI THỨC SỐ',
    title: 'CHƯƠNG TRÌNH ĐÀO TẠO DOANH NHÂN & KHO TRI THỨC QUẢN TRỊ 1983',
    subtitle: 'Nâng tầm tri thức lãnh đạo, phát triển năng lực doanh nghiệp và lan tỏa giá trị tri thức bền vững',
    features: [
      {
        title: '1. Quản Lý Danh Mục Khóa Học & Giảng Viên',
        desc: 'Thiết lập các khóa đào tạo chuyên đề (Quản trị, Tài chính, AI & Chuyển đổi số), phân bổ lịch học và diễn giả uy tín.',
        imgFile: 'images/live_captures_fresh/crm_05_chuongtrinh_daotao.png',
      },
      {
        title: '2. Đăng Ký & Điểm Danh Học Viên Trên App',
        desc: 'Doanh nhân đăng ký tham gia khóa đào tạo 1 chạm, nhận vé mời học tập và điểm danh bằng mã QR tức thời.',
        imgFile: 'images/live_captures_fresh/app_06_chuongtrinh_daotao.png',
      },
      {
        title: '3. Kho Học Liệu & Video Bài Giảng Số',
        desc: 'Lưu trữ trọn bộ tài liệu slide chuyên đề, video ghi hình bài giảng và bộ biểu mẫu chuẩn hóa tải về ngay trên app.',
        imgFile: 'images/live_captures_fresh/crm_05_chuongtrinh_daotao.png',
      },
      {
        title: '4. Khảo Sát Đánh Giá & Chứng Nhận Số',
        desc: 'Thu thập ý kiến đóng góp của học viên sau khóa đào tạo, tự động cấp chứng nhận số có mã định danh xác thực.',
        imgFile: 'images/live_captures_fresh/app_06_chuongtrinh_daotao.png',
      },
    ],
  },
  {
    id: 8,
    bgImage: 'images/backgrounds/06_innovation.jpg',
    type: 'breakthroughs',
    tag: 'GIÁ TRỊ GIA TĂNG THỰC TIỄN',
    title: '5 ĐIỂM SÁNG NÂNG TẦM TRẢI NGHIỆM VẬN HÀNH & HỘI VIÊN',
    subtitle: 'Những tiện ích thiết thực do Đơn vị phát triển chủ động nghiên cứu tích hợp nâng cao nhằm tối ưu hiệu quả CLB',
    items: [
      {
        num: '01',
        badge: 'TÀI CHÍNH MINH BẠCH',
        title: 'Thu Chi & Đóng Phí Tự Động Bằng Mã QR',
        desc: 'Tự động tạo mã QR thanh toán đúng số tiền và nội dung, hệ thống ghi nhận đã thu tiền ngay khi giao dịch thành công, đối soát sổ quỹ chính xác 100%.',
      },
      {
        num: '02',
        badge: 'ĐÓN TIẾP TRANG TRỌNG',
        title: 'Sơ Đồ Xếp Bàn Tiệc & Chỗ Ngồi Gala Chu Đáo',
        desc: 'Ban tổ chức chủ động xếp chỗ trước theo bàn VIP và nhóm ngành nghề; khách đến sự kiện biết ngay vị trí ngồi của mình, tránh nhầm lẫn.',
      },
      {
        num: '03',
        badge: 'HỖ TRỢ THƯỜNG TRỰC',
        title: 'Trợ Lý Số Hướng Dẫn Hội Viên 24/7',
        desc: 'Hỗ trợ hội viên tra cứu nhanh thông tin sự kiện sắp diễn ra, thông tin hội đồng, liên hệ Ban Thư Ký và tìm kiếm các đối tác tiềm năng.',
      },
      {
        num: '04',
        badge: 'KẾT NỐI BẢO MẬT',
        title: 'Kênh Trao Đổi & Liên Lạc Nội Bộ Riêng Tư',
        desc: 'Gọi điện thoại và trao đổi trực tiếp giữa các Chủ tịch & CEO hội viên, bảo mật tuyệt đối, giữ gìn tính riêng tư trong các cuộc thảo luận kinh doanh.',
      },
      {
        num: '05',
        badge: 'QUẢN TRỊ KHOA HỌC',
        title: 'Phân Quyền Vận Hành Theo Đúng 6 Ban Chuyên Môn',
        desc: 'Ban Lãnh Đạo nắm toàn cảnh hệ thống; các Trưởng Ban và Thành viên chỉ xem và xử lý đúng nghiệp vụ của ban mình, bảo vệ an toàn thông tin.',
      },
    ],
  },
  {
    id: 9,
    bgImage: 'images/backgrounds/07_banquet_gala.jpg',
    type: 'roadmap',
    tag: 'KẾ HOẠCH TRIỂN KHAI & BÀN GIAO',
    title: 'LỘ TRÌNH ĐỒNG HÀNH BỀN VỮNG CÙNG HANOIBA',
    subtitle: 'Đơn vị phát triển cam kết chất lượng sản phẩm chuẩn mực, bảo hành dài hạn và đồng hành lâu dài cùng câu lạc bộ',
    steps: [
      {
        phase: 'GIAI ĐOẠN 1',
        time: '21/10/2026',
        title: 'Họp Báo Cáo Demo & Tiếp Thu Góp Ý',
        desc: 'Báo cáo trực tiếp tại HDI Mạc Thái Tông; lắng nghe ý kiến phản hồi từ Ban Lãnh Đạo để hoàn thiện sản phẩm.',
      },
      {
        phase: 'GIAI ĐOẠN 2',
        time: '22/10 – 30/10/2026',
        title: 'Nghiệm Thu Kỹ Thuật & Đóng Gói Bộ Tài Liệu',
        desc: 'Bàn giao 100% hồ sơ tài liệu kỹ thuật, hướng dẫn sử dụng Web CRM và Mobile App; đồng bộ cơ sở dữ liệu chính thức.',
      },
      {
        phase: 'GIAI ĐOẠN 3',
        time: '01/11 – 10/11/2026',
        title: 'Tập Huấn & Chuyển Giao Quy Trình',
        desc: 'Tập huấn trực tiếp cho Ban Thư Ký và các Trưởng Ban; chuyển giao quy trình vận hành sự kiện và quản trị tài chính.',
      },
      {
        phase: 'GIAI ĐOẠN 4',
        time: 'Thường Niên',
        title: 'Phát Hành Store & Bảo Hành 24/7',
        desc: 'Phát hành chính thức lên App Store & Google Play Store; Đơn vị trực kỹ thuật và vận hành hạ tầng 24/7 trong các sự kiện Gala.',
      },
    ],
  },
  {
    id: 10,
    bgImage: 'images/backgrounds/08_skyline_night.jpg',
    type: 'closing',
    tag: 'GẮN KẾT BẢN LĨNH — BỨT PHÁ TƯƠNG LAI',
    title: 'ĐỒNG HÀNH KIẾN TẠO LIÊN MINH KINH TẾ BẢN LĨNH & THỊNH VƯỢNG',
    subtitle: 'ĐƠN VỊ PHÁT TRIỂN & CLB DOANH NHÂN CEO 1983 (HANOIBA)',
    bullets: [
      'Đơn vị phát triển cam kết duy trì vận hành máy chủ đám mây ổn định 99.9% uptime',
      'Đội ngũ kỹ sư túc trực hỗ trợ kỹ thuật tận tâm tại mọi sự kiện Gala của Hiệp hội',
      'Liên tục cập nhật các công nghệ trí tuệ nhân tạo (AI) mới nhất phục vụ hội viên',
    ],
    contact: {
      hotline: '0983 1983 83 / 0988 66 55 44',
      crmUrl: 'https://crm.ceo1983.viconnect.vn',
      appUrl: 'https://ceo1983.viconnect.vn',
    },
    closingWish: 'Kính chúc CLB CEO 1983 ngày càng lớn mạnh, đoàn kết và bứt phá thành công!',
  },
];

// -------------------------------------------------------------------------
// [A] TẠO HTML SLIDESHOW CHO SLIDE_TONG_THE_HE_SINH_THAI_CEO1983
// -------------------------------------------------------------------------
function generateSlidesHtml(slides) {
  const slidesJson = JSON.stringify(slides);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Báo Cáo Tổng Thể Hệ Sinh Thái Số CEO 1983 | HanoiBA</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Great+Vibes&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #001F54;
      margin: 0;
      padding: 0;
      overflow: hidden;
      user-select: none;
    }
    .font-script {
      font-family: 'Great Vibes', cursive, serif;
    }
    .cyan-glow-wave {
      filter: drop-shadow(0 0 20px rgba(0, 210, 255, 0.75));
    }
    .deep-navy-gradient {
      background: linear-gradient(135deg, #001538 0%, #001F54 50%, #003B95 100%);
    }
    .white-card-elevated {
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(16px);
      box-shadow: 0 30px 60px -15px rgba(0, 31, 84, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.9);
      border-radius: 28px;
    }
    .amber-callout {
      background: linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%);
      border: 1px solid #FED7AA;
      border-radius: 18px;
    }

    /* Print & Multi-slide styles */
    @media print {
      body {
        overflow: visible !important;
        background: transparent !important;
      }
      header, footer, .screen-controls {
        display: none !important;
      }
      .slide-page {
        page-break-after: always;
        break-after: page;
        width: 1920px;
        height: 1080px;
        display: block !important;
        position: relative;
      }
    }
  </style>
</head>
<body class="w-screen h-screen flex flex-col justify-between text-slate-800">

  <!-- TOP APP BAR -->
  <header class="w-full h-14 bg-[#001538]/90 border-b border-cyan-500/20 backdrop-blur-md px-6 flex items-center justify-between z-50 text-white shrink-0 screen-controls">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <span class="font-black text-cyan-400 text-lg tracking-wider">▲▼ ĐƠN VỊ CÔNG NGHỆ</span>
        <span class="text-cyan-500/40">|</span>
        <span class="font-extrabold text-amber-400 text-sm tracking-wide">3 CEO 1983</span>
      </div>
      <span class="hidden md:inline text-xs text-blue-200/80 pl-3 border-l border-white/10 font-medium">
        Báo cáo tổng thể hệ sinh thái số (Web CRM &amp; Mobile App) · CLB Doanh Nhân CEO 1983
      </span>
    </div>

    <div class="flex items-center gap-3 text-xs">
      <span class="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-semibold font-mono">
        Thứ Tư, 21/10/2026
      </span>
      <button onclick="toggleFullscreen()" class="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 transition text-white cursor-pointer font-bold">
        ⛶ Toàn màn hình
      </button>
    </div>
  </header>

  <!-- MAIN SLIDE CONTAINER 16:9 -->
  <main class="flex-1 w-full flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden relative">
    <div id="slideViewport" class="w-full max-w-[1550px] aspect-[16/9] max-h-[88vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
      <div id="slideCard" class="w-full h-full relative overflow-hidden flex flex-col"></div>
    </div>
  </main>

  <!-- BOTTOM CONTROL BAR -->
  <footer class="w-full h-14 bg-[#001538]/90 border-t border-cyan-500/20 px-6 flex items-center justify-between text-white text-xs z-50 shrink-0 screen-controls">
    <div class="flex items-center gap-2">
      <span class="text-blue-200/80">Phím điều khiển:</span>
      <kbd class="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono">[←] Trước</kbd>
      <kbd class="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono">[→] Tiếp theo</kbd>
      <kbd class="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono">[Space] Chuyển trang</kbd>
    </div>

    <!-- Navigation buttons -->
    <div class="flex items-center gap-3">
      <button onclick="prevSlide()" class="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition font-bold cursor-pointer">
        ◀ Trước
      </button>
      <span id="slideIndicator" class="font-mono font-black text-cyan-300 text-sm tracking-widest px-2">
        1 / ${slides.length}
      </span>
      <button onclick="nextSlide()" class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold transition cursor-pointer shadow-md">
        Tiếp theo ▶
      </button>
    </div>

    <div class="hidden sm:flex items-center gap-2 text-blue-200/80">
      <span>Đơn vị phát triển hệ thống</span>
      <span>·</span>
      <span class="text-blue-100 font-semibold">CLB Doanh Nhân CEO 1983</span>
    </div>
  </footer>

  <script>
    const slides = ${slidesJson};
    let currentIndex = 0;

    function renderSlide(idx) {
      const s = slides[idx];
      const container = document.getElementById('slideCard');
      document.getElementById('slideIndicator').innerText = (idx + 1) + ' / ' + slides.length;

      let html = '';

      if (s.type === 'cover') {
        html = \`
          <div class="w-full h-full relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 deep-navy-gradient text-white">
            <img src="\${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-[0.5px]" alt="Skyline" />
            
            <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
              <path d="M0 650 C 350 500, 700 780, 1440 550 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.85"/>
              <path d="M0 650 C 350 500, 700 780, 1440 550" stroke="#00D2FF" stroke-width="6" stroke-linecap="round"/>
              <path d="M0 720 C 450 620, 850 820, 1440 680 L 1440 900 L 0 900 Z" fill="#003B95" opacity="0.6"/>
              <path d="M0 720 C 450 620, 850 820, 1440 680" stroke="#00A3FF" stroke-width="4" stroke-linecap="round"/>
            </svg>

            <!-- Top Header Logo đôi -->
            <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-4">
              <div class="flex items-center gap-3">
                <div class="h-10 px-3 rounded-xl bg-white text-[#001F54] font-black flex items-center gap-1.5 shadow-md">
                  <span class="text-blue-600 text-lg">▲▼</span>
                  <span class="tracking-wide">ĐƠN VỊ PHÁT TRIỂN</span>
                </div>
                <div class="h-6 w-px bg-white/30"></div>
                <div class="h-10 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black flex items-center gap-1.5 shadow-md">
                  <span class="text-white text-lg">3</span>
                  <span class="tracking-wide">CEO 1983</span>
                </div>
              </div>
              <span class="px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase tracking-wider">
                \${s.tag}
              </span>
            </div>

            <!-- Khung thẻ trắng chính giữa -->
            <div class="relative z-10 my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
              <div class="lg:col-span-8 bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl border border-white space-y-4">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-200">
                  <span>✦ BÁO CÁO NGHIỆM THU DEMO CHUYÊN NGHIỆP ✦</span>
                </div>

                <h1 class="text-2xl sm:text-4xl lg:text-5xl font-black text-[#001F54] leading-tight tracking-tight">
                  \${s.title}
                </h1>

                <p class="text-xs sm:text-sm font-bold text-cyan-700 uppercase tracking-widest">
                  \${s.subtitle}
                </p>

                <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  \${s.description}
                </p>

                <!-- Box thông tin thời gian & địa điểm -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div class="w-9 h-9 rounded-xl bg-[#001F54] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                      📅
                    </div>
                    <div>
                      <div class="text-[11px] font-bold text-slate-500 uppercase">Thời Gian</div>
                      <div class="text-xs font-extrabold text-[#001F54]">\${s.meetingInfo.time}</div>
                    </div>
                  </div>

                  <div class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div class="w-9 h-9 rounded-xl bg-[#001F54] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                      📍
                    </div>
                    <div>
                      <div class="text-[11px] font-bold text-slate-500 uppercase">Địa Điểm</div>
                      <div class="text-xs font-extrabold text-[#001F54] line-clamp-2">\${s.meetingInfo.location}</div>
                    </div>
                  </div>
                </div>

                <div class="amber-callout p-3.5 flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
                    🍴
                  </div>
                  <div class="text-xs font-bold text-amber-950">
                    \${s.meetingInfo.lunch}
                  </div>
                </div>
              </div>

              <!-- Cột phải: Poster thư mời mini -->
              <div class="lg:col-span-4 flex flex-col items-center justify-center gap-3">
                <div class="relative rounded-3xl p-3 bg-white/90 backdrop-blur-md border border-cyan-400/40 shadow-2xl text-center space-y-2 max-w-[260px]">
                  <img src="images/image1_invitation_poster.png" class="w-full rounded-2xl shadow-md border border-slate-200" alt="Poster Gốc" onerror="this.src='images/backgrounds/01_skyline_lake.jpg'" />
                  <div class="text-[11px] font-extrabold text-[#001F54] pt-1">
                    Bản Demo CLB CEO 1983
                  </div>
                  <span class="inline-block px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-bold">
                    📍 Quét mã để xem chi tiết
                  </span>
                </div>
              </div>
            </div>

            <!-- Footer chuẩn (Không có chữ vàng bên phải) -->
            <div class="relative z-10 border-t border-white/15 pt-3 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-200">
              <span class="text-blue-100 font-medium">\${s.footerText}</span>
              <span class="font-bold text-cyan-300 mt-1 sm:mt-0 font-mono">Hệ Sinh Thái Số CEO 1983 · HanoiBA 2026</span>
            </div>
          </div>
        \`;
      } else if (s.type === 'two_products') {
        html = \`
          <div class="w-full h-full relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-slate-900 text-white">
            <img src="\${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[1px]" alt="Boardroom" />
            <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
              <path d="M0 720 C 400 580, 800 840, 1440 640 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.9"/>
              <path d="M0 720 C 400 580, 800 840, 1440 640" stroke="#00D2FF" stroke-width="5"/>
            </svg>

            <!-- Header -->
            <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-3">
              <div>
                <span class="text-xs font-black text-cyan-400 uppercase tracking-widest block">\${s.tag}</span>
                <h2 class="text-xl sm:text-3xl font-black text-white mt-0.5">\${s.title}</h2>
              </div>
              <span class="text-xs text-blue-200 font-mono">\${s.subtitle}</span>
            </div>

            <!-- 2 Cards Sản Phẩm nổi bật -->
            <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 my-auto pt-3">
              <!-- CRM Card -->
              <div class="white-card-elevated p-6 sm:p-7 flex flex-col justify-between space-y-4">
                <div>
                  <div class="flex items-center gap-2.5 mb-2">
                    <span class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">CRM</span>
                    <h3 class="text-base sm:text-lg font-black text-[#001F54]">\${s.crm.title}</h3>
                  </div>
                  <div class="text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 mb-3">
                    \${s.crm.target}
                  </div>
                  <ul class="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                    \${s.crm.bullets.map(b => \`
                      <li class="flex items-start gap-2">
                        <span class="text-blue-600 font-bold mt-0.5">✓</span>
                        <span>\${b}</span>
                      </li>
                    \`).join('')}
                  </ul>
                </div>
              </div>

              <!-- Mobile App Card -->
              <div class="white-card-elevated p-6 sm:p-7 flex flex-col justify-between space-y-4 border-2 border-cyan-400/40">
                <div>
                  <div class="flex items-center gap-2.5 mb-2">
                    <span class="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">APP</span>
                    <h3 class="text-base sm:text-lg font-black text-[#001F54]">\${s.app.title}</h3>
                  </div>
                  <div class="text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 mb-3">
                    \${s.app.target}
                  </div>
                  <ul class="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                    \${s.app.bullets.map(b => \`
                      <li class="flex items-start gap-2">
                        <span class="text-amber-500 font-bold mt-0.5">★</span>
                        <span>\${b}</span>
                      </li>
                    \`).join('')}
                  </ul>
                </div>
              </div>
            </div>

            <!-- Footer không có chữ vàng bên phải -->
            <div class="relative z-10 border-t border-white/15 pt-3 flex justify-between items-center text-xs text-cyan-300 font-bold">
              <span>\${s.footerHighlight}</span>
              <span class="text-xs text-blue-200 font-medium">Đồng bộ dữ liệu thời gian thực</span>
            </div>
          </div>
        \`;
      } else if (s.type === 'three_requirements') {
        html = \`
          <div class="w-full h-full relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-slate-900 text-white">
            <img src="\${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[1px]" alt="City" />
            <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
              <path d="M0 680 C 450 550, 900 800, 1440 600 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.9"/>
              <path d="M0 680 C 450 550, 900 800, 1440 600" stroke="#00D2FF" stroke-width="5"/>
            </svg>

            <!-- Header -->
            <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-3">
              <div>
                <span class="text-xs font-black text-amber-400 uppercase tracking-widest block">\${s.tag}</span>
                <h2 class="text-xl sm:text-3xl font-black text-white mt-0.5">\${s.title}</h2>
              </div>
              <span class="text-xs text-blue-200 font-mono hidden sm:inline">\${s.subtitle}</span>
            </div>

            <!-- 3 Cột Yêu Cầu Ban Đầu -->
            <div class="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 my-auto pt-3">
              \${s.cols.map(c => \`
                <div class="white-card-elevated p-5 sm:p-6 flex flex-col justify-between space-y-3">
                  <div>
                    <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                      <span class="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">\${c.badge}</span>
                      <span class="font-mono text-xl font-black text-amber-500">\${c.num}</span>
                    </div>
                    <h3 class="text-base font-black text-[#001F54] mb-2">\${c.title}</h3>
                    
                    <div class="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs font-medium mb-2">
                      <strong class="text-rose-700">Thách thức cũ:</strong> \${c.problem}
                    </div>

                    <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold">
                      <strong class="text-emerald-700">Giải pháp công nghệ:</strong> \${c.solution}
                    </div>
                  </div>
                </div>
              \`).join('')}
            </div>

            <!-- Footer không có chữ vàng bên phải -->
            <div class="relative z-10 border-t border-white/15 pt-3 flex justify-between text-xs text-blue-300">
              <span>Hệ sinh thái số hóa toàn diện CLB Doanh Nhân CEO 1983</span>
              <span class="text-cyan-300 font-semibold">Hiện thực hóa 100% mục tiêu</span>
            </div>
          </div>
        \`;
      } else if (s.type === 'features_gallery') {
        html = \`
          <div class="w-full h-full relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-slate-900 text-white">
            <img src="\${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[1px]" alt="Background" />
            <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
              <path d="M0 720 C 500 600, 950 820, 1440 660 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.9"/>
              <path d="M0 720 C 500 600, 950 820, 1440 660" stroke="#00D2FF" stroke-width="5"/>
            </svg>

            <!-- Header -->
            <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-3">
              <div>
                <span class="text-xs font-black text-cyan-400 uppercase tracking-widest block">\${s.tag}</span>
                <h2 class="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-0.5">\${s.title}</h2>
              </div>
              <span class="text-xs text-blue-200 hidden sm:inline">\${s.subtitle}</span>
            </div>

            <!-- 4 Feature Cards kèm hình ảnh thực tế từ Live Domain -->
            <div class="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-auto pt-3">
              \${s.features.map(f => \`
                <div class="white-card-elevated p-3.5 flex flex-col justify-between space-y-2 group hover:scale-[1.02] transition shadow-xl">
                  <div class="w-full h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                    <img src="\${f.imgFile}" class="w-full h-full object-cover object-top" onerror="this.style.display='none'" alt="\${f.title}" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  </div>
                  <div>
                    <h3 class="text-xs sm:text-sm font-black text-[#001F54] line-clamp-1">\${f.title}</h3>
                    <p class="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed font-medium">\${f.desc}</p>
                  </div>
                </div>
              \`).join('')}
            </div>

            <!-- Footer chuẩn (Không có chữ vàng bên phải) -->
            <div class="relative z-10 border-t border-white/15 pt-3 flex justify-between text-xs text-cyan-300 font-bold">
              <span>Ảnh chụp giao diện thực tế hệ thống từ Domain vận hành chính thức</span>
              <span class="text-xs text-blue-200 font-medium">Bảo mật &amp; Minh bạch dữ liệu</span>
            </div>
          </div>
        \`;
      } else if (s.type === 'breakthroughs') {
        html = \`
          <div class="w-full h-full relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-slate-900 text-white">
            <img src="\${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[1px]" alt="Innovation" />
            <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
              <path d="M0 700 C 400 560, 850 820, 1440 620 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.9"/>
              <path d="M0 700 C 400 560, 850 820, 1440 620" stroke="#00D2FF" stroke-width="5"/>
            </svg>

            <!-- Header -->
            <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-3">
              <div>
                <span class="text-xs font-black text-amber-400 uppercase tracking-widest block">\${s.tag}</span>
                <h2 class="text-xl sm:text-3xl font-black text-white mt-0.5">\${s.title}</h2>
              </div>
              <span class="text-xs text-blue-200 hidden sm:inline">\${s.subtitle}</span>
            </div>

            <!-- 5 Đột phá công nghệ -->
            <div class="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 my-auto pt-3">
              \${s.items.map(it => \`
                <div class="white-card-elevated p-4 flex flex-col justify-between space-y-2 border-t-4 border-t-cyan-500">
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 text-[9px] font-black uppercase">\${it.badge}</span>
                      <span class="font-mono text-sm font-black text-amber-500">\${it.num}</span>
                    </div>
                    <h3 class="text-xs font-black text-[#001F54] mb-1.5 leading-snug">\${it.title}</h3>
                    <p class="text-[11px] text-slate-600 leading-relaxed font-medium">\${it.desc}</p>
                  </div>
                </div>
              \`).join('')}
            </div>

            <!-- Footer không có chữ vàng bên phải -->
            <div class="relative z-10 border-t border-white/15 pt-3 flex justify-between text-xs text-cyan-300 font-bold">
              <span>Đột phá công nghệ do Đơn vị phát triển chủ động nghiên cứu tích hợp</span>
              <span class="text-xs text-blue-200 font-medium">Tối ưu trải nghiệm hội viên</span>
            </div>
          </div>
        \`;
      } else if (s.type === 'roadmap') {
        html = \`
          <div class="w-full h-full relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-slate-900 text-white">
            <img src="\${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[1px]" alt="Gala" />
            <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
              <path d="M0 720 C 450 580, 900 820, 1440 650 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.9"/>
              <path d="M0 720 C 450 580, 900 820, 1440 650" stroke="#00D2FF" stroke-width="5"/>
            </svg>

            <!-- Header -->
            <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-3">
              <div>
                <span class="text-xs font-black text-cyan-400 uppercase tracking-widest block">\${s.tag}</span>
                <h2 class="text-xl sm:text-3xl font-black text-white mt-0.5">\${s.title}</h2>
              </div>
              <span class="text-xs text-blue-200 hidden sm:inline">\${s.subtitle}</span>
            </div>

            <!-- 4 Bước Lộ Trình Triển Khai -->
            <div class="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-auto pt-3">
              \${s.steps.map(st => \`
                <div class="white-card-elevated p-5 flex flex-col justify-between space-y-3">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">\${st.phase}</span>
                      <span class="font-mono text-xs font-black text-amber-500">\${st.time}</span>
                    </div>
                    <h3 class="text-sm font-black text-[#001F54] mb-1.5 leading-snug">\${st.title}</h3>
                    <p class="text-xs text-slate-600 leading-relaxed font-medium">\${st.desc}</p>
                  </div>
                </div>
              \`).join('')}
            </div>

            <!-- Footer không có chữ vàng bên phải (Đã bỏ viconnectPartner) -->
            <div class="relative z-10 border-t border-white/15 pt-3 flex justify-between text-xs text-cyan-300 font-bold">
              <span>Cam kết bảo hành máy chủ 24/7 và đồng hành trọn đời cùng HanoiBA</span>
              <span class="text-xs text-blue-200 font-medium">Hợp tác bền vững vì hội viên</span>
            </div>
          </div>
        \`;
      } else if (s.type === 'closing') {
        html = \`
          <div class="w-full h-full relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 deep-navy-gradient text-white">
            <img src="\${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-[0.5px]" alt="Skyline Night" />
            <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
              <path d="M0 650 C 400 500, 850 780, 1440 580 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.85"/>
              <path d="M0 650 C 400 500, 850 780, 1440 580" stroke="#00D2FF" stroke-width="6"/>
            </svg>

            <!-- Top Header Logo đôi -->
            <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-4">
              <div class="flex items-center gap-3">
                <span class="font-black text-white text-base">▲▼ ĐƠN VỊ PHÁT TRIỂN</span>
                <span class="text-white/40">|</span>
                <span class="font-extrabold text-amber-400 text-sm">3 CEO 1983</span>
              </div>
              <span class="px-4 py-1.5 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase">
                \${s.tag}
              </span>
            </div>

            <!-- Content Card -->
            <div class="relative z-10 my-auto max-w-3xl mx-auto w-full white-card-elevated p-8 sm:p-10 text-slate-800 shadow-2xl text-center space-y-4">
              <h2 class="text-2xl sm:text-4xl font-black text-[#001F54] leading-tight">
                \${s.title}
              </h2>
              <p class="text-xs sm:text-sm font-black text-cyan-700 uppercase tracking-widest">
                \${s.subtitle}
              </p>

              <div class="space-y-2 max-w-xl mx-auto text-left pt-2">
                \${s.bullets.map(b => \`
                  <div class="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                    <span class="text-emerald-600 font-bold">✓</span>
                    <span>\${b}</span>
                  </div>
                \`).join('')}
              </div>

              <!-- Hotline & URLs -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                <div class="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs">
                  <div class="text-[10px] font-bold text-blue-600 uppercase">Cổng Quản Trị Web CRM</div>
                  <div class="font-mono font-bold text-blue-900">\${s.contact.crmUrl}</div>
                </div>
                <div class="p-3 rounded-2xl bg-cyan-50 border border-cyan-200 text-xs">
                  <div class="text-[10px] font-bold text-cyan-700 uppercase">Tải Ứng Dụng Mobile App</div>
                  <div class="font-mono font-bold text-cyan-900">\${s.contact.appUrl}</div>
                </div>
              </div>

              <div class="text-lg sm:text-xl font-bold text-[#001F54] pt-2">
                \${s.closingWish}
              </div>
            </div>

            <!-- Footer không có chữ vàng bên phải -->
            <div class="relative z-10 border-t border-white/15 pt-3 flex justify-between text-xs text-blue-200">
              <span>Hệ sinh thái công nghệ số hóa · HanoiBA 2026</span>
              <span class="text-cyan-300 font-semibold">Trân trọng cảm ơn Ban Lãnh Đạo &amp; Quý Hội Viên!</span>
            </div>
          </div>
        \`;
      }

      container.innerHTML = html;
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

    // Khởi tạo
    renderSlide(0);
  </script>
</body>
</html>
`;
}

// -------------------------------------------------------------------------
// [B] TẠO HTML PHỤC VỤ XUẤT MULTI-PAGE PDF CHO SLIDE DECK (16:9 NÉT CĂNG)
// -------------------------------------------------------------------------
function generatePrintableDeckHtml(slides) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>SLIDE TỔNG THỂ HỆ SINH THÁI CEO 1983 - PRINT VERSION</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page {
      size: 1920px 1080px;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      margin: 0;
      padding: 0;
      background: #001F54;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .slide-page {
      width: 1920px;
      height: 1080px;
      position: relative;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .deep-navy-gradient {
      background: linear-gradient(135deg, #001538 0%, #001F54 50%, #003B95 100%);
    }
    .white-card-elevated {
      background: rgba(255, 255, 255, 0.96);
      box-shadow: 0 30px 60px -15px rgba(0, 31, 84, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.9);
      border-radius: 28px;
    }
    .amber-callout {
      background: linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%);
      border: 1px solid #FED7AA;
      border-radius: 18px;
    }
    .cyan-glow-wave {
      filter: drop-shadow(0 0 20px rgba(0, 210, 255, 0.75));
    }
  </style>
</head>
<body>
  ${slides.map((s, idx) => {
    if (s.type === 'cover') {
      return `
        <div class="slide-page p-16 deep-navy-gradient text-white">
          <img src="${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-[0.5px]" alt="Skyline" />
          <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
            <path d="M0 650 C 350 500, 700 780, 1440 550 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.85"/>
            <path d="M0 650 C 350 500, 700 780, 1440 550" stroke="#00D2FF" stroke-width="6" stroke-linecap="round"/>
            <path d="M0 720 C 450 620, 850 820, 1440 680 L 1440 900 L 0 900 Z" fill="#003B95" opacity="0.6"/>
            <path d="M0 720 C 450 620, 850 820, 1440 680" stroke="#00A3FF" stroke-width="4" stroke-linecap="round"/>
          </svg>

          <!-- Top Logo -->
          <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-6">
            <div class="flex items-center gap-4">
              <div class="h-12 px-4 rounded-xl bg-white text-[#001F54] font-black flex items-center gap-2 shadow-lg text-lg">
                <span class="text-blue-600">▲▼</span>
                <span class="tracking-wide">ĐƠN VỊ PHÁT TRIỂN</span>
              </div>
              <div class="h-8 w-px bg-white/30"></div>
              <div class="h-12 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black flex items-center gap-2 shadow-lg text-lg">
                <span class="text-white">3</span>
                <span class="tracking-wide">CEO 1983</span>
              </div>
            </div>
            <span class="px-5 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-sm font-black uppercase tracking-wider">
              ${s.tag}
            </span>
          </div>

          <!-- Body -->
          <div class="relative z-10 my-auto grid grid-cols-12 gap-8 items-center pt-4">
            <div class="col-span-8 bg-white/95 backdrop-blur-md rounded-3xl p-12 text-slate-800 shadow-2xl border border-white space-y-6">
              <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-200">
                <span>✦ BÁO CÁO NGHIỆM THU DEMO CHUYÊN NGHIỆP ✦</span>
              </div>

              <h1 class="text-5xl font-black text-[#001F54] leading-tight tracking-tight">
                ${s.title}
              </h1>

              <p class="text-base font-bold text-cyan-700 uppercase tracking-widest">
                ${s.subtitle}
              </p>

              <p class="text-base text-slate-600 leading-relaxed font-medium">
                ${s.description}
              </p>

              <div class="grid grid-cols-2 gap-4 pt-2">
                <div class="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div class="w-10 h-10 rounded-xl bg-[#001F54] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                    📅
                  </div>
                  <div>
                    <div class="text-xs font-bold text-slate-500 uppercase">Thời Gian</div>
                    <div class="text-sm font-extrabold text-[#001F54]">${s.meetingInfo.time}</div>
                  </div>
                </div>

                <div class="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div class="w-10 h-10 rounded-xl bg-[#001F54] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                    📍
                  </div>
                  <div>
                    <div class="text-xs font-bold text-slate-500 uppercase">Địa Điểm</div>
                    <div class="text-sm font-extrabold text-[#001F54] line-clamp-2">${s.meetingInfo.location}</div>
                  </div>
                </div>
              </div>

              <div class="amber-callout p-4 flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shrink-0">
                  🍴
                </div>
                <div class="text-sm font-bold text-amber-950">
                  ${s.meetingInfo.lunch}
                </div>
              </div>
            </div>

            <div class="col-span-4 flex flex-col items-center justify-center">
              <div class="rounded-3xl p-4 bg-white/90 backdrop-blur-md border border-cyan-400/40 shadow-2xl text-center space-y-3 max-w-[320px]">
                <img src="images/image1_invitation_poster.png" class="w-full rounded-2xl shadow-md border border-slate-200" alt="Poster Gốc" onerror="this.src='images/backgrounds/01_skyline_lake.jpg'" />
                <div class="text-xs font-extrabold text-[#001F54]">
                  Bản Demo CLB CEO 1983
                </div>
                <span class="inline-block px-4 py-1.5 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold">
                  📍 Quét mã để xem chi tiết
                </span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="relative z-10 border-t border-white/15 pt-4 flex items-center justify-between text-sm text-blue-200">
            <span class="text-blue-100 font-medium">${s.footerText}</span>
            <span class="font-bold text-cyan-300 font-mono">Hệ Sinh Thái Số CEO 1983 · HanoiBA 2026</span>
          </div>
        </div>
      `;
    }

    if (s.type === 'two_products') {
      return `
        <div class="slide-page p-16 bg-slate-900 text-white">
          <img src="${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[1px]" alt="Boardroom" />
          <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
            <path d="M0 720 C 400 580, 800 840, 1440 640 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.9"/>
            <path d="M0 720 C 400 580, 800 840, 1440 640" stroke="#00D2FF" stroke-width="5"/>
          </svg>

          <!-- Header -->
          <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-4">
            <div>
              <span class="text-sm font-black text-cyan-400 uppercase tracking-widest block">${s.tag}</span>
              <h2 class="text-4xl font-black text-white mt-1">${s.title}</h2>
            </div>
            <span class="text-sm text-blue-200 font-mono">${s.subtitle}</span>
          </div>

          <!-- 2 Cards -->
          <div class="relative z-10 grid grid-cols-2 gap-8 my-auto pt-6">
            <div class="white-card-elevated p-8 space-y-4">
              <div class="flex items-center gap-3 mb-2">
                <span class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">CRM</span>
                <h3 class="text-xl font-black text-[#001F54]">${s.crm.title}</h3>
              </div>
              <div class="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 mb-4 inline-block">
                ${s.crm.target}
              </div>
              <ul class="space-y-3 text-sm text-slate-700 font-medium">
                ${s.crm.bullets.map(b => `
                  <li class="flex items-start gap-2.5">
                    <span class="text-blue-600 font-bold mt-0.5">✓</span>
                    <span>${b}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div class="white-card-elevated p-8 space-y-4 border-2 border-cyan-400/50">
              <div class="flex items-center gap-3 mb-2">
                <span class="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-xs">APP</span>
                <h3 class="text-xl font-black text-[#001F54]">${s.app.title}</h3>
              </div>
              <div class="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 mb-4 inline-block">
                ${s.app.target}
              </div>
              <ul class="space-y-3 text-sm text-slate-700 font-medium">
                ${s.app.bullets.map(b => `
                  <li class="flex items-start gap-2.5">
                    <span class="text-amber-500 font-bold mt-0.5">★</span>
                    <span>${b}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>

          <!-- Footer -->
          <div class="relative z-10 border-t border-white/15 pt-4 flex justify-between items-center text-sm text-cyan-300 font-bold">
            <span>${s.footerHighlight}</span>
            <span class="text-xs text-blue-200 font-medium">Đồng bộ dữ liệu thời gian thực</span>
          </div>
        </div>
      `;
    }

    if (s.type === 'three_requirements') {
      return `
        <div class="slide-page p-16 bg-slate-900 text-white">
          <img src="${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[1px]" alt="City" />
          <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
            <path d="M0 680 C 450 550, 900 800, 1440 600 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.9"/>
            <path d="M0 680 C 450 550, 900 800, 1440 600" stroke="#00D2FF" stroke-width="5"/>
          </svg>

          <!-- Header -->
          <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-4">
            <div>
              <span class="text-sm font-black text-amber-400 uppercase tracking-widest block">${s.tag}</span>
              <h2 class="text-4xl font-black text-white mt-1">${s.title}</h2>
            </div>
            <span class="text-sm text-blue-200 font-mono">${s.subtitle}</span>
          </div>

          <!-- 3 Columns -->
          <div class="relative z-10 grid grid-cols-3 gap-6 my-auto pt-6">
            ${s.cols.map(c => `
              <div class="white-card-elevated p-8 space-y-4">
                <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                  <span class="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black">${c.badge}</span>
                  <span class="font-mono text-2xl font-black text-amber-500">${c.num}</span>
                </div>
                <h3 class="text-lg font-black text-[#001F54] mb-3">${c.title}</h3>
                
                <div class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs font-medium mb-3">
                  <strong class="text-rose-700">Thách thức cũ:</strong> ${c.problem}
                </div>

                <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold">
                  <strong class="text-emerald-700">Giải pháp công nghệ:</strong> ${c.solution}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Footer -->
          <div class="relative z-10 border-t border-white/15 pt-4 flex justify-between text-sm text-blue-300">
            <span>Hệ sinh thái số hóa toàn diện CLB Doanh Nhân CEO 1983</span>
            <span class="text-cyan-300 font-semibold">Hiện thực hóa 100% mục tiêu</span>
          </div>
        </div>
      `;
    }

    if (s.type === 'features_gallery') {
      return `
        <div class="slide-page p-16 bg-slate-900 text-white">
          <img src="${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[1px]" alt="Background" />
          <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
            <path d="M0 720 C 500 600, 950 820, 1440 660 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.9"/>
            <path d="M0 720 C 500 600, 950 820, 1440 660" stroke="#00D2FF" stroke-width="5"/>
          </svg>

          <!-- Header -->
          <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-4">
            <div>
              <span class="text-sm font-black text-cyan-400 uppercase tracking-widest block">${s.tag}</span>
              <h2 class="text-4xl font-black text-white mt-1">${s.title}</h2>
            </div>
            <span class="text-sm text-blue-200">${s.subtitle}</span>
          </div>

          <!-- 4 Cards -->
          <div class="relative z-10 grid grid-cols-4 gap-6 my-auto pt-6">
            ${s.features.map(f => `
              <div class="white-card-elevated p-5 flex flex-col justify-between space-y-3 shadow-xl">
                <div class="w-full h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                  <img src="${f.imgFile}" class="w-full h-full object-cover object-top" onerror="this.style.display='none'" alt="${f.title}" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>
                <div>
                  <h3 class="text-base font-black text-[#001F54] line-clamp-1">${f.title}</h3>
                  <p class="text-xs text-slate-600 line-clamp-3 mt-1.5 leading-relaxed font-medium">${f.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Footer -->
          <div class="relative z-10 border-t border-white/15 pt-4 flex justify-between text-sm text-cyan-300 font-bold">
            <span>Ảnh chụp giao diện thực tế hệ thống từ Domain vận hành chính thức</span>
            <span class="text-xs text-blue-200 font-medium">Bảo mật &amp; Minh bạch dữ liệu</span>
          </div>
        </div>
      `;
    }

    if (s.type === 'breakthroughs') {
      return `
        <div class="slide-page p-16 bg-slate-900 text-white">
          <img src="${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[1px]" alt="Innovation" />
          <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
            <path d="M0 700 C 400 560, 850 820, 1440 620 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.9"/>
            <path d="M0 700 C 400 560, 850 820, 1440 620" stroke="#00D2FF" stroke-width="5"/>
          </svg>

          <!-- Header -->
          <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-4">
            <div>
              <span class="text-sm font-black text-amber-400 uppercase tracking-widest block">${s.tag}</span>
              <h2 class="text-4xl font-black text-white mt-1">${s.title}</h2>
            </div>
            <span class="text-sm text-blue-200">${s.subtitle}</span>
          </div>

          <!-- 5 Items -->
          <div class="relative z-10 grid grid-cols-5 gap-5 my-auto pt-6">
            ${s.items.map(it => `
              <div class="white-card-elevated p-6 flex flex-col justify-between space-y-3 border-t-4 border-t-cyan-500">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="px-2.5 py-0.5 rounded bg-cyan-100 text-cyan-800 text-[10px] font-black uppercase">${it.badge}</span>
                    <span class="font-mono text-base font-black text-amber-500">${it.num}</span>
                  </div>
                  <h3 class="text-sm font-black text-[#001F54] mb-2 leading-snug">${it.title}</h3>
                  <p class="text-xs text-slate-600 leading-relaxed font-medium">${it.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Footer -->
          <div class="relative z-10 border-t border-white/15 pt-4 flex justify-between text-sm text-cyan-300 font-bold">
            <span>Đột phá công nghệ do Đơn vị phát triển chủ động nghiên cứu tích hợp</span>
            <span class="text-xs text-blue-200 font-medium">Tối ưu trải nghiệm hội viên</span>
          </div>
        </div>
      `;
    }

    if (s.type === 'roadmap') {
      return `
        <div class="slide-page p-16 bg-slate-900 text-white">
          <img src="${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[1px]" alt="Gala" />
          <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
            <path d="M0 720 C 450 580, 900 820, 1440 650 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.9"/>
            <path d="M0 720 C 450 580, 900 820, 1440 650" stroke="#00D2FF" stroke-width="5"/>
          </svg>

          <!-- Header -->
          <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-4">
            <div>
              <span class="text-sm font-black text-cyan-400 uppercase tracking-widest block">${s.tag}</span>
              <h2 class="text-4xl font-black text-white mt-1">${s.title}</h2>
            </div>
            <span class="text-sm text-blue-200">${s.subtitle}</span>
          </div>

          <!-- 4 Steps -->
          <div class="relative z-10 grid grid-cols-4 gap-6 my-auto pt-6">
            ${s.steps.map(st => `
              <div class="white-card-elevated p-6 space-y-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black">${st.phase}</span>
                  <span class="font-mono text-sm font-black text-amber-500">${st.time}</span>
                </div>
                <h3 class="text-base font-black text-[#001F54] mb-2 leading-snug">${st.title}</h3>
                <p class="text-xs text-slate-600 leading-relaxed font-medium">${st.desc}</p>
              </div>
            `).join('')}
          </div>

          <!-- Footer -->
          <div class="relative z-10 border-t border-white/15 pt-4 flex justify-between text-sm text-cyan-300 font-bold">
            <span>Cam kết bảo hành máy chủ 24/7 và đồng hành trọn đời cùng HanoiBA</span>
            <span class="text-xs text-blue-200 font-medium">Hợp tác bền vững vì hội viên</span>
          </div>
        </div>
      `;
    }

    if (s.type === 'closing') {
      return `
        <div class="slide-page p-16 deep-navy-gradient text-white">
          <img src="${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-[0.5px]" alt="Skyline Night" />
          <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
            <path d="M0 650 C 400 500, 850 780, 1440 580 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.85"/>
            <path d="M0 650 C 400 500, 850 780, 1440 580" stroke="#00D2FF" stroke-width="6"/>
          </svg>

          <!-- Top Header -->
          <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-4">
            <div class="flex items-center gap-4">
              <span class="font-black text-white text-lg">▲▼ ĐƠN VỊ PHÁT TRIỂN</span>
              <span class="text-white/40">|</span>
              <span class="font-extrabold text-amber-400 text-base">3 CEO 1983</span>
            </div>
            <span class="px-5 py-2 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase">
              ${s.tag}
            </span>
          </div>

          <!-- Content Card -->
          <div class="relative z-10 my-auto max-w-4xl mx-auto w-full white-card-elevated p-12 text-slate-800 shadow-2xl text-center space-y-6">
            <h2 class="text-4xl font-black text-[#001F54] leading-tight">
              ${s.title}
            </h2>
            <p class="text-sm font-black text-cyan-700 uppercase tracking-widest">
              ${s.subtitle}
            </p>

            <div class="space-y-3 max-w-2xl mx-auto text-left pt-2">
              ${s.bullets.map(b => `
                <div class="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700">
                  <span class="text-emerald-600 font-bold">✓</span>
                  <span>${b}</span>
                </div>
              `).join('')}
            </div>

            <div class="grid grid-cols-2 gap-4 pt-3">
              <div class="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs">
                <div class="text-xs font-bold text-blue-600 uppercase">Cổng Quản Trị Web CRM</div>
                <div class="font-mono font-bold text-blue-900 text-sm mt-0.5">${s.contact.crmUrl}</div>
              </div>
              <div class="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 text-xs">
                <div class="text-xs font-bold text-cyan-700 uppercase">Tải Ứng Dụng Mobile App</div>
                <div class="font-mono font-bold text-cyan-900 text-sm mt-0.5">${s.contact.appUrl}</div>
              </div>
            </div>

            <div class="text-2xl font-bold text-[#001F54] pt-2">
              ${s.closingWish}
            </div>
          </div>

          <!-- Footer -->
          <div class="relative z-10 border-t border-white/15 pt-4 flex justify-between text-sm text-blue-200">
            <span>Hệ sinh thái công nghệ số hóa · HanoiBA 2026</span>
            <span class="text-cyan-300 font-semibold">Trân trọng cảm ơn Ban Lãnh Đạo &amp; Quý Hội Viên!</span>
          </div>
        </div>
      `;
    }

    return '';
  }).join('\n')}
</body>
</html>`;
}

// -------------------------------------------------------------------------
// [C] TẠO POWERPOINT (.PPTX) 16:9 CHO SLIDE MASTER
// -------------------------------------------------------------------------
async function generatePptxDeck(slides, outPath) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'CLB Doanh Nhân CEO 1983';
  pptx.company = 'HanoiBA';
  pptx.title = 'Báo Cáo Tổng Thể Hệ Sinh Thái CEO 1983';

  slides.forEach((s) => {
    const slide = pptx.addSlide();
    slide.background = { color: '001F54' };

    // Header chung
    slide.addText(`CLB DOANH NHÂN CEO 1983  |  ${s.tag}`, {
      x: 0.8,
      y: 0.4,
      w: 11.5,
      h: 0.35,
      fontSize: 10,
      fontFace: 'Arial',
      bold: true,
      color: '00D2FF',
    });

    if (s.type === 'cover') {
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8,
        y: 1.0,
        w: 11.7,
        h: 5.6,
        fill: { color: 'FFFFFF' },
        line: { color: 'E2E8F0', width: 1.5 },
        rectRadius: 0.3,
      });

      slide.addText(s.title, {
        x: 1.2,
        y: 1.4,
        w: 10.9,
        h: 1.2,
        fontSize: 24,
        fontFace: 'Arial',
        bold: true,
        color: '001F54',
      });

      slide.addText(s.subtitle, {
        x: 1.2,
        y: 2.7,
        w: 10.9,
        h: 0.4,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: '0072CE',
      });

      slide.addText(s.description, {
        x: 1.2,
        y: 3.2,
        w: 10.9,
        h: 0.8,
        fontSize: 11,
        fontFace: 'Arial',
        color: '475569',
      });

      slide.addText(`Thời gian: ${s.meetingInfo.time}\nĐịa điểm: ${s.meetingInfo.location}\nNội dung: ${s.meetingInfo.content}`, {
        x: 1.2,
        y: 4.2,
        w: 10.9,
        h: 1.4,
        fontSize: 11,
        fontFace: 'Arial',
        color: '1E293B',
      });
    } else if (s.type === 'two_products') {
      slide.addText(s.title, {
        x: 0.8,
        y: 0.9,
        w: 11.5,
        h: 0.6,
        fontSize: 20,
        fontFace: 'Arial',
        bold: true,
        color: 'FFFFFF',
      });

      // Card CRM
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8,
        y: 1.7,
        w: 5.6,
        h: 5.1,
        fill: { color: 'FFFFFF' },
        line: { color: '0072CE', width: 2 },
        rectRadius: 0.2,
      });

      slide.addText(s.crm.title, {
        x: 1.1,
        y: 2.0,
        w: 5.0,
        h: 0.5,
        fontSize: 14,
        fontFace: 'Arial',
        bold: true,
        color: '001F54',
      });

      slide.addText(s.crm.target, {
        x: 1.1,
        y: 2.5,
        w: 5.0,
        h: 0.4,
        fontSize: 10,
        fontFace: 'Arial',
        bold: true,
        color: '0072CE',
      });

      slide.addText(s.crm.bullets.map(b => `✓  ${b}`).join('\n\n'), {
        x: 1.1,
        y: 3.0,
        w: 5.0,
        h: 3.5,
        fontSize: 11,
        fontFace: 'Arial',
        color: '334155',
      });

      // Card App
      slide.addShape(pptx.ShapeType.rect, {
        x: 6.8,
        y: 1.7,
        w: 5.6,
        h: 5.1,
        fill: { color: 'FFFFFF' },
        line: { color: 'F59E0B', width: 2 },
        rectRadius: 0.2,
      });

      slide.addText(s.app.title, {
        x: 7.1,
        y: 2.0,
        w: 5.0,
        h: 0.5,
        fontSize: 14,
        fontFace: 'Arial',
        bold: true,
        color: '001F54',
      });

      slide.addText(s.app.target, {
        x: 7.1,
        y: 2.5,
        w: 5.0,
        h: 0.4,
        fontSize: 10,
        fontFace: 'Arial',
        bold: true,
        color: 'B45309',
      });

      slide.addText(s.app.bullets.map(b => `★  ${b}`).join('\n\n'), {
        x: 7.1,
        y: 3.0,
        w: 5.0,
        h: 3.5,
        fontSize: 11,
        fontFace: 'Arial',
        color: '334155',
      });
    } else if (s.type === 'three_requirements') {
      slide.addText(s.title, {
        x: 0.8,
        y: 0.9,
        w: 11.5,
        h: 0.6,
        fontSize: 20,
        fontFace: 'Arial',
        bold: true,
        color: 'FFFFFF',
      });

      s.cols.forEach((c, idx) => {
        const xPos = 0.8 + idx * 3.9;
        slide.addShape(pptx.ShapeType.rect, {
          x: xPos,
          y: 1.7,
          w: 3.6,
          h: 5.1,
          fill: { color: 'FFFFFF' },
          line: { color: 'E2E8F0', width: 1.5 },
          rectRadius: 0.2,
        });

        slide.addText(`${c.num}. ${c.title}`, {
          x: xPos + 0.2,
          y: 2.0,
          w: 3.2,
          h: 0.8,
          fontSize: 13,
          fontFace: 'Arial',
          bold: true,
          color: '001F54',
        });

        slide.addText(`Thách thức cũ:\n${c.problem}`, {
          x: xPos + 0.2,
          y: 2.9,
          w: 3.2,
          h: 1.8,
          fontSize: 10,
          fontFace: 'Arial',
          color: '991B1B',
        });

        slide.addText(`Giải pháp công nghệ:\n${c.solution}`, {
          x: xPos + 0.2,
          y: 4.8,
          w: 3.2,
          h: 1.8,
          fontSize: 10,
          fontFace: 'Arial',
          bold: true,
          color: '065F46',
        });
      });
    } else if (s.type === 'features_gallery') {
      slide.addText(s.title, {
        x: 0.8,
        y: 0.9,
        w: 11.5,
        h: 0.6,
        fontSize: 20,
        fontFace: 'Arial',
        bold: true,
        color: 'FFFFFF',
      });

      s.features.forEach((f, idx) => {
        const xPos = 0.8 + idx * 2.95;
        slide.addShape(pptx.ShapeType.rect, {
          x: xPos,
          y: 1.7,
          w: 2.75,
          h: 5.1,
          fill: { color: 'FFFFFF' },
          line: { color: 'E2E8F0', width: 1.5 },
          rectRadius: 0.2,
        });

        const imgPath = path.resolve(DOC_DIR, f.imgFile);
        if (fs.existsSync(imgPath)) {
          slide.addImage({
            path: imgPath,
            x: xPos + 0.15,
            y: 1.9,
            w: 2.45,
            h: 2.2,
          });
        }

        slide.addText(f.title, {
          x: xPos + 0.15,
          y: 4.3,
          w: 2.45,
          h: 0.7,
          fontSize: 11,
          fontFace: 'Arial',
          bold: true,
          color: '001F54',
        });

        slide.addText(f.desc, {
          x: xPos + 0.15,
          y: 5.0,
          w: 2.45,
          h: 1.6,
          fontSize: 9.5,
          fontFace: 'Arial',
          color: '475569',
        });
      });
    } else if (s.type === 'breakthroughs') {
      slide.addText(s.title, {
        x: 0.8,
        y: 0.9,
        w: 11.5,
        h: 0.6,
        fontSize: 20,
        fontFace: 'Arial',
        bold: true,
        color: 'FFFFFF',
      });

      s.items.forEach((it, idx) => {
        const xPos = 0.8 + idx * 2.35;
        slide.addShape(pptx.ShapeType.rect, {
          x: xPos,
          y: 1.7,
          w: 2.2,
          h: 5.1,
          fill: { color: 'FFFFFF' },
          line: { color: '00D2FF', width: 2 },
          rectRadius: 0.2,
        });

        slide.addText(`${it.num}. ${it.title}`, {
          x: xPos + 0.15,
          y: 2.0,
          w: 1.9,
          h: 0.8,
          fontSize: 11,
          fontFace: 'Arial',
          bold: true,
          color: '001F54',
        });

        slide.addText(it.desc, {
          x: xPos + 0.15,
          y: 3.0,
          w: 1.9,
          h: 3.5,
          fontSize: 9.5,
          fontFace: 'Arial',
          color: '334155',
        });
      });
    } else if (s.type === 'roadmap') {
      slide.addText(s.title, {
        x: 0.8,
        y: 0.9,
        w: 11.5,
        h: 0.6,
        fontSize: 20,
        fontFace: 'Arial',
        bold: true,
        color: 'FFFFFF',
      });

      s.steps.forEach((st, idx) => {
        const xPos = 0.8 + idx * 2.95;
        slide.addShape(pptx.ShapeType.rect, {
          x: xPos,
          y: 1.7,
          w: 2.75,
          h: 5.1,
          fill: { color: 'FFFFFF' },
          line: { color: 'E2E8F0', width: 1.5 },
          rectRadius: 0.2,
        });

        slide.addText(`${st.phase}\n(${st.time})`, {
          x: xPos + 0.15,
          y: 2.0,
          w: 2.45,
          h: 0.6,
          fontSize: 11,
          fontFace: 'Arial',
          bold: true,
          color: 'F59E0B',
        });

        slide.addText(st.title, {
          x: xPos + 0.15,
          y: 2.7,
          w: 2.45,
          h: 0.7,
          fontSize: 12,
          fontFace: 'Arial',
          bold: true,
          color: '001F54',
        });

        slide.addText(st.desc, {
          x: xPos + 0.15,
          y: 3.5,
          w: 2.45,
          h: 3.0,
          fontSize: 10,
          fontFace: 'Arial',
          color: '475569',
        });
      });
    } else if (s.type === 'closing') {
      slide.addShape(pptx.ShapeType.rect, {
        x: 1.5,
        y: 1.2,
        w: 10.3,
        h: 5.2,
        fill: { color: 'FFFFFF' },
        line: { color: 'E2E8F0', width: 1.5 },
        rectRadius: 0.3,
      });

      slide.addText(s.title, {
        x: 1.8,
        y: 1.6,
        w: 9.7,
        h: 0.8,
        fontSize: 22,
        fontFace: 'Arial',
        bold: true,
        color: '001F54',
        align: 'center',
      });

      slide.addText(s.subtitle, {
        x: 1.8,
        y: 2.4,
        w: 9.7,
        h: 0.4,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: '0072CE',
        align: 'center',
      });

      slide.addText(s.bullets.map(b => `✓  ${b}`).join('\n'), {
        x: 2.2,
        y: 3.0,
        w: 8.9,
        h: 1.5,
        fontSize: 12,
        fontFace: 'Arial',
        color: '334155',
      });

      slide.addText(`Cổng CRM: ${s.contact.crmUrl}   |   Tải App: ${s.contact.appUrl}   |   Hotline: ${s.contact.hotline}`, {
        x: 1.8,
        y: 4.8,
        w: 9.7,
        h: 0.5,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: '001F54',
        align: 'center',
      });

      slide.addText(s.closingWish, {
        x: 1.8,
        y: 5.4,
        w: 9.7,
        h: 0.5,
        fontSize: 13,
        fontFace: 'Arial',
        bold: true,
        color: '0072CE',
        align: 'center',
      });
    }
  });

  await pptx.writeFile({ fileName: outPath });
}

// -------------------------------------------------------------------------
// [D] TẠO TÀI LIỆU MARKDOWN CHO SLIDE MASTER
// -------------------------------------------------------------------------
function generateMarkdownDoc(slides) {
  let md = `# BÁO CÁO TỔNG THỂ HỆ SINH THÁI SỐ CLB DOANH NHÂN CEO 1983 (HANOIBA)\n\n`;
  md += `*Thời gian cập nhật*: Thứ Tư, 21/10/2026\n`;
  md += `*Đơn vị phát triển*: Đơn vị công nghệ theo đặt hàng từ Ban Lãnh Đạo CLB CEO 1983\n\n---\n\n`;

  slides.forEach((s) => {
    md += `## Slide ${s.id}: ${s.title}\n`;
    md += `**Chuyên mục**: ${s.tag} | *${s.subtitle}*\n\n`;

    if (s.description) md += `${s.description}\n\n`;

    if (s.meetingInfo) {
      md += `- **Thời gian**: ${s.meetingInfo.time}\n`;
      md += `- **Địa điểm**: ${s.meetingInfo.location}\n`;
      md += `- **Nội dung**: ${s.meetingInfo.content}\n`;
      md += `- **Giao lưu**: ${s.meetingInfo.lunch}\n\n`;
    }

    if (s.crm) {
      md += `### ${s.crm.title}\n*${s.crm.target}*\n`;
      s.crm.bullets.forEach((b) => (md += `- ${b}\n`));
      md += `\n`;
    }

    if (s.app) {
      md += `### ${s.app.title}\n*${s.app.target}*\n`;
      s.app.bullets.forEach((b) => (md += `- ${b}\n`));
      md += `\n`;
    }

    if (s.cols) {
      s.cols.forEach((c) => {
        md += `### ${c.num}. ${c.title}\n`;
        md += `- **Thách thức cũ**: ${c.problem}\n`;
        md += `- **Giải pháp công nghệ**: ${c.solution}\n\n`;
      });
    }

    if (s.features) {
      s.features.forEach((f) => {
        md += `### ${f.title}\n`;
        md += `${f.desc}\n`;
        md += `*Hình ảnh thực tế live*: \`${f.imgFile}\`\n\n`;
      });
    }

    if (s.items) {
      s.items.forEach((it) => {
        md += `### ${it.num}. ${it.title} [${it.badge}]\n`;
        md += `${it.desc}\n\n`;
      });
    }

    if (s.steps) {
      s.steps.forEach((st) => {
        md += `### ${st.phase} (${st.time}): ${st.title}\n`;
        md += `${st.desc}\n\n`;
      });
    }

    if (s.bullets) {
      s.bullets.forEach((b) => (md += `- ${b}\n`));
      md += `\n`;
    }

    md += `---\n\n`;
  });

  return md;
}

// =========================================================================
// [PHẦN 2] TẠO POSTER 3D DÀNH RIÊNG CHO APP CEO 1983 (MỤC 2)
// =========================================================================
function generatePosterAppHtml() {
  const imgBg = getBase64Image(path.join(DOC_DIR, 'images/backgrounds/01_skyline_lake.jpg'));
  const imgCard = getBase64Image(path.join(LIVE_IMG_DIR, 'app_02_the_hoivien_so_vip.png'));
  const imgB2b = getBase64Image(path.join(LIVE_IMG_DIR, 'app_04_san_giaothuong_b2b.png'));
  const imgEvent = getBase64Image(path.join(LIVE_IMG_DIR, 'app_05_sukien_ve_dien_tu.png'));

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Poster 3D CEO 1983 Mobile App | HanoiBA</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page {
      size: 1400px 2000px;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      margin: 0;
      padding: 0;
      background: #00122E;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #0F172A;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .poster-canvas {
      width: 1400px;
      height: 2000px;
      position: relative;
      overflow: hidden;
      background: linear-gradient(165deg, #000E26 0%, #001F54 30%, #003B95 70%, #001438 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 70px 80px;
      box-shadow: 0 40px 100px rgba(0, 0, 0, 0.7);
    }
    .poster-bg-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-cover: cover;
      opacity: 0.12;
      filter: blur(2px);
      pointer-events: none;
    }
    .cyan-ambient-glow {
      position: absolute;
      width: 700px;
      height: 700px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 210, 255, 0.22) 0%, rgba(0, 210, 255, 0) 70%);
      pointer-events: none;
      filter: blur(50px);
    }
    .phone-mockup-3d {
      position: relative;
      border-radius: 46px;
      padding: 12px;
      background: linear-gradient(145deg, #1E293B, #0F172A);
      border: 3px solid rgba(255, 255, 255, 0.25);
      box-shadow: 
        0 40px 80px -15px rgba(0, 10, 30, 0.8),
        0 0 40px rgba(0, 210, 255, 0.35),
        inset 0 0 10px rgba(255, 255, 255, 0.15);
      transition: transform 0.4s ease;
    }
    .phone-screen {
      width: 100%;
      height: 100%;
      border-radius: 36px;
      overflow: hidden;
      background: #000;
      position: relative;
    }
    .phone-notch {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 24px;
      background: #000;
      border-radius: 20px;
      z-index: 30;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .white-card-info {
      background: rgba(255, 255, 255, 0.97);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.9);
      border-radius: 24px;
      box-shadow: 0 20px 40px rgba(0, 20, 60, 0.25);
    }
  </style>
</head>
<body>
  <div class="poster-canvas text-white">
    <!-- Ambient glowing spheres -->
    <img src="${imgBg}" class="poster-bg-img" alt="Background" />
    <div class="cyan-ambient-glow" style="top: 100px; left: -100px;"></div>
    <div class="cyan-ambient-glow" style="bottom: 150px; right: -150px;"></div>

    <!-- Sóng ánh sáng cyan 3D -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1400 2000" fill="none">
      <path d="M-100 1350 C 300 1150, 800 1550, 1500 1250" stroke="#00D2FF" stroke-width="6" opacity="0.6" stroke-linecap="round"/>
      <path d="M-100 1450 C 400 1300, 900 1650, 1500 1380" stroke="#0080FF" stroke-width="4" opacity="0.4" stroke-linecap="round"/>
    </svg>

    <!-- HEADER POSTER -->
    <div class="relative z-10 flex flex-col items-center text-center space-y-4">
      <div class="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-extrabold text-sm tracking-wider uppercase backdrop-blur-md">
        <span>✦ HỆ SINH THÁI ỨNG DỤNG DI ĐỘNG DÀNH RIÊNG CHO DOANH NHÂN ✦</span>
      </div>

      <div class="flex items-center justify-center gap-4 pt-1">
        <div class="h-14 px-6 rounded-2xl bg-white text-[#001F54] font-black flex items-center gap-2.5 shadow-2xl text-xl">
          <span class="text-blue-600">▲▼</span>
          <span class="tracking-wide">HANOIBA</span>
        </div>
        <div class="h-10 w-0.5 bg-white/30"></div>
        <div class="h-14 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black flex items-center gap-2.5 shadow-2xl text-xl">
          <span class="text-white">3</span>
          <span class="tracking-wide">CEO 1983</span>
        </div>
      </div>

      <h1 class="text-6xl font-black tracking-tight text-white pt-2 leading-tight">
        VĂN PHÒNG DOANH NHÂN BỎ TÚI
      </h1>
      <p class="text-xl font-bold text-cyan-300 uppercase tracking-widest max-w-4xl">
        KẾT NỐI KHÔNG GIỚI HẠN · GIAO THƯƠNG ĐẶC QUYỀN · VẬN HÀNH THÔNG MINH
      </p>
      <p class="text-slate-300 text-base max-w-3xl font-medium leading-relaxed">
        Giải pháp chuyển đổi số toàn diện hỗ trợ hơn 500 Chủ tịch &amp; CEO hội viên kết nối kinh doanh, trao đổi danh thiếp số 1 chạm và tiếp cận đặc quyền sự kiện đẳng cấp.
      </p>
    </div>

    <!-- KHU VỰC TRUNG TÂM: 3 MÀN HÌNH CHÍNH 3D NỔI BẬT -->
    <div class="relative z-10 my-auto py-8">
      <div class="grid grid-cols-3 gap-8 items-center justify-center">

        <!-- MÀN 1 (BÊN TRÁI 3D): THẺ HỘI VIÊN VIP & SMART QR -->
        <div class="flex flex-col items-center space-y-5" style="transform: perspective(1000px) rotateY(12deg) rotateX(4deg);">
          <div class="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200 text-xs font-black uppercase tracking-wider">
            CHỨC NĂNG 01
          </div>

          <div class="phone-mockup-3d w-[350px] h-[680px]">
            <div class="phone-notch">
              <span class="w-3 h-3 rounded-full bg-cyan-500/50"></span>
            </div>
            <div class="phone-screen">
              <img src="${imgCard}" class="w-full h-full object-cover object-top" alt="Thẻ Hội Viên VIP" />
            </div>
          </div>

          <div class="white-card-info p-5 text-slate-800 text-center w-[350px] space-y-2">
            <h3 class="text-base font-black text-[#001F54] uppercase tracking-wide">
              Thẻ Hội Viên Số VIP &amp; QR
            </h3>
            <ul class="text-left text-xs space-y-1.5 text-slate-600 font-semibold">
              <li class="flex items-start gap-2">
                <span class="text-blue-600 font-bold">✓</span>
                <span>Định danh hội viên chính thức HanoiBA</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-blue-600 font-bold">✓</span>
                <span>Trao đổi danh thiếp số 1 chạm không cần app</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-blue-600 font-bold">✓</span>
                <span>Lưu thông tin thẳng vào danh bạ điện thoại</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- MÀN 2 (CHÍNH GIỮA 3D VƯƠN CAO): SÀN GIAO THƯƠNG B2B -->
        <div class="flex flex-col items-center space-y-5 z-20" style="transform: scale(1.08) translateY(-15px);">
          <div class="inline-block px-5 py-2 rounded-full bg-amber-500/25 border border-amber-400 text-amber-300 text-xs font-black uppercase tracking-wider shadow-lg">
            ★ CHỨC NĂNG TRỌNG TÂM 02 ★
          </div>

          <div class="phone-mockup-3d w-[370px] h-[720px] border-amber-400/50" style="box-shadow: 0 45px 90px -10px rgba(0, 15, 45, 0.9), 0 0 50px rgba(245, 158, 11, 0.35);">
            <div class="phone-notch">
              <span class="w-3 h-3 rounded-full bg-amber-500/60"></span>
            </div>
            <div class="phone-screen">
              <img src="${imgB2b}" class="w-full h-full object-cover object-top" alt="Sàn Giao Thương B2B" />
            </div>
          </div>

          <div class="white-card-info p-6 text-slate-800 text-center w-[370px] space-y-2 border-2 border-amber-400/60 shadow-2xl">
            <h3 class="text-lg font-black text-[#001F54] uppercase tracking-wide">
              Sàn Giao Thương B2B Nội Khối
            </h3>
            <ul class="text-left text-xs space-y-2 text-slate-700 font-semibold">
              <li class="flex items-start gap-2">
                <span class="text-amber-500 font-black">★</span>
                <span>Niêm yết giải pháp &amp; ưu đãi đặc quyền 500+ CEO</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-amber-500 font-black">★</span>
                <span>Đăng cơ hội hợp tác kinh doanh 11 ngành nghề</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-amber-500 font-black">★</span>
                <span>Hẹn gặp cà phê kết nối 1-on-1 bảo mật riêng tư</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- MÀN 3 (BÊN PHẢI 3D): VÍ VÉ SỰ KIỆN GALA & CHECK-IN -->
        <div class="flex flex-col items-center space-y-5" style="transform: perspective(1000px) rotateY(-12deg) rotateX(4deg);">
          <div class="inline-block px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-black uppercase tracking-wider">
            CHỨC NĂNG 03
          </div>

          <div class="phone-mockup-3d w-[350px] h-[680px]">
            <div class="phone-notch">
              <span class="w-3 h-3 rounded-full bg-cyan-500/50"></span>
            </div>
            <div class="phone-screen">
              <img src="${imgEvent}" class="w-full h-full object-cover object-top" alt="Ví Sự Kiện Gala" />
            </div>
          </div>

          <div class="white-card-info p-5 text-slate-800 text-center w-[350px] space-y-2">
            <h3 class="text-base font-black text-[#001F54] uppercase tracking-wide">
              Ví Sự Kiện Gala &amp; Vé QR
            </h3>
            <ul class="text-left text-xs space-y-1.5 text-slate-600 font-semibold">
              <li class="flex items-start gap-2">
                <span class="text-cyan-600 font-bold">✓</span>
                <span>Lưu vé mời điện tử, biết trước số bàn &amp; số ghế VIP</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-cyan-600 font-bold">✓</span>
                <span>Đón tiếp check-in siêu tốc trong 1 giây qua QR</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-cyan-600 font-bold">✓</span>
                <span>Tự động kích hoạt mã bốc thăm may mắn công khai</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>

    <!-- 3 TIỆN ÍCH CÔNG NGHỆ NỀN TẢNG BÊN DƯỚI -->
    <div class="relative z-10 grid grid-cols-3 gap-6 pt-2">
      <div class="white-card-info p-5 text-slate-800 flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl shrink-0">
          ⚡
        </div>
        <div>
          <h4 class="text-sm font-black text-[#001F54]">Đồng Bộ Tức Thời</h4>
          <p class="text-[11px] text-slate-600 font-medium">Kết nối trực tiếp Cổng Quản Trị Web CRM không độ trễ</p>
        </div>
      </div>

      <div class="white-card-info p-5 text-slate-800 flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-black text-xl shrink-0">
          🔒
        </div>
        <div>
          <h4 class="text-sm font-black text-[#001F54]">Bảo Mật Sinh Trắc Học</h4>
          <p class="text-[11px] text-slate-600 font-medium">Xác thực FaceID, vân tay và mã hóa dữ liệu đa lớp</p>
        </div>
      </div>

      <div class="white-card-info p-5 text-slate-800 flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xl shrink-0">
          🌐
        </div>
        <div>
          <h4 class="text-sm font-black text-[#001F54]">Đa Nền Tảng iOS &amp; Android</h4>
          <p class="text-[11px] text-slate-600 font-medium">Hỗ trợ thông báo đẩy và hoạt động mượt mà offline</p>
        </div>
      </div>
    </div>

    <!-- FOOTER POSTER (Không có chữ vàng bên phải) -->
    <div class="relative z-10 border-t border-white/20 pt-6 flex items-center justify-between text-xs text-blue-200">
      <div class="flex items-center gap-3">
        <span class="font-bold text-white text-sm">CLB DOANH NHÂN CEO 1983 (HANOIBA)</span>
        <span class="text-white/40">|</span>
        <span class="text-slate-300">Đơn vị phát triển hệ thống công nghệ số</span>
      </div>

      <div class="flex items-center gap-6">
        <div class="text-right">
          <div class="text-slate-300">Trải nghiệm ứng dụng tại:</div>
          <div class="font-mono font-bold text-cyan-300 text-sm">https://ceo1983.viconnect.vn</div>
        </div>
        <div class="text-right pl-4 border-l border-white/20">
          <div class="text-slate-300">Hotline kỹ thuật 24/7:</div>
          <div class="font-mono font-bold text-white text-sm">0983 1983 83</div>
        </div>
      </div>
    </div>

  </div>
</body>
</html>`;
}

// =========================================================================
// [PHẦN 3] TẠO PROFILE CHO HỆ THỐNG CRM QUẢN TRỊ (MỤC 2 - 6 CHỨC NĂNG)
// =========================================================================
function generateProfileCrmHtml() {
  const imgBg = getBase64Image(path.join(DOC_DIR, 'images/backgrounds/04_operations.jpg'));
  const imgBi = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_02_thongke_baocao_bi.png'));
  const imgMember = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_03_quanly_hoivien_360.png'));
  const imgGala = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_04_quanly_sukien_gala.png'));
  const imgFinance = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_06_baocao_taichinh_thuchi.png'));
  const imgTraining = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_05_chuongtrinh_daotao.png'));
  const imgTasks = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_08_giaoviec_ban_dieuhanh.png'));

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Profile Hệ Thống Web CRM CEO 1983 | HanoiBA</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page {
      size: 1920px 1080px;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      margin: 0;
      padding: 0;
      background: #00122E;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #0F172A;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .profile-canvas {
      width: 1920px;
      height: 1080px;
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, #001026 0%, #001F54 45%, #003B95 85%, #001438 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 50px 70px;
      box-shadow: 0 40px 100px rgba(0, 0, 0, 0.7);
    }
    .profile-bg-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.15;
      filter: blur(2px);
      pointer-events: none;
    }
    .cyan-glow-wave {
      filter: drop-shadow(0 0 20px rgba(0, 210, 255, 0.75));
    }
    .white-card-3d {
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.9);
      border-radius: 22px;
      box-shadow: 
        0 20px 40px -10px rgba(0, 25, 70, 0.35),
        0 0 20px rgba(0, 210, 255, 0.15);
      transition: transform 0.3s ease;
    }
  </style>
</head>
<body>
  <div class="profile-canvas text-white">
    <img src="${imgBg}" class="profile-bg-img" alt="Background" />

    <!-- Dải sóng ánh sáng cyan phát sáng chuẩn Ảnh 1 -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1920 1080" fill="none">
      <path d="M0 800 C 500 650, 1100 950, 1920 720 L 1920 1080 L 0 1080 Z" fill="#001F54" opacity="0.85"/>
      <path d="M0 800 C 500 650, 1100 950, 1920 720" stroke="#00D2FF" stroke-width="5"/>
      <path d="M0 880 C 600 750, 1200 1020, 1920 820" stroke="#0080FF" stroke-width="3" opacity="0.5"/>
    </svg>

    <!-- HEADER PROFILE -->
    <div class="relative z-10 flex items-center justify-between border-b border-white/20 pb-4">
      <div class="flex items-center gap-4">
        <div class="h-12 px-5 rounded-2xl bg-white text-[#001F54] font-black flex items-center gap-2 shadow-xl text-lg">
          <span class="text-blue-600">▲▼</span>
          <span class="tracking-wide">HANOIBA</span>
        </div>
        <div class="h-8 w-px bg-white/30"></div>
        <div class="h-12 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black flex items-center gap-2 shadow-xl text-lg">
          <span class="text-white">3</span>
          <span class="tracking-wide">CEO 1983 CRM</span>
        </div>
        <div class="pl-3 border-l border-white/20">
          <h1 class="text-2xl font-black text-white tracking-tight">HỆ THỐNG QUẢN TRỊ ĐIỀU HÀNH TRUNG TÂM (WEB CRM)</h1>
          <p class="text-xs text-cyan-300 font-semibold uppercase tracking-wider">CÔNG CỤ ĐIỀU HÀNH THỰC CHIẾN CỦA BAN CHỦ NHIỆM &amp; 6 BAN CHUYÊN MÔN</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <span class="px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase tracking-wider">
          ✦ 6 CHỨC NĂNG CỐT LÕI ✦
        </span>
        <span class="px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-mono font-bold">
          Phiên bản 2026
        </span>
      </div>
    </div>

    <!-- 6 KHỐI CHỨC NĂNG NỔI BẬT NHẤT (GRID 3 CỘT X 2 HÀNG) -->
    <div class="relative z-10 grid grid-cols-3 gap-6 my-auto pt-4">

      <!-- 1. DASHBOARD & THỐNG KÊ BI -->
      <div class="white-card-3d p-4 flex flex-col justify-between space-y-3">
        <div class="w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative shadow-inner">
          <img src="${imgBi}" class="w-full h-full object-cover object-top" alt="Dashboard BI" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-mono text-[10px] font-black shadow-md">
            01 · ANALYTICS BI
          </span>
        </div>
        <div>
          <h3 class="text-sm font-black text-[#001F54]">1. Dashboard &amp; Thống Kê BI Toàn Cảnh</h3>
          <p class="text-[11.5px] text-slate-600 font-medium leading-relaxed mt-1">
            Đo lường sức khỏe hiệp hội, phân tích cơ cấu 500+ doanh nhân theo 11 ngành nghề, biểu đồ biến động hội viên và theo dõi tương tác thời gian thực.
          </p>
        </div>
      </div>

      <!-- 2. QUẢN LÝ HỘI VIÊN 360 & RBAC -->
      <div class="white-card-3d p-4 flex flex-col justify-between space-y-3">
        <div class="w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative shadow-inner">
          <img src="${imgMember}" class="w-full h-full object-cover object-top" alt="Hội Viên 360" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-black shadow-md">
            02 · MEMBER 360°
          </span>
        </div>
        <div>
          <h3 class="text-sm font-black text-[#001F54]">2. Quản Trị Hội Viên 360° &amp; Phân Quyền RBAC</h3>
          <p class="text-[11.5px] text-slate-600 font-medium leading-relaxed mt-1">
            Số hóa hồ sơ pháp lý, mã số thuế, năng lực cốt lõi của hội viên; thẩm định kết nạp minh bạch và phân quyền đúng chức năng của 6 ban chuyên môn.
          </p>
        </div>
      </div>

      <!-- 3. SỰ KIỆN GALA & SƠ ĐỒ BÀN TIỆC -->
      <div class="white-card-3d p-4 flex flex-col justify-between space-y-3">
        <div class="w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative shadow-inner">
          <img src="${imgGala}" class="w-full h-full object-cover object-top" alt="Sự Kiện Gala" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-purple-600 text-white font-mono text-[10px] font-black shadow-md">
            03 · GALA EVENTS
          </span>
        </div>
        <div>
          <h3 class="text-sm font-black text-[#001F54]">3. Quản Lý Sự Kiện &amp; Sơ Đồ Bàn Tiệc Gala</h3>
          <p class="text-[11.5px] text-slate-600 font-medium leading-relaxed mt-1">
            Thiết kế sơ đồ khán phòng, xếp vị trí bàn tiệc VIP khoa học, đón tiếp đại biểu bằng vé điện tử QR 1 giây và vòng quay may mắn công khai.
          </p>
        </div>
      </div>

      <!-- 4. QUẢN LÝ TÀI CHÍNH & HỘI PHÍ VIETQR -->
      <div class="white-card-3d p-4 flex flex-col justify-between space-y-3">
        <div class="w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative shadow-inner">
          <img src="${imgFinance}" class="w-full h-full object-cover object-top" alt="Tài Chính Thu Chi" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-mono text-[10px] font-black shadow-md">
            04 · FINANCE &amp; QR
          </span>
        </div>
        <div>
          <h3 class="text-sm font-black text-[#001F54]">4. Quản Lý Thu Chi &amp; Sổ Quỹ Tự Động VietQR</h3>
          <p class="text-[11.5px] text-slate-600 font-medium leading-relaxed mt-1">
            Tự động tạo mã VietQR thu phí đúng số tiền; đối soát dòng tiền ngân hàng tức thời, quản lý tài trợ và báo cáo tài chính minh bạch cho lãnh đạo.
          </p>
        </div>
      </div>

      <!-- 5. CHƯƠNG TRÌNH ĐÀO TẠO & KHO TRI THỨC -->
      <div class="white-card-3d p-4 flex flex-col justify-between space-y-3">
        <div class="w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative shadow-inner">
          <img src="${imgTraining}" class="w-full h-full object-cover object-top" alt="Chương Trình Đào Tạo" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-cyan-600 text-white font-mono text-[10px] font-black shadow-md">
            05 · ACADEMY HUB
          </span>
        </div>
        <div>
          <h3 class="text-sm font-black text-[#001F54]">5. Quản Lý Đào Tạo Doanh Nhân &amp; Tri Thức Số</h3>
          <p class="text-[11.5px] text-slate-600 font-medium leading-relaxed mt-1">
            Tổ chức các khóa đào tạo quản trị chuyên đề, điểm danh học viên qua QR, lưu trữ kho video bài giảng, biểu mẫu chuẩn hóa và khảo sát sau đào tạo.
          </p>
        </div>
      </div>

      <!-- 6. GIAO VIỆC KANBAN & ĐIỀU HÀNH 6 BAN -->
      <div class="white-card-3d p-4 flex flex-col justify-between space-y-3">
        <div class="w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative shadow-inner">
          <img src="${imgTasks}" class="w-full h-full object-cover object-top" alt="Giao Việc Kanban" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-black shadow-md">
            06 · KANBAN OPS
          </span>
        </div>
        <div>
          <h3 class="text-sm font-black text-[#001F54]">6. Giao Việc Kanban &amp; Điều Hành 6 Ban Chuyên Môn</h3>
          <p class="text-[11.5px] text-slate-600 font-medium leading-relaxed mt-1">
            Phân công công việc theo ban, giám sát tiến độ theo thời hạn, quản lý lịch họp ban điều hành và lưu trữ kho biên bản cuộc họp lãnh đạo.
          </p>
        </div>
      </div>

    </div>

    <!-- FOOTER PROFILE (Không có chữ vàng bên phải) -->
    <div class="relative z-10 border-t border-white/20 pt-4 flex items-center justify-between text-xs text-blue-200">
      <div class="flex items-center gap-3">
        <span class="font-bold text-white text-sm">HỆ THỐNG ĐIỀU HÀNH CLB DOANH NHÂN CEO 1983 (HANOIBA)</span>
        <span class="text-white/40">|</span>
        <span class="text-slate-300">Đơn vị phát triển hệ thống công nghệ</span>
      </div>

      <div class="flex items-center gap-6">
        <div class="text-right">
          <div class="text-slate-300">Truy cập Cổng Quản Trị Web CRM:</div>
          <div class="font-mono font-bold text-cyan-300 text-sm">https://crm.ceo1983.viconnect.vn</div>
        </div>
        <div class="text-right pl-4 border-l border-white/20">
          <div class="text-slate-300">Hỗ trợ kỹ thuật Ban Thư Ký:</div>
          <div class="font-mono font-bold text-white text-sm">0983 1983 83</div>
        </div>
      </div>
    </div>

  </div>
</body>
</html>`;
}

// =========================================================================
// [MAIN EXECUTION]
// =========================================================================
async function main() {
  console.log('=====================================================================');
  console.log('BẮT ĐẦU GENERATE TOÀN BỘ SLIDE, POSTER 3D & PROFILE CRM CEO 1983');
  console.log('=====================================================================');

  // 1. TẠO SLIDE TỔNG THỂ HỆ SINH THÁI CEO 1983
  console.log('\n>>> [1/3] Tạo SLIDE_TONG_THE_HE_SINH_THAI_CEO1983 (HTML, PDF, PPTX, MD)...');
  
  // 1.1 HTML Slide tương tác
  const slideHtml = generateSlidesHtml(SLIDES_MASTER);
  const outSlideHtml = path.join(DOC_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.html');
  const outSlideFeHtml = path.join(FE_DOCS_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.html');
  fs.writeFileSync(outSlideHtml, slideHtml, 'utf8');
  fs.writeFileSync(outSlideFeHtml, slideHtml, 'utf8');
  console.log('✓ Đã ghi file HTML Slide:', outSlideHtml);

  // 1.2 Markdown Slide
  const slideMd = generateMarkdownDoc(SLIDES_MASTER);
  const outSlideMd = path.join(DOC_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.md');
  fs.writeFileSync(outSlideMd, slideMd, 'utf8');
  console.log('✓ Đã ghi file Markdown Slide:', outSlideMd);

  // 1.3 PPTX Slide
  const outSlidePptx = path.join(DOC_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pptx');
  const outSlideFePptx = path.join(FE_DOCS_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pptx');
  await generatePptxDeck(SLIDES_MASTER, outSlidePptx);
  fs.copyFileSync(outSlidePptx, outSlideFePptx);
  console.log('✓ Đã tạo file PPTX Slide:', outSlidePptx);

  // 2. TẠO POSTER 3D CHO APP CEO 1983
  console.log('\n>>> [2/3] Tạo POSTER_APP_CEO1983_3D (HTML, PDF, PNG)...');
  const posterHtml = generatePosterAppHtml();
  const outPosterHtml = path.join(DOC_DIR, 'POSTER_APP_CEO1983_3D.html');
  const outPosterFeHtml = path.join(FE_DOCS_DIR, 'POSTER_APP_CEO1983_3D.html');
  fs.writeFileSync(outPosterHtml, posterHtml, 'utf8');
  fs.writeFileSync(outPosterFeHtml, posterHtml, 'utf8');
  console.log('✓ Đã ghi file HTML Poster:', outPosterHtml);

  // 3. TẠO PROFILE 3D CHO CRM QUẢN TRỊ
  console.log('\n>>> [3/3] Tạo PROFILE_CRM_QUAN_TRI_CEO1983 (HTML, PDF, PNG)...');
  const profileHtml = generateProfileCrmHtml();
  const outProfileHtml = path.join(DOC_DIR, 'PROFILE_CRM_QUAN_TRI_CEO1983.html');
  const outProfileFeHtml = path.join(FE_DOCS_DIR, 'PROFILE_CRM_QUAN_TRI_CEO1983.html');
  fs.writeFileSync(outProfileHtml, profileHtml, 'utf8');
  fs.writeFileSync(outProfileFeHtml, profileHtml, 'utf8');
  console.log('✓ Đã ghi file HTML Profile:', outProfileHtml);

  // 4. KHỞI CHẠY PLAYWRIGHT RENDER PDF VÀ PNG
  console.log('\n>>> [4/4] Đang dùng Playwright render PDF và PNG chất lượng cao...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // 4.1 Render SLIDE DECK MULTI-PAGE PDF
  const printDeckHtml = generatePrintableDeckHtml(SLIDES_MASTER);
  const tempDeckPath = path.join(DOC_DIR, '_temp_deck_print.html');
  fs.writeFileSync(tempDeckPath, printDeckHtml, 'utf8');

  const slidePage = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });
  await slidePage.goto('file:///' + tempDeckPath.replace(/\\/g, '/'), { waitUntil: 'load', timeout: 60000 });
  await slidePage.waitForTimeout(2000);

  const outSlidePdf = path.join(DOC_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pdf');
  const outSlideFePdf = path.join(FE_DOCS_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pdf');
  await slidePage.pdf({
    path: outSlidePdf,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' }
  });
  fs.copyFileSync(outSlidePdf, outSlideFePdf);
  if (fs.existsSync(tempDeckPath)) fs.unlinkSync(tempDeckPath);
  console.log('✓ Đã xuất PDF Slide (10 trang 16:9):', outSlidePdf);

  // 4.2 Render POSTER APP (PDF & PNG)
  const posterPage = await browser.newPage({
    viewport: { width: 1400, height: 2000 },
    deviceScaleFactor: 2
  });
  await posterPage.goto('file:///' + outPosterHtml.replace(/\\/g, '/'), { waitUntil: 'load', timeout: 60000 });
  await posterPage.waitForTimeout(2000);

  const outPosterPdf = path.join(DOC_DIR, 'POSTER_APP_CEO1983_3D.pdf');
  const outPosterFePdf = path.join(FE_DOCS_DIR, 'POSTER_APP_CEO1983_3D.pdf');
  await posterPage.pdf({
    path: outPosterPdf,
    width: '1400px',
    height: '2000px',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' }
  });
  fs.copyFileSync(outPosterPdf, outPosterFePdf);

  const outPosterPng = path.join(DOC_DIR, 'POSTER_APP_CEO1983_3D.png');
  const outPosterFePng = path.join(FE_DOCS_DIR, 'POSTER_APP_CEO1983_3D.png');
  await posterPage.screenshot({ path: outPosterPng, fullPage: true });
  fs.copyFileSync(outPosterPng, outPosterFePng);
  console.log('✓ Đã xuất PDF Poster:', outPosterPdf);
  console.log('✓ Đã xuất PNG Poster:', outPosterPng);

  // 4.3 Render PROFILE CRM (PDF & PNG)
  const profilePage = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2
  });
  await profilePage.goto('file:///' + outProfileHtml.replace(/\\/g, '/'), { waitUntil: 'load', timeout: 60000 });
  await profilePage.waitForTimeout(2000);

  const outProfilePdf = path.join(DOC_DIR, 'PROFILE_CRM_QUAN_TRI_CEO1983.pdf');
  const outProfileFePdf = path.join(FE_DOCS_DIR, 'PROFILE_CRM_QUAN_TRI_CEO1983.pdf');
  await profilePage.pdf({
    path: outProfilePdf,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' }
  });
  fs.copyFileSync(outProfilePdf, outProfileFePdf);

  const outProfilePng = path.join(DOC_DIR, 'PROFILE_CRM_QUAN_TRI_CEO1983.png');
  const outProfileFePng = path.join(FE_DOCS_DIR, 'PROFILE_CRM_QUAN_TRI_CEO1983.png');
  await profilePage.screenshot({ path: outProfilePng, fullPage: true });
  fs.copyFileSync(outProfilePng, outProfileFePng);
  console.log('✓ Đã xuất PDF Profile:', outProfilePdf);
  console.log('✓ Đã xuất PNG Profile:', outProfilePng);

  await browser.close();

  console.log('\n=====================================================================');
  console.log('HOÀN TẤT 100% TOÀN BỘ CÁC BẢN SLIDE, POSTER 3D & PROFILE CRM!');
  console.log('=====================================================================');
}

main().catch(err => {
  console.error('[LỖI CHƯƠNG TRÌNH]:', err);
  process.exit(1);
});
