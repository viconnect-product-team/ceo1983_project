/**
 * SCRIPT NÂNG TẦM LỜI LẼ TOÀN DIỆN KỊCH BẢN THUYẾT TRÌNH BÁO CÁO CEO 1983 (THỨ 4)
 * 
 * Đáp ứng chỉ đạo của khách hàng:
 * 1. Nâng tầm lời lẽ: Văn phong hùng biện, trang trọng, đĩnh đạc, khúc chiết, giàu sức thuyết phục
 *    của Giám đốc công nghệ / Chuyên gia giải pháp trước Ban Điều Hành và các CEO cấp cao HanoiBA.
 *    Loại bỏ kiểu câu cộc lốc, gạch đầu dòng khô khan; thay bằng lời thoại trọn vẹn, có dẫn dắt,
 *    có chiều sâu tư duy và cảm xúc thấu cảm.
 * 2. Phân tích sâu sắc BỘ CÔNG CỤ QUẢN TRỊ THỰC TẾ (Quản lý công việc Kanban, Cuộc họp & Điểm danh QR,
 *    Kho tài liệu số, VoIP, Moments B2B):
 *    - Khẳng định rõ ràng: Đây là các tính năng NẰM NGOÀI PHẠM VI YÊU CẦU BAN ĐẦU (BRD GỐC) của CEO 1983.
 *    - Được kiến tạo dưới GÓC NHÌN CỦA ĐỘI NGŨ PHÁT TRIỂN KỸ THUẬT VÀ NĂNG LỰC CÔNG NGHỆ THỰC CHIẾN CỦA VICONNECT.
 *    - Giải quyết tận gốc nỗi đau vận hành 365 ngày của BĐH, thay thế hoàn toàn sự phân tán của Zalo, Drive, Excel.
 * 3. Chuẩn hóa lộ trình 3 tiếng (09:00 - 12:00 Thứ Tư):
 *    - 09:00 - 09:45 (45p): Báo cáo thuyết trình & Live Demo toàn diện.
 *    - 09:45 - 11:45 (120p / 2 tiếng): Đối thoại, nhận xét, chất vấn kỹ thuật & 10 tình huống thực chiến.
 *    - 11:45 - 12:00 (15p): Tổng kết, thông qua Scope Freeze Matrix & Cam kết bàn giao.
 */

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
const DOC_DIR = path.join(ROOT_DIR, 'document');
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps', 'ceo1983_app_fe', 'public', 'docs');

