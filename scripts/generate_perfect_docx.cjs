const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

// Helper to escape XML
function xmlEscape(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const colWidths = [560, 1400, 1900, 1400, 1900, 900, 1100, 4078, 1900];
const totalWidth = 15138;

function buildCellXml(content, width, options = {}) {
  const {
    fill = 'auto',
    vAlign = 'top',
    bold = false,
    color = '000000',
    align = 'left',
    gridSpan = null,
    fontSize = 17,
    paragraphs = null
  } = options;

  let tcPr = `<w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>`;
  if (gridSpan) {
    tcPr += `<w:gridSpan w:val="${gridSpan}"/>`;
  }
  tcPr += `<w:tcBorders><w:top w:val="single" w:color="BFC8D6" w:sz="4" w:space="0"/><w:left w:val="single" w:color="BFC8D6" w:sz="4" w:space="0"/><w:bottom w:val="single" w:color="BFC8D6" w:sz="4" w:space="0"/><w:right w:val="single" w:color="BFC8D6" w:sz="4" w:space="0"/></w:tcBorders>`;
  if (fill !== 'auto') {
    tcPr += `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>`;
  }
  tcPr += `<w:tcMar><w:top w:w="70" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="50" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tcMar>`;
  tcPr += `<w:vAlign w:val="${vAlign}"/></w:tcPr>`;

  let pXml = '';
  if (paragraphs && paragraphs.length > 0) {
    pXml = paragraphs
      .map(
        p => `<w:p><w:pPr><w:spacing w:before="20" w:after="30" w:line="240" w:lineRule="auto"/><w:jc w:val="${p.align || align}"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:sz w:val="${p.fontSize || fontSize}"/><w:szCs w:val="${p.fontSize || fontSize}"/><w:color w:val="${p.color || color}"/>${p.bold || bold ? '<w:b/><w:bCs/>' : ''}</w:rPr><w:t xml:space="preserve">${xmlEscape(p.text)}</w:t></w:r></w:p>`
      )
      .join('');
  } else {
    const lines = content ? content.split('\n') : [''];
    pXml = lines
      .map(
        line => `<w:p><w:pPr><w:spacing w:before="0" w:after="30" w:line="240" w:lineRule="auto"/><w:jc w:val="${align}"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:sz w:val="${fontSize}"/><w:szCs w:val="${fontSize}"/><w:color w:val="${color}"/>${bold ? '<w:b/><w:bCs/>' : ''}</w:rPr><w:t xml:space="preserve">${xmlEscape(line)}</w:t></w:r></w:p>`
      )
      .join('');
  }

  return `<w:tc>${tcPr}${pXml}</w:tc>`;
}

function buildHeaderRow() {
  const headers = [
    { text: 'STT', width: colWidths[0], align: 'center' },
    { text: 'Hạng mục', width: colWidths[1], align: 'center' },
    { text: 'Vấn đề cần sửa (CLB)', width: colWidths[2], align: 'center' },
    { text: 'Mục đích', width: colWidths[3], align: 'center' },
    { text: 'Đề xuất giải pháp (CLB)', width: colWidths[4], align: 'center' },
    { text: 'Người góp ý', width: colWidths[5], align: 'center' },
    { text: 'Ưu tiên · Ghi chú', width: colWidths[6], align: 'center' },
    { text: 'Ý Tưởng & Giải Pháp Công Nghệ Đề Xuất\n(ViOne / ViConnect)', width: colWidths[7], align: 'center' },
    { text: 'Trạng Thái & Kế Hoạch Triển Khai\n(Đợt 1: Trước 05/11/2026)', width: colWidths[8], align: 'center' }
  ];

  let cellsXml = headers
    .map(h =>
      buildCellXml(h.text, h.width, {
        fill: '1F3864',
        color: 'FFFFFF',
        bold: true,
        align: h.align,
        fontSize: 17,
        vAlign: 'center'
      })
    )
    .join('');

  return `<w:tr><w:trPr><w:cantSplit/><w:tblHeader/></w:trPr>${cellsXml}</w:tr>`;
}

function buildGroupRow(title) {
  const cellXml = buildCellXml(title, totalWidth, {
    gridSpan: 9,
    fill: 'DCE6F2',
    color: '1F3864',
    bold: true,
    fontSize: 19,
    align: 'left',
    vAlign: 'center'
  });
  return `<w:tr><w:trPr><w:cantSplit/></w:trPr>${cellXml}</w:tr>`;
}

function buildDataRow(item) {
  let statusBg = 'D1FAE5';
  let statusColor = '065F46';
  if (item.statusType === 'IN_PROGRESS') {
    statusBg = 'FEF3C7';
    statusColor = '92400E';
  } else if (item.statusType === 'PLANNED') {
    statusBg = 'DBEAFE';
    statusColor = '1E40AF';
  }

  const statusParagraphs = item.thoiGian.split('\n').map((line, idx) => ({
    text: line,
    bold: idx === 0,
    color: idx === 0 ? statusColor : '4B5563',
    fontSize: idx === 0 ? 16 : 14,
    align: 'center'
  }));

  const solutionParagraphs = item.giaiPhapViconnect.map(line => ({
    text: line,
    bold: line.startsWith('•') && line.includes(':'),
    color: '111827',
    fontSize: 16,
    align: 'left'
  }));

  const rowCells = [
    buildCellXml(item.stt, colWidths[0], { align: 'center', bold: true, color: '1F3864' }),
    buildCellXml(item.hangMuc, colWidths[1], { bold: true }),
    buildCellXml(item.vanDe, colWidths[2]),
    buildCellXml(item.mucDich, colWidths[3]),
    buildCellXml(item.deXuatCLB, colWidths[4]),
    buildCellXml(item.nguoiGopY, colWidths[5]),
    buildCellXml(item.uuTien, colWidths[6], { bold: true, color: 'B54708', fontSize: 15 }),
    buildCellXml('', colWidths[7], { paragraphs: solutionParagraphs }),
    buildCellXml('', colWidths[8], { fill: statusBg, paragraphs: statusParagraphs, vAlign: 'center' })
  ];

  return `<w:tr><w:trPr><w:cantSplit/></w:trPr>${rowCells.join('')}</w:tr>`;
}

const data = [
  // A. GIAO DIỆN & THẺ HỘI VIÊN
  {
    group: 'A. GIAO DIỆN & THẺ HỘI VIÊN',
    items: [
      {
        stt: '1',
        hangMuc: 'Trang chủ ứng dụng',
        vanDe: 'Trang chủ có 8 ô tính năng nhanh, dàn trải; có cả Đặc quyền VIP, Biểu quyết số, Hội phí.',
        mucDich: 'Đơn giản hóa để hội viên dùng thường xuyên, tập trung vào giá trị cốt lõi.',
        deXuatCLB: 'Rút gọn quanh 4 chức năng: Sự kiện, Tìm hội viên, Cơ hội, Góc hội viên; thông tin CLB đặt sau. Bỏ Đặc quyền VIP, Biểu quyết số, Hội phí khỏi khu tính năng nhanh. Giữ Danh bạ hội viên làm chức năng nền tảng.',
        nguoiGopY: 'Anh Tuấn\nAnh Thành',
        uuTien: 'Cao · Đợt 1',
        giaiPhapViconnect: [
          '• Giải pháp kiến trúc giao diện tinh giản: Định hướng thiết kế trang chủ hội tụ quanh 4 luồng nghiệp vụ cốt lõi: Lịch sự kiện, Danh bạ hội viên, Sàn giao thương và Mạng lưới kết nối; chuyển các tính năng chuyên biệt về phân hệ riêng.',
          '• Ý tưởng cá nhân hóa màn hình: ViOne cung cấp cơ chế cho phép từng doanh nhân tự do tùy biến chọn 4 phím tắt theo sở thích và thói quen sinh hoạt tại CLB.',
          '• Ý tưởng Dải Ticker cơ hội & Sàn B2B thời gian thực: Ứng dụng dải biến động cơ hội theo thời gian thực (Realtime Ticker) đặt nổi bật dưới Thẻ hội viên nhằm tạo nhịp đập giao thương và kích thích hội viên truy cập thường xuyên.'
        ],
        statusType: 'READY',
        thoiGian: '🟢 ĐÃ SẴN SÀNG\n(Nền tảng sẵn có - Đợt 1)'
      },
      {
        stt: '2',
        hangMuc: 'Thẻ hội viên',
        vanDe: 'Chưa có tùy chọn ẩn/hiện email và số điện thoại trên thẻ.',
        mucDich: 'Bảo vệ quyền riêng tư của hội viên.',
        deXuatCLB: 'Thêm công tắc ẩn/hiện email, số điện thoại. Tinh giản, tối giản giao diện thẻ.',
        nguoiGopY: 'Ban Thư ký / BĐH',
        uuTien: 'Cao · Đợt 1\n(Cần chốt: trường ẩn, mặc định)',
        giaiPhapViconnect: [
          '• Giải pháp bảo mật danh tính hội viên: Thiết lập bộ công tắc độc lập cho phép hội viên chủ động quản lý việc Ẩn/Hiện Số điện thoại và Email trên Thẻ điện tử mọi lúc.',
          '• Ý tưởng định danh khi chia sẻ đối ngoại: Khi chia sẻ thẻ ra bên ngoài, hệ thống tự động hiển thị huy hiệu xác thực: "🔒 Đã bảo mật theo thiết lập của hội viên", vừa bảo vệ dữ liệu cá nhân vừa tôn vinh sự chuyên nghiệp.',
          '• Thiết kế Thẻ Doanh Nhân Obsidian Gold: Ứng dụng nhận diện thương hiệu sang trọng (Đen Huyền Bí & Vàng Hoàng Kim), tích hợp mã QR Code chạm mở phóng to tức thì giúp kết nối siêu tốc tại các sự kiện giao lưu.'
        ],
        statusType: 'READY',
        thoiGian: '🟢 ĐÃ SẴN SÀNG\n(Nền tảng sẵn có - Đợt 1)'
      },
      {
        stt: '3',
        hangMuc: 'Đặc quyền hội viên',
        vanDe: 'Đang nằm trong khu tính năng nhanh, chưa là tính năng riêng.',
        mucDich: 'Tạo kênh quyền lợi riêng; mở hướng hội viên là gian hàng/gian thương.',
        deXuatCLB: 'Tách thành tính năng riêng. Nghiên cứu mô hình hội viên là gian hàng, gian thương theo kiểu triển lãm.',
        nguoiGopY: 'Anh Tuấn',
        uuTien: 'Trung bình · Đợt 1\n(Cần chốt quy mô triển lãm)',
        giaiPhapViconnect: [
          '• Phân hệ Đặc Quyền chuyên biệt (Dedicated Perks Hub): Tách riêng thành trung tâm quản trị ưu đãi độc lập, phân loại theo ngành nghề kèm bản đồ chỉ đường Google Maps tới điểm ưu đãi và QR Voucher tự sinh.',
          '• Ý tưởng Đột phá - Triển Lãm Số Doanh Nghiệp: Thay vì danh sách đơn thuần, ViConnect đề xuất mô hình "Gian Hàng Doanh Nghiệp Số" độc quyền cho từng hội viên. Mỗi doanh nghiệp sở hữu 1 gian hàng trưng bày hồ sơ năng lực, catalogue 5 sản phẩm tiêu biểu và chính sách chiết khấu riêng cho cộng đồng CEO 1983.',
          '• Kiểm soát định danh: Mỗi doanh nghiệp liên kết với một Mã số thuế duy nhất, bảo đảm tính minh bạch và tránh hiện tượng trùng lặp gian hàng.'
        ],
        statusType: 'IN_PROGRESS',
        thoiGian: '🟡 ĐANG TRIỂN KHAI\n(Hoàn thiện Đợt 1 - trước 05/11/2026)'
      }
    ]
  },
  // B. XÚC TIẾN THƯƠNG MẠI
  {
    group: 'B. XÚC TIẾN THƯƠNG MẠI',
    items: [
      {
        stt: '4',
        hangMuc: 'Sàn thương mại (B2B)',
        vanDe: 'Mỗi sản phẩm tối đa 5 ảnh, nhưng chưa giới hạn số sản phẩm của mỗi doanh nghiệp. Hạ tầng chưa đủ hiển thị toàn bộ sản phẩm của mọi hội viên.',
        mucDich: 'Giữ sàn gọn, đủ tải; CLB không đi sâu quản trị thông tin sản phẩm.',
        deXuatCLB: 'Giới hạn tối đa 5 sản phẩm cần bán cho mỗi doanh nghiệp.',
        nguoiGopY: 'Anh Thành',
        uuTien: 'Cao · Đợt 1',
        giaiPhapViconnect: [
          '• Giải pháp Hạn mức thông minh: Áp dụng thuật toán giới hạn tối đa 5 sản phẩm/dịch vụ tiêu biểu cho mỗi doanh nghiệp. Giúp hội viên chọn lọc tinh hoa kinh doanh, loại bỏ thông tin rác và tối ưu 80% hạ tầng lưu trữ của CLB.',
          '• Cơ chế đo lường & chuẩn hóa đăng tải: Cung cấp thanh tiến trình trực quan (X/5 sản phẩm) và biểu mẫu đăng tải tiêu chuẩn hóa hình ảnh.',
          '• Công nghệ tối ưu đa phương tiện (ViOne Media Engine): Cơ chế nén ảnh tự động chuẩn WebP siêu nhẹ, đảm bảo tốc độ tải trang siêu tốc ngay cả khi hàng nghìn người cùng truy cập.'
        ],
        statusType: 'IN_PROGRESS',
        thoiGian: '🟡 ĐANG TRIỂN KHAI\n(Hoàn thiện Đợt 1 - trước 05/11/2026)'
      },
      {
        stt: '5',
        hangMuc: 'Cơ hội hợp tác',
        vanDe: 'Cần tra cứu được theo ngành nghề; thông tin cơ hội cần thu gọn.',
        mucDich: 'Doanh nghiệp tìm đúng đối tượng cần; các ban quản trị làm việc thuận lợi.',
        deXuatCLB: 'Bổ sung tra cứu, lọc theo ngành nghề. Giữ ở mức cơ bản: tìm bên mua, bên bán.',
        nguoiGopY: 'Anh Thành\nAnh Tuấn',
        uuTien: 'Cao · Đợt 1',
        giaiPhapViconnect: [
          '• Giải pháp Phân luồng giao thương 2 chiều: Thiết lập bộ lọc trực quan phân tách rõ ràng: "🛒 Bên Mua (Cần mua / Tìm đối tác)" và "📦 Bên Bán (Cung cấp / Bán hàng)" giúp hội viên tìm kiếm chính xác nhu cầu.',
          '• Hệ thống phân loại ngành nghề chuẩn HanoiBA: Tích hợp thanh chọn 10 lĩnh vực kinh doanh trọng điểm giúp kết nối đúng đối tác chỉ trong 1 thao tác.',
          '• Ý tưởng Tinh giản & Chuyển giao số liệu: Đưa toàn bộ các biểu đồ phức tạp sang Trung tâm Thống Kê; trang Cơ hội chỉ giữ giao diện danh sách tinh gọn kèm nút bấm trực tiếp "Gọi điện" hoặc "Đặt lịch hẹn 1-on-1".'
        ],
        statusType: 'IN_PROGRESS',
        thoiGian: '🟡 ĐANG TRIỂN KHAI\n(Hoàn thiện Đợt 1 - trước 05/11/2026)'
      },
      {
        stt: '6',
        hangMuc: 'Giới thiệu hội viên',
        vanDe: 'Chưa có cơ chế giới thiệu và voucher; mục “Quản lý quảng cáo” trên menu quản trị chưa có mô tả trong tài liệu.',
        mucDich: 'Khuyến khích hội viên giới thiệu, mở rộng mạng lưới.',
        deXuatCLB: 'Xây dựng cơ chế giới thiệu theo mô hình người giới thiệu nhận voucher. Nhưng không làm theo mô hình affiliate.',
        nguoiGopY: 'Anh Thành',
        uuTien: 'Trung bình · Đợt 1\n(Cần chốt: voucher, giá trị)',
        giaiPhapViconnect: [
          '• Giải pháp Tối ưu hóa Menu CRM: Thu hồi mục "Quản lý quảng cáo" không phù hợp khỏi menu quản trị CRM để tập trung vào các chức năng cốt lõi.',
          '• Ý tưởng Lan Tỏa Doanh Nhân: Xây dựng cơ chế "Hội Viên Giới Thiệu Hội Viên" dựa trên uy tín và niềm tự hào CLB. Mỗi hội viên được cấp mã mời cá nhân và mã QR định danh riêng.',
          '• Cơ chế Tri Ân Quyền Lợi Thực Chất: Khi hội viên mới hoàn tất thủ tục và đóng phí, hệ thống tự động gửi tặng người giới thiệu 01 "Voucher Đặc Quyền VIP" (ưu đãi sự kiện lớn, tài trợ truyền thông). Tuyệt đối không áp dụng mô hình chi trả hoa hồng tiền mặt (affiliate) nhằm bảo toàn nét đẹp văn hóa doanh nhân.'
        ],
        statusType: 'IN_PROGRESS',
        thoiGian: '🟡 ĐANG TRIỂN KHAI\n(Hoàn thiện Đợt 1 - trước 05/11/2026)'
      },
      {
        stt: '7',
        hangMuc: 'Cơ hội & Kết nối',
        vanDe: 'Chưa phân biệt “Cơ hội” (chưa phát sinh doanh thu) với “Kết nối” (đã phát sinh doanh thu); chưa ghi nhận giao dịch.',
        mucDich: 'Đo được hiệu quả giao thương thực tế của CLB.',
        deXuatCLB: 'Tách hai trạng thái: Cơ hội và Kết nối. Ghi nhận giao dịch, báo cáo số liệu giao thương.',
        nguoiGopY: 'Chị Phương',
        uuTien: 'Cao · Đợt 1\n(Cần chốt: ai xác nhận)',
        giaiPhapViconnect: [
          '• Giải pháp Phân định 2 giai đoạn giao thương : Phân lập rành mạch "Cơ hội" (Nhu cầu ban đầu chưa phát sinh tiền tệ) với "Kết nối B2B 1-on-1" (Đã gặp gỡ, xúc tiến đàm phán hợp đồng).',
          '• Cơ chế Xác Thực Hợp Đồng Chéo (Cross-Confirmation): Một bên nhập giá trị hợp đồng thành công (VNĐ) -> Hệ thống gửi yêu cầu xác nhận sang đối tác -> Con số chỉ được ghi nhận vào tổng doanh số giao thương của CLB khi cả hai bên cùng bấm xác nhận.',
          '• Ý tưởng Báo cáo Hiệu quả Thực tế: Cung cấp công cụ đo lường minh bạch giúp Ban Điều Hành nắm bắt chính xác dòng tiền và giá trị thực tế mà CLB mang lại cho các doanh nghiệp.'
        ],
        statusType: 'IN_PROGRESS',
        thoiGian: '🟡 ĐANG TRIỂN KHAI\n(Hoàn thiện Đợt 1 - trước 05/11/2026)'
      }
    ]
  },
  // C. SỰ KIỆN & SINH HOẠT
  {
    group: 'C. SỰ KIỆN & SINH HOẠT',
    items: [
      {
        stt: '8',
        hangMuc: 'Đăng ký, mua vé & thanh toán',
        vanDe: 'E-Ticket hiện chỉ gửi qua email; chưa có Zalo OA và VNPAY.',
        mucDich: 'Thuận tiện thanh toán; hội viên nhận thông tin kịp thời trên kênh quen thuộc.',
        deXuatCLB: 'Sau khi mua vé: xác nhận thông tin và thông báo về Zalo. Gửi thông báo đồng thời trên app và Zalo. Tích hợp VNPAY vào Zalo OA để thanh toán.',
        nguoiGopY: 'BĐH / Ban Thư ký',
        uuTien: 'Cao · Đợt 1\n(Cần chốt: pháp nhân VNPAY)',
        giaiPhapViconnect: [
          '• Giải pháp Vé Điện Tử Chống Rơi Vào Spam: Cấu hình hệ thống gửi vé QR qua Email với kỹ thuật Inline CID Attachment, đảm bảo vé hiển thị ảnh đẹp mắt ngay lập tức, không bị chặn ảnh hay rơi vào hộp thư rác.',
          '• Giải pháp Tích hợp Đa Kênh Zalo Notification Service (ZNS): Đề xuất tự động bắn thông báo xác nhận vé và mã QR Check-in trực tiếp vào Zalo cá nhân của hội viên ngay khi có biến động thanh toán.',
          '• Cổng thanh toán tự động VNPAY-QR: Sẵn sàng kiến trúc cổng thanh toán trực tuyến bảo mật, hỗ trợ quét mã VietQR tự động khớp tiền và nội dung chuyển khoản, tích hợp VNPAY Merchant ngay khi CLB bàn giao thông tin pháp nhân.'
        ],
        statusType: 'PLANNED',
        thoiGian: '🔵 KẾ HOẠCH TIẾP THEO\n(Đợt 1: Phối hợp kết nối trước 10/11/2026)'
      },
      {
        stt: '9',
        hangMuc: 'Check-in',
        vanDe: 'Check-in chưa gắn với lợi ích cụ thể cho hội viên.',
        mucDich: 'Khuyến khích hội viên tham gia, có dữ liệu tham dự.',
        deXuatCLB: 'Phát triển hai dòng tính năng check-in gắn với lợi ích hội viên.',
        nguoiGopY: 'BĐH',
        uuTien: 'Cần làm rõ\n(Cần chốt: 2 dòng lợi ích)',
        giaiPhapViconnect: [
          '• Ý tưởng Kiến Tạo 2 Dòng Giá Trị Đột Phá Cho Check-in:\n- Dòng 1 (Live Event Networking): Quét QR Check-in lập tức hiển thị huy hiệu xanh [✓ Đã Check-in] trên Mạng lưới và mở khóa Danh bạ đại biểu đang có mặt, cho phép các doanh nhân tìm thấy nhau và gửi lời mời kết nối tức thì.\n- Dòng 2 (Điểm Chuyên Cần & Gamification): Tự động cộng điểm hoạt động vào hồ sơ cá nhân để tích lũy chiết khấu niên liễm, đồng thời mã check-in trở thành mã số may mắn tham gia Vòng quay may mắn (Lucky Draw) trúng quà tặng tài trợ từ các hội viên trong sự kiện.'
        ],
        statusType: 'IN_PROGRESS',
        thoiGian: '🟡 ĐANG TRIỂN KHAI\n(Hoàn thiện Đợt 1 - trước 05/11/2026)'
      },
      {
        stt: '10',
        hangMuc: 'Lịch họp & điều kiện gia nhập',
        vanDe: 'Lịch họp chưa kèm thống kê, thông báo. Chưa có tiêu chí gia nhập gắn với buổi họp mở đầu.',
        mucDich: 'Đánh giá mức độ gặp gỡ giữa hội viên; đặt điều kiện gia nhập rõ ràng.',
        deXuatCLB: 'Lịch họp kèm thống kê tham dự và thông báo. Hội viên mới phải tham gia buổi họp mở đầu (ví dụ buổi training) mới đủ điều kiện vào CLB.',
        nguoiGopY: 'Chị Phương',
        uuTien: 'Trung bình · Đợt 1',
        giaiPhapViconnect: [
          '• Giải pháp Số hóa Lịch họp & Đào tạo chuyên sâu: Tích hợp phân hệ quản trị lịch họp các ban chuyên môn và chương trình đào tạo doanh nghiệp, tự động phát sinh link đăng ký công khai và mã QR điểm danh buổi họp.',
          '• Ý tưởng Chuẩn Hóa Phễu Onboarding Tự Động: Ứng viên gia nhập CLB nộp hồ sơ sẽ ở trạng thái "Chờ Onboarding". Hệ thống đặt điều kiện bắt buộc ứng viên phải tham gia và quét QR check-in tại ít nhất 01 buổi đào tạo định hướng (Orientation Meeting) thì hồ sơ mới tự động chuyển sang trạng thái "Đủ điều kiện xét duyệt chính thức" để Ban Thư Ký trình Ban Điều Hành phê duyệt.',
          '• Báo cáo chuyên cần theo ban: Thống kê tỷ lệ tham dự định kỳ của từng ban để Ban Điều Hành kịp thời chấn chỉnh.'
        ],
        statusType: 'IN_PROGRESS',
        thoiGian: '🟡 ĐANG TRIỂN KHAI\n(Hoàn thiện Đợt 1 - trước 05/11/2026)'
      }
    ]
  },
  // D. QUẢN TRỊ HỘI VIÊN & BÁO CÁO (CRM)
  {
    group: 'D. QUẢN TRỊ HỘI VIÊN & BÁO CÁO (CỔNG QUẢN TRỊ CRM)',
    items: [
      {
        stt: '11',
        hangMuc: 'Dữ liệu hội viên',
        vanDe: 'Thông tin trong file thành viên cần chính xác; ngày sinh chưa cập nhật đầy đủ.',
        mucDich: 'Làm nền cho chăm sóc hội viên và các báo cáo.',
        deXuatCLB: 'Rà soát, chuẩn hóa hồ sơ hội viên. Cập nhật đầy đủ ngày sinh.',
        nguoiGopY: 'Chị Phương',
        uuTien: 'Cao · Trước khi triển khai rộng\n(Ban Thư ký thực hiện)',
        giaiPhapViconnect: [
          '• Bộ công cụ Chuẩn Hóa & Nhập Liệu Thông Minh: Cung cấp tính năng nạp dữ liệu Excel linh hoạt, tự động nhận diện và đối soát lỗi sai các trường thông tin: Ngày sinh, Ban chuyên môn, Chức vụ, Mã số thuế doanh nghiệp.',
          '• Cơ chế Chăm sóc & Nhắc nhở tự động: Ứng dụng tự động gửi thông báo dịu dàng nhắc hội viên cập nhật ngày sinh để nhận lời chúc và quà tặng tri ân đặc biệt từ Chủ Tịch và CLB.',
          '• Cam kết đồng hành kỹ thuật: ViConnect bố trí nhân sự kỹ thuật chuyên trách phối hợp trực tiếp cùng Ban Thư Ký để rà soát, làm sạch và nạp toàn bộ danh sách hội viên hoàn tất trong vòng 24h kể từ khi tiếp nhận file.'
        ],
        statusType: 'PLANNED',
        thoiGian: '🔵 KẾ HOẠCH TIẾP THEO\n(Đợt 1: Hỗ trợ nạp CSDL trước 10/11/2026)'
      },
      {
        stt: '12',
        hangMuc: 'Mức độ tích cực của hội viên',
        vanDe: 'Dashboard chủ yếu là số đếm; chưa có chỉ số tích cực theo hội viên, theo ban; chưa cảnh báo hội viên ít hoạt động.',
        mucDich: 'Biến dữ liệu hoạt động thành công cụ quản trị; kịp thời chăm sóc hội viên ít tham gia.',
        deXuatCLB: 'Chỉ số tham gia sự kiện, họp, giao thương theo từng hội viên và từng ban. Cảnh báo hội viên hoạt động ít để chăm sóc.',
        nguoiGopY: 'Chị Phương\nAnh Tuấn',
        uuTien: 'Cao · Đợt 1\n(Cần chốt ngưỡng ít hoạt động)',
        giaiPhapViconnect: [
          '• Hệ thống Đo lường mức độ hoạt động của Hội Viên trong app: Xây dựng thuật toán nhận diện đa chiều dựa trên: Tần suất tham gia sự kiện, Số lượt kết nối B2B, Giao dịch thành công, Điểm danh họp ban và Đóng góp nội dung.',
          '• Biểu đồ Trực quan hóa Xu hướng (Visual Composed Analytics): Thiết kế đồ thị kết hợp Bar & Line với 2 màu trực quan: Đường xanh thể hiện xu hướng tăng trưởng tích cực, Đường đỏ cảnh báo độ suy giảm. Đặt vinh danh Top 1 Giver trên đỉnh biểu đồ và bục vinh danh Top 3 nằm gọn trên 1 hàng ngang.',
          '• Ý tưởng Cảnh Báo Sớm Hội Viên Trầm Lắng (Early Inactivity Alert): Hệ thống tự động lọc và gắn cờ các hội viên không phát sinh tương tác trong 30-60 ngày, cung cấp nút bấm nhanh (Gọi điện / Gửi Email chăm sóc) để Ban Hội Viên và Ban Thư Ký chủ động liên hệ hỗ trợ kịp thời.'
        ],
        statusType: 'IN_PROGRESS',
        thoiGian: '🟡 ĐANG TRIỂN KHAI\n(Hoàn thiện Đợt 1 - trước 05/11/2026)'
      },
      {
        stt: '13',
        hangMuc: 'Quản lý phí',
        vanDe: 'Chưa có báo cáo phí và nhắc phí theo từng lần.',
        mucDich: 'Theo dõi, thu phí đúng hạn.',
        deXuatCLB: 'Báo cáo tình hình đóng phí. Nhắc phí theo từng lần qua Zalo OA, SMS, email.',
        nguoiGopY: 'Chị Phương',
        uuTien: 'Cao · Đợt 1',
        giaiPhapViconnect: [
          '• Quản lý Niên độ & Trạng thái phí thông minh: Tự động theo dõi vòng đời hội phí 365 ngày của từng hội viên, phân loại trực quan 3 nhóm: "Đang hiệu lực", "Sắp đến hạn (còn 30 ngày)" và "Quá hạn nợ phí".',
          '• Thông báo gia hạn chuyên nghiệp tích hợp mã QR: Hệ thống phát hành mẫu thông báo gia hạn lịch sự, tự động chèn mã QR động với đầy đủ số tiền niên liễm và cú pháp chuyển khoản chính xác, giúp kế toán đối soát công nợ tự động.',
          '• Giải pháp mở rộng nhắc nợ đa kênh: Sẵn sàng kiến trúc gửi tin nhắn tự động nhắc phí qua Zalo OA (ZNS) và SMS Brandname khi kết nối Zalo OA, giúp tăng tỷ lệ thu phí đúng hạn lên trên 95%.'
        ],
        statusType: 'IN_PROGRESS',
        thoiGian: '🟡 ĐANG TRIỂN KHAI\n(Hoàn thiện Đợt 1 - trước 05/11/2026)'
      },
      {
        stt: '14',
        hangMuc: 'Báo cáo tháng/quý',
        vanDe: 'Chưa có mẫu báo cáo định kỳ.',
        mucDich: 'Ban điều hành nắm tình hình CLB theo từng kỳ.',
        deXuatCLB: 'Thiết kế mẫu báo cáo tháng/quý: tài chính, mức độ tích cực, giao thương và các chỉ tiêu khác.',
        nguoiGopY: 'Chị Phương',
        uuTien: 'Trung bình · Đợt 1',
        giaiPhapViconnect: [
          '• Bộ Báo Cáo Chuẩn Hóa Điều Hành: Thiết kế mẫu báo cáo chuẩn hóa theo kỳ Tháng/Quý/Năm tích hợp đầy đủ 4 trụ cột: Biến động tài chính hội phí, Chỉ số tích cực & chuyên cần, Tổng giá trị giao thương B2B, và Tốc độ phát triển hội viên mới.',
          '• Công nghệ Xuất Bản Đa Định Dạng Tức Thì (Instant Multi-Format Export): Hỗ trợ nút xuất bản Báo cáo in ấn định dạng A4 chuyên nghiệp (đầy đủ phân tích biểu đồ và vị trí phê duyệt của Ban Tài Chính, Ban Hội Viên, Chủ Tịch) và xuất dữ liệu thô Excel (.xlsx) phục vụ lưu trữ kế toán.'
        ],
        statusType: 'IN_PROGRESS',
        thoiGian: '🟡 ĐANG TRIỂN KHAI\n(Hoàn thiện Đợt 1 - trước 05/11/2026)'
      }
    ]
  },
  // E. TRANG CÁ NHÂN
  {
    group: 'E. TRANG CÁ NHÂN',
    items: [
      {
        stt: '15',
        hangMuc: 'Trang cá nhân hội viên',
        vanDe: 'Mới có mục Lịch sử trên trang chủ; chưa có trang tổng hợp sự kiện và cơ hội đã tham gia.',
        mucDich: 'Hội viên xem lại quá trình tham gia; có dữ liệu phục vụ đánh giá.',
        deXuatCLB: 'Tổng hợp trên trang cá nhân: sự kiện, hoạt động đã tham gia; cơ hội giao thương đã tham gia; lịch sử hoạt động.',
        nguoiGopY: 'Chị Dung',
        uuTien: 'Trung bình · Đợt 1',
        giaiPhapViconnect: [
          '• Tái cấu trúc Hồ Sơ Số Toàn Diện: Tinh giản toàn bộ giao diện hồ sơ, định danh rõ nét vị trí doanh nghiệp, chức vụ trong CLB và tích hợp nút chia sẻ danh thiếp số 1 chạm.',
          '• Ý tưởng Dòng Thời Gian Hoạt Động (Member Journey Timeline): Tổng hợp trực quan và đầy đủ toàn bộ hành trình gắn bó của hội viên: Lịch sử các sự kiện đã tham gia, các cơ hội hợp tác đã đăng tải, các hợp đồng giao thương đã khớp lệnh, và các cuộc hẹn kết nối 1-on-1.',
          '• Đồng bộ Nhận diện Sự Kiện: Tự động hiển thị huy hiệu và chủ đề sự kiện/lễ hội đang diễn ra tại CLB để tạo sự gắn kết cộng đồng mạnh mẽ.'
        ],
        statusType: 'IN_PROGRESS',
        thoiGian: '🟡 ĐANG TRIỂN KHAI\n(Hoàn thiện Đợt 1 - trước 05/11/2026)'
      }
    ]
  }
];

function generateDocumentXml() {
  const gridColsXml = colWidths.map(w => `<w:gridCol w:w="${w}"/>`).join('');
  const tblGrid = `<w:tblGrid>${gridColsXml}</w:tblGrid>`;

  let rowsXml = buildHeaderRow();
  data.forEach(grp => {
    rowsXml += buildGroupRow(grp.group);
    grp.items.forEach(item => {
      rowsXml += buildDataRow(item);
    });
  });

  const tblPr = `<w:tblPr><w:tblW w:w="${totalWidth}" w:type="dxa"/><w:tblInd w:w="0" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:color="auto" w:sz="4" w:space="0"/><w:left w:val="single" w:color="auto" w:sz="4" w:space="0"/><w:bottom w:val="single" w:color="auto" w:sz="4" w:space="0"/><w:right w:val="single" w:color="auto" w:sz="4" w:space="0"/><w:insideH w:val="single" w:color="auto" w:sz="4" w:space="0"/><w:insideV w:val="single" w:color="auto" w:sz="4" w:space="0"/></w:tblBorders><w:tblLayout w:type="autofit"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="10" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="10" w:type="dxa"/></w:tblCellMar></w:tblPr>`;

  const tableXml = `<w:tbl>${tblPr}${tblGrid}${rowsXml}</w:tbl>`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:cx="http://schemas.microsoft.com/office/drawing/2014/chartex" xmlns:cx1="http://schemas.microsoft.com/office/drawing/2015/9/8/chartex" xmlns:cx2="http://schemas.microsoft.com/office/drawing/2015/10/21/chartex" xmlns:cx3="http://schemas.microsoft.com/office/drawing/2016/5/9/chartex" xmlns:cx4="http://schemas.microsoft.com/office/drawing/2016/5/10/chartex" xmlns:cx5="http://schemas.microsoft.com/office/drawing/2016/5/11/chartex" xmlns:cx6="http://schemas.microsoft.com/office/drawing/2016/5/12/chartex" xmlns:cx7="http://schemas.microsoft.com/office/drawing/2016/5/13/chartex" xmlns:cx8="http://schemas.microsoft.com/office/drawing/2016/5/14/chartex" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" xmlns:wpsCustomData="http://www.wps.cn/officeDocument/2013/wpsCustomData" mc:Ignorable="w14 w15 wp14">
<w:body>
  <!-- Header -->
  <w:p><w:pPr><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:b/><w:bCs/><w:color w:val="B8860B"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>CLB DOANH NHÂN CEO 1983 (HANOIBA)  ·  ĐƠN VỊ CÔNG NGHỆ VICONNECT</w:t></w:r></w:p>
  <w:p><w:pPr><w:spacing w:after="60"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:b/><w:bCs/><w:color w:val="1F3864"/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr><w:t>BẢNG TỔNG HỢP TIẾP THU Ý KIẾN ĐÓNG GÓP &amp; PHƯƠNG ÁN TRIỂN KHAI NÂNG CẤP HỆ THỐNG CEO 1983</w:t></w:r></w:p>
  <w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:color="B8860B" w:sz="12" w:space="6"/></w:pBdr><w:spacing w:after="140"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:color w:val="475467"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>Căn cứ buổi họp ngày 21/10/2026  ·  Tài liệu [CEO 1983] BÁO CÁO TỔNG HỢP Ý KIẾN HỌP  ·  Ngày lập: 23/10/2026</w:t></w:r></w:p>

  <!-- Section I -->
  <w:p><w:pPr><w:spacing w:before="100" w:after="60"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:b/><w:bCs/><w:color w:val="1F3864"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>I. TỔNG QUAN ĐỐI SOÁT &amp; CAM KẾT TIẾN ĐỘ TỪ VICONNECT (ĐỢT 1)</w:t></w:r></w:p>
  <w:p><w:pPr><w:spacing w:after="60"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:b/><w:bCs/><w:color w:val="1F3864"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">Mục tiêu chung: </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>Đơn giản hóa ứng dụng để hội viên dùng thường xuyên; biến dữ liệu hoạt động thành công cụ quản trị sắc bén cho Ban điều hành.</w:t></w:r></w:p>
  <w:p><w:pPr><w:spacing w:after="60"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:b/><w:bCs/><w:color w:val="1F3864"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">Phạm vi &amp; Tiến độ Đợt 1: </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">Toàn bộ 15 hạng mục thuộc </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:b/><w:bCs/><w:color w:val="1F3864"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>ĐỢT 1</w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">, dự kiến hoàn thành toàn diện trước </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:b/><w:bCs/><w:color w:val="059669"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>05/11/2026</w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>.</w:t></w:r></w:p>
  <w:p><w:pPr><w:spacing w:after="60"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:b/><w:bCs/><w:color w:val="1F3864"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">Phân định 3 trạng thái: </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:b/><w:bCs/><w:color w:val="059669"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>🟢 ĐÃ SẴN SÀNG (02 hạng mục)</w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">  ·  </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:b/><w:bCs/><w:color w:val="D97706"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>🟡 ĐANG TRIỂN KHAI (11 hạng mục)</w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">  ·  </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:b/><w:bCs/><w:color w:val="1D4ED8"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>🔵 KẾ HOẠCH TIẾP THEO (02 hạng mục)</w:t></w:r></w:p>
  <w:p><w:pPr><w:spacing w:after="140"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:b/><w:bCs/><w:color w:val="1F3864"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">Người góp ý: </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>Anh Thành (Phó Tổng Thư ký)  ·  Anh Tuấn (Phó Chủ tịch)  ·  Chị Phương (Phó ban Hội viên)  ·  Chị Dung (Phó Chánh Văn phòng)</w:t></w:r></w:p>

  <!-- Section II -->
  <w:p><w:pPr><w:spacing w:before="140" w:after="100"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:b/><w:bCs/><w:color w:val="1F3864"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>II. BẢNG CHI TIẾT Ý TƯỞNG &amp; GIẢI PHÁP CÔNG NGHỆ VIONE / VICONNECT CHO 15 Ý KIẾN HỌP</w:t></w:r></w:p>

  <!-- TABLE -->
  ${tableXml}

  <!-- Closing Message (1 Line / Paragraph as requested) -->
  <w:p><w:pPr><w:spacing w:before="160" w:after="100" w:line="260" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:i/><w:iCs/><w:sz w:val="18"/><w:szCs w:val="18"/><w:color w:val="1F3864"/></w:rPr><w:t xml:space="preserve">Kính mời các Anh/Chị trong Ban Điều Hành xem xét Bảng đề xuất giải pháp chi tiết đính kèm và cho ý kiến chỉ đạo để ViConnect phối hợp triển khai đạt hiệu quả cao nhất phục vụ Hiệp hội. Trân trọng cảm ơn và kính chúc các Anh/Chị trong Ban Điều Hành luôn dồi dào sức khỏe, chúc CLB Doanh Nhân CEO 1983 ngày càng phát triển vững mạnh!</w:t></w:r></w:p>

  <!-- Signatures -->
  <w:p><w:pPr><w:spacing w:before="200" w:after="40"/><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:i/><w:iCs/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>Hà Nội, ngày 23 tháng 10 năm 2026</w:t></w:r></w:p>
  <w:p><w:pPr><w:spacing w:before="0" w:after="200"/><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:b/><w:bCs/><w:color w:val="1F3864"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>ĐƠN VỊ PHÁT TRIỂN CÔNG NGHỆ VICONNECT   </w:t></w:r></w:p>

  <!-- Page Setup (Landscape A4) -->
  <w:sectPr>
    <w:footerReference r:id="rId3" w:type="default"/>
    <w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>
    <w:pgMar w:top="700" w:right="850" w:bottom="700" w:left="850" w:header="708" w:footer="708" w:gutter="0"/>
    <w:cols w:space="720" w:num="1"/>
    <w:docGrid w:linePitch="360" w:charSpace="0"/>
  </w:sectPr>
</w:body>
</w:document>`;
}

async function main() {
  const origPath = path.join(__dirname, '../document/[CEO 1983] BÁO CÁO TỔNG HỢP Ý KIẾN HỌP (1).docx');
  const targetPaths = [
    path.join(__dirname, '../document/[CEO 1983] BÁO CÁO TỔNG HỢP Ý KIẾN VÀ PHƯƠNG ÁN XỬ LÝ - VICONNECT (1).docx'),
    path.join(__dirname, '../document/[CEO 1983] BÁO CÁO TỔNG HỢP Ý KIẾN VÀ PHƯƠNG ÁN XỬ LÝ - VICONNECT (BẢN CHUẨN ĐẦY ĐỦ).docx'),
    path.join(__dirname, '../document/BANG_TONG_HOP_TIEP_THU_Y_KIEN_VA_GIAI_PHAP_VICONNECT (BẢN CHUẨN).docx'),
    path.join(__dirname, '../document/[CEO 1983] BÁO CÁO TỔNG HỢP Ý KIẾN VÀ PHƯƠNG ÁN XỬ LÝ - VICONNECT.docx'),
    path.join(__dirname, '../document/BANG_TONG_HOP_TIEP_THU_Y_KIEN_VA_GIAI_PHAP_VICONNECT.docx')
  ];

  const content = fs.readFileSync(origPath);
  const zip = await JSZip.loadAsync(content);

  const newDocXml = generateDocumentXml();
  zip.file('word/document.xml', newDocXml);

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  for (const p of targetPaths) {
    try {
      fs.writeFileSync(p, buffer);
      console.log('Successfully written:', p, 'Size:', buffer.length);
    } catch (err) {
      console.warn('Could not write to (may be open in Word):', p, err.message);
    }
  }
}

main().catch(console.error);
