// scripts/generate_all_ucs_dataset.js
const fs = require('fs');
const path = require('path');

const ucs = [];

function add(id, category, name, actor, preConditions, mainFlow, alternativeFlow, postConditions, imageFile, imageCaption) {
  ucs.push({
    id,
    category,
    name,
    actor,
    preConditions,
    mainFlow,
    alternativeFlow,
    postConditions,
    imageFile,
    imageCaption
  });
}

// =========================================================================
// PHÂN HỆ 1: CỔNG THÔNG TIN CÔNG KHAI & TIẾP NHẬN BÁO GIÁ (15 UCs)
// =========================================================================
add(
  'UC-VN-PUB-01', 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
  'Xem Hero Section & Trải Nghiệm Hoạt Ảnh 4.8s Pop-up Keyframe',
  'Khách vãng lai, Doanh nhân, Khách hàng B2B tiềm năng',
  'Người dùng truy cập trang chủ ViOne Platform qua trình duyệt web tại https://vione.ai.',
  '1. Hệ thống tải trang chủ với giao diện phong cách Hoàng gia Doanh nhân (Royal Dark Slate & Luxury Gold).\n2. Kích hoạt hoạt ảnh chu kỳ 4.8 giây: Hình ảnh doanh nhân nổi bật phóng to 1.05 lần, đẩy lớp z-index 30 về phía trước khung smartphone VIONE MOBILE.\n3. Khối chỉ số đo lường hiệu suất hiển thị số liệu động: 98.4% độ tin cậy, tăng tốc vận hành 10x, tiến trình AI Bot tự động.\n4. Người dùng quan sát thông điệp định vị "Hệ sinh thái số hóa & CRM quản trị doanh nghiệp toàn diện 5.0".',
  'Nếu thiết bị người dùng là thiết bị cấu hình yếu hoặc tắt hoạt ảnh trình duyệt, hệ thống tự động fallback về hiển thị đồ họa tĩnh tối ưu, đảm bảo tốc độ tải trang dưới 1.2 giây.',
  'Hệ thống ghi nhận 01 lượt xem trang (Pageview) vào hệ thống phân tích nhật ký ẩn danh.',
  '01_landing_hero.png', 'Giao diện Hero Section Landing Web với Hoạt ảnh Pop-up 4.8s Doanh nhân & Smartphone 3D'
);

add(
  'UC-VN-PUB-02', 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
  'Khám Phá Mô Đun Liên Kết & Kiến Trúc Hợp Nhất 4 Trụ Cột',
  'Khách vãng lai, Giám đốc điều hành, Trưởng phòng Chuyển đổi số',
  'Người dùng cuộn trang xuống phần Mô Đun Liên Kết hoặc nhấn liên kết "Giải Pháp" trên thanh điều hướng.',
  '1. Màn hình hiển thị 4 khối phân hệ cốt lõi: CRM & Phễu Lead 360°, Vione Work Quản lý công việc, Vione Finance Quản trị dòng tiền, Vione HRM Quản lý nhân sự.\n2. Người dùng di chuột qua từng thẻ phân hệ: Hiệu ứng viền phát sáng Gradient vàng ánh kim và hiển thị tóm tắt tính năng mở rộng.\n3. Người dùng nhấn nút "Xem cấu trúc liên thông" để xem sơ đồ dòng chảy dữ liệu đồng nhất giữa 4 phân hệ.',
  'Người dùng có thể chuyển đổi nhanh giữa các tab tính năng bằng phím mũi tên trái/phải trên bàn phím.',
  'Khách hàng nắm rõ mô hình dữ liệu tập trung, xóa bỏ tình trạng phân mảnh thông tin giữa các phòng ban.',
  '02_landing_cinematic.png', 'Sơ đồ Kiến trúc Hợp nhất 4 Phân hệ Cốt lõi: CRM, Work, Finance và HRM'
);

