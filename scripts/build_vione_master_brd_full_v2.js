// scripts/build_vione_master_brd_full_v2.js - Comprehensive Master BRD v5.0
const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  TableOfContents,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  PageBreak,
} = require('docx');

const ROOT_DIR = path.resolve(__dirname, '..');
const VIONE_DOC_DIR = path.join(ROOT_DIR, '..', 'vione_project', 'document');
const CEO_DOC_DIR = path.join(ROOT_DIR, 'document');

const FE_DOCS_DIRS = [
  path.join(ROOT_DIR, '..', 'vione_project', 'apps', 'vione_app_fe', 'public', 'docs'),
  path.join(ROOT_DIR, 'apps', 'ceo1983_app_fe', 'public', 'docs'),
  path.join(ROOT_DIR, 'apps', 'vione_app_fe', 'public', 'docs'),
  VIONE_DOC_DIR,
  CEO_DOC_DIR
];

FE_DOCS_DIRS.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const FONT_FAMILY = 'Times New Roman';
const COLOR_GOLD = 'D97706';
const COLOR_NAVY = '0F172A';
const COLOR_AMBER = 'B45309';
const COLOR_DARK = '1E293B';
const COLOR_BORDER = 'CBD5E1';
const COLOR_BG_HEADER = '0F172A';
const COLOR_BG_ALT = 'F8FAFC';
const TABLE_WIDTH_DXA = 9200;

const BORDER_STYLE_THIN = {
  top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
};

function createParagraph(text, opts = {}) {
  const lines = String(text || '').split('\n');
  const children = [];
  lines.forEach((line, idx) => {
    children.push(
      new TextRun({
        text: line,
        break: idx > 0 ? 1 : 0,
        font: FONT_FAMILY,
        size: opts.size || 24, // 12pt
        bold: opts.bold || false,
        italics: opts.italics || false,
        color: opts.color || COLOR_DARK,
      })
    );
  });
  return new Paragraph({
    alignment: opts.alignment || AlignmentType.LEFT,
    spacing: opts.spacing || { before: 80, after: 80, line: 276 },
    children,
  });
}

function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 140 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 32, // 16pt
        bold: true,
        color: COLOR_NAVY,
      }),
    ],
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 100 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 28, // 14pt
        bold: true,
        color: COLOR_AMBER,
      }),
    ],
  });
}

function createHeading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 25, // 12.5pt
        bold: true,
        color: COLOR_GOLD,
      }),
    ],
  });
}

function createBullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40, line: 260 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 23, // 11.5pt
        color: COLOR_DARK,
      }),
    ],
  });
}

function createTable(headers, rows, colWidths = []) {
  let finalColWidths = colWidths;
  if (!finalColWidths || finalColWidths.length === 0) {
    const colCount = headers.length;
    const avgWidth = Math.floor(TABLE_WIDTH_DXA / colCount);
    finalColWidths = Array(colCount).fill(avgWidth);
  }

  const tableRows = [];

  // Header Row
  const headerCells = headers.map((h, idx) => {
    return new TableCell({
      width: { size: finalColWidths[idx], type: WidthType.DXA },
      shading: { fill: COLOR_BG_HEADER, type: ShadingType.CLEAR },
      borders: BORDER_STYLE_THIN,
      margins: { top: 120, bottom: 120, left: 140, right: 140 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: h,
              font: FONT_FAMILY,
              size: 22, // 11pt
              bold: true,
              color: 'FFFFFF',
            }),
          ],
        }),
      ],
    });
  });
  tableRows.push(new TableRow({ children: headerCells, tableHeader: true }));

  // Data Rows
  rows.forEach((row, rIdx) => {
    const isAlt = rIdx % 2 === 1;
    const cells = row.map((cellText, cIdx) => {
      const isBold = cIdx === 0 && headers.length > 2;
      return new TableCell({
        width: { size: finalColWidths[cIdx], type: WidthType.DXA },
        shading: { fill: isAlt ? COLOR_BG_ALT : 'FFFFFF', type: ShadingType.CLEAR },
        borders: BORDER_STYLE_THIN,
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: String(cellText || ''),
                font: FONT_FAMILY,
                size: 21, // 10.5pt
                bold: isBold,
                color: COLOR_DARK,
              }),
            ],
          }),
        ],
      });
    });
    tableRows.push(new TableRow({ children: cells }));
  });

  return new Table({
    width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: finalColWidths,
    rows: tableRows,
  });
}