[DOC_DIR, FE_DOCS_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const FONT = 'Times New Roman';
const COLOR_NAVY = '003B95';
const COLOR_GOLD = 'D97706';
const COLOR_DARK = '1E293B';
const COLOR_MUTED = '475569';
const COLOR_BORDER = 'CBD5E1';
const COLOR_BG_HEADER = '003B95';
const COLOR_BG_GOLD_TINT = 'FFFBEB';
const COLOR_BG_BLUE_TINT = 'EFF6FF';
const COLOR_BG_GREEN_TINT = 'F0FDF4';

const BORDER_LIGHT = {
  top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
};

function createSpeechSection(partTitle, timeRange, corePhilosophy, speechTextBlocks, stageActionGuide) {
  const rows = [];

  // 1. Tiêu đề phân đoạn
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_HEADER },
          margins: { top: 120, bottom: 120, left: 160, right: 160 },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${partTitle.toUpperCase()} [ ${timeRange} ]`,
                  bold: true,
                  size: 24,
                  color: 'FFFFFF',
                  font: FONT,
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  // 2. Khẩu quyết tư duy & Mục tiêu cốt lõi
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_GOLD_TINT },
          borders: BORDER_LIGHT,
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: '⚡ TÂM THẾ & KHẨU QUYẾT DIỄN GIẢ: ',
                  bold: true,
                  size: 21,
                  color: COLOR_GOLD,
                  font: FONT,
                }),
                new TextRun({
                  text: corePhilosophy,
                  bold: true,
                  size: 21,
                  color: COLOR_DARK,
                  font: FONT,
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  // 3. Lời nói nguyên văn của diễn giả (Trau chuốt văn phong đỉnh cao)
  const speechParas = speechTextBlocks.map((block) => {
    if (typeof block === 'string') {
      return new Paragraph({
        spacing: { before: 80, after: 80, line: 280 },
        children: [
          new TextRun({
            text: block,
            size: 22,
            color: COLOR_DARK,
            font: FONT,
          }),
        ],
      });
    } else {
      // Object chứa heading hoặc nhấn mạnh
      return new Paragraph({
        spacing: { before: block.before || 100, after: block.after || 80, line: 280 },
        children: [
          new TextRun({
            text: block.prefix ? block.prefix + ' ' : '',
            bold: true,
            size: block.size || 22,
            color: block.color || COLOR_NAVY,
            font: FONT,
          }),
          new TextRun({
            text: block.text,
            bold: block.bold || false,
            italics: block.italics || false,
            size: block.size || 22,
            color: block.textColor || COLOR_DARK,
            font: FONT,
          }),
        ],
      });
    }
  });

  rows.push(
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: BORDER_LIGHT,
          margins: { top: 140, bottom: 140, left: 160, right: 160 },
          children: [
            new Paragraph({
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: '🗣 LỜI NÓI NGUYÊN VĂN CỦA DIỄN GIẢ (NÂNG TẦM LỜI LẼ - ĐĨNH ĐẠC, TRUYỀN CẢM, KHÚC CHIẾT):',
                  bold: true,
                  size: 20,
                  color: COLOR_NAVY,
                  font: FONT,
                }),
              ],
            }),
            ...speechParas,
          ],
        }),
      ],
    })
  );

  // 4. Chỉ dẫn tác phong sân khấu & Thao tác màn hình
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_BLUE_TINT },
          borders: BORDER_LIGHT,
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: '🎬 TÁC PHONG SÂN KHẤU & THAO TÁC MÀN HÌNH TƯƠNG ỨNG: ',
                  bold: true,
                  size: 20,
                  color: COLOR_NAVY,
                  font: FONT,
                }),
                new TextRun({
                  text: stageActionGuide,
                  size: 20,
                  color: COLOR_DARK,
                  font: FONT,
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows,
  });
}

function createScenarioCard(num, scenarioTitle, partnerContext, speakerResponse) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: '0A1E3F' },
            margins: { top: 80, bottom: 80, left: 140, right: 140 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `TÌNH HUỐNG THỰC CHIẾN #${num}: ${scenarioTitle.toUpperCase()}`,
                    bold: true,
                    size: 21,
                    color: 'FFFFFF',
                    font: FONT,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: 'FEF2F2' },
            borders: BORDER_LIGHT,
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: '❓ Băn khoăn / Chất vấn từ Đối tác: ', bold: true, size: 20, color: 'B91C1C', font: FONT }),
                  new TextRun({ text: partnerContext, italics: true, size: 20, color: '7F1D1D', font: FONT }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: 'F0FDF4' },
            borders: BORDER_LIGHT,
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
            children: [
              new Paragraph({
                spacing: { line: 276 },
                children: [
                  new TextRun({ text: '💡 Nghệ thuật đối đáp đĩnh đạc (Nói gãy gọn, thấu tình đạt lý): ', bold: true, size: 20, color: '15803D', font: FONT }),
                  new TextRun({ text: speakerResponse, size: 20, color: '14532D', font: FONT }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

async function buildElevatedSpeakerDocx() {
  console.log('>>> [1/2] Đang tạo file Word (.docx) KỊCH BẢN NÓI HỌC THUỘC LÒNG Nâng Tầm Lời Lẽ...');

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1100, bottom: 1100, left: 1200, right: 1200 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'KỊCH BẢN THUYẾT TRÌNH BÁO CÁO · CLB DOANH NHÂN CEO 1983 (HANOIBA)',
                    size: 16,
                    color: COLOR_MUTED,
                    font: FONT,
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
                  new TextRun({ text: 'Trang ', size: 18, color: COLOR_MUTED, font: FONT }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, color: COLOR_MUTED, font: FONT }),
                  new TextRun({ text: ' / ', size: 18, color: COLOR_MUTED, font: FONT }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: COLOR_MUTED, font: FONT }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Tiêu đề
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: 'KỊCH BẢN NÓI & NGHỆ THUẬT THUYẾT TRÌNH BÁO CÁO GIẢI PHÁP',
                bold: true,
                size: 30,
                color: COLOR_NAVY,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: 'HỆ SINH THÁI SỐ KÉP: WEB CRM QUẢN TRỊ HIỆP HỘI & MOBILE APP CEO 1983',
                bold: true,
                size: 24,
                color: COLOR_GOLD,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'HỘI NGHỊ LÀM VIỆC 3 TIẾNG (09:00 – 12:00 THỨ TƯ) · BẢN NÂNG CẤP VĂN PHONG DOANH NHÂN CAO CẤP',
                italics: true,
                size: 20,
                color: COLOR_MUTED,
                font: FONT,
              }),
            ],
          }),

          // Box Triết lý & Chỉ đạo cốt lõi
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.CLEAR, fill: COLOR_BG_GOLD_TINT },
                    borders: BORDER_LIGHT,
                    margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: '💎 3 NGUYÊN TẮC VÀNG VỀ TÂM THẾ & LỜI LẼ CỦA DIỄN GIẢ:',
                            bold: true,
                            size: 21,
                            color: COLOR_GOLD,
                            font: FONT,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 80 },
                        children: [
                          new TextRun({
                            text: '1. Nâng Tầm Lời Lẽ - Không Đọc Gạch Đầu Dòng Cộc Lốc: ',
                            bold: true,
                            size: 20,
                            font: FONT,
                          }),
                          new TextRun({
                            text: 'Sử dụng văn phong trang trọng, đĩnh đạc, thấu cảm sâu sắc nỗi vất vả của Ban Điều Hành kiêm nhiệm. Nói năng khúc chiết, có mở đầu, có phát triển chiều sâu và có cam kết vững chãi.',
                            size: 20,
                            font: FONT,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 60 },
                        children: [
                          new TextRun({
                            text: '2. Khẳng Định 2 Luồng Huyết Mạch Sống Còn: ',
                            bold: true,
                            size: 20,
                            font: FONT,
                          }),
                          new TextRun({
                            text: 'Luồng Sự kiện gắn liền mật thiết với Luồng Thanh toán tài chính (từ dự toán, thu VietQR 1s đến Sổ Quỹ Tiền Mặt chuẩn Thông tư 200/2014/TT-BTC nộp HanoiBA) và Luồng Xúc tiến thương mại B2B là 2 trục xương sống định hình giá trị của hiệp hội.',
                            size: 20,
                            font: FONT,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 60 },
                        children: [
                          new TextRun({
                            text: '3. Định Vị Bộ Công Cụ Vận Hành Thực Tế Dưới Góc Nhìn Kỹ Thuật ViConnect: ',
                            bold: true,
                            size: 20,
                            font: FONT,
                          }),
                          new TextRun({
                            text: 'TUYỆT ĐỐI KHÔNG NÓI LÀ "MIỄN PHÍ" HAY "TẶNG THÊM". Tuyên bố rạch ròi: Quản lý công việc Kanban, Quản lý cuộc họp số & Điểm danh QR 30s, Kho tài liệu số và VoIP hoàn toàn NẰM NGOÀI PHẠM VI YÊU CẦU BAN ĐẦU CỦA CEO 1983. Nhưng xuất phát từ góc nhìn của đội ngũ phát triển kỹ thuật và năng lực công nghệ thực chiến của ViConnect, chúng em chủ động kiến tạo sẵn để giải quyết triệt để bài toán vận hành 365 ngày của BĐH, không để các anh chị phải chắp vá trên Zalo hay Google Drive!',
                            size: 20,
                            font: FONT,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // PHẦN 1: MỞ ĐẦU HỘI NGHỊ (09:00 - 09:10)
          createSpeechSection(
            'Phần 1: Khởi Động Hội Nghị & Định Hình Quy Chuẩn 3 Tiếng',
            '09:00 – 09:10 (10 Phút)',
            'Phong thái đĩnh đạc, ấm áp, thấu cảm; tuyên bố dứt khoát lộ trình 3 tiếng chuẩn mực từ 09:00 đến 12:00.',
            [
              '“Lời đầu tiên, cho phép em thay mặt toàn thể liên minh công nghệ ViConnect & ViOne, xin được gửi lời chào trân trọng nhất, lời chúc sức khỏe và thành công tới anh Chủ tịch, các anh chị trong Ban Thường Trực, Ban Điều Hành và đại diện 6 Ban Chuyên Môn của CLB Doanh Nhân CEO 1983 – Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA).',
              'Thưa các anh chị, chúng em vô cùng thấu hiểu rằng: Mỗi anh chị ngồi đây đều là những chủ doanh nghiệp đang gánh vác trách nhiệm điều hành kinh doanh lớn, nhưng vẫn dành trọn tâm huyết, thời gian và công sức để phụng sự cho sự phát triển của mái nhà chung CEO 1983. Chính vì vậy, sự hiện diện đầy đủ của các anh chị trong buổi sáng ngày hôm nay là một niềm vinh dự to lớn, đồng thời cũng là nguồn động lực và trách nhiệm rất lớn đối với đội ngũ phát triển chúng em.',
              'Về phía đoàn công tác chúng em hôm nay, có đại diện Ban Lãnh đạo ViConnect & ViOne, Giám đốc giải pháp công nghệ, các kỹ sư trưởng phụ trách kiến trúc hệ thống và em là [Họ tên] – Trưởng đại diện Đội ngũ Triển khai, người sẽ trực tiếp đồng hành, báo cáo và giải trình cùng các anh chị.',
              'Để buổi làm việc đạt hiệu quả cao nhất và tôn trọng tuyệt đối quỹ thời gian quý báu của các CEO, hội nghị hôm nay được ấn định bắt đầu đúng 09h00 sáng và bế mạc đúng 12h00 trưa, được phân bổ khoa học thành 3 giai đoạn rõ ràng:',
              {
                prefix: '• Giai đoạn 1 (09h00 – 09h45, 45 phút):',
                text: 'Báo cáo tổng quan kiến trúc giải pháp và Trình diễn thực tế (Live Demo) trên cả 2 nền tảng: Web CRM Quản trị tháp chỉ huy và Ứng dụng Mobile App dành riêng cho hội viên.',
                bold: true,
                textColor: COLOR_NAVY,
              },
              {
                prefix: '• Giai đoạn 2 (09h45 – 11h45, tròn 120 phút / 2 tiếng):',
                text: 'Phiên nhận xét, trao đổi, chất vấn kỹ thuật và phản biện đa chiều trực tiếp giữa Ban Điều Hành và Đội ngũ Kỹ thuật ViConnect để giải quyết triệt để từng băn khoăn.',
                bold: true,
                textColor: COLOR_NAVY,
              },
              {
                prefix: '• Giai đoạn 3 (11h45 – 12h00, 15 phút):',
                text: 'Tổng kết, đối soát và ký duyệt Bảng ma trận chốt chức năng hệ thống (Scope Freeze Matrix), thống nhất kế hoạch hành động 7 ngày và bế mạc đúng 12h00 trưa.',
                bold: true,
                textColor: COLOR_GOLD,
              },
              'Trước khi bước vào nội dung chi tiết, em xin trân trọng kính mời anh Chủ tịch và các anh chị trong Ban Thường Trực có đôi lời phát biểu và giới thiệu các thành viên tham dự để đoàn chúng em tiện xưng hô và làm việc ạ!”',
            ],
            'Đứng thẳng đĩnh đạc, hai tay mở tự nhiên, ánh mắt giao lưu ấm áp bao quát toàn phòng họp. Khi BĐH phát biểu, lắng nghe với thái độ cầu thị, mỉm cười và gật đầu ghi nhận.'
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // PHẦN 2: BỐI CẢNH & 2 LUỒNG TRỌNG TÂM HUYẾT MẠCH (09:10 - 09:25)
          createSpeechSection(
            'Phần 2: 3 Nỗi Đau Vận Hành Thực Tế & Định Vị 2 Luồng Trọng Tâm Huyết Mạch',
            '09:10 – 09:25 (15 Phút)',
            'Chạm đúng tim đen của vận hành hiệp hội; khẳng định 2 luồng cốt lõi: Thanh toán tài chính khép kín & Xúc tiến thương mại B2B.',
            [
              '“Kính thưa các anh chị, trong suốt quá trình khảo sát và làm việc cùng Ban Thư ký cũng như các Trưởng Ban chuyên môn, chúng em nhận thấy công tác điều hành một hiệp hội doanh nhân với hơn 500 thành viên có những đặc thù rất phức tạp. Chúng em đúc kết lại 3 nỗi đau thực tế lớn nhất mà CLB đang phải đối mặt mỗi ngày:',
              {
                prefix: '1. Nỗi đau thứ nhất về Quản trị dữ liệu hội viên:',
                text: 'Hơn 500 hồ sơ doanh nghiệp nhưng bị phân tán rải rác trên các file Excel cá nhân, danh sách Zalo và giấy tờ lưu trữ. Mỗi lần cần tra cứu một đối tác theo ngành nghề để kết nối, hay mỗi khi có hội viên mới gia nhập, quy trình xét duyệt qua nhiều cấp diễn ra rất chậm chạp. Quan trọng hơn, các doanh nhân 1983 vẫn đang thiếu một tấm thẻ định danh số xứng tầm và một danh thiếp thông minh để khẳng định thương hiệu cá nhân khi đi giao thương bên ngoài.',
              },
              {
                prefix: '2. Nỗi đau thứ hai về Quản trị sự kiện gắn liền với tài chính:',
                text: 'Từ trước đến nay, chúng ta thường nhìn nhận sự kiện chỉ đơn thuần là công tác bán vé và soát vé ở cửa. Nhưng dưới góc độ quản trị chuyên sâu, sự kiện chính là một bài toán quản trị dòng tiền khép kín và nhạy cảm nhất của hiệp hội! Dòng tiền đi từ khâu dự toán ngân sách, thu phí tham dự, thu tiền tài trợ qua tài khoản, thu tiền mặt trực tiếp tại bàn tiếp đón; sau đó là tạm ứng kinh phí cho Ban Sự kiện để đặt tiệc, thuê âm thanh ánh sáng; rồi đến khâu hoàn ứng tiền thừa, quyết toán chi phí thực tế và cuối cùng là kết chuyển vào Sổ quỹ tiền mặt nội bộ để báo cáo minh bạch trước toàn thể hội viên và nộp lên Hội Doanh nghiệp Trẻ Hà Nội. Nếu không có phần mềm, Ban Tài chính và Ban Thư ký sẽ rơi vào một ma trận chứng từ và rủi ro thất thoát rất lớn.',
              },
              {
                prefix: '3. Nỗi đau thứ ba về Hiệu quả Xúc tiến thương mại B2B:',
                text: 'Mục đích lớn nhất của một doanh nhân khi tham gia CLB là tìm kiếm bạn bè, đối tác và cơ hội kinh doanh. Tuy nhiên, hiện tại các bài đăng giới thiệu sản phẩm hay tìm kiếm đối tác đều bị trôi mất trên các nhóm chat Zalo chỉ sau vài giờ. Chúng ta không có sàn giao dịch tập trung, không có bộ lọc ngành nghề, và Ban Điều Hành hoàn toàn không đo lường được tổng giá trị giao thương thực tế mà CLB đã tạo ra cho các hội viên là bao nhiêu tỷ đồng mỗi năm.',
              },
              'Xuất phát từ 3 bài toán gốc rễ đó, ViConnect đã không chọn cách tiếp cận chắp vá, mà chúng em đã thiết kế nên một Hệ sinh thái công nghệ kép toàn diện, được vận hành dựa trên 2 LUỒNG TRỌNG TÂM HUYẾT MẠCH:',
              {
                prefix: '• LUỒNG HUYẾT MẠCH THỨ NHẤT - THANH TOÁN & TÀI CHÍNH TOÀN DIỆN:',
                text: 'Kiểm soát chuỗi dòng tiền khép kín từ lúc phát sinh đến lúc quyết toán. Tích hợp cổng thanh toán VietQR Napas 24/7 gạch nợ tự động sau đúng 1 giây; đồng bộ toàn diện vào Sổ Quỹ Tiền Mặt và Sổ Tiền Gửi Ngân Hàng chuẩn Thông tư 200/2014/TT-BTC (Mẫu S07-DN / S03a-DNN) có công thức tự động, đọc số tiền bằng chữ và xuất báo cáo Excel/PDF hoàn hảo để trình nộp HanoiBA.',
                bold: true,
                textColor: COLOR_NAVY,
              },
              {
                prefix: '• LUỒNG HUYẾT MẠCH THỨ HAI - XÚC TIẾN THƯƠNG MẠI B2B THỰC CHIẾN:',
                text: 'Xây dựng tấm thẻ hội viên điện tử thông minh tích hợp Dynamic QR vCard 1 chạm, Company Profile 2 trang chuyên nghiệp, Sàn Marketplace ưu đãi nội bộ, Bảng Deal Cung – Cầu trực tuyến và cơ chế đặt lịch hẹn giao thương 1-on-1 đồng bộ vào lịch điện thoại cá nhân.',
                bold: true,
                textColor: COLOR_GOLD,
              },
              'Và ngay sau đây, em xin phép được mời các anh chị cùng hướng mắt lên màn hình lớn để chúng ta trực tiếp trải nghiệm giải pháp này hoạt động trên điện thoại thật và máy tính thật!'
            ],
            'Chiếu Slide 3 (3 Nỗi đau) ➔ Slide 4 (Hệ sinh thái kép) ➔ Slide 5 (Sơ đồ chuỗi dòng tiền). Giọng nói truyền cảm, dứt khoát, tự tin.'
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // PHẦN 3A: DEMO THỰC TẾ MOBILE APP HỘI VIÊN (09:25 - 09:35)
          createSpeechSection(
            'Phần 3A: Demo Thực Tế Trải Nghiệm Mobile App Hội Viên CEO 1983',
            '09:25 – 09:35 (10 Phút)',
            'Trực quan, mượt mà; chạm đến đâu nói đến đó; nhấn mạnh tính độc bản của Thẻ VIP và tính năng không cần cài app.',
            [
              '“Em xin phép kết nối màn hình chiếc điện thoại trên tay em lên màn chiếu lớn để các anh chị cùng quan sát giao diện hội viên thực tế:',
              {
                prefix: '1. Nhận diện thương hiệu đẳng cấp:',
                text: 'Toàn bộ ứng dụng được khoác lên màu áo nhận diện chính thức của CLB Doanh Nhân CEO 1983 với tông màu Deep Cobalt Navy uy quyền phối hợp cùng Warm Amber Gold hoàng kim, điểm xuyết logo dập nổi 1983 tinh tế, tạo nên cảm giác vô cùng sang trọng và tự hào cho mỗi hội viên khi cầm trên tay.',
              },
              {
                prefix: '2. Thẻ Hội Viên VIP & Danh Thiếp Số Kép (Điểm nhấn độc bản của hệ thống):',
                text: 'Trên màn hình là tấm thẻ VIP điện tử mạ vàng mang mã định danh duy nhất của từng CEO (ví dụ M1983-268). Chúng em đã phát triển cơ chế Danh Thiếp Kép cực kỳ thông minh: một danh thiếp cho công việc chính và một danh thiếp cho hoạt động kinh doanh riêng lẻ. Đặc biệt, hội viên có toàn quyền chủ động Bật hoặc Tắt hiển thị số điện thoại cá nhân để bảo vệ quyền riêng tư. Khi các anh chị gặp gỡ đối tác bên ngoài, đối tác chỉ cần dùng camera điện thoại thông thường quét mã QR là NGAY LẬP TỨC LƯU VCARD VÀO DANH BẠ ĐIỆN THOẠI MÀ HOÀN TOÀN KHÔNG CẦN CÀI APP! Đồng thời, đối tác có thể vuốt xuống để xem trọn vẹn Hồ sơ năng lực doanh nghiệp (Company Profile) 2 trang sắc nét bên dưới.',
              },
              {
                prefix: '3. Danh Bạ CEO 11 Ngành Nghề & Đặt Lịch Hẹn 1-on-1:',
                text: 'Hội viên có thể dễ dàng tra cứu bạn bè theo từng ban chuyên môn, ngành nghề xây dựng, tài chính, công nghệ, truyền thông... Chỉ với 1 chạm, anh chị có thể gọi điện, nhắn tin hoặc gửi lời mời "Hẹn gặp giao lưu B2B 1-on-1", hệ thống sẽ tự động đồng bộ thời gian vào Google Calendar hoặc Apple Calendar trên điện thoại của cả hai bên.',
              },
              {
                prefix: '4. Sàn Giao Thương Marketplace & Bảng Deal Cung – Cầu:',
                text: 'Nơi mỗi doanh nghiệp CEO 1983 được mở gian hàng số độc quyền, đăng tải các gói sản phẩm kèm mức chiết khấu ưu đãi dành riêng cho thành viên trong CLB. Bảng Deal cho phép đăng tải nhu cầu cần mua, cần bán có giá trị cụ thể, biến ứng dụng thành một cỗ máy tạo doanh thu thực sự cho các hội viên.',
              },
              {
                prefix: '5. Quản Lý Sự Kiện & Ví Vé Điện Tử QR E-Ticket:',
                text: 'Khi có sự kiện Gala hay Tọa đàm, vé điện tử xuất hiện ngay trên app, hiển thị chính xác số bàn, số ghế VIP đã được xếp. Tại cửa hội trường, camera quét QR tốc độ cực nhanh dưới 1 giây, hoạt động mượt mà kể cả khi mạng 4G chập chờn nhờ cơ chế bộ nhớ đệm Offline Cache cục bộ.',
              },
            ],
            'Cầm điện thoại di chuyển tự nhiên trên sân khấu. Chạm ngón tay vào từng mục trên app để màn chiếu phản hồi tức thì. Mời 1 Trưởng ban dùng camera quét thử mã QR trên màn hình.'
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // PHẦN 3B: DEMO THỰC TẾ WEB CRM QUẢN TRỊ TRUNG TÂM (09:35 - 09:45)
          createSpeechSection(
            'Phần 3B: Demo Thực Tế Web CRM Quản Trị – Tháp Chỉ Huy Trung Tâm & Sổ Quỹ TT200',
            '09:35 – 09:45 (10 Phút)',
            'Khẳng định tính minh bạch tài chính, kỷ luật hệ thống, giảm 85% thao tác thủ công cho Ban Thư ký & Ban Tài chính.',
            [
              '“Bây giờ, em xin phép chuyển sang màn hình máy tính của Web CRM Quản trị – nơi được mệnh danh là Tháp chỉ huy trung tâm của Ban Điều Hành:',
              {
                prefix: '1. Executive Dashboard 360 Độ:',
                text: 'Chỉ cần mở màn hình tổng quan, Chủ tịch và Ban Thường Trực có thể nắm bắt toàn bộ nhịp đập của CLB trong thời gian thực: tổng số hội viên chính thức, tỷ lệ đóng hội phí niên độ 2026, số lượng sự kiện đang mở đăng ký, số lượng giao dịch thành công và biểu đồ dòng tiền thu chi minh bạch.',
              },
              {
                prefix: '2. Quy Trình Thẩm Định Xét Duyệt Hội Viên 3 Bước Chặt Chẽ:',
                text: 'Đăng ký từ cổng thông tin ➔ Ban Thư ký tiếp nhận kiểm tra tính hợp lệ ➔ Ban Thành viên thẩm định doanh nghiệp ➔ Thường trực BĐH phê duyệt cấp mã thẻ M1983. Toàn bộ hồ sơ được lưu trữ tập trung, không một trang giấy nào bị thất lạc.',
              },
              {
                prefix: '3. Phân Quyền Vai Trò RBAC Cho 6 Ban Chuyên Môn:',
                text: 'Ban nào chỉ thao tác đúng thẩm quyền của ban đó. Ban Sự kiện quản lý sơ đồ rạp và khách mời; Ban Tài chính quản lý sổ thu chi; Ban Thành viên quản lý hồ sơ hội viên. Nhật ký hệ thống (Audit Log) ghi nhận chi tiết ai đã thêm, sửa, xóa dữ liệu vào thời điểm nào, đảm bảo tính bảo mật và kỷ luật tuyệt đối.',
              },
              {
                prefix: '4. Đỉnh Cao Quản Trị Tài Chính – Sổ Quỹ Tiền Mặt Chuẩn Thông Tư 200/2014/TT-BTC:',
                text: 'Đây là tính năng mà đội ngũ kỹ sư ViConnect tự hào nhất! Hệ thống không chỉ quản lý thu hội phí mà quản lý toàn trình dòng tiền sự kiện: Tạm ứng kinh phí cho Ban Sự kiện ➔ Hoàn ứng tiền thừa ➔ Quyết toán chi phí thực tế. Tích hợp cổng VietQR Napas 24/7 gạch nợ tự động. Hệ thống tự động biên soạn và kết xuất Sổ Quỹ Tiền Mặt (Mẫu S07-DN / S03a-DNN) và Sổ Tiền Gửi Ngân Hàng với đầy đủ công thức Tồn đầu kỳ, Phát sinh Thu, Phát sinh Chi, Tồn cuối kỳ, dịch số tiền bằng chữ chuẩn xác ngữ pháp tiếng Việt và xuất ra file Excel, PDF có sẵn chữ ký để nộp báo cáo cho Hội Doanh Nghiệp Trẻ Hà Nội bất kỳ lúc nào!”',
              },
            ],
            'Thao tác máy tính Web CRM. Chiếu màn hình Sổ Quỹ Thông tư 200, bấm nút "Xuất Excel" để tải file mẫu S07-DN mở lên cho BĐH xem công thức tính toán tự động.'
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // PHẦN 3C: BỘ CÔNG CỤ QUẢN TRỊ THỰC TẾ (ĐẶC BIỆT THEO YÊU CẦU CỦA USER)
          createSpeechSection(
            'Phần 3C: Góc Nhìn Kỹ Thuật ViConnect Về Bộ Công Cụ Hỗ Trợ Công Việc Thực Tế (Ngoài Phạm Vi BRD Ban Đầu)',
            '09:45 – 09:55 (10 Phút)',
            'Tuyên bố thẳng thắn: Nằm ngoài yêu cầu ban đầu, nhưng do ViConnect chủ động phát triển từ năng lực công nghệ lõi và sự thấu cảm vận hành 365 ngày.',
            [
              '“Kính thưa anh Chủ tịch và toàn thể Ban Điều Hành,',
              'Đến phần này, em xin phép được dừng lại ít phút để chia sẻ một câu chuyện rất chân thành từ đáy lòng của những người làm kỹ thuật và kiến tạo giải pháp tại ViConnect.',
              {
                prefix: 'SỰ THẬT VỀ PHẠM VI DỰ ÁN BAN ĐẦU:',
                text: 'Trong bản Đề bài yêu cầu nghiệp vụ ban đầu (BRD gốc) mà CLB Doanh Nhân CEO 1983 đặt hàng cho chúng em, phạm vi công việc chỉ gói gọn trong 3 bài toán chính: Danh bạ hội viên, Điểm danh sự kiện và Xúc tiến thương mại B2B. Toàn bộ các phân hệ về Quản lý công việc, Quản lý cuộc họp, Kho tài liệu số tập trung hay Đàm thoại VoIP nội bộ HOÀN TOÀN NẰM NGOÀI PHẠM VI YÊU CẦU BAN ĐẦU của các anh chị.',
                bold: true,
                textColor: COLOR_GOLD,
              },
              'Nhưng khi bắt tay vào thiết kế kiến trúc hệ thống, đội ngũ kỹ sư của ViConnect đã tự đặt cho mình một câu hỏi vô cùng trăn trở:',
              '‘Liệu rằng sau khi bàn giao một ứng dụng thật đẹp, một trang web thật hào nhoáng, thì Ban Điều Hành CEO 1983 có thực sự được giải phóng sức lao động hay không?’',
              'Câu trả lời thực tế là KHÔNG! Bởi vì hiệp hội không chỉ sống trong những ngày tổ chức sự kiện hay những kỳ sinh hoạt định kỳ. Nhịp đập thực sự của CLB nằm ở 365 ngày làm việc thường nhật của Ban Thường Trực, Ban Thư Ký và 6 Ban Chuyên Môn.',
              'Nếu chúng em chỉ làm đúng những gì được yêu cầu, thì ngày mai đây:',
              '• Khi Ban Thường Trực muốn giao việc cho Ban Sự kiện hay Ban Hội viên, các anh chị vẫn phải nhắn tin lên các nhóm Zalo, để rồi các đầu việc bị trôi đi mất giữa hàng trăm tin nhắn chúc mừng, hỏi thăm.',
              '• Khi Ban Thư ký cần tổ chức một cuộc họp BĐH, các anh chị vẫn phải gõ lịch thủ công, đính kèm file rời rạc qua email, và khi họp thì không có công cụ điểm danh minh bạch.',
              '• Khi một hội viên mới hay một Trưởng ban cần tìm lại bản Điều lệ CLB, Quy chế tài chính hay mẫu đơn đề xuất, các anh chị lại phải lục tung Google Drive hay hỏi xin nhau từng file tài liệu.',
              'Đó là một sự lãng phí tài nguyên và khiến cho việc chuyển đổi số trở nên nửa vời!',
              {
                prefix: 'GÓC NHÌN CỦA NGƯỜI LÀM CÔNG NGHỆ THỰC CHIẾN TẠI VICONNECT:',
                text: 'Chính vì vậy, bằng năng lực làm chủ công nghệ lõi và tinh thần làm sản phẩm bằng cả cái tâm của người làm kỹ thuật, ViConnect đã CHỦ ĐỘNG KIẾN TẠO VÀ TÍCH HỢP SẴN SÀNG TRỌN BỘ CÔNG CỤ VẬN HÀNH THỰC TẾ này vào hệ thống! Chúng em làm điều này để chứng minh năng lực phát triển của ViConnect, và quan trọng hơn cả là để mang lại một giải pháp trọn vẹn nhất cho CLB:',
                bold: true,
                textColor: COLOR_NAVY,
              },
              {
                prefix: '1. Hệ Thống Quản Lý Công Việc & Bảng Giao Việc Kanban 6 Ban Chuyên Môn:',
                text: 'Chủ tịch, Tổng Thư ký và các Trưởng ban có thể tạo việc, phân công người chịu trách nhiệm, đặt hạn chót (deadline) và theo dõi tiến độ công việc theo từng cột trạng thái: Cần làm -> Đang làm -> Hoàn thành. Ban Sự kiện chuẩn bị sân khấu đến đâu, Ban Tài chính làm dự toán đến đâu, tất cả hiện lên trực quan, triệt tiêu 100% tình trạng sót việc hay đùn đẩy trách nhiệm.',
              },
              {
                prefix: '2. Hệ Thống Quản Trị Cuộc Họp & Điểm Danh Bằng Mã QR Động (Sapphire Hub):',
                text: 'Số hóa toàn bộ lịch họp của BĐH và các ban. Tài liệu họp và chương trình nghị sự được đính kèm trực tiếp trong lịch để các đại biểu đọc trước trên điện thoại. Đặc biệt, tính năng Điểm danh cuộc họp bằng Dynamic QR Code – mã QR tự động thay đổi sau mỗi 30 giây trên màn hình máy chiếu, ngăn chặn hoàn toàn việc chụp ảnh gửi ra ngoài để điểm danh hộ, tự động xuất biên bản điểm danh ngay khi cuộc họp kết thúc.',
              },
              {
                prefix: '3. Kho Lưu Trữ Tài Liệu Số Tập Trung (Knowledge Hub):',
                text: 'Nơi lưu trữ chính thức toàn bộ Điều lệ CLB, Quy chế thu chi, Quy chuẩn văn hóa 1983, Mẫu đơn đăng ký, Hợp đồng tài trợ và Kỷ yếu các nhiệm kỳ. Mọi thành viên chỉ cần mở ứng dụng là có thể tra cứu và tải về tức thì file Word, PDF chuẩn mực mọi lúc mọi nơi.',
              },
              {
                prefix: '4. Đàm Thoại VoIP Mã Hóa & Mạng Xã Hội Doanh Nhân Moments B2B:',
                text: 'Kênh gọi thoại và video nội bộ chất lượng HD, đổ chuông trực tiếp trên màn hình khóa điện thoại (Native CallKit) kể cả khi đã tắt app, kết nối thẳng tới đường dây nóng của Ban Thư ký. Không gian Moments B2B là một "LinkedIn nội bộ thu nhỏ" để các CEO đăng tải tin tức hoạt động doanh nghiệp một cách văn minh, không bị pha tạp bởi mạng xã hội bên ngoài.',
              },
              'Thưa các anh chị, những phân hệ này chính là câu trả lời đanh thép nhất cho năng lực R&D của ViConnect: Chúng em không phải đơn vị gia công nhận tiền làm theo đơn đặt hàng đơn thuần, mà ViConnect là Người Bạn Đồng Hành Công Nghệ Chiến Lược, sẵn sàng đầu tư chất xám và công nghệ để đưa CLB Doanh Nhân CEO 1983 trở thành ngọn cờ đầu về chuyển đổi số trong toàn bộ hệ thống HanoiBA!”'
            ],
            'Nói với giọng điệu đầy tự hào, chân thành và nhiệt huyết. Hướng ánh mắt thẳng vào Chủ tịch và Ban Thường Trực. Chiếu lần lượt màn hình Kanban, Lịch họp Sapphire Hub, Điểm danh QR 30s và Kho tài liệu trên CRM.'
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // PHẦN 4: PHIÊN THẢO LUẬN, CHẤT VẤN KỸ THUẬT (09:55 - 11:45)
          createSpeechSection(
            'Phần 4: Mở Phiên Thảo Luận, Nhận Xét & Chất Vấn Kỹ Thuật Chuyên Sâu',
            '09:55 – 11:45 (Tròn 120 Phút / 2 Tiếng)',
            'Lắng nghe khiêm tốn, ghi chép cẩn trọng; áp dụng quy tắc 4 bước đối đáp: Đồng cảm ➔ Giải trình kỹ thuật ➔ Cam kết giải pháp ➔ Xác nhận hài lòng.',
            [
              '“Kính thưa toàn thể hội nghị,',
              'Đúng theo kế hoạch thời gian đã cam kết, bây giờ là 09h45 (hoặc 09h55). Chúng em xin phép được khép lại phần báo cáo trình diễn sản phẩm để bước sang giai đoạn quan trọng nhất của hội nghị hôm nay:',
              {
                prefix: 'PHIÊN NHẬN XÉT, CHẤT VẤN KỸ THUẬT VÀ ĐỐI THOẠI TRỰC TIẾP TRONG 120 PHÚT:',
                text: 'Chúng em dành trọn vẹn 2 tiếng đồng hồ quý báu này để lắng nghe từng ý kiến đóng góp, từng câu hỏi chất vấn, thậm chí là những điểm các anh chị chưa hài lòng về giao diện hay quy trình vận hành.',
                bold: true,
                textColor: COLOR_NAVY,
              },
              'Đội ngũ kỹ thuật ViConnect đã mở sẵn Biểu Mẫu Tiếp Nhận Ý Kiến trên màn hình lớn. Từng câu hỏi của anh Chủ tịch và 6 Trưởng Ban chuyên môn sẽ được chúng em lắng nghe, ghi chép trung thực, giải trình ngay tại chỗ và thống nhất phân loại mức độ ưu tiên P0, P1, P2 để xử lý.',
              'Mục tiêu của chúng em không phải là bảo vệ quan điểm cá nhân, mà mục tiêu duy nhất là làm sao để hệ sinh thái số này khi bàn giao phải thực sự mượt mà, tiện dụng và mang lại niềm tự hào lớn nhất cho toàn thể hội viên CEO 1983.',
              'Sau đây, em xin trân trọng kính mời anh Chủ tịch, chị Tổng Thư ký và các anh chị Trưởng Ban Sự kiện, Ban Thành viên, Ban Tài chính, Ban Xúc tiến thương mại, Ban Truyền thông và Ban Thiện nguyện bắt đầu phiên thảo luận ạ!”'
            ],
            'Mở file Excel "BIEU_MAU_GHI_NHAN_Y_KIEN_TRAO_DOI_THU_4_CEO1983.xlsx" trên máy chiếu. Cầm bút ghi chép cẩn thận. Lắng nghe không ngắt lời đại biểu.'
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // PHẦN 5: CHỐT CHỨC NĂNG & SCOPE FREEZE (11:45 - 12:00)
          createSpeechSection(
            'Phần 5: Tổng Kết Cuộc Họp, Thông Qua Scope Freeze Matrix & Cam Kết Bàn Giao',
            '11:45 – 12:00 (15 Phút)',
            'Quyết đoán, chuẩn mực pháp lý; chốt 100% các tính năng đã đạt yêu cầu; khóa phạm vi giai đoạn 1 để đưa vào vận hành.',
            [
              '“Kính thưa anh Chủ tịch và toàn thể Ban Điều Hành,',
              'Đồng hồ hiện tại đã điểm 11h45. Trải qua đúng 2 tiếng thảo luận vô cùng sôi nổi, thẳng thắn và trách nhiệm, chúng ta đã tiếp nhận và thống nhất phương án xử lý cho toàn bộ các ý kiến đóng góp.',
              'Bây giờ, em xin phép đại diện hai bên được trình bày BẢNG MA TRẬN CHỐT CHỨC NĂNG HỆ THỐNG (SCOPE FREEZE MATRIX) để chúng ta cùng đối soát và ký kết nghiệm thu giai đoạn 1:',
              {
                prefix: '1. VỀ DANH MỤC 30 CHỨC NĂNG CỐT LÕI ĐÃ HOÀN THÀNH (CHỐT NGHIỆM THU 100%):',
                text: 'Toàn bộ 30 tính năng thuộc 5 nhóm giải pháp: Quản trị tài chính Sổ quỹ Thông tư 200, Danh bạ & Thẻ VIP hội viên, Quản lý sự kiện & Vé QR, Sàn giao thương B2B và Bộ công cụ vận hành thực tế đã được kiểm thử tự động, kết nối trực tiếp cơ sở dữ liệu thật và được BĐH đánh giá ĐẠT YÊU CẦU 100%. Hôm nay, hai bên chính thức ký kết Đóng Băng Phạm Vi Phát Triển (Scope Freeze) để chuẩn bị phát hành.',
                bold: true,
                textColor: COLOR_NAVY,
              },
              {
                prefix: '2. VỀ CÁC NỘI DUNG GÓP Ý TINH CHỈNH MINOR ĐÃ GHI NHẬN HÔM NAY:',
                text: 'ViConnect cam kết sẽ phân công kỹ sư phụ trách xử lý triệt để trong vòng 48 giờ làm việc, và báo cáo kết quả hoàn thành bằng văn bản gửi tới Ban Thường Trực.',
              },
              {
                prefix: '3. CAM KẾT VĂN BẢN VÀ LỘ TRÌNH TRIỂN KHAI 7 NGÀY:',
                text: '• Trong vòng 24 giờ: ViConnect hoàn thiện Biên Bản Cuộc Họp chính thức gửi Ban Thư ký lưu trữ.\n• Trong vòng 48 giờ: Gửi Văn bản Kế hoạch hành động triển khai (Action Plan) chi tiết từng mốc thời gian.\n• Đầu tuần tới: ViConnect tổ chức 01 buổi tập huấn đào tạo 30 phút chuyển giao công nghệ cho Ban Thư ký và 6 Ban chuyên môn.\n• Bàn giao trọn bộ bản cài đặt APK cho Android, bản cài cho iOS và bộ tài liệu hướng dẫn sử dụng chuẩn hóa PDF và Video clip ngắn.',
                bold: true,
                textColor: COLOR_DARK,
              },
              'Đúng 12h00 trưa! Hội nghị thẩm định và báo cáo giải pháp số hóa CLB Doanh Nhân CEO 1983 đã diễn ra tròn 3 tiếng đồng hồ và thành công ngoài mong đợi.',
              'Thay mặt toàn thể ban lãnh đạo và đội ngũ kỹ sư ViConnect & ViOne, em xin được cúi đầu cảm ơn sâu sắc nhất tới anh Chủ tịch, Ban Thường Trực và các anh chị Trưởng Ban đã tin tưởng, đồng hành và tạo mọi điều kiện thuận lợi nhất cho chúng em.',
              'Kính chúc CLB Doanh Nhân CEO 1983 ngày càng gắn kết, thịnh vượng và tiếp tục khẳng định vị thế dẫn đầu trong mái nhà chung HanoiBA! Em xin trân trọng cảm ơn!”'
            ],
            'Chiếu Slide 20 (Ma trận chốt chức năng) ➔ Slide 21 (Cam kết bàn giao) ➔ Slide 22 (Lời cảm ơn). Cúi đầu chào trân trọng, bắt tay Chủ tịch và Ban Lãnh đạo.'
          ),

          new Paragraph({ spacing: { before: 300 } }),

          // PHẦN BỔ SUNG: 10 TÌNH HUỐNG ĐỐI ĐÁP THỰC CHIẾN NÂNG CẤP LỜI LẼ
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 120 },
            children: [
              new TextRun({
                text: 'PHỤ LỤC: BỘ 10 TÌNH HUỐNG THỰC CHIẾN & NGHỆ THUẬT ĐỐI ĐÁP BẢO VỆ DỰ ÁN',
                bold: true,
                size: 24,
                color: COLOR_NAVY,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: '(CẨM NANG DÀNH RIÊNG CHO DIỄN GIẢ TRONG PHIÊN TRANH LUẬN 120 PHÚT 09:45 - 11:45)',
                italics: true,
                size: 19,
                color: COLOR_MUTED,
                font: FONT,
              }),
            ],
          }),

          createScenarioCard(
            1,
            'Bảo Mật Quyền Riêng Tư & Số Điện Thoại Cá Nhân Của CEO',
            '“Nhiều hội viên phản ánh không muốn công khai số điện thoại cá nhân vì sợ bị bên ngoài gọi điện chào mời bất động sản, bảo hiểm, làm phiền...”',
            '“Dạ thưa anh/chị, đây là bài toán bảo mật thông tin mà ViConnect đã lường trước ngay từ khâu thiết kế. Chúng em trang bị Cơ chế Danh Thiếp Kép và Công tắc Bật/Tắt Riêng Tư: Hội viên có toàn quyền ẩn số điện thoại trên danh thiếp chia sẻ. Khi đối tác quét mã QR, họ chỉ thấy thông tin tên doanh nghiệp, lĩnh vực hoạt động và form kết nối B2B mà không thấy số điện thoại riêng tư. Chỉ khi nào chính CEO đó chấp thuận kết nối 1-on-1, số điện thoại mới được hiển thị. Dữ liệu hội viên được mã hóa hoàn toàn và lưu trữ trên cụm máy chủ bảo mật tại Việt Nam.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioCard(
            2,
            'Check-In Quét Mã Vé QR Khi Hội Trường Bị Mất Mạng Hoặc Mạng 4G Nghẽn',
            '“Các sự kiện Gala thường tập trung 300 - 500 người vào cùng một thời điểm, sóng 4G thường bị sập hoặc wifi hội trường nghẽn mạng, liệu app có bị treo khi quét vé không?”',
            '“Dạ thưa Ban Sự kiện, đây chính là ưu thế vượt trội của công nghệ Native Scanner mà ViConnect phát triển. Ứng dụng Gatekeeper của chúng em được tích hợp bộ nhớ đệm Offline Cache: Toàn bộ danh sách vé và mã QR của sự kiện được tải sẵn về máy của ban tiếp đón trước giờ G. Kể cả khi hội trường mất sạch mạng internet, camera quét vé vẫn xác thực đại biểu hợp lệ và hiển thị số bàn, số ghế VIP chỉ sau 0.1 giây! Khi có mạng trở lại, hệ thống sẽ tự động đồng bộ ngầm dữ liệu lên máy chủ trung tâm mà không cần thao tác lại.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioCard(
            3,
            'Đối Tác Quét Danh Thiếp Có Bắt Buộc Phải Tải Ứng Dụng Không?',
            '“Mỗi lần đi gặp khách hàng đối tác bên ngoài mà bắt họ phải tải app CEO 1983 về máy thì họ sẽ rất phiền và ngại, có cách nào tiện hơn không?”',
            '“Dạ thưa các anh chị, câu trả lời là HOÀN TOÀN KHÔNG CẦN CÀI APP! Khi đối tác dùng bất kỳ camera điện thoại nào (iPhone hay Android) quét mã QR trên thẻ của anh chị, hệ thống sẽ tự động mở trang web định danh cao cấp trên trình duyệt web. Tại đây, đối tác chỉ cần bấm nút ‘Lưu danh thiếp’, toàn bộ họ tên, chức vụ, công ty, email của anh chị sẽ được nạp thẳng vào danh bạ điện thoại của họ qua định dạng chuẩn vCard. Đồng thời, họ có thể lướt xem trực tiếp Hồ sơ năng lực doanh nghiệp (Company Profile) 2 trang của anh chị ngay lập tức!”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioCard(
            4,
            'Minh Bạch Dòng Tiền & Cổng Thanh Toán Hội Phí VietQR',
            '“Tiền đóng hội phí và tiền vé sự kiện sẽ đi về đâu? Có qua tài khoản trung gian của ViConnect để giữ tiền không?”',
            '“Dạ đây là nguyên tắc đạo đức nghề nghiệp và pháp lý tối cao của ViConnect: Toàn bộ dòng tiền thu về từ hội phí hay vé sự kiện ĐI THẲNG 100% VỀ TÀI KHOẢN NGÂN HÀNG CHÍNH THỨC CỦA CLB DOANH NHÂN CEO 1983! ViConnect hoàn toàn không can thiệp, không giữ tiền và không thu bất kỳ phần trăm phí giao dịch nào. Mã VietQR động trên hệ thống được gắn mã số tham chiếu tự động, giúp kế toán gạch nợ sau đúng 1 giây và hạch toán thẳng vào Sổ Quỹ Tiền Mặt Thông tư 200!”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioCard(
            5,
            'Cam Kết Đồng Hành Dài Hạn & Bản Quyền Bộ Công Cụ Thực Tế',
            '“Sau này ViConnect có thu phí duy trì cao không? Các công cụ hỗ trợ như Quản lý công việc Kanban, Cuộc họp Sapphire Hub có bị khóa lại bắt mua thêm không?”',
            '“Dạ đây là lời cam kết danh dự của Ban Lãnh đạo ViConnect trước Ban Điều Hành: Chúng em coi CEO 1983 là mô hình kiểu mẫu chuyển đổi số thành công nhất của HanoiBA. Toàn bộ các phân hệ đã xây dựng cùng Bộ công cụ vận hành thực tế (Lịch họp QR 30s, Bảng Kanban, VoIP, Moments B2B, Sổ quỹ TT200) được bàn giao quyền sử dụng vĩnh viễn cho CLB, KHÔNG BAO GIỜ phát sinh chi phí bản quyền tính năng hay cắt bớt công cụ! ViConnect cam kết duy trì đội ngũ kỹ sư hỗ trợ kỹ thuật và bảo hành 24/7 dài hạn cho CLB!”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioCard(
            6,
            'Xử Lý Khi Có Trưởng Ban Đề Xuất Thêm Tính Năng Ngoài Phạm Vi (Scope Creep)',
            '“Một Trưởng ban đề xuất làm thêm tính năng chấm công nhân sự cho công ty riêng hoặc tính năng thương mại điện tử giao hàng...”',
            '“Dạ thưa anh/chị, ý tưởng của anh/chị rất hay và hữu ích cho bài toán quản trị doanh nghiệp nội bộ. Tuy nhiên, để hệ sinh thái số này tập trung đúng sứ mệnh cốt lõi của hiệp hội là GẮN KẾT & XÚC TIẾN GIAO THƯƠNG, đồng thời bảo đảm tiến độ bàn giao ứng dụng cho 500 hội viên cài đặt ngay trong tuần tới, em xin phép được ghi nhận ý tưởng này vào Danh mục 3: Lộ trình R&D nâng cấp định kỳ trong tương lai. Hôm nay, chúng ta cùng nhất trí chốt nghiệm thu 30 tính năng cốt lõi đang hoạt động hoàn hảo để sớm đưa vào vận hành thực tế ạ!”'
          ),
        ],
      },
    ],
  });

  const docxPath = path.join(DOC_DIR, 'KICH_BAN_LOI_NOI_HOC_THUOC_THUYET_TRINH_CEO1983.docx');
  const buffer = await Packer.toBuffer(doc);
  let savedPath = docxPath;
  try {
    fs.writeFileSync(docxPath, buffer);
  } catch (err) {
    if (err.code === 'EBUSY') {
      console.warn(`[WARN] File ${docxPath} đang mở, lưu vào file thay thế...`);
      savedPath = path.join(DOC_DIR, 'KICH_BAN_LOI_NOI_HOC_THUOC_THUYET_TRINH_CEO1983_MOI.docx');
      fs.writeFileSync(savedPath, buffer);
    } else {
      throw err;
    }
  }

  // Luôn ghi đè bản MOI để an toàn
  const altPath = path.join(DOC_DIR, 'KICH_BAN_LOI_NOI_HOC_THUOC_THUYET_TRINH_CEO1983_MOI.docx');
  fs.writeFileSync(altPath, buffer);

  // Copy sang FE docs
  const feDocsPath = path.join(FE_DOCS_DIR, 'KICH_BAN_LOI_NOI_HOC_THUOC_THUYET_TRINH_CEO1983.docx');
  fs.writeFileSync(feDocsPath, buffer);

  const stats = fs.statSync(savedPath);
  console.log(`✓ ĐÃ XUẤT THÀNH CÔNG BẢN WORD (.DOCX) NÂNG TẦM LỜI LẼ: ${savedPath} (${(stats.size / 1024).toFixed(1)} KB)`);
}

async function buildElevatedMarkdown() {
  console.log('>>> [2/2] Đang cập nhật kịch bản Markdown (.md) chi tiết...');

  const mdContent = `# KỊCH BẢN THUYẾT TRÌNH BÁO CÁO GIẢI PHÁP SỐ HÓA CLB DOANH NHÂN CEO 1983 (HANOIBA)
## HỘI NGHỊ THẨM ĐỊNH, LIVE DEMO & CHỐT PHẠM VI HỆ SINH THÁI SỐ (09:00 - 12:00 THỨ TƯ)
**Đơn vị phát triển:** ViConnect  
**Đối tác chủ quản:** Ban Thường Trực & Ban Điều Hành CLB Doanh Nhân CEO 1983 (HanoiBA)  
**Thời lượng:** Tròn 03 tiếng (180 phút liên tục)  

---

## MỤC LỤC KỊCH BẢN
1. [Khung Giờ Master Timeline Chuẩn (09:00 - 12:00)](#1-khung-giờ-master-timeline-chuẩn-0900---1200)
2. [Lời Thoại & Kịch Bản Hùng Biện Nâng Tầm Dành Cho Diễn Giả](#2-lời-thoại--kịch-bản-hùng-biện-nâng-tầm-dành-cho-diễn-giả)
   - Phần 1: Khởi động hội nghị & Định hình quy chuẩn (09:00 - 09:10)
   - Phần 2: 3 Nỗi đau vận hành & 2 Luồng Trọng tâm Huyết mạch (09:10 - 09:25)
   - Phần 3A: Live Demo Mobile App Hội viên (09:25 - 09:35)
   - Phần 3B: Live Demo Web CRM & Sổ Quỹ Thông tư 200 (09:35 - 09:45)
   - **Phần 3C: Phân tích Bộ Công Cụ Quản Trị Thực Tế ngoài yêu cầu ban đầu dưới góc nhìn kỹ thuật ViConnect (09:45 - 09:55)**
   - Phần 4: Phiên nhận xét, trao đổi & chất vấn kỹ thuật trong 120 phút (09:55 - 11:45)
   - Phần 5: Tổng kết, chốt Ma trận nghiệm thu Scope Freeze & Bế mạc đúng 12:00 (11:45 - 12:00)
3. [Phụ Lục: Cẩm Nang 10 Tình Huống Đối Đáp Thực Chiến Cho Diễn Giả](#3-phụ-lục-cẩm-nang-10-tình-huống-đối-đáp-thực-chiến-cho-diễn-giả)

---

## 1. KHUNG GIỜ MASTER TIMELINE CHUẨN (09:00 - 12:00)

| Mốc Thời Gian | Thời Lượng | Nội Dung Trọng Tâm | Tác Vụ Cốt Lõi | Người Thực Hiện |
|:---:|:---:|:---|:---|:---:|
| **09:00 - 09:10** | 10 phút | **Khởi động & Giới thiệu hai bên** | Tuyên bố mục tiêu 3 tiếng, định hình tâm thế tôn trọng, mời BĐH giới thiệu. | Diễn giả ViConnect & Chủ tịch BĐH |
| **09:10 - 09:25** | 15 phút | **3 Nỗi đau gốc & 2 Luồng Huyết mạch** | Chạm đúng nỗi đau vận hành: Hội viên phân tán, Sự kiện gắn dòng tiền, B2B trôi tin. Khẳng định 2 luồng cốt lõi. | Diễn giả ViConnect |
| **09:25 - 09:35** | 10 phút | **Live Demo Mobile App Hội viên** | Chiếu điện thoại thật: Thẻ VIP mạ vàng, Danh thiếp kép, vCard không cần app, Vé QR 0.1s. | Diễn giả (Thao tác điện thoại) |
| **09:35 - 09:45** | 10 phút | **Live Demo Web CRM & Sổ Quỹ TT200** | Chiếu máy tính thật: Dashboard 360°, Phân quyền 6 Ban, Sổ Quỹ Tiền Mặt TT200 Mẫu S07-DN xuất Excel/PDF. | Diễn giả (Thao tác CRM) |
| **09:45 - 09:55** | 10 phút | **Bộ Công Cụ Thực Tế ngoài BRD gốc** | **Khẳng định tính năng ngoài yêu cầu ban đầu**, chia sẻ góc nhìn kỹ thuật ViConnect giải quyết 365 ngày vận hành BĐH. | Diễn giả ViConnect |
| **09:55 - 11:45** | 110 phút | **Phiên Trao Đổi, Chất Vấn Kỹ Thuật** | Lắng nghe ý kiến 6 Trưởng Ban; điền trực tiếp vào Biểu Mẫu Excel; giải trình kỹ thuật thỏa đáng. | Hai bên đối thoại |
| **11:45 - 12:00** | 15 phút | **Tổng kết chốt Scope Freeze & Kế hoạch** | Thông qua Scope Freeze Matrix 30 tính năng (100% Pass), cam kết văn bản 24h/48h, bế mạc đúng 12:00. | Diễn giả & Chủ tịch BĐH |

---

## 2. LỜI THOẠI & KỊCH BẢN HÙNG BIỆN NÂNG TẦM DÀNH CHO DIỄN GIẢ

### Phần 1: Khởi Động Hội Nghị & Định Hình Quy Chuẩn (09:00 - 09:10)
> **Tâm thế diễn giả:** Đứng thẳng đĩnh đạc, hai tay mở tự nhiên, ánh mắt ấm áp bao quát toàn phòng họp. Văn phong khiêm tốn nhưng tự tin, thấu cảm sự bận rộn của các CEO.

*“Lời đầu tiên, cho phép em thay mặt toàn thể liên minh công nghệ ViConnect & ViOne, xin được gửi lời chào trân trọng nhất, lời chúc sức khỏe và thành công tới anh Chủ tịch, các anh chị trong Ban Thường Trực, Ban Điều Hành và đại diện 6 Ban Chuyên Môn của CLB Doanh Nhân CEO 1983 – Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA).*

*Thưa các anh chị, chúng em vô cùng thấu hiểu rằng: Mỗi anh chị ngồi đây đều là những chủ doanh nghiệp đang gánh vác trách nhiệm điều hành kinh doanh lớn, nhưng vẫn dành trọn tâm huyết, thời gian và công sức để phụng sự cho sự phát triển của mái nhà chung CEO 1983. Chính vì vậy, sự hiện diện đầy đủ của các anh chị trong buổi sáng ngày hôm nay là một niềm vinh dự to lớn, đồng thời cũng là nguồn động lực và trách nhiệm rất lớn đối với đội ngũ phát triển chúng em.*

*Về phía đoàn công tác chúng em hôm nay, có đại diện Ban Lãnh đạo ViConnect & ViOne, Giám đốc giải pháp công nghệ, các kỹ sư trưởng phụ trách kiến trúc hệ thống và em là [Họ tên] – Trưởng đại diện Đội ngũ Triển khai, người sẽ trực tiếp đồng hành, báo cáo và giải trình cùng các anh chị.*

*Để buổi làm việc đạt hiệu quả cao nhất và tôn trọng tuyệt đối quỹ thời gian quý báu của các CEO, hội nghị hôm nay được ấn định bắt đầu đúng **09h00 sáng** và bế mạc đúng **12h00 trưa**, được phân bổ khoa học thành 3 giai đoạn rõ ràng:*
- *09h00 – 09h45: Báo cáo tổng quan và Live Demo trực tiếp cả 2 nền tảng Mobile App và Web CRM.*
- *09h45 – 11h45 (tròn 120 phút): Phiên nhận xét, trao đổi, chất vấn kỹ thuật và phản biện chuyên sâu.*
- *11h45 – 12h00: Tổng kết, chốt Ma trận chức năng Scope Freeze và ký kết biên bản bế mạc đúng 12:00.*

*Trước khi đi vào chi tiết, em xin trân trọng kính mời anh Chủ tịch và các anh chị trong Ban Thường Trực có đôi lời phát biểu và giới thiệu các thành viên tham dự để đoàn chúng em tiện xưng hô và làm việc ạ!”*

---

### Phần 2: 3 Nỗi Đau Vận Hành & 2 Luồng Trọng Tâm Huyết Mạch (09:10 - 09:25)
*“Kính thưa các anh chị, trong suốt quá trình khảo sát và làm việc cùng Ban Thư ký cũng như các Trưởng Ban chuyên môn, chúng em đúc kết lại 3 nỗi đau thực tế lớn nhất mà CLB đang phải đối mặt mỗi ngày:*

*1. **Nỗi đau Quản trị hội viên**: Hơn 500 hồ sơ doanh nghiệp nhưng bị phân tán rải rác trên các file Excel cá nhân, danh sách Zalo và giấy tờ lưu trữ. Mỗi lần cần tra cứu một đối tác theo ngành nghề để kết nối, quy trình xét duyệt qua nhiều cấp diễn ra rất chậm chạp. Quan trọng hơn, các doanh nhân 1983 vẫn đang thiếu một tấm thẻ định danh số xứng tầm và một danh thiếp thông minh để khẳng định uy tín khi đi giao thương bên ngoài.*

*2. **Nỗi đau Quản trị sự kiện gắn liền với tài chính**: Từ trước đến nay, chúng ta thường nhìn nhận sự kiện chỉ đơn thuần là công tác bán vé và soát vé ở cửa. Nhưng dưới góc độ quản trị chuyên sâu, **sự kiện chính là một bài toán quản trị dòng tiền khép kín và nhạy cảm nhất của hiệp hội**! Dòng tiền đi từ khâu dự toán ngân sách, thu phí tham dự, thu tiền tài trợ qua tài khoản, thu tiền mặt trực tiếp tại bàn tiếp đón; sau đó là tạm ứng kinh phí cho Ban Sự kiện để đặt tiệc, thuê âm thanh ánh sáng; rồi đến khâu hoàn ứng tiền thừa, quyết toán chi phí thực tế và cuối cùng là kết chuyển vào Sổ quỹ tiền mặt nội bộ để báo cáo minh bạch trước toàn thể hội viên và nộp lên HanoiBA. Nếu không có phần mềm, Ban Tài chính và Ban Thư ký sẽ rơi vào một ma trận chứng từ và rủi ro thất thoát rất lớn.*

*3. **Nỗi đau Hiệu quả Xúc tiến thương mại B2B**: Mục đích lớn nhất của một doanh nhân khi tham gia CLB là tìm kiếm bạn bè, đối tác và cơ hội kinh doanh. Tuy nhiên, hiện tại các bài đăng giới thiệu sản phẩm hay tìm kiếm đối tác đều bị trôi mất trên các nhóm chat Zalo chỉ sau vài giờ. Chúng ta không có sàn giao dịch tập trung, không có bộ lọc ngành nghề, và Ban Điều Hành hoàn toàn không đo lường được tổng giá trị giao thương thực tế mà CLB đã tạo ra cho các hội viên là bao nhiêu tỷ đồng mỗi năm.*

*Xuất phát từ 3 bài toán gốc rễ đó, ViConnect đã thiết kế Hệ sinh thái số kép dựa trên **2 LUỒNG TRỌNG TÂM HUYẾT MẠCH**:*
- **LUỒNG 1 - THANH TOÁN & TÀI CHÍNH TOÀN DIỆN**: Kiểm soát chuỗi dòng tiền khép kín, cổng VietQR Napas 24/7 gạch nợ tự động sau 1s, kết chuyển thẳng vào **Sổ Quỹ Tiền Mặt và Sổ Tiền Gửi Ngân Hàng chuẩn Thông tư 200/2014/TT-BTC (Mẫu S07-DN / S03a-DNN)** có công thức tính toán tự động, đọc tiền bằng chữ và xuất file Excel/PDF hoàn hảo nộp HanoiBA.
- **LUỒNG 2 - XÚC TIẾN THƯƠNG MẠI B2B THỰC CHIẾN**: Thẻ VIP Dynamic QR vCard 1 chạm, Company Profile 2 trang chuyên nghiệp, Sàn Marketplace ưu đãi nội khối, Bảng Deal Cung – Cầu trực tuyến và Lịch hẹn giao thương 1-on-1 đồng bộ lịch điện thoại.*

---

### Phần 3C: Phân Tích Bộ Công Cụ Quản Trị Thực Tế Dưới Góc Nhìn Kỹ Thuật ViConnect (09:45 - 09:55)
> **Trọng tâm đặc biệt:** Tuyên bố dứt khoát đây là những tính năng ngoài phạm vi yêu cầu ban đầu của CEO 1983, nhưng do ViConnect chủ động phát triển từ năng lực công nghệ lõi và sự thấu cảm vận hành 365 ngày của BĐH.

*“Kính thưa anh Chủ tịch và toàn thể Ban Điều Hành,*  
*Đến phần này, em xin phép được dừng lại ít phút để chia sẻ một câu chuyện rất chân thành từ đáy lòng của những người làm kỹ thuật và kiến tạo giải pháp tại ViConnect.*

*Trong bản Đề bài yêu cầu nghiệp vụ ban đầu (BRD gốc) mà CLB Doanh Nhân CEO 1983 đặt hàng cho chúng em, phạm vi công việc chỉ gói gọn trong 3 bài toán chính: Danh bạ hội viên, Điểm danh sự kiện và Xúc tiến thương mại B2B. Toàn bộ các phân hệ về **Quản lý công việc Kanban, Quản lý cuộc họp số, Kho tài liệu số tập trung hay Đàm thoại VoIP nội bộ HOÀN TOÀN NẰM NGOÀI PHẠM VI YÊU CẦU BAN ĐẦU** của các anh chị.*

*Nhưng khi bắt tay vào thiết kế kiến trúc hệ thống, đội ngũ kỹ sư của ViConnect đã tự đặt cho mình một câu hỏi vô cùng trăn trở:*  
*‘Liệu rằng sau khi bàn giao một ứng dụng thật đẹp, một trang web thật hào nhoáng, thì Ban Điều Hành CEO 1983 có thực sự được giải phóng sức lao động hay không?’*

*Câu trả lời thực tế là KHÔNG! Bởi vì hiệp hội không chỉ sống trong những ngày tổ chức sự kiện hay những kỳ sinh hoạt định kỳ. Nhịp đập thực sự của CLB nằm ở **365 ngày làm việc thường nhật của Ban Thường Trực, Ban Thư Ký và 6 Ban Chuyên Môn**.*

*Nếu chúng em chỉ làm đúng những gì được yêu cầu, thì ngày mai đây:*
- *Khi Ban Thường Trực muốn giao việc cho Ban Sự kiện hay Ban Hội viên, các anh chị vẫn phải nhắn tin lên các nhóm Zalo, để rồi các đầu việc bị trôi đi mất giữa hàng trăm tin nhắn chúc mừng, hỏi thăm.*
- *Khi Ban Thư ký cần tổ chức một cuộc họp BĐH, các anh chị vẫn phải gõ lịch thủ công, đính kèm file rời rạc qua email, và khi họp thì không có công cụ điểm danh minh bạch.*
- *Khi một hội viên mới hay một Trưởng ban cần tìm lại bản Điều lệ CLB, Quy chế tài chính hay mẫu đơn đề xuất, các anh chị lại phải lục tung Google Drive hay hỏi xin nhau từng file tài liệu.*

*Đó là một sự lãng phí tài nguyên và khiến cho việc chuyển đổi số trở nên nửa vời!*

*Chính vì vậy, bằng năng lực làm chủ công nghệ lõi và tinh thần làm sản phẩm bằng cả cái tâm của người làm kỹ thuật, **ViConnect đã CHỦ ĐỘNG KIẾN TẠO VÀ TÍCH HỢP SẴN SÀNG TRỌN BỘ CÔNG CỤ VẬN HÀNH THỰC TẾ** này vào hệ thống:*
1. **Hệ Thống Quản Lý Công Việc & Bảng Giao Việc Kanban 6 Ban Chuyên Môn**: Chủ tịch, Tổng Thư ký và các Trưởng ban có thể tạo việc, phân công người chịu trách nhiệm, đặt deadline và theo dõi tiến độ công việc theo từng cột trạng thái: Cần làm -> Đang làm -> Hoàn thành. Ban Sự kiện chuẩn bị sân khấu đến đâu, Ban Tài chính làm dự toán đến đâu, tất cả hiện lên trực quan, triệt tiêu 100% tình trạng sót việc.
2. **Hệ Thống Quản Trị Cuộc Họp & Điểm Danh Bằng Mã QR Động (Sapphire Hub)**: Số hóa toàn bộ lịch họp của BĐH và các ban. Tài liệu họp và chương trình nghị sự được đính kèm trực tiếp trong lịch để các đại biểu đọc trước trên điện thoại. Đặc biệt, tính năng Điểm danh cuộc họp bằng **Dynamic QR Code – mã QR tự động thay đổi sau mỗi 30 giây** trên màn hình máy chiếu, ngăn chặn hoàn toàn việc chụp ảnh gửi ra ngoài để điểm danh hộ, tự động xuất biên bản điểm danh ngay khi cuộc họp kết thúc.
3. **Kho Lưu Trữ Tài Liệu Số Tập Trung (Knowledge Hub)**: Nơi lưu trữ chính thức toàn bộ Điều lệ CLB, Quy chế thu chi, Mẫu đơn đăng ký, Hợp đồng tài trợ và Kỷ yếu các nhiệm kỳ. Mọi thành viên chỉ cần mở ứng dụng là có thể tra cứu và tải về tức thì file Word, PDF chuẩn mực mọi lúc mọi nơi.
4. **Đàm Thoại VoIP Mã Hóa & Mạng Xã Hội Doanh Nhân Moments B2B**: Kênh gọi thoại và video nội bộ chất lượng HD, đổ chuông trực tiếp trên màn hình khóa điện thoại kể cả khi đã tắt app. Không gian Moments B2B là một "LinkedIn nội bộ thu nhỏ" để các CEO đăng tải tin tức hoạt động doanh nghiệp một cách văn minh, không bị pha tạp bởi mạng xã hội bên ngoài.

*Thưa các anh chị, những phân hệ này chính là câu trả lời đanh thép nhất cho năng lực R&D của ViConnect: **Chúng em không phải đơn vị gia công nhận tiền làm theo đơn đặt hàng đơn thuần, mà ViConnect là Người Bạn Đồng Hành Công Nghệ Chiến Lược**, sẵn sàng đầu tư chất xám và công nghệ để đưa CLB Doanh Nhân CEO 1983 trở thành ngọn cờ đầu về chuyển đổi số trong toàn bộ hệ thống HanoiBA!”*

---

### Phần 4: Phiên Nhận Xét & Chất Vấn Kỹ Thuật 120 Phút (09:55 - 11:45)
*“Đúng theo kế hoạch thời gian đã cam kết, bây giờ là 09h55. Chúng em xin phép được khép lại phần báo cáo trình diễn sản phẩm để bước sang giai đoạn quan trọng nhất: **PHIÊN NHẬN XÉT, CHẤT VẤN KỸ THUẬT VÀ ĐỐI THOẠI TRỰC TIẾP TRONG 120 PHÚT**.*

*Chúng em dành trọn vẹn 2 tiếng đồng hồ quý báu này để lắng nghe từng ý kiến đóng góp, từng câu hỏi chất vấn, thậm chí là những điểm các anh chị chưa hài lòng về giao diện hay quy trình vận hành. Đội ngũ kỹ thuật ViConnect đã mở sẵn Biểu Mẫu Tiếp Nhận Ý Kiến trên màn hình lớn. Từng câu hỏi của anh Chủ tịch và 6 Trưởng Ban chuyên môn sẽ được chúng em lắng nghe, ghi chép trung thực, giải trình ngay tại chỗ và thống nhất phân loại mức độ ưu tiên P0, P1, P2 để xử lý.*

*Sau đây, em xin trân trọng kính mời anh Chủ tịch, chị Tổng Thư ký và các anh chị Trưởng Ban chuyên môn bắt đầu phiên thảo luận ạ!”*

---

### Phần 5: Tổng Kết Scope Freeze & Bế Mạc Đúng 12:00 (11:45 - 12:00)
*“Đồng hồ hiện tại đã điểm 11h45. Trải qua đúng 2 tiếng thảo luận vô cùng sôi nổi, thẳng thắn và trách nhiệm, chúng ta đã tiếp nhận và thống nhất phương án xử lý cho toàn bộ các ý kiến đóng góp.*

*Bây giờ, em xin phép đại diện hai bên được trình bày BẢNG MA TRẬN CHỐT CHỨC NĂNG HỆ THỐNG (SCOPE FREEZE MATRIX):*
- **Danh mục 30 chức năng cốt lõi**: Đã hoàn thành 100%, kết nối trực tiếp database PostgreSQL thật, đạt nghiệm thu 100%. Hôm nay, hai bên chính thức ký kết Đóng Băng Phạm Vi Phát Triển (Scope Freeze).
- **Cam kết hoàn tất chỉnh sửa minor**: ViConnect cam kết xử lý triệt để trong vòng 48 giờ.
- **Cam kết gửi văn bản chính thức**: Biên bản cuộc họp gửi trong 24h; Văn bản Kế hoạch hành động gửi trong 48h; tổ chức đào tạo tập huấn chuyển giao công nghệ vào đầu tuần tới.

*Đúng 12h00 trưa! Thay mặt toàn thể ban lãnh đạo và đội ngũ kỹ sư ViConnect, em xin được cúi đầu cảm ơn sâu sắc nhất tới anh Chủ tịch, Ban Thường Trực và các anh chị Trưởng Ban. Kính chúc CLB Doanh Nhân CEO 1983 ngày càng gắn kết, thịnh vượng và vươn xa!”*

---

## 3. PHỤ LỤC: CẨM NANG 10 TÌNH HUỐNG ĐỐI ĐÁP THỰC CHIẾN CHO DIỄN GIẢ
*(Xem chi tiết trong file Word \`document/KICH_BAN_LOI_NOI_HOC_THUOC_THUYET_TRINH_CEO1983.docx\`)*
`;

  const mdPath = path.join(DOC_DIR, 'KICH_BAN_VA_SLIDE_THUYET_TRINH_THU_4_CEO1983.md');
  fs.writeFileSync(mdPath, mdContent, 'utf8');

  const feMdPath = path.join(FE_DOCS_DIR, 'KICH_BAN_VA_SLIDE_THUYET_TRINH_THU_4_CEO1983.md');
  fs.writeFileSync(feMdPath, mdContent, 'utf8');

  console.log(`✓ ĐÃ CẬP NHẬT THÀNH CÔNG BẢN MARKDOWN (.MD) NÂNG TẦM LỜI LẼ: ${mdPath}`);
}

async function main() {
  try {
    console.log('=== BẮT ĐẦU NÂNG TẦM LỜI LẼ KỊCH BẢN THUYẾT TRÌNH THỨ 4 ===');
    await buildElevatedSpeakerDocx();
    await buildElevatedMarkdown();
    console.log('=== HOÀN TẤT 100% CẢ HAI FILE (.DOCX VÀ .MD) TẠI DOCUMENT/ VÀ APPS/CEO1983_APP_FE/PUBLIC/DOCS/ ===');
  } catch (err) {
    console.error('LỖI KHI XUẤT BẢN KỊCH BẢN:', err);
    process.exit(1);
  }
}

main();
