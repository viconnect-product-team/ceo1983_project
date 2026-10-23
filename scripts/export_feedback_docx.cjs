const fs = require('fs');
const path = require('path');
const docx = require('docx');
const {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeadingLevel,
  TextRun,
  AlignmentType,
  BorderStyle,
  PageOrientation
} = docx;

// Helper to create borders
const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: 'BFC8D6' };
const cellBorders = {
  top: thinBorder,
  bottom: thinBorder,
  left: thinBorder,
  right: thinBorder
};

function createCell(paragraphs, width, shading = null, gridSpan = null, vAlign = 'top') {
  const opts = {
    children: Array.isArray(paragraphs) ? paragraphs : [paragraphs],
    width: { size: width, type: WidthType.DXA },
    borders: cellBorders,
    margins: { top: 80, bottom: 80, left: 100, right: 100 }
  };
  if (shading) {
    opts.shading = { fill: shading };
  }
  if (gridSpan) {
    opts.columnSpan = gridSpan;
  }
  return new TableCell(opts);
}

function headerCell(text, width) {
  return createCell(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text,
          bold: true,
          color: 'FFFFFF',
          size: 17,
          font: 'Arial'
        })
      ]
    }),
    width,
    '1F3864'
  );
}

function groupHeaderRow(groupTitle, totalWidth = 15398) {
  return new TableRow({
    children: [
      createCell(
        new Paragraph({
          children: [
            new TextRun({
              text: groupTitle,
              bold: true,
              color: '1F3864',
              size: 19,
              font: 'Arial'
            })
          ]
        }),
        totalWidth,
        'DCE6F2',
        9
      )
    ]
  });
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
          '• Rút gọn khu vực phím tắt mặc định còn đúng 4 tính năng cốt lõi: Lịch Sự Kiện, Danh Bạ Hội Viên, Cơ Hội Giao Thương, và Tin Nhắn / Góc Hội Viên.',
          '• Tích hợp modal CustomHomeShortcutsModal: Cho phép từng hội viên linh hoạt tùy biến chọn 4 phím tắt theo thói quen sử dụng cá nhân.',
          '• Bổ sung dải Ticker nến thị trường cơ hội Realtime và Slider Sàn B2B nổi bật để tăng tương tác hàng ngày.',
          '• Đưa Hội phí, Biểu quyết, Đặc quyền vào phân hệ chuyên biệt.'
        ],
        thoiGian: 'ĐÃ HOÀN THÀNH 100%\n(Sẵn sàng nghiệm thu trên app)'
      },
      {
        stt: '2',
        hangMuc: 'Thẻ hội viên',
        vanDe: 'Chưa có tùy chọn ẩn/hiện email và số điện thoại trên thẻ.',
        mucDich: 'Bảo vệ quyền riêng tư của hội viên.',
        deXuatCLB: 'Thêm công tắc ẩn/hiện email, số điện thoại. Tinh giản, tối giản giao diện thẻ.',
        nguoiGopY: 'Ban Thư ký / BĐH',
        uuTien: 'Cao · Đợt 1\n(Cần chốt: trường nào ẩn, mặc định)',
        giaiPhapViconnect: [
          '• Bổ sung 2 công tắc gạt độc lập: Ẩn/Hiện Số điện thoại và Ẩn/Hiện Email trên thẻ số cá nhân.',
          '• Khi chia sẻ thẻ công khai ra bên ngoài, các trường bị ẩn sẽ hiển thị huy hiệu trang trọng: "🔒 Đã ẩn theo cài đặt riêng tư của hội viên".',
          '• Tinh giản giao diện Thẻ VIP: Phối màu Royal Obsidian & Amber Gold sang trọng, logo doanh nghiệp góc phải trên, mã QR cá nhân hóa chạm mở popup phóng to tiện quét giao lưu.'
        ],
        thoiGian: 'ĐÃ HOÀN THÀNH 100%'
      },
      {
        stt: '3',
        hangMuc: 'Đặc quyền hội viên',
        vanDe: 'Đang nằm trong khu tính năng nhanh, chưa là tính năng riêng.',
        mucDich: 'Tạo kênh quyền lợi riêng; mở hướng hội viên là gian hàng/gian thương.',
        deXuatCLB: 'Tách thành tính năng riêng. Nghiên cứu mô hình hội viên là gian hàng, gian thương theo kiểu triển lãm.',
        nguoiGopY: 'Anh Tuấn',
        uuTien: 'Trung bình · Đợt 1\n(Cần chốt mô hình triển lãm)',
        giaiPhapViconnect: [
          '• Tách riêng thành phân hệ Kho Đặc Quyền & Ưu Đãi (/association/perks) với mã QR Voucher động dùng tại điểm ưu đãi + tích hợp bản đồ dẫn đường Google Maps.',
          '• Ý tưởng Triển lãm số (Virtual B2B Expo): Nâng cấp Sàn B2B thành "Gian Hàng Doanh Nghiệp Hội Viên" – Mỗi doanh nghiệp có 1 gian hàng số độc quyền hiển thị profile công ty, tối đa 5 sản phẩm/dịch vụ tiêu biểu, chính sách ưu đãi riêng cho hội viên CEO 1983.',
          '• Phân loại theo 10 ngành nghề trọng điểm của HanoiBA, khóa theo MST doanh nghiệp để tránh trùng lặp.'
        ],
        thoiGian: 'Khung màn hình Perks: ĐÃ HOÀN THÀNH\n\nGian hàng số B2B Expo: Hoàn thành trước 28/10/2026 (3 ngày)'
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
          '• Backend Validation: Đếm số sản phẩm hiện hữu; chặn tuyệt đối và trả về thông báo quy định khi doanh nghiệp đã đăng đủ 5 sản phẩm tiêu biểu.',
          '• Frontend UX: Hiển thị thanh đo lường và huy hiệu (X/5 sản phẩm tiêu biểu) giúp hội viên chủ động quản trị sản phẩm uy tín nhất.',
          '• Tự động nén ảnh chuẩn WebP siêu nhẹ giúp tải mượt mà trên mọi thiết bị và tiết kiệm dung lượng máy chủ CLB.'
        ],
        thoiGian: 'ĐÃ HOÀN THÀNH 100%'
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
          '• Bổ sung công tắc lọc 3 trạng thái rõ ràng: "Tất cả", "🛒 Bên mua (Cần mua / Tìm đối tác)", "📦 Bên bán (Cung cấp / Bán hàng)".',
          '• Thanh trượt chọn nhanh 10 ngành nghề trọng điểm của Hiệp hội.',
          '• Tinh giản giao diện: Chuyển toàn bộ biểu đồ sang Trung tâm Thống kê, trang này chỉ giữ dải 3 thẻ ngang gọn gàng và danh sách cơ hội hiển thị súc tích kèm nút Gọi điện / Hẹn gặp 1-1 tức thì.'
        ],
        thoiGian: 'ĐÃ HOÀN THÀNH 100%'
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
          '• Xóa bỏ mục "Quản lý quảng cáo" thừa trên menu CRM.',
          '• Xây dựng tính năng "Mời Hội Viên & Nhận Voucher Tri Ân" (Non-affiliate): Cung cấp mã định danh và link/QR giới thiệu riêng cho từng hội viên (/register?ref={member_code}).',
          '• Khi hội viên mới hoàn tất đăng ký, được BĐH phê duyệt và đóng hội phí, hệ thống tự động bắn 01 Voucher Quyền Lợi (ưu đãi sự kiện, voucher tài trợ) vào kho Perks của người giới thiệu.',
          '• Tuyệt đối không chi trả tiền mặt hoa hồng (không affiliate) để giữ gìn nét đẹp văn hóa Hiệp hội.'
        ],
        thoiGian: 'Dự kiến hoàn thành ngày 27/10/2026 (2 ngày làm việc)'
      },
      {
        stt: '7',
        hangMuc: 'Cơ hội & Kết nối',
        vanDe: 'Chưa phân biệt “Cơ hội” (chưa phát sinh doanh thu) với “Kết nối” (đã phát sinh doanh thu); chưa ghi nhận giao dịch.',
        mucDich: 'Đo được hiệu quả giao thương thực tế của CLB.',
        deXuatCLB: 'Tách hai trạng thái: Cơ hội và Kết nối. Ghi nhận giao dịch, báo cáo số liệu giao thương.',
        nguoiGopY: 'Chị Phương',
        uuTien: 'Cao · Đợt 3\n(Cần chốt: ai xác nhận)',
        giaiPhapViconnect: [
          '• Phân lập 2 phân hệ độc lập: Tách rõ "Cơ hội" (Nhu cầu ban đầu) vs "Kết nối B2B 1-on-1" (/association/connect).',
          '• Cơ chế ghi nhận Deal thực tế: Khi hai bên đàm phán thành công, một bên nhấn "Ghi nhận giao dịch thành công" -> Nhập giá trị hợp đồng (VNĐ) -> Hệ thống gửi xác nhận chéo sang đối tác.',
          '• Khi đối tác bấm xác nhận, số tiền tự động tích lũy vào Báo cáo doanh thương của CLB trên CRM & App Mobile.'
        ],
        thoiGian: 'ĐÃ HOÀN THÀNH 100%\n(Vượt tiến độ Đợt 3)'
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
        uuTien: 'Cao · Đợt 2\n(Cần chốt: pháp nhân VNPAY)',
        giaiPhapViconnect: [
          '• Hiện tại: Đã hoàn thiện gửi vé E-Ticket qua Email dưới dạng Attachment Inline CID (không bị chặn ảnh) kèm mã VietQR tự động điền tiền và nội dung chuyển khoản.',
          '• Tích hợp Zalo Notification Service (ZNS): Gửi tin nhắn xác nhận kèm vé QR trực tiếp về Zalo của hội viên ngay khi thanh toán.',
          '• Tích hợp Cổng thanh toán VNPAY: Sẵn sàng module kết nối API VNPAY-QR ngay khi CLB cung cấp thông tin tài khoản Merchant của Hiệp hội/CLB.'
        ],
        thoiGian: 'Dự kiến hoàn thành ngày 30/10/2026 (Đợt 2 - sau khi CLB bàn giao tài khoản Zalo OA & VNPAY)'
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
          '• Đề xuất & hiện thực hóa 2 Dòng Lợi Ích Check-in Đột Phá:',
          '  1. Dòng 1 - Lợi Ích Kết Nối Mạng Lưới Tức Thì (Networking): Quét QR Check-in lập tức hiển thị huy hiệu xanh [✓ Đã Check-in] trên Bảng tin Mạng lưới, mở quyền xem danh bạ toàn bộ đại biểu đang có mặt trong sự kiện để nhắn tin và hẹn gặp 1-1 ngay tại hội trường.',
          '  2. Dòng 2 - Lợi Ích Điểm Thưởng & Quay Số May Mắn (Lucky Draw): Check-in là điều kiện duy nhất để mở quyền quay số may mắn LuckyDraw trúng quà tài trợ, đồng thời tự động tích lũy điểm chuyên cần để chiết khấu hội phí niên độ sau.'
        ],
        thoiGian: 'Dòng 1 (Tag Check-in & Mạng lưới): ĐÃ HOÀN THÀNH\n\nDòng 2 (Cộng điểm chuyên cần & Lucky Draw): Hoàn thành trước 29/10/2026'
      },
      {
        stt: '10',
        hangMuc: 'Lịch họp & điều kiện gia nhập',
        vanDe: 'Lịch họp chưa kèm thống kê, thông báo. Chưa có tiêu chí gia nhập gắn với buổi họp mở đầu.',
        mucDich: 'Đánh giá mức độ gặp gỡ giữa hội viên; đặt điều kiện gia nhập rõ ràng.',
        deXuatCLB: 'Lịch họp kèm thống kê tham dự và thông báo. Hội viên mới phải tham gia buổi họp mở đầu (ví dụ buổi training) mới đủ điều kiện vào CLB.',
        nguoiGopY: 'Chị Phương',
        uuTien: 'Trung bình',
        giaiPhapViconnect: [
          '• Phân hệ Quản trị Đào tạo & Họp ban ([NODE-CRM-018] & [NODE-APP-016]) cho phép tạo các buổi họp/training mở đầu, phát sinh link đăng ký mở và mã QR điểm danh động.',
          '• Ràng buộc tự động: Hội viên mới nộp hồ sơ ở trạng thái "Chờ Onboarding"; sau khi quét mã check-in tại buổi họp mở đầu, hệ thống tự động đổi trạng thái sang "Đủ điều kiện xét duyệt chính thức" để Ban Thư Ký trình BĐH duyệt.',
          '• Thống kê chi tiết tỷ lệ có mặt theo từng ban chuyên môn.'
        ],
        thoiGian: 'ĐÃ HOÀN THÀNH 100%'
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
          '• Xây dựng sẵn bộ công cụ Import/Export Excel thông minh tại /members, hỗ trợ đầy đủ các trường: Ngày sinh, CCCD, MST, Ban chuyên môn, Chức vụ.',
          '• Tự động gửi thông báo trên App Mobile nhắc hội viên cập nhật ngày sinh để nhận quà sinh nhật từ CLB.',
          '• Viconnect cam kết cử chuyên viên kỹ thuật phối hợp cùng Ban Thư Ký rà soát và import dữ liệu vào CSDL ngay khi nhận được file danh sách chuẩn.'
        ],
        thoiGian: 'Công cụ kỹ thuật: ĐÃ HOÀN THÀNH\n\nHỗ trợ nạp dữ liệu: Hoàn tất trong 24h kể từ khi Ban Thư Ký bàn giao file (trước 26/10/2026)'
      },
      {
        stt: '12',
        hangMuc: 'Mức độ tích cực của hội viên',
        vanDe: 'Dashboard chủ yếu là số đếm; chưa có chỉ số tích cực theo hội viên, theo ban; chưa cảnh báo hội viên ít hoạt động.',
        mucDich: 'Biến dữ liệu hoạt động thành công cụ quản trị; kịp thời chăm sóc hội viên ít tham gia.',
        deXuatCLB: 'Chỉ số tham gia sự kiện, họp, giao thương theo từng hội viên và từng ban. Cảnh báo hội viên hoạt động ít để chăm sóc.',
        nguoiGopY: 'Chị Phương\nAnh Tuấn',
        uuTien: 'Cao · Đợt 3\n(Cần chốt ngưỡng ít hoạt động)',
        giaiPhapViconnect: [
          '• Tái cấu trúc Trung tâm Thống kê 5 Phân loại nghiệp vụ: Doanh thu B2B, Hội viên mới, Kết nối B2B, Điểm danh họp, Đào tạo.',
          '• Biểu đồ Composed Chart trực quan: Đường xanh (tăng trưởng tích cực), Đường đỏ (suy giảm biến động).',
          '• Ghim Avatar Top 1 Giver viền vàng trên đỉnh biểu đồ, bục vinh danh Top 3 nằm gọn trên 1 hàng ngang.',
          '• Bảng lọc tự động "Hội viên ít hoạt động" (điểm tương tác = 0 trong 30-60 ngày) kèm nút bấm gọi điện/email nhanh giúp Ban Hội viên chăm sóc kịp thời.'
        ],
        thoiGian: 'ĐÃ HOÀN THÀNH 100%\n(Vượt tiến độ Đợt 3)'
      },
      {
        stt: '13',
        hangMuc: 'Quản lý phí',
        vanDe: 'Chưa có báo cáo phí và nhắc phí theo từng lần.',
        mucDich: 'Theo dõi, thu phí đúng hạn.',
        deXuatCLB: 'Báo cáo tình hình đóng phí. Nhắc phí theo từng lần qua Zalo OA, SMS, email.',
        nguoiGopY: 'Chị Phương',
        uuTien: 'Cao · Đợt 2',
        giaiPhapViconnect: [
          '• Hệ thống tự động tính niên độ 1 năm (term_end), phân nhóm rõ: Còn hạn, Sắp đến hạn (30 ngày), Quá hạn nợ phí (/renewal).',
          '• Nút "Gửi thông báo gia hạn" tự động phát hành Email chuyên nghiệp kèm mã VietQR đóng phí niên độ chuẩn xác số tiền và nội dung chuyển khoản.',
          '• Báo cáo tài chính thu chi dòng tiền minh bạch tại /finance-report.',
          '• Sẵn sàng bắn tin nhắc phí qua Zalo ZNS / SMS khi kết nối Zalo OA ở Đợt 2.'
        ],
        thoiGian: 'Quản trị & Email: ĐÃ HOÀN THÀNH 100%\n\nKênh Zalo OA/SMS: Hoàn thành ngày 30/10/2026 (Đợt 2)'
      },
      {
        stt: '14',
        hangMuc: 'Báo cáo tháng/quý',
        vanDe: 'Chưa có mẫu báo cáo định kỳ.',
        mucDich: 'Ban điều hành nắm tình hình CLB theo từng kỳ.',
        deXuatCLB: 'Thiết kế mẫu báo cáo tháng/quý: tài chính, mức độ tích cực, giao thương và các chỉ tiêu khác.',
        nguoiGopY: 'Chị Phương',
        uuTien: 'Trung bình · Đợt 3',
        giaiPhapViconnect: [
          '• Tích hợp trực tiếp chức năng "Xuất Báo Cáo A4" và "Xuất File Excel" trên cả màn Thống Kê (/analytics) và Tài Chính (/finance-report).',
          '• Báo cáo định dạng đóng khung trang trọng, có phân tích biểu đồ, tỷ lệ tăng trưởng và sẵn sàng vị trí ký duyệt của Trưởng Ban Tài Chính, Trưởng Ban Hội Viên và Chủ Tịch CLB theo từng kỳ Tháng/Quý/Năm.'
        ],
        thoiGian: 'ĐÃ HOÀN THÀNH 100%\n(Vượt tiến độ Đợt 3)'
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
        uuTien: 'Trung bình',
        giaiPhapViconnect: [
          '• Nâng cấp toàn diện Hồ Sơ Cá Nhân Hội Viên ([NODE-APP-011] /association/profile): Tinh giản header, định danh lãnh đạo trang trọng kèm nút chia sẻ danh thiếp nhanh.',
          '• Tích hợp đầy đủ các danh mục lịch sử: Các sự kiện đã điểm danh tham gia, các cơ hội đã chia sẻ, các deal đã chốt thành công, lịch sử cuộc hẹn B2B 1-on-1.',
          '• Bổ sung thẻ trạng thái đồng bộ Theme CRM thời gian thực để hội viên nắm bắt các chiến dịch lễ hội của Hiệp hội.'
        ],
        thoiGian: 'ĐÃ HOÀN THÀNH 100%'
      }
    ]
  }
];