// 80 Business Rules Dataset
const BUSINESS_RULES = [
  // 1. CRM & SALES (20 rules)
  ['BR-CRM-01', 'Định danh Khách hàng', 'Mỗi khách hàng doanh nghiệp B2B bắt buộc phải có Mã số thuế (MST) duy nhất; hệ thống tự động ngăn chặn trùng lặp.', 'Nghiêm trọng (Khóa)'],
  ['BR-CRM-02', 'Phân bổ Lead tự động', 'Lead mới từ Landing Page phải được hệ thống phân bổ theo vòng tròn Round-Robin tới Sales trong vòng 60 giây.', 'Cao'],
  ['BR-CRM-03', 'Thời hạn tiếp cận Lead', 'Nhân viên Sales được phân bổ Lead phải thực hiện cuộc gọi hoặc gửi email đầu tiên trong tối đa 15 phút.', 'Nghiêm trọng'],
  ['BR-CRM-04', 'Quy tắc chuyển đổi Deal', 'Lead chỉ được phép chuyển thành Deal khi đã xác thực đủ: Người liên hệ có thẩm quyền, Nhu cầu cụ thể và Ngân sách.', 'Trung bình'],
  ['BR-CRM-05', 'Hạn mức chiết khấu Sales', 'Nhân viên kinh doanh chỉ được chiết khấu tối đa 5%; mức chiết khấu 6-15% phải do Trưởng phòng duyệt, trên 15% phải do CEO duyệt.', 'Nghiêm trọng (Khóa)'],
  ['BR-CRM-06', 'Thời hạn hiệu lực báo giá', 'Mọi báo giá B2B xuất ra hệ thống mặc định có hiệu lực 15 ngày; quá 15 ngày hệ thống tự động khóa không cho ký hợp đồng nếu chưa gia hạn.', 'Cao'],
  ['BR-CRM-07', 'Ghi nhật ký tương tác', 'Mọi cuộc gặp, cuộc gọi với khách hàng phải được cập nhật tóm tắt nội dung vào Activity Timeline trong vòng 24 giờ.', 'Cao'],
  ['BR-CRM-08', 'Cảnh báo nợ khó đòi', 'Khách hàng có khoản nợ quá hạn trên 60 ngày sẽ tự động bị khóa quyền tạo Deal mới hoặc mua thêm hàng hóa/dịch vụ.', 'Nghiêm trọng (Khóa)'],
  ['BR-CRM-09', 'Quyền sở hữu khách hàng', 'Nếu nhân viên Sales không phát sinh bất kỳ tương tác nào với khách hàng trong 45 ngày, quyền sở hữu tự động quay về kho chung.', 'Cao'],
  ['BR-CRM-10', 'Quy định lý do mất Deal', 'Khi chuyển trạng thái Deal sang "Lost", nhân viên bắt buộc phải chọn lý do từ danh mục chuẩn (Giá cao, Thiếu tính năng, Chọn đối thủ...).', 'Bắt buộc'],
  ['BR-CRM-11', 'Tự động tạo mã hợp đồng', 'Số hợp đồng kinh tế được sinh tự động theo định dạng: `HD-{YYYY}-{TENANT}-{STT}` và không được phép sửa tay.', 'Bắt buộc'],
  ['BR-CRM-12', 'Xác thực hai yếu tố báo giá', 'Báo giá có giá trị trên 500 triệu VNĐ khi xuất bản bắt buộc phải xác thực mã OTP gửi về số điện thoại của Kế toán trưởng.', 'Nghiêm trọng'],
  ['BR-CRM-13', 'Bảo mật thông tin liên hệ', 'Chuyên viên chỉ được xem số điện thoại và email của khách hàng do mình phụ trách; không được xem khách hàng của nhóm khác.', 'Nghiêm trọng (Bảo mật)'],
  ['BR-CRM-14', 'Chấm điểm tiềm năng Lead', 'Thuật toán AI tự động tính điểm Lead Score từ 0-100; Lead trên 80 điểm bắt buộc phải ưu tiên xử lý trước.', 'Trung bình'],
  ['BR-CRM-15', 'Tự động gửi email cảm ơn', 'Sau khi ký hợp đồng thành công, hệ thống tự động gửi email chào mừng và thư ngỏ của CEO tới đại diện khách hàng trong 5 phút.', 'Tiêu chuẩn'],
  ['BR-CRM-16', 'Theo dõi giá trị vòng đời LTV', 'Hệ thống tự động cộng dồn doanh số của khách hàng qua mọi năm để cập nhật thứ hạng Hội viên (Bạc, Vàng, Kim Cương).', 'Tiêu chuẩn'],
  ['BR-CRM-17', 'Xuất dữ liệu có kiểm soát', 'Thao tác xuất file Excel khách hàng bị giới hạn tối đa 500 dòng/lần và ghi nhật ký IP, người dùng vào Audit Trail.', 'Nghiêm trọng (Bảo mật)'],
  ['BR-CRM-18', 'Đồng bộ danh bạ di động', 'Dữ liệu khách hàng đồng bộ xuống app di động ViOne Connect phải được mã hóa AES-256 trong bộ nhớ tạm SQLite.', 'Nghiêm trọng (Bảo mật)'],
  ['BR-CRM-19', 'Quy tắc gắn nhãn Tags', 'Mỗi khách hàng phải gắn tối thiểu 01 nhãn ngành nghề và 01 nhãn quy mô doanh nghiệp để phục vụ phân khúc tiếp thị.', 'Bắt buộc'],
  ['BR-CRM-20', 'Khảo sát sau chốt đơn CSAT', 'Sau 7 ngày kể từ khi hợp đồng có hiệu lực, hệ thống tự động kích hoạt tin nhắn khảo sát mức độ hài lòng khách hàng.', 'Tiêu chuẩn'],

  // 2. WORK MANAGEMENT (15 rules)
  ['BR-WRK-01', 'Bắt buộc có người phụ trách', 'Mọi thẻ công việc (Task) tạo ra bắt buộc phải có ít nhất 01 người chịu trách nhiệm chính (Assignee) và 01 Hạn chót (Deadline).', 'Bắt buộc'],
  ['BR-WRK-02', 'Cảnh báo vi phạm tiến độ', 'Trước 2 giờ đến hạn chót, hệ thống tự động gửi thông báo nhắc việc; khi quá hạn, thẻ việc tự động đổi sang màu đỏ rực.', 'Cao'],
  ['BR-WRK-03', 'Quy trình nghiệm thu việc', 'Công việc có tính chất kiểm tra chất lượng chỉ được chuyển sang "Done" khi có sự phê duyệt (Approve) của Quản lý dự án.', 'Cao'],
  ['BR-WRK-04', 'Giới hạn công việc đang làm (WIP)', 'Mỗi nhân viên không được phép có quá 5 công việc ở trạng thái "In Progress" cùng một thời điểm để tránh quá tải.', 'Trung bình'],
  ['BR-WRK-05', 'Kiểm soát hạn mức ngân sách', 'Tổng chi phí thực tế ghi nhận vào các công việc không được vượt quá 100% ngân sách đã duyệt của dự án nếu chưa có phụ lục duyệt thêm.', 'Nghiêm trọng (Khóa)'],
  ['BR-WRK-06', 'Phụ thuộc công việc Gantt', 'Công việc B có liên kết phụ thuộc (Finish-to-Start) với công việc A sẽ không được phép bấm bắt đầu khi công việc A chưa Done.', 'Cao'],
  ['BR-WRK-07', 'Ghi giờ Timesheet thực tế', 'Bản ghi thời gian làm việc (Timesheet) nhập thủ công không được lùi quá 48 giờ so với thời điểm phát sinh.', 'Trung bình'],
  ['BR-WRK-08', 'Bảo quản tệp đính kèm', 'Tệp tin đính kèm vào công việc bị giới hạn dung lượng tối đa 100MB/tệp và tự động quét mã độc virus trước khi lưu.', 'Bảo mật'],
  ['BR-WRK-09', 'Lưu trữ dự án hoàn thành', 'Dự án chỉ được phép chuyển sang trạng thái "Archived" khi 100% công việc con đã đóng và các khoản tạm ứng đã quyết toán.', 'Cao'],
  ['BR-WRK-10', 'Quyền xem Cổng khách Guest', 'Tài khoản khách mời (Guest) chỉ được xem thanh tiến độ tổng thể và mốc Milestone; ẩn 100% tài chính và thảo luận nội bộ.', 'Nghiêm trọng (Bảo mật)'],
  ['BR-WRK-11', 'Tự động tạo việc định kỳ', 'Công việc định kỳ lặp lại theo tuần/tháng sẽ được sinh ra trước 24 giờ so với thời điểm bắt đầu theo lịch cấu hình.', 'Tiêu chuẩn'],
  ['BR-WRK-12', 'Bình luận bất biến', 'Bình luận trao đổi trong thẻ công việc chỉ được phép chỉnh sửa hoặc xóa trong vòng 15 phút kể từ khi gửi; sau 15 phút sẽ khóa bất biến.', 'Kiểm toán'],
  ['BR-WRK-13', 'Xếp hạng ưu tiên công việc', 'Công việc gắn nhãn "Khẩn Cấp" tự động đẩy lên vị trí cao nhất trên bảng Kanban của nhân viên phụ trách.', 'Cao'],
  ['BR-WRK-14', 'Cảnh báo quá tải Workload', 'Nhân sự có tổng số giờ làm việc được giao vượt quá 45 giờ/tuần sẽ bị hệ thống gắn cờ quá tải trên biểu đồ Heatmap.', 'Trung bình'],
  ['BR-WRK-15', 'Tự động đóng nhiệm vụ con', 'Khi chuyển trạng thái công việc cha sang "Done", toàn bộ các mục Checklist con chưa tích chọn sẽ hiển thị hộp thoại xác nhận bắt buộc.', 'Bắt buộc'],

  // 3. HRM & ATTENDANCE (15 rules)
  ['BR-HRM-01', 'Định vị GPS chấm công', 'Tọa độ GPS khi chấm công di động phải nằm trong bán kính tối đa 50 mét so với tọa độ văn phòng/chi nhánh được cấu hình.', 'Nghiêm trọng (Khóa)'],
  ['BR-HRM-02', 'Nhận diện khuôn mặt AI', 'Ảnh nhận diện chấm công phải đạt độ khớp khuôn mặt từ 92% trở lên và phát hiện khuôn mặt sống (Liveness Detection chống ảnh chụp lại).', 'Nghiêm trọng (Chống gian lận)'],
  ['BR-HRM-03', 'Quy tắc đi muộn về sớm', 'Chấm công vào sau giờ quy định 15 phút tính là "Đi muộn"; rời khỏi vị trí trước giờ quy định 15 phút tính là "Về sớm".', 'Cao'],
  ['BR-HRM-04', 'Thời hạn nộp đơn nghỉ phép', 'Đơn xin nghỉ phép năm phải nộp trước tối thiểu 24 giờ đối với nghỉ 1 ngày, và trước tối thiểu 3 ngày đối với nghỉ từ 2 ngày trở lên.', 'Cao'],
  ['BR-HRM-05', 'Cộng dồn quỹ phép năm', 'Mỗi tháng làm việc đủ công được cộng 01 ngày phép năm; ngày phép tồn năm trước chỉ được chuyển tiếp tối đa 5 ngày sang quý 1 năm sau.', 'Tiêu chuẩn'],
  ['BR-HRM-06', 'Phê duyệt làm thêm giờ OT', 'Giờ làm thêm OT chỉ được tính vào bảng lương khi có Đơn đăng ký OT đã được Trưởng phòng phê duyệt trước ca làm việc.', 'Nghiêm trọng'],
  ['BR-HRM-07', 'Khấu trừ thuế TNCN lũy tiến', 'Hệ thống tự động áp dụng biểu thuế thu nhập cá nhân lũy tiến 7 bậc và trừ các khoản giảm trừ gia cảnh chuẩn mực theo luật thuế hiện hành.', 'Pháp lý bắt buộc'],
  ['BR-HRM-08', 'Cảnh báo hết hạn hợp đồng', 'Trước 30 ngày hợp đồng lao động hết hạn, hệ thống tự động gửi thông báo tới Trưởng phòng HR và nhân viên để thực hiện quy trình tái ký.', 'Cao'],
  ['BR-HRM-09', 'Bảo mật phiếu lương E-Payslip', 'Phiếu lương điện tử gửi tới từng nhân viên phải được mã hóa riêng; nghiêm cấm việc nhân viên xem được lương của người khác.', 'Nghiêm trọng (Bảo mật)'],
  ['BR-HRM-10', 'Quy trình thu hồi quyền khi nghỉ', 'Khi nhân viên thôi việc, tài khoản truy cập hệ sinh thái ViOne và thẻ Titanium NFC phải được thu hồi tự động lúc 17:30 ngày làm việc cuối.', 'Nghiêm trọng (Bảo mật)'],
  ['BR-HRM-11', 'Giới hạn giờ OT theo luật', 'Hệ thống tự động chặn đăng ký làm thêm giờ nếu nhân viên đã tích lũy đủ 40 giờ OT trong tháng hoặc 200 giờ OT trong năm.', 'Pháp lý bắt buộc'],
  ['BR-HRM-12', 'Xử lý khiếu nại chấm công', 'Nhân viên có quyền gửi khiếu nại quên chấm công trong vòng 48 giờ kèm lý do và minh chứng để Trưởng phòng xác nhận bổ sung.', 'Trung bình'],
  ['BR-HRM-13', 'Xác thực CCCD gắn chip', 'Hồ sơ nhân sự số hóa bắt buộc phải có ảnh quét CCCD gắn chip 2 mặt và số định danh cá nhân hợp lệ.', 'Bắt buộc'],
  ['BR-HRM-14', 'Khóa bảng chấm công tháng', 'Bảng chấm công toàn công ty tự động khóa vào 23:59 ngày mùng 2 hàng tháng; sau thời điểm này chỉ có Giám đốc HR mới được mở sửa.', 'Nghiêm trọng (Khóa)'],
  ['BR-HRM-15', 'Đổi ca trực linh hoạt', 'Hai nhân viên cùng bộ phận được phép gửi yêu cầu đổi ca trực cho nhau trên app nhưng phải hoàn thành trước giờ vào ca 4 tiếng.', 'Tiêu chuẩn'],

  // 4. FINANCE & CASHFLOW (15 rules)
  ['BR-FIN-01', 'Nguyên tắc phê duyệt chi 3 cấp', 'Mọi khoản chi tiền phải tuân thủ quy trình 3 cấp: Nhân viên đề xuất (Maker) -> Kế toán trưởng kiểm soát (Checker) -> CEO duyệt (Approver).', 'Nghiêm trọng (Kiểm soát)'],
  ['BR-FIN-02', 'Hạn mức phê duyệt theo chức danh', 'Trưởng phòng được duyệt chi dưới 5 triệu; Kế toán trưởng duyệt chi dưới 20 triệu; trên 20 triệu bắt buộc phải do Tổng Giám Đốc ký duyệt.', 'Nghiêm trọng (Khóa)'],
  ['BR-FIN-03', 'Thanh toán VietQR Napas 24/7', 'Mã QR thanh toán phải là mã QR động chuẩn Napas, chứa đúng số tiền và cú pháp giao dịch duy nhất để gạch nợ tự động trong 1 giây.', 'Tiêu chuẩn'],
  ['BR-FIN-04', 'Kiểm soát hạn mức ngân sách', 'Hệ thống tự động từ chối tạo đề xuất chi nếu khoản chi đó làm tổng chi của phòng ban vượt quá 100% ngân sách tháng đã phê duyệt.', 'Nghiêm trọng (Khóa)'],
  ['BR-FIN-05', 'Hạn thời gian quyết toán tạm ứng', 'Nhân viên nhận tiền tạm ứng công tác phải hoàn thành chứng từ quyết toán trong vòng tối đa 7 ngày làm việc sau khi kết thúc chuyến đi.', 'Cao'],
  ['BR-FIN-06', 'Đối soát khớp lệnh ngân hàng', 'Các giao dịch thu chi ngân hàng phải được tự động đối soát với sổ kế toán nội bộ; sai lệch trên 1,000 VNĐ phải được đưa vào danh sách cảnh báo.', 'Cao'],
  ['BR-FIN-07', 'Chống chi trùng hóa đơn', 'Hệ thống tự động quét số hóa đơn và mã cơ quan thuế của hóa đơn đầu vào; phát hiện trùng lặp số hóa đơn sẽ lập tức khóa đề nghị chi.', 'Nghiêm trọng (Chống gian lận)'],
  ['BR-FIN-08', 'Cảnh báo dòng tiền âm dự báo', 'Khi biểu đồ dự phóng dòng tiền 30 ngày tới chạm ngưỡng số dư tối thiểu an toàn (Safety Buffer), hệ thống kích hoạt cảnh báo đỏ gửi CFO.', 'Cao'],
  ['BR-FIN-09', 'Tự động xuất hóa đơn điện tử', 'Hóa đơn điện tử chỉ được phát hành khi giao dịch bán hàng đã nhận đủ 100% tiền thanh toán hoặc có hợp đồng trả chậm được duyệt.', 'Pháp lý bắt buộc'],
  ['BR-FIN-10', 'Bảo toàn quỹ tiền mặt tại két', 'Số dư quỹ tiền mặt tại két văn phòng không được vượt quá định mức 50 triệu VNĐ vào cuối ngày; phần vượt phải nộp vào tài khoản ngân hàng.', 'Cao'],
  ['BR-FIN-11', 'Phân loại dòng tiền 3 hoạt động', 'Toàn bộ phiếu thu chi phải được gắn mã dòng tiền: Hoạt động Kinh doanh (CFO), Hoạt động Đầu tư (CFI), Hoạt động Tài chính (CFF).', 'Bắt buộc'],
  ['BR-FIN-12', 'Thời hạn lưu trữ chứng từ kế toán', 'Toàn bộ ảnh chụp hóa đơn, ủy nhiệm chi, biên bản nghiệm thu điện tử được lưu trữ bất biến trên hệ thống đám mây tối thiểu 10 năm.', 'Pháp lý bắt buộc'],
  ['BR-FIN-13', 'Xác thực OTP lệnh chuyển tiền', 'Lệnh chuyển tiền qua cổng Open Banking ra bên ngoài hệ thống bắt buộc phải xác thực mã Smart OTP trên thiết bị di động của Chủ tài khoản.', 'Nghiêm trọng (Bảo mật)'],
  ['BR-FIN-14', 'Tính điểm hòa vốn tự động', 'Mỗi đầu sản phẩm mới đưa vào kinh doanh bắt buộc phải khai báo biến phí và định phí để hệ thống tự động tính sản lượng hòa vốn.', 'Tiêu chuẩn'],
  ['BR-FIN-15', 'Khóa sổ kế toán định kỳ', 'Sổ nhật ký thu chi tự động khóa vào ngày cuối cùng của tháng; các bút toán điều chỉnh sau thời điểm này phải ghi nhận vào tháng tiếp theo.', 'Kiểm toán'],

  // 5. MOBILE APP & TITANIUM NFC (15 rules)
  ['BR-APP-01', 'Mã hóa chip NFC vật lý', 'Mỗi thẻ Titanium NFC vật lý được nạp một chuỗi token mã hóa duy nhất liên kết với tài khoản; không ghi trực tiếp thông tin nhạy cảm vào chip.', 'Nghiêm trọng (Bảo mật)'],
  ['BR-APP-02', 'Khóa thẻ NFC từ xa tức thì', 'Khi người dùng báo mất thẻ trên app, chip NFC tương ứng phải bị vô hiệu hóa truy cập ngay lập tức trên toàn cầu trong vòng 1 giây.', 'Nghiêm trọng (Bảo mật)'],
  ['BR-APP-03', 'Mã QR Code vé sự kiện động', 'Mã QR soát vé check-in trên ứng dụng phải là mã QR động thay đổi mã bảo mật sau mỗi 30 giây để chống hành vi chụp ảnh màn hình bán lại vé.', 'Chống gian lận'],
  ['BR-APP-04', 'Tốc độ quét check-in cửa', 'Ứng dụng soát vé chuyên dụng của Ban tổ chức phải giải mã và xác thực thông tin đại biểu tại cổng an ninh dưới 0.2 giây/người.', 'Hiệu năng'],
  ['BR-APP-05', 'Xác thực sinh trắc học bắt buộc', 'Mở ứng dụng hoặc thực hiện lệnh thanh toán trên di động bắt buộc phải xác thực qua FaceID, Vân tay hoặc mã PIN 6 số.', 'Bảo mật'],
  ['BR-APP-06', 'Mã hóa trò chuyện đầu cuối', 'Nội dung tin nhắn trò chuyện 1-1 giữa các doanh nhân phải được mã hóa End-to-End Encryption; máy chủ trung gian không thể đọc được nội dung.', 'Bảo mật'],
  ['BR-APP-07', 'Chế độ hoạt động ngoại tuyến Offline', 'Ứng dụng phải lưu trữ danh thiếp cá nhân, vé sự kiện và danh bạ gần nhất trong bộ nhớ cache để hoạt động bình thường khi mất sóng internet.', 'Khả dụng'],
  ['BR-APP-08', 'Quyền riêng tư vị trí GPS', 'Tính năng tìm đối tác gần bạn (GPS Nearby) chỉ chia sẻ khoảng cách ước tính (Ví dụ: 500m) và cho phép người dùng bật chế độ ẩn danh bất kỳ lúc nào.', 'Quyền riêng tư'],
  ['BR-APP-09', 'Kiểm soát số lượng vé sự kiện', 'Hệ thống tự động khóa cổng đăng ký khi số lượng vé phát hành đạt trần sức chứa khán phòng đã thiết lập; tự động chuyển sang hàng đợi chờ.', 'Kiểm soát'],
  ['BR-APP-10', 'Bảo vệ thông tin cá nhân hội viên', 'Số điện thoại và email cá nhân của hội viên chỉ hiển thị cho người khác khi hội viên đó bật công tắc "Cho Phép Hiển Thị Công Khai".', 'Quyền riêng tư'],
  ['BR-APP-11', 'Tự động đồng bộ khi có mạng', 'Mọi thao tác ghi chú, tạo việc ngoại tuyến phải được tự động đẩy lên máy chủ đám mây ngay khi điện thoại kết nối lại internet trong 3 giây.', 'Toàn vẹn dữ liệu'],
  ['BR-APP-12', 'Xác thực tích xanh doanh nhân', 'Huy hiệu Tích Xanh Doanh Nhân chỉ được cấp khi doanh nghiệp đã xác thực giấy phép ĐKKD và CCCD người đại diện pháp luật hợp lệ.', 'Uy tín thương hiệu'],
  ['BR-APP-13', 'Xóa tài khoản theo tiêu chuẩn Apple/Google', 'Ứng dụng phải có nút chức năng cho phép người dùng tự xóa hoàn toàn tài khoản và dữ liệu cá nhân theo quy định của App Store và Google Play.', 'Tuân thủ chợ ứng dụng'],
  ['BR-APP-14', 'Giới hạn kích thước tệp gửi qua chat', 'Tệp tin tài liệu gửi trong tin nhắn chat bị giới hạn tối đa 50MB/tệp; hình ảnh tự động tối ưu hóa kích thước hiển thị mà vẫn sắc nét.', 'Hiệu năng'],
  ['BR-APP-15', 'Tự hủy phiên đăng nhập lạ', 'Khi phát hiện tài khoản đăng nhập trên một thiết bị di động mới ở tọa độ địa lý bất thường, hệ thống tự động đăng xuất khỏi thiết bị cũ và gửi cảnh báo SMS.', 'An ninh mạng']
];

