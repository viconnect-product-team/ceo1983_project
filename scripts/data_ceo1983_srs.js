/**
 * DATA_CEO1983_SRS.JS
 * ĐẶC TẢ TOÀN DIỆN YÊU CẦU PHẦN MỀM (SRS - SOFTWARE REQUIREMENTS SPECIFICATION)
 * Tiêu Chuẩn Quốc Tế: IEEE 830-1998 & ISO/IEC 25010
 * Hệ Sinh Thái Số Hóa & Quản Trị Hiệp Hội Doanh Nhân CEO 1983 (Trực thuộc HanoiBA)
 * Áp dụng nguyên tắc MECE (Mutually Exclusive, Collectively Exhaustive) 100% — Đầy Đủ 48 Use Cases
 */

const SRS_METADATA = {
  title: "SOFTWARE REQUIREMENTS SPECIFICATION (SRS)",
  subTitle: "HỆ SINH THÁI SỐ HÓA & QUẢN TRỊ HIỆP HỘI DOANH NHÂN CEO 1983",
  standard: "Tiêu Chuẩn Quốc Tế IEEE 830-1998 — Master Enterprise Specification",
  docCode: "SRS-IEEE830-CEO1983-MASTER-V5.0",
  version: "Version 5.0 (Bàn Giao Kỹ Thuật Đầy Đủ Chi Tiết 100% MECE)",
  date: "04/10/2026",
  organization: "Câu Lạc Bộ Doanh Nhân CEO 1983 (Trực thuộc Hội Doanh Nhân Trẻ Hà Nội — HanoiBA)",
  consultant: "Ban Công Nghệ Chuyển Đổi Số & ViConnect Platform",
  author: "Senior Business Analyst & System Architect (15+ Năm Kinh Nghiệm)",
  status: "Đã Phê Duyệt Kỹ Thuật & Khớp CSDL Thực Tế 100%",
};

// 1. DANH SÁCH 5 VAI TRÒ NGƯỜI DÙNG & MA TRẬN PHÂN QUYỀN RBAC
const USER_ROLES_DATA = [
  {
    roleCode: "quan_tri",
    roleName: "Ban Quản Trị Tối Cao (Superadmin)",
    target: "Chủ tịch CLB, Ban Thường Trực CLB Doanh Nhân CEO 1983",
    description: "Nắm giữ toàn quyền quản trị cao nhất trên toàn hệ sinh thái. Cấu hình các tham số hệ thống, phê duyệt các sự kiện cấp cao, duyệt ngân sách lớn và quản lý ma trận phân quyền 5 vai trò.",
    permissions: "Toàn quyền: Xem (Read), Tạo (Create), Chỉnh sửa (Update), Xóa (Delete), Phê duyệt (Approve), Cấu hình (Configure) trên tất cả 30 màn hình và API."
  },
  {
    roleCode: "admin",
    roleName: "Quản Trị Vận Hành (Executive Admin)",
    target: "Phó Chủ tịch Thường trực, Giám đốc Điều hành CLB",
    description: "Điều hành các hoạt động tác nghiệp hàng ngày của hiệp hội, giám sát báo cáo KPI, hỗ trợ kỹ thuật và phân bổ tài nguyên cho các ban chuyên môn.",
    permissions: "Quyền Xem, Tạo, Sửa, Duyệt trên các phân hệ Hội viên, Sự kiện, Cuộc họp, Sàn B2B, Công việc. Không có quyền xóa dữ liệu kiểm toán và hạ quyền Superadmin."
  },
  {
    roleCode: "tong_thu_ky",
    roleName: "Tổng Thư Ký / Ban Thư Ký (Secretariat)",
    target: "Tổng Thư Ký, Phó Tổng Thư Ký, Chánh Văn Phòng CLB",
    description: "Thường trực điều hành công tác hành chính, văn phòng, triệu tập đại biểu, khởi tạo cuộc họp, quản lý phòng họp Sapphire Hub, soạn thảo biên bản và nghị quyết. ĐẶC BIỆT: Tuyệt đối KHÔNG có quyền phê duyệt kết nạp hội viên.",
    permissions: "Toàn quyền trên phân hệ Cuộc họp, Phòng họp Sapphire Hub, Lịch công tác, Giao việc và Quản trị Kênh Thông Báo Ban Thư Ký ghim trên Mobile App. Bị chặn ở API duyệt hội viên."
  },
  {
    roleCode: "truong_ban",
    roleName: "Trưởng Ban Chuyên Môn (Committee Heads)",
    target: "Trưởng/Phó các ban: Ban Thành Viên (BTV), Ban Thiện Nguyện (BTN), Ban Truyền Thông (BTT), Ban Xúc Tiến (BXT), Ban Tài Chính (BTC)",
    description: "Quản lý tác nghiệp chuyên sâu theo từng ban: BTV độc quyền duyệt hội viên; BTT soát vé an ninh QR Gate và Lucky Draw; BXT duyệt sản phẩm sàn B2B và Cung - Cầu; BTN/BTC duyệt chi tiêu sổ quỹ.",
    permissions: "Phân quyền theo phạm vi chuyên trách (Scope-based RBAC) của từng ban. Không truy cập chéo vào các chức năng đặc thù của ban khác."
  },
  {
    roleCode: "member",
    roleName: "Hội Viên Chính Thức (Official Member)",
    target: "500+ Doanh nhân CEO 1983 chính danh (Đã được BTV duyệt và có trạng thái phí 'paid')",
    description: "Sử dụng Ứng dụng Di động Hội viên (Mobile App / PWA): Sở hữu Thẻ VIP 3D Titanium, Danh thiếp NFC, đặt vé sự kiện Gala, đăng bán sản phẩm B2B, gửi cơ hội kinh doanh, nhắn tin Messenger #0084FF và biểu quyết đại hội.",
    permissions: "Quyền truy cập đầy đủ các chức năng dành cho hội viên trên Mobile App. Bị giới hạn không truy cập vào Cổng Web CRM Quản trị."
  },
  {
    roleCode: "guest",
    roleName: "Khách Vãng Lai & Ứng Viên (Guest / Applicant)",
    target: "Doanh nhân 1983 đang nộp hồ sơ gia nhập, Khách mời sự kiện",
    description: "Xem cổng thông tin công khai, điền đơn đăng ký gia nhập trực tuyến, tra cứu danh bạ doanh nghiệp công khai và đăng ký vé sự kiện mở rộng.",
    permissions: "Chỉ truy cập các màn hình và API công khai (`/landing`, `/card/:slug`, `/events/public`)."
  }
];

// 2. NĂM HÀNH TRÌNH NGƯỜI DÙNG TOÀN DIỆN (END-TO-END USER JOURNEYS)
const USER_JOURNEYS_DATA = [
  {
    journeyId: "UJ-01",
    name: "Hành Trình Tiếp Nhận Ứng Viên ➔ Thẩm Định BTV ➔ Phê Duyệt Cấp Mã ➔ Đăng Nhập Lần Đầu",
    targetRole: "Ứng viên 1983, Ban Thành Viên (BTV)",
    steps: [
      "Bước 1: Ứng viên truy cập Cổng tiếp nhận hồ sơ trực tuyến tại https://14.225.217.232:5444/landing?apply=true.",
      "Bước 2: Ứng viên điền biểu mẫu điện tử gồm 9 trường: Họ tên, Ngày tháng năm sinh (Bắt buộc năm 1983), SĐT, Email, Tên doanh nghiệp, Mã số thuế, Chức vụ, Lĩnh vực kinh doanh, Nguyện vọng chuyên ban.",
      "Bước 3: Nhấn nút 'Gửi Đơn Đăng Ký'. Hệ thống kiểm tra hợp lệ client/server, lưu bản ghi vào CSDL ở trạng thái pending, máy chủ SMTP tự động gửi Thư điện tử xác nhận tiếp nhận kèm Mã tra cứu đến email ứng viên.",
      "Bước 4: Cán bộ Ban Thành Viên (ceo.thanhvien@ceo1983.com) đăng nhập Web CRM, vào màn hình 'Quản Lý Hội Viên' (/members), mở ngăn kéo xem chi tiết hồ sơ ứng viên.",
      "Bước 5: BTV đối soát thông tin pháp nhân trên Cổng ĐKKD quốc gia, kiểm tra MST và uy tín doanh nghiệp. Nhấn nút 'Phê Duyệt Kết Nạp'.",
      "Bước 6: Hệ thống kiểm tra quyền hạn BTV, tự động sinh Mã hội viên chuẩn CEO-83xxx, kích hoạt tài khoản status = 'active', tạo mật khẩu ngẫu nhiên bảo mật cao và gửi Email Chào mừng kèm thông tin đăng nhập.",
      "Bước 7: Hội viên tải và mở Ứng dụng Di động CEO 1983, đăng nhập bằng Email/SĐT và mật khẩu tạm. Hệ thống chuyển hướng bắt buộc đổi mật khẩu mới tại QuickProfileEditModal trước khi vào trang chủ."
    ]
  },
  {
    journeyId: "UJ-02",
    name: "Hành Trình Thông Báo Hội Phí ➔ Thanh Toán VietQR 24/7 ➔ Kế Toán Đối Soát Gạch Nợ (+365 Ngày)",
    targetRole: "Hội viên chính thức, Ban Tài Chính / Kế Toán",
    steps: [
      "Bước 1: Hệ thống tự động quét ngày hết hạn thẻ VIP (term_end). Trước 30 ngày, hệ thống kích hoạt thông báo đẩy trên Mobile App và email thông báo nộp hội phí thường niên (5.000.000 VNĐ/năm).",
      "Bước 2: Hội viên mở mục 'Hội Phí' trên Mobile App, nhấn nút 'Thanh Toán VietQR'.",
      "Bước 3: Hệ thống sinh mã VietQR động chuẩn Napas 24/7 chứa sẵn: Số tiền (5.000.000 VNĐ), Số tài khoản thụ hưởng của CLB CEO 1983 và Cú pháp: HOIPHI CEO1983 [MÃ_HV] [HỌ_TÊN].",
      "Bước 4: Hội viên sử dụng ứng dụng Mobile Banking của ngân hàng cá nhân, quét mã QR và chuyển khoản thành công.",
      "Bước 5: Kế toán câu lạc bộ mở màn hình 'Quản Lý Hội Phí' (/fees) trên Web CRM, kiểm tra giao dịch tương ứng trên sao kê tài khoản ngân hàng thực tế.",
      "Bước 6: Khi thông tin khớp đúng, kế toán bấm nút 'Duyệt Gạch Nợ'.",
      "Bước 7: Hệ thống chuyển trạng thái sang paid, cộng dồn +365 ngày vào hạn dùng của Thẻ hội viên VIP (term_end), sinh hóa đơn điện tử (invoices) và gửi thông báo xác nhận thành công cho hội viên."
    ]
  },
  {
    journeyId: "UJ-03",
    name: "Hành Trình Khởi Tạo Sự Kiện Gala ➔ Thiết Kế Sơ Đồ Ghế ➔ Phát Hành E-Ticket ➔ Soát Vé Gate Check-in QR (< 0.2s)",
    targetRole: "Ban Truyền Thông (BTT), Ban Thư Ký (BTK), Hội viên tham dự",
    steps: [
      "Bước 1: Ban Truyền Thông khởi tạo sự kiện Gala trên Web CRM (/events), thiết lập timeline chương trình, diễn giả VIP và cấu hình các hạng vé (VIP Đại biểu, Hội viên chính thức, Khách mời có phí).",
      "Bước 2: Mở công cụ 'Cinema Seating Map' (/events/seating), kéo thả bố trí bàn tiệc tròn 10 chỗ (Bàn VIP 1 đến VIP 6 cho Lãnh đạo Thành ủy, HanoiBA), dãy ghế đại biểu danh dự và các bàn hội viên.",
      "Bước 3: Hội viên mở Mobile App, xem thông tin sự kiện Gala, chọn vị trí ngồi và nhấn 'Đăng Ký Tham Dự'.",
      "Bước 4: Hệ thống phát hành Vé điện tử E-Ticket QR lưu trong mục 'Vé Của Tôi' (hỗ trợ hiển thị offline). Vé chứa mã QR mã hóa bảo mật độc bản và mã số may mắn (#LUCKY-xxxx).",
      "Bước 5: Tại sảnh đón tiếp sự kiện Gala, cán bộ an ninh BTT mở màn hình Cổng Soát Vé QR Gate (/checkin) trên máy tính bảng hoặc máy tính có camera.",
      "Bước 6: Quét mã QR trên điện thoại của đại biểu. Tốc độ nhận diện < 0.2s: Màn hình bừng sáng XANH LỤC, hiển thị Họ tên, Đơn vị và Số bàn tiệc VIP; nếu quét lại lần 2, màn hình báo ĐỎ RỰC cảnh báo gian lận trùng vé.",
      "Bước 7: Danh sách đại biểu ĐÃ CHECK-IN THỰC TẾ tự động đồng bộ vào Vòng quay may mắn (Lucky Draw) trên sân khấu đại hội."
    ]
  },
  {
    journeyId: "UJ-04",
    name: "Hành Trình Kết Nối Giao Thương B2B ➔ Chạm Danh Thiếp NFC ➔ Trao Đổi Cơ Hội Cung - Cầu 1-on-1",
    targetRole: "Hội viên Doanh nhân CEO 1983",
    steps: [
      "Bước 1: Hai hội viên gặp gỡ trực tiếp, chạm mặt sau thẻ thông minh NFC vào điện thoại đối tác.",
      "Bước 2: Điện thoại đối tác tự động mở trang Danh thiếp số công khai (/card/:code) hiển thị đầy đủ thông tin: Họ tên, Chức vụ, Logo công ty, Hồ sơ năng lực, Sản phẩm tiêu biểu và Nút 'Lưu Danh Bạ'.",
      "Bước 3: Đối tác bấm 'Lưu Danh Bạ', hệ thống xuất ngay tệp vCard (.vcf) tự động nhập đầy đủ thông tin vào danh bạ điện thoại trong 1 giây.",
      "Bước 4: Đối tác bấm 'Kết Nối B2B', chọn nhu cầu hợp tác và gửi lời mời kết nối kinh doanh 1-on-1.",
      "Bước 5: Hội viên nhận được thông báo đẩy, mở Hộp Thư Messenger #0084FF và bấm 'Chấp Nhận Lời Mời'.",
      "Bước 6: Hai hội viên trao đổi tin nhắn, tài liệu báo giá thời gian thực hoặc đăng bài lên Bảng tin Cơ hội Cung - Cầu để hiệp hội bảo chứng giao dịch."
    ]
  },
  {
    journeyId: "UJ-05",
    name: "Hành Trình Đại Hội Toàn Thể ➔ Biểu Quyết Trực Tuyến ➔ Công Bố Kết Quả Thời Gian Thực (Live 1s)",
    targetRole: "Ban Thư Ký (BTK), Hội viên chính thức",
    steps: [
      "Bước 1: Ban Thư Ký tạo phiên biểu quyết trên Web CRM: Nhập tiêu đề nghị quyết đại hội, danh sách ứng viên Ban Chấp Hành nhiệm kỳ mới và thiết lập thời gian mở/đóng hòm phiếu.",
      "Bước 2: Khi Chủ tọa đại hội phát lệnh, Ban Thư Ký bấm 'Kích Hoạt Phiên Bầu Cử'. Toàn bộ 500+ hội viên chính thức nhận được thông báo đẩy trên Mobile App.",
      "Bước 3: Hội viên mở màn hình Biểu Quyết (/association/voting), xem chi tiết tờ trình nghị quyết, tích chọn các phương án (Đồng ý / Không đồng ý / Ý kiến khác) và bấm 'Xác Nhận Bỏ Phiếu'.",
      "Bước 4: Hệ thống mã hóa một chiều phiếu bầu (Đảm bảo nguyên tắc 1 người 1 phiếu và ẩn danh tuyệt đối), khóa nút biểu quyết trên máy hội viên.",
      "Bước 5: Máy chủ Socket.IO tổng hợp kết quả tức thời. Màn hình LED trung tâm của Đại hội hiển thị biểu đồ tỷ lệ phần trăm (%) nhảy động thời gian thực với độ trễ dưới 1 giây, công bố kết quả minh bạch 100%."
    ]
  }
];

