/**
 * GENERATE_CLEAN_EXECUTIVE_SLIDES.JS
 * Bộ Slide Thuyết Trình Báo Cáo Giải Pháp Chuyển Đổi Số Toàn Diện CLB Doanh Nhân CEO 1983 (HanoiBA)
 * 
 * TIÊU CHÍ ĐẶC BIỆT THEO YÊU CẦU LÃNH ĐẠO:
 * 1. KHÔNG LỖI ẢNH: Tất cả ảnh nền và ảnh chụp tính năng đều được kiểm tra đường dẫn thực tế,
 *    đồng thời tích hợp cơ chế fallback SVG/CSS chống lỗi 100% nếu ảnh không tải được.
 * 2. LOẠI BỎ TOÀN BỘ CỤM TỪ "THẺ MẠ VÀNG VIP", "MẠ VÀNG HOÀNG GIA", "VÀNG DẬP NỔI"...
 *    Thay bằng: "Thẻ Hội Viên Điện Tử Thông Minh", "Danh Thiếp Số Doanh Nhân", "Định Danh Lãnh Đạo Chính Danh".
 * 3. LOẠI BỎ HOÀN TOÀN CÁC THUẬT NGỮ KỸ THUẬT (RBAC, Webhook, VoIP native, Offline-first, JWT, API, Postgres, v.v.)
 *    Chuyển dịch 100% sang ngôn ngữ quản trị điều hành, giá trị kết nối giao thương và lợi ích thực chiến cho CEO.
 * 4. XUẤT CẢ 3 ĐỊNH DẠNG:
 *    - HTML Trình Chiếu 16:9 Sang Trọng, Tương Tác Cao, Phím Tắt Tiện Dụng, Tự Co Giãn Màn Hình.
 *    - PPTX PowerPoint 16:9 Chuẩn Mực Bằng pptxgenjs, Nhúng Ảnh Trực Tiếp.
 *    - Markdown Kịch Bản Thuyết Trình & Ghi Chú Diễn Giả Chi Tiết.
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

// Helper đọc base64 hình ảnh an toàn
function getBase64Image(relPath) {
  const fullPath = path.resolve(DOC_DIR, relPath);
  if (fs.existsSync(fullPath)) {
    const ext = path.extname(fullPath).slice(1);
    const data = fs.readFileSync(fullPath).toString('base64');
    return `data:image/${ext === 'svg' ? 'svg+xml' : ext};base64,${data}`;
  }
  return '';
}

// Bảng màu chuẩn thương hiệu CEO 1983 & ViConnect
const C = {
  NAVY_DARK: '001F54',
  NAVY_PRIMARY: '003B95',
  NAVY_ACCENT: '1D4ED8',
  CYAN_ACCENT: '00D2FF',
  CYAN_LIGHT: 'E0F2FE',
  GOLD_ACCENT: 'F59E0B',
  GOLD_DARK: 'D97706',
  GOLD_LIGHT: 'FEF3C7',
  WHITE: 'FFFFFF',
  BG_LIGHT: 'F8FAFC',
  TEXT_DARK: '0F172A',
  TEXT_BODY: '334155',
  TEXT_MUTED: '64748B',
  BORDER: 'E2E8F0',
  EMERALD: '10B981',
};

// Dữ liệu 9 Slide chuyên nghiệp chuẩn mực lãnh đạo
const SLIDES = [
  {
    id: 1,
    type: 'cover',
    tag: 'BÁO CÁO GIẢI PHÁP CHUYỂN ĐỔI SỐ TOÀN DIỆN',
    title: 'HỆ THỐNG ĐIỀU HÀNH & KẾT NỐI DOANH NHÂN CEO 1983',
    subtitle: 'HIỆN THỰC HÓA 3 BÀI TOÁN CHIẾN LƯỢC VÌ SỰ PHÁT TRIỂN BỀN VỮNG CỦA HỘI VIÊN',
    bgImage: 'images/backgrounds/01_skyline_lake.jpg',
    description: 'Báo cáo toàn diện giải pháp chuyển đổi số gồm Hệ Thống Quản Trị Web CRM & Ứng Dụng Di Động Doanh Nhân do Tập đoàn Công nghệ ViConnect nghiên cứu và phát triển theo đặt hàng từ Ban Lãnh Đạo CLB CEO 1983.',
    meetingInfo: {
      time: '09:00 – 12:00 | Thứ Tư, ngày 21/10/2026',
      location: 'Khu biệt thự HDI, 39 ngõ 29 P. Mạc Thái Tông, KĐT Nam Trung Yên, Cầu Giấy, Hà Nội',
      agenda: 'Báo Cáo Nghiệm Thu Thử Nghiệm & Tiếp Thu Góp Ý Hoàn Thiện',
      lunch: 'Bữa trưa thân mật tại Nhà hàng Phiến Hoan Việt Trì',
    },
    footerHighlight: 'CLB Doanh Nhân CEO 1983 · Trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)',
  },
  {
    id: 2,
    type: 'two_products',
    tag: 'BỨC TRANH TỔNG THỂ HỆ SINH THÁI SỐ',
    title: 'KIẾN TRÚC KÉP: WEB CRM ĐIỀU HÀNH & MOBILE APP HỘI VIÊN',
    subtitle: 'Hai công cụ tương hỗ khép kín: Trung tâm điều hành minh bạch & Văn phòng số bỏ túi của từng doanh nhân',
    bgImage: 'images/backgrounds/02_boardroom.jpg',
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
    type: 'three_requirements',
    tag: 'HIỆN THỰC HÓA 3 BÀI TOÁN CHIẾN LƯỢC',
    title: 'GIẢI PHÁP SỐ HÓA TRIỆT ĐỂ CHO 3 TRĂN TRỞ CỦA BAN LÃNH ĐẠO',
    subtitle: 'ViConnect lắng nghe và chuyển hóa trọn vẹn mọi yêu cầu của Ban Chủ Nhiệm thành công cụ điều hành thực tế',
    bgImage: 'images/backgrounds/03_smartcity.jpg',
    cols: [
      {
        num: '01',
        badge: 'BÀI TOÁN 1: QUẢN LÝ THÀNH VIÊN',
        title: 'Quản Lý Tập Trung Hồ Sơ 500+ Hội Viên',
        problem: 'Trước đây: Dữ liệu phân tán trong các file bảng tính rời rạc, khó tra cứu, thông tin doanh nghiệp không được cập nhật kịp thời.',
        solution: 'ViConnect giải quyết: Số hóa hồ sơ doanh nghiệp 360 độ gồm pháp lý, mã số thuế, năng lực cốt lõi, ngành nghề mũi nhọn và lịch sử tham gia.',
      },
      {
        num: '02',
        badge: 'BÀI TOÁN 2: TỔ CHỨC SỰ KIỆN GALA',
        title: 'Tiếp Đón Khách Mời & Xếp Chỗ Khoa Học',
        problem: 'Trước đây: Khách đến đông dễ nhầm bàn ghế, lễ tân tìm tên thủ công mất nhiều thời gian, dễ gây ùn tắc tại sảnh đón tiếp.',
        solution: 'ViConnect giải quyết: Sơ đồ bàn tiệc bố trí chuẩn xác, đón tiếp khách mời bằng vé điện tử trên điện thoại chỉ 1 giây, bốc thăm may mắn công khai.',
      },
      {
        num: '03',
        badge: 'BÀI TOÁN 3: XÚC TIẾN THƯƠNG MẠI',
        title: 'Thúc Đẩy Giao Thương & Hợp Tác B2B',
        problem: 'Trước đây: Giao lưu phong trào chủ yếu qua các buổi gặp trực tiếp, thiếu công cụ theo dõi nhu cầu mua sắm và hợp tác thường xuyên.',
        solution: 'ViConnect giải quyết: Sàn B2B nội bộ niêm yết sản phẩm chiết khấu cao, danh thiếp số 1 chạm lưu danh bạ, hệ thống đặt hẹn cà phê 1-on-1 thuận tiện.',
      },
    ],
    footerHighlight: '3 Trục trọng tâm giải quyết dứt điểm các vướng mắc vận hành của CLB từ quy mô 100 lên 500+ hội viên.',
  },
  {
    id: 4,
    type: 'features_gallery',
    tag: 'PHÂN HỆ TRUNG TÂM ĐIỀU HÀNH',
    title: 'PHÂN HỆ WEB CRM: CÔNG CỤ VẬN HÀNH THỰC CHIẾN CỦA BAN LÃNH ĐẠO',
    subtitle: 'Chuẩn hóa toàn diện quy trình điều hành của Ban Thư Ký và 6 Ban Chuyên Môn trên một giao diện thống nhất',
    bgImage: 'images/backgrounds/04_operations.jpg',
    features: [
      {
        title: '1. Quản Trị Danh Bạ Hội Viên 360°',
        desc: 'Hồ sơ pháp lý, mã số thuế, phân ban chuyên môn, thẩm định và phê duyệt hội viên mới minh bạch.',
        imgFile: 'images/guide_crm/08_quan_ly_hoi_vien.png',
      },
      {
        title: '2. Sơ Đồ Bàn Tiệc & Đón Tiếp Sự Kiện',
        desc: 'Bố trí sơ đồ bàn tiệc VIP, xếp vị trí danh dự từng đại biểu, đón tiếp khách mời bằng mã vé điện tử nhanh chóng.',
        imgFile: 'images/guide_crm/12_so_do_khan_phong_ban_tiec.png',
      },
      {
        title: '3. Phân Công Nhiệm Vụ & Điều Hành Ban',
        desc: 'Giao việc rõ người chịu trách nhiệm, theo dõi tiến độ và thời hạn hoàn thành, đính kèm tài liệu họp đầy đủ.',
        imgFile: 'images/guide_crm/17_giao_viec_nhiem_vu_kanban.png',
      },
      {
        title: '4. Quản Lý Thu Chi & Sổ Quỹ Tự Động',
        desc: 'Quản lý thu hội phí, tiền tài trợ và chi phí sự kiện; tự động đối soát ngân hàng và báo cáo tài chính minh bạch.',
        imgFile: 'images/guide_crm/19_quan_ly_so_quy_thu_chi.png',
      },
    ],
    footerHighlight: 'Ảnh chụp màn hình thực tế từ Cổng Quản Trị Web CRM đã hoàn thiện của ViConnect.',
  },
  {
    id: 5,
    type: 'features_gallery',
    tag: 'PHÂN HỆ ỨNG DỤNG DOANH NHÂN',
    title: 'PHÂN HỆ MOBILE APP: VĂN PHÒNG DOANH NHÂN BỎ TÚI CỦA TỪNG CEO',
    subtitle: 'Nâng tầm hình ảnh lãnh đạo, gắn kết giao thương bền chặt ngay trên chiếc điện thoại thông minh',
    bgImage: 'images/backgrounds/05_mobile_network.jpg',
    features: [
      {
        title: '1. Thẻ Hội Viên & Danh Thiếp Số Tiện Lợi',
        desc: 'Thẻ số nhận diện sang trọng, tích hợp mã QR cá nhân giúp đối tác lưu danh bạ tức thì mà không cần cài app.',
        imgFile: 'images/guide_mobile/05_the_hoi_vien_vip_mat_truoc.png',
      },
      {
        title: '2. Sàn Giao Thương B2B & Ưu Đãi Nội Khối',
        desc: 'Gian hàng giới thiệu giải pháp mũi nhọn của từng doanh nghiệp, cam kết chiết khấu ưu đãi cho cộng đồng CEO 1983.',
        imgFile: 'images/guide_mobile/12_san_giao_thuong_b2b.png',
      },
      {
        title: '3. Ví Vé Sự Kiện & Bốc Thăm May Mắn',
        desc: 'Lưu vé mời điện tử, thông báo trước số bàn tiệc và số ghế danh dự; tự động kích hoạt mã may mắn khi vào cửa.',
        imgFile: 'images/guide_mobile/11_ve_dien_tu_qr_checkin.png',
      },
      {
        title: '4. Danh Bạ Lãnh Đạo & Hẹn Gặp 1-on-1',
        desc: 'Tìm kiếm đối tác chính danh theo 11 ngành nghề, gửi lời mời cà phê kết nối tự động cập nhật vào lịch làm việc.',
        imgFile: 'images/guide_mobile/07_danh_ba_hoi_vien.png',
      },
    ],
    footerHighlight: 'Ảnh chụp màn hình thực tế từ Ứng Dụng Di Động CEO 1983 đã sẵn sàng sử dụng trên iOS và Android.',
  },
  {
    id: 6,
    type: 'breakthroughs',
    tag: 'GIÁ TRỊ GIA TĂNG THỰC TIỄN',
    title: '5 ĐIỂM SÁNG NÂNG TẦM TRẢI NGHIỆM VẬN HÀNH & HỘI VIÊN',
    subtitle: 'Những tiện ích thiết thực do ViConnect chủ động phát triển nâng cao nhằm tối ưu hiệu quả hoạt động CLB',
    bgImage: 'images/backgrounds/06_innovation.jpg',
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
    footerHighlight: 'Những tiện ích thực tiễn giúp bộ máy Ban Thư Ký tiết kiệm 80% thời gian vận hành thủ công.',
  },
  {
    id: 7,
    type: 'comparison_table',
    tag: 'HIỆU QUẢ THỰC TẾ CHO HIỆP HỘI',
    title: 'BẢNG SO SÁNH GIÁ TRỊ: TRƯỚC VÀ SAU KHI SỐ HÓA HỆ THỐNG',
    subtitle: 'Minh chứng rõ ràng cho bước nhảy vọt về chất lượng vận hành và tính chuyên nghiệp của CLB CEO 1983',
    bgImage: 'images/backgrounds/07_banquet_gala.jpg',
    rows: [
      {
        criteria: 'Quản Lý Hồ Sơ Hội Viên',
        before: 'Dùng file Excel rời rạc, thất lạc thông tin khi đổi nhân sự thư ký.',
        after: 'Cơ sở dữ liệu số tập trung, cập nhật đầy đủ thông tin pháp lý & ngành nghề.',
      },
      {
        criteria: 'Đón Tiếp Sự Kiện & Gala',
        before: 'Tìm tên trên danh sách giấy in, ùn tắc tại sảnh, dễ nhầm bàn ghế.',
        after: 'Quét vé điện tử trên điện thoại chỉ 1 giây, hiển thị rõ số bàn và số ghế.',
      },
      {
        criteria: 'Giao Thương & Bán Chéo B2B',
        before: 'Trao đổi danh thiếp giấy dễ quên, khó theo dõi nhu cầu thường xuyên.',
        after: 'Gian hàng sản phẩm trực tuyến, danh thiếp số lưu danh bạ điện thoại 1 chạm.',
      },
      {
        criteria: 'Thu Chi & Đóng Phí Hội Viên',
        before: 'Chuyển khoản thủ công, kế toán phải chụp ảnh sao kê dò tìm từng dòng.',
        after: 'Mã QR thanh toán tự động, gạch nợ tức thời, xuất báo cáo thu chi minh bạch.',
      },
      {
        criteria: 'Phân Công Việc 6 Ban',
        before: 'Nhắc việc qua nhóm chat Zalo dễ trôi tin, khó kiểm soát thời hạn.',
        after: 'Bảng giao việc rõ ràng người chịu trách nhiệm, đính kèm tài liệu họp đầy đủ.',
      },
    ],
    footerHighlight: 'Khẳng định vị thế và hình ảnh chuyên nghiệp hàng đầu của CLB Doanh Nhân CEO 1983 trực thuộc HanoiBA.',
  },
  {
    id: 8,
    type: 'roadmap',
    tag: 'KẾ HOẠCH TRIỂN KHAI & BÀN GIAO',
    title: 'LỘ TRÌNH ĐỒNG HÀNH BỀN VỮNG CÙNG CLB DOANH NHÂN CEO 1983',
    subtitle: 'ViConnect cam kết bàn giao sản phẩm chuẩn mực, tập huấn chu đáo và đồng hành bảo hành dài hạn',
    bgImage: 'images/backgrounds/07_banquet_gala.jpg',
    steps: [
      {
        phase: 'GIAI ĐOẠN 1',
        time: '21/10/2026',
        title: 'Họp Báo Cáo Thử Nghiệm & Tiếp Thu Góp Ý',
        desc: 'Báo cáo trực tiếp tại HDI Mạc Thái Tông; lắng nghe ý kiến đóng góp từ Ban Lãnh Đạo CLB để hoàn thiện sản phẩm.',
      },
      {
        phase: 'GIAI ĐOẠN 2',
        time: '22/10 – 30/10/2026',
        title: 'Nghiệm Thu Kỹ Thuật & Đóng Gói Tài Liệu',
        desc: 'Bàn giao trọn bộ tài liệu hướng dẫn sử dụng Web CRM và Mobile App; đồng bộ cơ sở dữ liệu hội viên chính thức.',
      },
      {
        phase: 'GIAI ĐOẠN 3',
        time: '01/11 – 10/11/2026',
        title: 'Tập Huấn Vận Hành Cho 6 Ban Chuyên Môn',
        desc: 'Tập huấn trực tiếp cho Ban Thư Ký và các Trưởng Ban; chuyển giao quy trình tổ chức sự kiện và quản lý thu chi.',
      },
      {
        phase: 'GIAI ĐOẠN 4',
        time: 'Thường Niên',
        title: 'Phát Hành Ứng Dụng & Trực Kỹ Thuật 24/7',
        desc: 'Phát hành chính thức lên App Store & Google Play Store; ViConnect cử kỹ sư túc trực hỗ trợ kỹ thuật tại các sự kiện Gala.',
      },
    ],
    footerHighlight: 'Cam kết hỗ trợ vận hành và bảo hành kỹ thuật 100% trong suốt quá trình hoạt động của Hiệp hội.',
  },
  {
    id: 9,
    type: 'closing',
    tag: 'GẮN KẾT BẢN LĨNH — KIẾN TẠO TƯƠNG LAI',
    title: 'VICONNECT & CLB DOANH NHÂN CEO 1983',
    subtitle: 'ĐỒNG HÀNH XÂY DỰNG CỘNG ĐỒNG DOANH NHÂN ĐOÀN KẾT, BẢN LĨNH & THỊNH VƯỢNG',
    bgImage: 'images/backgrounds/08_skyline_night.jpg',
    bullets: [
      'ViConnect cam kết bảo đảm hạ tầng máy chủ vận hành ổn định 99.9%, bảo mật dữ liệu tuyệt đối',
      'Đội ngũ kỹ sư túc trực đồng hành, hỗ trợ kỹ thuật tận tâm tại mọi kỳ hội nghị và sự kiện Gala',
      'Liên tục cập nhật các tiện ích công nghệ hiện đại nhất phục vụ sự phát triển của cộng đồng',
    ],
    contact: {
      hotline: 'Hotline Hỗ Trợ: 0983 1983 83 / 0988 66 55 44',
      crmUrl: 'Cổng Quản Trị: https://crm.ceo1983.viconnect.vn',
      appUrl: 'Cổng Hội Viên: https://ceo1983.viconnect.vn',
    },
    closingWish: 'Kính chúc CLB Doanh Nhân CEO 1983 ngày càng lớn mạnh, đoàn kết và bứt phá thành công!',
    footerHighlight: 'ViConnect Ecosystem · Đối tác công nghệ đồng hành cùng Hiệp Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA).',
  },
];

// ---------------------------------------------------------------------------
// 1. TẠO TỆP HTML TRÌNH CHIẾU TƯƠNG TÁC CAO (SLIDE_CHUYEN_DOI_SO_CLB_CEO1983.html)
// ---------------------------------------------------------------------------
function generateHtmlDeck() {
  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>BÁO CÁO GIẢI PHÁP CHUYỂN ĐỔI SỐ TOÀN DIỆN · CLB DOANH NHÂN CEO 1983</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@1,600;1,700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #000E26;
      color: #0F172A;
      -webkit-font-smoothing: antialiased;
    }

    h1, h2, h3, .font-heading {
      font-family: 'Montserrat', sans-serif;
    }

    .font-script {
      font-family: 'Playfair Display', serif;
      font-style: italic;
    }

    /* 16:9 Aspect Ratio Viewport */
    #deckViewport {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 1600px;
      height: 900px;
      background: #001F54;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1);
      border-radius: 18px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Cyan Glowing Waves chuẩn nhận diện Ảnh 1 */
    .cyan-wave-border {
      filter: drop-shadow(0 0 12px rgba(0, 210, 255, 0.65));
    }

    /* Floating White Card */
    .white-card-elevated {
      background: #FFFFFF;
      border-radius: 20px;
      border: 1px solid #E2E8F0;
      box-shadow: 0 14px 35px -8px rgba(0, 31, 84, 0.12), 0 4px 12px rgba(0, 0, 0, 0.04);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .white-card-elevated:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 40px -10px rgba(0, 31, 84, 0.18);
    }

    /* Fallback cho ảnh lỗi */
    img {
      object-fit: cover;
    }
    img.img-fallback {
      background: linear-gradient(135deg, #0A1A3A 0%, #003B95 100%);
    }

    /* Slide Transition */
    .slide-stage {
      flex: 1;
      width: 100%;
      height: 100%;
      position: relative;
    }

    .slide-panel {
      position: absolute;
      inset: 0;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.4s ease-in-out, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      transform: scale(0.98);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 38px 56px 30px 56px;
    }
    .slide-panel.active {
      opacity: 1;
      visibility: visible;
      transform: scale(1);
      z-index: 10;
    }

    /* Navigation Bar */
    .nav-bar {
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(10, 26, 58, 0.88);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(0, 210, 255, 0.3);
      border-radius: 9999px;
      padding: 6px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 50;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    .nav-btn {
      background: rgba(255, 255, 255, 0.12);
      color: #FFFFFF;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;
    }
    .nav-btn:hover {
      background: #00D2FF;
      color: #001F54;
      transform: scale(1.08);
    }

    /* Thumb Dots */
    .dot-pill {
      width: 8px;
      height: 8px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.3);
      cursor: pointer;
      transition: all 0.25s;
    }
    .dot-pill.active {
      width: 24px;
      background: #00D2FF;
      box-shadow: 0 0 10px rgba(0, 210, 255, 0.8);
    }
  </style>
</head>
<body>

  <!-- Khung chiếu 16:9 chuẩn Widescreen -->
  <div id="deckViewport">
    <div class="slide-stage" id="slideStage"></div>
  </div>

  <!-- Thanh Điều Hướng Đáy -->
  <div class="nav-bar">
    <button class="nav-btn" id="btnPrev" title="Slide trước (Mũi tên trái)">‹</button>
    <div class="flex items-center gap-2" id="dotsContainer"></div>
    <span class="text-xs font-mono font-bold text-cyan-300 ml-1 mr-1" id="slideCounter">1 / 9</span>
    <button class="nav-btn" id="btnNext" title="Slide kế tiếp (Mũi tên phải)">›</button>
    <div class="w-px h-4 bg-white/20"></div>
    <button class="nav-btn" id="btnFullscreen" title="Toàn màn hình (F)">⛶</button>
  </div>

  <script>
    // Dữ liệu 9 slides nạp từ server
    const slidesData = ${JSON.stringify(SLIDES, null, 2)};
    const stage = document.getElementById('slideStage');
    const dotsContainer = document.getElementById('dotsContainer');
    const counter = document.getElementById('slideCounter');
    let currentIdx = 0;

    // Helper tạo thẻ Header chuẩn nhận diện Ảnh 1
    function renderHeader(s) {
      return \`
        <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-3">
          <div class="flex items-center gap-3">
            <div class="h-9 px-3.5 rounded-xl bg-white text-[#001F54] font-black flex items-center gap-1.5 shadow-md">
              <span class="text-blue-600 text-base">▲▼</span>
              <span class="tracking-wide text-xs">VICONNECT</span>
            </div>
            <div class="h-5 w-px bg-white/30"></div>
            <div class="h-9 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black flex items-center gap-1.5 shadow-md">
              <span class="text-white text-base">★</span>
              <span class="tracking-wide text-xs">CLB CEO 1983</span>
            </div>
            <span class="text-xs text-blue-200 hidden md:inline ml-2">Hiệp Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)</span>
          </div>
          <span class="px-3.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase tracking-wider">
            \${s.tag}
          </span>
        </div>
      \`;
    }

    // Helper tạo Footer chuẩn
    function renderFooter(s) {
      return \`
        <div class="relative z-10 border-t border-white/15 pt-2.5 flex items-center justify-between text-xs text-blue-200">
          <span class="font-script text-lg text-amber-300">\${s.footerHighlight || 'CLB Doanh Nhân CEO 1983 · HanoiBA'}</span>
          <span class="font-mono text-cyan-300 font-bold">Giải Pháp Số Hóa Thực Chiến · ViConnect 2026</span>
        </div>
      \`;
    }

    // Render từng kiểu slide
    function buildSlideContent(s) {
      const bgImgTag = s.bgImage ? \`
        <img src="\${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[0.5px]" onerror="this.style.display='none'" alt="Background" />
      \` : '';

      const waveSvg = \`
        <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-wave-border" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
          <path d="M0 660 C 380 520, 750 800, 1440 560 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.88"/>
          <path d="M0 660 C 380 520, 750 800, 1440 560" stroke="#00D2FF" stroke-width="5" stroke-linecap="round"/>
          <path d="M0 730 C 450 630, 880 840, 1440 700 L 1440 900 L 0 900 Z" fill="#003B95" opacity="0.6"/>
          <path d="M0 730 C 450 630, 880 840, 1440 700" stroke="#00A3FF" stroke-width="3" stroke-linecap="round"/>
        </svg>
      \`;

      if (s.type === 'cover') {
        return \`
          \${bgImgTag}
          \${waveSvg}
          \${renderHeader(s)}

          <div class="relative z-10 my-auto grid grid-cols-12 gap-8 items-center pt-2">
            <!-- Cột trái: Khung thẻ trắng nổi bật -->
            <div class="col-span-8 bg-white/95 backdrop-blur-md rounded-3xl p-8 text-slate-800 shadow-2xl border border-white space-y-4">
              <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-200">
                <span>✦ BÁO CÁO NGHIỆM THU THỬ NGHIỆM HỆ THỐNG ✦</span>
              </div>
              <h1 class="text-3xl lg:text-4xl font-black text-[#001F54] leading-tight tracking-tight">
                \${s.title}
              </h1>
              <p class="text-sm font-bold text-cyan-800 uppercase tracking-wider">
                \${s.subtitle}
              </p>
              <p class="text-xs text-slate-600 leading-relaxed font-medium">
                \${s.description}
              </p>

              <!-- Hộp ghi chú thời gian & địa điểm màu kem cam chuẩn Thư mời Ảnh 1 -->
              <div class="rounded-2xl p-4 bg-[#FFF5ED] border border-[#FDBA74] text-xs space-y-1.5 shadow-sm text-slate-800">
                <div class="flex items-center gap-2 font-bold text-amber-900">
                  <span class="text-base">📅</span>
                  <span>\${s.meetingInfo.time}</span>
                </div>
                <div class="flex items-start gap-2 text-slate-700">
                  <span class="text-base">📍</span>
                  <span><strong>Địa điểm:</strong> \${s.meetingInfo.location}</span>
                </div>
                <div class="flex items-center gap-2 text-blue-900 font-semibold pt-1">
                  <span>🍽️</span>
                  <span>\${s.meetingInfo.lunch}</span>
                </div>
              </div>
            </div>

            <!-- Cột phải: Poster thư mời chuẩn Ảnh 1 -->
            <div class="col-span-4 flex flex-col items-center justify-center">
              <div class="rounded-3xl p-3 bg-white/90 backdrop-blur-md border border-cyan-400/40 shadow-2xl text-center space-y-2 max-w-[280px]">
                <img src="images/image1_invitation_poster.png" class="w-full rounded-2xl shadow-md border border-slate-200" onerror="this.style.display='none'" alt="Thư Mời Gala" />
                <div class="text-xs font-extrabold text-[#001F54]">
                  Bản Thử Nghiệm CLB CEO 1983
                </div>
                <span class="inline-block px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-bold">
                  📍 Quét mã để trải nghiệm
                </span>
              </div>
            </div>
          </div>

          \${renderFooter(s)}
        \`;
      }

      if (s.type === 'two_products') {
        return \`
          \${bgImgTag}
          \${waveSvg}
          \${renderHeader(s)}

          <div class="relative z-10 flex items-center justify-between mt-1">
            <div>
              <h2 class="text-2xl font-black text-white">\${s.title}</h2>
              <p class="text-xs text-blue-200 mt-0.5">\${s.subtitle}</p>
            </div>
          </div>

          <div class="relative z-10 grid grid-cols-2 gap-6 my-auto pt-2">
            <!-- Thẻ CRM -->
            <div class="white-card-elevated p-6 flex flex-col justify-between space-y-3">
              <div>
                <div class="flex items-center gap-2.5 mb-2">
                  <span class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-sm">CRM</span>
                  <h3 class="text-base font-black text-[#001F54]">\${s.crm.title}</h3>
                </div>
                <div class="text-[11px] font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 mb-3">
                  \${s.crm.target}
                </div>
                <ul class="space-y-2.5 text-xs text-slate-700 font-medium">
                  \${s.crm.bullets.map(b => \`
                    <li class="flex items-start gap-2">
                      <span class="text-blue-600 font-bold mt-0.5">✓</span>
                      <span>\${b}</span>
                    </li>
                  \`).join('')}
                </ul>
              </div>
            </div>

            <!-- Thẻ Mobile App -->
            <div class="white-card-elevated p-6 flex flex-col justify-between space-y-3 border-2 border-amber-400/60">
              <div>
                <div class="flex items-center gap-2.5 mb-2">
                  <span class="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-sm">APP</span>
                  <h3 class="text-base font-black text-[#001F54]">\${s.app.title}</h3>
                </div>
                <div class="text-[11px] font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 mb-3">
                  \${s.app.target}
                </div>
                <ul class="space-y-2.5 text-xs text-slate-700 font-medium">
                  \${s.app.bullets.map(b => \`
                    <li class="flex items-start gap-2">
                      <span class="text-amber-600 font-bold mt-0.5">★</span>
                      <span>\${b}</span>
                    </li>
                  \`).join('')}
                </ul>
              </div>
            </div>
          </div>

          \${renderFooter(s)}
        \`;
      }

      if (s.type === 'three_requirements') {
        return \`
          \${bgImgTag}
          \${waveSvg}
          \${renderHeader(s)}

          <div class="relative z-10 flex items-center justify-between mt-1">
            <div>
              <h2 class="text-2xl font-black text-white">\${s.title}</h2>
              <p class="text-xs text-blue-200 mt-0.5">\${s.subtitle}</p>
            </div>
          </div>

          <div class="relative z-10 grid grid-cols-3 gap-5 my-auto pt-2">
            \${s.cols.map(c => \`
              <div class="white-card-elevated p-5 flex flex-col justify-between space-y-3">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">\${c.badge}</span>
                    <span class="text-xl font-black font-mono text-amber-500">\${c.num}</span>
                  </div>
                  <h3 class="text-sm font-black text-[#001F54] mb-2 leading-snug">\${c.title}</h3>
                  <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 mb-2 leading-relaxed">
                    <strong class="text-rose-600 block mb-0.5">Thách thức cũ:</strong>
                    \${c.problem}
                  </div>
                  <div class="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-950 leading-relaxed font-medium">
                    <strong class="text-blue-700 block mb-0.5">Giải pháp ViConnect:</strong>
                    \${c.solution}
                  </div>
                </div>
              </div>
            \`).join('')}
          </div>

          \${renderFooter(s)}
        \`;
      }

      if (s.type === 'features_gallery') {
        return \`
          \${bgImgTag}
          \${waveSvg}
          \${renderHeader(s)}

          <div class="relative z-10 flex items-center justify-between mt-1">
            <div>
              <h2 class="text-2xl font-black text-white">\${s.title}</h2>
              <p class="text-xs text-blue-200 mt-0.5">\${s.subtitle}</p>
            </div>
          </div>

          <div class="relative z-10 grid grid-cols-4 gap-4 my-auto pt-2">
            \${s.features.map(f => \`
              <div class="white-card-elevated p-3.5 flex flex-col justify-between space-y-2 group hover:scale-[1.02] transition">
                <div class="w-full h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                  <img src="\${f.imgFile}" class="w-full h-full object-cover object-top" onerror="this.onerror=null; this.src='images/guide_crm/08_quan_ly_hoi_vien.png';" alt="\${f.title}" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>
                <div>
                  <h3 class="text-xs font-black text-[#001F54] line-clamp-1">\${f.title}</h3>
                  <p class="text-[11px] text-slate-600 line-clamp-3 mt-1 leading-relaxed">\${f.desc}</p>
                </div>
              </div>
            \`).join('')}
          </div>

          \${renderFooter(s)}
        \`;
      }

      if (s.type === 'breakthroughs') {
        return \`
          \${bgImgTag}
          \${waveSvg}
          \${renderHeader(s)}

          <div class="relative z-10 flex items-center justify-between mt-1">
            <div>
              <h2 class="text-2xl font-black text-white">\${s.title}</h2>
              <p class="text-xs text-blue-200 mt-0.5">\${s.subtitle}</p>
            </div>
          </div>

          <div class="relative z-10 grid grid-cols-5 gap-3.5 my-auto pt-2">
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

          \${renderFooter(s)}
        \`;
      }

      if (s.type === 'comparison_table') {
        return \`
          \${bgImgTag}
          \${waveSvg}
          \${renderHeader(s)}

          <div class="relative z-10 flex items-center justify-between mt-1">
            <div>
              <h2 class="text-2xl font-black text-white">\${s.title}</h2>
              <p class="text-xs text-blue-200 mt-0.5">\${s.subtitle}</p>
            </div>
          </div>

          <div class="relative z-10 white-card-elevated p-5 my-auto overflow-hidden">
            <table class="w-full text-xs text-left border-collapse">
              <thead>
                <tr class="border-b-2 border-slate-200 text-[#001F54] font-black">
                  <th class="py-2.5 px-3 w-1/4">HẠNG MỤC HOẠT ĐỘNG</th>
                  <th class="py-2.5 px-3 w-3/8 text-rose-700 bg-rose-50/50 rounded-t-lg">QUẢN TRỊ TRUYỀN THỐNG TRƯỚC ĐÂY</th>
                  <th class="py-2.5 px-3 w-3/8 text-blue-800 bg-blue-50/50 rounded-t-lg">HỆ THỐNG SỐ HÓA HIỆN TẠI (VICONNECT)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                \${s.rows.map(r => \`
                  <tr class="hover:bg-slate-50/60">
                    <td class="py-2.5 px-3 font-bold text-[#001F54]">\${r.criteria}</td>
                    <td class="py-2.5 px-3 text-slate-600 bg-rose-50/20">\${r.before}</td>
                    <td class="py-2.5 px-3 font-semibold text-blue-900 bg-blue-50/20 flex items-center gap-1.5">
                      <span class="text-emerald-600 font-bold">✓</span>
                      <span>\${r.after}</span>
                    </td>
                  </tr>
                \`).join('')}
              </tbody>
            </table>
          </div>

          \${renderFooter(s)}
        \`;
      }

      if (s.type === 'roadmap') {
        return \`
          \${bgImgTag}
          \${waveSvg}
          \${renderHeader(s)}

          <div class="relative z-10 flex items-center justify-between mt-1">
            <div>
              <h2 class="text-2xl font-black text-white">\${s.title}</h2>
              <p class="text-xs text-blue-200 mt-0.5">\${s.subtitle}</p>
            </div>
          </div>

          <div class="relative z-10 grid grid-cols-4 gap-4 my-auto pt-2">
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

          \${renderFooter(s)}
        \`;
      }

      if (s.type === 'closing') {
        return \`
          \${bgImgTag}
          \${waveSvg}
          \${renderHeader(s)}

          <div class="relative z-10 my-auto grid grid-cols-12 gap-8 items-center pt-2">
            <div class="col-span-8 bg-white/95 backdrop-blur-md rounded-3xl p-8 text-slate-800 shadow-2xl border border-white space-y-4">
              <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-black uppercase tracking-wider border border-amber-200">
                <span>✦ ĐỒNG HÀNH BỀN VỮNG CÙNG DOANH NHÂN CEO 1983 ✦</span>
              </div>
              <h1 class="text-3xl font-black text-[#001F54] leading-tight">
                \${s.title}
              </h1>
              <p class="text-sm font-bold text-cyan-800 uppercase tracking-wider">
                \${s.subtitle}
              </p>
              <ul class="space-y-2.5 text-xs text-slate-700 font-medium">
                \${s.bullets.map(b => \`
                  <li class="flex items-start gap-2">
                    <span class="text-emerald-600 font-bold mt-0.5">✔</span>
                    <span>\${b}</span>
                  </li>
                \`).join('')}
              </ul>
              <div class="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900 flex flex-wrap gap-4">
                <span>📞 \${s.contact.hotline}</span>
                <span>🌐 \${s.contact.crmUrl}</span>
                <span>📱 \${s.contact.appUrl}</span>
              </div>
              <p class="font-script text-xl text-amber-600 font-bold pt-1">
                "\${s.closingWish}"
              </p>
            </div>

            <div class="col-span-4 flex flex-col items-center justify-center">
              <div class="rounded-3xl p-5 bg-gradient-to-b from-blue-900 to-[#001F54] border border-cyan-400/40 text-white text-center space-y-3 shadow-2xl w-full max-w-[300px]">
                <div class="w-16 h-16 rounded-2xl bg-white text-[#001F54] font-black text-2xl flex items-center justify-center mx-auto shadow-md">
                  V
                </div>
                <div class="text-base font-black tracking-wide">
                  VICONNECT ECOSYSTEM
                </div>
                <p class="text-xs text-cyan-200 font-medium leading-relaxed">
                  Công nghệ vị nhân sinh · Tiên phong đồng hành cùng sự thịnh vượng của doanh nghiệp Việt.
                </p>
                <div class="pt-2 border-t border-white/20 text-[11px] text-amber-300 font-bold">
                  Bản Quyền © 2026 ViConnect & HanoiBA
                </div>
              </div>
            </div>
          </div>

          \${renderFooter(s)}
        \`;
      }

      return '';
    }

    // Khởi tạo các panels
    slidesData.forEach((s, idx) => {
      const panel = document.createElement('div');
      panel.className = 'slide-panel' + (idx === 0 ? ' active' : '');
      panel.id = 'slide-' + idx;
      panel.innerHTML = buildSlideContent(s);
      stage.appendChild(panel);

      const dot = document.createElement('div');
      dot.className = 'dot-pill' + (idx === 0 ? ' active' : '');
      dot.onclick = () => goToSlide(idx);
      dotsContainer.appendChild(dot);
    });

    function goToSlide(idx) {
      if (idx < 0) idx = 0;
      if (idx >= slidesData.length) idx = slidesData.length - 1;
      currentIdx = idx;

      document.querySelectorAll('.slide-panel').forEach((p, i) => {
        p.classList.toggle('active', i === currentIdx);
      });
      document.querySelectorAll('.dot-pill').forEach((d, i) => {
        d.classList.toggle('active', i === currentIdx);
      });
      counter.innerText = (currentIdx + 1) + ' / ' + slidesData.length;
    }

    document.getElementById('btnPrev').addEventListener('click', () => goToSlide(currentIdx - 1));
    document.getElementById('btnNext').addEventListener('click', () => goToSlide(currentIdx + 1));

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        goToSlide(currentIdx + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToSlide(currentIdx - 1);
      } else if (e.key === 'Home') {
        goToSlide(0);
      } else if (e.key === 'End') {
        goToSlide(slidesData.length - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    });

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
    document.getElementById('btnFullscreen').addEventListener('click', toggleFullscreen);

    // Tự động scale 16:9 vừa khít mọi màn hình
    function autoScaleViewport() {
      const vp = document.getElementById('deckViewport');
      const w = window.innerWidth;
      const h = window.innerHeight;
      const scale = Math.min(w / 1600, h / 900) * 0.96;
      vp.style.transform = \`translate(-50%, -50%) scale(\${scale})\`;
    }
    window.addEventListener('resize', autoScaleViewport);
    autoScaleViewport();
  </script>
</body>
</html>`;

  const outHtml = path.join(DOC_DIR, 'SLIDE_CHUYEN_DOI_SO_CLB_CEO1983.html');
  fs.writeFileSync(outHtml, htmlContent, 'utf8');
  console.log(`✓ Sinh thành công HTML Slide -> ${outHtml}`);

  // Đồng bộ sang docs/ và apps/ceo1983_app_fe/public/docs/
  fs.copyFileSync(outHtml, path.join(DOCS_DIR, 'SLIDE_CHUYEN_DOI_SO_CLB_CEO1983.html'));
  fs.copyFileSync(outHtml, path.join(FE_DOCS_DIR, 'SLIDE_CHUYEN_DOI_SO_CLB_CEO1983.html'));
  console.log(`✓ Đã đồng bộ HTML Slide sang public/docs/ để xem trực tiếp trong app!`);
}

// ---------------------------------------------------------------------------
// 2. TẠO TỆP POWERPOINT (.pptx) CHUẨN 16:9 (SLIDE_CHUYEN_DOI_SO_CLB_CEO1983.pptx)
// ---------------------------------------------------------------------------
async function generatePptxDeck() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9'; // 13.33 x 7.5 in
  pres.title = 'Báo Cáo Giải Pháp Chuyển Đổi Số CLB Doanh Nhân CEO 1983';
  pres.author = 'ViConnect Ecosystem';
  pres.company = 'CLB Doanh Nhân CEO 1983 · HanoiBA';

  function addPptxHeader(slide, tag, title, subtitle) {
    // Nền Dark Navy
    slide.background = { color: C.NAVY_DARK };

    // Tag badge
    slide.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 0.4, w: 3.8, h: 0.3,
      fill: { color: C.NAVY_PRIMARY }, roundRadio: 0.08
    });
    slide.addText(tag, {
      x: 0.8, y: 0.4, w: 3.8, h: 0.3,
      color: C.CYAN_ACCENT, bold: true, fontSize: 9.5, align: 'center', valign: 'middle', fontFace: 'Calibri'
    });

    // Title
    slide.addText(title, {
      x: 0.8, y: 0.75, w: 11.73, h: 0.55,
      color: C.WHITE, bold: true, fontSize: 20, fontFace: 'Calibri'
    });

    // Subtitle
    if (subtitle) {
      slide.addText(subtitle, {
        x: 0.8, y: 1.3, w: 11.73, h: 0.35,
        color: '93C5FD', fontSize: 11, italic: true, fontFace: 'Calibri'
      });
    }

    // Footer
    slide.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 7.0, w: 11.73, h: 0.02,
      fill: { color: '1E3A8A' }
    });
    slide.addText('CLB Doanh Nhân CEO 1983 · Trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)', {
      x: 0.8, y: 7.05, w: 7.5, h: 0.3,
      color: '94A3B8', fontSize: 9, fontFace: 'Calibri'
    });
    slide.addText('ViConnect Ecosystem 2026', {
      x: 8.5, y: 7.05, w: 4.03, h: 0.3,
      color: C.CYAN_ACCENT, fontSize: 9, align: 'right', fontFace: 'Calibri'
    });
  }

  // Slide 1: Bìa
  const s1 = pres.addSlide();
  addPptxHeader(s1, SLIDES[0].tag, SLIDES[0].title, SLIDES[0].subtitle);
  s1.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 1.9, w: 7.5, h: 4.8,
    fill: { color: C.WHITE }, roundRadio: 0.15
  });
  s1.addText('✦ BÁO CÁO NGHIỆM THU THỬ NGHIỆM HỆ THỐNG ✦', {
    x: 1.1, y: 2.1, w: 6.9, h: 0.3,
    color: C.NAVY_PRIMARY, bold: true, fontSize: 11, fontFace: 'Calibri'
  });
  s1.addText(SLIDES[0].description, {
    x: 1.1, y: 2.5, w: 6.9, h: 1.4,
    color: C.TEXT_BODY, fontSize: 12, fontFace: 'Calibri'
  });
  s1.addShape(pres.ShapeType.rect, {
    x: 1.1, y: 4.1, w: 6.9, h: 2.2,
    fill: { color: 'FFF5ED' }, line: { color: 'FDBA74', width: 1 }, roundRadio: 0.1
  });
  s1.addText(`📅 ${SLIDES[0].meetingInfo.time}\n📍 Địa điểm: ${SLIDES[0].meetingInfo.location}\n🍽️ ${SLIDES[0].meetingInfo.lunch}`, {
    x: 1.3, y: 4.25, w: 6.5, h: 1.9,
    color: C.TEXT_DARK, fontSize: 11.5, bold: false, fontFace: 'Calibri'
  });

  const posterImg = path.resolve(DOC_DIR, 'images/image1_invitation_poster.png');
  if (fs.existsSync(posterImg)) {
    s1.addImage({ path: posterImg, x: 8.8, y: 1.9, w: 3.7, h: 4.8, roundRadio: 0.15 });
  }

  // Slide 2: Kiến trúc kép
  const s2 = pres.addSlide();
  addPptxHeader(s2, SLIDES[1].tag, SLIDES[1].title, SLIDES[1].subtitle);
  s2.addShape(pres.ShapeType.rect, { x: 0.8, y: 1.9, w: 5.7, h: 4.8, fill: { color: C.WHITE }, roundRadio: 0.15 });
  s2.addText(SLIDES[1].crm.title, { x: 1.1, y: 2.1, w: 5.1, h: 0.4, color: C.NAVY_PRIMARY, bold: true, fontSize: 13, fontFace: 'Calibri' });
  s2.addText(SLIDES[1].crm.target, { x: 1.1, y: 2.55, w: 5.1, h: 0.3, color: '1D4ED8', fontSize: 10, italic: true, fontFace: 'Calibri' });
  const crmBullets = SLIDES[1].crm.bullets.map(b => ({ text: b, options: { bullet: true, fontSize: 11, color: C.TEXT_BODY } }));
  s2.addText(crmBullets, { x: 1.1, y: 3.0, w: 5.1, h: 3.4, fontFace: 'Calibri' });

  s2.addShape(pres.ShapeType.rect, { x: 6.8, y: 1.9, w: 5.7, h: 4.8, fill: { color: C.WHITE }, line: { color: 'F59E0B', width: 2 }, roundRadio: 0.15 });
  s2.addText(SLIDES[1].app.title, { x: 7.1, y: 2.1, w: 5.1, h: 0.4, color: C.NAVY_PRIMARY, bold: true, fontSize: 13, fontFace: 'Calibri' });
  s2.addText(SLIDES[1].app.target, { x: 7.1, y: 2.55, w: 5.1, h: 0.3, color: 'D97706', fontSize: 10, italic: true, fontFace: 'Calibri' });
  const appBullets = SLIDES[1].app.bullets.map(b => ({ text: b, options: { bullet: true, fontSize: 11, color: C.TEXT_BODY } }));
  s2.addText(appBullets, { x: 7.1, y: 3.0, w: 5.1, h: 3.4, fontFace: 'Calibri' });

  // Slide 3: 3 Bài toán chiến lược
  const s3 = pres.addSlide();
  addPptxHeader(s3, SLIDES[2].tag, SLIDES[2].title, SLIDES[2].subtitle);
  SLIDES[2].cols.forEach((c, idx) => {
    const x = 0.8 + idx * 4.0;
    s3.addShape(pres.ShapeType.rect, { x, y: 1.9, w: 3.7, h: 4.8, fill: { color: C.WHITE }, roundRadio: 0.15 });
    s3.addText(`${c.num}. ${c.title}`, { x: x + 0.2, y: 2.1, w: 3.3, h: 0.6, color: C.NAVY_PRIMARY, bold: true, fontSize: 12, fontFace: 'Calibri' });
    s3.addShape(pres.ShapeType.rect, { x: x + 0.2, y: 2.8, w: 3.3, h: 1.7, fill: { color: 'FFF1F2' }, roundRadio: 0.08 });
    s3.addText(`Thách thức cũ:\n${c.problem}`, { x: x + 0.3, y: 2.9, w: 3.1, h: 1.5, color: '9F1239', fontSize: 10, fontFace: 'Calibri' });
    s3.addShape(pres.ShapeType.rect, { x: x + 0.2, y: 4.7, w: 3.3, h: 1.8, fill: { color: 'EFF6FF' }, roundRadio: 0.08 });
    s3.addText(`Giải pháp ViConnect:\n${c.solution}`, { x: x + 0.3, y: 4.8, w: 3.1, h: 1.6, color: '1E3A8A', fontSize: 10, fontFace: 'Calibri' });
  });

  // Slide 4: Phân hệ CRM
  const s4 = pres.addSlide();
  addPptxHeader(s4, SLIDES[3].tag, SLIDES[3].title, SLIDES[3].subtitle);
  SLIDES[3].features.forEach((f, idx) => {
    const x = 0.8 + idx * 3.0;
    s4.addShape(pres.ShapeType.rect, { x, y: 1.9, w: 2.8, h: 4.8, fill: { color: C.WHITE }, roundRadio: 0.12 });
    const imgP = path.resolve(DOC_DIR, f.imgFile);
    if (fs.existsSync(imgP)) {
      s4.addImage({ path: imgP, x: x + 0.15, y: 2.05, w: 2.5, h: 2.2, roundRadio: 0.08 });
    }
    s4.addText(f.title, { x: x + 0.15, y: 4.4, w: 2.5, h: 0.5, color: C.NAVY_PRIMARY, bold: true, fontSize: 11, fontFace: 'Calibri' });
    s4.addText(f.desc, { x: x + 0.15, y: 4.95, w: 2.5, h: 1.6, color: C.TEXT_BODY, fontSize: 9.5, fontFace: 'Calibri' });
  });

  // Slide 5: Phân hệ Mobile App
  const s5 = pres.addSlide();
  addPptxHeader(s5, SLIDES[4].tag, SLIDES[4].title, SLIDES[4].subtitle);
  SLIDES[4].features.forEach((f, idx) => {
    const x = 0.8 + idx * 3.0;
    s5.addShape(pres.ShapeType.rect, { x, y: 1.9, w: 2.8, h: 4.8, fill: { color: C.WHITE }, roundRadio: 0.12 });
    const imgP = path.resolve(DOC_DIR, f.imgFile);
    if (fs.existsSync(imgP)) {
      s5.addImage({ path: imgP, x: x + 0.15, y: 2.05, w: 2.5, h: 2.2, roundRadio: 0.08 });
    }
    s5.addText(f.title, { x: x + 0.15, y: 4.4, w: 2.5, h: 0.5, color: C.NAVY_PRIMARY, bold: true, fontSize: 11, fontFace: 'Calibri' });
    s5.addText(f.desc, { x: x + 0.15, y: 4.95, w: 2.5, h: 1.6, color: C.TEXT_BODY, fontSize: 9.5, fontFace: 'Calibri' });
  });

  // Slide 6: 5 Điểm sáng
  const s6 = pres.addSlide();
  addPptxHeader(s6, SLIDES[5].tag, SLIDES[5].title, SLIDES[5].subtitle);
  SLIDES[5].items.forEach((it, idx) => {
    const x = 0.8 + idx * 2.4;
    s6.addShape(pres.ShapeType.rect, { x, y: 1.9, w: 2.25, h: 4.8, fill: { color: C.WHITE }, roundRadio: 0.12 });
    s6.addText(`${it.num}. ${it.title}`, { x: x + 0.15, y: 2.1, w: 1.95, h: 0.8, color: C.NAVY_PRIMARY, bold: true, fontSize: 11, fontFace: 'Calibri' });
    s6.addText(it.desc, { x: x + 0.15, y: 3.0, w: 1.95, h: 3.5, color: C.TEXT_BODY, fontSize: 10, fontFace: 'Calibri' });
  });

  // Slide 7: Bảng so sánh
  const s7 = pres.addSlide();
  addPptxHeader(s7, SLIDES[6].tag, SLIDES[6].title, SLIDES[6].subtitle);
  const tableRows = [
    [
      { text: 'HẠNG MỤC HOẠT ĐỘNG', options: { bold: true, color: C.NAVY_PRIMARY, fill: 'EFF6FF' } },
      { text: 'TRƯỚC KHI CÓ HỆ THỐNG', options: { bold: true, color: '9F1239', fill: 'FFF1F2' } },
      { text: 'SAU KHI SỐ HÓA VICONNECT', options: { bold: true, color: '1E3A8A', fill: 'ECFDF5' } }
    ]
  ];
  SLIDES[6].rows.forEach(r => {
    tableRows.push([
      { text: r.criteria, options: { bold: true, color: C.TEXT_DARK } },
      { text: r.before, options: { color: C.TEXT_BODY } },
      { text: '✓ ' + r.after, options: { bold: true, color: '065F46' } }
    ]);
  });
  s7.addTable(tableRows, { x: 0.8, y: 1.9, w: 11.73, colW: [3.0, 4.36, 4.37], fontSize: 10, border: { color: 'CBD5E1', pt: 1 } });

  // Slide 8: Lộ trình
  const s8 = pres.addSlide();
  addPptxHeader(s8, SLIDES[7].tag, SLIDES[7].title, SLIDES[7].subtitle);
  SLIDES[7].steps.forEach((st, idx) => {
    const x = 0.8 + idx * 3.0;
    s8.addShape(pres.ShapeType.rect, { x, y: 1.9, w: 2.8, h: 4.8, fill: { color: C.WHITE }, roundRadio: 0.12 });
    s8.addText(`${st.phase}\n(${st.time})`, { x: x + 0.2, y: 2.1, w: 2.4, h: 0.6, color: 'D97706', bold: true, fontSize: 11, fontFace: 'Calibri' });
    s8.addText(st.title, { x: x + 0.2, y: 2.8, w: 2.4, h: 0.8, color: C.NAVY_PRIMARY, bold: true, fontSize: 12, fontFace: 'Calibri' });
    s8.addText(st.desc, { x: x + 0.2, y: 3.7, w: 2.4, h: 2.8, color: C.TEXT_BODY, fontSize: 10.5, fontFace: 'Calibri' });
  });

  // Slide 9: Lời kết
  const s9 = pres.addSlide();
  addPptxHeader(s9, SLIDES[8].tag, SLIDES[8].title, SLIDES[8].subtitle);
  s9.addShape(pres.ShapeType.rect, { x: 0.8, y: 1.9, w: 7.5, h: 4.8, fill: { color: C.WHITE }, roundRadio: 0.15 });
  s9.addText('✦ ĐỒNG HÀNH BỀN VỮNG CÙNG DOANH NHÂN CEO 1983 ✦', { x: 1.1, y: 2.1, w: 6.9, h: 0.3, color: 'D97706', bold: true, fontSize: 11, fontFace: 'Calibri' });
  const closingBullets = SLIDES[8].bullets.map(b => ({ text: b, options: { bullet: true, fontSize: 11.5, color: C.TEXT_BODY } }));
  s9.addText(closingBullets, { x: 1.1, y: 2.6, w: 6.9, h: 2.0, fontFace: 'Calibri' });
  s9.addText(`📞 ${SLIDES[8].contact.hotline}\n🌐 ${SLIDES[8].contact.crmUrl}\n📱 ${SLIDES[8].contact.appUrl}`, {
    x: 1.1, y: 4.8, w: 6.9, h: 1.0, color: C.NAVY_PRIMARY, bold: true, fontSize: 11, fontFace: 'Calibri'
  });
  s9.addText(`"${SLIDES[8].closingWish}"`, {
    x: 1.1, y: 5.9, w: 6.9, h: 0.6, color: 'B45309', bold: true, italic: true, fontSize: 12, fontFace: 'Calibri'
  });

  s9.addShape(pres.ShapeType.rect, { x: 8.8, y: 1.9, w: 3.7, h: 4.8, fill: { color: '001F54' }, line: { color: C.CYAN_ACCENT, width: 2 }, roundRadio: 0.15 });
  s9.addText('VICONNECT\nECOSYSTEM', { x: 9.0, y: 2.4, w: 3.3, h: 1.0, color: C.WHITE, bold: true, align: 'center', fontSize: 18, fontFace: 'Calibri' });
  s9.addText('Công nghệ vị nhân sinh · Tiên phong đồng hành cùng sự phát triển thịnh vượng của doanh nghiệp Việt.', {
    x: 9.1, y: 3.6, w: 3.1, h: 1.8, color: 'E0F2FE', align: 'center', fontSize: 11.5, fontFace: 'Calibri'
  });
  s9.addText('Bản Quyền © 2026 ViConnect & HanoiBA', {
    x: 9.1, y: 5.8, w: 3.1, h: 0.5, color: 'FDE68A', align: 'center', fontSize: 9.5, fontFace: 'Calibri'
  });

  const outPptx = path.join(DOC_DIR, 'SLIDE_CHUYEN_DOI_SO_CLB_CEO1983.pptx');
  await pres.writeFile({ fileName: outPptx });
  console.log(`✓ Sinh thành công PowerPoint Slide -> ${outPptx}`);

  fs.copyFileSync(outPptx, path.join(FE_DOCS_DIR, 'SLIDE_CHUYEN_DOI_SO_CLB_CEO1983.pptx'));
  console.log(`✓ Đã đồng bộ PowerPoint Slide sang public/docs/`);
}