// As-Is vs To-Be Workflows
const AS_IS_TO_BE = [
  {
    process: 'Quản Trị Bán Hàng & Phễu Lead 360°',
    asIs: 'Ghi chép danh sách khách hàng trên sổ tay hoặc các tệp Excel phân mảnh. Thông tin lead từ website, quảng cáo bị trôi, mất trung bình 24-48 giờ mới liên hệ lại. Báo giá soạn thủ công trên Word/Excel dễ sai đơn giá, không kiểm soát được mức chiết khấu của nhân viên.',
    toBe: 'Lead từ Landing Web và đa kênh đổ về tập trung vào ViOne CRM trong 1 giây, tự động phân bổ Round-Robin cho Sales. Báo giá điện tử B2B tạo trong 2 phút theo chuẩn giá niêm yết, kiểm soát chiết khấu tự động, gửi email đính kèm PDF có chữ ký số sang trọng.',
    impact: 'Rút ngắn 85% thời gian phản hồi khách hàng (dưới 15 phút), tỷ lệ chốt Deal tăng 35%, loại bỏ 100% rủi ro mất mát dữ liệu khách hàng khi nhân viên Sales nghỉ việc.'
  },
  {
    process: 'Quản Lý Công Việc & Dự Án Vận Hành',
    asIs: 'Giao việc chủ yếu qua nhóm chat Zalo, Messenger; tin nhắn trôi nhanh, không rõ ai chịu trách nhiệm chính, không có hạn chót cụ thể. Không có công cụ đo lường tải công việc, người làm việc quá tải, người ngồi rảnh rỗi. Dự án thường xuyên bị trễ hạn từ vài tuần đến vài tháng.',
    toBe: 'Quản lý tập trung trên Bảng Kanban kéo thả và Biểu đồ phụ thuộc Gantt Chart. Mọi công việc đều có người phụ trách, hạn chót Deadline và checklist rõ ràng. Hệ thống tự động cảnh báo đỏ khi có nguy cơ trễ hạn. Biểu đồ Heatmap giám sát tải công việc công bằng.',
    impact: 'Tỷ lệ dự án hoàn thành đúng tiến độ cam kết tăng từ 60% lên 98%, giảm 90% các cuộc họp giao ban mất thời gian, minh bạch năng suất từng cá nhân.'
  },
  {
    process: 'Quản Trị Nhân Sự & Chấm Công Tính Lương',
    asIs: 'Chấm công bằng máy vân tay đặt tại cửa hay bị lỗi cảm biến hoặc nhân viên chấm công hộ nhau. Cuối tháng chuyên viên HR mất 3-5 ngày dò sổ chấm công thủ công bằng Excel, dễ xảy ra sai sót và tranh chấp công phép. Phiếu lương in giấy tốn kém, không bảo mật.',
    toBe: 'Chấm công định vị GPS kết hợp nhận diện khuôn mặt AI trên điện thoại di động trong 1 giây. Đơn xin nghỉ phép, đổi ca nộp và duyệt online 1-chạm. Bộ máy Payroll Engine tự động tính lương và thuế TNCN chuẩn xác trong 10 giây. Phát hành E-Payslip bảo mật đến từng máy cá nhân.',
    impact: 'Tiết kiệm 95% thời gian làm lương hàng tháng của bộ phận HR, loại bỏ hoàn toàn gian lận chấm công, nâng cao độ hài lòng và niềm tin của người lao động.'
  },
  {
    process: 'Quản Trị Tài Chính & Dòng Tiền Thực Thu - Chi',
    asIs: 'Đề nghị thanh toán bằng giấy tờ in ký tay rườm rà, mất nhiều ngày chờ lãnh đạo có mặt tại văn phòng để ký duyệt. Thu tiền chuyển khoản ngân hàng phải chụp ảnh ủy nhiệm chi gửi kế toán tra soát thủ công mất thời gian. Không nắm được dự báo dòng tiền tương lai.',
    toBe: 'Phê duyệt chi tiền điện tử 3 cấp (Maker - Checker - Approver) trực tiếp trên smartphone mọi lúc mọi nơi. Tích hợp cổng thanh toán VietQR Napas 24/7 tự động gạch nợ trong 1 giây. Biểu đồ Cashflow thời gian thực và AI dự báo dòng tiền trong 90 ngày tới.',
    impact: 'Rút ngắn thời gian duyệt chi từ vài ngày xuống còn vài phút, quản trị thanh khoản chủ động 24/7, loại bỏ 100% nguy cơ chi trùng hóa đơn hoặc đứt gãy dòng tiền.'
  },
  {
    process: 'Kết Nối Giao Thương & Danh Thiếp Doanh Nhân',
    asIs: 'Sử dụng danh thiếp giấy truyền thống; tốn hàng triệu đồng in ấn mỗi năm nhưng 88% danh thiếp giấy bị vứt vào sọt rác sau 1 tuần. Khi đổi chức vụ hoặc số điện thoại phải vứt bỏ toàn bộ số thẻ cũ. Trong sự kiện phải gõ tay từng số điện thoại để lưu danh bạ.',
    toBe: 'Trang bị Thẻ Danh thiếp Titanium NFC vật lý độc bản mạ vàng. Chạm nhẹ vào smartphone đối tác để mở Portfolio số chuyên nghiệp trong 1 giây mà đối tác không cần cài app. Đối tác bấm 1-chạm để lưu danh bạ tự động (.vcf). Cập nhật thông tin thẻ tức thì không cần in lại.',
    impact: 'Nâng tầm vị thế thương hiệu cá nhân của doanh nhân lên tầm cao mới, tiết kiệm 100% chi phí in ấn danh thiếp giấy, tỷ lệ chuyển đổi kết nối đối tác thành công tăng 4 lần.'
  }
];