add(
  'UC-VN-PUB-03', 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
  'Trải Nghiệm Bộ Máy Tự Động Hóa Quy Trình AI Workflow Copilot',
  'Chuyên viên Vận hành, Trưởng bộ phận IT, Giám đốc Vận hành (COO)',
  'Người dùng cuộn tới phần "Tự Động Hóa Quy Trình Với AI Workflow".',
  '1. Hệ thống hiển thị mô hình trực quan quy trình tự động hóa: Điểm kích hoạt (Trigger) -> Phân tích dữ liệu bằng AI -> Thực thi hành động đa kênh (Action).\n2. Người dùng nhấp vào kịch bản mẫu "Tiếp nhận Lead -> Thẩm định tiềm năng -> Gửi báo giá tự động trong 60 giây".\n3. Quan sát mô phỏng luồng tin nhắn và thông báo được kích hoạt đồng thời đến CRM và ứng dụng di động.',
  'Người dùng nhấp vào nút "Thử nghiệm kịch bản khác" để xem kịch bản "Duyệt chi tài chính tự động" hoặc "Cảnh báo quá hạn hợp đồng".',
  'Khách hàng hình dung được năng lực cắt giảm 40% chi phí vận hành hành chính nhờ tự động hóa.',
  'workflow-automation.png', 'Mô hình Trực quan Hóa Bộ Máy Tự Động Hóa Quy Trình Đa Kênh AI Workflow Copilot'
);

add(
  'UC-VN-PUB-04', 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
  'Xem Trung Tâm Giám Sát Vận Hành & Đo Lường SLA Thời Gian Thực',
  'Ban Giám Đốc, Trưởng ban Kiểm soát, Giám đốc Tài chính (CFO)',
  'Người dùng quan sát khu vực "Kiểm Soát Vận Hành Toàn Diện".',
  '1. Khung hiển thị mô phỏng màn hình máy tính làm việc chuẩn doanh nghiệp.\n2. Quan sát biểu đồ đo lường tốc độ phản hồi hệ thống (SLA < 150ms), tỷ lệ uptime máy chủ đạt 99.98%.\n3. Xem bảng điều khiển tóm tắt: Doanh thu thực thu, Công nợ cần đòi, Tiến độ dự án trọng điểm và Tỷ lệ hoàn thành KPI.',
  'Người dùng có thể bấm vào nút "Xem chi tiết đồ thị" để phóng to giao diện mô phỏng giám sát.',
  'Khách hàng yên tâm về năng lực kiểm soát dữ liệu và tính minh bạch 24/7 của nền tảng.',
  'operational-dashboard.png', 'Trung Tâm Giám Sát Vận Hành Tổng Thể & Đo Lường Chỉ Số KPI Doanh Nghiệp Thời Gian Thực'
);

add(
  'UC-VN-PUB-05', 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
  'Khám Phá Quy Trình 3 Bước Thiết Lập Tự Động Siêu Tốc Trong 5 Phút',
  'Chủ Doanh Nghiệp, Quản trị viên hệ thống tương lai',
  'Người dùng xem mục "3 Bước Thiết Lập Tự Động".',
  '1. Xem Bước 01 (Trigger): Tích hợp nguồn dữ liệu đầu vào (Biểu mẫu web, Fanpage, Hotline, Zalo OA).\n2. Xem Bước 02 (Actions): Cấu hình các điều kiện phân loại và gán việc tự động bằng giao diện kéo thả không cần code.\n3. Xem Bước 03 (Monitor): Bật chế độ giám sát tự động và nhận báo cáo định kỳ qua di động.',
  'Người dùng có thể nhấn liên kết "Xem hướng dẫn triển khai nhanh" để đọc quy trình chi tiết.',
  'Khách hàng xóa bỏ định kiến rằng triển khai phần mềm quản trị doanh nghiệp phải mất nhiều tháng.',
  'business-laptop.png', 'Quy Trình 3 Bước Thiết Lập Vận Hành Siêu Tốc Trong 5 Phút'
);

add(
  'UC-VN-PUB-06', 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
  'Đánh Giá 4 Trụ Cột Giá Trị Cốt Lõi & Tiêu Chuẩn Bảo Mật AES-256',
  'Giám đốc An ninh Thông tin (CISO), Chuyên gia Pháp chế, Doanh nhân',
  'Người dùng xem mục "Giá Trị Doanh Nghiệp 360°".',
  '1. Đọc nội dung 4 trụ cột: Tiết kiệm 40% chi phí, Ra quyết định dựa trên dữ liệu (Data-driven), Nâng tầm trải nghiệm đối tác và Bảo mật tiêu chuẩn ngân hàng.\n2. Kiểm tra các huy hiệu bảo mật: Mã hóa cơ sở dữ liệu AES-256, truyền tải TLS 1.3, Chứng nhận trung tâm dữ liệu Tier III.\n3. Xem cam kết thỏa thuận mức dịch vụ (SLA) bồi hoàn nếu gián đoạn dịch vụ.',
  'Người dùng có thể yêu cầu gửi "Bản cáo bạch Tiêu chuẩn An toàn Thông tin" qua email.',
  'Xác thực sự uy tín và tính pháp lý vững vàng của hệ thống ViOne.',
  '01_crm_login_blue_white.png', 'Trụ Cột Giá Trị Cốt Lõi & Tiêu Chuẩn An Toàn Bảo Mật Đa Tầng Cấp Doanh Nghiệp'
);

