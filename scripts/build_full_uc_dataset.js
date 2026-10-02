// build_full_uc_dataset.js - Compiles all 160 distinct, detailed Use Cases for ViOne Master SRS
const fs = require('fs');
const path = require('path');

const ucList = [];

// =========================================================================
// PHÂN HỆ 1: CỔNG THÔNG TIN CÔNG KHAI & TIẾP NHẬN BÁO GIÁ (15 UCs)
// =========================================================================
const pubUCs = [
  {
    id: 'UC-VN-PUB-01',
    category: 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
    name: 'Xem Hero Section & Trải Nghiệm Hoạt Ảnh 4.8s Pop-up Keyframe',
    actor: 'Khách vãng lai, Doanh nhân, Khách hàng B2B tiềm năng',
    preConditions: 'Người dùng truy cập trang chủ ViOne Platform qua trình duyệt web tại https://vione.ai.',
    mainFlow: '1. Hệ thống tải trang chủ với giao diện phong cách Hoàng gia Doanh nhân (Royal Dark Slate & Luxury Gold).\n2. Kích hoạt hoạt ảnh chu kỳ 4.8 giây: Hình ảnh doanh nhân nổi bật phóng to 1.05 lần, đẩy lớp z-index 30 về phía trước khung smartphone VIONE MOBILE.\n3. Khối chỉ số đo lường hiệu suất hiển thị số liệu động: 98.4% độ tin cậy, tăng tốc vận hành 10x, tiến trình AI Bot tự động.\n4. Người dùng quan sát thông điệp định vị "Hệ sinh thái số hóa & CRM quản trị doanh nghiệp toàn diện 5.0".',
    alternativeFlow: 'Nếu thiết bị người dùng là thiết bị cấu hình yếu hoặc tắt hoạt ảnh trình duyệt, hệ thống tự động fallback về hiển thị đồ họa tĩnh tối ưu, đảm bảo tốc độ tải trang dưới 1.2 giây.',
    postConditions: 'Hệ thống ghi nhận 01 lượt xem trang (Pageview) vào hệ thống phân tích nhật ký ẩn danh.',
    imageFile: '01_landing_hero.png',
    imageCaption: 'Giao diện Hero Section Landing Web với Hoạt ảnh Pop-up 4.8s Doanh nhân & Smartphone 3D'
  },
  {
    id: 'UC-VN-PUB-02',
    category: 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
    name: 'Khám Phá Mô Đun Liên Kết & Kiến Trúc Hợp Nhất 4 Trụ Cột',
    actor: 'Khách vãng lai, Giám đốc điều hành, Trưởng phòng Chuyển đổi số',
    preConditions: 'Người dùng cuộn trang xuống phần Mô Đun Liên Kết hoặc nhấn liên kết "Giải Pháp" trên thanh điều hướng.',
    mainFlow: '1. Màn hình hiển thị 4 khối phân hệ cốt lõi: CRM & Phễu Lead 360°, Vione Work Quản lý công việc, Vione Finance Quản trị dòng tiền, Vione HRM Quản lý nhân sự.\n2. Người dùng di chuột qua từng thẻ phân hệ: Hiệu ứng viền phát sáng Gradient vàng ánh kim và hiển thị tóm tắt tính năng mở rộng.\n3. Người dùng nhấn nút "Xem cấu trúc liên thông" để xem sơ đồ dòng chảy dữ liệu đồng nhất giữa 4 phân hệ.',
    alternativeFlow: 'Người dùng có thể chuyển đổi nhanh giữa các tab tính năng bằng phím mũi tên trái/phải trên bàn phím.',
    postConditions: 'Khách hàng nắm rõ mô hình dữ liệu tập trung, xóa bỏ tình trạng phân mảnh thông tin giữa các phòng ban.',
    imageFile: '02_landing_cinematic.png',
    imageCaption: 'Sơ đồ Kiến trúc Hợp nhất 4 Phân hệ Cốt lõi: CRM, Work, Finance và HRM'
  },
  {
    id: 'UC-VN-PUB-03',
    category: 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
    name: 'Trải Nghiệm Bộ Máy Tự Động Hóa Quy Trình AI Workflow Copilot',
    actor: 'Chuyên viên Vận hành, Trưởng bộ phận IT, Giám đốc Vận hành (COO)',
    preConditions: 'Người dùng cuộn tới phần "Tự Động Hóa Quy Trình Với AI Workflow".',
    mainFlow: '1. Hệ thống hiển thị mô hình trực quan quy trình tự động hóa: Điểm kích hoạt (Trigger) -> Phân tích dữ liệu bằng AI -> Thực thi hành động đa kênh (Action).\n2. Người dùng nhấp vào kịch bản mẫu "Tiếp nhận Lead -> Thẩm định tiềm năng -> Gửi báo giá tự động trong 60 giây".\n3. Quan sát mô phỏng luồng tin nhắn và thông báo được kích hoạt đồng thời đến CRM và ứng dụng di động.',
    alternativeFlow: 'Người dùng nhấp vào nút "Thử nghiệm kịch bản khác" để xem kịch bản "Duyệt chi tài chính tự động" hoặc "Cảnh báo quá hạn hợp đồng".',
    postConditions: 'Khách hàng hình dung được năng lực cắt giảm 40% chi phí vận hành hành chính nhờ tự động hóa.',
    imageFile: 'workflow-automation.png',
    imageCaption: 'Mô hình Trực quan Hóa Bộ Máy Tự Động Hóa Quy Trình Đa Kênh AI Workflow Copilot'
  },
  {
    id: 'UC-VN-PUB-04',
    category: 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
    name: 'Xem Trung Tâm Giám Sát Vận Hành & Đo Lường SLA Thời Gian Thực',
    actor: 'Ban Giám Đốc, Trưởng ban Kiểm soát, Giám đốc Tài chính (CFO)',
    preConditions: 'Người dùng quan sát khu vực "Kiểm Soát Vận Hành Toàn Diện".',
    mainFlow: '1. Khung hiển thị mô phỏng màn hình máy tính làm việc chuẩn doanh nghiệp.\n2. Quan sát biểu đồ đo lường tốc độ phản hồi hệ thống (SLA < 150ms), tỷ lệ uptime máy chủ đạt 99.98%.\n3. Xem bảng điều khiển tóm tắt: Doanh thu thực thu, Công nợ cần đòi, Tiến độ dự án trọng điểm và Tỷ lệ hoàn thành KPI.',
    alternativeFlow: 'Người dùng có thể bấm vào nút "Xem chi tiết đồ thị" để phóng to giao diện mô phỏng giám sát.',
    postConditions: 'Khách hàng yên tâm về năng lực kiểm soát dữ liệu và tính minh bạch 24/7 của nền tảng.',
    imageFile: 'operational-dashboard.png',
    imageCaption: 'Trung Tâm Giám Sát Vận Hành Tổng Thể & Đo Lường Chỉ Số KPI Doanh Nghiệp Thời Gian Thực'
  },
  {
    id: 'UC-VN-PUB-05',
    category: 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
    name: 'Khám Phá Quy Trình 3 Bước Thiết Lập Tự Động Siêu Tốc Trong 5 Phút',
    actor: 'Chủ Doanh Nghiệp, Quản trị viên hệ thống tương lai',
    preConditions: 'Người dùng xem mục "3 Bước Thiết Lập Tự Động".',
    mainFlow: '1. Xem Bước 01 (Trigger): Tích hợp nguồn dữ liệu đầu vào (Biểu mẫu web, Fanpage, Hotline, Zalo OA).\n2. Xem Bước 02 (Actions): Cấu hình các điều kiện phân loại và gán việc tự động bằng giao diện kéo thả không cần code.\n3. Xem Bước 03 (Monitor): Bật chế độ giám sát tự động và nhận báo cáo định kỳ qua di động.',
    alternativeFlow: 'Người dùng có thể nhấn liên kết "Xem hướng dẫn triển khai nhanh" để đọc quy trình chi tiết.',
    postConditions: 'Khách hàng xóa bỏ định kiến rằng triển khai phần mềm quản trị doanh nghiệp phải mất nhiều tháng.',
    imageFile: 'business-laptop.png',
    imageCaption: 'Quy Trình 3 Bước Thiết Lập Vận Hành Siêu Tốc Trong 5 Phút'
  },
  {
    id: 'UC-VN-PUB-06',
    category: 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
    name: 'Đánh Giá 4 Trụ Cột Giá Trị Cốt Lõi & Tiêu Chuẩn Bảo Mật AES-256',
    actor: 'Giám đốc An ninh Thông tin (CISO), Chuyên gia Pháp chế, Doanh nhân',
    preConditions: 'Người dùng xem mục "Giá Trị Doanh Nghiệp 360°".',
    mainFlow: '1. Đọc nội dung 4 trụ cột: Tiết kiệm 40% chi phí, Ra quyết định dựa trên dữ liệu (Data-driven), Nâng tầm trải nghiệm đối tác và Bảo mật tiêu chuẩn ngân hàng.\n2. Kiểm tra các huy hiệu bảo mật: Mã hóa cơ sở dữ liệu AES-256, truyền tải TLS 1.3, Chứng nhận trung tâm dữ liệu Tier III.\n3. Xem cam kết thỏa thuận mức dịch vụ (SLA) bồi hoàn nếu gián đoạn dịch vụ.',
    alternativeFlow: 'Người dùng có thể yêu cầu gửi "Bản cáo bạch Tiêu chuẩn An toàn Thông tin" qua email.',
    postConditions: 'Xác thực sự uy tín và tính pháp lý vững vàng của hệ thống ViOne.',
    imageFile: '01_crm_login_blue_white.png',
    imageCaption: 'Trụ Cột Giá Trị Cốt Lõi & Tiêu Chuẩn An Toàn Bảo Mật Đa Tầng Cấp Doanh Nghiệp'
  },
  {
    id: 'UC-VN-PUB-07',
    category: 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
    name: 'Khám Phá Mô Hình Giải Pháp Phù Hợp Đa Dạng Mô Hình Ngành Nghề',
    actor: 'Chủ doanh nghiệp sản xuất, dịch vụ, bán lẻ, công nghệ',
    preConditions: 'Người dùng xem khu vực "Giải Pháp Theo Mô Hình Doanh Nghiệp".',
    mainFlow: '1. Xem giải pháp dành cho Doanh nghiệp Thương mại & Dịch vụ: Quản lý hợp đồng, phễu lead, giao việc Kanban.\n2. Xem giải pháp dành cho Doanh nghiệp Chuỗi & Bán lẻ: Đối soát doanh thu chi nhánh, tích hợp cổng thanh toán VietQR.\n3. Xem giải pháp dành cho Doanh nghiệp Sản xuất & Phân phối: Quản lý đại lý B2B, catalog sản phẩm, theo dõi đơn vị giao vận.',
    alternativeFlow: 'Người dùng nhấp vào từng ngành nghề để xem các tính năng được khuyến nghị tương ứng.',
    postConditions: 'Khách hàng nhận diện chính xác bài toán đặc thù của doanh nghiệp mình được giải quyết trọn vẹn.',
    imageFile: 'business-laptop.png',
    imageCaption: 'Giải Pháp Số Hóa Vận Hành May Đo Theo Đa Dạng Nhóm Ngành Nghề'
  },
  {
    id: 'UC-VN-PUB-08',
    category: 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
    name: 'Tra Cứu Đánh Giá Của Khách Hàng Lãnh Đạo Tiêu Biểu (Testimonials)',
    actor: 'Khách hàng tiềm năng cần tham chiếu độ tin cậy xã hội (Social Proof)',
    preConditions: 'Người dùng xem phần "Khách Hàng Nói Về Chúng Tôi".',
    mainFlow: '1. Xem ảnh chân dung đại diện sắc nét và trích dẫn chia sẻ của Tổng giám đốc Nguyễn Minh Đăng.\n2. Đọc kết quả thực chứng: "Quản lý 5 chi nhánh trực tiếp trên smartphone, cắt giảm 3 nhân sự nhập liệu thủ công".\n3. Xem logo các tập đoàn, hiệp hội doanh nghiệp lớn đang ứng dụng hệ sinh thái ViOne.',
    alternativeFlow: 'Người dùng có thể vuốt xem qua lại giữa các câu chuyện thành công của các doanh nghiệp khác.',
    postConditions: 'Tăng cường 100% niềm tin thương hiệu và sẵn sàng chuyển đổi sang bước yêu cầu báo giá.',
    imageFile: 'avatar-ceo.png',
    imageCaption: 'Chia Sẻ Đánh Giá Thực Tế Từ Lãnh Đạo Doanh Nghiệp Đang Vận Hành Hệ Thống ViOne'
  },
  {
    id: 'UC-VN-PUB-09',
    category: 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
    name: 'Tham Khảo Cấu Trúc Bảng Giá Dịch Vụ Tùy Biến 3 Gói Giải Pháp',
    actor: 'Đại diện bộ phận thu mua, Ban Giám Đốc doanh nghiệp',
    preConditions: 'Người dùng xem mục "Bảng Giá Dịch Vụ Tùy Biến".',
    mainFlow: '1. Xem 3 gói giải pháp: Gói Khởi tạo (Starter), Gói Tăng trưởng (Growth) và Gói Doanh nghiệp Lớn (Enterprise).\n2. Đọc chi tiết các danh mục tính năng mở khóa: Số lượng tài khoản người dùng, dung lượng lưu trữ, cấp quyền AI Copilot.\n3. Quan sát thông điệp cam kết: "Không hiển thị giá cứng cố định - Chi phí được may đo chính xác theo quy mô và nhu cầu thực tế".\n4. Mỗi gói có nút CTA kích hoạt "Yêu Cầu Báo Giá May Đo".',
    alternativeFlow: 'Người dùng có thể bật tắt công tắc so sánh tính năng chi tiết giữa các gói dịch vụ.',
    postConditions: 'Khách hàng hiểu rõ gói giải pháp định hướng và bấm nút yêu cầu tư vấn.',
    imageFile: 'crm_dash_view_06.png',
    imageCaption: 'Cấu Trúc 3 Gói Giải Pháp Số Hóa Doanh Nghiệp & Chính Sách Báo Giá May Đo'
  },
  {
    id: 'UC-VN-PUB-10',
    category: 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
    name: 'Mở & Điền Form Yêu Cầu Báo Giá & Tư Vấn 1-1 Chuyên Sâu',
    actor: 'Người đại diện doanh nghiệp có thẩm quyền mua sắm',
    preConditions: 'Người dùng nhấn nút "Yêu cầu báo giá" tại Header, Hero section hoặc Bảng giá.',
    mainFlow: '1. Hệ thống hiển thị Cửa sổ Modal Hoàng gia Vàng Đồng sang trọng, chặn thao tác nền.\n2. Người dùng nhập đầy đủ thông tin: Họ và tên, Số điện thoại liên hệ, Email doanh nghiệp, Tên công ty, Quy mô nhân sự và Nhu cầu chuyển đổi số cụ thể.\n3. Nhấn nút "Gửi Yêu Cầu Báo Giá & Nhận Tư Vấn 1-1".\n4. Hệ thống kiểm tra hợp lệ dữ liệu (Validate client-side).\n5. Dữ liệu lead được gửi qua API lưu vào cơ sở dữ liệu `vione_quote_leads`.\n6. Hệ thống hiển thị thông báo cảm ơn và cam kết chuyên viên liên hệ trong 15 phút.',
    alternativeFlow: 'Nếu người dùng để trống số điện thoại hoặc nhập sai định dạng email, hệ thống hiển thị viền đỏ cảnh báo và yêu cầu chỉnh sửa trước khi gửi.',
    postConditions: 'Thông tin lead được lưu trữ thành công, đồng thời bắn thông báo tức thì vào kênh tiếp nhận của ban kinh doanh ViOne.',
    imageFile: 'live_02_member_registration_form_filled.png',
    imageCaption: 'Cửa Sổ Modal Tiếp Nhận Yêu Cầu Báo Giá May Đo & Hồ Sơ Tư Vấn 1-1'
  },
  {
    id: 'UC-VN-PUB-11',
    category: 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
    name: 'Tra Cứu & Tìm Kiếm Câu Hỏi Thường Gặp (Interactive FAQ Accordion)',
    actor: 'Khách vãng lai muốn tìm hiểu sâu về kỹ thuật và pháp lý',
    preConditions: 'Người dùng cuộn đến phần "Hỏi Đáp Thường Gặp (FAQ)".',
    mainFlow: '1. Xem danh sách các thắc mắc phổ biến: Thời gian triển khai, Khả năng tích hợp phần mềm kế toán cũ, Chính sách bảo mật dữ liệu.\n2. Nhấp vào tiêu đề câu hỏi: Khối nội dung giải thích trượt mở êm ái kèm hiệu ứng mũi tên xoay chuyển.\n3. Đọc hướng dẫn chi tiết về cơ chế bàn giao mã nguồn hoặc xuất dữ liệu dự phòng.',
    alternativeFlow: 'Người dùng có thể nhập từ khóa vào ô tìm kiếm nhanh câu hỏi để lọc câu trả lời phù hợp.',
    postConditions: 'Giải tỏa mọi băn khoăn của khách hàng trước khi ra quyết định liên hệ.',
    imageFile: 'live_07_crm_member_detail_drawer.png',
    imageCaption: 'Khu Vực Hỏi Đáp Thường Gặp FAQ Với Hiệu Ứng Accordion Mở Rộng Linh Hoạt'
  },
  {
    id: 'UC-VN-PUB-12',
    category: 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
    name: 'Tải Xuống Hồ Sơ Năng Lực Doanh Nghiệp (Company Profile PDF)',
    actor: 'Đại diện phòng mua hàng, Thư ký ban giám đốc',
    preConditions: 'Người dùng nhấn nút "Tải Hồ Sơ Năng Lực" trên thanh điều hướng hoặc chân trang.',
    mainFlow: '1. Người dùng bấm liên kết tải tài liệu Company Profile.\n2. Hệ thống mở cửa sổ yêu cầu nhập nhanh Email nhận tài liệu.\n3. Người dùng nhập email và bấm xác nhận.\n4. Trình duyệt tự động tải xuống tệp tin `ViOne_Platform_Company_Profile_2026.pdf` chất lượng cao.',
    alternativeFlow: 'Nếu tải trực tiếp gặp lỗi mạng, hệ thống tự động gửi kèm đường link tải dự phòng vào hòm thư điện tử của người dùng.',
    postConditions: 'Khách hàng sở hữu tài liệu bản cứng PDF chuyên nghiệp để trình báo cáo lên Ban Tổng Giám Đốc.',
    imageFile: '10_app_user_guide_pdf_viewer.png',
    imageCaption: 'Giao Diện Trình Đọc & Tải Xuống Hồ Sơ Năng Lực PDF Chuẩn Doanh Nghiệp'
  },
  {
    id: 'UC-VN-PUB-13',
    category: 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
    name: 'Chuyển Đổi Giao Diện Đa Ngôn Ngữ (Tiếng Việt / English)',
    actor: 'Đối tác quốc tế, Nhà đầu tư nước ngoài, Doanh nhân song ngữ',
    preConditions: 'Người dùng nhấn biểu tượng ngôn ngữ tại góc phải thanh Header.',
    mainFlow: '1. Người dùng chọn chuyển đổi ngôn ngữ từ "VI" sang "EN".\n2. Toàn bộ tiêu đề, mô tả tính năng, nút bấm CTA và form báo giá tự động chuyển sang tiếng Anh chuẩn văn phong thương mại.\n3. Cấu hình ngôn ngữ được lưu vào LocalStorage của trình duyệt để duy trì cho các lần truy cập sau.',
    alternativeFlow: 'Hệ thống tự động phát hiện ngôn ngữ ưu tiên của trình duyệt máy trạm để khởi tạo hiển thị tương ứng.',
    postConditions: 'Hệ thống phục vụ hoàn hảo cả đối tượng doanh nghiệp nội địa và doanh nghiệp có vốn đầu tư FDI.',
    imageFile: '01_landing_hero.png',
    imageCaption: 'Bộ Chuyển Đổi Ngôn Ngữ Song Ngữ Anh - Việt Trên Thanh Điều Hướng Header'
  },
  {
    id: 'UC-VN-PUB-14',
    category: 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
    name: 'Đăng Ký Nhận Bản Tin Xu Hướng Quản Trị & Chuyển Đổi Số',
    actor: 'Người làm công tác quản lý, sinh viên khởi nghiệp, doanh nhân',
    preConditions: 'Người dùng xem khu vực Chân trang (Footer) của Landing page.',
    mainFlow: '1. Người dùng nhập địa chỉ hòm thư điện tử vào ô "Nhận bản tin quản trị hàng tuần".\n2. Nhấn nút "Đăng Ký".\n3. Hệ thống kiểm tra tính hợp lệ và ghi nhận email vào danh sách gửi bản tin tự động.\n4. Hiển thị thông báo "Đăng ký thành công! Hãy kiểm tra hòm thư để nhận quà tặng Ebook Quản trị 5.0".',
    alternativeFlow: 'Nếu email đã từng đăng ký trước đó, hệ thống nhắc nhở nhẹ nhàng "Email này đã nằm trong danh sách nhận tin".',
    postConditions: 'Dữ liệu được lưu trữ an toàn, phục vụ chiến dịch nuôi dưỡng khách hàng tiềm năng bằng Inbound Marketing.',
    imageFile: '05_email_credentials_sent.png',
    imageCaption: 'Xác Nhận Đăng Ký Bản Tin Số Hóa Doanh Nghiệp & Tự Động Gửi Email Chào Mừng'
  },
  {
    id: 'UC-VN-PUB-15',
    category: 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
    name: 'Tra Cứu Thông Tin Pháp Lý, Điều Khoản Dịch Vụ & Chính Sách Bảo Mật',
    actor: 'Bộ phận Pháp chế, Chuyên viên tuân thủ doanh nghiệp',
    preConditions: 'Người dùng nhấn vào các liên kết "Điều khoản dịch vụ" hoặc "Chính sách bảo mật" tại chân trang.',
    mainFlow: '1. Hệ thống điều hướng đến trang điều khoản pháp lý chính thức.\n2. Người dùng xem chi tiết các quy định về quyền sở hữu dữ liệu (Khách hàng sở hữu 100% dữ liệu của mình).\n3. Xem cam kết về việc không chia sẻ dữ liệu cho bên thứ ba, quy trình sao lưu và tiêu hủy dữ liệu khi chấm dứt hợp đồng.',
    alternativeFlow: 'Người dùng có thể in trực tiếp trang điều khoản bằng lệnh Print của trình duyệt với định dạng in sạch đẹp.',
    postConditions: 'Doanh nghiệp an tâm tuyệt đối về tính hợp pháp và quyền lợi pháp lý khi hợp tác cùng ViOne.',
    imageFile: '02_crm_members_roles_permission.png',
    imageCaption: 'Trang Điều Khoản Dịch Vụ & Chính Sách Bảo Mật Dữ Liệu Doanh Nghiệp Chuẩn Mực'
  }
];

ucList.push(...pubUCs);

// Export builder to generate remainder
module.exports = { ucList };