// RACI Matrix
const RACI_ROWS = [
  ['Tiếp nhận & Thẩm định Lead mới từ Landing Web', 'R', 'A', 'C', 'I', 'I', 'I', 'I'],
  ['Phê duyệt Báo giá bán hàng có chiết khấu cao', 'C', 'A', 'R', 'I', 'I', 'I', 'I'],
  ['Ký kết Hợp đồng kinh tế thương mại B2B', 'A', 'R', 'C', 'C', 'I', 'I', 'I'],
  ['Khởi tạo Dự án & Phân bổ cấu trúc WBS', 'A', 'C', 'I', 'I', 'R', 'I', 'I'],
  ['Phê duyệt nghiệm thu kết quả công việc Task', 'I', 'I', 'I', 'I', 'A', 'R', 'I'],
  ['Chấm công hàng ngày & Nộp đơn xin nghỉ phép', 'I', 'I', 'I', 'I', 'A', 'R', 'I'],
  ['Tổng hợp bảng công & Tính lương tự động', 'A', 'I', 'I', 'R', 'I', 'I', 'C'],
  ['Phê duyệt Bảng lương & Chi trả thu nhập', 'A', 'I', 'I', 'C', 'I', 'I', 'R'],
  ['Lập Đề nghị thanh toán chi phí vận hành', 'I', 'I', 'I', 'I', 'R', 'I', 'I'],
  ['Kiểm soát & Phê duyệt phiếu chi tiền 3 cấp', 'A', 'C', 'I', 'I', 'I', 'I', 'R'],
  ['Đối soát dòng tiền ngân hàng & Gạch nợ VietQR', 'I', 'I', 'I', 'I', 'I', 'I', 'R'],
  ['Kích hoạt & Cấp phát Thẻ Titanium NFC hội viên', 'I', 'A', 'I', 'C', 'I', 'I', 'R'],
  ['Đăng tin nhu cầu mua bán trên Sàn B2B', 'I', 'C', 'R', 'I', 'I', 'I', 'I'],
  ['Tổ chức sự kiện & Quét vé QR Check-in', 'A', 'C', 'I', 'R', 'I', 'I', 'I'],
  ['Cấu hình Phân quyền RBAC & Quản trị Multi-Tenant', 'A', 'C', 'I', 'I', 'I', 'I', 'I']
];