add(
  'UC-VN-PUB-07', 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
  'Khám Phá Mô Hình Giải Pháp Phù Hợp Đa Dạng Mô Hình Ngành Nghề',
  'Chủ doanh nghiệp sản xuất, dịch vụ, bán lẻ, công nghệ',
  'Người dùng xem khu vực "Giải Pháp Theo Mô Hình Doanh Nghiệp".',
  '1. Xem giải pháp dành cho Doanh nghiệp Thương mại & Dịch vụ: Quản lý hợp đồng, phễu lead, giao việc Kanban.\n2. Xem giải pháp dành cho Doanh nghiệp Chuỗi & Bán lẻ: Đối soát doanh thu chi nhánh, tích hợp cổng thanh toán VietQR.\n3. Xem giải pháp dành cho Doanh nghiệp Sản xuất & Phân phối: Quản lý đại lý B2B, catalog sản phẩm, theo dõi đơn vị giao vận.',
  'Người dùng nhấp vào từng ngành nghề để xem các tính năng được khuyến nghị tương ứng.',
  'Khách hàng nhận diện chính xác bài toán đặc thù của doanh nghiệp mình được giải quyết trọn vẹn.',
  'business-laptop.png', 'Giải Pháp Số Hóa Vận Hành May Đo Theo Đa Dạng Nhóm Ngành Nghề'
);

add(
  'UC-VN-PUB-08', 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
  'Tra Cứu Đánh Giá Của Khách Hàng Lãnh Đạo Tiêu Biểu (Testimonials)',
  'Khách hàng tiềm năng cần tham chiếu độ tin cậy xã hội (Social Proof)',
  'Người dùng xem phần "Khách Hàng Nói Về Chúng Tôi".',
  '1. Xem ảnh chân dung đại diện sắc nét và trích dẫn chia sẻ của Tổng giám đốc Nguyễn Minh Đăng.\n2. Đọc kết quả thực chứng: "Quản lý 5 chi nhánh trực tiếp trên smartphone, cắt giảm 3 nhân sự nhập liệu thủ công".\n3. Xem logo các tập đoàn, hiệp hội doanh nghiệp lớn đang ứng dụng hệ sinh thái ViOne.',
  'Người dùng có thể vuốt xem qua lại giữa các câu chuyện thành công của các doanh nghiệp khác.',
  'Tăng cường 100% niềm tin thương hiệu và sẵn sàng chuyển đổi sang bước yêu cầu báo giá.',
  'avatar-ceo.png', 'Chia Sẻ Đánh Giá Thực Tế Từ Lãnh Đạo Doanh Nghiệp Đang Vận Hành Hệ Thống ViOne'
);

add(
  'UC-VN-PUB-09', 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
  'Tham Khảo Cấu Trúc Bảng Giá Dịch Vụ Tùy Biến 3 Gói Giải Pháp',
  'Đại diện bộ phận thu mua, Ban Giám Đốc doanh nghiệp',
  'Người dùng xem mục "Bảng Giá Dịch Vụ Tùy Biến".',
  '1. Xem 3 gói giải pháp: Gói Khởi tạo (Starter), Gói Tăng trưởng (Growth) và Gói Doanh nghiệp Lớn (Enterprise).\n2. Đọc chi tiết các danh mục tính năng mở khóa: Số lượng tài khoản người dùng, dung lượng lưu trữ, cấp quyền AI Copilot.\n3. Quan sát thông điệp cam kết: "Không hiển thị giá cứng cố định - Chi phí được may đo chính xác theo quy mô và nhu cầu thực tế".\n4. Mỗi gói có nút CTA kích hoạt "Yêu Cầu Báo Giá May Đo".',
  'Người dùng có thể bật tắt công tắc so sánh tính năng chi tiết giữa các gói dịch vụ.',
  'Khách hàng hiểu rõ gói giải pháp định hướng và bấm nút yêu cầu tư vấn.',
  'crm_dash_view_06.png', 'Cấu Trúc 3 Gói Giải Pháp Số Hóa Doanh Nghiệp & Chính Sách Báo Giá May Đo'
);