// 3. TOÀN BỘ 48 USE CASES CHI TIẾT (MECE 100% TOÀN DỰ ÁN CEO 1983)
// Mỗi bước đều có định dạng chuẩn "Bước X: ..." và xuống dòng độc lập!
const ALL_USE_CASES_DETAILED = [
  // -------------------------------------------------------------
  // PHÂN HỆ 1: CỔNG THÔNG TIN CÔNG KHAI (PUBLIC PORTAL - 5 UCs)
  // -------------------------------------------------------------
  {
    ucId: "UC-PUB-01",
    module: "Phân hệ 1: Cổng Thông Tin Công Khai & Tiếp Nhận Ứng Viên",
    name: "Khám Phá Cổng Thông Tin & Giới Thiệu Tôn Chỉ CLB CEO 1983",
    description: "Cung cấp cổng thông tin đối ngoại chính thức giới thiệu về lịch sử hình thành, ban lãnh đạo, 6 ban chuyên môn và các hoạt động tiêu biểu của CLB CEO 1983.",
    actors: "Khách vãng lai, Doanh nhân ứng viên, Công chúng",
    preConditions: "Người dùng có thiết bị kết nối Internet và trình duyệt web tiêu chuẩn.",
    inputs: [
      { field: "URL truy cập", type: "String", req: true, val: "https://14.225.217.232:5444/landing" }
    ],
    mainFlow: [
      "Bước 1: Người dùng truy cập đường dẫn trang chủ Cổng thông tin công khai.",
      "Bước 2: Hệ thống tải tài nguyên tĩnh, render Banner nhận diện thương hiệu Navy & Gold.",
      "Bước 3: Hiển thị thông điệp Chủ tịch CLB, Tôn chỉ 'Bản lĩnh - Tiên phong - Kết nối - Phát triển'.",
      "Bước 4: Hiển thị thông tin giới thiệu 6 Ban chuyên môn tác nghiệp và các số liệu thống kê quy mô (500+ hội viên, tổng giá trị giao thương).",
      "Bước 5: Hiển thị các khối nội dung: Sự kiện sắp diễn ra, Tin tức hoạt động và Nút CTA 'Đăng Ký Gia Nhập'."
    ],
    alternativeFlows: [
      "Bước A1: Người dùng chuyển đổi ngôn ngữ hiển thị (Tiếng Việt / English)."
    ],
    exceptionFlows: [
      "Bước E1: Mất kết nối mạng Internet -> Trình duyệt kích hoạt Service Worker hiển thị màn hình Offline thân thiện."
    ],
    postConditions: "Khách nắm bắt được đầy đủ thông tin uy tín của CLB Doanh Nhân CEO 1983.",
    businessRules: "RULE-UI-ROYAL-NAVY-GOLD: Phải tuân thủ bộ nhận diện Xanh Navy #003B95 và Amber Gold #F59E0B.",
    techMapping: "Route: `/landing` | Component: `LandingPage.tsx` | Method: GET"
  },
  {
    ucId: "UC-PUB-02",
    module: "Phân hệ 1: Cổng Thông Tin Công Khai & Tiếp Nhận Ứng Viên",
    name: "Nộp Hồ Sơ Đăng Ký Gia Nhập Hội Viên Chính Thức (e-Form 1983)",
    description: "Tiếp nhận đơn đăng ký gia nhập câu lạc bộ từ các doanh nhân sinh năm 1983 thông qua biểu mẫu chuẩn hóa e-Form.",
    actors: "Doanh nhân ứng viên sinh năm 1983",
    preConditions: "Ứng viên truy cập Cổng tiếp nhận hồ sơ tại `/landing?apply=true`.",
    inputs: [
      { field: "fullName", type: "String (2-100 chars)", req: true, val: "Không chứa ký tự đặc biệt" },
      { field: "birthYear", type: "Integer", req: true, val: "Bắt buộc chính xác là năm 1983" },
      { field: "phone", type: "String (10 digits)", req: true, val: "Định dạng số điện thoại di động Việt Nam" },
      { field: "email", type: "String", req: true, val: "Email doanh nghiệp chuẩn RFC 5322" },
      { field: "companyName", type: "String", req: true, val: "Tên pháp nhân theo ĐKKD" },
      { field: "taxCode", type: "String (10-13 digits)", req: true, val: "Mã số thuế doanh nghiệp hợp lệ" },
      { field: "position", type: "String", req: true, val: "Chức vụ lãnh đạo (Chủ tịch, TGĐ, Giám đốc)" },
      { field: "industry", type: "String", req: true, val: "Lĩnh vực ngành nghề kinh doanh cốt lõi" },
      { field: "committeePreference", type: "String", req: false, val: "Thuộc 1 trong 6 ban chuyên môn" }
    ],
    mainFlow: [
      "Bước 1: Ứng viên mở biểu mẫu đăng ký gia nhập trên Cổng thông tin công khai.",
      "Bước 2: Điền đầy đủ và chính xác toàn bộ 9 trường dữ liệu bắt buộc.",
      "Bước 3: Tích chọn cam kết tuân thủ Điều lệ của CLB Doanh Nhân CEO 1983 và HanoiBA.",
      "Bước 4: Nhấn nút 'Gửi Hồ Sơ Đăng Ký'.",
      "Bước 5: Hệ thống thực hiện kiểm tra tính hợp lệ dữ liệu (Validation) ở cả Client và Server.",
      "Bước 6: Hệ thống tạo bản ghi mới trong bảng `members` với trạng thái `status = 'pending'`, `fee_paid = false`.",
      "Bước 7: Kích hoạt dịch vụ SMTP Mailer tự động gửi email xác nhận đến hòm thư ứng viên kèm Mã tra cứu hồ sơ.",
      "Bước 8: Hiển thị thông báo tiếp nhận thành công trên màn hình kèm hướng dẫn các bước thẩm định tiếp theo."
    ],
    alternativeFlows: [
      "Bước A1: Ứng viên tải kèm ảnh Giấy phép đăng ký kinh doanh (.pdf hoặc .jpg) lên MinIO Storage."
    ],
    exceptionFlows: [
      "Bước E1: Năm sinh khác 1983 -> Báo lỗi: 'CLB CEO 1983 chỉ tiếp nhận hội viên sinh năm Quý Hợi 1983'.",
      "Bước E2: Email hoặc Số điện thoại đã tồn tại trong CSDL -> Báo lỗi: 'Thông tin này đã được đăng ký, vui lòng liên hệ Ban Thành Viên'.",
      "Bước E3: Định dạng mã số thuế không hợp lệ -> Báo lỗi: 'Mã số thuế phải có độ dài từ 10 đến 13 chữ số'."
    ],
    postConditions: "Hồ sơ ứng viên được lưu trữ an toàn trong CSDL ở trạng thái pending, sẵn sàng cho Ban Thành Viên thẩm định.",
    businessRules: "RULE-MEMBER-BIRTHYEAR-1983: Kiểm tra nghiêm ngặt năm sinh 1983.",
    techMapping: "API: `POST /api/association/applications` | Tables: `members`, `activity_log`"
  },
  {
    ucId: "UC-PUB-03",
    module: "Phân hệ 1: Cổng Thông Tin Công Khai & Tiếp Nhận Ứng Viên",
    name: "Tự Động Phát Hành Email Tiếp Nhận Hồ Sơ Qua SMTP Relay",
    description: "Hệ thống máy chủ dịch vụ tự động phát hành email xác nhận ngay khi ứng viên nộp hồ sơ đăng ký thành công.",
    actors: "Máy chủ dịch vụ SMTP Mailer ngầm định (Backend Service)",
    preConditions: "Bản ghi đăng ký [UC-PUB-02] được tạo thành công trong CSDL.",
    inputs: [
      { field: "recipientEmail", type: "String", req: true, val: "Email ứng viên vừa đăng ký" },
      { field: "applicantName", type: "String", req: true, val: "Họ và tên ứng viên" },
      { field: "applicationId", type: "String UUID", req: true, val: "Mã định danh hồ sơ hệ thống cấp" }
    ],
    mainFlow: [
      "Bước 1: Sự kiện APPLICATION_SUBMITTED kích hoạt Job trong hàng đợi xử lý thư tín.",
      "Bước 2: Dịch vụ nạp Template email HTML thương hiệu CEO 1983 (Màu Navy/Gold, Logo HanoiBA).",
      "Bước 3: Điền thông tin cá nhân hóa: Họ tên, Tên doanh nghiệp, Mã tra cứu hồ sơ và Quy trình thẩm định 4 bước.",
      "Bước 4: Kết nối an toàn đến cổng SMTP Relay bảo mật (smtp.gmail.com:465 qua SSL/TLS).",
      "Bước 5: Phát hành thư điện tử đến hộp thư ứng viên.",
      "Bước 6: Ghi nhận nhật ký gửi thư thành công vào bảng `activity_log`."
    ],
    alternativeFlows: [
      "Bước A1: Hòm thư nhận tạm thời không liên lạc được -> Xếp hàng thử lại sau 5 phút (Tối đa 3 lần)."
    ],
    exceptionFlows: [
      "Bước E1: Lỗi xác thực SMTP hoặc mất kết nối mạng -> Ghi nhận lỗi vào hệ thống giám sát và thông báo quản trị viên."
    ],
    postConditions: "Ứng viên nhận được thư xác nhận chính thức trong hộp thư đến (Inbox) trong vòng dưới 10 giây.",
    businessRules: "Đảm bảo tỷ lệ gửi thư thành công đạt > 99.5%, tránh rơi vào hòm thư rác (Spam).",
    techMapping: "Service: `mailer.service.ts` | Config: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`"
  },
  {
    ucId: "UC-PUB-04",
    module: "Phân hệ 1: Cổng Thông Tin Công Khai & Tiếp Nhận Ứng Viên",
    name: "Tra Cứu Danh Bạ Doanh Nghiệp Hội Viên Công Khai (Chống Lộ SĐT)",
    description: "Cho phép đối tác và công chúng tra cứu thông tin năng lực cung ứng của các doanh nghiệp thành viên chính thức.",
    actors: "Khách vãng lai, Đối tác tìm kiếm nhà cung cấp",
    preConditions: "Cổng thông tin công khai đang hoạt động.",
    inputs: [
      { field: "keyword", type: "String", req: false, val: "Từ khóa: Tên doanh nghiệp, ngành nghề, mã số thuế" },
      { field: "industryFilter", type: "String", req: false, val: "Lọc theo danh mục ngành nghề" }
    ],
    mainFlow: [
      "Bước 1: Người dùng nhập từ khóa tìm kiếm hoặc chọn ngành nghề cần tra cứu.",
      "Bước 2: Hệ thống thực hiện truy vấn bảng `companies` kết hợp `members` với điều kiện `status = 'active'` và `is_verified = true`.",
      "Bước 3: Hiển thị danh sách kết quả dạng lưới: Logo doanh nghiệp, Tên công ty, Lĩnh vực, Chức vụ lãnh đạo và Địa chỉ trụ sở.",
      "Bước 4: Người dùng bấm vào từng doanh nghiệp để xem Hồ sơ năng lực chi tiết (Ẩn số điện thoại cá nhân theo chính sách bảo mật)."
    ],
    alternativeFlows: [
      "Bước A1: Không tìm thấy kết quả -> Hiển thị thông báo gợi ý mở rộng phạm vi tìm kiếm."
    ],
    exceptionFlows: [
      "Bước E1: Lỗi timeout truy vấn cơ sở dữ liệu -> Trả về danh sách rỗng kèm thông báo thử lại."
    ],
    postConditions: "Đối tác tiếp cận được thông tin doanh nghiệp thành viên uy tín.",
    businessRules: "Chỉ hiển thị doanh nghiệp của hội viên chính thức đã được Ban Thành Viên xác thực.",
    techMapping: "API: `GET /api/association/public-directory` | Table: `companies`, `members`"
  },
  {
    ucId: "UC-PUB-05",
    module: "Phân hệ 1: Cổng Thông Tin Công Khai & Tiếp Nhận Ứng Viên",
    name: "Khám Phá Sự Kiện Mở Rộng & Đăng Ký Vé Dành Cho Khách Mời",
    description: "Cho phép khách vãng lai xem lịch trình các sự kiện hội thảo mở rộng và đăng ký mua vé tham dự trực tuyến.",
    actors: "Khách mời, Doanh nhân ngoài hiệp hội",
    preConditions: "Sự kiện được cấu hình cho phép khách mời công chúng đăng ký.",
    inputs: [
      { field: "guestName", type: "String", req: true, val: "Họ và tên khách mời" },
      { field: "guestPhone", type: "String", req: true, val: "Số điện thoại liên hệ" },
      { field: "guestEmail", type: "String", req: true, val: "Email nhận vé điện tử" },
      { field: "ticketTypeId", type: "String", req: true, val: "Gói vé khách mời có phí" }
    ],
    mainFlow: [
      "Bước 1: Khách truy cập mục Sự Kiện trên Cổng thông tin công khai.",
      "Bước 2: Chọn sự kiện hội nghị / Gala quan tâm, bấm 'Đăng Ký Tham Dự'.",
      "Bước 3: Điền thông tin cá nhân và chọn số lượng vé khách mời.",
      "Bước 4: Màn hình hiển thị mã VietQR thanh toán tiền vé theo số lượng.",
      "Bước 5: Khách chuyển khoản quét mã VietQR, hệ thống ghi nhận đăng ký ở trạng thái `pending_payment`.",
      "Bước 6: Kế toán đối soát và duyệt phát hành vé E-Ticket QR gửi qua email khách mời."
    ],
    alternativeFlows: [],
    exceptionFlows: [
      "Bước E1: Sự kiện đã hết số lượng vé khách mời -> Báo lỗi: 'Vé dành cho khách mời đã hết'."
    ],
    postConditions: "Khách mời nhận được vé QR điện tử qua email để check-in tại cửa sự kiện.",
    businessRules: "Khách mời bắt buộc hoàn tất thanh toán trước khi nhận vé.",
    techMapping: "API: `POST /api/association/events/:id/guest-register` | Table: `event_registrations`"
  },

  // -------------------------------------------------------------
  // PHÂN HỆ 2: CỔNG QUẢN TRỊ TRUNG TÂM (WEB CRM - 23 UCs)
  // -------------------------------------------------------------
  {
    ucId: "UC-CRM-AUTH-01",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Đăng Nhập Quản Trị Web CRM & Khóa Chống Brute-force 5 Lần",
    description: "Xác thực danh tính của cán bộ quản lý (BQT, BTK, Trưởng các ban) trước khi cấp quyền truy cập hệ thống CRM.",
    actors: "Ban Quản Trị, Ban Thư Ký, Trưởng các Ban chuyên môn",
    preConditions: "Người dùng đã được cấp tài khoản quản trị và tài khoản ở trạng thái active.",
    inputs: [
      { field: "usernameOrEmail", type: "String", req: true, val: "Email công vụ hoặc Mã hội viên quản trị" },
      { field: "password", type: "String", req: true, val: "Mật khẩu quản trị (Tối thiểu 8 ký tự)" }
    ],
    mainFlow: [
      "Bước 1: Cán bộ quản lý truy cập Cổng Quản trị CRM tại https://14.225.217.232:5443.",
      "Bước 2: Nhập Email/Tên đăng nhập và Mật khẩu.",
      "Bước 3: Bấm nút 'Đăng Nhập Hệ Thống'.",
      "Bước 4: Hệ thống truy vấn bảng `vione_users`, lấy chuỗi băm mật khẩu và so khớp bằng thuật toán `bcrypt.compare()`.",
      "Bước 5: Kiểm tra vai trò tài khoản trong `user_roles`: Bắt buộc phải thuộc 1 trong các vai trò quản trị (quan_tri, admin, tong_thu_ky, truong_ban).",
      "Bước 6: Khởi tạo cặp mã khóa JWT: Access Token (thời hạn 15 phút) và Refresh Token (thời hạn 7 ngày).",
      "Bước 7: Lưu thông tin phiên làm việc an toàn trong Cookie HttpOnly và LocalStorage.",
      "Bước 8: Ghi nhận bản ghi nhật ký đăng nhập vào `audit_logs` (User, IP, User-Agent, Timestamp).",
      "Bước 9: Chuyển hướng người dùng vào Bàn làm việc Dashboard trung tâm (/)."
    ],
    alternativeFlows: [
      "Bước A1: Người dùng tích chọn 'Ghi nhớ đăng nhập' -> Tăng thời hạn Refresh Token lên 30 ngày."
    ],
    exceptionFlows: [
      "Bước E1: Sai mật khẩu hoặc tài khoản không tồn tại -> Báo lỗi: 'Email hoặc mật khẩu không chính xác'.",
      "Bước E2: Nhập sai mật khẩu liên tiếp quá 5 lần -> Tạm khóa tài khoản trong 15 phút chống tấn công Brute-force.",
      "Bước E3: Tài khoản có vai trò member cố tình đăng nhập CRM -> Báo lỗi HTTP 403: 'Tài khoản không có thẩm quyền truy cập Cổng Quản Trị'."
    ],
    postConditions: "Cán bộ quản trị thiết lập phiên làm việc hợp lệ và truy cập các chức năng quản trị theo phân quyền.",
    businessRules: "Áp dụng cơ chế phòng vệ tự động chống dò quét mật khẩu (Rate Limiting).",
    techMapping: "API: `POST /api/auth/login` | Tables: `vione_users`, `user_roles`, `audit_logs`"
  },
  {
    ucId: "UC-CRM-DASH-01",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Bàn Làm Việc Tổng Quan (Dashboard KPI & Cơ Cấu 6 Chuyên Ban)",
    description: "Hiển thị bức tranh toàn cảnh về tình hình hoạt động của hiệp hội: Quy mô hội viên, tiến độ thu hội phí, giá trị giao thương B2B và các sự kiện sắp tới.",
    actors: "Ban Quản Trị, Ban Thư Ký, Trưởng các Ban chuyên môn",
    preConditions: "Đã đăng nhập thành công vào Cổng Quản trị CRM.",
    inputs: [
      { field: "timeRange", type: "Enum", req: false, val: "Tuần này | Tháng này | Quý này | Năm nay" }
    ],
    mainFlow: [
      "Bước 1: Người dùng mở trang chủ Dashboard CRM (`/` hoặc `/dashboard`).",
      "Bước 2: Hệ thống truy vấn song song dữ liệu từ các phân hệ:",
      "   - Tổng số hội viên chính thức và tỷ lệ tăng trưởng trong tháng.",
      "   - Tỷ lệ hoàn thành nghĩa vụ hội phí thường niên (Số tiền đã thu / Kế hoạch năm).",
      "   - Tổng giá trị kết nối giao thương B2B nội bộ được ghi nhận.",
      "   - Biểu đồ phân bổ hội viên theo 6 Ban chuyên môn và theo phân khúc ngành nghề.",
      "Bước 3: Hiển thị danh sách các việc cần xử lý ngay: Hồ sơ chờ BTV duyệt, Phiếu chi chờ duyệt, Lịch họp sắp diễn ra.",
      "Bước 4: Người dùng bấm vào từng thẻ KPI để điều hướng nhanh đến phân hệ tương ứng."
    ],
    alternativeFlows: [],
    exceptionFlows: [
      "Bước E1: Lỗi kết nối dịch vụ thống kê -> Hiển thị thông báo và nút 'Tải lại dữ liệu'."
    ],
    postConditions: "Lãnh đạo nắm bắt kịp thời các chỉ số điều hành then chốt.",
    businessRules: "Dữ liệu thống kê được làm mới tự động sau mỗi 60 giây.",
    techMapping: "Route: `/dashboard` | API: `GET /api/association/dashboard-stats`"
  },
  {
    ucId: "UC-CRM-MBR-01",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Quản Lý Danh Sách Hội Viên Đa Chiều & Bộ Lọc Nâng Cao",
    description: "Cung cấp bảng dữ liệu toàn diện 500+ hội viên với bộ lọc đa điều kiện, hỗ trợ cuộn ngang chuẩn với Cột STT cố định bên trái và Cột Thao tác cố định bên phải.",
    actors: "Ban Quản Trị, Ban Thành Viên, Ban Thư Ký",
    preConditions: "Đăng nhập Cổng Quản trị CRM với vai trò có quyền xem danh sách hội viên.",
    inputs: [
      { field: "committee", type: "String", req: false, val: "Lọc theo 1 trong 6 ban chuyên môn" },
      { field: "paymentStatus", type: "String", req: false, val: "Lọc: Tất cả / Đã đóng (paid) / Chưa đóng (unpaid)" },
      { field: "tier", type: "String", req: false, val: "Hạng hội viên: Kim Cương / Vàng / Bạc / Tiêu Chuẩn" },
      { field: "keyword", type: "String", req: false, val: "Tìm kiếm theo Họ tên, Mã HV, SĐT, Tên công ty, MST" },
      { field: "page", type: "Integer", req: false, val: "Số trang phân trang (Mặc định: 1, 20 bản ghi/trang)" }
    ],
    mainFlow: [
      "Bước 1: Người dùng mở màn hình 'Danh Sách Hội Viên' (/members) trên CRM.",
      "Bước 2: Hệ thống tải danh sách hội viên kèm các chỉ số KPI tóm tắt trên đầu trang (Tổng số hội viên, Số hội viên mới tháng này, Tỷ lệ hoàn thành hội phí).",
      "Bước 3: Hiển thị bảng dữ liệu: Cột STT ghim cố định bên trái; các cột dữ liệu: Mã HV, Họ tên, Chức vụ, Tên doanh nghiệp, SĐT, Ban chuyên môn, Trạng thái hội phí, Hạng hội viên; Cột 'Thao Tác' ghim cố định bên phải.",
      "Bước 4: Người dùng áp dụng các bộ lọc hoặc nhập từ khóa tìm kiếm.",
      "Bước 5: Bảng dữ liệu tự động cập nhật kết quả trong thời gian < 100ms."
    ],
    alternativeFlows: [
      "Bước A1: Người dùng nhấn nút 'Xuất Excel' -> Hệ thống xuất file bảng tính `.xlsx` danh sách theo đúng bộ lọc đang chọn."
    ],
    exceptionFlows: [
      "Bước E1: Không tìm thấy bản ghi phù hợp -> Hiển thị hình ảnh trạng thái rỗng và nút 'Đặt lại bộ lọc'."
    ],
    postConditions: "Cán bộ quản lý nắm bắt chính xác dữ liệu hội viên phục vụ điều hành.",
    businessRules: "Bảng dữ liệu phải có thiết kế cuộn ngang mượt mà, không bị che khuất nút thao tác.",
    techMapping: "Route: `/members` | API: `GET /api/association/members` | Table: `members`"
  },
  {
    ucId: "UC-CRM-MBR-02",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Thẩm Định & Phê Duyệt Kết Nạp Hội Viên Mới (Độc Quyền BTV)",
    description: "Thẩm định tính hợp lệ của hồ sơ ứng viên và phê duyệt kết nạp chính thức, cấp mã hội viên định danh CEO-83xxx. Chức năng ĐỘC QUYỀN của Ban Thành Viên.",
    actors: "Trưởng Ban Thành Viên (ceo.thanhvien@ceo1983.com) hoặc Superadmin",
    preConditions: "Hồ sơ ứng viên đang ở trạng thái pending trong danh sách chờ duyệt.",
    inputs: [
      { field: "memberId", type: "String", req: true, val: "Mã định danh hồ sơ cần duyệt" },
      { field: "assignedCommittee", type: "String", req: true, val: "Chuyên ban chỉ định sinh hoạt (1 trong 6 ban)" },
      { field: "memberTier", type: "String", req: true, val: "Hạng hội viên ban đầu (Mặc định: Tiêu Chuẩn)" }
    ],
    mainFlow: [
      "Bước 1: Cán bộ BTV mở tab 'Chờ Thẩm Định' trên màn hình Quản lý hội viên.",
      "Bước 2: Bấm vào hồ sơ ứng viên để mở Ngăn kéo chi tiết (Drawer) hiển thị toàn bộ thông tin đăng ký.",
      "Bước 3: BTV kiểm tra: Năm sinh (chính xác 1983), Mã số thuế, Năng lực doanh nghiệp và uy tín kinh doanh.",
      "Bước 4: BTV lựa chọn Ban chuyên môn sinh hoạt phù hợp và bấm nút 'Phê Duyệt Kết Nạp'.",
      "Bước 5: Hệ thống kiểm tra quyền hạn của người thực hiện (Bắt buộc phải là BTV hoặc BQT; CHẶN TUYỆT ĐỐI NẾU LÀ BAN THƯ KÝ HOẶC BAN KHÁC).",
      "Bước 6: Hệ thống thực hiện chuỗi giao dịch nguyên tử (Atomic Transaction):",
      "   - Tự động sinh Mã hội viên chuẩn: CEO-83xxx (Tìm số lớn nhất hiện tại + 1, ví dụ: CEO-83008).",
      "   - Cập nhật bản ghi trong `members`: status = 'active', code = 'CEO-83xxx', joined_at = NOW().",
      "   - Tạo tài khoản đăng nhập trong `vione_users` với mật khẩu khởi tạo ngẫu nhiên, bật cờ must_change_password = true.",
      "   - Tạo bản ghi Thẻ doanh nhân điện tử trong `member_business_cards` với slug công khai /card/ceo83xxx.",
      "Bước 7: Kích hoạt dịch vụ SMTP Mailer gửi Email Chào mừng chính thức gia nhập CLB CEO 1983 kèm thông tin đăng nhập đến hòm thư hội viên.",
      "Bước 8: Ghi nhật ký phê duyệt vào bảng `activity_log`.",
      "Bước 9: Đóng ngăn kéo, làm mới danh sách và hiển thị thông báo thành công rực rỡ."
    ],
    alternativeFlows: [
      "Bước A1: Hồ sơ không đủ điều kiện -> BTV bấm nút 'Từ Chối Kết Nạp', nhập lý do từ chối (VD: Sai năm sinh, doanh nghiệp vi phạm pháp luật). Hệ thống chuyển trạng thái sang rejected và gửi email thông báo từ chối lịch thiệp."
    ],
    exceptionFlows: [
      "Bước E1: Tài khoản Ban Thư Ký hoặc ban khác bấm duyệt -> Hệ thống chặn ngay lập tức, trả về mã lỗi HTTP 403 Forbidden: 'Ban Thư Ký không có thẩm quyền phê duyệt kết nạp hội viên. Thẩm quyền này thuộc về Ban Thành Viên'.",
      "Bước E2: Trùng lặp mã hội viên trong transaction -> Hệ thống tự động rollback và thử lại với số thứ tự kế tiếp."
    ],
    postConditions: "Ứng viên chính thức trở thành Hội viên CLB CEO 1983, có mã định danh, tài khoản di động và danh thiếp số.",
    businessRules: "RULE-AUTH-BTV-EXCLUSIVE: Nghiêm cấm tuyệt đối Ban Thư Ký phê duyệt hội viên.",
    techMapping: "API: `POST /api/association/members/:id/approve` | Tables: `members`, `vione_users`, `member_business_cards`"
  },
  {
    ucId: "UC-CRM-MBR-03",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Hồ Sơ Hội Viên 360 Độ & Lịch Sử Tương Tác Đa Chiều",
    description: "Cung cấp góc nhìn toàn cảnh 360 độ về một hội viên: Thông tin pháp nhân, lịch sử đóng hội phí, lịch sử tham gia sự kiện Gala, điểm danh cuộc họp, các sản phẩm B2B đang bán và điểm cống hiến.",
    actors: "Ban Quản Trị, Ban Thành Viên, Ban Thư Ký",
    preConditions: "Hội viên đã có mã định danh trong hệ thống.",
    inputs: [
      { field: "memberId", type: "String", req: true, val: "Mã định danh hoặc Mã số hội viên (CEO-83xxx)" }
    ],
    mainFlow: [
      "Bước 1: Người dùng bấm vào dòng hội viên trên bảng danh sách.",
      "Bước 2: Hệ thống mở trang Chi tiết Hội viên 360 độ (/members/$memberId).",
      "Bước 3: Hiển thị khối thông tin tổng quan: Avatar, Họ tên, Chức vụ, Tên công ty, Mã HV, Ban chuyên môn, Hạng thẻ VIP.",
      "Bước 4: Hiển thị các tab dữ liệu chuyên sâu:",
      "   - Tab 'Hồ Sơ Doanh Nghiệp': MST, Giấy phép ĐKKD, Website, Địa chỉ trụ sở, Ngành nghề, Quy mô nhân sự.",
      "   - Tab 'Lịch Sử Hội Phí': Danh sách các kỳ hội phí đã đóng, số tiền, ngày gạch nợ, hóa đơn điện tử.",
      "   - Tab 'Sự Kiện & Hội Nghị': Danh sách sự kiện đã đăng ký, vị trí bàn tiệc VIP, trạng thái check-in tại cửa.",
      "   - Tab 'Cuộc Họp & Điểm Danh': Tỷ lệ tham dự các cuộc họp Ban Chấp Hành, lịch sử quét QR điểm danh.",
      "   - Tab 'Gian Hàng B2B': Các sản phẩm đang đăng bán và mức chiết khấu trợ giá nội bộ.",
      "   - Tab 'Nhiệm Vụ Được Giao': Danh sách các công việc trong các ban chuyên môn và tiến độ hoàn thành."
    ],
    alternativeFlows: [],
    exceptionFlows: [
      "Bước E1: Hội viên không tồn tại -> Hiển thị thông báo 404 và nút quay lại danh sách."
    ],
    postConditions: "Cán bộ quản lý có đầy đủ thông tin để đánh giá mức độ tích cực và tiềm năng của hội viên.",
    businessRules: "Dữ liệu được tổng hợp thời gian thực từ 6 bảng CSDL liên quan.",
    techMapping: "Route: `/members/$memberId` | API: `GET /api/association/members/:id/full-profile`"
  },
  {
    ucId: "UC-CRM-MBR-04",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Phân Khúc Hội Viên & Xếp Hạng Điểm Cống Hiến Thường Niên",
    description: "Phân loại hội viên theo tiêu chí đóng góp, chuyên cần và khối ngành nghề; tự động xếp hạng thẻ VIP Kim Cương, Vàng, Bạc.",
    actors: "Ban Thành Viên (BTV), Ban Quản Trị",
    preConditions: "Dữ liệu hoạt động của hội viên được cập nhật đầy đủ.",
    inputs: [
      { field: "evaluationYear", type: "Integer", req: true, val: "Năm đánh giá xếp hạng" },
      { field: "criteriaWeights", type: "JSON", req: false, val: "Trọng số điểm: Chuyên cần, Hội phí, Thiện nguyện, Giao thương" }
    ],
    mainFlow: [
      "Bước 1: BTV mở màn hình 'Phân Khúc & Xếp Hạng' (`/segments`) trên Web CRM.",
      "Bước 2: Hệ thống tính toán điểm cống hiến tự động theo công thức:",
      "   - Điểm chuyên cần họp và sự kiện (Tối đa 30 điểm).",
      "   - Điểm hoàn thành hội phí đúng hạn (Tối đa 20 điểm).",
      "   - Điểm đóng góp quỹ thiện nguyện (Tối đa 25 điểm).",
      "   - Điểm giao thương B2B nội bộ (Tối đa 25 điểm).",
      "Bước 3: Tự động phân hạng hội viên:",
      "   - Từ 90 - 100 điểm: Hạng Kim Cương (Diamond Member).",
      "   - Từ 75 - 89 điểm: Hạng Vàng (Gold Member).",
      "   - Từ 60 - 74 điểm: Hạng Bạc (Silver Member).",
      "   - Dưới 60 điểm: Hạng Tiêu Chuẩn (Standard Member).",
      "Bước 4: BTV xác nhận và công bố bảng xếp hạng thường niên."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Hội viên được nâng cấp hạng thẻ VIP tương ứng trên Mobile App.",
    businessRules: "Hội viên nợ hội phí không được xét hạng Kim Cương.",
    techMapping: "Route: `/segments` | API: `POST /api/association/members/evaluate-tiers`"
  },
  {
    ucId: "UC-CRM-MBR-05",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Kích Hoạt, Khóa Tài Khoản & Cấp Lại Mật Khẩu Khởi Tạo",
    description: "Quản trị trạng thái hoạt động của tài khoản hội viên: Tạm khóa, mở khóa, hoặc cấp lại mật khẩu khởi tạo khi hội viên quên.",
    actors: "Ban Quản Trị, Ban Thành Viên",
    preConditions: "Tài khoản hội viên tồn tại trong hệ thống.",
    inputs: [
      { field: "memberId", type: "String", req: true, val: "Mã hội viên cần thao tác" },
      { field: "actionType", type: "Enum", req: true, val: "lock | unlock | reset_password" },
      { field: "reason", type: "String", req: true, val: "Lý do thao tác phục vụ kiểm toán" }
    ],
    mainFlow: [
      "Bước 1: Cán bộ quản lý tìm kiếm hội viên trên màn hình Quản lý hội viên.",
      "Bước 2: Chọn menu thao tác bên phải dòng dữ liệu, chọn 'Khóa Tài Khoản' hoặc 'Cấp Lại Mật Khẩu'.",
      "Bước 3: Nhập lý do thực hiện vào hộp thoại xác nhận.",
      "Bước 4: Hệ thống thực thi:",
      "   - Nếu Khóa: Cập nhật `status = 'suspended'`, thu hồi toàn bộ Refresh Token đang hoạt động.",
      "   - Nếu Cấp lại mật khẩu: Sinh mật khẩu ngẫu nhiên mới, băm Bcrypt, bật cờ `must_change_password = true`, gửi email chứa mật khẩu mới đến hòm thư hội viên.",
      "Bước 5: Ghi nhận nhật ký vào `audit_logs`."
    ],
    alternativeFlows: [],
    exceptionFlows: [
      "Bước E1: Không thể khóa tài khoản của chính Superadmin đang đăng nhập."
    ],
    postConditions: "Trạng thái tài khoản được cập nhật tức thời trên toàn hệ thống.",
    businessRules: "Mọi thao tác khóa/mở khóa bắt buộc nhập lý do chi tiết.",
    techMapping: "API: `POST /api/association/members/:id/account-action` | Table: `vione_users`"
  },
  {
    ucId: "UC-CRM-EVT-01",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Khởi Tạo Sự Kiện Hội Nghị & Gala Dinner (Event Wizard)",
    description: "Khởi tạo sự kiện đại hội, hội thảo chuyên đề hoặc đêm tiệc Gala Dinner, thiết lập timeline chương trình và cấu hình các hạng vé mời.",
    actors: "Ban Truyền Thông & Sự Kiện (BTT), Ban Quản Trị",
    preConditions: "Tài khoản có quyền quản trị sự kiện.",
    inputs: [
      { field: "eventName", type: "String", req: true, val: "Tên sự kiện (VD: Gala Kỷ Niệm 3 Năm CEO 1983)" },
      { field: "eventDate", type: "DateTime", req: true, val: "Thời gian bắt đầu và kết thúc" },
      { field: "location", type: "String", req: true, val: "Địa điểm tổ chức hội trường" },
      { field: "capacity", type: "Integer", req: true, val: "Sức chứa tối đa (VD: 500 khách)" },
      { field: "bannerUrl", type: "String URL", req: true, val: "Ảnh bìa sự kiện tỷ lệ chuẩn 16:9" }
    ],
    mainFlow: [
      "Bước 1: Người dùng mở màn hình 'Quản Lý Sự Kiện' (/events) và bấm 'Tạo Sự Kiện Mới'.",
      "Bước 2: Trình tạo sự kiện đa bước (Wizard) mở ra: Bước 1: Thông tin chung; Bước 2: Diễn giả & Timeline; Bước 3: Cấu hình gói vé; Bước 4: Sơ đồ chỗ ngồi.",
      "Bước 3: Nhập thông tin chung và tải ảnh banner 16:9 lên MinIO Storage.",
      "Bước 4: Nhập danh sách diễn giả VIP, timeline chi tiết từng khung giờ.",
      "Bước 5: Bấm 'Lưu & Tiếp Tục' sang bước cấu hình gói vé."
    ],
    alternativeFlows: [
      "Bước A1: Lưu ở trạng thái 'Bản nháp' (draft) để tiếp tục chỉnh sửa nội dung trước khi công bố."
    ],
    exceptionFlows: [
      "Bước E1: Thời gian kết thúc trước thời gian bắt đầu -> Báo lỗi validation.",
      "Bước E2: Ảnh banner sai tỷ lệ -> Cảnh báo tối ưu chuẩn 16:9."
    ],
    postConditions: "Sự kiện được khởi tạo thành công ở trạng thái bản nháp.",
    businessRules: "RULE-UI-ROYAL-NAVY-GOLD: Ảnh banner sự kiện bắt buộc tỷ lệ 16:9 sắc nét.",
    techMapping: "Route: `/events` | API: `POST /api/association/events` | Table: `events`"
  },
  {
    ucId: "UC-CRM-EVT-02",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Cấu Hình Đa Gói Vé E-Ticket (VIP, Tiêu Chuẩn, Khách Mời)",
    description: "Thiết lập các loại vé mời khác nhau cho sự kiện: Vé VIP miễn phí cho Lãnh đạo, Vé đặc quyền hội viên, Vé khách mời có phụ thu.",
    actors: "Ban Truyền Thông (BTT), Ban Tài Chính",
    preConditions: "Sự kiện đã được khởi tạo.",
    inputs: [
      { field: "ticketName", type: "String", req: true, val: "Tên gói vé (Vé VIP Đại Biểu / Vé Hội Viên / Vé Khách)" },
      { field: "price", type: "Decimal", req: true, val: "Giá vé (0 VNĐ hoặc 1.500.000 VNĐ)" },
      { field: "quantity", type: "Integer", req: true, val: "Số lượng vé tối đa phát hành" },
      { field: "description", type: "String", req: false, val: "Quyền lợi đính kèm gói vé" }
    ],
    mainFlow: [
      "Bước 1: Tại bước Cấu hình vé của Sự kiện, bấm 'Thêm Gói Vé Mới'.",
      "Bước 2: Cấu hình Gói 'Vé VIP Đại Biểu': Giá 0 VNĐ, số lượng 50 vé, dành cho Lãnh đạo Thành ủy, HanoiBA.",
      "Bước 3: Cấu hình Gói 'Vé Hội Viên Chính Thức': Giá 0 VNĐ, số lượng 350 vé, tự động nhận diện hội viên.",
      "Bước 4: Cấu hình Gói 'Vé Khách Mời Mở Rộng': Giá 1.500.000 VNĐ, số lượng 100 vé, có phụ thu tiệc tối.",
      "Bước 5: Nhấn 'Lưu Cấu Hình Vé'. Dữ liệu lưu vào bảng `event_ticket_types`."
    ],
    alternativeFlows: [],
    exceptionFlows: [
      "Bước E1: Tổng số lượng vé các gói vượt quá sức chứa hội trường -> Báo lỗi cảnh báo vượt tải."
    ],
    postConditions: "Các gói vé sẵn sàng mở bán và đăng ký trên Mobile App.",
    businessRules: "Hội viên chính thức hoàn thành hội phí luôn được đăng ký vé VIP 0 VNĐ.",
    techMapping: "API: `POST /api/association/events/:id/ticket-types` | Table: `event_ticket_types`"
  },
  {
    ucId: "UC-CRM-EVT-03",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Thiết Kế Sơ Đồ Chỗ Ngồi Trực Quan Cinema Seating Map (Bàn Gala VIP)",
    description: "Bố trí trực quan sơ đồ bàn tiệc Gala VIP và dãy ghế hội trường, gán số bàn và số ghế định danh cho từng đại biểu.",
    actors: "Ban Truyền Thông (BTT), Ban Thư Ký (BTK)",
    preConditions: "Sự kiện đã được khởi tạo thành công.",
    inputs: [
      { field: "eventId", type: "String", req: true, val: "Mã sự kiện cần thiết kế sơ đồ" },
      { field: "seatingLayout", type: "JSON", req: true, val: "Cấu trúc sơ đồ bàn tiệc tròn (10 chỗ/bàn) và dãy ghế" }
    ],
    mainFlow: [
      "Bước 1: Ban tổ chức mở màn hình 'Sơ Đồ Ghế Ngồi' (/events/seating) cho sự kiện Gala.",
      "Bước 2: Giao diện trực quan hiển thị Sân khấu chính (Main Stage) ở vị trí trung tâm phía trên.",
      "Bước 3: Thêm các Cụm Bàn Tròn Gala VIP (Mỗi bàn 10 ghế): Bàn VIP 1 đến VIP 6 đặt sát sân khấu dành cho Lãnh đạo.",
      "Bước 4: Thêm các Cụm Bàn Hội viên (Bàn 7 đến Bàn 40) ở các khu vực kế tiếp.",
      "Bước 5: Kéo thả phân bổ tên đại biểu VIP vào các ghế định danh hoặc thiết lập chế độ hội viên tự chọn chỗ khi đăng ký vé.",
      "Bước 6: Nhấn nút 'Lưu Sơ Đồ Chỗ Ngồi'.",
      "Bước 7: Hệ thống cập nhật sơ đồ và đồng bộ trực tiếp vào dữ liệu vé của từng đại biểu."
    ],
    alternativeFlows: [],
    exceptionFlows: [
      "Bước E1: Xếp trùng đại biểu vào 2 ghế khác nhau -> Hệ thống phát hiện xung đột và cảnh báo."
    ],
    postConditions: "100% đại biểu tham dự có vị trí chỗ ngồi được định danh rõ ràng trên hệ thống.",
    businessRules: "RULE-EVT-SEATING: Mỗi đại biểu có đúng 01 vị trí ghế ngồi định danh trên Cinema Seating Map.",
    techMapping: "Route: `/events/seating` | API: `PUT /api/association/events/:id/seating`"
  },
  {
    ucId: "UC-CRM-EVT-04",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Cổng An Ninh Soát Vé Gate Check-in QR Tốc Độ Cao (< 0.2s)",
    description: "Nhận diện mã vé điện tử E-Ticket qua camera, xác minh tính hợp lệ và vị trí chỗ ngồi dưới 200ms; kích hoạt cảnh báo đỏ chống gian lận vé trùng lặp.",
    actors: "Cán bộ an ninh / Lễ tân Ban Truyền Thông (BTT)",
    preConditions: "Sự kiện đang trong khung giờ đón tiếp đại biểu; thiết bị có camera kết nối mạng.",
    inputs: [
      { field: "qrPayload", type: "String", req: true, val: "Chuỗi mã hóa mã vé quét được từ camera" }
    ],
    mainFlow: [
      "Bước 1: Cán bộ an ninh mở màn hình 'Cổng Soát Vé' (/checkin) trên máy tính bảng hoặc laptop.",
      "Bước 2: Hướng camera về phía màn hình điện thoại của đại biểu xuất trình vé E-Ticket.",
      "Bước 3: Camera quét và giải mã chuỗi QR trong thời gian < 0.1 giây.",
      "Bước 4: Gửi yêu cầu xác thực đến API kiểm tra vé (/api/association/checkin).",
      "Bước 5: Hệ thống kiểm tra trong bảng `event_registrations` và `member_checkins`:",
      "   - Trường hợp HỢP LỆ (Lần đầu qua cửa): Toàn bộ màn hình bừng sáng XANH LỤC, phát âm thanh 'Bíp' chào mừng, hiển thị Họ tên đại biểu, Tên doanh nghiệp, Hạng vé và Vị trí Bàn tiệc VIP (VD: 'Bàn VIP 02 - Ghế số 05') để lễ tân dẫn khách.",
      "   - Ghi nhận bản ghi vào bảng `member_checkins` với thời gian thực (checked_at = NOW()).",
      "Bước 6: Tự động chuyển đổi trạng thái sẵn sàng quét đại biểu kế tiếp sau 1.5 giây."
    ],
    alternativeFlows: [
      "Bước A1: Camera không đọc được mã (do màn hình điện thoại vỡ/tối) -> Cán bộ an ninh nhập Mã vé 6 ký tự bằng tay để check-in thủ công."
    ],
    exceptionFlows: [
      "Bước E1: Vé quét lại lần thứ hai (Trùng lặp gian lận) -> Toàn bộ màn hình lập tức chuyển sang màu ĐỎ RỰC, phát chuông báo động cảnh báo và hiển thị thông báo: 'CẢNH BÁO: Vé này đã qua cửa lúc hh:mm:ss! Nghi vấn gian lận vé!'.",
      "Bước E2: Mã vé không tồn tại hoặc sai sự kiện -> Màn hình báo ĐỎ: 'Vé không hợp lệ cho sự kiện này'."
    ],
    postConditions: "Đại biểu được qua cửa an toàn, thông tin check-in được lưu trữ phục vụ quay thưởng Lucky Draw.",
    businessRules: "RULE-EVENT-SINGLE-CHECKIN: Mỗi mã vé chỉ được qua cửa đúng 01 lần duy nhất.",
    techMapping: "Route: `/checkin` | API: `POST /api/association/checkin` | Table: `member_checkins`"
  },
  {
    ucId: "UC-CRM-EVT-05",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Vòng Quay May Mắn (Lucky Draw) Đại Hội Nạp Danh Sách Check-in Thực Tế",
    description: "Quay thưởng minh bạch trên màn hình LED sân khấu đại hội, tự động nạp danh sách đại biểu ĐÃ CHECK-IN THỰC TẾ tại cửa.",
    actors: "Ban Tổ Chức, MC Sự kiện, Toàn thể Đại biểu",
    preConditions: "Sự kiện đã diễn ra và có danh sách đại biểu check-in thành công trong `member_checkins`.",
    inputs: [
      { field: "eventId", type: "String", req: true, val: "Mã sự kiện đang tổ chức quay thưởng" },
      { field: "prizeCategory", type: "String", req: true, val: "Hạng giải thưởng (Giải Đặc Biệt, Giải Nhất, Giải Nhì)" }
    ],
    mainFlow: [
      "Bước 1: Kỹ thuật viên mở màn hình 'Lucky Draw' trên máy tính kết nối màn hình LED sân khấu.",
      "Bước 2: Hệ thống tự động truy vấn danh sách toàn bộ đại biểu có trạng thái checked_in = true tại sự kiện này (Loại bỏ các đại biểu vắng mặt).",
      "Bước 3: Hiển thị giao diện Vòng quay may mắn phong cách Hoàng gia Gold & Navy với hiệu ứng pháo hoa 3D.",
      "Bước 4: MC mời đại biểu nhấn nút 'BẮT ĐẦU QUAY'.",
      "Bước 5: Các con số may mắn (#LUCKY-xxxx) và tên doanh nhân chạy ngẫu nhiên với tốc độ cao kèm âm thanh hồi hộp.",
      "Bước 6: Nhấn nút 'DỪNG LẠI'.",
      "Bước 7: Vòng quay dừng chính xác tại 01 đại biểu may mắn, hiển thị Họ tên, Công ty, Mã số trúng thưởng và hiệu ứng pháo hoa chúc mừng.",
      "Bước 8: Hệ thống lưu kết quả trúng thưởng vào CSDL và loại trừ đại biểu đã trúng khỏi các vòng quay kế tiếp."
    ],
    alternativeFlows: [
      "Bước A1: Đại biểu trúng thưởng không có mặt trên khán phòng khi gọi tên -> Nhấn 'Quay Lại' để chọn đại biểu khác."
    ],
    exceptionFlows: [
      "Bước E1: Chưa có đại biểu nào check-in -> Thông báo: 'Chưa có dữ liệu đại biểu check-in để quay thưởng'."
    ],
    postConditions: "Kết quả trúng thưởng được ghi nhận minh bạch, công khai trước toàn thể đại hội.",
    businessRules: "Chỉ những đại biểu đã được Cổng soát vé QR Gate quét thành công mới được tham gia quay thưởng.",
    techMapping: "Component: `LuckyDrawModal.tsx` | Table: `member_checkins`"
  },
  {
    ucId: "UC-CRM-MTG-01",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Khởi Tạo Lịch Họp & Thuật Toán Chống Trùng Phòng Sapphire Hub (40 Chỗ)",
    description: "Khởi tạo cuộc họp lãnh đạo tập trung hoặc trực tuyến; tự động phát hiện và ngăn chặn xung đột lịch sử dụng phòng họp vật lý Sapphire Hub (40 chỗ).",
    actors: "Ban Thư Ký (BTK), Ban Quản Trị (BQT)",
    preConditions: "Tài khoản có quyền khởi tạo cuộc họp.",
    inputs: [
      { field: "title", type: "String", req: true, val: "Tiêu đề cuộc họp (VD: Họp Ban Chấp Hành Quý 3/2026)" },
      { field: "startTime", type: "DateTime", req: true, val: "Thời gian bắt đầu" },
      { field: "endTime", type: "DateTime", req: true, val: "Thời gian kết thúc (Phải sau startTime)" },
      { field: "roomType", type: "String", req: true, val: "Phòng Họp Sapphire Hub / Zoom / Google Meet / Offline khác" },
      { field: "attendees", type: "Array of Member IDs", req: true, val: "Danh sách đại biểu được triệu tập" }
    ],
    mainFlow: [
      "Bước 1: Ban Thư Ký mở màn hình 'Quản Lý Cuộc Họp' (/meetings) và bấm 'Lên Lịch Họp Mới'.",
      "Bước 2: Nhập tiêu đề cuộc họp, thời gian bắt đầu và kết thúc.",
      "Bước 3: Lựa chọn địa điểm: 'Phòng Họp Sapphire UniWork Hub' (Sức chứa 40 chỗ).",
      "Bước 4: Hệ thống tự động kích hoạt Thuật toán Chống Trùng Phòng (Room Conflict Detection):",
      "   - Truy vấn toàn bộ các cuộc họp đang có trong CSDL có roomType = 'sapphire_hub' và trạng thái khác cancelled.",
      "   - Kiểm tra điều kiện xung đột thời gian: (start_time < new_end_time) AND (end_time > new_start_time).",
      "Bước 5: Nếu KHÔNG có xung đột: Hệ thống cho phép lưu bản ghi ở trạng thái pending_approval.",
      "Bước 6: Ban Quản Trị phê duyệt chuyển sang trạng thái upcoming, hệ thống tự động phát hành giấy triệu tập qua thông báo đẩy và email đến các đại biểu."
    ],
    alternativeFlows: [
      "Bước A1: Lựa chọn cuộc họp trực tuyến -> Nhập đường dẫn phòng họp Zoom / Google Meet / UniWork Link."
    ],
    exceptionFlows: [
      "Bước E1: Phát hiện xung đột lịch phòng Sapphire Hub -> Hệ thống chặn lưu và hiển thị cảnh báo đỏ rực: 'XUNG ĐỘT LỊCH: Phòng họp Sapphire Hub đã được đăng ký bởi [Tên cuộc họp trước] từ hh:mm đến hh:mm. Vui lòng chọn khung giờ khác hoặc đổi địa điểm!'."
    ],
    postConditions: "Lịch họp được thiết lập an toàn, triệt tiêu 100% rủi ro trùng phòng họp vật lý.",
    businessRules: "Phòng họp Sapphire Hub chỉ phục vụ tối đa 01 cuộc họp trong cùng một khung thời gian.",
    techMapping: "Route: `/meetings` | API: `POST /api/association/meetings`"
  },
  {
    ucId: "UC-CRM-MTG-02",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Điểm Danh Cuộc Họp Bằng Mã QR Động Thay Đổi Sau 30 Giây (TOTP Engine)",
    description: "Điểm danh đại biểu có mặt tại cuộc họp bằng mã QR tự động thay đổi sau mỗi 30 giây, chống gian lận chụp ảnh gửi điểm danh hộ từ xa.",
    actors: "Ban Thư Ký (Hiển thị mã), Đại biểu tham dự (Quét mã)",
    preConditions: "Cuộc họp đang diễn ra (status = 'in_progress').",
    inputs: [
      { field: "meetingId", type: "String", req: true, val: "Mã định danh cuộc họp" },
      { field: "dynamicToken", type: "String (TOTP)", req: true, val: "Mã bảo mật thời gian thực có hiệu lực trong 30 giây" }
    ],
    mainFlow: [
      "Bước 1: Ban Thư Ký mở màn hình 'Điểm Danh Cuộc Họp' trên máy chiếu hội trường.",
      "Bước 2: Hệ thống sinh mã QR động chứa chữ ký số thời gian thực (TOTP Engine), tự động làm mới mã sau mỗi 30 giây.",
      "Bước 3: Đại biểu mở Mobile App CEO 1983, chọn tính năng 'Quét QR Điểm Danh'.",
      "Bước 4: Camera điện thoại quét mã QR và gửi mã token kèm vị trí về máy chủ.",
      "Bước 5: Hệ thống xác minh chữ ký số trong cửa sổ thời gian 30 giây hợp lệ.",
      "Bước 6: Ghi nhận trạng thái 'Đã Có Mặt' cho đại biểu trong danh sách cuộc họp kèm thời gian chính xác.",
      "Bước 7: Màn hình máy chiếu của Ban Thư Ký cập nhật tức thì tên đại biểu vừa điểm danh."
    ],
    alternativeFlows: [
      "Bước A1: Đại biểu không mang điện thoại -> Ban Thư Ký bấm điểm danh thủ công trên bảng điều khiển."
    ],
    exceptionFlows: [
      "Bước E1: Quét mã QR đã hết hạn (> 30 giây do ảnh chụp từ xa) -> Hệ thống từ chối và báo lỗi: 'Mã QR đã hết hạn. Vui lòng quét trực tiếp mã mới trên màn hình'."
    ],
    postConditions: "Dữ liệu chuyên cần được ghi nhận chính xác vào hồ sơ hội viên.",
    businessRules: "Mã QR động có cơ chế bảo vệ chống gian lận điểm danh từ xa tuyệt đối.",
    techMapping: "Route: `/meetings/:id/attendance` | Algorithm: TOTP HMAC-SHA256"
  },
  {
    ucId: "UC-CRM-MTG-03",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Ban Hành Biên Bản Cuộc Họp & Nghị Quyết Ký Số",
    description: "Soạn thảo, đính kèm tệp PDF nghị quyết đã ký số và ban hành biên bản cuộc họp đến toàn thể đại biểu tham gia.",
    actors: "Ban Thư Ký (BTK)",
    preConditions: "Cuộc họp đã kết thúc.",
    inputs: [
      { field: "meetingId", type: "String", req: true, val: "Mã cuộc họp cần ban hành biên bản" },
      { field: "minutesSummary", type: "Text", req: true, val: "Nội dung tóm tắt kết luận cuộc họp" },
      { field: "documentFile", type: "File PDF", req: true, val: "Nghị quyết có chữ ký số hoặc dấu đỏ" }
    ],
    mainFlow: [
      "Bước 1: Ban Thư Ký mở chi tiết cuộc họp, bấm 'Tạo Biên Bản & Nghị Quyết'.",
      "Bước 2: Nhập nội dung kết luận chỉ đạo của Chủ tịch CLB.",
      "Bước 3: Tải tệp PDF Nghị quyết đã ký số lên MinIO Storage.",
      "Bước 4: Bấm nút 'Ban Hành Chính Thức'.",
      "Bước 5: Hệ thống tự động phát thông báo đẩy và email đến toàn bộ đại biểu tham gia kèm tệp đính kèm."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Văn bản nghị quyết được lưu trữ vĩnh viễn trong Kho tài liệu hiệp hội.",
    businessRules: "Biên bản cuộc họp phải được ban hành trong vòng 24 giờ sau khi kết thúc họp.",
    techMapping: "API: `POST /api/association/meetings/:id/minutes`"
  },
  {
    ucId: "UC-CRM-TSK-01",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Quản Lý Công Việc (Tasks) Đa Chế Độ Hiển Thị (5 View Modes)",
    description: "Cung cấp không gian điều hành công việc đa chiều cho 6 ban chuyên môn với 5 chế độ xem linh hoạt: Danh sách (List), Bảng Kanban 3 cấp zoom, Lịch (Calendar), Biểu đồ Gantt và Sơ đồ tổ chức (Org Tree).",
    actors: "Ban Quản Trị, Ban Thư Ký, Trưởng các Ban chuyên môn",
    preConditions: "Đăng nhập Web CRM có quyền giao việc và báo cáo tiến độ.",
    inputs: [
      { field: "viewMode", type: "Enum", req: true, val: "list | kanban | calendar | gantt | org_tree" },
      { field: "taskTitle", type: "String", req: true, val: "Tiêu đề nhiệm vụ" },
      { field: "assigneeId", type: "String", req: true, val: "Cán bộ hoặc Ban chuyên môn chịu trách nhiệm" },
      { field: "dueDate", type: "DateTime", req: true, val: "Hạn chót hoàn thành" },
      { field: "priority", type: "Enum", req: true, val: "low | medium | high | urgent" }
    ],
    mainFlow: [
      "Bước 1: Người dùng mở màn hình 'Quản Lý Công Việc' (/tasks) trên Web CRM.",
      "Bước 2: Hệ thống tải dữ liệu nhiệm vụ và cung cấp thanh công cụ chuyển đổi 5 chế độ xem:",
      "   - Chế độ Danh sách (List View): Xem bảng chi tiết có phân trang và bộ lọc trạng thái.",
      "   - Chế độ Kanban Board: Kéo thả các thẻ công việc giữa các cột: 'Cần làm' -> 'Đang làm' -> 'Chờ duyệt' -> 'Hoàn thành'; hỗ trợ thu phóng 3 cấp (Zoom In / Normal / Zoom Out).",
      "   - Chế độ Lịch (Calendar View): Trực quan hóa hạn chót công việc theo tuần và tháng.",
      "   - Chế độ Biểu đồ Gantt (Gantt Chart): Theo dõi đường găng tiến độ và mối quan hệ phụ thuộc công việc.",
      "   - Chế độ Sơ đồ tổ chức (Org Tree): Xem phân bổ nhiệm vụ theo cấu trúc hình cây của 6 ban chuyên môn.",
      "Bước 3: Khi tạo mới hoặc cập nhật công việc, hệ thống gửi thông báo tức thì qua chuông thông báo và email đến người được giao việc."
    ],
    alternativeFlows: [],
    exceptionFlows: [
      "Bước E1: Cập nhật công việc quá hạn chót -> Hệ thống tự động gắn nhãn cảnh báo đỏ 'Quá hạn' (Overdue)."
    ],
    postConditions: "Tiến độ công tác của toàn hiệp hội được theo dõi minh bạch, không bỏ sót đầu việc.",
    businessRules: "Mọi kết luận cuộc họp Ban Chấp Hành phải được chuyển hóa thành các Tasks trên hệ thống.",
    techMapping: "Route: `/tasks` | Component: `TaskBoard.tsx`, `KanbanView.tsx`"
  },
  {
    ucId: "UC-CRM-TSK-02",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Phân Công Nhiệm Vụ Cho 6 Chuyên Ban & Báo Cáo Tiến Độ Realtime",
    description: "Ban Thư Ký và BQT giao việc trực tiếp cho các Trưởng ban; nhận báo cáo tiến độ và nghiệm thu kết quả thực thi.",
    actors: "Ban Thư Ký (Giao việc), Trưởng ban (Thực thi & Báo cáo)",
    preConditions: "Có nhiệm vụ cần triển khai trong hiệp hội.",
    inputs: [
      { field: "targetCommittee", type: "Enum", req: true, val: "BTV | BTN | BTT | BXT | BTC" },
      { field: "deliverables", type: "Text", req: true, val: "Sản phẩm đầu ra cần bàn giao" }
    ],
    mainFlow: [
      "Bước 1: Ban Thư Ký tạo nhiệm vụ mới, chọn Ban chuyên môn chịu trách nhiệm.",
      "Bước 2: Trưởng ban nhận thông báo, phân bổ tiếp cho các thành viên trong ban.",
      "Bước 3: Thành viên cập nhật tiến độ (0% đến 100%) và tải lên bằng chứng sản phẩm.",
      "Bước 4: Ban Thư Ký kiểm tra kết quả và bấm nút 'Nghiệm Thu Hoàn Thành'."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Nhiệm vụ được đóng, tích lũy điểm cống hiến cho ban chuyên môn.",
    businessRules: "Nhiệm vụ chỉ được coi là hoàn thành khi Ban Thư Ký hoặc BQT nghiệm thu.",
    techMapping: "Route: `/tasks` | API: `PUT /api/association/tasks/:id/status`"
  },
  {
    ucId: "UC-CRM-FIN-01",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Quản Lý Công Nợ & Thu Hội Phí Thường Niên VietQR Napas 24/7",
    description: "Hệ thống theo dõi công nợ hội phí thường niên (5.000.000 VNĐ/năm), tự động sinh mã VietQR động định danh cho từng hội viên.",
    actors: "Ban Tài Chính, Thủ quỹ, Kế toán",
    preConditions: "Hội viên có thẻ hội viên sắp hết hạn hoặc trong kỳ thu hội phí thường niên.",
    inputs: [
      { field: "memberCode", type: "String", req: true, val: "Mã hội viên (CEO-83xxx)" },
      { field: "fiscalYear", type: "Integer", req: true, val: "Năm tài chính thu hội phí (VD: 2026)" }
    ],
    mainFlow: [
      "Bước 1: Kế toán mở màn hình 'Quản Lý Hội Phí' (/fees) trên CRM.",
      "Bước 2: Hệ thống liệt kê bảng công nợ: Hội viên đã đóng (Xanh lá) và Hội viên chưa đóng (Cam/Đỏ).",
      "Bước 3: Kế toán bấm 'Gửi Thông Báo Thu Hội Phí' hàng loạt.",
      "Bước 4: Hệ thống tự động tạo mã VietQR động chứa sẵn số tiền 5.000.000 VNĐ và cú pháp chuyển khoản gửi đến Mobile App của hội viên.",
      "Bước 5: Theo dõi trạng thái nộp tiền thời gian thực trên bảng danh sách."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Thông báo nộp hội phí được phát hành đến toàn thể hội viên.",
    businessRules: "Mức hội phí thường niên ấn định là 5.000.000 VNĐ/năm.",
    techMapping: "Route: `/fees` | API: `GET /api/association/fees` | Table: `members`"
  },
  {
    ucId: "UC-CRM-FIN-02",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Kế Toán Đối Soát Sao Kê Ngân Hàng & Duyệt Gạch Nợ Thủ Công (+365 Ngày)",
    description: "Kế toán kiểm tra biến động số dư tài khoản ngân hàng thực tế và bấm duyệt gạch nợ trên CRM để gia hạn thẻ VIP +365 ngày.",
    actors: "Kế toán / Thủ quỹ CLB Doanh Nhân CEO 1983",
    preConditions: "Có giao dịch chuyển khoản hội phí vào tài khoản ngân hàng của CLB.",
    inputs: [
      { field: "memberId", type: "String", req: true, val: "Mã hội viên được đối soát" },
      { field: "bankTransactionCode", type: "String", req: false, val: "Mã giao dịch ngân hàng / Ủy nhiệm chi" }
    ],
    mainFlow: [
      "Bước 1: Kế toán kiểm tra sổ phụ hoặc tin nhắn biến động số dư tài khoản ngân hàng CLB.",
      "Bước 2: Tìm kiếm hội viên tương ứng theo Mã HV hoặc Họ tên trên màn hình Quản lý hội phí.",
      "Bước 3: Khớp đúng số tiền 5.000.000 VNĐ và nội dung chuyển khoản.",
      "Bước 4: Kế toán bấm nút 'Duyệt Gạch Nợ'.",
      "Bước 5: Hệ thống thực hiện chuỗi cập nhật:",
      "   - Chuyển `fee_paid = true`, `payment_status = 'paid'`.",
      "   - Tự động cộng dồn thêm chính xác +365 ngày vào ngày hết hạn thẻ VIP (`term_end`).",
      "   - Sinh bản ghi hóa đơn thu tiền trong bảng `invoices`.",
      "Bước 6: Gửi hóa đơn điện tử và thông báo xác nhận đã hoàn thành nghĩa vụ tài chính đến Mobile App của hội viên."
    ],
    alternativeFlows: [],
    exceptionFlows: [
      "Bước E1: Cú pháp chuyển tiền sai hoặc thiếu thông tin -> Kế toán kiểm tra danh sách 'Giao dịch chờ xử lý' để đối soát thủ công."
    ],
    postConditions: "Hội viên được gạch nợ sạch sẽ, thẻ VIP kéo dài hiệu lực thêm 1 năm.",
    businessRules: "RULE-FEE-VIETQR-AUTO-MATCH: Kế toán bắt buộc kiểm tra sao kê thực tế trước khi bấm duyệt.",
    techMapping: "Route: `/fees` | API: `POST /api/association/fees/:memberId/pay` | Tables: `members`, `invoices`"
  },
  {
    ucId: "UC-CRM-FIN-03",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Quy Trình Kiểm Soát Phiếu Chi Sổ Quỹ Hiệp Hội 3 Cấp Nghiêm Ngặt",
    description: "Thực hiện quy trình kiểm soát chi tiêu quỹ 3 cấp độc lập: Lập phiếu -> Thẩm định -> Phê duyệt xuất quỹ, đảm bảo minh bạch tài chính tuyệt đối.",
    actors: "Cán bộ đề xuất, Trưởng ban/Tổng Thư Ký (Thẩm tra), Chủ tịch/Trưởng Ban Tài Chính (Duyệt)",
    preConditions: "Khoản chi phục vụ hoạt động chính đáng của hiệp hội có dự toán được duyệt.",
    inputs: [
      { field: "amount", type: "Decimal", req: true, val: "Số tiền đề xuất chi (VNĐ)" },
      { field: "purpose", type: "String", req: true, val: "Nội dung mục đích chi tiêu chi tiết" },
      { field: "category", type: "String", req: true, val: "Khoản mục: Sự kiện, Thiện nguyện, Văn phòng, Đối ngoại" },
      { field: "attachments", type: "Array of File URLs", req: true, val: "Hóa đơn đỏ, chứng từ, tờ trình đính kèm" }
    ],
    mainFlow: [
      "Bước 1: Cán bộ đề xuất mở màn hình 'Sổ Quỹ Thu Chi' (/funds hoặc /cashbook) trên CRM, bấm 'Lập Phiếu Chi Mới'.",
      "Bước 2: Điền số tiền, lý do chi, chọn ban thụ hưởng và tải lên chứng từ/hóa đơn gốc.",
      "Bước 3: Nhấn 'Gửi Phê Duyệt'. Phiếu chi ở trạng thái Cấp 1: pending.",
      "Bước 4: Trưởng ban chuyên môn hoặc Tổng Thư Ký mở phiếu chi, kiểm tra tính hợp lý của chứng từ và bấm 'Xác Nhận Thẩm Tra'. Phiếu chi chuyển sang Cấp 2: reviewed.",
      "Bước 5: Chủ tịch CLB hoặc Trưởng Ban Tài chính mở phiếu chi đã thẩm tra, kiểm tra ngân sách và bấm nút 'Phê Duyệt Xuất Quỹ' (approved).",
      "Bước 6: Thủ quỹ căn cứ phiếu chi đã duyệt ở Cấp 3 để thực hiện lệnh chuyển khoản và tải ủy nhiệm chi lên hệ thống.",
      "Bước 7: Bản ghi tự động cập nhật vào sổ cái thu chi và trừ số dư quỹ tương ứng."
    ],
    alternativeFlows: [
      "Bước A1: Người duyệt ở Cấp 2 hoặc Cấp 3 từ chối -> Bấm 'Trả Lại Yêu Cầu' kèm lý do cần giải trình bổ sung."
    ],
    exceptionFlows: [
      "Bước E1: Số tiền chi vượt quá số dư khả dụng của quỹ -> Hệ thống cảnh báo đỏ và khóa nút phê duyệt xuất quỹ."
    ],
    postConditions: "Khoản tiền được xuất quỹ đúng quy trình, lưu vết kiểm toán 100% người duyệt và chứng từ.",
    businessRules: "RULE-FIN-CASHBOOK-3-LEVELS: Tuyệt đối không xuất quỹ khi chưa đủ 3 cấp duyệt.",
    techMapping: "Route: `/funds` | API: `POST /api/association/cashbook/expenses`"
  },
  {
    ucId: "UC-CRM-FIN-04",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Quản Lý Quỹ An Sinh Xã Hội & Thiện Nguyện (Sao Kê Minh Bạch Realtime)",
    description: "Quản trị nguồn quỹ an sinh xã hội chuyên biệt, tự động cập nhật và công khai sao kê tài chính thời gian thực cho toàn thể hội viên.",
    actors: "Ban Thiện Nguyện (BTN), Ban Tài Chính",
    preConditions: "Có chương trình phát động thiện nguyện hoặc giải ngân cứu trợ.",
    inputs: [
      { field: "campaignName", type: "String", req: true, val: "Tên chiến dịch thiện nguyện (VD: Xây Điểm Trường Hà Giang)" },
      { field: "targetAmount", type: "Decimal", req: true, val: "Mục tiêu kêu gọi (VNĐ)" }
    ],
    mainFlow: [
      "Bước 1: Ban Thiện Nguyện tạo chiến dịch thiện nguyện mới trên Web CRM (`/funds`).",
      "Bước 2: Thiết lập mục tiêu kinh phí và thông tin tài khoản chuyên dụng.",
      "Bước 3: Khi có hội viên ủng hộ, thủ quỹ đối soát và cập nhật vào sổ thu thiện nguyện.",
      "Bước 4: Khi giải ngân, thực hiện quy trình chi tiêu 3 cấp [UC-CRM-FIN-03].",
      "Bước 5: Toàn bộ bảng sao kê thu chi tự động đồng bộ sang màn hình Thiện nguyện trên Mobile App để toàn thể hội viên cùng giám sát."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Minh bạch 100% tài chính quỹ thiện nguyện, nâng cao uy tín xã hội của HanoiBA.",
    businessRules: "Sao kê thiện nguyện phải công khai thời gian thực, không được ẩn giấu số liệu.",
    techMapping: "Route: `/funds` | API: `GET /api/association/funds/public-statement`"
  },
  {
    ucId: "UC-CRM-B2B-01",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Kiểm Duyệt Sản Phẩm Sàn B2B Có Trợ Giá Nội Bộ (Ban Xúc Tiến BXT)",
    description: "Ban Xúc Tiến Thương Mại kiểm định chất lượng sản phẩm và chính sách trợ giá nội bộ (>= 5%) trước khi cho phép hiển thị trên Sàn B2B.",
    actors: "Trưởng Ban Xúc Tiến Thương Mại (ceo.xuctien@ceo1983.com)",
    preConditions: "Có sản phẩm do hội viên gửi lên ở trạng thái `pending_review`.",
    inputs: [
      { field: "productId", type: "String", req: true, val: "Mã sản phẩm cần kiểm duyệt" },
      { field: "approvalStatus", type: "Enum", req: true, val: "approved | rejected" },
      { field: "reviewNotes", type: "String", req: false, val: "Ghi chú của người kiểm duyệt" }
    ],
    mainFlow: [
      "Bước 1: Cán bộ BXT mở màn hình 'Kiểm Duyệt Sàn B2B' trên Web CRM.",
      "Bước 2: Xem chi tiết sản phẩm: Ảnh, Mô tả kỹ thuật, Giá thị trường và Mức chiết khấu trợ giá nội bộ.",
      "Bước 3: Xác minh tỷ lệ trợ giá: Bắt buộc từ 5% trở lên dành riêng cho hội viên CEO 1983.",
      "Bước 4: Bấm nút 'Phê Duyệt Niêm Yết'.",
      "Bước 5: Sản phẩm chính thức xuất hiện trên Sàn B2B của ứng dụng di động, gửi thông báo chúc mừng đến chủ gian hàng."
    ],
    alternativeFlows: [
      "Bước A1: Sản phẩm không đạt tiêu chuẩn hoặc trợ giá < 5% -> Bấm 'Từ Chối' kèm lý do cần điều chỉnh."
    ],
    exceptionFlows: [],
    postConditions: "Sản phẩm được bảo chứng chất lượng bởi Ban Xúc Tiến hiệp hội.",
    businessRules: "RULE-B2B-INTERNAL-DISCOUNT: Bắt buộc mức chiết khấu trợ giá nội bộ >= 5%.",
    techMapping: "API: `PUT /api/association/products/:id/review` | Table: `products`"
  },
  {
    ucId: "UC-CRM-B2B-02",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Điều Phối & Khớp Nối Cơ Hội Kinh Doanh Cung - Cầu 1-on-1",
    description: "Giám sát bảng tin Cung - Cầu, hỗ trợ kết nối các thương vụ lớn và ghi nhận doanh số giao thương nội khối cho câu lạc bộ.",
    actors: "Ban Xúc Tiến Thương Mại (BXT)",
    preConditions: "Có tin đăng Cần Mua hoặc Cần Bán trên hệ thống.",
    inputs: [
      { field: "opportunityId", type: "String", req: true, val: "Mã tin giao thương" },
      { field: "contractValue", type: "Decimal", req: false, val: "Giá trị hợp đồng thực tế sau khi ký kết" }
    ],
    mainFlow: [
      "Bước 1: BXT theo dõi các tin đăng Cung - Cầu trên bảng điều phối CRM.",
      "Bước 2: Nhận diện các nhu cầu lớn, kết nối trực tiếp lãnh đạo 2 doanh nghiệp phù hợp.",
      "Bước 3: Khi hai bên ký kết hợp đồng, BXT ghi nhận doanh số giao thương vào bảng tổng kết.",
      "Bước 4: Điểm thành tích giao thương được cộng vào hồ sơ 360 độ của cả 2 hội viên."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Doanh số giao thương được ghi nhận chính thức vào Báo cáo kinh tế hiệp hội.",
    businessRules: "Mọi hợp đồng có bảo chứng của BXT được hưởng chính sách bảo lãnh uy tín CLB.",
    techMapping: "Route: `/opportunities` | Table: `business_card_needs`"
  },
  {
    ucId: "UC-CRM-SEC-01",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Quản Trị Ma Trận Phân Quyền Vai Trò Động Dynamic RBAC 5 Cấp",
    description: "Cho phép Superadmin cấu hình quyền hạn chi tiết (Xem, Thêm, Sửa, Xóa, Duyệt) cho 5 vai trò hệ thống.",
    actors: "Ban Quản Trị tối cao (quan_tri)",
    preConditions: "Đăng nhập bằng tài khoản Superadmin (admin@connect.vn).",
    inputs: [
      { field: "targetRole", type: "String", req: true, val: "Thuộc danh mục 5 vai trò hệ thống" },
      { field: "moduleKey", type: "String", req: true, val: "Mã module/màn hình chức năng" },
      { field: "actions", type: "Array of Strings", req: true, val: "Tập hợp các quyền: read, create, update, delete, approve" }
    ],
    mainFlow: [
      "Bước 1: Superadmin mở màn hình 'Phân Quyền Vai Trò' (/settings/roles) trên Web CRM.",
      "Bước 2: Hệ thống tải ma trận phân quyền dạng bảng: Cột dọc là danh sách 5 vai trò, Cột ngang là 30 màn hình chức năng chia theo 8 nhóm sidebar.",
      "Bước 3: Superadmin tích chọn hoặc hủy chọn các ActionPills (Xem, Sửa, Xóa, Duyệt) tương ứng.",
      "Bước 4: Nhấn nút 'Lưu Ma Trận Phân Quyền'.",
      "Bước 5: Hệ thống kiểm tra tính toàn vẹn (Không cho phép tước quyền quản trị của chính vai trò quan_tri).",
      "Bước 6: Cập nhật các bản ghi trong bảng `role_permissions`.",
      "Bước 7: Làm mới bộ đệm phân quyền (Permission Cache) tức thời trên toàn hệ thống.",
      "Bước 8: Hiển thị thông báo cập nhật thành công."
    ],
    alternativeFlows: [
      "Bước A1: Superadmin bấm 'Đặt lại mặc định' để khôi phục ma trận phân quyền tiêu chuẩn."
    ],
    exceptionFlows: [
      "Bước E1: Cố tình tước quyền truy cập module Cấu hình của vai trò quan_tri -> Hệ thống chặn và báo lỗi an toàn."
    ],
    postConditions: "Các tài khoản đang hoạt động được áp dụng ma trận quyền mới ngay trong lần gọi API kế tiếp.",
    businessRules: "Đảm bảo tính bất biến của tài khoản Quản trị tối cao Superadmin.",
    techMapping: "Route: `/settings/roles` | API: `PUT /api/roles/permissions` | Table: `role_permissions`"
  },
  {
    ucId: "UC-CRM-SEC-02",
    module: "Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM)",
    name: "Nhật Ký Kiểm Toán Hoạt Động Hệ Thống (Audit Logs Bất Biến)",
    description: "Tự động ghi nhận 100% nhật ký các thao tác tạo mới, chỉnh sửa, xóa dữ liệu và phê duyệt của cán bộ quản lý phục vụ thanh tra, kiểm toán.",
    actors: "Hệ thống bảo mật ngầm định (Audit Interceptor)",
    preConditions: "Cán bộ quản trị thực hiện bất kỳ thao tác nhạy cảm nào trên Web CRM.",
    inputs: [
      { field: "userId", type: "String UUID", req: true, val: "Mã người thực hiện thao tác" },
      { field: "action", type: "String", req: true, val: "Hành động: CREATE, UPDATE, DELETE, APPROVE, REJECT" },
      { field: "targetResource", type: "String", req: true, val: "Đối tượng tác động: Member, Event, Fee, Expense, Task" },
      { field: "ipAddress", type: "String", req: true, val: "Địa chỉ IP thực của người dùng" },
      { field: "payloadDiff", type: "JSON", req: false, val: "Dữ liệu trước và sau khi thay đổi" }
    ],
    mainFlow: [
      "Bước 1: Mọi yêu cầu HTTP có phương thức POST, PUT, PATCH, DELETE gửi đến backend đều đi qua Middleware kiểm toán AuditInterceptor.",
      "Bước 2: Trích xuất thông tin người dùng từ JWT Token, địa chỉ IP và URL thực thi.",
      "Bước 3: Thu thập dữ liệu thay đổi trước và sau khi thực hiện nghiệp vụ.",
      "Bước 4: Ghi nhận bản ghi bất biến (Immutable Record) vào bảng `audit_logs` và `activity_log`.",
      "Bước 5: Bản ghi kiểm toán được khóa chống chỉnh sửa, chỉ cho phép Superadmin xem truy vết."
    ],
    alternativeFlows: [],
    exceptionFlows: [
      "Bước E1: Lỗi ghi log không được làm gián đoạn giao dịch chính nhưng phải kích hoạt cảnh báo giám sát hệ thống."
    ],
    postConditions: "Mọi thay đổi dữ liệu trong hệ thống đều có thể truy vết chính xác người thực hiện và thời gian.",
    businessRules: "Nhật ký kiểm toán phải được lưu trữ tối thiểu 36 tháng theo quy định an toàn thông tin.",
    techMapping: "Middleware: `AuditInterceptor.ts` | Tables: `audit_logs`, `activity_log`"
  },

  // -------------------------------------------------------------
  // PHÂN HỆ 3: MOBILE APP HỘI VIÊN CEO 1983 (20 UCs)
  // -------------------------------------------------------------
  {
    ucId: "UC-APP-AUTH-01",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Đăng Nhập Ứng Dụng Di Động CEO 1983 Bằng SĐT/Email",
    description: "Xác thực danh tính hội viên chính thức trên ứng dụng di động (Mobile App / PWA).",
    actors: "Hội viên chính thức CLB Doanh Nhân CEO 1983",
    preConditions: "Hồ sơ hội viên đã được Ban Thành Viên phê duyệt (status = 'active').",
    inputs: [
      { field: "identifier", type: "String", req: true, val: "Số điện thoại di động hoặc Email hội viên" },
      { field: "password", type: "String", req: true, val: "Mật khẩu hội viên" }
    ],
    mainFlow: [
      "Bước 1: Hội viên mở ứng dụng di động CEO 1983.",
      "Bước 2: Nhập Số điện thoại hoặc Email và Mật khẩu.",
      "Bước 3: Bấm nút 'Đăng Nhập'.",
      "Bước 4: Hệ thống kiểm tra thông tin tài khoản và so khớp mật khẩu băm.",
      "Bước 5: Kiểm tra trạng thái hồ sơ trong bảng `members`: Nếu status = 'active', cấp phát phiên làm việc di động.",
      "Bước 6: Kiểm tra cờ must_change_password: Nếu là true, chuyển hướng ngay đến modal bắt buộc đổi mật khẩu.",
      "Bước 7: Nếu mật khẩu đã đổi, tải thông tin Thẻ VIP 3D và chuyển hướng vào màn hình chính Hội viên (/association)."
    ],
    alternativeFlows: [
      "Bước A1: Hội viên quên mật khẩu -> Nhấn 'Quên mật khẩu' để nhận liên kết khôi phục qua email đã đăng ký."
    ],
    exceptionFlows: [
      "Bước E1: Hồ sơ đang ở trạng thái Chờ thẩm định (pending) -> Báo lỗi: 'Hồ sơ của Quý anh/chị đang được Ban Thành Viên thẩm định. Vui lòng chờ thông báo chính thức'.",
      "Bước E2: Hồ sơ bị tạm đình chỉ hoặc khai trừ (suspended / terminated) -> Báo lỗi: 'Tư cách hội viên đang bị tạm dừng. Vui lòng liên hệ Ban Quản Trị'."
    ],
    postConditions: "Hội viên truy cập thành công vào các tiện ích dành riêng cho thành viên.",
    businessRules: "Chỉ những hội viên có trạng thái active mới được phép đăng nhập ứng dụng.",
    techMapping: "API: `POST /api/association/auth/login` | Tables: `vione_users`, `members`"
  },
  {
    ucId: "UC-APP-AUTH-02",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Bắt Buộc Đổi Mật Khẩu Khởi Tạo Lần Đầu (QuickProfileEditModal)",
    description: "Buộc hội viên mới phải thay đổi mật khẩu do hệ thống cấp ngẫu nhiên thành mật khẩu cá nhân bảo mật cao trong lần đăng nhập đầu tiên.",
    actors: "Hội viên mới đăng nhập lần đầu",
    preConditions: "Tài khoản có cờ must_change_password = true.",
    inputs: [
      { field: "currentPassword", type: "String", req: true, val: "Mật khẩu khởi tạo hệ thống gửi qua email" },
      { field: "newPassword", type: "String (>= 8 chars)", req: true, val: "Chứa chữ hoa, chữ thường, chữ số và ký tự đặc biệt" },
      { field: "confirmPassword", type: "String", req: true, val: "Khớp 100% với newPassword" }
    ],
    mainFlow: [
      "Bước 1: Hệ thống tự động mở cửa sổ ngăn chặn QuickProfileEditModal ngay sau khi đăng nhập.",
      "Bước 2: Hiển thị thông báo: 'Để đảm bảo an toàn, Quý anh/chị vui lòng đổi mật khẩu khởi tạo trong lần đầu tiên truy cập'.",
      "Bước 3: Hội viên nhập Mật khẩu hiện tại, Mật khẩu mới và Xác nhận mật khẩu mới.",
      "Bước 4: Nhấn nút 'Lưu Mật Khẩu & Bắt Đầu'.",
      "Bước 5: Hệ thống kiểm tra độ phức tạp mật khẩu mới và xác nhận trùng khớp.",
      "Bước 6: Kiểm tra mật khẩu mới không được trùng với mật khẩu khởi tạo cũ.",
      "Bước 7: Băm mật khẩu mới bằng thuật toán bcrypt (Salt round 10) và cập nhật CSDL.",
      "Bước 8: Cập nhật cờ must_change_password = false.",
      "Bước 9: Đóng modal và chuyển hướng hội viên vào màn hình chính."
    ],
    alternativeFlows: [],
    exceptionFlows: [
      "Bước E1: Mật khẩu mới không đạt chuẩn độ phức tạp -> Báo lỗi: 'Mật khẩu phải có tối thiểu 8 ký tự, bao gồm chữ hoa, chữ số và ký tự đặc biệt'.",
      "Bước E2: Xác nhận mật khẩu không khớp -> Báo lỗi: 'Mật khẩu xác nhận không trùng khớp'.",
      "Bước E3: Mật khẩu mới trùng mật khẩu khởi tạo cũ -> Báo lỗi: 'Mật khẩu mới không được trùng mật khẩu cũ'."
    ],
    postConditions: "Tài khoản được bảo vệ bằng mật khẩu cá nhân, cờ must_change_password được gỡ bỏ.",
    businessRules: "Không cho phép người dùng đóng modal hoặc chuyển trang khi chưa đổi mật khẩu thành công.",
    techMapping: "API: `POST /api/auth/change-password` | Table: `vione_users`"
  },
  {
    ucId: "UC-APP-HOME-01",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Trang Chủ Hội Viên VIP & Lưới Phím Tắt Tiện Ích Đẳng Cấp",
    description: "Cung cấp bảng điều khiển trung tâm dành cho hội viên: Thẻ VIP danh dự, Lưới phím tắt tiện ích 8 mục, Sự kiện sắp tới, Ưu đãi và Marketplace.",
    actors: "Hội viên chính thức CLB Doanh Nhân CEO 1983",
    preConditions: "Đã đăng nhập thành công vào Mobile App.",
    inputs: [],
    mainFlow: [
      "Bước 1: Hội viên mở màn hình trang chủ (`/association`).",
      "Bước 2: Hệ thống render Thẻ hội viên VIP 3D với mã QR định danh và huy hiệu chuyên ban.",
      "Bước 3: Hiển thị Lưới 8 tính năng nhanh cân đối: Danh thiếp số, Danh bạ CEO, Quét Check-in, Đặc quyền VIP, Biểu quyết số, Lịch sử hoạt động, Kho tài liệu, Hội phí.",
      "Bước 4: Hiển thị Carousel Sự kiện sắp tới với bộ đếm ngược thời gian thực `EventCountdownMiniBadge`.",
      "Bước 5: Hiển thị Khối Giao thương B2B với tổng giá trị deals thực tế và nút 'Đăng ngay'.",
      "Bước 6: Người dùng chạm vuốt nhẹ nhàng chuyển đổi giữa các mục."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Hội viên tiếp cận mọi tính năng chỉ trong 1 lần chạm.",
    businessRules: "RULE-UI-ROYAL-NAVY-GOLD: Thiết kế giao diện sang trọng, không giật lag.",
    techMapping: "Route: `/association` | Component: `association.index.tsx`"
  },
  {
    ucId: "UC-APP-CARD-01",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Thẻ Hội Viên VIP 3D Titanium Hiệu Ứng Lật 180 Độ & Quét QR",
    description: "Hiển thị Thẻ hội viên VIP 3D công nghệ cao lật 180 độ; hỗ trợ chia sẻ mã QR định danh độc bản tại các sự kiện giao thương.",
    actors: "Hội viên chính thức CLB Doanh Nhân CEO 1983",
    preConditions: "Tài khoản hội viên có trạng thái phí `paid`.",
    inputs: [],
    mainFlow: [
      "Bước 1: Hội viên chạm vào Thẻ VIP tại trang chủ hoặc vào mục 'Thẻ VIP' (`/association/card`).",
      "Bước 2: Thẻ VIP 3D hiển thị với chất liệu Titanium mạ vàng Amber Gold dập nổi logo CEO 1983.",
      "Bước 3: Người dùng vuốt ngón tay để xoay lật 180 độ 3D khám phá mặt trước và mặt sau thẻ.",
      "Bước 4: Mặt sau thẻ hiển thị mã QR định danh độc bản liên kết trực tiếp trang cá nhân `/card/:slug`.",
      "Bước 5: Đối tác có thể quét trực tiếp mã QR trên thẻ để xem hồ sơ năng lực doanh nghiệp."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Khẳng định đẳng cấp và uy tín cá nhân của doanh nhân 1983.",
    businessRules: "Thẻ VIP chỉ kích hoạt đầy đủ hiệu ứng 3D khi hội viên đã hoàn thành nghĩa vụ hội phí.",
    techMapping: "Route: `/association/card` | Component: `DigitalBusinessCardModal.tsx`"
  },
  {
    ucId: "UC-APP-CARD-02",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Chia Sẻ Một Chạm NFC Mở Trang Danh Thiếp Công Khai (/card/:code)",
    description: "Chạm mặt sau thẻ vật lý NFC vào smartphone đối tác để mở ngay trang danh thiếp công khai trên web mà không cần cài app.",
    actors: "Hội viên sở hữu thẻ NFC, Đối tác tiếp nhận",
    preConditions: "Thẻ NFC đã được ghi mã định danh của hội viên.",
    inputs: [
      { field: "slug", type: "String", req: true, val: "Mã định danh thẻ (VD: ceo83007)" }
    ],
    mainFlow: [
      "Bước 1: Hội viên chạm thẻ vật lý NFC vào mặt lưng điện thoại đối tác.",
      "Bước 2: Chip NFC truyền tần số 13.56MHz, điện thoại đối tác bật thông báo mở liên kết web.",
      "Bước 3: Trình duyệt mở trang danh thiếp số công khai: `https://14.225.217.232:5444/card/ceo83007`.",
      "Bước 4: Trang web hiển thị sắc nét: Họ tên, Chức vụ, Logo doanh nghiệp, SĐT, Email, Website, Bản đồ trụ sở và Danh sách dịch vụ cốt lõi.",
      "Bước 5: Đối tác có thể xem toàn bộ hồ sơ mà không cần đăng nhập hay cài đặt ứng dụng."
    ],
    alternativeFlows: [],
    exceptionFlows: [
      "Bước E1: Điện thoại đối tác không bật NFC -> Hội viên hướng dẫn quét mã QR in trên mặt thẻ."
    ],
    postConditions: "Đối tác tiếp nhận hồ sơ doanh nhân nhanh chóng và chuyên nghiệp.",
    businessRules: "Trang web danh thiếp số công khai phải tải siêu tốc < 1.0 giây.",
    techMapping: "Route: `/card/:slug` | Table: `member_business_cards`"
  },
  {
    ucId: "UC-APP-CARD-03",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Xuất File vCard (.vcf) Tự Động Nhập Danh Bạ Điện Thoại Trong 1 Giây",
    description: "Cho phép đối tác bấm nút 'Lưu Danh Bạ' trên trang web danh thiếp để tự động tải file vCard (.vcf) lưu trọn vẹn thông tin vào điện thoại.",
    actors: "Đối tác xem danh thiếp",
    preConditions: "Đang mở trang danh thiếp công khai `/card/:slug`.",
    inputs: [],
    mainFlow: [
      "Bước 1: Đối tác bấm nút 'Lưu Vào Danh Bạ' trên trang danh thiếp công khai.",
      "Bước 2: Máy chủ tự động biên dịch dữ liệu thành tệp vCard chuẩn 3.0 (`contact.vcf`).",
      "Bước 3: Tệp tự động tải về điện thoại đối tác.",
      "Bước 4: Hệ điều hành (iOS / Android) tự động mở ứng dụng Danh Bạ với đầy đủ trường: Họ tên, Công ty, Chức vụ, SĐT, Email, Địa chỉ, Ảnh đại diện.",
      "Bước 5: Đối tác bấm 'Lưu' hoàn tất trong đúng 1 giây mà không cần gõ phím."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Thông tin liên lạc của hội viên được lưu vĩnh viễn trong danh bạ đối tác.",
    businessRules: "File vCard phải tương thích 100% cả Apple iOS Contacts và Google Contacts.",
    techMapping: "API: `GET /api/cards/:slug/vcf` | Format: MIME `text/vcard`"
  },
  {
    ucId: "UC-APP-CARD-04",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Chỉnh Sửa Nhanh Hồ Sơ Cá Nhân & Năng Lực Doanh Nghiệp",
    description: "Hội viên chủ động cập nhật ảnh đại diện, ảnh bìa, giới thiệu doanh nghiệp và các dịch vụ cung ứng qua Bottom Sheet tiện lợi.",
    actors: "Hội viên chính thức CLB Doanh Nhân CEO 1983",
    preConditions: "Đã đăng nhập vào tài khoản cá nhân.",
    inputs: [
      { field: "avatar", type: "Image File", req: false, val: "Ảnh chân dung doanh nhân" },
      { field: "cover", type: "Image File", req: false, val: "Ảnh bìa doanh nghiệp tỷ lệ 3:1" },
      { field: "bio", type: "String", req: false, val: "Giới thiệu ngắn gọn bản thân và triết lý kinh doanh" },
      { field: "services", type: "Array of Strings", req: false, val: "Danh sách sản phẩm dịch vụ thế mạnh" }
    ],
    mainFlow: [
      "Bước 1: Tại trang chủ, hội viên chạm vào Thẻ VIP để mở `PersonalProfileBottomSheet` vuốt xuống.",
      "Bước 2: Bấm nút 'Chỉnh Sửa Hồ Sơ'.",
      "Bước 3: Cập nhật thông tin hoặc tải ảnh mới trực tiếp từ thư viện điện thoại.",
      "Bước 4: Nhấn 'Lưu Thay Đổi'.",
      "Bước 5: Dữ liệu tự động đồng bộ vào CSDL và cập nhật tức thì trên trang danh thiếp công khai."
    ],
    alternativeFlows: [],
    exceptionFlows: [
      "Bước E1: Ảnh tải lên vượt quá 10MB -> Hệ thống tự động nén ảnh phía client trước khi upload."
    ],
    postConditions: "Hồ sơ năng lực của hội viên luôn được cập nhật mới nhất.",
    businessRules: "Hỗ trợ cử chỉ vuốt xuống (Swipe down to dismiss) đóng Bottom Sheet mượt mà.",
    techMapping: "Component: `PersonalProfileBottomSheet.tsx` | Storage: MinIO"
  },
  {
    ucId: "UC-APP-MBR-01",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Tra Cứu Danh Bạ 500+ CEO Hội Viên & Lọc Theo 6 Chuyên Ban",
    description: "Khám phá danh bạ toàn thể các nhà lãnh đạo đồng niên 1983, lọc thông minh theo chuyên ban và ngành nghề kinh doanh.",
    actors: "Hội viên chính thức CLB Doanh Nhân CEO 1983",
    preConditions: "Đã đăng nhập vào Mobile App.",
    inputs: [
      { field: "keyword", type: "String", req: false, val: "Tìm theo tên doanh nhân, công ty, ngành nghề" },
      { field: "committee", type: "Enum", req: false, val: "Tất cả | BQT | BTK | BTV | BTN | BTT | BXT" }
    ],
    mainFlow: [
      "Bước 1: Hội viên mở mục 'Danh Bạ CEO' (`/association/members`).",
      "Bước 2: Hệ thống hiển thị thanh tìm kiếm nhạy bén và hàng chip lọc theo 6 Ban chuyên môn.",
      "Bước 3: Nhập từ khóa hoặc chạm chọn chuyên ban.",
      "Bước 4: Danh sách hội viên hiển thị dạng thẻ card sang trọng: Avatar, Họ tên, Chức vụ, Tên công ty, Huy hiệu chuyên ban và Hạng thẻ VIP.",
      "Bước 5: Bấm vào hội viên bất kỳ để mở hồ sơ chi tiết và các tùy chọn kết nối (Gọi điện, Nhắn tin, Hẹn gặp 1-1)."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Hội viên tìm thấy đối tác tiềm năng trong câu lạc bộ chỉ trong vài giây.",
    businessRules: "Nút 'Mời vào CLB' trên thanh công cụ di động tự co giãn không tràn màn hình.",
    techMapping: "Route: `/association/members` | Component: `association.members.tsx`"
  },
  {
    ucId: "UC-APP-MBR-02",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Đặt Lịch Hẹn Gặp Kết Nối Kinh Doanh 1-on-1 (Connection Appointments)",
    description: "Gửi lời mời hẹn gặp gỡ giao thương trực tiếp hoặc online giữa 2 chủ doanh nghiệp trong câu lạc bộ.",
    actors: "Hội viên khởi xướng, Hội viên nhận lời mời",
    preConditions: "Cả hai đều là hội viên chính thức.",
    inputs: [
      { field: "targetMemberId", type: "String", req: true, val: "Mã hội viên muốn hẹn gặp" },
      { field: "appointmentDate", type: "DateTime", req: true, val: "Ngày giờ dự kiến gặp mặt" },
      { field: "location", type: "String", req: true, val: "Địa điểm cà phê / Văn phòng / Phòng họp Sapphire Hub / Zoom" },
      { field: "purpose", type: "String", req: true, val: "Mục đích kết nối kinh doanh (Trao đổi cơ hội, Tìm hiểu sản phẩm)" }
    ],
    mainFlow: [
      "Bước 1: Tại hồ sơ của một hội viên trong danh bạ, bấm 'Đặt Lịch Hẹn Gặp 1-1'.",
      "Bước 2: Chọn ngày, giờ và địa điểm đề xuất (Offline hoặc Online).",
      "Bước 3: Nhập nội dung mục đích cuộc gặp, bấm 'Gửi Lời Mời'.",
      "Bước 4: Đối tác nhận được thông báo đẩy tức thì trên điện thoại.",
      "Bước 5: Đối tác mở thông báo, bấm 'Đồng Ý Hẹn Gặp' hoặc đề xuất đổi khung giờ khác.",
      "Bước 6: Khi xác nhận, hệ thống tự động ghi nhận vào Lịch cuộc gặp của cả 2 bên và gửi lời nhắc trước 2 giờ."
    ],
    alternativeFlows: [],
    exceptionFlows: [
      "Bước E1: Trùng lịch với cuộc hẹn khác đã xác nhận -> Cảnh báo nhắc nhở xung đột thời gian."
    ],
    postConditions: "Cuộc hẹn kinh doanh được xác lập chính thức, nâng cao hiệu quả kết nối hiệp hội.",
    businessRules: "Cuộc gặp 1-on-1 được ghi nhận vào chỉ số gắn kết của hội viên.",
    techMapping: "API: `POST /api/association/appointments` | Table: `appointments`"
  },
  {
    ucId: "UC-APP-MBR-03",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Xem Lịch Sử Cuộc Gặp 1-on-1 Đã Diễn Ra & Sắp Diễn Ra",
    description: "Theo dõi toàn bộ nhật ký các cuộc gặp gỡ giao thương đã thực hiện trong tab chuyên biệt tại Danh bạ hội viên.",
    actors: "Hội viên chính thức CLB Doanh Nhân CEO 1983",
    preConditions: "Đã có tương tác hẹn gặp trên hệ thống.",
    inputs: [],
    mainFlow: [
      "Bước 1: Hội viên vào màn hình Danh bạ, chọn tab 'Lịch Sử Cuộc Gặp' (`/association/members?tab=meetings`).",
      "Bước 2: Hệ thống hiển thị danh sách cuộc hẹn phân chia: 'Sắp Diễn Ra' và 'Đã Diễn Ra'.",
      "Bước 3: Mỗi thẻ hiển thị: Thời gian, Đối tác, Địa điểm, Huy hiệu trạng thái và Tóm tắt mục đích.",
      "Bước 4: Bấm nút 'Nhắn tin nhanh' để mở ngay cuộc trò chuyện với đối tác cuộc hẹn đó."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Hội viên quản lý lịch trình kết nối giao thương chặt chẽ.",
    businessRules: "Dữ liệu cuộc gặp được lưu vết phục vụ đánh giá điểm cống hiến.",
    techMapping: "Route: `/association/members` (Tab `meetings`)"
  },
  {
    ucId: "UC-APP-MSG-01",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Hộp Thư Trò Chuyện Thời Gian Thực Doanh Nhân Messenger #0084FF",
    description: "Nhắn tin trao đổi kinh doanh thời gian thực qua WebSocket, hỗ trợ gửi ảnh, tài liệu năng lực và hiển thị trạng thái đã xem.",
    actors: "Hội viên chính thức CLB Doanh Nhân CEO 1983",
    preConditions: "Hai hội viên có nhu cầu trao đổi thông tin.",
    inputs: [
      { field: "receiverId", type: "String UUID", req: true, val: "Mã người nhận tin nhắn" },
      { field: "messageContent", type: "Text", req: true, val: "Nội dung văn bản tin nhắn" }
    ],
    mainFlow: [
      "Bước 1: Hội viên mở tab 'Tin Nhắn' trên thanh điều hướng dưới đáy Mobile App.",
      "Bước 2: Hệ thống tải Hộp thư Messenger phong cách hiện đại với màu chủ đạo #0084FF.",
      "Bước 3: Chọn một cuộc hội thoại từ danh sách hoặc bấm 'Soạn tin mới'.",
      "Bước 4: Nhập nội dung, đính kèm ảnh hoặc tệp hồ sơ năng lực.",
      "Bước 5: Bấm nút 'Gửi'. Máy chủ Socket.IO chuyển tiếp tin nhắn tức thì < 50ms.",
      "Bước 6: Tin nhắn hiển thị trạng thái 'Đã gửi' và 'Đã xem' khi đối phương đọc tin."
    ],
    alternativeFlows: [],
    exceptionFlows: [
      "Bước E1: Mất mạng Internet -> Lưu tin nhắn vào bộ nhớ đệm và tự động gửi lại khi có mạng."
    ],
    postConditions: "Thông tin liên lạc nội bộ được bảo mật tuyệt đối.",
    businessRules: "Huy hiệu số lượng tin nhắn chưa đọc có hiệu ứng gợn sóng animate-ping nhấp nháy.",
    techMapping: "Route: `/association/messages` | Engine: Socket.IO Gateway"
  },
  {
    ucId: "UC-APP-MSG-02",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Kênh Thông Báo Ban Thư Ký Ghim Trên Cùng & Thẻ Liên Kết Zalo OA",
    description: "Kênh truyền thông điều hành chính thức của Ban Thư Ký luôn được ghim cố định ở vị trí số 1 trong Hộp thư, tích hợp thẻ kết nối Zalo Official Account.",
    actors: "Ban Thư Ký (Phát thông báo), Hội viên (Tiếp nhận)",
    preConditions: "Hội viên truy cập Hộp thư tin nhắn.",
    inputs: [],
    mainFlow: [
      "Bước 1: Hội viên mở màn hình Tin nhắn.",
      "Bước 2: Kênh 'Ban Thư Ký CEO 1983' luôn hiển thị trên cùng với huy hiệu Tích xanh xác thực.",
      "Bước 3: Bấm vào kênh để xem các thông báo chỉ đạo, giấy triệu tập họp và văn bản mới nhất.",
      "Bước 4: Chạm vào Thẻ liên kết Zalo OA để chuyển tiếp nhanh sang ứng dụng Zalo kết nối kênh chính thức của hiệp hội."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "100% hội viên tiếp cận thông điệp chỉ đạo của Ban Thường Trực kịp thời.",
    businessRules: "Kênh Ban Thư Ký là kênh hệ thống bất biến, không thể bị xóa hay ẩn đi.",
    techMapping: "Component: `ChatDrawer.tsx` | Room: `system:secretariat`"
  },
  {
    ucId: "UC-APP-EVT-01",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Khám Phá Sự Kiện Hội Thảo & Đêm Gala Dinner Thường Niên",
    description: "Xem chi tiết chương trình sự kiện, danh sách diễn giả VIP, timeline khung giờ và chính sách vé mời tham dự.",
    actors: "Hội viên chính thức CLB Doanh Nhân CEO 1983",
    preConditions: "Có sự kiện đang mở đăng ký.",
    inputs: [],
    mainFlow: [
      "Bước 1: Hội viên mở mục 'Sự Kiện' trên thanh điều hướng (`/association/events`).",
      "Bước 2: Hệ thống hiển thị Carousel Sự kiện nổi bật với ảnh banner 16:9 và bộ đếm ngược.",
      "Bước 3: Danh sách các sự kiện phân loại: 'Sắp Diễn Ra' và 'Đã Kết Thúc'.",
      "Bước 4: Bấm vào một sự kiện để mở màn hình chi tiết: Địa điểm tổ chức, Bản đồ đường đi, Diễn giả VIP và Nút 'Đăng Ký Tham Dự'."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Hội viên nắm rõ kế hoạch sự kiện để chủ động sắp xếp lịch công tác.",
    businessRules: "Icon Sự kiện có huy hiệu số lượng sự kiện mới kèm hiệu ứng animate-pulse.",
    techMapping: "Route: `/association/events` | Component: `association.events.tsx`"
  },
  {
    ucId: "UC-APP-EVT-02",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Đăng Ký Vé Tham Dự & Lựa Chọn Vị Trí Ghế Ngồi Cinema Seating Map",
    description: "Hội viên đăng ký vé tham dự sự kiện Gala 0 VNĐ và trực tiếp chọn vị trí bàn tiệc VIP yêu thích trên sơ đồ ghế trực quan.",
    actors: "Hội viên chính thức CLB Doanh Nhân CEO 1983",
    preConditions: "Sự kiện có thiết kế sơ đồ ghế và đang mở đăng ký chỗ ngồi.",
    inputs: [
      { field: "eventId", type: "String", req: true, val: "Mã sự kiện tham dự" },
      { field: "selectedSeatId", type: "String", req: true, val: "Mã ghế được chọn trên sơ đồ (VD: Bàn 03 - Ghế 08)" }
    ],
    mainFlow: [
      "Bước 1: Tại trang chi tiết sự kiện, hội viên bấm 'Đăng Ký Tham Dự'.",
      "Bước 2: Hệ thống tự động nhận diện tư cách hội viên chính thức, áp dụng giá vé VIP 0 VNĐ.",
      "Bước 3: Mở màn hình Sơ Đồ Ghế Ngồi Cinema Seating Map trên điện thoại.",
      "Bước 4: Hội viên chạm chọn bàn tiệc và ghế còn trống (Ghế đã có người chọn hiển thị màu xám khóa).",
      "Bước 5: Bấm 'Xác Nhận Giữ Chỗ'.",
      "Bước 6: Hệ thống khóa ghế và phát hành Vé điện tử E-Ticket tức thì vào Ví vé của hội viên."
    ],
    alternativeFlows: [],
    exceptionFlows: [
      "Bước E1: Ghế vừa bị người khác chọn trước trong tích tắc -> Báo lỗi: 'Ghế này vừa được đăng ký, vui lòng chọn vị trí khác'."
    ],
    postConditions: "Hội viên sở hữu vé sự kiện có số bàn và số ghế định danh chính xác.",
    businessRules: "Mỗi hội viên chỉ được đăng ký 01 vé hội viên chính thức 0 VNĐ.",
    techMapping: "API: `POST /api/association/events/:id/register` | Table: `event_registrations`"
  },
  {
    ucId: "UC-APP-EVT-03",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Ví Vé Điện Tử E-Ticket Offline & Mã Check-in QR Khổ Lớn (#LUCKY-xxxx)",
    description: "Lưu trữ vé sự kiện offline trong điện thoại, hiển thị mã QR khổ lớn và mã số bốc thăm may mắn để qua cổng an ninh đón tiếp.",
    actors: "Hội viên tham dự sự kiện Gala",
    preConditions: "Đã đăng ký vé sự kiện thành công.",
    inputs: [],
    mainFlow: [
      "Bước 1: Khi đến hội trường sự kiện, hội viên mở mục 'Vé Của Tôi' trên Mobile App.",
      "Bước 2: Vé điện tử E-Ticket hiển thị toàn màn hình với nhận diện Hoàng gia Navy & Gold.",
      "Bước 3: Hiển thị nổi bật: Mã QR Check-in khổ lớn, Họ tên, Tên công ty, Vị trí Bàn tiệc VIP và Mã số bốc thăm may mắn (#LUCKY-xxxx).",
      "Bước 4: Đưa mã QR trước máy quét tại Cổng an ninh đón tiếp.",
      "Bước 5: Cổng an ninh xác thực thành công trong 0.2s, hội viên bước vào hội trường dự tiệc."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Đại biểu hoàn tất thủ tục check-in nhanh gọn, không cần xếp hàng tìm tên trên giấy.",
    businessRules: "Vé điện tử được lưu cache offline, hoạt động bình thường cả khi hội trường nghẽn mạng.",
    techMapping: "Component: `EventTicketModal.tsx` | Caching: IndexedDB / LocalStorage"
  },
  {
    ucId: "UC-APP-FEE-01",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Tra Cứu Tình Trạng Hội Phí & Sinh Mã VietQR Động 5.000.000 VNĐ Napas 24/7",
    description: "Hội viên xem thời hạn hiệu lực của thẻ VIP và thanh toán hội phí thường niên nhanh 24/7 qua mã VietQR động.",
    actors: "Hội viên chính thức CLB Doanh Nhân CEO 1983",
    preConditions: "Hội viên truy cập ứng dụng di động.",
    inputs: [],
    mainFlow: [
      "Bước 1: Hội viên mở mục 'Hội Phí' trên Mobile App (`/association/renew`).",
      "Bước 2: Màn hình hiển thị: Ngày hết hạn thẻ VIP hiện tại, Tình trạng công nợ (Đã đóng / Đến hạn).",
      "Bước 3: Nhấn nút 'Thanh Toán VietQR'.",
      "Bước 4: Hệ thống sinh mã VietQR động chuẩn Napas 24/7 chứa sẵn: 5.000.000 VNĐ, Tên tài khoản CLB CEO 1983 và Cú pháp: `HOIPHI CEO1983 [MÃ_HV] [HỌ_TÊN]`.",
      "Bước 5: Hội viên mở app ngân hàng quét mã hoặc bấm 'Lưu ảnh QR' để chuyển khoản.",
      "Bước 6: Sau khi chuyển tiền, kế toán đối soát sao kê và duyệt gạch nợ trên CRM gia hạn thẻ +365 ngày."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Hội viên thực hiện nghĩa vụ tài chính thuận tiện, không cần gõ tay số tài khoản hay cú pháp.",
    businessRules: "RULE-TERMINOLOGY-HOIPHI: Dùng thuật ngữ Hội phí thường niên, cấm dùng 'niên liễm'.",
    techMapping: "Route: `/association/renew` | Component: `association.renew.tsx`"
  },
  {
    ucId: "UC-APP-FEE-02",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Xem Lịch Sử Đóng Hội Phí & Tải Hóa Đơn Điện Tử",
    description: "Tra cứu lại toàn bộ các kỳ hội phí đã nộp trong suốt quá trình tham gia hiệp hội và tải hóa đơn điện tử.",
    actors: "Hội viên chính thức CLB Doanh Nhân CEO 1983",
    preConditions: "Hội viên đã có ít nhất một giao dịch hội phí được gạch nợ.",
    inputs: [],
    mainFlow: [
      "Bước 1: Tại mục Hội phí, hội viên chọn tab 'Lịch Sử Giao Dịch'.",
      "Bước 2: Hệ thống liệt kê danh sách các năm đã đóng: Năm tài chính, Số tiền 5.000.000 VNĐ, Ngày thanh toán, Trạng thái 'Đã Hoàn Thành'.",
      "Bước 3: Bấm vào kỳ bất kỳ để xem và tải Hóa đơn điện tử (.pdf) phục vụ hạch toán chi phí doanh nghiệp."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Doanh nghiệp có đầy đủ chứng từ quyết toán hợp lệ.",
    businessRules: "Hóa đơn điện tử được lưu trữ vĩnh viễn trên hệ thống.",
    techMapping: "Route: `/association/renew/history` | Table: `invoices`"
  },
  {
    ucId: "UC-APP-B2B-01",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Khám Phá Sàn Thương Mại B2B & Xem Chi Tiết Báo Giá Sản Phẩm",
    description: "Khám phá chợ giao thương nội khối, tìm kiếm nhà cung cấp tin cậy trong các bạn đồng niên 1983 và yêu cầu báo giá ưu đãi.",
    actors: "Hội viên chính thức CLB Doanh Nhân CEO 1983",
    preConditions: "Đã đăng nhập vào Mobile App.",
    inputs: [
      { field: "category", type: "String", req: false, val: "Ngành nghề cung ứng (Xây dựng, F&B, Công nghệ, Y tế, Thời trang...)" }
    ],
    mainFlow: [
      "Bước 1: Hội viên mở mục 'Chợ B2B' (`/association/products`).",
      "Bước 2: Hệ thống hiển thị 2 tab lớn: 'Chợ Giao Thương B2B' và 'Gian Hàng Của Tôi'.",
      "Bước 3: Xem lưới sản phẩm với nhãn chiết khấu trợ giá nội bộ nổi bật (VD: 'Ưu đãi nội bộ 15%').",
      "Bước 4: Bấm vào sản phẩm để mở `ProductDetailModal`: Thông tin kỹ thuật, Uy tín công ty, Hồ sơ năng lực.",
      "Bước 5: Bấm nút 'Báo Giá ->' để mở cuộc đàm phán 1-on-1 trực tiếp với chủ doanh nghiệp bán."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Hội viên tiếp cận nguồn hàng chất lượng cao với giá ưu đãi độc quyền.",
    businessRules: "Loại bỏ hoàn toàn các hành vi B2C e-commerce (trái tim wishlist lặp đi lặp lại) khỏi sàn B2B.",
    techMapping: "Route: `/association/products` | Component: `association.products.tsx`"
  },
  {
    ucId: "UC-APP-B2B-02",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Đăng Bán Sản Phẩm/Dịch Vụ Trợ Giá Nội Bộ Cho Hiệp Hội",
    description: "Doanh nghiệp thành viên đưa sản phẩm thế mạnh lên sàn B2B để tiếp cận 500+ khách hàng doanh nghiệp tiềm năng trong CLB.",
    actors: "Hội viên doanh nghiệp cung ứng",
    preConditions: "Tài khoản hội viên đang hoạt động hợp lệ.",
    inputs: [
      { field: "title", type: "String", req: true, val: "Tên sản phẩm dịch vụ" },
      { field: "price", type: "Decimal", req: true, val: "Giá bán niêm yết" },
      { field: "discountPercent", type: "Decimal", req: true, val: "Tỷ lệ trợ giá nội bộ (>= 5%)" },
      { field: "images", type: "Array of Files", req: true, val: "Ảnh sản phẩm thực tế" }
    ],
    mainFlow: [
      "Bước 1: Tại Sàn B2B, chuyển sang tab 'Gian Hàng Của Tôi', bấm 'Đăng Sản Phẩm Mới'.",
      "Bước 2: Điền tên sản phẩm, giá thị trường và mức chiết khấu cam kết dành riêng cho CEO 1983.",
      "Bước 3: Tải ảnh sản phẩm từ điện thoại.",
      "Bước 4: Nhấn 'Gửi Kiểm Duyệt'.",
      "Bước 5: Ban Xúc Tiến kiểm tra và phê duyệt niêm yết trên sàn trong vòng 24 giờ."
    ],
    alternativeFlows: [],
    exceptionFlows: [
      "Bước E1: Mức chiết khấu < 5% -> Báo lỗi yêu cầu tối thiểu 5% trợ giá nội bộ."
    ],
    postConditions: "Sản phẩm được gửi đến Hội đồng kiểm duyệt Ban Xúc Tiến.",
    businessRules: "RULE-B2B-INTERNAL-DISCOUNT: Bắt buộc trợ giá nội bộ.",
    techMapping: "API: `POST /api/association/products` | Table: `products`"
  },
  {
    ucId: "UC-APP-B2B-03",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Quản Lý Gian Hàng Của Tôi (Chỉnh Sửa, Cập Nhật Giá, Ẩn Sản Phẩm)",
    description: "Quản trị danh mục sản phẩm đang chào bán của doanh nghiệp mình trên sàn giao thương hiệp hội.",
    actors: "Hội viên sở hữu gian hàng",
    preConditions: "Hội viên đã có sản phẩm đăng trên sàn.",
    inputs: [
      { field: "productId", type: "String", req: true, val: "Mã sản phẩm cần điều chỉnh" }
    ],
    mainFlow: [
      "Bước 1: Hội viên vào tab 'Gian Hàng Của Tôi' trên màn hình Chợ B2B.",
      "Bước 2: Xem danh sách các sản phẩm của công ty mình và số lượt quan tâm báo giá.",
      "Bước 3: Chọn 'Chỉnh sửa' để cập nhật giá hoặc chính sách khuyến mãi mới.",
      "Bước 4: Chọn 'Tạm ẩn' nếu sản phẩm tạm thời hết hàng.",
      "Bước 5: Nhấn 'Lưu Cập Nhật'."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Thông tin gian hàng luôn phản ánh đúng năng lực cung ứng hiện tại.",
    businessRules: "Chỉ chủ sở hữu sản phẩm hoặc Ban Xúc Tiến mới có quyền chỉnh sửa/ẩn sản phẩm.",
    techMapping: "Route: `/association/products` (Tab `my-store`)"
  },
  {
    ucId: "UC-APP-OPP-01",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Khám Phá Bảng Tin Cơ Hội Kinh Doanh Cung - Cầu (Cần Mua / Cần Bán)",
    description: "Xem dòng thời gian các nhu cầu tìm kiếm đối tác, mua sắm vật tư thiết bị hoặc hợp tác đầu tư của các thành viên.",
    actors: "Hội viên chính thức CLB Doanh Nhân CEO 1983",
    preConditions: "Đã đăng nhập vào Mobile App.",
    inputs: [
      { field: "typeFilter", type: "Enum", req: false, val: "Tất cả | Cần Mua (need) | Cần Bán (offer)" }
    ],
    mainFlow: [
      "Bước 1: Hội viên mở mục 'Cơ Hội Hợp Tác' (`/association/opportunities`).",
      "Bước 2: Hệ thống hiển thị Bảng tin Cung - Cầu thời gian thực phong cách mạng xã hội doanh nhân.",
      "Bước 3: Mỗi thẻ tin hiển thị: Doanh nghiệp đăng tin, Loại tin (Cần Mua màu Xanh / Cần Bán màu Vàng), Ngân sách dự kiến, Hạn chót và Nội dung yêu cầu.",
      "Bước 4: Bấm vào tin đăng để xem chi tiết và thảo luận."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Nắm bắt nhanh các cơ hội kinh doanh thực tế trong hiệp hội.",
    businessRules: "Tin đăng phải rõ ràng, nghiêm túc, không spam quảng cáo rác.",
    techMapping: "Route: `/association/opportunities` | Component: `association.opportunities.tsx`"
  },
  {
    ucId: "UC-APP-OPP-02",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Đăng Tin Nhu Cầu Giao Thương Mới Lên Bảng Tin Hiệp Hội",
    description: "Phát đi nhu cầu tìm kiếm nhà cung cấp hoặc chào bán đơn hàng số lượng lớn đến toàn thể cộng đồng CEO 1983.",
    actors: "Hội viên có nhu cầu giao thương",
    preConditions: "Tài khoản hội viên đang hoạt động hợp lệ.",
    inputs: [
      { field: "title", type: "String", req: true, val: "Tiêu đề nhu cầu ngắn gọn, súc tích" },
      { field: "type", type: "Enum", req: true, val: "need (Cần Mua) | offer (Cần Bán)" },
      { field: "budget", type: "Decimal", req: false, val: "Ngân sách dự toán (VNĐ)" },
      { field: "description", type: "Text", req: true, val: "Mô tả tiêu chuẩn kỹ thuật và điều kiện giao hàng" }
    ],
    mainFlow: [
      "Bước 1: Tại Bảng tin Cơ hội, hội viên bấm nút 'Đăng Tin Mới'.",
      "Bước 2: Chọn loại tin: 'Cần Mua' hoặc 'Cần Bán'.",
      "Bước 3: Nhập tiêu đề, mô tả yêu cầu, ngân sách dự kiến và thời hạn cần tiếp nhận hồ sơ.",
      "Bước 4: Nhấn nút 'Đăng Tin Ngay'.",
      "Bước 5: Tin đăng lập tức hiển thị trên bảng tin của toàn thể hội viên và gửi thông báo đến Ban Xúc Tiến."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Cơ hội kinh doanh được lan tỏa đến 500+ chủ doanh nghiệp.",
    businessRules: "Tin Cần Mua được ưu tiên hiển thị nổi bật trên Bảng tin.",
    techMapping: "API: `POST /api/association/opportunities` | Table: `business_card_needs`"
  },
  {
    ucId: "UC-APP-OPP-03",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Tiếp Nhận Cơ Hội Hợp Tác (Claim Opportunity) & Mở Phòng Trao Đổi 1-1",
    description: "Doanh nghiệp có năng lực bấm tiếp nhận cơ hội kinh doanh để mở ngay kênh đàm phán hợp tác chính danh với bên đăng tin.",
    actors: "Doanh nghiệp cung ứng quan tâm cơ hội",
    preConditions: "Có tin Cung - Cầu đang mở tiếp nhận.",
    inputs: [
      { field: "opportunityId", type: "String", req: true, val: "Mã tin giao thương muốn tiếp nhận" },
      { field: "introMessage", type: "String", req: true, val: "Lời nhắn giới thiệu năng lực cung ứng" }
    ],
    mainFlow: [
      "Bước 1: Khi xem một tin đăng Cần Mua phù hợp năng lực, hội viên bấm nút 'Tiếp Nhận Cơ Hội' (Claim Opportunity).",
      "Bước 2: Nhập tóm tắt năng lực cung ứng và cam kết chính sách ưu đãi.",
      "Bước 3: Bấm 'Xác Nhận Hợp Tác'.",
      "Bước 4: Hệ thống tự động tạo phòng trò chuyện riêng tư 1-on-1 trong Hộp thư Messenger #0084FF giữa hai doanh nhân.",
      "Bước 5: Ghi nhận sự kiện kết nối vào bảng theo dõi của Ban Xúc Tiến để hỗ trợ pháp lý và chứng thư uy tín khi cần."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Hai doanh nghiệp bắt đầu đàm phán thương vụ có bảo chứng của hiệp hội.",
    businessRules: "Mỗi cơ hội có thể tiếp nhận tối đa 5 đơn vị báo giá để cạnh tranh lành mạnh.",
    techMapping: "API: `POST /api/association/opportunities/:id/claim`"
  },
  {
    ucId: "UC-APP-VOT-01",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Biểu Quyết & Bầu Cử Đại Hội Điện Tử Trực Tuyến 1 Người 1 Phiếu",
    description: "Thực hiện bỏ phiếu bầu cử Ban Chấp Hành hoặc biểu quyết thông qua nghị quyết đại hội trên điện thoại di động với độ trễ live 1 giây.",
    actors: "Hội viên chính thức CLB Doanh Nhân CEO 1983",
    preConditions: "Phiên biểu quyết đang được kích hoạt mở hòm phiếu (status = 'open') và hội viên có `fee_paid = true`.",
    inputs: [
      { field: "votingSessionId", type: "String", req: true, val: "Mã phiên biểu quyết đại hội" },
      { field: "selectedOptionId", type: "String", req: true, val: "Lựa chọn: Đồng ý | Không đồng ý | Ý kiến khác" }
    ],
    mainFlow: [
      "Bước 1: Khi Chủ tọa đại hội phát lệnh, Ban Thư Ký mở hòm phiếu biểu quyết trên Web CRM.",
      "Bước 2: Toàn bộ hội viên chính thức nhận được thông báo đẩy trên Mobile App, mở màn hình Biểu Quyết (/association/voting).",
      "Bước 3: Xem nội dung tờ trình, chọn phương án biểu quyết và bấm 'Xác Nhận Bỏ Phiếu'.",
      "Bước 4: Hệ thống kiểm tra tư cách cử tri: Bắt buộc tài khoản có trạng thái phí paid và chưa từng bỏ phiếu trong phiên này.",
      "Bước 5: Hệ thống mã hóa một chiều phiếu bầu (Đảm bảo nguyên tắc bỏ phiếu kín ẩn danh).",
      "Bước 6: Khóa nút bỏ phiếu trên điện thoại của hội viên, hiển thị thông báo 'Quý anh/chị đã hoàn thành biểu quyết'.",
      "Bước 7: Máy chủ tổng hợp phiếu bầu tức thời qua Socket.IO.",
      "Bước 8: Màn hình lớn trung tâm của Đại hội hiển thị biểu đồ tỷ lệ phần trăm (%) nhảy động theo thời gian thực (Live 1s)."
    ],
    alternativeFlows: [],
    exceptionFlows: [
      "Bước E1: Cố tình bỏ phiếu lần thứ hai -> Hệ thống chặn ngay lập tức: 'Quý đại biểu đã thực hiện bỏ phiếu trong phiên này'.",
      "Bước E2: Hội viên chưa hoàn thành hội phí thường niên -> Hệ thống thông báo: 'Chỉ hội viên hoàn thành nghĩa vụ hội phí mới có quyền biểu quyết đại hội'."
    ],
    postConditions: "Kết quả kiểm phiếu đại hội chính xác 100%, minh bạch tuyệt đối, rút ngắn thời gian kiểm phiếu từ 3 giờ xuống còn 1 giây.",
    businessRules: "RULE-VOTING-ONE-PERSON-ONE-VOTE: Mỗi hội viên có đúng 1 phiếu bầu, không thể sửa đổi sau khi nộp.",
    techMapping: "Route: `/association/voting` | API: `POST /api/association/voting/submit`"
  },
  {
    ucId: "UC-APP-NOTIF-01",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Trung Tâm Thông Báo Đẩy Thời Gian Thực (Push Notifications)",
    description: "Nhận thông báo tức thì về lịch họp, sự kiện mới, nhắc nộp hội phí, tin nhắn messenger và biến động cơ hội kinh doanh.",
    actors: "Hội viên chính thức CLB Doanh Nhân CEO 1983",
    preConditions: "Hội viên cho phép nhận thông báo trên thiết bị di động.",
    inputs: [],
    mainFlow: [
      "Bước 1: Hội viên chạm vào biểu tượng Chuông thông báo ở góc trên bên phải màn hình.",
      "Bước 2: Trung tâm thông báo mở ra, hiển thị các thông báo chia theo danh mục: Hệ thống, Sự kiện, Giao thương, Tin nhắn.",
      "Bước 3: Thông báo chưa đọc có chấm xanh nổi bật.",
      "Bước 4: Chạm vào thông báo bất kỳ để điều hướng thẳng đến màn hình nghiệp vụ liên quan.",
      "Bước 5: Bấm 'Đánh dấu tất cả đã đọc' để xóa các huy hiệu chưa đọc."
    ],
    alternativeFlows: [],
    exceptionFlows: [],
    postConditions: "Hội viên không bao giờ bỏ lỡ các thông tin điều hành quan trọng.",
    businessRules: "Thông báo đẩy được truyền tải qua Web Push API và WebSocket thời gian thực.",
    techMapping: "Component: `NotificationDrawer.tsx` | Engine: Web Push Protocol"
  },
  {
    ucId: "UC-APP-SET-01",
    module: "Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983",
    name: "Cài Đặt Ứng Dụng PWA Màn Hình Chính iOS & Android 1-Chạm",
    description: "Cơ chế tự động hỏi 'Bạn muốn thêm ứng dụng CEO 1983 vào màn hình chính không?' khi mở link chia sẻ, hướng dẫn cài đặt PWA chuẩn icon và tên thương hiệu.",
    actors: "Hội viên sử dụng smartphone iOS hoặc Android",
    preConditions: "Mở ứng dụng trên trình duyệt web di động (Safari iOS hoặc Chrome Android).",
    inputs: [],
    mainFlow: [
      "Bước 1: Khi hội viên mở liên kết web app lần đầu hoặc bấm vào link chia sẻ `?install=ios`, hệ thống kích hoạt hộp thoại trang trọng: 'Bạn muốn thêm ứng dụng CEO 1983 vào màn hình chính không?'.",
      "Bước 2: Hộp thoại hiển thị biểu tượng Logo chuẩn CEO 1983 và 2 nút: `[Có, thêm luôn]` và `[Để sau]`.",
      "Bước 3: Nếu trên iOS: Bấm `[Có, thêm luôn]` mở hướng dẫn 3 bước Safari (Nút Chia sẻ -> Thêm vào MH chính) hoặc tải Profile WebClip `.mobileconfig` 1-chạm.",
      "Bước 4: Nếu trên Android: Bắt sự kiện native `beforeinstallprompt`, kích hoạt hộp thoại cài đặt trực tiếp của hệ điều hành.",
      "Bước 5: Biểu tượng ứng dụng 'CEO 1983' xuất hiện trên màn hình chính của điện thoại, khởi chạy toàn màn hình độc lập như app native."
    ],
    alternativeFlows: [
      "Bước A1: Hội viên bấm '[Để sau]' -> Ghi nhớ vĩnh viễn vào `localStorage`, không tự ý hiện lại làm phiền người dùng."
    ],
    exceptionFlows: [
      "Bước E1: Mở qua trình duyệt In-App của Zalo / Facebook Messenger -> Hệ thống phát hiện và hướng dẫn 2 bước mở bằng Safari ngoài."
    ],
    postConditions: "Ứng dụng CEO 1983 được cài đặt hoàn chỉnh trên màn hình chính của hội viên.",
    businessRules: "Khi người dùng đã bấm tắt, tuyệt đối không được tự ý hiện lại popup làm phiền.",
    techMapping: "Component: `IosInstallPrompt.tsx` | WebClip: `/ceo1983.mobileconfig`"
  }
];

module.exports = {
  SRS_METADATA,
  USER_ROLES_DATA,
  USER_JOURNEYS_DATA,
  ALL_USE_CASES_DETAILED
};