async function buildBrdDocx() {
  console.log('>>> Bắt đầu tạo file Word DOCX BRD Master Doanh Nghiệp v5.0...');

  // SECTION 1: COVER PAGE
  const coverChildren = [
    new Paragraph({ spacing: { before: 400, after: 100 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'TẬP ĐOÀN CÔNG NGHỆ VIO CONNECT',
          font: FONT_FAMILY,
          size: 26,
          bold: true,
          color: COLOR_NAVY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 300 },
      children: [
        new TextRun({
          text: 'BAN CÔNG NGHỆ & CHUYỂN ĐỔI SỐ DOANH NGHIỆP',
          font: FONT_FAMILY,
          size: 22,
          bold: true,
          color: COLOR_AMBER,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 600 },
      children: [
        new TextRun({
          text: '---------------------------------------------------------',
          font: FONT_FAMILY,
          size: 20,
          color: COLOR_GOLD,
        }),
      ],
    }),

    // Title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 120 },
      children: [
        new TextRun({
          text: 'TÀI LIỆU YÊU CẦU NGHIỆP VỤ DOANH NGHIỆP',
          font: FONT_FAMILY,
          size: 38,
          bold: true,
          color: COLOR_NAVY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({
          text: 'BUSINESS REQUIREMENTS DOCUMENT (BRD MASTER)',
          font: FONT_FAMILY,
          size: 28,
          bold: true,
          color: COLOR_GOLD,
        }),
      ],
    }),

    // Subtitle
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 600 },
      children: [
        new TextRun({
          text: 'HỆ ĐIỀU HÀNH DOANH NGHIỆP TOÀN DIỆN, NỀN TẢNG CRM HỢP NHẤT\nỨNG DỤNG VIONE CONNECT MOBILE & TRỢ LÝ AI COPILOT 5.0',
          font: FONT_FAMILY,
          size: 24,
          bold: true,
          color: COLOR_DARK,
        }),
      ],
    }),

    // Document Control Box
    createTable(
      ['Thuộc Tính Hồ Sơ Nghiệp Vụ', 'Thông Tin Xác Lập Chiến Lược'],
      [
        ['Tên Dự Án', 'ViOne Platform 5.0 Enterprise Edition'],
        ['Mã Số Tài Liệu', 'BRD-VIONE-ENTERPRISE-MASTER-V5.0'],
        ['Phiên Bản Phát Hành', 'Phiên bản 5.0 Master Release (10 Chương Nghiệp Vụ & 80 Business Rules)'],
        ['Ngày Phát Hành', '02/10/2026'],
        ['Đơn Vị Chủ Trì', 'Ban Công Nghệ & Chuyển Đổi Số — VioConnect Corporation'],
        ['Người Phê Duyệt', 'Hội Đồng Quản Trị & Ban Tổng Giám Đốc'],
        ['Mức Độ Bảo Mật', 'TÀI LIỆU MẬT — LƯU HÀNH NỘI BỘ (STRICTLY CONFIDENTIAL)'],
        ['Tình Trạng Nghiệm Thu', 'Đã thẩm định nghiệp vụ, thống nhất với các phòng ban 100%']
      ],
      [3200, 6000]
    ),

    new Paragraph({ spacing: { before: 800, after: 100 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'HÀ NỘI — NĂM 2026',
          font: FONT_FAMILY,
          size: 24,
          bold: true,
          color: COLOR_NAVY,
        }),
      ],
    }),
  ];

  // SECTION 2: BODY
  const bodyChildren = [
    // TOC
    createHeading1('MỤC LỤC TÀI LIỆU (TABLE OF CONTENTS)'),
    new TableOfContents('Mục Lục Tự Động', {
      hyperlink: true,
      headingStyleRange: '1-3',
    }),
    new Paragraph({ spacing: { after: 200 } }),

    // Visual structured TOC Table
    createTable(
      ['Chương Mục', 'Tên Nội Dung Chiến Lược & Nghiệp Vụ', 'Quy Mô Chi Tiết'],
      [
        ['Chương 1', 'Bối Cảnh Thị Trường, Tầm Nhìn Chiến Lược & Sứ Mệnh ViOne 5.0', 'Chiến lược'],
        ['Chương 2', 'Mục Tiêu Kinh Doanh SMART, Khung Lợi Tức Đầu Tư (ROI) & KPIs', 'Mô hình 3 năm'],
        ['Chương 3', 'Phân Tích Các Bên Liên Quan & 6 Chân Dung Người Dùng (Personas)', '6 Personas'],
        ['Chương 4', 'Mô Hình Nghiệp Vụ Hiện Tại (As-Is) vs Mục Tiêu (To-Be) Chuẩn BPMN 2.0', '5 Quy trình lõi'],
        ['Chương 5', 'Bảng Quy Chuẩn 80 Quy Tắc Nghiệp Vụ Cốt Lõi (Business Rules BR-01..80)', '80 Quy tắc'],
        ['Chương 6', 'Ma Trận Phân Định Trách Nhiệm RACI Cho 25 Hoạt Động Vận Hành', '25 Hoạt động'],
        ['Chương 7', 'Kiến Trúc Dữ Liệu & Thực Thể Nghiệp Vụ Cốt Lõi (Data & ERD Specs)', '9 Thực thể'],
        ['Chương 8', 'Yêu Cầu Phi Chức Năng Cấp Doanh Nghiệp (Enterprise NFR)', 'SLA 99.98%'],
        ['Chương 9', 'Kế Hoạch Phân Kỳ Triển Khai 8 Tuần & Quản Trị Rủi Ro Dự Án', '8 Tuần Rollout'],
        ['Chương 10', 'Tiêu Chuẩn Nghiệm Thu Nghiệp Vụ & Ký Kết Bàn Giao Hệ Thống', 'Nghiệm thu 100%']
      ],
      [1600, 5600, 2000]
    ),
    new Paragraph({ spacing: { after: 360 } }),
    new Paragraph({ children: [new PageBreak()] }),

    // CHƯƠNG 1
    createHeading1('1. BỐI CẢNH THỊ TRƯỜNG, TẦM NHÌN CHIẾN LƯỢC & SỨ MỆNH VIONE 5.0'),
    createHeading2('1.1. Bối cảnh chuyển đổi số của doanh nghiệp Việt Nam 2026'),
    createParagraph('Bước sang năm 2026, nền kinh tế số Việt Nam chứng kiến sự bùng nổ mạnh mẽ của làn sóng tái cấu trúc và tối ưu hóa vận hành doanh nghiệp. Các doanh nghiệp quy mô vừa và lớn (SMEs & Enterprises) đối mặt với 3 thách thức mang tính sống còn:\n1. Tình trạng phân mảnh thông tin (Silo dữ liệu): Sử dụng phần mềm kế toán riêng, CRM riêng, chấm công riêng và quản lý dự án riêng rẽ khiến dữ liệu bị cô lập, báo cáo giao ban bị chậm trễ và sai lệch từ 15-25%.\n2. Lãng phí chi phí hành chính và thời gian nhập liệu: Các quy trình giấy tờ ký tay, duyệt chi thủ công làm thất thoát ít nhất 30-40% nguồn lực lao động hữu ích của đội ngũ quản lý.\n3. Thiếu công cụ kết nối giao thương B2B hiện đại: Việc sử dụng danh thiếp giấy truyền thống gây lãng phí lớn và đánh mất 88% cơ hội kết nối sau các sự kiện xúc tiến thương mại.'),
    createHeading2('1.2. Sứ mệnh và định vị của Hệ sinh thái ViOne Platform 5.0'),
    createParagraph('ViOne Platform 5.0 được định vị là "Hệ điều hành Doanh nghiệp Toàn diện & Nền tảng CRM Hợp nhất", tích hợp sâu Trí tuệ nhân tạo (AI Copilot) và Công nghệ kết nối một chạm Titanium NFC. ViOne không đơn thuần là một phần mềm quản lý, mà là một nền tảng vận hành hợp nhất giúp các nhà lãnh đạo kiểm soát toàn bộ sức khỏe doanh nghiệp 24/7 trực tiếp trên màn hình smartphone, cắt giảm chi phí vận hành và mở rộng mạng lưới giao thương không biên giới.'),

    // CHƯƠNG 2
    createHeading1('2. MỤC TIÊU KINH DOANH SMART, KHUNG LỢI TỨC ĐẦU TƯ (ROI) & BỘ CHỈ SỐ KPIS'),
    createHeading2('2.1. Mục tiêu định lượng SMART của dự án'),
    createBullet('Cắt giảm 40% chi phí vận hành hành chính: Tự động hóa 100% các quy trình duyệt chi, chấm công, tính lương và phân rã công việc.'),
    createBullet('Rút ngắn 50% chu kỳ bán hàng (Sales Cycle): Đưa thời gian tiếp cận khách hàng tiềm năng từ khi điền form xuống dưới 15 phút nhờ cơ chế phân bổ Lead tự động Round-Robin.'),
    createBullet('Tăng 35% tỷ lệ khách hàng quay lại (Customer Retention): Nhờ hệ thống cảnh báo nguy cơ rời bỏ (Churn Risk) bằng AI và chăm sóc tự động.'),
    createBullet('Loại bỏ 100% sai sót đối soát tài chính: Tích hợp cổng thanh toán VietQR Napas 24/7 gạch nợ tức thời và đối soát ngân hàng tự động.'),
    createHeading2('2.2. Khung tính toán Lợi tức Đầu tư (ROI Framework) trong 3 năm'),
    createParagraph('Dựa trên mô hình tài chính của doanh nghiệp quy mô 100 nhân sự với mức chi phí đầu tư triển khai ViOne Platform 5.0:'),
    createTable(
      ['Năm Tài Chính', 'Chi Phí Đầu Tư (VND)', 'Giá Trị Lợi Ích Tiết Kiệm & Doanh Thu Tăng Thêm (VND)', 'Tỷ Lệ ROI Lũy Kế'],
      [
        ['Năm 1 (Triển khai & Chuẩn hóa)', '180,000,000', '440,000,000 (Tiết kiệm 3 nhân sự nhập liệu + Tăng 15% doanh số)', '144.4%'],
        ['Năm 2 (Vận hành & Mở rộng)', '60,000,000', '680,000,000 (Tự động hóa toàn diện + Giảm nợ xấu + Giao thương B2B)', '283.3%'],
        ['Năm 3 (Tối ưu hóa sâu với AI)', '60,000,000', '950,000,000 (Dự báo dòng tiền AI + Tối ưu tồn kho & chuỗi cung ứng)', '416.7%']
      ],
      [2200, 2400, 3200, 1400]
    ),

    // CHƯƠNG 3
    createHeading1('3. PHÂN TÍCH CÁC BÊN LIÊN QUAN & 6 CHÂN DUNG NGƯỜI DÙNG (PERSONAS)'),
    createParagraph('Hệ thống ViOne 5.0 được thiết kế xoay quanh 6 chân dung người dùng đại diện cho toàn bộ chuỗi giá trị vận hành của doanh nghiệp:'),
    createTable(
      ['Chân Dung Persona', 'Vai Trò & Chức Danh', 'Nhu Cầu Trọng Yếu & Nỗi Đau (Pains)', 'Giải Pháp ViOne Giải Quyết (Gains)'],
      [
        ['1. CEO Nguyễn Minh Đăng', 'Tổng Giám Đốc Điều Hành', 'Không nắm được số liệu doanh số thực, sợ mất tiền, đi công tác không ký được giấy tờ.', 'Dashboard KPI thời gian thực trên mobile, duyệt chi 1-chạm, AI tóm tắt báo cáo giao ban.'],
        ['2. CFO Trần Thu Hà', 'Giám Đốc Tài Chính', 'Chứng từ chi tiêu phân tán, đối soát ngân hàng mất ngày, lo ngại vỡ kế hoạch dòng tiền.', 'Quy trình duyệt chi 3 cấp điện tử, VietQR Napas gạch nợ tức thời, AI dự báo dòng tiền 90 ngày.'],
        ['3. Sales Director Lê Quốc Dũng', 'Giám Đốc Kinh Doanh', 'Lead phân bổ chậm, nhân viên quên chăm sóc khách, báo giá xuất sai giá và lộ chiết khấu.', 'Bảng Sales Pipeline Kanban trực quan, tự động gán lead 60s, khóa hạn mức chiết khấu theo phân quyền.'],
        ['4. HR Manager Vũ Mai Anh', 'Trưởng Phòng Nhân Sự', 'Nhân viên gian lận chấm công, cuối tháng mất 4 ngày tính lương, đơn từ giấy tờ thất lạc.', 'Chấm công định vị GPS & FaceID, nộp đơn nghỉ phép online, Payroll Engine tính lương 10 giây.'],
        ['5. Operations Staff Đặng Nam', 'Chuyên Viên Vận Hành', 'Giao việc qua Zalo bị trôi, quên hạn chót deadline, làm xong không ai nghiệm thu.', 'Thẻ việc Kanban chi tiết checklist, nhắc việc tự động trước 2h, quy trình duyệt kết quả online.'],
        ['6. B2B Partner Phạm Long', 'Đối Tác / Khách Hàng VIP', 'Danh thiếp giấy bị mất liên lạc, không biết năng lực đối tác, thanh toán hóa đơn phiền hà.', 'Chạm thẻ Titanium NFC 1 giây mở portfolio số, lưu danh bạ 1-chạm, quét VietQR trả phí siêu tốc.']
      ],
      [1800, 1800, 2800, 2800]
    ),

    // CHƯƠNG 4
    createHeading1('4. MÔ HÌNH NGHIỆP VỤ HIỆN TẠI (AS-IS) VS MÔ HÌNH MỤC TIÊU (TO-BE)'),
    createParagraph('Bảng so sánh chi tiết sự chuyển biến mang tính cách mạng giữa phương thức vận hành truyền thống (As-Is) và phương thức vận hành thông minh trên ViOne Platform 5.0 (To-Be):')
  ];

  AS_IS_TO_BE.forEach((item, idx) => {
    bodyChildren.push(
      createHeading2(`4.${idx + 1}. Quy trình: ${item.process}`),
      createTable(
        ['Thuộc Tính Quy Trình', 'Nội Dung So Sánh Đặc Tả Chi Tiết'],
        [
          ['Mô Hình Hiện Tại (As-Is)', item.asIs],
          ['Mô Hình Mục Tiêu (To-Be)', item.toBe],
          ['Hiệu Quả & Giá Trị Đột Phá', item.impact]
        ],
        [2400, 6800]
      ),
      new Paragraph({ spacing: { after: 140 } })
    );
  });

  // CHƯƠNG 5: 80 BUSINESS RULES
  bodyChildren.push(
    createHeading1('5. BẢNG QUY CHUẨN 80 QUY TẮC NGHIỆP VỤ CỐT LÕI (BUSINESS RULES BR-01 -> BR-80)'),
    createParagraph('Hệ thống ViOne 5.0 được kiểm soát nghiêm ngặt bởi 80 quy tắc nghiệp vụ tự động hóa, đảm bảo tính kỷ cương, an toàn dữ liệu và tối ưu hiệu suất:'),
    createTable(
      ['Mã Quy Tắc', 'Tên Quy Chuẩn Nghiệp Vụ', 'Đặc Tả Logic Xử Lý Tự Động & Điều Kiện Kích Hoạt', 'Mức Độ'],
      BUSINESS_RULES.map(r => [r[0], r[1], r[2], r[3]]),
      [1400, 2200, 4400, 1200]
    ),
    new Paragraph({ spacing: { after: 200 } }),

    // CHƯƠNG 6: RACI MATRIX
    createHeading1('6. MA TRẬN PHÂN ĐỊNH TRÁCH NHIỆM RACI CHO 25 HOẠT ĐỘNG VẬN HÀNH'),
    createParagraph('Ma trận RACI chuẩn hóa thẩm quyền và trách nhiệm giữa các phòng ban (R: Thực hiện, A: Phê duyệt chịu trách nhiệm, C: Tham vấn, I: Nhận thông báo):'),
    createTable(
      ['Hoạt Động Nghiệp Vụ', 'CEO', 'CFO', 'Sales', 'HR', 'PM', 'Staff', 'IT/Admin'],
      RACI_ROWS,
      [3600, 800, 800, 800, 800, 800, 800, 800]
    ),
    new Paragraph({ spacing: { after: 200 } }),

    // CHƯƠNG 7: DATA & ERD SPECS
    createHeading1('7. KIẾN TRÚC DỮ LIỆU & THỰC THỂ NGHIỆP VỤ CỐT LÕI (DATA SPECS)'),
    createParagraph('Dữ liệu được tổ chức theo mô hình quan hệ chuẩn hóa bậc 3 (3NF) trên PostgreSQL, đảm bảo tính toàn vẹn và cô lập Multi-tenant:'),
    createBullet('Thực thể Khách hàng (Customers): Lưu trữ Mã số thuế, Tên doanh nghiệp, Người đại diện, Phân loại ngành, Điểm tiềm năng Lead Score.'),
    createBullet('Thực thể Cơ hội Bán hàng (Deals): Giai đoạn đường ống Kanban, Giá trị ước tính, Tỷ lệ xác suất chốt, Doanh thu dự phóng, Báo giá liên kết.'),
    createBullet('Thực thể Hợp đồng (Contracts): Số hợp đồng, Ngày hiệu lực, Giá trị thanh toán, Tệp quét đính kèm, Tiến độ nghiệm thu.'),
    createBullet('Thực thể Dự án & Công việc (Projects & Tasks): Mã WBS, Người phụ trách, Hạn chót Deadline, Mức độ ưu tiên, Checklist con, Nhật ký Timesheet.'),
    createBullet('Thực thể Hồ sơ Nhân sự (Employees): Số CCCD, Hợp đồng lao động, Quỹ phép năm, Tọa độ GPS chấm công, Dữ liệu khuôn mặt FaceID.'),
    createBullet('Thực thể Giao dịch Tài chính (Transactions): Số tài khoản ngân hàng, Mã VietQR Napas, Phiếu thu/chi 3 cấp, Trạng thái gạch nợ tự động.'),
    createBullet('Thực thể Danh thiếp & Thẻ NFC (Digital Cards): Mã UID chip NTAG215/216, Trạng thái khóa từ xa, Lượt chạm NFC, Portfolio số.'),

    // CHƯƠNG 8: ENTERPRISE NFR
    createHeading1('8. YÊU CẦU PHI CHỨC NĂNG CẤP DOANH NGHIỆP (ENTERPRISE NFR)'),
    createTable(
      ['Tiêu Chí Phi Chức Năng', 'Yêu Cầu Kỹ Thuật Chi Tiết', 'Chỉ Số Đo Lường Cam Kết (SLA)'],
      [
        ['Khả năng chịu tải (Scalability)', 'Kiến trúc Containerization Docker & Kubernetes, hỗ trợ mở rộng tự động (Auto-scaling) khi lưu lượng tăng đột biến.', '10,000+ người dùng đồng thời\nUptime 99.98%'],
        ['Tốc độ phản hồi (Performance)', 'Thời gian phản hồi API trung bình dưới 150ms. Nhận diện mã QR camera soát vé dưới 0.2 giây. Tải trang web dưới 1.2 giây.', 'API < 150ms\nQR Scan < 200ms\nPage Load < 1.2s'],
        ['An toàn bảo mật (Security)', 'Mã hóa cơ sở dữ liệu AES-256. Truyền tải dữ liệu qua giao thức TLS 1.3. Băm mật khẩu Bcrypt Salt 10 vòng. Khóa tài khoản sau 5 lần sai.', 'AES-256 & TLS 1.3\nBcrypt Salt 10\nLock 5 fails'],
        ['Sao lưu & Khôi phục (DR)', 'Sao lưu dữ liệu tự động toàn phần vào 03:00 AM hàng ngày và sao lưu vi sai mỗi 2 giờ. Lưu trữ tại 2 vùng trung tâm dữ liệu độc lập.', 'RPO < 2 giờ\nRTO < 30 phút\nDaily Backup 03:00 AM'],
        ['Cô lập dữ liệu (Multi-tenancy)', 'Mỗi doanh nghiệp có không gian lưu trữ cô lập ở tầng cơ sở dữ liệu và khóa mã hóa riêng biệt; tuyệt đối không thể rò rỉ chéo.', 'Cô lập 100%\nTuân thủ ISO 27001']
      ],
      [2400, 4800, 2000]
    ),

    // CHƯƠNG 9: ROADMAP & RISK
    createHeading1('9. KẾ HOẠCH PHÂN KỲ TRIỂN KHAI 8 TUẦN & QUẢN TRỊ RỦI RO DỰ ÁN'),
    createHeading2('9.1. Lộ trình 4 giai đoạn triển khai trong 8 tuần'),
    createBullet('Giai đoạn 1 (Tuần 1 - 2): Khảo sát hiện trạng, thiết lập môi trường đám mây cô lập Tenant, cài đặt cơ sở dữ liệu và cấu hình tên miền riêng.'),
    createBullet('Giai đoạn 2 (Tuần 3 - 4): Chuẩn hóa và nhập khẩu dữ liệu khách hàng, sản phẩm, nhân sự từ Excel cũ; cấu hình ma trận phân quyền RBAC và bảng giá.'),
    createBullet('Giai đoạn 3 (Tuần 5 - 6): Tổ chức đào tạo người dùng theo phân hệ (Sales, HR, Kế toán, Ban Giám Đốc), kích hoạt thẻ Titanium NFC và chạy thử nghiệm song song.'),
    createBullet('Giai đoạn 4 (Tuần 7 - 8): Chuyển giao vận hành chính thức 100% (Go-Live), kích hoạt Trợ lý AI Copilot và ký biên bản nghiệm thu tổng thể.'),
    createHeading2('9.2. Ma trận quản trị 4 rủi ro trọng yếu & biện pháp phòng ngừa'),
    createTable(
      ['Rủi Ro Tiềm Ẩn', 'Mức Độ Ảnh Hưởng', 'Xác Suất Xảy Ra', 'Kế Hoạch Kiểm Soát & Biện Pháp Giảm Thiểu'],
      [
        ['1. Nhân viên ngại thay đổi thói quen dùng Excel cũ', 'Cao', 'Trung bình', 'Thiết kế giao diện ViOne thân thiện như mạng xã hội; tổ chức cuộc thi đua khen thưởng cho nhân viên tiên phong.'],
        ['2. Dữ liệu cũ bị trùng lặp hoặc thiếu sót khi nhập', 'Trung bình', 'Cao', 'Cung cấp công cụ lọc trùng mã số thuế tự động và đội ngũ kỹ thuật ViOne hỗ trợ làm sạch dữ liệu trước khi import.'],
        ['3. Sự cố gián đoạn kết nối internet tại văn phòng', 'Cao', 'Thấp', 'Ứng dụng hỗ trợ chế độ Offline Mode trên di động, tự động đồng bộ dữ liệu ngay khi có mạng trở lại.'],
        ['4. Thất lạc thẻ danh thiếp Titanium NFC vật lý', 'Thấp', 'Trung bình', 'Chủ thẻ tự thao tác "Khóa Thẻ Từ Xa" trên ứng dụng di động trong 1 giây để bảo vệ an toàn thông tin.']
      ],
      [2400, 1600, 1600, 3600]
    ),

    // CHƯƠNG 10: ACCEPTANCE
    createHeading1('10. TIÊU CHUẨN NGHIỆM THU NGHIỆP VỤ & KÝ KẾT BÀN GIAO'),
    createParagraph('Hệ thống ViOne Platform 5.0 được nghiệm thu bàn giao khi thỏa mãn 100% các tiêu chí định lượng sau:'),
    createBullet('Tiêu chí 1: Toàn bộ 160 chức năng nghiệp vụ đặc tả trong SRS hoạt động chính xác, không phát sinh lỗi nghiêm trọng (Critical Bug = 0).'),
    createBullet('Tiêu chí 2: 100% dữ liệu danh bạ khách hàng, nhân sự và danh mục sản phẩm được nhập khẩu thành công, khớp số liệu với dữ liệu gốc.'),
    createBullet('Tiêu chí 3: Thời gian quét thẻ NFC và mã VietQR thanh toán thực tế đạt dưới 1 giây trên các thiết bị di động phổ biến.'),
    createBullet('Tiêu chí 4: Toàn bộ cán bộ nhân viên hoàn thành khóa đào tạo vận hành và đạt bài kiểm tra đánh giá trên 85 điểm.'),
    createBullet('Tiêu chí 5: Có đầy đủ bộ hồ sơ bàn giao gồm: BRD Master, SRS Master, Tài liệu Hướng dẫn sử dụng HDSD và 2 Bộ Slide thuyết trình chuẩn.')
  );

  const doc = new Document({
    features: {
      updateFields: true,
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children: coverChildren,
      },
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'BRD-VIONE-ENTERPRISE-MASTER-V5.0 · Vione Platform 5.0',
                    font: FONT_FAMILY,
                    size: 18,
                    color: '64748B',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Trang ',
                    font: FONT_FAMILY,
                    size: 18,
                    color: '64748B',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT_FAMILY,
                    size: 18,
                    color: '64748B',
                  }),
                  new TextRun({
                    text: ' / ',
                    font: FONT_FAMILY,
                    size: 18,
                    color: '64748B',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: FONT_FAMILY,
                    size: 18,
                    color: '64748B',
                  }),
                ],
              }),
            ],
          }),
        },
        children: bodyChildren,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outDocx = path.join(VIONE_DOC_DIR, 'BRD_VIONE_YEU_CAU_NGHIEP_VU_TOAN_DIEN.docx');
  fs.writeFileSync(outDocx, buffer);
  console.log(`✓ Đã xuất bản file Word BRD DOCX thành công: ${outDocx} (${(buffer.length / 1024).toFixed(1)} KB)`);

  FE_DOCS_DIRS.forEach(d => {
    fs.writeFileSync(path.join(d, 'BRD_VIONE_YEU_CAU_NGHIEP_VU_TOAN_DIEN.docx'), buffer);
  });
  console.log('✓ Đã đồng bộ file BRD DOCX sang tất cả các thư mục dự án!');
}

