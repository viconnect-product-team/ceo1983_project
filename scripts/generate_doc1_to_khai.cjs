const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

function xmlEscape(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generateToKhai() {
  const srcPath = 'C:\\Users\\vumik\\Downloads\\[UFP] 01. Tờ khai.docx';
  const outPathDownloads = 'C:\\Users\\vumik\\Downloads\\[CEO1983] 01. Tờ khai.docx';
  const outPathDoc = path.join(__dirname, '..', 'document', '[CEO1983] 01. Tờ khai.docx');

  console.log('Reading template:', srcPath);
  const data = fs.readFileSync(srcPath);
  const zip = await JSZip.loadAsync(data);
  let xml = await zip.file('word/document.xml').async('text');

  // Helper to replace text inside paragraph while preserving pPr
  function replacePContent(pXml, newText, isBold = false, isItalic = false) {
    const pPrMatch = pXml.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
    const pPr = pPrMatch ? pPrMatch[0] : '';
    let rPr = '<w:rPr><w:lang w:val="vi-VN"/>';
    if (isBold) rPr += '<w:b/><w:bCs/>';
    if (isItalic) rPr += '<w:i/><w:iCs/>';
    rPr += '</w:rPr>';
    return `<w:p>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${xmlEscape(newText)}</w:t></w:r></w:p>`;
  }

  // 1-to-1 Paragraph Replacements
  const pUpdates = {
    17: { text: 'Tên chương trình máy tính: HỆ THỐNG PHẦN MỀM QUẢN TRỊ KẾT NỐI DOANH NGHIỆP VÀ ỨNG DỤNG DI ĐỘNG CEO 1983 (CEO 1983 PLATFORM & MOBILE APP)', bold: true },
    18: { text: 'Ngày, tháng, năm hoàn thành: ....../....../2026.' },
    29: { text: 'Hệ thống phần mềm quản trị kết nối doanh nghiệp và Ứng dụng di động CEO 1983 (CEO 1983 Platform & Mobile App) là nền tảng chuyển đổi số toàn diện dành cho Hiệp hội Doanh nhân CEO 1983 (trực thuộc HanoiBA), được triển khai vận hành thực tế phân lập trên 02 tên miền phụ (subdomain) chuyên trách: Cổng Quản trị Web CRM (https://crm.ceo1983.viconnect.vn) dành cho Ban Điều Hành, Ban Thư Ký và 6 Ban Chuyên Môn; cùng Ứng dụng Di động Hội viên (https://ceo1983.viconnect.vn) dành cho cộng đồng doanh nhân thành viên. Phần mềm được tổ chức thành 8 phân hệ chức năng cốt lõi sau:' },
    30: { text: '1. Phân hệ Quản trị Hội viên, Ban Chuyên Môn & Thẩm định Hồ sơ (Member & Council Management):', bold: true },
    31: { text: 'Quản lý toàn diện cơ sở dữ liệu hội viên doanh nhân và doanh nghiệp thành viên trên Cổng CRM (https://crm.ceo1983.viconnect.vn). Hỗ trợ quy trình thẩm định, phê duyệt cấp tài khoản định danh bắt buộc đổi mật khẩu lần đầu (must_change_password). Quản trị cơ cấu 6 ban chuyên môn (Ban Quản Trị, Ban Thư Ký, Ban Tài Chính, Ban Truyền Thông, Ban Thành Viên, Ban Xúc Tiến Thương Mại) cùng ma trận phân quyền nâng cao RBAC 5 quyền cốt lõi (Xem, Thêm, Sửa, Xóa, Duyệt) bảo đảm an toàn dữ liệu nội bộ.' },
    32: { text: '2. Phân hệ Trang Chủ Hội Viên VIP & Danh Thiếp Số Một Chạm (Home VIP & Digital Business Card):', bold: true },
    33: { text: 'Trải nghiệm trên App Di động (https://ceo1983.viconnect.vn) với Trang chủ VIP số hóa, Thẻ hội viên nhận diện 3 màu thương hiệu (Đỏ - Vàng - Xanh), hàng trao đổi cơ hội 3 biểu đồ tròn (Donut Charts trực quan), phím tắt nhanh và popup chào mừng logo 8 sang trọng. Tích hợp mã QR định danh cá nhân và công nghệ tiệm cận NFC (Near Field Communication) chạm lưng một chạm trao đổi danh thiếp số tức thì không cần cài đặt ứng dụng phụ.' },
    34: { text: '3. Phân hệ Quản trị Sự kiện, Đào tạo Chuyên đề & Bắn Mạng Lưới (Events, Training & Network Push):', bold: true },
    35: { text: 'Quản lý tổ chức sự kiện, hội thảo, đại hội và các khóa đào tạo trực tuyến (Zoom/Jitsi)/trực tiếp/hybrid. Cung cấp tính năng "Bắn Mạng Lưới" tự động tạo bài viết đính kèm Poster và mã QR Check-in đẩy từ CRM xuống Bảng tin App Hội viên. Tích hợp công cụ tạo Form đăng ký đào tạo mở rộng link công khai và mã QR tải về, hỗ trợ quét mã QR check-in lễ tân siêu tốc dưới 500ms qua Socket.IO.' },
    36: { text: '4. Phân hệ Sàn Giao thương B2B & Trao gửi Cơ hội Referral (B2B Opportunities & Marketplace):', bold: true },
    37: { text: 'Sàn thương mại và giao thương nội bộ với 4 phân hệ danh mục cơ hội chuẩn hóa ("Tất cả cơ hội", "Cơ hội của tôi", "Ai đang deal cơ hội của tôi", "Mình đang quan tâm"). Cho phép doanh nhân đăng tải gian hàng, năng lực cung ứng, mức chiết khấu nội bộ và trao cơ hội kinh doanh (Referral Networking), theo dõi tiến trình đàm phán và tổng giá trị hợp đồng thành công.' },
    38: { text: '5. Phân hệ Quản trị Tài chính, Thu chi & Sổ quỹ VietQR (Financial & VietQR Fund Management):', bold: true },
    39: { text: 'Theo dõi minh bạch toàn bộ các khoản thu đóng hội phí thường niên, thu chi sự kiện và ngân sách hoạt động CLB. Tích hợp công nghệ thanh toán định danh tự động VietQR Napas 247, tự động kết xuất báo cáo Sổ quỹ tiền mặt Mẫu S07-DN theo Thông tư 200/2014/TT-BTC kèm bộ 3 chữ ký số lãnh đạo (Người lập, Thủ quỹ, Kế toán trưởng) và xuất nhập dữ liệu Excel.' },
    40: { text: '6. Phân hệ Báo cáo Thống kê Đa nền tảng & Bục Vinh Danh (Advanced Analytics & Awards Podium):', bold: true },
    41: { text: 'Đồng bộ module Thống kê chuyên sâu trên cả Web CRM và Mobile App (Tab Thống kê Footer). Cung cấp 4 thẻ chỉ số KPI chính, Biểu đồ Composed Bar-Line phân hóa xu hướng tăng xanh / giảm đỏ, avatar hội viên Top 1 định vị tại đỉnh cột, bục vinh danh Top 3 thiết kế 1 hàng ngang (Single-row 3-column podium), phân chia 5 danh mục thống kê và xuất báo cáo chuẩn doanh nghiệp (A4 Bản in & Excel).' },
    42: { text: '7. Phân hệ Danh bạ Hội viên & Bản đồ Tương tác Leaflet 2D Vệ tinh (Interactive Leaflet GPS Map):', bold: true },
    43: { text: 'Bản đồ tương tác đa tầng sử dụng Leaflet 2D với lớp vệ tinh Google Maps trên app di động. Phân chia rõ ràng 2 phạm vi quan sát: "Tổng thể" (toàn bộ hội viên, sự kiện, cuộc họp ban) và "Cá nhân" (người đã kết nối, sự kiện đã đăng ký, cuộc gặp 1-1), tích hợp định vị GPS và điều hướng chỉ đường Google Maps.' },
    44: { text: '8. Phân hệ Studio Thiết kế Chủ đề & Đồng bộ Giao diện Thời gian thực (Theme Studio & Real-time Sync):', bold: true },
    45: { text: 'Bộ công cụ Studio thiết kế chủ đề tại CRM cho phép tải ảnh nền tùy chỉnh hoặc chọn mẫu doanh nhân VIP, tùy biến biểu tượng 14 tính năng, xem trước Mockup điện thoại và tự động đồng bộ biến CSS `--festival-bg-image` xuống toàn bộ ứng dụng di động của hội viên tức thì theo thời gian thực.' },

    // Components (Thành phần)
    47: { text: 'Hệ thống phần mềm quản trị kết nối doanh nghiệp và Ứng dụng di động CEO 1983 (CEO 1983 Platform & Mobile App) gồm các thành phần chính sau:' },
    48: { text: '1. Cổng Quản trị Web CRM CEO 1983 (Triển khai tại Subdomain: https://crm.ceo1983.viconnect.vn)', bold: true },
    49: { text: 'Xây dựng trên nền tảng React 18, Vite, TypeScript, Tailwind CSS; cung cấp giao diện Desktop chuyên nghiệp, Dashboard điều hành thời gian thực, module Thống kê 4 KPI & bục vinh danh Top 3, quản lý lịch sự kiện và đào tạo có tính năng Bắn Mạng Lưới (kèm Poster & QR), Studio Thiết kế Chủ đề tải ảnh nền tùy chỉnh, cùng hệ thống bảng dữ liệu chuẩn Excel và phân quyền RBAC 6 ban chuyên môn.' },
    50: { text: '2. Ứng dụng Di động Hội viên CEO 1983 (Triển khai tại Subdomain: https://ceo1983.viconnect.vn)', bold: true },
    51: { text: 'Xây dựng bằng Capacitor 5, React 18, TypeScript; tối ưu hóa trải nghiệm mobile-first trên iOS/Android/PWA với Trang chủ VIP số hóa, Thẻ danh thiếp điện tử 3 màu nhận diện tích hợp QR và NFC một chạm, Tab Thống kê di động 4 KPI, Bảng tin Mạng lưới nhận bài viết đào tạo & sự kiện kèm QR Check-in, Danh bạ tích hợp Bản đồ tương tác Leaflet 2D vệ tinh, sàn giao thương B2B 4 danh mục và cơ chế đồng bộ chủ đề CRM theo thời gian thực.' },
    52: { text: '3. Máy chủ Xử lý Nghiệp vụ Trung tâm (NestJS Backend Core - https://crm.ceo1983.viconnect.vn/api & https://ceo1983.viconnect.vn/api)', bold: true },
    53: { text: 'Nền tảng Node.js v20+ / TypeScript với kiến trúc module phân lớp rõ ràng (Auth, Users, Members, Events, Trainings, Feed, Opportunities, Sponsors, Tasks, Business Card, Upload, Analytics), cung cấp chuẩn RESTful API và tài liệu Swagger phục vụ toàn bộ hệ thống.' },
    54: { text: '4. Cổng Tương tác Thời gian thực (Socket.IO Gateway)', bold: true },
    55: { text: 'Đảm nhiệm việc truyền phát dữ liệu điểm danh check-in trực tiếp, thông báo đẩy (push notifications), bắn bài viết mạng lưới tức thì, cập nhật trạng thái nhiệm vụ và tin nhắn trao đổi giữa các thành viên qua giao thức WebSockets.' },
    56: { text: '5. Cơ sở dữ liệu quan hệ trung tâm (PostgreSQL 16 Engine)', bold: true },
    57: { text: 'Lưu trữ dữ liệu an toàn, toàn vẹn với các ràng buộc khoá ngoại, chỉ mục tìm kiếm tối ưu B-Tree, quản lý lịch sử kiểm toán (Audit Trail) và chính sách sao lưu tự động hàng ngày.' },
    58: { text: '6. Bộ nhớ đệm và kiểm soát lưu lượng (Redis In-Memory Cache)', bold: true },
    59: { text: 'Lưu trữ phiên làm việc, mã xác thực một lần (OTP), hàng đợi gửi email thông báo và cơ chế giới hạn tốc độ truy cập (Rate Limiting) phòng chống tấn công DoS.' },
    60: { text: '7. Kho lưu trữ tệp tin đa phương tiện (MinIO Object Storage)', bold: true },
    61: { text: 'Hệ thống lưu trữ tệp tương thích S3 lưu trữ an toàn ảnh thẻ hội viên, logo doanh nghiệp, slide thuyết trình, tài liệu đào tạo, poster sự kiện và hóa đơn chứng từ kế toán.' },
    62: { text: '8. Cổng mạng bảo mật & Reverse Proxy (Nginx SSL/TLS Gateway)', bold: true },
    63: { text: 'Đảm nhận chứng thực HTTPS toàn trình với chứng chỉ Let\'s Encrypt 2048-bit, định tuyến tách biệt độc lập giữa subdomain CRM (crm.ceo1983.viconnect.vn) và Mobile App (ceo1983.viconnect.vn), nén dữ liệu gzip/brotli và bảo vệ tường lửa lớp ứng dụng.' },
    64: { text: '9. Hệ thống Cổng thanh toán & Tích hợp VietQR (VietQR Dynamic Banking Hub)', bold: true },
    65: { text: 'Tự động sinh mã VietQR theo chuẩn Napas 247 gắn mã đơn/hội viên và nội dung định danh, đồng bộ trạng thái giao dịch ngân hàng phục vụ thu hội phí và sự kiện.' },
    66: { text: '10. Bộ công cụ kiểm thử & Đóng gói tự động (CI/CD & Testing Suite)', bold: true },
    67: { text: 'Kiểm thử tự động với Vitest / Jest, kiểm tra kiểu dữ liệu nghiêm ngặt TypeScript (tsc --noEmit) đạt chuẩn 0 lỗi và đóng gói tự động thành các container Docker phục vụ triển khai Nginx reverse proxy.' },

    // Architecture (Cấu tạo)
    69: { text: 'Hệ thống phần mềm quản trị kết nối doanh nghiệp và Ứng dụng di động CEO 1983 được xây dựng theo mô hình kiến trúc phân tầng 4 lớp chuẩn mực (Multi-tier Architecture), bảo đảm tính tách biệt độc lập giữa tầng giao diện người dùng, cổng bảo mật mạng, tầng nghiệp vụ trung tâm và tầng lưu trữ dữ liệu. Các lớp chính gồm:' },
    70: { text: '1. Tầng Giao diện Người dùng (Presentation / Client Layer)', bold: true },
    71: { text: 'Bao gồm Cổng Quản trị Web CRM (Desktop Viewport: https://crm.ceo1983.viconnect.vn) và Ứng dụng Di động Hội viên (Mobile Viewport: https://ceo1983.viconnect.vn). Lớp này tiếp nhận thao tác người dùng, xử lý trạng thái giao diện cục bộ và trao đổi với backend thông qua các API Client chuẩn hóa.' },
    72: { text: '2. Tầng Cổng Mạng & Kiểm soát Truy cập (Gateway & Security Layer)', bold: true },
    73: { text: 'Sử dụng Nginx Ingress làm cổng tiếp nhận duy nhất trên cổng 443 (HTTPS). Tầng này xử lý kết thúc mã hóa TLS, định tuyến tên miền phân lập giữa CRM và Mobile App, kiểm tra CORS, cấu hình CSP và ngăn chặn các truy vấn bất thường trước khi đi vào hệ thống.' },
    74: { text: '3. Tầng Dịch vụ & Xử lý Nghiệp vụ Cốt lõi (Core Business Service Layer)', bold: true },
    75: { text: 'Được xây dựng trên nền tảng NestJS theo kiến trúc 3 tầng thuần khiết (Controller - Service - Repository). Tầng này chịu trách nhiệm kiểm tra tính hợp lệ của dữ liệu đầu vào (DTO Validation), xác thực mã thông báo định danh JWT (Auth Guard), kiểm soát ma trận quyền hạn RBAC và thực thi toàn bộ logic nghiệp vụ.' },
    76: { text: '4. Tầng Dữ liệu & Lưu trữ Bền vững (Data Persistence & Storage Layer)', bold: true },
    77: { text: 'Quản lý cơ sở dữ liệu quan hệ PostgreSQL 16 và kho lưu trữ đối tượng MinIO. Tầng này chịu trách nhiệm lưu trữ có cấu trúc các thực thể dữ liệu, thực hiện các giao dịch cơ sở dữ liệu (Database Transactions) bảo đảm tính toàn vẹn (ACID) và duy trì nhật ký kiểm toán.' },
    78: { text: '5. Phân hệ Quản trị Hội viên & Ban Chuyên Môn (Member & Committee Modules)', bold: true },
    79: { text: 'Chịu trách nhiệm quản lý danh sách hội viên, phân ban chuyên môn, duyệt kết nạp, cấu hình quyền hạn và hồ sơ doanh nghiệp thành viên.' },
    80: { text: '6. Phân hệ Sự kiện, Đào tạo & Check-in QR (Event, Training & Check-in Modules)', bold: true },
    81: { text: 'Chịu trách nhiệm tạo sự kiện, chuyên đề đào tạo, bắn mạng lưới kèm poster và QR, sơ đồ bàn tiệc, xuất vé điện tử Ticket Pass có mã QR và quét điểm danh thời gian thực.' },
    82: { text: '7. Phân hệ Sàn Giao thương B2B & Cơ hội Referral (B2B Marketplace & Opportunities)', bold: true },
    83: { text: 'Chịu trách nhiệm quản lý 4 danh mục cơ hội kinh doanh, sản phẩm, dịch vụ, nhu cầu kết nối kinh doanh và trao đổi cơ hội Referral giữa các doanh nghiệp.' },
    84: { text: '8. Phân hệ Tài chính, Quỹ & Nhà Tài Trợ (Finance & Sponsor Modules)', bold: true },
    85: { text: 'Chịu trách nhiệm theo dõi đóng phí, thu chi, xuất sổ quỹ Mẫu S07-DN chuẩn Bộ Tài Chính và quản trị quyền lợi nhà tài trợ.' },
    86: { text: '9. Phân hệ Bảng tin Mạng lưới, Bản tin & Khảo sát Biểu quyết (Feed & Voting Modules)', bold: true },
    87: { text: 'Chịu trách nhiệm bảng tin mạng lưới doanh nhân, nhận bài viết đào tạo/sự kiện, khảo sát biểu quyết số, bản tin hiệp hội và thông báo đẩy tới toàn thể hội viên.' },
    88: { text: '10. Luồng xử lý dữ liệu tổng quát', bold: true },
    89: { text: 'Người dùng gửi yêu cầu từ Web CRM hoặc Mobile App -> Yêu cầu đi qua Gateway Nginx SSL -> NestJS kiểm tra JWT Auth Guard và phân quyền RBAC -> Gọi tầng Service xử lý -> Cập nhật CSDL PostgreSQL 16 và bộ nhớ đệm Redis -> Phát sự kiện thời gian thực qua Socket.IO -> Trả về kết quả cho máy khách, bảo đảm tốc độ phản hồi nhanh chóng, bảo mật và toàn vẹn dữ liệu.' },

    // Open Source
    94: { text: 'React: https://github.com/facebook/react\nVite: https://github.com/vitejs/vite\nNestJS: https://github.com/nestjs/nest\nCapacitor: https://github.com/ionic-team/capacitor\nPostgreSQL: https://github.com/postgres/postgres\nRedis: https://github.com/redis/redis\nLeaflet: https://github.com/Leaflet/Leaflet\nTailwind CSS: https://github.com/tailwindlabs/tailwindcss\nRecharts: https://github.com/recharts/recharts\nLucide React: https://github.com/lucide-icons/lucide\nSocket.IO: https://github.com/socketio/socket.io\nTypeORM: https://github.com/typeorm/typeorm' },

    // Author Info (Mục 2)
    102: { text: 'Họ và tên: ............................................................                               Quốc tịch: Việt Nam' },
    103: { text: 'Bút danh thể hiện trên tác phẩm (nếu có): ............................................................' },
    104: { text: 'Sinh ngày: ...... tháng ...... năm ..........' },
    105: { text: 'Số Thẻ căn cước của công dân: ............................................................' },
    106: { text: 'Ngày cấp: ....../....../.........., tại: ............................................................' },
    107: { text: 'Địa chỉ: ............................................................' },
    108: { text: 'Số điện thoại: ........................................' },
    109: { text: 'Email: ............................................................' },

    // Owner Info (Mục 3)
    114: { text: 'Tên tổ chức: [TÊN DOANH NGHIỆP / TỔ CHỨC ĐĂNG KÝ]', bold: true },
    115: { text: 'Số đăng ký doanh nghiệp/Quyết định/Giấy phép thành lập: ............................................................' },
    116: { text: 'Ngày cấp: ....../....../.......... tại: ............................................................' },
    117: { text: 'Địa chỉ: ............................................................' },
    118: { text: 'Số điện thoại: ........................................' },
    119: { text: 'Email: ............................................................' }
  };

  // Split document by <w:p>
  const pRegex = /<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g;
  let pIndex = 0;
  xml = xml.replace(pRegex, (pXml) => {
    pIndex++;
    if (pUpdates[pIndex]) {
      const u = pUpdates[pIndex];
      return replacePContent(pXml, u.text, u.bold || false, u.italic || false);
    }
    return pXml;
  });

  zip.file('word/document.xml', xml);
  const outBuf = await zip.generateAsync({ type: 'nodebuffer' });

  fs.writeFileSync(outPathDownloads, outBuf);
  console.log('Saved to Downloads:', outPathDownloads, '(', outBuf.length, 'bytes )');

  fs.writeFileSync(outPathDoc, outBuf);
  console.log('Saved to document:', outPathDoc, '(', outBuf.length, 'bytes )');
}

generateToKhai().catch(err => {
  console.error('Error generating To Khai:', err);
  process.exit(1);
});