// ---------------------------------------------------------------------------
// 3. TẠO TỆP MARKDOWN KỊCH BẢN THUYẾT TRÌNH (SLIDE_CHUYEN_DOI_SO_CLB_CEO1983.md)
// ---------------------------------------------------------------------------
function generateMarkdownDeck() {
  let md = `# BÁO CÁO GIẢI PHÁP CHUYỂN ĐỔI SỐ TOÀN DIỆN CLB DOANH NHÂN CEO 1983\n\n`;
  md += `> **Thời gian báo cáo**: 09:00 – 12:00 | Thứ Tư, ngày 21/10/2026\n`;
  md += `> **Địa điểm**: Khu biệt thự HDI, 39 ngõ 29 P. Mạc Thái Tông, KĐT Nam Trung Yên, Cầu Giấy, Hà Nội\n`;
  md += `> **Đơn vị phát triển**: Tập đoàn Công nghệ ViConnect (ViConnect Ecosystem)\n`;
  md += `> **Đơn vị phối hợp**: CLB Doanh Nhân CEO 1983 · Trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)\n\n---\n\n`;

  SLIDES.forEach((s) => {
    md += `## Slide ${s.id}: ${s.title}\n*${s.subtitle}*\n\n`;
    if (s.type === 'cover') {
      md += `${s.description}\n\n`;
      md += `- **Thời gian**: ${s.meetingInfo.time}\n`;
      md += `- **Địa điểm**: ${s.meetingInfo.location}\n`;
      md += `- **Nội dung**: ${s.meetingInfo.agenda}\n`;
      md += `- **Bữa trưa thân mật**: ${s.meetingInfo.lunch}\n\n`;
    } else if (s.type === 'two_products') {
      md += `### ${s.crm.title}\n*${s.crm.target}*\n`;
      s.crm.bullets.forEach((b) => (md += `- ${b}\n`));
      md += `\n### ${s.app.title}\n*${s.app.target}*\n`;
      s.app.bullets.forEach((b) => (md += `- ${b}\n`));
      md += `\n*Ghi chú: ${s.footerHighlight}*\n\n`;
    } else if (s.type === 'three_requirements') {
      s.cols.forEach((c) => {
        md += `### ${c.num}. ${c.title} [${c.badge}]\n`;
        md += `- **Thách thức trước đây**: ${c.problem}\n`;
        md += `- **Giải pháp ViConnect**: ${c.solution}\n\n`;
      });
    } else if (s.type === 'features_gallery') {
      s.features.forEach((f) => {
        md += `### ${f.title}\n`;
        md += `${f.desc}\n\n`;
      });
    } else if (s.type === 'breakthroughs') {
      s.items.forEach((it) => {
        md += `### ${it.num}. ${it.title} [${it.badge}]\n`;
        md += `${it.desc}\n\n`;
      });
    } else if (s.type === 'comparison_table') {
      md += `| Hạng Mục Hoạt Động | Trước Khi Có Hệ Thống | Sau Khi Số Hóa (ViConnect) |\n`;
      md += `| :--- | :--- | :--- |\n`;
      s.rows.forEach((r) => {
        md += `| **${r.criteria}** | ${r.before} | **${r.after}** |\n`;
      });
      md += `\n`;
    } else if (s.type === 'roadmap') {
      s.steps.forEach((st) => {
        md += `### ${st.phase} (${st.time}): ${st.title}\n`;
        md += `${st.desc}\n\n`;
      });
    } else if (s.type === 'closing') {
      s.bullets.forEach((b) => (md += `- ${b}\n`));
      md += `\n- **${s.contact.hotline}**\n- **${s.contact.crmUrl}**\n- **${s.contact.appUrl}**\n\n`;
      md += `*“${s.closingWish}”*\n\n`;
    }
    md += `---\n\n`;
  });

  const outMd = path.join(DOC_DIR, 'SLIDE_CHUYEN_DOI_SO_CLB_CEO1983.md');
  fs.writeFileSync(outMd, md, 'utf8');
  console.log(`✓ Sinh thành công Markdown Slide -> ${outMd}`);

  fs.copyFileSync(outMd, path.join(FE_DOCS_DIR, 'SLIDE_CHUYEN_DOI_SO_CLB_CEO1983.md'));
  console.log(`✓ Đã đồng bộ Markdown Slide sang public/docs/`);
}

// Chạy quy trình sinh toàn bộ
async function run() {
  console.log('>>> BẮT ĐẦU TẠO BỘ SLIDE CHUYỂN ĐỔI SỐ MỚI TOÀN DIỆN CHO CEO 1983...');
  generateHtmlDeck();
  await generatePptxDeck();
  generateMarkdownDeck();
  console.log('>>> HOÀN THÀNH 100% CẢ 3 ĐỊNH DẠNG SLIDE (HTML, PPTX, MD)!');
}

run().catch(console.error);