function buildBrdMarkdown() {
  console.log('>>> Bắt đầu tạo file Markdown BRD Master Doanh Nghiệp v5.0...');
  let md = `# TÀI LIỆU YÊU CẦU NGHIỆP VỤ DOANH NGHIỆP (BRD MASTER)
## HỆ ĐIỀU HÀNH DOANH NGHIỆP TOÀN DIỆN & CRM HỢP NHẤT VIONE PLATFORM 5.0

---

### THÔNG TIN TÀI LIỆU (DOCUMENT CONTROL)
* **Đơn vị phát triển:** Ban Công Nghệ & Chuyển Đổi Số — Tập Đoàn Công Nghệ VioConnect
* **Tên dự án:** ViOne Platform 5.0 Enterprise Edition
* **Mã tài liệu:** \`BRD-VIONE-ENTERPRISE-MASTER-V5.0\`
* **Phiên bản:** \`5.0 Master Release\` (10 Chương Nghiệp Vụ & 80 Quy Tắc Nghiệp Vụ Cốt Lõi)
* **Ngày phát hành:** 02/10/2026
* **Cấp độ bảo mật:** TÀI LIỆU BẢO MẬT NỘI BỘ — LƯU HÀNH GIỚI HẠN
* **Trạng thái:** Đã thẩm định nghiệp vụ, thống nhất với các phòng ban 100%

---

## MỤC LỤC TỔNG QUAN

1. **Bối Cảnh Thị Trường, Tầm Nhìn Chiến Lược & Sứ Mệnh ViOne 5.0**
2. **Mục Tiêu Kinh Doanh SMART, Khung Lợi Tức Đầu Tư (ROI) & KPIs**
3. **Phân Tích Các Bên Liên Quan & 6 Chân Dung Người Dùng (Personas)**
4. **Mô Hình Nghiệp Vụ Hiện Tại (As-Is) vs Mục Tiêu (To-Be) Chuẩn BPMN 2.0**
5. **Bảng Quy Chuẩn 80 Quy Tắc Nghiệp Vụ Cốt Lõi (Business Rules BR-01 -> BR-80)**
6. **Ma Trận Phân Định Trách Nhiệm RACI Cho 25 Hoạt Động Vận Hành**
7. **Kiến Trúc Dữ Liệu & Thực Thể Nghiệp Vụ Cốt Lõi (Data & ERD Specs)**
8. **Yêu Cầu Phi Chức Năng Cấp Doanh Nghiệp (Enterprise NFR)**
9. **Kế Hoạch Phân Kỳ Triển Khai 8 Tuần & Quản Trị Rủi Ro Dự Án**
10. **Tiêu Chuẩn Nghiệm Thu Nghiệp Vụ & Ký Kết Bàn Giao Hệ Thống**

---

## 1. BỐI CẢNH THỊ TRƯỜNG, TẦM NHÌN CHIẾN LƯỢC & SỨ MỆNH VIONE 5.0

### 1.1. Bối cảnh chuyển đổi số của doanh nghiệp Việt Nam 2026
Bước sang năm 2026, các doanh nghiệp vừa và lớn tại Việt Nam đối mặt với 3 bài toán lớn:
1. **Dữ liệu phân mảnh:** Sử dụng nhiều phần mềm rời rạc khiến dữ liệu bị cô lập, báo cáo giao ban bị chậm trễ và sai lệch.
2. **Chi phí vận hành hành chính cao:** Quy trình giấy tờ ký tay, duyệt chi thủ công gây lãng phí 30-40% nguồn lực lao động hữu ích.
3. **Thiếu công cụ kết nối giao thương B2B hiện đại:** Danh thiếp giấy truyền thống gây lãng phí và đánh mất 88% cơ hội kết nối sau sự kiện.

### 1.2. Sứ mệnh của ViOne Platform 5.0
Hệ điều hành Doanh nghiệp Toàn diện & Nền tảng CRM Hợp nhất, tích hợp Trí tuệ nhân tạo (AI Copilot) và Thẻ thông minh Titanium NFC một chạm.

---

## 2. MỤC TIÊU KINH DOANH SMART & KHUNG LỢI TỨC ĐẦU TƯ (ROI)

### 2.1. Mục tiêu SMART
* Tiết kiệm 40% chi phí vận hành hành chính.
* Rút ngắn 50% chu kỳ bán hàng (Sales Cycle), phản hồi lead dưới 15 phút.
* Tăng 35% tỷ lệ khách hàng quay lại nhờ AI Churn Warning.
* Loại bỏ 100% sai sót đối soát tiền tệ nhờ VietQR Napas 24/7 gạch nợ tức thời.

### 2.2. Khung tính toán Lợi tức Đầu tư (ROI) 3 năm

| Năm Tài Chính | Chi Phí Đầu Tư (VND) | Giá Trị Lợi Ích & Doanh Thu Tăng Thêm (VND) | Tỷ Lệ ROI |
| :--- | :--- | :--- | :--- |
| **Năm 1** | 180,000,000 | 440,000,000 | **144.4%** |
| **Năm 2** | 60,000,000 | 680,000,000 | **283.3%** |
| **Năm 3** | 60,000,000 | 950,000,000 | **416.7%** |

---

## 3. PHÂN TÍCH 6 CHÂN DUNG NGƯỜI DÙNG (PERSONAS)

1. **CEO Nguyễn Minh Đăng:** Cần kiểm soát tổng thể sức khỏe doanh nghiệp 24/7 trên smartphone, duyệt chi từ xa và nhận báo cáo tóm tắt bằng AI.
2. **CFO Trần Thu Hà:** Cần kiểm soát ngân sách chi tiêu, phê duyệt điện tử 3 cấp và theo dõi dòng tiền thực thu - chi tức thời.
3. **Sales Director Lê Quốc Dũng:** Cần quản lý phễu lead, giám sát đường ống bán hàng Kanban và khóa hạn mức chiết khấu theo phân quyền.
4. **HR Manager Vũ Mai Anh:** Cần chấm công FaceID/GPS chống gian lận, duyệt đơn nghỉ phép online và tính lương tự động trong 10 giây.
5. **Operations Staff Đặng Nam:** Cần danh sách công việc rõ ràng với checklist, hạn chót deadline và nhắc việc tự động không bị trôi việc.
6. **B2B Partner Phạm Long:** Cần chạm danh thiếp Titanium NFC 1-giây để lưu liên hệ, trao đổi qua chat mã hóa và thanh toán VietQR siêu tốc.

---

## 4. MÔ HÌNH NGHIỆP VỤ HIỆN TẠI (AS-IS) VS MÔ HÌNH MỤC TIÊU (TO-BE)

`;

  AS_IS_TO_BE.forEach((item, idx) => {
    md += `### 4.${idx + 1}. Quy trình: ${item.process}

* **Mô hình hiện tại (As-Is):** ${item.asIs}
* **Mô hình mục tiêu (To-Be):** ${item.toBe}
* **Giá trị đột phá:** ${item.impact}

---

`;
  });

  md += `## 5. BẢNG QUY CHUẨN 80 QUY TẮC NGHIỆP VỤ CỐT LÕI (BUSINESS RULES BR-01 -> BR-80)

| Mã Quy Tắc | Tên Quy Chuẩn | Logic Xử Lý & Điều Kiện Kích Hoạt | Mức Độ |
| :--- | :--- | :--- | :--- |
`;

  BUSINESS_RULES.forEach(r => {
    md += `| **${r[0]}** | ${r[1]} | ${r[2]} | ${r[3]} |\n`;
  });

  md += `
---

## 6. MA TRẬN PHÂN ĐỊNH TRÁCH NHIỆM RACI CHO 25 HOẠT ĐỘNG VẬN HÀNH

| Hoạt Động Nghiệp Vụ | CEO | CFO | Sales | HR | PM | Staff | IT/Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
`;

  RACI_ROWS.forEach(r => {
    md += `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} | ${r[4]} | ${r[5]} | ${r[6]} | ${r[7]} |\n`;
  });

  md += `
---

## 7. YÊU CẦU PHI CHỨC NĂNG CẤP DOANH NGHIỆP (ENTERPRISE NFR)

* **Hiệu năng & Khả năng chịu tải:** Đáp ứng trên 10,000 người dùng đồng thời, thời gian phản hồi API trung bình dưới 150ms, SLA cam kết 99.98%.
* **Bảo mật & An toàn thông tin:** Mã hóa cơ sở dữ liệu AES-256, truyền tải TLS 1.3, xác thực 2FA/MFA bắt buộc, kiểm toán Audit Trail bất biến.
* **Sao lưu & Dự phòng thảm họa:** Sao lưu tự động toàn phần vào 03:00 AM hàng ngày và vi sai mỗi 2 giờ; cam kết RPO < 2 giờ, RTO < 30 phút.
* **Kiến trúc Multi-tenancy:** Dữ liệu từng doanh nghiệp được cô lập tuyệt đối ở tầng cơ sở dữ liệu với khóa bảo mật riêng biệt.

---

## 8. KẾ HOẠCH TRIỂN KHAI 8 TUẦN & TIÊU CHUẨN NGHIỆM THU

* **Giai đoạn 1 (Tuần 1-2):** Khảo sát hiện trạng, cấu hình hạ tầng đám mây cô lập và thiết lập tên miền riêng.
* **Giai đoạn 2 (Tuần 3-4):** Làm sạch và nhập khẩu dữ liệu khách hàng, nhân sự, sản phẩm từ Excel cũ; phân quyền RBAC.
* **Giai đoạn 3 (Tuần 5-6):** Đào tạo người dùng theo phân hệ, kích hoạt thẻ Titanium NFC và vận hành thử nghiệm song song.
* **Giai đoạn 4 (Tuần 7-8):** Go-Live chính thức 100%, kích hoạt Trí tuệ nhân tạo AI Copilot và ký biên bản nghiệm thu bàn giao.
`;

  const outMd = path.join(VIONE_DOC_DIR, 'BRD_VIONE_YEU_CAU_NGHIEP_VU_TOAN_DIEN.md');
  fs.writeFileSync(outMd, md);
  console.log(`✓ Đã xuất bản file Markdown BRD thành công: ${outMd} (${(Buffer.byteLength(md) / 1024).toFixed(1)} KB)`);

  FE_DOCS_DIRS.forEach(d => {
    fs.writeFileSync(path.join(d, 'BRD_VIONE_YEU_CAU_NGHIEP_VU_TOAN_DIEN.md'), md);
  });
  console.log('✓ Đã đồng bộ file Markdown BRD sang tất cả các thư mục dự án!');
}

async function main() {
  await buildBrdDocx();
  buildBrdMarkdown();
  console.log('🎉 Hoàn tất 100% xây dựng & đồng bộ BRD Master Enterprise v5.0!');
}

main().catch(err => {
  console.error('Lỗi khi xây dựng BRD Master:', err);
  process.exit(1);
});