const colWidths = [600, 1500, 2100, 1500, 2100, 1000, 1200, 3500, 1898];

const headerRow = new TableRow({
  children: [
    headerCell('STT', colWidths[0]),
    headerCell('Hạng mục', colWidths[1]),
    headerCell('Vấn đề cần sửa (Ý kiến CLB)', colWidths[2]),
    headerCell('Mục đích', colWidths[3]),
    headerCell('Đề xuất giải pháp (CLB)', colWidths[4]),
    headerCell('Người góp ý', colWidths[5]),
    headerCell('Ưu tiên · Ghi chú', colWidths[6]),
    headerCell('Giải Pháp & Ý Tưởng Cải Tiến Từ Viconnect', colWidths[7]),
    headerCell('Thời Gian Hoàn Thành & Trạng Thái', colWidths[8])
  ]
});

const tableRows = [headerRow];

data.forEach(grp => {
  tableRows.push(groupHeaderRow(grp.group));
  grp.items.forEach(item => {
    // Determine cell styling
    const isCompleted = item.thoiGian.includes('ĐÃ HOÀN THÀNH');
    const statusColor = isCompleted ? '059669' : 'D97706';

    const solutionParagraphs = item.giaiPhapViconnect.map(p =>
      new Paragraph({
        spacing: { before: 20, after: 40, line: 240 },
        children: [
          new TextRun({
            text: p,
            size: 16,
            font: 'Arial'
          })
        ]
      })
    );

    const statusParagraphs = item.thoiGian.split('\n').map((line, idx) =>
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 20, after: 20, line: 220 },
        children: [
          new TextRun({
            text: line,
            bold: idx === 0,
            color: idx === 0 ? statusColor : '555555',
            size: idx === 0 ? 16 : 14,
            font: 'Arial'
          })
        ]
      })
    );

    const r = new TableRow({
      children: [
        createCell(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: item.stt, bold: true, size: 16, font: 'Arial', color: '1F3864' })]
          }),
          colWidths[0]
        ),
        createCell(
          new Paragraph({
            children: [new TextRun({ text: item.hangMuc, bold: true, size: 16, font: 'Arial' })]
          }),
          colWidths[1]
        ),
        createCell(
          new Paragraph({
            children: [new TextRun({ text: item.vanDe, size: 16, font: 'Arial' })]
          }),
          colWidths[2]
        ),
        createCell(
          new Paragraph({
            children: [new TextRun({ text: item.mucDich, size: 16, font: 'Arial' })]
          }),
          colWidths[3]
        ),
        createCell(
          new Paragraph({
            children: [new TextRun({ text: item.deXuatCLB, size: 16, font: 'Arial' })]
          }),
          colWidths[4]
        ),
        createCell(
          new Paragraph({
            children: [new TextRun({ text: item.nguoiGopY, size: 16, font: 'Arial' })]
          }),
          colWidths[5]
        ),
        createCell(
          new Paragraph({
            children: [new TextRun({ text: item.uuTien, size: 15, font: 'Arial', bold: true, color: 'B54708' })]
          }),
          colWidths[6]
        ),
        createCell(solutionParagraphs, colWidths[7]),
        createCell(statusParagraphs, colWidths[8], isCompleted ? 'ECFDF5' : 'FFFBEB')
      ]
    });
    tableRows.push(r);
  });
});

