const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function buildEvaluationExcel() {
  console.log('=== BẮT ĐẦU TẠO FILE EXCEL ĐÁNH GIÁ CHIA RÕ APP VÀ CRM, ĐỂ TRỐNG CỘT ĐÁNH GIÁ ===');

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CLB Doanh Nhân CEO 1983 (HanoiBA)';
  workbook.lastModifiedBy = 'Hệ Thống Quản Trị VICONNECT';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Danh sách tính năng APP MOBILE
  const appFeatures = [
    {
      parent: 'Đăng Nhập & Bảo Mật',
      child: 'Đăng nhập Hội viên',
      desc: 'Đăng nhập vào app bằng Email và Mật khẩu được cấp, tự động ghi nhớ tài khoản.'
    },
    {
      parent: 'Đăng Nhập & Bảo Mật',
      child: 'Quên mật khẩu',
      desc: 'Bấm Quên mật khẩu, nhập email để hệ thống gửi yêu cầu về CRM và gửi mail cấp lại.'
    },
    {
      parent: 'Đăng Nhập & Bảo Mật',
      child: 'Đổi mật khẩu bảo mật',
      desc: 'Bắt buộc đổi mật khẩu mới đối với tài khoản đăng nhập lần đầu tiên.'
    },
    {
      parent: 'NODE-APP-001: Trang Chủ',
      child: 'Biểu đồ nến Ticker giao thương',
      desc: 'Hiển thị biến động giá trị cơ hội giao thương B2B realtime, nút chuyển 1N, 1T, 1Th.'
    },
    {
      parent: 'NODE-APP-001: Trang Chủ',
      child: 'Phím tắt chức năng nhanh',
      desc: 'Khối nút truy cập nhanh 1 chạm: Thẻ VIP, Sàn B2B, Danh bạ, Sự kiện.'
    },
    {
      parent: 'NODE-APP-001: Trang Chủ',
      child: 'Banner hoạt động & sự kiện sắp tới',
      desc: 'Hiển thị slide poster các chương trình lớn của hiệp hội sắp diễn ra.'
    },
    {
      parent: 'NODE-APP-001: Thông Báo & Giao Diện',
      child: 'Trung tâm thông báo đẩy',
      desc: 'Danh sách thông báo sự kiện, tin nhắn, nhắc niên liễm, chạm mở chi tiết, nút Đã đọc tất cả.'
    },
    {
      parent: 'NODE-APP-001: Thông Báo & Giao Diện',
      child: 'Bộ chọn 4 màu nhận diện Brandbook',
      desc: 'Chuyển đổi 4 màu chủ đề CLB: Đỏ Ruby, Vàng Hoàng Gia, Xanh Doanh Nhân, Cam Tiên Phong.'
    },
    {
      parent: 'NODE-APP-002: Thẻ Hội Viên VIP Số',
      child: 'Thẻ danh thiếp VIP xoay 2 mặt',
      desc: 'Hiển thị thẻ điện tử: Họ tên, Chức vụ, Công ty, Logo, chạm lật mặt sau.'
    },
    {
      parent: 'NODE-APP-002: Thẻ Hội Viên VIP Số',
      child: 'Mã QR cá nhân & Phóng to',
      desc: 'Mã QR định danh cá nhân, chạm vào để phóng to toàn màn hình đi dự sự kiện.'
    },
    {
      parent: 'NODE-APP-002: Thẻ Hội Viên VIP Số',
      child: 'Cài đặt quyền riêng tư thẻ',
      desc: 'Công tắc gạt Ẩn/Hiện Số điện thoại và Ẩn/Hiện Email khi người khác quét thẻ.'
    },
    {
      parent: 'NODE-APP-002: Thẻ Hội Viên VIP Số',
      child: 'Quét mã QR đối tác',
      desc: 'Nút mở camera quét trực tiếp mã QR trên thẻ VIP của hội viên khác để kết nối.'
    },
    {
      parent: 'NODE-APP-003: Quét Thẻ Công Khai',
      child: 'Trang danh thiếp công khai bảo mật',
      desc: 'Hiển thị thông tin doanh nhân khi người ngoài quét mã QR (chưa cài app).'
    },
    {
      parent: 'NODE-APP-003: Quét Thẻ Công Khai',
      child: 'Lưu vào danh bạ điện thoại (.vcf)',
      desc: 'Nút tải file vCard tự động lưu tên, số điện thoại, công ty vào danh bạ iPhone/Android.'
    },
    {
      parent: 'NODE-APP-004: Danh Bạ Hội Viên',
      child: 'Tìm kiếm & Bộ lọc 6 Ban',
      desc: 'Tìm kiếm nhanh theo Tên, Doanh nghiệp, Ngành nghề; lọc theo 6 Ban chuyên môn.'
    },
    {
      parent: 'NODE-APP-004: Danh Bạ Hội Viên',
      child: 'Xem hồ sơ & Liên hệ nhanh',
      desc: 'Xem chi tiết thông tin hội viên; nút Gọi điện, Gửi email, Nhắn tin trực tiếp.'
    },
    {
      parent: 'NODE-APP-005: Cơ Hội Giao Thương B2B',
      child: 'Đăng tin cơ hội kinh doanh mới',
      desc: 'Nhập tiêu đề, giá trị dự kiến (VNĐ), ngành nghề và mô tả chi tiết nhu cầu hợp tác.'
    },
    {
      parent: 'NODE-APP-005: Cơ Hội Giao Thương B2B',
      child: 'Nhận kết nối cơ hội kinh doanh',
      desc: 'Xem danh sách cơ hội giao thương; bấm Nhận kết nối để mở chat trực tiếp với người đăng.'
    },
    {
      parent: 'NODE-APP-006: Thống Kê Hoạt Động',
      child: 'Granular Tabs Ngày / Tuần / Tháng / Quý / Năm',
      desc: 'Biểu đồ nến & cột phân tích giao thương, chọn lát cắt con chi tiết từ CSDL thật.'
    },
    {
      parent: 'NODE-APP-006: Thống Kê Hoạt Động',
      child: 'Phóng to / Thu nhỏ Zoom In / Out & Vuốt ngang',
      desc: 'Thanh công cụ Zoom In/Out từ 1x đến 3x; vuốt ngang cảm ứng xem các ngày bị ẩn.'
    },
    {
      parent: 'NODE-APP-006: Thống Kê Hoạt Động',
      child: 'Bục vinh danh Top 3 kết nối',
      desc: 'Hiển thị bục Top 1 (Vàng), Top 2 (Bạc), Top 3 (Đồng) theo giá trị giao dịch thành công.'
    },
    {
      parent: 'NODE-APP-007: Sàn B2B Marketplace',
      child: 'Trưng bày sản phẩm dịch vụ hội viên',
      desc: 'Hiển thị sản phẩm tiêu biểu của các doanh nghiệp thành viên (giới hạn 5 sản phẩm/DN).'
    },
    {
      parent: 'NODE-APP-007: Sàn B2B Marketplace',
      child: 'Đăng bán sản phẩm mới',
      desc: 'Nhập tên sản phẩm, giá bán, % ưu đãi dành riêng cho hội viên CEO 1983, tải ảnh.'
    },
    {
      parent: 'NODE-APP-007: Sàn B2B Marketplace',
      child: 'Gửi yêu cầu báo giá B2B',
      desc: 'Gửi yêu cầu báo giá hoặc liên hệ nhanh người bán từ trang chi tiết sản phẩm.'
    },
    {
      parent: 'NODE-APP-008: Sự Kiện & Cuộc Họp',
      child: 'Danh sách sự kiện & Đăng ký tham gia',
      desc: 'Xem lịch sự kiện Gala, Họp ban, Cafe kết nối; bấm Đăng ký tham gia.'
    },
    {
      parent: 'NODE-APP-008: Sự Kiện & Cuộc Họp',
      child: 'Vé điện tử & Mã QR Check-in',
      desc: 'Xem vé mời điện tử gồm Họ tên, Số ghế và mã QR điểm danh check-in tại cửa.'
    },
    {
      parent: 'NODE-APP-009: Biểu Quyết Trực Tuyến',
      child: 'Bỏ phiếu nghị quyết đại hội',
      desc: 'Xem câu hỏi biểu quyết; chọn Đồng ý / Không đồng ý / Ý kiến khác; gửi phiếu trực tuyến.'
    },
    {
      parent: 'NODE-APP-009: Biểu Quyết Trực Tuyến',
      child: 'Tỷ lệ biểu quyết thời gian thực',
      desc: 'Xem tỷ lệ % các phương án biểu quyết cập nhật trực tiếp theo thời gian thực.'
    },
    {
      parent: 'NODE-APP-010: Bảng Tin & Mạng Lưới',
      child: 'Đăng bài chia sẻ khoảnh khắc',
      desc: 'Đăng bài viết kèm hình ảnh hoạt động giao lưu doanh nghiệp lên bảng tin CLB.'
    },
    {
      parent: 'NODE-APP-010: Bảng Tin & Mạng Lưới',
      child: 'Nhắn tin trao đổi 1-on-1',
      desc: 'Chat trực tiếp giữa 2 doanh nhân; menu Chỉnh sửa, Thu hồi, Xóa tin nhắn.'
    },
    {
      parent: 'NODE-APP-010: Bảng Tin & Mạng Lưới',
      child: 'Menu tin nhắn tránh che header',
      desc: 'Popup menu tự nhận diện vị trí và mở chúc xuống khi gần đỉnh màn hình, không đè header.'
    },
    {
      parent: 'NODE-APP-011: Hồ Sơ Cá Nhân',
      child: 'Cập nhật thông tin cá nhân & Ảnh đại diện',
      desc: 'Chỉnh sửa Họ tên, Số điện thoại, Chức vụ, tải lên ảnh chân dung mới.'
    },
    {
      parent: 'NODE-APP-011: Hồ Sơ Cá Nhân',
      child: 'Thông tin công ty & Tình trạng hội phí',
      desc: 'Cập nhật tên công ty, logo; theo dõi nhãn Đã đóng phí hoặc Đến hạn đóng niên liễm.'
    },
    {
      parent: 'NODE-APP-012: Cài Đặt Hệ Thống',
      child: 'Đổi mật khẩu định kỳ',
      desc: 'Nhập mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu để cập nhật.'
    },
    {
      parent: 'NODE-APP-012: Cài Đặt Hệ Thống',
      child: 'Đăng xuất tài khoản an toàn',
      desc: 'Nút Đăng xuất ở cuối trang cài đặt để thoát tài khoản trên thiết bị.'
    },
    {
      parent: 'NODE-APP-013: Ưu Đãi Hội Viên',
      child: 'Chính sách ưu đãi đặc quyền',
      desc: 'Danh mục voucher, chiết khấu ưu đãi chéo giữa các doanh nghiệp thành viên.'
    },
    {
      parent: 'NODE-APP-014: Cài Đặt PWA',
      child: 'Thêm vào Màn hình chính iPhone (Safari)',
      desc: 'Thao tác Chia sẻ -> Thêm vào MH chính để sử dụng như ứng dụng cài đặt gốc.'
    },
    {
      parent: 'NODE-APP-014: Cài Đặt PWA',
      child: 'Cài đặt ứng dụng Android (Chrome)',
      desc: 'Bấm menu 3 chấm -> Cài đặt ứng dụng trên điện thoại Android.'
    },
    {
      parent: 'NODE-APP-015: Hẹn Gặp B2B 1-on-1',
      child: 'Đặt lịch hẹn gặp giao thương',
      desc: 'Chọn đối tác, thời gian, địa điểm cafe/văn phòng và gửi lời mời hẹn gặp trực tiếp.'
    },
    {
      parent: 'NODE-APP-016: Đào Tạo & Video Call',
      child: 'Thư viện bài giảng & Phòng họp online',
      desc: 'Xem video khóa học quản trị; tham gia phòng họp trực tuyến qua video.'
    },
    {
      parent: 'NODE-APP-017: Lịch Hoạt Động',
      child: 'Lịch tháng & Đồng bộ Calendar',
      desc: 'Xem lịch sự kiện tháng; chạm từng ngày xem lịch chi tiết; đồng bộ Google/Apple Calendar.'
    }
  ];

  // Danh sách tính năng CỔNG QUẢN TRỊ WEB CRM
  const crmFeatures = [
    {
      parent: 'Đăng Nhập & Phân Quyền',
      child: 'Đăng nhập Cổng Quản Trị CRM',
      desc: 'Đăng nhập tài khoản điều hành (Chủ tịch, Ban Thư Ký, Trưởng Ban, Kế toán, Admin).'
    },
    {
      parent: 'NODE-CRM-001: Tổng Quan & KPI',
      child: '4 Khối chỉ số KPI CLB',
      desc: 'Tổng số Hội viên, Doanh nghiệp thành viên, Tổng quỹ tiền mặt, Tỷ lệ tham dự sự kiện.'
    },
    {
      parent: 'NODE-CRM-001: Tổng Quan & KPI',
      child: 'Lịch công tác & Cảnh báo nhanh',
      desc: 'Lịch tháng hiển thị ngày họp/sự kiện; khối cảnh báo hồ sơ chờ duyệt và nợ phí niên liễm.'
    },
    {
      parent: 'NODE-CRM-002: Thống Kê Real Data',
      child: 'Biểu đồ phân tích Real Data',
      desc: 'Biểu đồ cột & tròn thể hiện giao thương, phân bổ ngành nghề, tỷ lệ check-in từ CSDL thật.'
    },
    {
      parent: 'NODE-CRM-002: Thống Kê Real Data',
      child: 'Granular Tabs Ngày / Tuần / Tháng / Quý / Năm',
      desc: 'Bộ chọn chu kỳ thời gian linh hoạt từ ngày cụ thể đến tổng kết năm.'
    },
    {
      parent: 'NODE-CRM-002: Thống Kê Real Data',
      child: 'Công cụ Zoom In / Out & Recharts Brush',
      desc: 'Phóng to thu nhỏ cột biểu đồ 1x-3x; thanh trượt Brush kéo chọn khoảng ngày đối soát.'
    },
    {
      parent: 'NODE-CRM-003: Danh Bạ Hội Viên 360°',
      child: 'Quản trị hồ sơ hội viên toàn diện',
      desc: 'Danh sách hội viên, tìm kiếm theo tên/SĐT, lọc theo 6 Ban chuyên môn, xuất file Excel.'
    },
    {
      parent: 'NODE-CRM-003: Danh Bạ Hội Viên 360°',
      child: 'Phê duyệt hồ sơ đăng ký mới',
      desc: 'Kiểm tra giấy phép kinh doanh, chức vụ, duyệt cấp mã hội viên (CEO1983-xxxxxx).'
    },
    {
      parent: 'NODE-CRM-004: Doanh Nghiệp Thành Viên',
      child: 'Quản lý pháp nhân doanh nghiệp',
      desc: 'Danh sách công ty thành viên, thêm mới, sửa Mã số thuế, ngành nghề, địa chỉ, logo.'
    },
    {
      parent: 'NODE-CRM-005: Tài Khoản Ban Chuyên Môn',
      child: 'Quản lý tài khoản điều hành CRM',
      desc: 'Thêm tài khoản quản trị mới, phân vào 6 Ban chuyên môn, gán vai trò tương ứng.'
    },
    {
      parent: 'NODE-CRM-005: Tài Khoản Ban Chuyên Môn',
      child: 'Đổi vai trò & Xóa tài khoản',
      desc: 'Chỉnh sửa chức vụ; xóa tài khoản đồng bộ CSDL và cập nhật tức thì trên giao diện.'
    },
    {
      parent: 'NODE-CRM-006: Ma Trận Phân Quyền RBAC',
      child: 'Cấu hình quyền 5 cột Xem/Thêm/Sửa/Xóa/Xuất Excel',
      desc: 'Tích chọn ma trận quyền theo từng vai trò (Chủ tịch, Tổng Thư Ký, Trưởng Ban, Kế Toán).'
    },
    {
      parent: 'NODE-CRM-007: Quản Trị Sự Kiện',
      child: 'Tạo mới sự kiện CLB',
      desc: 'Nhập tên sự kiện, thời gian bắt đầu/kết thúc, địa điểm, số lượng khách, giá vé.'
    },
    {
      parent: 'NODE-CRM-007: Quản Trị Sự Kiện',
      child: 'Thiết lập Sơ đồ chỗ ngồi (Seating Setup)',
      desc: 'Tạo danh sách bàn (Bàn VIP 1, Bàn VIP 2, Bàn Ban Chấp Hành), kéo thả bố trí ghế ngồi khách mời.'
    },
    {
      parent: 'NODE-CRM-007: Quản Trị Sự Kiện',
      child: 'Quản lý danh sách Vé & Điểm danh Check-in QR',
      desc: 'Theo dõi khách đăng ký, tình trạng thanh toán vé; quét QR check-in vào cửa; xuất Excel.'
    },
    {
      parent: 'NODE-CRM-008: Quản Lý Cuộc Họp',
      child: 'Tạo cuộc họp Ban & Đặt phòng họp',
      desc: 'Lên lịch họp Ban Chấp Hành / Giao ban; chọn thành phần tham dự; gửi thông báo lịch họp.'
    },
    {
      parent: 'NODE-CRM-009: Thu Ngân Sách',
      child: 'Ghi nhận phiếu thu tài chính',
      desc: 'Tạo phiếu thu phí niên liễm, vé sự kiện, tài trợ; đính kèm ảnh ủy nhiệm chi chuyển khoản.'
    },
    {
      parent: 'NODE-CRM-009: Thu Ngân Sách',
      child: 'Xuất & Nhập file Excel kế toán',
      desc: 'Tải file mẫu Excel nạp hàng loạt khoản thu; xuất bảng kê thu quỹ toàn bộ ra file Excel.'
    },
    {
      parent: 'NODE-CRM-010: Chi Ngân Sách',
      child: 'Tạo đề xuất chi & Phê duyệt phiếu chi',
      desc: 'Lập phiếu chi theo ban, đính kèm hóa đơn chứng từ; Chủ tịch / Trưởng Ban duyệt chi online.'
    },
    {
      parent: 'NODE-CRM-011: Báo Cáo Tài Chính',
      child: 'Báo cáo tổng hợp dòng tiền Thu - Chi',
      desc: 'Biểu đồ cột đôi so sánh Thu vs Chi theo tháng/quý/năm; xuất báo cáo PDF phục vụ họp Thường vụ.'
    },
    {
      parent: 'NODE-CRM-012: Công Việc Ban Chuyên Môn',
      child: 'Giao việc mới & Bảng Kanban 4 cột',
      desc: 'Giao nhiệm vụ cho ban kèm deadline; kéo thả thẻ công việc qua Khởi tạo -> Đang làm -> Xong.'
    },
    {
      parent: 'NODE-CRM-013: Nhà Tài Trợ',
      child: 'Quản lý nhà tài trợ 4 phân hạng',
      desc: 'Quản lý gói tài trợ Kim Cương, Vàng, Bạc, Đồng; tải logo hiển thị màn hình chiếu sự kiện.'
    },
    {
      parent: 'NODE-CRM-014: Kho Tài Liệu Số',
      child: 'Lưu trữ văn bản & Universal Document Viewer',
      desc: 'Lưu văn bản, điều lệ, biểu mẫu; xem trực tiếp file Word, Excel, PDF ngay trên trình duyệt.'
    },
    {
      parent: 'NODE-CRM-015: Biểu Quyết & Lucky Draw',
      child: 'Tạo phiên biểu quyết & Vòng quay may mắn',
      desc: 'Mở biểu quyết nghị quyết đại hội; quay số trúng thưởng Lucky Draw đồng bộ khách check-in.'
    },
    {
      parent: 'NODE-CRM-016: Bản Tin CLB',
      child: 'Biên tập & Xuất bản tin tức',
      desc: 'Viết bài truyền thông, hoạt động thăm doanh nghiệp, xuất bản lên app cho hội viên đọc.'
    },
    {
      parent: 'NODE-CRM-017: Gia Hạn & Nợ Phí',
      child: 'Theo dõi hạn niên liễm & Nhắc phí tự động',
      desc: 'Quét hội viên đến hạn/quá hạn; gửi thông báo nhắc phí kèm VietQR; gia hạn thẻ 1 năm.'
    },
    {
      parent: 'NODE-CRM-018: Đào Tạo Doanh Nghiệp',
      child: 'Quản lý khóa đào tạo & Video trực tuyến',
      desc: 'Thêm chuyên đề nâng cao năng lực doanh nhân; mở phòng họp video trực tuyến.'
    },
    {
      parent: 'NODE-CRM-019: Nhật Ký Hoạt Động (Audit Log)',
      child: 'Giám sát lịch sử thao tác toàn hệ thống',
      desc: 'Ghi vết 100% mọi hành động Thêm/Sửa/Xóa của từng tài khoản, kèm IP và thời gian thực.'
    },
    {
      parent: 'NODE-CRM-020: Cơ Hội Giao Thương B2B',
      child: 'Kiểm duyệt tin cơ hội kinh doanh',
      desc: 'Kiểm tra tính xác thực tin đăng của hội viên; duyệt hiển thị lên app hoặc từ chối kèm lý do.'
    },
    {
      parent: 'NODE-CRM-021: Theme Studio',
      child: 'Cài đặt nhận diện thương hiệu CLB',
      desc: 'Tùy biến màu chủ đạo Brandbook, tải logo hiệp hội sắc nét, xem trước Live Preview.'
    },
    {
      parent: 'NODE-CRM-022: Trung Tâm Thông Báo Quản Trị',
      child: 'Xử lý yêu cầu Quên mật khẩu từ App',
      desc: 'Tiếp nhận thông báo hội viên yêu cầu quên mật khẩu; tự động tạo mã và gửi email khôi phục.'
    },
    {
      parent: 'NODE-CRM-023: Thư Mời & Zalo ZBS',
      child: 'Thiết lập mẫu thư mời sự kiện đa kênh',
      desc: 'Tạo mẫu thư mời Zalo ZNS, Email, Push App với các biến tự động {ho_ten}, {ma_ve}, {dia_diem}.'
    },
    {
      parent: 'NODE-CRM-023: Thư Mời & Zalo ZBS',
      child: 'Gửi Zalo ZBS hàng loạt từ file Excel khách mời',
      desc: 'Upload file Excel (Họ tên + SĐT chuẩn hóa 84), chọn mẫu thông báo, bấm gửi hàng loạt qua Zalo OA.'
    }
  ];

  // Hàm setup định dạng cho từng sheet
  function setupSheet(sheet, sheetTitle, subtitleText, features, isOverall = false) {
    sheet.views = [{ showGridLines: true }];

    // Độ rộng cột chuẩn đẹp
    sheet.columns = [
      { key: 'stt', width: 7 }, // A
      { key: 'parent', width: 28 }, // B
      { key: 'child', width: 34 }, // C
      { key: 'desc', width: 48 }, // D
      { key: 'status', width: 16 }, // E: ĐỂ TRỐNG
      { key: 'assignee', width: 20 }, // F: ĐỂ TRỐNG
      { key: 'reviewer', width: 22 }, // G: ĐỂ TRỐNG
      { key: 'reviewComment', width: 38 }, // H: ĐỂ TRỐNG
      { key: 'fixAssignee', width: 20 }, // I: ĐỂ TRỐNG
      { key: 'solution', width: 38 }, // J: ĐỂ TRỐNG
      { key: 'postStatus', width: 18 }, // K: ĐỂ TRỐNG
    ];

    // 1. Dòng Tiêu Đề
    sheet.mergeCells('A1:K1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = sheetTitle;
    titleCell.font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF003B95' }, // Navy CEO 1983
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).height = 36;

    // 2. Dòng Phụ Đề
    sheet.mergeCells('A2:K2');
    const subtitleCell = sheet.getCell('A2');
    subtitleCell.value = subtitleText;
    subtitleCell.font = { name: 'Calibri', size: 11, italic: true, color: { argb: 'FF334155' } };
    subtitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' },
    };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(2).height = 24;

    // 3. Dòng Ghi chú hướng dẫn cho khách hàng / hội viên
    sheet.mergeCells('A3:K3');
    const noteCell = sheet.getCell('A3');
    noteCell.value = '💡 HƯỚNG DẪN: Các cột chức năng (A, B, C, D) đã liệt kê đầy đủ. Các cột đánh giá (E, F, G, H, I, J, K) để trống để Anh/Chị ghi nhận người đánh giá, lỗi phát sinh, ý kiến góp ý.';
    noteCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFB91C1C' } };
    noteCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFEF2F2' },
    };
    noteCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    sheet.getRow(3).height = 22;

    // 4. Header Cột (Dòng 4)
    const headers = [
      'STT',
      'Chức năng cha',
      'Chức năng con',
      'Mô tả chi tiết',
      'Trạng thái',
      'Người thực hiện',
      'Người đánh giá',
      'Nội dung đánh giá (Lỗi / Góp ý)',
      'Người tiếp nhận sửa',
      'Giải pháp',
      'Trạng thái sau tiếp nhận',
    ];

    const headerRow = sheet.getRow(4);
    headers.forEach((h, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = h;
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' }, // Slate 800
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF64748B' } },
        left: { style: 'thin', color: { argb: 'FF64748B' } },
        bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
        right: { style: 'thin', color: { argb: 'FF64748B' } },
      };
    });
    headerRow.height = 30;

    let currentRow = 5;

    // Nếu là sheet tổng hợp, chèn 2 Section rõ ràng
    if (isOverall) {
      // SECTION I: APP MOBILE
      sheet.mergeCells(`A${currentRow}:K${currentRow}`);
      const sec1 = sheet.getCell(`A${currentRow}`);
      sec1.value = '📱 PHẦN I: ỨNG DỤNG DI ĐỘNG HỘI VIÊN (MOBILE APP - https://ceo1983.viconnect.vn)';
      sec1.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
      sec1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003B95' } };
      sec1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      sheet.getRow(currentRow).height = 26;
      currentRow++;

      let sttApp = 1;
      for (const item of appFeatures) {
        insertFeatureRow(sheet, currentRow, sttApp++, item);
        currentRow++;
      }

      // Khoảng cách
      sheet.getRow(currentRow).height = 12;
      currentRow++;

      // SECTION II: HỆ THỐNG CRM
      sheet.mergeCells(`A${currentRow}:K${currentRow}`);
      const sec2 = sheet.getCell(`A${currentRow}`);
      sec2.value = '💻 PHẦN II: CỔNG QUẢN TRỊ HỆ THỐNG (WEB CRM - https://crm.ceo1983.viconnect.vn)';
      sec2.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
      sec2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB91C1C' } };
      sec2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      sheet.getRow(currentRow).height = 26;
      currentRow++;

      let sttCrm = 1;
      for (const item of crmFeatures) {
        insertFeatureRow(sheet, currentRow, sttCrm++, item);
        currentRow++;
      }
    } else {
      // Sheet riêng từng phân hệ
      let stt = 1;
      for (const item of features) {
        insertFeatureRow(sheet, currentRow, stt++, item);
        currentRow++;
      }
    }
  }

  function insertFeatureRow(sheet, rowIdx, stt, item) {
    const row = sheet.getRow(rowIdx);
    const isEven = stt % 2 === 0;
    const bgFill = isEven ? 'FFF8FAFC' : 'FFFFFFFF'; // Zebra striping

    // Cột A: STT
    const cellA = row.getCell(1);
    cellA.value = stt;
    cellA.alignment = { vertical: 'middle', horizontal: 'center' };

    // Cột B: Chức năng cha
    const cellB = row.getCell(2);
    cellB.value = item.parent;
    cellB.alignment = { vertical: 'middle', horizontal: 'left' };
    cellB.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF0F172A' } };

    // Cột C: Chức năng con
    const cellC = row.getCell(3);
    cellC.value = item.child;
    cellC.alignment = { vertical: 'middle', horizontal: 'left' };
    cellC.font = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };

    // Cột D: Mô tả chi tiết
    const cellD = row.getCell(4);
    cellD.value = item.desc;
    cellD.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    cellD.font = { name: 'Calibri', size: 9.5, color: { argb: 'FF475569' } };

    // CÁC CỘT CÒN LẠI (E đến K) ĐỂ TRỐNG HOÀN TOÀN ĐỂ KHÁCH HÀNG GHI ĐÁNH GIÁ!
    for (let c = 5; c <= 11; c++) {
      const cell = row.getCell(c);
      cell.value = ''; // ĐỂ TRỐNG
      cell.alignment = { vertical: 'middle', horizontal: c === 5 || c === 11 ? 'center' : 'left', wrapText: true };
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF000000' } };
    }

    // Border & Fill cho toàn bộ dòng
    for (let c = 1; c <= 11; c++) {
      const cell = row.getCell(c);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgFill },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    }

    // Set Data Validation Dropdown cho Cột E và K (để người dùng bấm chọn Khởi tạo / Đang xử lý / Đã xong nếu muốn)
    row.getCell(5).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Khởi tạo,Đang xử lý,Đã xong"'],
    };
    row.getCell(11).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Khởi tạo,Đang xử lý,Đã xong"'],
    };

    row.height = 25;
  }

  // 1. Tạo Sheet 1: Tổng Hợp Phân Rõ 2 Khu Vực App & CRM
  const sheetOverall = workbook.addWorksheet('TỔNG HỢP TOÀN HỆ THỐNG');
  setupSheet(
    sheetOverall,
    'BẢNG THEO DÕI & ĐÁNH GIÁ TÍNH NĂNG TOÀN HỆ THỐNG CEO 1983',
    'Phân chia rõ ràng: Phần I - Ứng Dụng Di Động Hội Viên (App) & Phần II - Cổng Quản Trị Hệ Thống (Web CRM)',
    [],
    true
  );

  // 2. Tạo Sheet 2: Chỉ riêng APP MOBILE
  const sheetApp = workbook.addWorksheet('📱 APP MOBILE HỘI VIÊN');
  setupSheet(
    sheetApp,
    'BẢNG ĐÁNH GIÁ CHỨC NĂNG ỨNG DỤNG DI ĐỘNG HỘI VIÊN (MOBILE APP)',
    'Subdomain: https://ceo1983.viconnect.vn • Dành cho Hội viên CLB Doanh Nhân CEO 1983 (HanoiBA)',
    appFeatures,
    false
  );

  // 3. Tạo Sheet 3: Chỉ riêng HỆ THỐNG CRM
  const sheetCrm = workbook.addWorksheet('💻 HỆ THỐNG WEB CRM');
  setupSheet(
    sheetCrm,
    'BẢNG ĐÁNH GIÁ CHỨC NĂNG CỔNG QUẢN TRỊ HỆ THỐNG (WEB CRM)',
    'Subdomain: https://crm.ceo1983.viconnect.vn • Dành cho Chủ tịch, Ban Thư Ký & 6 Ban Chuyên Môn',
    crmFeatures,
    false
  );

  // Đường dẫn file xuất
  const docPath = path.resolve(__dirname, '../document/BANG_DANH_GIA_VA_THEO_DOI_CHUC_NANG_CEO1983.xlsx');
  const publicPath = path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs/BANG_DANH_GIA_VA_THEO_DOI_CHUC_NANG_CEO1983.xlsx');

  await workbook.xlsx.writeFile(docPath);
  console.log(`✔ Đã lưu file Excel tại: ${docPath}`);

  // Đồng bộ sang public/docs
  fs.copyFileSync(docPath, publicPath);
  console.log(`✔ Đã đồng bộ sang: ${publicPath}`);

  console.log('=== HOÀN TẤT XUẤT BẢNG EXCEL ĐÁNH GIÁ CHUẨN MỰC ===');
}

buildEvaluationExcel().catch(console.error);