add(
  'UC-VN-PUB-10', 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
  'Mở & Điền Form Yêu Cầu Báo Giá & Tư Vấn 1-1 Chuyên Sâu',
  'Người đại diện doanh nghiệp có thẩm quyền mua sắm',
  'Người dùng nhấn nút "Yêu cầu báo giá" tại Header, Hero section hoặc Bảng giá.',
  '1. Hệ thống hiển thị Cửa sổ Modal Hoàng gia Vàng Đồng sang trọng, chặn thao tác nền.\n2. Người dùng nhập đầy đủ thông tin: Họ và tên, Số điện thoại liên hệ, Email doanh nghiệp, Tên công ty, Quy mô nhân sự và Nhu cầu chuyển đổi số cụ thể.\n3. Nhấn nút "Gửi Yêu Cầu Báo Giá & Nhận Tư Vấn 1-1".\n4. Hệ thống kiểm tra hợp lệ dữ liệu (Validate client-side).\n5. Dữ liệu lead được gửi qua API lưu vào cơ sở dữ liệu `vione_quote_leads`.\n6. Hệ thống hiển thị thông báo cảm ơn và cam kết chuyên viên liên hệ trong 15 phút.',
  'Nếu người dùng để trống số điện thoại hoặc nhập sai định dạng email, hệ thống hiển thị viền đỏ cảnh báo và yêu cầu chỉnh sửa trước khi gửi.',
  'Thông tin lead được lưu trữ thành công, đồng thời bắn thông báo tức thì vào kênh tiếp nhận của ban kinh doanh ViOne.',
  'live_02_member_registration_form_filled.png', 'Cửa Sổ Modal Tiếp Nhận Yêu Cầu Báo Giá May Đo & Hồ Sơ Tư Vấn 1-1'
);

add(
  'UC-VN-PUB-11', 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
  'Tra Cứu & Tìm Kiếm Câu Hỏi Thường Gặp (Interactive FAQ Accordion)',
  'Khách vãng lai muốn tìm hiểu sâu về kỹ thuật và pháp lý',
  'Người dùng cuộn đến phần "Hỏi Đáp Thường Gặp (FAQ)".',
  '1. Xem danh sách các thắc mắc phổ biến: Thời gian triển khai, Khả năng tích hợp phần mềm kế toán cũ, Chính sách bảo mật dữ liệu.\n2. Nhấp vào tiêu đề câu hỏi: Khối nội dung giải thích trượt mở êm ái kèm hiệu ứng mũi tên xoay chuyển.\n3. Đọc hướng dẫn chi tiết về cơ chế bàn giao mã nguồn hoặc xuất dữ liệu dự phòng.',
  'Người dùng có thể nhập từ khóa vào ô tìm kiếm nhanh câu hỏi để lọc câu trả lời phù hợp.',
  'Giải tỏa mọi băn khoăn của khách hàng trước khi ra quyết định liên hệ.',
  'live_07_crm_member_detail_drawer.png', 'Khu Vực Hỏi Đáp Thường Gặp FAQ Với Hiệu Ứng Accordion Mở Rộng Linh Hoạt'
);

add(
  'UC-VN-PUB-12', 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
  'Tải Xuống Hồ Sơ Năng Lực Doanh Nghiệp (Company Profile PDF)',
  'Đại diện phòng mua hàng, Thư ký ban giám đốc',
  'Người dùng nhấn nút "Tải Hồ Sơ Năng Lực" trên thanh điều hướng hoặc chân trang.',
  '1. Người dùng bấm liên kết tải tài liệu Company Profile.\n2. Hệ thống mở cửa sổ yêu cầu nhập nhanh Email nhận tài liệu.\n3. Người dùng nhập email và bấm xác nhận.\n4. Trình duyệt tự động tải xuống tệp tin `ViOne_Platform_Company_Profile_2026.pdf` chất lượng cao.',
  'Nếu tải trực tiếp gặp lỗi mạng, hệ thống tự động gửi kèm đường link tải dự phòng vào hòm thư điện tử của người dùng.',
  'Khách hàng sở hữu tài liệu bản cứng PDF chuyên nghiệp để trình báo cáo lên Ban Tổng Giám Đốc.',
  '10_app_user_guide_pdf_viewer.png', 'Giao Diện Trình Đọc & Tải Xuống Hồ Sơ Năng Lực PDF Chuẩn Doanh Nghiệp'
);