const table = new Table({
  rows: tableRows,
  width: { size: 15398, type: WidthType.DXA }
});

const messageBoxContent = `Kính gửi Chị Thùy Dung, Anh Tuấn, Anh Thành, Chị Phương cùng toàn thể các Anh/Chị trong Ban Điều Hành CLB Doanh Nhân CEO 1983,

Thay mặt đội ngũ công nghệ Viconnect, em xin trân trọng cảm ơn Chị Thùy Dung và các Anh/Chị trong Ban Điều Hành đã dành thời gian họp bàn, đóng góp những ý kiến vô cùng sâu sắc, tâm huyết và sát sườn với thực tế vận hành của Hiệp hội trong bản "Báo Cáo Tổng Hợp Ý Kiến Họp" vừa qua ạ!

Viconnect đã đọc rất kỹ từng hạng mục và hoàn toàn thấu hiểu mục tiêu lớn của các Anh/Chị: "Đơn giản hóa ứng dụng để hội viên dùng thường xuyên; biến dữ liệu hoạt động thành công cụ quản trị sắc bén cho Ban Điều Hành".

Để đồng hành kịp thời nhất cùng các kế hoạch của CLB, đội ngũ Viconnect đã chủ động tăng tốc triển khai ngay trong những ngày qua. Em xin phép gửi tới các Anh/Chị Bảng Đối Soát Chi Tiết kèm theo với các kết quả cụ thể như sau ạ:

1. VỀ CÁC HẠNG MỤC CỐT LÕI (ĐÃ HOÀN THÀNH 11/15 HẠNG MỤC - 100% SẴN SÀNG NGHIỆM THU):
- Trang chủ đã rút gọn tinh gọn quanh 4 tính năng cốt lõi (Sự kiện, Danh bạ, Cơ hội, Tin nhắn/Mạng lưới) và cho phép hội viên tự chọn phím tắt theo sở thích.
- Thẻ hội viên đã bổ sung công tắc bảo vệ quyền riêng tư Số điện thoại & Email khi chia sẻ thẻ ra bên ngoài.
- Sàn B2B đã áp dụng giới hạn tối đa 5 sản phẩm tiêu biểu/doanh nghiệp để chống spam và giữ sàn chuẩn mực.
- Cơ hội giao thương đã có bộ lọc 3 trạng thái (Bên mua / Bên bán) cùng 10 ngành nghề trọng điểm.
- Đã tách bạch hoàn toàn phân hệ "Kết nối B2B" độc lập, hỗ trợ ghi nhận giá trị hợp đồng thực tế giữa 2 bên để đo lường doanh thu giao thương của CLB.
- Đã làm lại Trung tâm Thống kê chuyên sâu 5 danh mục, biểu đồ cột đường tăng/giảm, vinh danh Top 1 - Top 3 trên 1 hàng ngang và xuất Báo cáo chuẩn khổ A4 / file Excel.
- Đã hoàn thiện toàn diện Trang cá nhân tổng hợp lịch sử tham gia sự kiện, cơ hội và kết nối 1-on-1.

2. VỀ CÁC HẠNG MỤC CẦN PHỐI HỢP & LỘ TRÌNH ĐỢT 2:
- Cơ chế Giới thiệu hội viên nhận Voucher (Non-affiliate) & Gian hàng số B2B Expo: Viconnect đang hoàn thiện những khâu cuối cùng, dự kiến bàn giao trước ngày 27 - 28/10/2026.
- Tích hợp Zalo OA & VNPAY: Viconnect đã chuẩn bị sẵn sàng module kỹ thuật. Kính đề nghị Ban Thư Ký hỗ trợ kết nối thông tin tài khoản Merchant VNPAY và App ID Zalo OA của Hiệp hội để đội ngũ tích hợp thông báo vé và nhắc phí tự động theo kế hoạch Đợt 2 (hoàn thành trước 30/10/2026).
- Dữ liệu hội viên: Đội ngũ kỹ thuật Viconnect sẵn sàng phối hợp cùng Ban Thư Ký để rà soát, làm sạch và import toàn bộ dữ liệu ngày sinh, thông tin doanh nghiệp vào hệ thống bất cứ lúc nào ạ.

Kính mời các Anh/Chị trong Ban Điều Hành cùng trải nghiệm trực tiếp các tính năng vừa nâng cấp trên ứng dụng và đóng góp thêm ý kiến để Viconnect tiếp tục hoàn thiện sản phẩm đạt chất lượng cao nhất phục vụ Hiệp hội.

Trân trọng cảm ơn và kính chúc các Anh/Chị nhiều sức khỏe, chúc CLB Doanh Nhân CEO 1983 ngày càng phát triển vững mạnh!`;