add(
  'UC-VN-PUB-13', 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
  'Chuyển Đổi Giao Diện Đa Ngôn Ngữ (Tiếng Việt / English)',
  'Đối tác quốc tế, Nhà đầu tư nước ngoài, Doanh nhân song ngữ',
  'Người dùng nhấn biểu tượng ngôn ngữ tại góc phải thanh Header.',
  '1. Người dùng chọn chuyển đổi ngôn ngữ từ "VI" sang "EN".\n2. Toàn bộ tiêu đề, mô tả tính năng, nút bấm CTA và form báo giá tự động chuyển sang tiếng Anh chuẩn văn phong thương mại.\n3. Cấu hình ngôn ngữ được lưu vào LocalStorage của trình duyệt để duy trì cho các lần truy cập sau.',
  'Hệ thống tự động phát hiện ngôn ngữ ưu tiên của trình duyệt máy trạm để khởi tạo hiển thị tương ứng.',
  'Hệ thống phục vụ hoàn hảo cả đối tượng doanh nghiệp nội địa và doanh nghiệp có vốn đầu tư FDI.',
  '01_landing_hero.png', 'Bộ Chuyển Đổi Ngôn Ngữ Song Ngữ Anh - Việt Trên Thanh Điều Hướng Header'
);

add(
  'UC-VN-PUB-14', 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
  'Đăng Ký Nhận Bản Tin Xu Hướng Quản Trị & Chuyển Đổi Số',
  'Người làm công tác quản lý, sinh viên khởi nghiệp, doanh nhân',
  'Người dùng xem khu vực Chân trang (Footer) của Landing page.',
  '1. Người dùng nhập địa chỉ hòm thư điện tử vào ô "Nhận bản tin quản trị hàng tuần".\n2. Nhấn nút "Đăng Ký".\n3. Hệ thống kiểm tra tính hợp lệ và ghi nhận email vào danh sách gửi bản tin tự động.\n4. Hiển thị thông báo "Đăng ký thành công! Hãy kiểm tra hòm thư để nhận quà tặng Ebook Quản trị 5.0".',
  'Nếu email đã từng đăng ký trước đó, hệ thống nhắc nhở nhẹ nhàng "Email này đã nằm trong danh sách nhận tin".',
  'Dữ liệu được lưu trữ an toàn, phục vụ chiến dịch nuôi dưỡng khách hàng tiềm năng bằng Inbound Marketing.',
  '05_email_credentials_sent.png', 'Xác Nhận Đăng Ký Bản Tin Số Hóa Doanh Nghiệp & Tự Động Gửi Email Chào Mừng'
);

add(
  'UC-VN-PUB-15', 'Cổng Thông Tin Công Khai & Tiếp Nhận Báo Giá',
  'Tra Cứu Thông Tin Pháp Lý, Điều Khoản Dịch Vụ & Chính Sách Bảo Mật',
  'Bộ phận Pháp chế, Chuyên viên tuân thủ doanh nghiệp',
  'Người dùng nhấn vào các liên kết "Điều khoản dịch vụ" hoặc "Chính sách bảo mật" tại chân trang.',
  '1. Hệ thống điều hướng đến trang điều khoản pháp lý chính thức.\n2. Người dùng xem chi tiết các quy định về quyền sở hữu dữ liệu (Khách hàng sở hữu 100% dữ liệu của mình).\n3. Xem cam kết về việc không chia sẻ dữ liệu cho bên thứ ba, quy trình sao lưu và tiêu hủy dữ liệu khi chấm dứt hợp đồng.',
  'Người dùng có thể in trực tiếp trang điều khoản bằng lệnh Print của trình duyệt với định dạng in sạch đẹp.',
  'Doanh nghiệp an tâm tuyệt đối về tính hợp pháp và quyền lợi pháp lý khi hợp tác cùng ViOne.',
  '02_crm_members_roles_permission.png', 'Trang Điều Khoản Dịch Vụ & Chính Sách Bảo Mật Dữ Liệu Doanh Nghiệp Chuẩn Mực'
);

// Lưu file JSON
const outPath = path.join(__dirname, 'vione_use_cases_data.json');
fs.writeFileSync(outPath, JSON.stringify(ucs, null, 2));
console.log('Saved partial UCs:', ucs.length);