const messageParagraphs = messageBoxContent.split('\n').map(line =>
  new Paragraph({
    spacing: { before: 40, after: 40, line: 250 },
    children: [
      new TextRun({
        text: line,
        size: 18,
        font: 'Arial',
        color: line.startsWith('1.') || line.startsWith('2.') ? '1F3864' : '333333',
        bold: line.startsWith('Kính gửi') || line.startsWith('1.') || line.startsWith('2.') || line.startsWith('Trân trọng')
      })
    ]
  })
);

const messageTable = new Table({
  rows: [
    new TableRow({
      children: [
        createCell(messageParagraphs, 15398, 'F8FAFC')
      ]
    })
  ],
  width: { size: 15398, type: WidthType.DXA }
});

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          size: {
            orientation: PageOrientation.LANDSCAPE,
            width: 16838,
            height: 11906
          },
          margin: {
            top: 720,
            bottom: 720,
            left: 720,
            right: 720
          }
        }
      },
      children: [
        // Title Header
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 60 },
          children: [
            new TextRun({
              text: 'CLB DOANH NHÂN CEO 1983 (HANOIBA)  ·  ĐƠN VỊ CÔNG NGHỆ VICONNECT',
              bold: true,
              size: 20,
              font: 'Arial',
              color: '555555'
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 120 },
          children: [
            new TextRun({
              text: 'BẢNG TỔNG HỢP TIẾP THU Ý KIẾN ĐÓNG GÓP & PHƯƠNG ÁN TRIỂN KHAI NÂNG CẤP HỆ THỐNG CEO 1983',
              bold: true,
              size: 28,
              font: 'Arial',
              color: '1F3864'
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 180 },
          children: [
            new TextRun({
              text: 'Kính gửi: Ban Điều Hành & Ban Thư Ký CLB Doanh Nhân CEO 1983  |  Căn cứ cuộc họp ngày 21-22/10/2026  |  Ngày lập: 23/10/2026',
              italics: true,
              size: 18,
              font: 'Arial',
              color: '666666'
            })
          ]
        }),

        // Section I
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({
              text: 'I. TỔNG QUAN ĐỐI SOÁT & CAM KẾT TIẾN ĐỘ TỪ VICONNECT',
              bold: true,
              size: 22,
              font: 'Arial',
              color: '1F3864'
            })
          ]
        }),
        new Paragraph({
          spacing: { before: 0, after: 140, line: 260 },
          children: [
            new TextRun({
              text: 'Đội ngũ Viconnect đã nghiên cứu kỹ lưỡng toàn bộ 15 hạng mục góp ý của các Anh/Chị trong Ban Điều Hành (Anh Thành - Phó Tổng Thư ký, Anh Tuấn - Phó Chủ tịch, Chị Phương - Phó ban Hội viên, Chị Dung - Phó Chánh Văn phòng). Với tinh thần cầu thị và cam kết đồng hành cao nhất cùng Hiệp hội: ',
              size: 18,
              font: 'Arial'
            }),
            new TextRun({
              text: 'Viconnect đã chủ động hoàn thành 11/15 hạng mục cốt lõi ngay trong phiên bản nâng cấp ngày 23/10/2026 (100% sẵn sàng nghiệm thu); 04 hạng mục còn lại đã có thiết kế luồng kỹ thuật chi tiết và cam kết bàn giao chuẩn mốc Đợt 1 và Đợt 2 theo đúng tiến độ.',
              bold: true,
              size: 18,
              font: 'Arial',
              color: '059669'
            })
          ]
        }),

        // Section II: Table
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 120, after: 100 },
          children: [
            new TextRun({
              text: 'II. BẢNG CHI TIẾT 15 Ý KIẾN ĐÓNG GÓP, ĐỀ XUẤT GIẢI PHÁP & THỜI GIAN HOÀN THÀNH',
              bold: true,
              size: 22,
              font: 'Arial',
              color: '1F3864'
            })
          ]
        }),
        table,

        // Section III: Response Message
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 100 },
          children: [
            new TextRun({
              text: 'III. MẪU TIN NHẮN PHẢN HỒI LẠI BAN ĐIỀU HÀNH & CHỊ THÙY DUNG',
              bold: true,
              size: 22,
              font: 'Arial',
              color: '1F3864'
            })
          ]
        }),
        messageTable,

        // Signatures
        new Paragraph({
          spacing: { before: 240, after: 60 },
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: 'Hà Nội, ngày 23 tháng 10 năm 2026',
              italics: true,
              size: 18,
              font: 'Arial'
            })
          ]
        }),
        new Paragraph({
          spacing: { before: 0, after: 400 },
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: 'ĐỘI NGŨ CÔNG NGHỆ VICONNECT   ',
              bold: true,
              size: 20,
              font: 'Arial',
              color: '1F3864'
            })
          ]
        })
      ]
    }
  ]
});

async function main() {
  const buffer = await Packer.toBuffer(doc);
  const outPath1 = path.join(__dirname, '../document/[CEO 1983] BÁO CÁO TỔNG HỢP Ý KIẾN VÀ PHƯƠNG ÁN XỬ LÝ - VICONNECT.docx');
  const outPath2 = path.join(__dirname, '../document/BANG_TONG_HOP_TIEP_THU_Y_KIEN_VA_GIAI_PHAP_VICONNECT.docx');
  fs.writeFileSync(outPath1, buffer);
  fs.writeFileSync(outPath2, buffer);
  console.log('Saved docx successfully:');
  console.log('1.', outPath1, 'Size:', buffer.length);
  console.log('2.', outPath2, 'Size:', buffer.length);
}

main().catch(console.error);
