/**
 * SCRIPT NÂNG TẦM LỜI LẼ TOÀN DIỆN KỊCH BẢN THUYẾT TRÌNH BÁO CÁO CEO 1983 (THỨ 4)
 * 
 * Chuẩn hóa cấu trúc theo chỉ đạo chính xác từ người dùng:
 * 1. Khung giờ Master Timeline (09:00 - 12:00 Thứ Tư, tròn 3 tiếng):
 *    - 09:00 - 09:10 (10p): Phần 1 - Khởi động hội nghị & Giới thiệu hai bên.
 *    - 09:10 - 09:45 (35p, 30-40p): Phần 2 - Nội dung trình bày về sản phẩm:
 *        + 2.1: Hôm nay em sẽ trình bày với anh chị... (Lời dẫn nhập vào sản phẩm)
 *        + 2.2: List vấn đề của đối tác, 3 yêu cầu ban đầu từ CEO 1983:
 *               - Quản trị thành viên
 *               - Quản lý sự kiện
 *               - Xúc tiến thương mại (Cơ hội, Marketplace)
 *               -> Dựa trên yêu cầu của anh chị, cùng giải pháp của ViOne & ViConnect đang có và xây dựng, đã tạo ra Web CRM và App CEO 1983.
 *        + 2.3: CHỨC NĂNG THU CHI LÀ SỰ NHÌN NHẬN RA TỪ TEAM PHÁT TRIỂN KỸ THUẬT VICONNECT (Phân tích tại sao team kỹ thuật nhìn ra lỗ hổng dòng tiền sự kiện và sổ quỹ Thông tư 200 nộp HanoiBA).
 *        + 2.4: Trình diễn thực tế (Live Demo) Mobile App và Web CRM Tháp chỉ huy.
 *        + 2.5: Bộ công cụ vận hành thực tế ngoài yêu cầu ban đầu nhìn nhận từ năng lực kỹ thuật ViConnect (Kanban, Lịch họp QR 30s, Kho tri thức, VoIP).
 *    - 09:45 - 11:45 (120p / 2 tiếng): Phần 3 - Phiên nhận xét, trao đổi & chất vấn kỹ thuật.
 *    - 11:45 - 12:00 (15p): Phần 4 - Tổng kết, chốt Ma trận nghiệm thu Scope Freeze & Cam kết bàn giao bế mạc đúng 12:00.
 * 2. Phụ lục: 10 Tình huống thực chiến & Nghệ thuật đối đáp dành riêng cho diễn giả.
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
                text: 'HỘI NGHỊ LÀM VIỆC 3 TIẾNG (09:00 – 12:00 THỨ TƯ) · BẢN CHUẨN HÓA VĂN PHONG DOANH NHÂN CAO CẤP',
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
                            text: '💎 4 NGUYÊN TẮC VÀNG VỀ TÂM THẾ & LỜI LẼ CỦA DIỄN GIẢ:',
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
                            text: '1. Cấu Trúc Báo Cáo Chuẩn Mực 30 - 40 Phút: ',
                            bold: true,
                            size: 20,
                            font: FONT,
                          }),
                          new TextRun({
                            text: 'Mở đầu bằng lời dẫn nhập đĩnh đạc (2.1), sau đó điểm lại 3 bài toán/yêu cầu ban đầu của CEO 1983 (2.2: Quản trị thành viên, Quản lý sự kiện, Xúc tiến thương mại). Tuyên bố từ nền tảng ViOne & ViConnect đã tạo nên CRM và App.',
                            size: 20,
                            font: FONT,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 60 },
                        children: [
                          new TextRun({
                            text: '2. Nhấn Mạnh Phân Hệ Thu Chi Là Do Team Kỹ Thuật ViConnect Nhìn Nhận Ra: ',
                            bold: true,
                            size: 20,
                            color: COLOR_NAVY,
                            font: FONT,
                          }),
                          new TextRun({
                            text: 'Khẳng định rõ ràng: Yêu cầu ban đầu của CEO 1983 không hề có phần Thu Chi! Chính đội ngũ kỹ thuật ViConnect qua nghiên cứu sâu nghiệp vụ hiệp hội đã nhìn nhận ra mắt xích trọng yếu: Sự kiện và Hội viên không thể tách rời dòng tiền khép kín (tạm ứng, hoàn ứng, quyết toán, sổ quỹ Thông tư 200 nộp HanoiBA) nên đã chủ động kiến tạo tích hợp sẵn!',
                            size: 20,
                            font: FONT,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 60 },
                        children: [
                          new TextRun({
                            text: '3. Định Vị Bộ Công Cụ Vận Hành Thực Tế (Kanban, Cuộc họp QR 30s, Kho tri thức, VoIP): ',
                            bold: true,
                            size: 20,
                            font: FONT,
                          }),
                          new TextRun({
                            text: 'Hoàn toàn nằm ngoài phạm vi yêu cầu ban đầu (BRD gốc). ViConnect chủ động xây dựng từ góc nhìn kỹ thuật thực chiến và năng lực công nghệ lõi để giải phóng sức lao động 365 ngày cho BĐH kiêm nhiệm.',
                            size: 20,
                            font: FONT,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 60 },
                        children: [
                          new TextRun({
                            text: '4. Giữ Trọn Vẹn Kỷ Luật Thời Gian 3 Tiếng (09:00 - 12:00): ',
                            bold: true,
                            size: 20,
                            font: FONT,
                          }),
                          new TextRun({
                            text: 'Dành trọn vẹn 120 phút (09:45 - 11:45) cho phiên lắng nghe, nhận xét, đối thoại và điền trực tiếp vào Biểu Mẫu Excel. Chốt Scope Freeze bế mạc đúng 12:00 trưa.',
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
            'Phần 1: Khởi Động Hội Nghị & Giới Thiệu Hai Bên',
            '09:00 – 09:10 (10 Phút)',
            'Phong thái đĩnh đạc, ấm áp, thấu cảm; tuyên bố dứt khoát lộ trình 3 tiếng chuẩn mực từ 09:00 đến 12:00.',
            [
              '“Lời đầu tiên, cho phép em thay mặt toàn thể liên minh công nghệ ViConnect & ViOne, xin được gửi lời chào trân trọng nhất, lời chúc sức khỏe và thành công tới anh Chủ tịch, các anh chị trong Ban Thường Trực, Ban Điều Hành và đại diện các Ban Chuyên Môn của CLB Doanh Nhân CEO 1983 – trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA).',
              'Thưa các anh chị, chúng em vô cùng thấu hiểu rằng: Mỗi anh chị ngồi đây đều là những chủ tịch, tổng giám đốc đang gánh vác trách nhiệm điều hành những doanh nghiệp lớn, nhưng vẫn dành trọn tâm huyết, thời gian và công sức quý báu để phụng sự cho sự phát triển của ngôi nhà chung CEO 1983. Chính vì vậy, sự hiện diện đầy đủ của các anh chị trong buổi sáng ngày hôm nay là một niềm vinh dự to lớn, đồng thời cũng là nguồn động lực và trách nhiệm rất lớn đối với đội ngũ phát triển chúng em.',
              'Về phía đoàn công tác chúng em hôm nay, có đại diện Ban Lãnh đạo ViConnect & ViOne, Giám đốc giải pháp công nghệ, các kỹ sư trưởng phụ trách kiến trúc hệ thống và em là [Họ tên] – Trưởng đại diện Đội ngũ Triển khai, người sẽ trực tiếp đồng hành, báo cáo và giải trình cùng các anh chị.',
              'Để buổi làm việc đạt hiệu quả cao nhất và tôn trọng tuyệt đối quỹ thời gian quý báu của các CEO, hội nghị hôm nay được ấn định bắt đầu đúng 09h00 sáng và bế mạc đúng 12h00 trưa, được phân bổ khoa học thành 3 giai đoạn rõ ràng:',
              {
                prefix: '• Giai đoạn 1 (09h00 – 09h45, 45 phút):',
                text: 'Báo cáo tổng quan bức tranh sản phẩm và Trình diễn thực tế (Live Demo) trên cả 2 nền tảng: Web CRM Quản trị tháp chỉ huy và Ứng dụng Mobile App dành riêng cho hội viên.',
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
              'Trước khi bước vào nội dung chi tiết, em xin trân trọng kính mời anh Chủ tịch và các anh chị trong Ban Thường Trực có đôi lời phát biểu và giới thiệu các thành viên tham dự để đoàn chúng em tiện xưng hô và làm việc ạ!”'
            ],
            'Đứng thẳng đĩnh đạc, hai tay mở tự nhiên, ánh mắt giao lưu ấm áp bao quát toàn phòng họp. Khi BĐH phát biểu, lắng nghe với thái độ cầu thị, mỉm cười và gật đầu ghi nhận.'
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // PHẦN 2: NỘI DUNG TRÌNH BÀY VỀ SẢN PHẨM (09:10 - 09:45, 35 PHÚT)
          createSpeechSection(
            'Phần 2: Báo Cáo Chi Tiết Về Sản Phẩm & Live Demo Giải Pháp Hệ Sinh Thái Số',
            '09:10 – 09:45 (35 Phút / Khung 30-40 Phút)',
            'Khúc chiết, rành mạch: 2.1 Lời dẫn nhập -> 2.2 List 3 yêu cầu ban đầu CEO 1983 -> 2.3 Điểm nhấn Thu Chi từ team kỹ thuật ViConnect -> 2.4 Live Demo -> 2.5 Bộ công cụ thực tế.',
            [
              {
                prefix: '2.1. LỜI DẪN NHẬP TRÌNH BÀY SẢN PHẨM:',
                text: '“Hôm nay em sẽ trình bày với anh chị...”',
                bold: true,
                size: 22,
                color: COLOR_NAVY,
              },
              '“Kính thưa anh Chủ tịch, các anh chị trong Ban Thường Trực và toàn thể Ban Điều Hành,',
              'Hôm nay, em xin phép được trình bày với các anh chị bức tranh tổng thể về sản phẩm và giải pháp số hóa toàn diện mà liên minh công nghệ ViConnect & ViOne đã tâm huyết nghiên cứu, thiết kế và phát triển dành riêng cho CLB Doanh Nhân CEO 1983.',
              'Mục tiêu của chúng em không phải là tạo ra một phần mềm đơn thuần, mà là cùng các anh chị xây dựng nên một công cụ điều hành đắc lực, giải phóng sức lao động cho Ban Điều Hành, đồng thời tạo ra một kênh giao thương thực chiến, mang lại doanh thu và niềm tự hào cho từng hội viên doanh nhân sinh năm 1983.',
              {
                prefix: '2.2. DANH SÁCH VẤN ĐỀ CỦA ĐỐI TÁC & 3 YÊU CẦU BAN ĐẦU CỦA CEO 1983:',
                text: '',
                bold: true,
                size: 22,
                color: COLOR_NAVY,
              },
              'Kính thưa các anh chị, nhìn lại những ngày đầu tiên khi ViConnect ngồi lại cùng Ban Thường Trực CLB để lắng nghe bài toán, các anh chị đã chia sẻ với chúng em 3 bài toán lớn và đặt ra 3 nhóm yêu cầu cốt lõi ban đầu:',
              {
                prefix: '1. Yêu cầu thứ nhất về Quản trị thành viên:',
                text: 'Hơn 500 hồ sơ doanh nghiệp hội viên nhưng dữ liệu đang bị phân tán rải rác trên các file Excel cá nhân, danh sách Zalo và giấy tờ văn phòng. Mỗi lần cần tra cứu đối tác hay xét duyệt kết nạp hội viên mới đều diễn ra rất chậm chạp, thủ công. Đặc biệt, các doanh nhân 1983 vẫn đang thiếu một tấm thẻ định danh số sang trọng và một danh thiếp thông minh để khẳng định đẳng cấp khi đi giao lưu đối ngoại.',
              },
              {
                prefix: '2. Yêu cầu thứ hai về Quản lý sự kiện:',
                text: 'CLB thường xuyên tổ chức các chương trình lớn như Đêm Gala hội ngộ, Diễn đàn kinh tế, phiên họp Ban Chấp Hành với quy mô hàng trăm khách. Công tác phát hành vé mời, soát vé điểm danh ở cửa hội trường và sắp xếp chỗ ngồi bàn tiệc VIP tốn rất nhiều nhân lực, dễ ùn tắc và khó kiểm soát đại biểu.',
              },
              {
                prefix: '3. Yêu cầu thứ ba về Xúc tiến thương mại (Cơ hội & Sàn Marketplace):',
                text: 'Doanh nhân tham gia CLB với mong muốn lớn nhất là kết nối giao thương. Tuy nhiên, các bài đăng giới thiệu sản phẩm hay tìm kiếm bạn hàng đều bị trôi mất trên các nhóm chat Zalo chỉ sau vài giờ. CLB thiếu một sàn giao dịch nội bộ tập trung, thiếu bộ lọc ngành nghề chuẩn xác và Ban Điều Hành chưa đo lường được giá trị các thương vụ hợp tác thực tế.',
              },
              {
                prefix: 'TUYÊN BỐ GIẢI PHÁP TỪ NỀN TẢNG VIONE & VICONNECT:',
                text: 'Sau khi dựa trên chính các yêu cầu ban đầu của anh chị, cùng với những nền tảng giải pháp của ViOne nói riêng và ViConnect nói chung đang có và không ngừng xây dựng, đội ngũ chúng em đã kiến tạo nên Hệ sinh thái số kép gồm Hệ thống Web CRM Quản trị tháp chỉ huy và Ứng dụng Mobile App CEO 1983 dành riêng cho các doanh nhân!',
                bold: true,
                textColor: COLOR_DARK,
              },
              {
                prefix: '2.3. SỰ ĐỘT PHÁ TỪ GÓC NHÌN KỸ THUẬT VICONNECT: CHỨC NĂNG QUẢN LÝ THU - CHI LÀ DO TEAM KỸ THUẬT VICONNECT NHÌN NHẬN RA:',
                text: '',
                bold: true,
                size: 22,
                color: COLOR_GOLD,
              },
              'Kính thưa anh Chủ tịch và các anh chị trong Ban Thường Trực,',
              'Tại điểm này, em xin được nhấn mạnh một chi tiết vô cùng quan trọng: Trong 3 yêu cầu ban đầu mà CEO 1983 đặt hàng cho chúng em, HOÀN TOÀN KHÔNG HỀ CÓ yêu cầu về Quản lý Thu - Chi tài chính!',
              'Thế nhưng, trong quá trình đào sâu nghiên cứu thực tế vận hành hiệp hội, chính đội ngũ phát triển kỹ thuật của ViConnect đã nhìn nhận ra một mắt xích cốt tử mà nếu không giải quyết, hệ sinh thái sẽ không thể vận hành hoàn hảo:',
              {
                prefix: 'VÌ SAO TEAM KỸ THUẬT VICONNECT LẠI NHÌN NHẬN RA CHỨC NĂNG THU - CHI?',
                text: 'Bởi vì các kỹ sư ViConnect nhận thấy: Sự kiện và Hội viên không thể nào tách rời khỏi bài toán Quản trị dòng tiền! Nếu chúng em chỉ làm đúng theo yêu cầu ban đầu là bán vé và soát vé sự kiện đơn thuần, thì sau mỗi kỳ Gala, Ban Sự kiện và Ban Tài chính sẽ rơi vào một ma trận chứng từ vô cùng áp lực: Tiền tạm ứng cho Ban Sự kiện để đặt cọc địa điểm, tiền hoàn ứng khi thừa, tiền thu tài trợ bằng tiền mặt hoặc qua tài khoản, và tiền bán vé lẻ... tất cả đều phải ghi chép sổ tay, đối soát sao kê thủ công cực kỳ vất vả, rất dễ xảy ra sai sót, nhầm lẫn và gây rủi ro thất thoát ngân quỹ.',
                bold: true,
                textColor: COLOR_NAVY,
              },
              'Quan trọng hơn cả, cuối quý, cuối năm, Ban Tài chính lấy đâu ra số liệu tức thì để lập Sổ Quỹ Tiền Mặt minh bạch báo cáo trước Đại hội hội viên và giải trình nộp lên Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)?',
              'Chính vì nhìn thấy trước lỗ hổng vận hành chí mạng đó, team phát triển kỹ thuật ViConnect đã CHỦ ĐỘNG ĐỀ XUẤT, THIẾT KẾ VÀ TÍCH HỢP TRỌN BỘ PHÂN HỆ QUẢN LÝ THU - CHI KHÉP KÍN vào hệ thống:',
              '• Tích hợp cổng thanh toán VietQR Napas 24/7 gạch nợ tự động sau đúng 1 giây.',
              '• Chu trình quản trị dòng tiền sự kiện 4 bước minh bạch: Lập dự toán -> Thu tiền bán vé & tài trợ -> Tạm ứng kinh phí cho Ban Sự kiện -> Hoàn ứng tiền thừa & Quyết toán thực tế.',
              '• Tự động biên soạn Sổ Quỹ Tiền Mặt và Sổ Tiền Gửi Ngân Hàng chuẩn Thông tư 200/2014/TT-BTC (Mẫu S07-DN / S03a-DNN) có công thức tự động, đọc số tiền bằng chữ tiếng Việt và xuất file Excel/PDF hoàn hảo để trình nộp HanoiBA bất kỳ lúc nào!',
              {
                prefix: '2.4. TRÌNH DIỄN THỰC TẾ (LIVE DEMO) 2 NỀN TẢNG:',
                text: '',
                bold: true,
                size: 22,
                color: COLOR_NAVY,
              },
              'Và bây giờ, em xin phép được mời các anh chị cùng hướng mắt lên màn hình lớn để chúng ta trực tiếp trải nghiệm giải pháp này hoạt động trên điện thoại thật và máy tính thật:',
              '• Về Mobile App Hội viên: Chiếc điện thoại trên tay em đang hiển thị Thẻ Hội Viên VIP mạ vàng mang mã số M1983 duy nhất; Danh thiếp thông minh tích hợp Dynamic QR vCard 1 chạm lưu thẳng vào danh bạ mà HOÀN TOÀN KHÔNG CẦN CÀI APP; Company Profile 2 trang chuyên nghiệp; Danh bạ 11 ngành nghề; Đặt lịch hẹn giao thương 1-on-1 đồng bộ lịch điện thoại; Sàn Marketplace ưu đãi nội khối và Ví vé điện tử QR soát vé dưới 1 giây.',
              '• Về Web CRM Quản trị tháp chỉ huy: Executive Dashboard 360 độ theo dõi nhịp đập CLB thời gian thực; Quy trình thẩm định xét duyệt hội viên 3 bước nghiêm ngặt; Phân quyền vai trò RBAC cho 6 Ban chuyên môn; và đặc biệt là Phân hệ Sổ Quỹ Thu Chi Thông tư 200 xuất file Excel chuẩn mực chỉ với 1 click chuột.',
              {
                prefix: '2.5. BỘ CÔNG CỤ VẬN HÀNH THỰC TẾ NGOÀI BRD GỐC DƯỚI GÓC NHÌN KỸ THUẬT VICONNECT:',
                text: '',
                bold: true,
                size: 22,
                color: COLOR_NAVY,
              },
              'Chưa dừng lại ở đó, xuất phát từ góc nhìn của người làm công nghệ thực chiến, ViConnect còn chủ động kiến tạo thêm Bộ công cụ vận hành hàng ngày (hoàn toàn nằm ngoài yêu cầu ban đầu):',
              '1. Bảng giao việc Kanban phân cấp: Chủ tịch, Tổng thư ký và các Trưởng ban giao việc rõ người, rõ hạn chót, theo dõi tiến độ trực quan.',
              '2. Quản trị cuộc họp & Điểm danh QR động (Sapphire Hub): Mã QR đổi sau mỗi 30 giây chống chụp ảnh gửi ra ngoài điểm danh hộ, đính kèm tài liệu họp số.',
              '3. Kho tài liệu số tập trung (Knowledge Hub): Lưu trữ Điều lệ CLB, Quy chế tài chính, Hợp đồng mẫu, Kỷ yếu để hội viên tra cứu tức thì.',
              '4. Đàm thoại VoIP nội bộ mã hóa & Không gian mạng xã hội doanh nhân Moments B2B văn minh.',
              'Tất cả những phân hệ này khẳng định: ViConnect không phải đơn vị gia công làm theo đơn hàng bề nổi, mà chúng em là Người Bạn Đồng Hành Công Nghệ Chiến Lược, cùng xây dựng giải pháp trọn vẹn nhất cho CEO 1983!”'
            ],
            'Chiếu Slide 3 (List 3 yêu cầu ban đầu) ➔ Slide 4 (Nền tảng ViOne & ViConnect kiến tạo CRM & App) ➔ Slide 5 (Đột phá Thu Chi từ Team Kỹ thuật) ➔ Live Demo điện thoại & máy tính thật. Giọng nói truyền cảm, dứt khoát, tự tin.'
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // PHẦN 3: PHIÊN THẢO LUẬN, CHẤT VẤN KỸ THUẬT (09:45 - 11:45)
          createSpeechSection(
            'Phần 3: Mở Phiên Thảo Luận, Nhận Xét & Chất Vấn Kỹ Thuật Chuyên Sâu',
            '09:45 – 11:45 (Tròn 120 Phút / 2 Tiếng)',
            'Lắng nghe khiêm tốn, ghi chép cẩn trọng; áp dụng quy tắc 4 bước đối đáp: Đồng cảm ➔ Giải trình kỹ thuật ➔ Cam kết giải pháp ➔ Xác nhận hài lòng.',
            [
              '“Kính thưa toàn thể hội nghị,',
              'Đúng theo kế hoạch thời gian đã cam kết, bây giờ là 09h45. Chúng em xin phép được khép lại phần báo cáo trình diễn sản phẩm để bước sang giai đoạn quan trọng nhất của hội nghị hôm nay:',
              {
                prefix: 'PHIÊN NHẬN XÉT, CHẤT VẤN KỸ THUẬT VÀ ĐỐI THOẠI TRỰC TIẾP TRONG 120 PHÚT:',
                text: 'Chúng em dành trọn vẹn 2 tiếng đồng hồ quý báu này để lắng nghe từng ý kiến đóng góp, từng câu hỏi chất vấn, thậm chí là những điểm các anh chị chưa hài lòng về giao diện hay quy trình vận hành.',
                bold: true,
                textColor: COLOR_NAVY,
              },
              'Đội ngũ kỹ thuật ViConnect đã mở sẵn Biểu Mẫu Tiếp Nhận Ý Kiến trên màn hình lớn. Từng câu hỏi của anh Chủ tịch và các Trưởng Ban chuyên môn sẽ được chúng em lắng nghe, ghi chép trung thực, giải trình ngay tại chỗ và thống nhất phân loại mức độ ưu tiên P0, P1, P2 để xử lý.',
              'Mục tiêu của chúng em không phải là bảo vệ quan điểm cá nhân, mà mục tiêu duy nhất là làm sao để hệ sinh thái số này khi bàn giao phải thực sự mượt mà, tiện dụng và mang lại niềm tự hào lớn nhất cho toàn thể hội viên CEO 1983.',
              'Sau đây, em xin trân trọng kính mời anh Chủ tịch, chị Tổng Thư ký và các anh chị Trưởng Ban Sự kiện, Ban Thành viên, Ban Tài chính, Ban Xúc tiến thương mại, Ban Truyền thông và Ban Thiện nguyện bắt đầu phiên thảo luận ạ!”'
            ],
            'Mở file Excel "BIEU_MAU_GHI_NHAN_Y_KIEN_TRAO_DOI_THU_4_CEO1983.xlsx" trên máy chiếu. Cầm bút ghi chép cẩn thận. Lắng nghe không ngắt lời đại biểu.'
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // PHẦN 4: CHỐT CHỨC NĂNG & SCOPE FREEZE (11:45 - 12:00)
          createSpeechSection(
            'Phần 4: Tổng Kết Cuộc Họp, Thông Qua Scope Freeze Matrix & Cam Kết Bàn Giao',
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
                text: '• Trong vòng 24 giờ: ViConnect hoàn thiện Biên Bản Cuộc Họp chính thức gửi Ban Thư ký lưu trữ.\n• Trong vòng 48 giờ: Gửi Văn bản Kế hoạch hành động triển khai (Action Plan) chi tiết từng mốc thời gian.\n• Đầu tuần tới: ViConnect tổ chức 01 buổi tập huấn đào tạo 30 phút chuyển giao công nghệ cho Ban Thư ký và các Ban chuyên môn.\n• Bàn giao trọn bộ bản cài đặt APK cho Android, bản cài cho iOS và bộ tài liệu hướng dẫn sử dụng chuẩn hóa PDF và Video clip ngắn.',
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
            '“Dạ thưa anh/chị, kiến trúc soát vé của ViConnect được thiết kế với cơ chế Bộ nhớ đệm ngoại tuyến (Offline Local Storage Cache). Ngay trước giờ đón khách, danh sách vé đã đăng ký được tải sẵn về máy quét của Ban Sự kiện. Khi quét QR, máy xử lý xác thực tức thì tại máy mà không cần đợi tín hiệu mạng; âm thanh bip xác nhận phát ra dưới 0.5 giây. Khi có mạng trở lại, hệ thống tự động đồng bộ ngầm kết quả lên máy chủ trung tâm mà không bị gián đoạn hay trùng vé.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioCard(
            3,
            'Tính Pháp Lý & Minh Bạch Của Sổ Quỹ Tiền Mặt Thông Tư 200 Đối Với HanoiBA',
            '“Sổ quỹ trên phần mềm có giá trị pháp lý kế toán để nộp báo cáo cho Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA) và quyết toán thuế không?”',
            '“Dạ thưa anh/chị, mẫu Sổ Quỹ Tiền Mặt (S07-DN) và Sổ Tiền Gửi Ngân Hàng (S03a-DNN) trên Web CRM được các chuyên gia tài chính của ViConnect lập trình tuân thủ 100% theo chuẩn mực của Thông tư 200/2014/TT-BTC do Bộ Tài chính ban hành. Tệp kết xuất Excel giữ nguyên công thức tính toán tự động số dư lũy kế, tự động dịch số tiền thành chữ tiếng Việt chuẩn xác và có sẵn đầy đủ vị trí cho 3 chữ ký: Người lập biểu, Kế toán trưởng và Chủ tịch CLB. HanoiBA hoàn toàn chấp thuận mẫu báo cáo chuẩn mực này.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioCard(
            4,
            'Hội Viên Lớn Tuổi Hoặc Ngại Cài Đặt App Thì Sử Dụng Danh Thiếp Thế Nào?',
            '“Nhiều hội viên không rành công nghệ, đi gặp khách hàng mà bắt khách phải tải app thì rất phiền và bất khả thi...”',
            '“Dạ đây chính là ưu điểm vượt trội của giải pháp ViConnect! Người quét mã QR HOÀN TOÀN KHÔNG CẦN CÀI APP. Khi anh chị chìa mã QR trên thẻ VIP hoặc sau ốp điện thoại, đối tác chỉ cần mở camera thông thường là lập tức xem được danh thiếp điện tử và bấm nút ‘Lưu Danh Bạ vCard’ trực tiếp vào danh bạ điện thoại của họ trong 1 giây. Việc cài app chỉ dành riêng cho hội viên 1983 để vào sàn B2B và điều hành nội bộ.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioCard(
            5,
            'Vì Sao Hệ Thống Có Cả Quản Lý Công Việc Kanban, Cuộc Họp QR Mà Không Tính Thêm Phí?',
            '“Các tính năng như Bảng Kanban, Cuộc họp Sapphire Hub, Kho tài liệu ban đầu CLB không yêu cầu, vậy sau này ViConnect có thu thêm phí phát sinh không?”',
            '“Dạ thưa anh Chủ tịch và các anh chị, ViConnect xin khẳng định bằng danh dự: Chúng em CAM KẾT KHÔNG THU THÊM BẤT KỲ CHI PHÍ NÀO cho các tính năng này! Như em đã chia sẻ, đây là sản phẩm của năng lực R&D và tinh thần đồng hành của ViConnect nhằm giải quyết triệt để 365 ngày vận hành cho BĐH. Chúng em bàn giao trọn gói vĩnh viễn để CEO 1983 sở hữu một nền tảng số hóa kiểu mẫu xứng tầm thủ đô.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioCard(
            6,
            'Kiểm Soát Chất Lượng Hàng Hóa & Đề Phòng Lừa Đảo Trên Sàn Marketplace B2B',
            '“Nếu có hội viên đăng bán sản phẩm kém chất lượng hoặc xảy ra tranh chấp giao thương trên app thì giải quyết thế nào?”',
            '“Dạ hệ thống được thiết kế theo mô hình Chợ Doanh Nhân Khép Kín: Chỉ có hội viên chính thức đã được Ban Thành viên thẩm định cấp mã M1983 mới được quyền đăng sản phẩm. Mỗi bài đăng đều phải qua quy trình kiểm duyệt nội dung của Ban Xúc tiến thương mại. Khi xảy ra phản ánh, Ban Quản trị có quyền tạm khóa sản phẩm hoặc tước quyền gian hàng tức thì. Mọi giao dịch đều được ghi nhận dấu vết pháp lý rõ ràng.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioCard(
            7,
            'Khi Chuyển Giao Nhiệm Kỳ Mới Hoặc Thay Đổi Nhân Sự Ban Điều Hành',
            '“Hết nhiệm kỳ này, Chủ tịch mới hoặc Trưởng Ban mới lên thay thì việc bàn giao dữ liệu hệ thống có phức tạp không?”',
            '“Dạ thưa anh/chị, toàn bộ dữ liệu của CLB được lưu trữ tập trung trên máy chủ bảo mật của CLB, không gắn vào tài khoản cá nhân của bất kỳ ai. Khi chuyển giao nhiệm kỳ, Quản trị viên chỉ cần vào màn hình Phân Quyền RBAC, đổi vai trò ‘Chủ tịch’ hoặc ‘Trưởng ban’ sang nhân sự mới là người mới lập tức thừa hưởng toàn bộ lịch sử công việc, kho tài liệu và sổ quỹ mà không bị mất mát bất kỳ trang tài liệu nào.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioCard(
            8,
            'Hội Viên Bị Mất Điện Thoại Hoặc Quên Mật Khẩu Thì Phục Hồi Thế Nào?',
            '“Hội viên đổi máy mới hoặc bị mất máy, có bị lộ dữ liệu kinh doanh và mất tài khoản không?”',
            '“Dạ thưa anh/chị, tài khoản được bảo vệ bằng lớp mã hóa JWT và xác thực đa kênh. Khi đổi máy mới, hội viên chỉ cần tải app, nhập số điện thoại và nhận mã xác thực OTP gửi về SMS hoặc email đã đăng ký để đặt lại mật khẩu an toàn. Trường hợp khẩn cấp, Ban Thư ký có quyền kích hoạt tính năng ‘Đăng xuất từ xa’ trên các thiết bị cũ từ màn hình CRM để bảo vệ tài khoản hội viên.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioCard(
            9,
            'Tốc Độ Kết Nối Thanh Toán VietQR Tự Động Gạch Nợ Có Thực Sự 1 Giây Không?',
            '“Trước đây hội viên nộp tiền hay chụp màn hình chuyển khoản gửi Zalo, kế toán phải căng mắt đối soát từng giao dịch, hệ thống mới có thực sự giải phóng được việc này không?”',
            '“Dạ đúng 100%! ViConnect tích hợp trực tiếp Cổng thanh toán VietQR Napas 24/7. Mỗi khoản thu (tiền vé sự kiện, hội phí, tài trợ) đều sinh ra một mã QR động chứa đúng số tiền và cú pháp nhận diện duy nhất. Khi hội viên quét mã chuyển khoản thành công từ bất kỳ ngân hàng nào, hệ thống nhận tín hiệu Webhook tức thì, tự động đổi trạng thái ‘Đã thanh toán’ sau đúng 1 giây và phát hành vé điện tử về app mà không cần con người can thiệp đối soát.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioCard(
            10,
            'Cam Kết Thời Gian Xử Lý Lỗi Và Đồng Hành Kỹ Thuật Sau Nghiệm Thu',
            '“Sau khi nghiệm thu xong, nhỡ trong quá trình chạy thực tế phát sinh lỗi thì ViConnect hỗ trợ trong bao lâu?”',
            '“Dạ thưa anh/chị, ViConnect thiết lập Kênh Phản Ứng Nhanh 24/7 dành riêng cho BĐH CEO 1983: Đối với các lỗi ảnh hưởng trực tiếp đến sự kiện (Severity 1), đội ngũ kỹ sư trực chiến cam kết phản hồi trong 15 phút và xử lý dứt điểm trong 2 giờ. Các lỗi nhỏ hoặc tinh chỉnh giao diện cam kết xử lý trong 24 - 48 giờ. Chúng em đồng hành kỹ thuật trọn đời cùng CLB trong suốt quá trình vận hành.”'
          ),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  function writeSafely(targetPath, fileBuffer) {
    try {
      fs.writeFileSync(targetPath, fileBuffer);
      const stats = fs.statSync(targetPath);
      console.log(`✓ ĐÃ GHI THÀNH CÔNG: ${targetPath} (${(stats.size / 1024).toFixed(1)} KB)`);
      return targetPath;
    } catch (err) {
      if (err.code === 'EBUSY') {
        const ext = path.extname(targetPath);
        const base = path.basename(targetPath, ext);
        const dir = path.dirname(targetPath);
        const fallbackPath = path.join(dir, `${base}_BAN_MOI_NHAT${ext}`);
        try {
          fs.writeFileSync(fallbackPath, fileBuffer);
          const stats = fs.statSync(fallbackPath);
          console.warn(`[LƯU Ý] ${targetPath} đang được mở trong Word! Đã lưu bản cập nhật tại: ${fallbackPath} (${(stats.size / 1024).toFixed(1)} KB)`);
          return fallbackPath;
        } catch (err2) {
          const timestamp = Date.now();
          const emergencyPath = path.join(dir, `${base}_${timestamp}${ext}`);
          fs.writeFileSync(emergencyPath, fileBuffer);
          const stats = fs.statSync(emergencyPath);
          console.warn(`[LƯU Ý] Đã lưu bản khẩn cấp tại: ${emergencyPath} (${(stats.size / 1024).toFixed(1)} KB)`);
          return emergencyPath;
        }
      } else {
        throw err;
      }
    }
  }

  writeSafely(path.join(DOC_DIR, 'KICH_BAN_LOI_NOI_HOC_THUOC_THUYET_TRINH_CEO1983.docx'), buffer);
  writeSafely(path.join(DOC_DIR, 'KICH_BAN_LOI_NOI_HOC_THUOC_THUYET_TRINH_CEO1983_MOI.docx'), buffer);
  writeSafely(path.join(FE_DOCS_DIR, 'KICH_BAN_LOI_NOI_HOC_THUOC_THUYET_TRINH_CEO1983.docx'), buffer);
}

async function buildElevatedMarkdown() {
  console.log('>>> [2/2] Đang cập nhật kịch bản Markdown (.md) chi tiết...');

  const mdContent = `# KỊCH BẢN THUYẾT TRÌNH BÁO CÁO GIẢI PHÁP SỐ HÓA CLB DOANH NHÂN CEO 1983 (HANOIBA)
## HỘI NGHỊ THẨM ĐỊNH, LIVE DEMO & CHỐT PHẠM VI HỆ SINH THÁI SỐ (09:00 - 12:00 THỨ TƯ)
**Đơn vị phát triển:** ViConnect & ViOne  
**Đối tác chủ quản:** Ban Thường Trực & Ban Điều Hành CLB Doanh Nhân CEO 1983 (HanoiBA)  
**Thời lượng:** Tròn 03 tiếng (180 phút liên tục từ 09:00 đến 12:00)  

---

## MỤC LỤC KỊCH BẢN
1. [Khung Giờ Master Timeline Chuẩn (09:00 - 12:00)](#1-khung-giờ-master-timeline-chuẩn-0900---1200)
2. [Lời Thoại & Kịch Bản Hùng Biện Nâng Tầm Dành Cho Diễn Giả](#2-lời-thoại--kịch-bản-hùng-biện-nâng-tầm-dành-cho-diễn-giả)
   - [Phần 1: Khởi động hội nghị & Giới thiệu hai bên (09:00 - 09:10)](#phần-1-khởi-động-hội-nghị--giới-thiệu-hai-bên-0900---0910)
   - [Phần 2: Nội dung trình bày về sản phẩm 30 - 40 phút (09:10 - 09:45)](#phần-2-nội-dung-trình-bày-về-sản-phẩm-30---40-phút-0910---0945)
     - [2.1 Hôm nay em sẽ trình bày với anh chị...](#21-hôm-nay-em-sẽ-trình-bày-với-anh-chị)
     - [2.2 List vấn đề của đối tác & 3 yêu cầu ban đầu từ CEO 1983](#22-list-vấn-đề-của-đối-tác--3-yêu-cầu-ban-đầu-từ-ceo-1983)
     - [2.3 Sự đột phá: Chức năng Thu - Chi là sự nhìn nhận ra từ Team Kỹ Thuật ViConnect](#23-sự-đột-phá-chức-năng-thu---chi-là-sự-nhìn-nhận-ra-từ-team-kỹ-thuật-viconnect)
     - [2.4 Live Demo thực tế Mobile App & Web CRM](#24-live-demo-thực-tế-mobile-app--web-crm)
     - [2.5 Bộ công cụ vận hành thực tế ngoài yêu cầu ban đầu (Kanban, Cuộc họp QR, Kho tri thức, VoIP)](#25-bộ-công-cụ-vận-hành-thực-tế-ngoài-yêu-cầu-ban-đầu)
   - [Phần 3: Phiên nhận xét, trao đổi & chất vấn kỹ thuật trong 120 phút (09:45 - 11:45)](#phần-3-phiên-nhận-xét-trao-đổi--chất-vấn-kỹ-thuật-120-phút-0945---1145)
   - [Phần 4: Tổng kết, chốt Ma trận nghiệm thu Scope Freeze & Bế mạc đúng 12:00 (11:45 - 12:00)](#phần-4-tổng-kết-chốt-scope-freeze-matrix--bế-mạc-đúng-1200-1145---1200)
3. [Phụ Lục: Cẩm Nang 10 Tình Huống Đối Đáp Thực Chiến Cho Diễn Giả](#3-phụ-lục-cẩm-nang-10-tình-huống-đối-đáp-thực-chiến-cho-diễn-giả)

---

## 1. KHUNG GIỜ MASTER TIMELINE CHUẨN (09:00 - 12:00)

| Mốc Thời Gian | Thời Lượng | Nội Dung Trọng Tâm | Tác Vụ Cốt Lõi | Người Thực Hiện |
|:---:|:---:|:---|:---|:---:|
| **09:00 - 09:10** | 10 phút | **Phần 1: Khởi động hội nghị & Giới thiệu hai bên** | Tuyên bố mục tiêu 3 tiếng, định hình tâm thế tôn trọng, mời BĐH giới thiệu. | Diễn giả ViConnect & Chủ tịch BĐH |
| **09:10 - 09:45** | 35 phút (30-40p) | **Phần 2: Nội dung trình bày về sản phẩm** | 2.1 Dẫn nhập -> 2.2 List 3 yêu cầu ban đầu CEO 1983 -> 2.3 Phân hệ Thu Chi từ Team Kỹ thuật ViConnect -> 2.4 Live Demo -> 2.5 Bộ công cụ thực tế. | Diễn giả ViConnect |
| **09:45 - 11:45** | 120 phút (2 tiếng) | **Phần 3: Phiên Nhận xét, Trao đổi, Chất vấn Kỹ thuật** | Lắng nghe ý kiến 6 Trưởng Ban; điền trực tiếp vào Biểu Mẫu Excel trên màn chiếu; giải trình kỹ thuật thỏa đáng. | Hai bên đối thoại |
| **11:45 - 12:00** | 15 phút | **Phần 4: Tổng kết chốt Scope Freeze & Kế hoạch** | Thông qua Scope Freeze Matrix 30 tính năng (100% Pass), cam kết văn bản 24h/48h, bế mạc đúng 12:00. | Diễn giả & Chủ tịch BĐH |

---

## 2. LỜI THOẠI & KỊCH BẢN HÙNG BIỆN NÂNG TẦM DÀNH CHO DIỄN GIẢ

### Phần 1: Khởi Động Hội Nghị & Giới Thiệu Hai Bên (09:00 - 09:10)
> **Tâm thế diễn giả:** Đứng thẳng đĩnh đạc, hai tay mở tự nhiên, ánh mắt ấm áp bao quát toàn phòng họp. Văn phong khiêm tốn nhưng tự tin, thấu cảm sự bận rộn của các CEO.

*“Lời đầu tiên, cho phép em thay mặt toàn thể liên minh công nghệ ViConnect & ViOne, xin được gửi lời chào trân trọng nhất, lời chúc sức khỏe và thành công tới anh Chủ tịch, các anh chị trong Ban Thường Trực, Ban Điều Hành và đại diện các Ban Chuyên Môn của CLB Doanh Nhân CEO 1983 – trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA).*

*Thưa các anh chị, chúng em vô cùng thấu hiểu rằng: Mỗi anh chị ngồi đây đều là những chủ tịch, tổng giám đốc đang gánh vác trách nhiệm điều hành những doanh nghiệp lớn, nhưng vẫn dành trọn tâm huyết, thời gian và công sức quý báu để phụng sự cho sự phát triển của ngôi nhà chung CEO 1983. Chính vì vậy, sự hiện diện đầy đủ của các anh chị trong buổi sáng ngày hôm nay là một niềm vinh dự to lớn, đồng thời cũng là nguồn động lực và trách nhiệm rất lớn đối với đội ngũ phát triển chúng em.*

*Về phía đoàn công tác chúng em hôm nay, có đại diện Ban Lãnh đạo ViConnect & ViOne, Giám đốc giải pháp công nghệ, các kỹ sư trưởng phụ trách kiến trúc hệ thống và em là [Họ tên] – Trưởng đại diện Đội ngũ Triển khai, người sẽ trực tiếp đồng hành, báo cáo và giải trình cùng các anh chị.*

*Để buổi làm việc đạt hiệu quả cao nhất và tôn trọng tuyệt đối quỹ thời gian quý báu của các CEO, hội nghị hôm nay được ấn định bắt đầu đúng **09h00 sáng** và bế mạc đúng **12h00 trưa**, được phân bổ khoa học thành 3 giai đoạn rõ ràng:*
- *09h00 – 09h45: Báo cáo tổng quan bức tranh sản phẩm và Live Demo trực tiếp cả 2 nền tảng Mobile App và Web CRM.*
- *09h45 – 11h45 (tròn 120 phút / 2 tiếng): Phiên nhận xét, trao đổi, chất vấn kỹ thuật và phản biện chuyên sâu.*
- *11h45 – 12h00: Tổng kết, chốt Ma trận chức năng Scope Freeze và ký kết biên bản bế mạc đúng 12:00.*

*Trước khi đi vào chi tiết, em xin trân trọng kính mời anh Chủ tịch và các anh chị trong Ban Thường Trực có đôi lời phát biểu và giới thiệu các thành viên tham dự để đoàn chúng em tiện xưng hô và làm việc ạ!”*

---

### Phần 2: Nội Dung Trình Bày Về Sản Phẩm 30 - 40 Phút (09:10 - 09:45)

#### 2.1. Hôm nay em sẽ trình bày với anh chị...
*“Kính thưa anh Chủ tịch, các anh chị trong Ban Thường Trực và toàn thể Ban Điều Hành,*

*Hôm nay, em xin phép được trình bày với các anh chị bức tranh tổng thể về sản phẩm và giải pháp số hóa toàn diện mà liên minh công nghệ ViConnect & ViOne đã tâm huyết nghiên cứu, thiết kế và phát triển dành riêng cho CLB Doanh Nhân CEO 1983.*

*Mục tiêu của chúng em không phải là tạo ra một phần mềm đơn thuần, mà là cùng các anh chị xây dựng nên một công cụ điều hành đắc lực, giải phóng sức lao động cho Ban Điều Hành, đồng thời tạo ra một kênh giao thương thực chiến, mang lại doanh thu và niềm tự hào cho từng hội viên doanh nhân sinh năm 1983.*

---

#### 2.2. List vấn đề của đối tác & 3 yêu cầu ban đầu từ CEO 1983
*Kính thưa các anh chị, nhìn lại những ngày đầu tiên khi ViConnect ngồi lại cùng Ban Thường Trực CLB để lắng nghe bài toán, các anh chị đã chia sẻ với chúng em 3 bài toán lớn và đặt ra 3 nhóm yêu cầu cốt lõi ban đầu:*

1. **Yêu cầu thứ nhất về Quản trị thành viên:**
   - Hơn 500 hồ sơ doanh nghiệp hội viên nhưng dữ liệu đang bị phân tán rải rác trên các file Excel cá nhân, danh sách Zalo và giấy tờ văn phòng.
   - Mỗi lần cần tra cứu đối tác hay xét duyệt kết nạp hội viên mới đều diễn ra rất chậm chạp, thủ công.
   - Đặc biệt, các doanh nhân 1983 vẫn đang thiếu một tấm thẻ định danh số sang trọng và một danh thiếp thông minh để khẳng định đẳng cấp khi đi giao lưu đối ngoại.

2. **Yêu cầu thứ hai về Quản lý sự kiện:**
   - CLB thường xuyên tổ chức các chương trình lớn như Đêm Gala hội ngộ, Diễn đàn kinh tế, phiên họp Ban Chấp Hành với quy mô hàng trăm khách.
   - Công tác phát hành vé mời, soát vé điểm danh ở cửa hội trường và sắp xếp chỗ ngồi bàn tiệc VIP tốn rất nhiều nhân lực, dễ ùn tắc và khó kiểm soát đại biểu.

3. **Yêu cầu thứ ba về Xúc tiến thương mại (Cơ hội, Marketplace):**
   - Doanh nhân tham gia CLB với mong muốn lớn nhất là kết nối giao thương. Tuy nhiên, các bài đăng giới thiệu sản phẩm hay tìm kiếm bạn hàng đều bị trôi mất trên các nhóm chat Zalo chỉ sau vài giờ.
   - CLB thiếu một sàn giao dịch nội bộ tập trung, thiếu bộ lọc ngành nghề chuẩn xác và Ban Điều Hành chưa đo lường được giá trị các thương vụ hợp tác thực tế.

> **Tuyên bố giải pháp:**  
> *“Sau khi dựa trên chính các yêu cầu ban đầu của anh chị, cùng với những giải pháp của ViOne nói riêng và ViConnect nói chung đang có và không ngừng xây dựng phát triển, chúng em đã kiến tạo nên Hệ sinh thái số kép gồm **Hệ thống Web CRM Quản trị tháp chỉ huy** và **Ứng dụng Mobile App CEO 1983** dành riêng cho các doanh nhân!”*

---

#### 2.3. Sự đột phá: Chức năng Thu - Chi là sự nhìn nhận ra từ Team Kỹ Thuật ViConnect
> **Lưu ý đặc biệt cho diễn giả:** Nhấn mạnh dứt khoát: Yêu cầu ban đầu của CEO 1983 hoàn toàn KHÔNG CÓ phần Thu Chi! Đây chính là điểm sáng thể hiện tầm nhìn và sự thấu cảm sâu sắc của team kỹ thuật ViConnect!

*“Kính thưa anh Chủ tịch và các anh chị trong Ban Thường Trực,*

*Tại điểm này, em xin được nhấn mạnh một chi tiết vô cùng quan trọng: **Trong 3 yêu cầu ban đầu mà CEO 1983 đặt hàng cho chúng em, HOÀN TOÀN KHÔNG HỀ CÓ yêu cầu về Quản lý Thu - Chi tài chính!***

*Thế nhưng, trong quá trình đào sâu nghiên cứu thực tế vận hành hiệp hội, **chính đội ngũ phát triển kỹ thuật của ViConnect đã nhìn nhận ra một mắt xích cốt tử** mà nếu không giải quyết, hệ sinh thái sẽ không thể vận hành hoàn hảo:*

*Vì sao team kỹ thuật ViConnect lại nhìn nhận ra chức năng Thu - Chi?*  
*Bởi vì các kỹ sư ViConnect nhận thấy: **Sự kiện và Hội viên không thể nào tách rời khỏi bài toán Quản trị dòng tiền!** Nếu chúng em chỉ làm đúng theo yêu cầu ban đầu là bán vé và soát vé sự kiện đơn thuần, thì sau mỗi kỳ Gala, Ban Sự kiện và Ban Tài chính sẽ rơi vào một ma trận chứng từ vô cùng áp lực:*
- *Tiền tạm ứng cho Ban Sự kiện để đặt cọc địa điểm, tiền hoàn ứng khi thừa, tiền thu tài trợ bằng tiền mặt hoặc qua tài khoản, và tiền bán vé lẻ... tất cả đều phải ghi chép sổ tay, đối soát sao kê thủ công cực kỳ vất vả, rất dễ xảy ra sai sót, nhầm lẫn và gây rủi ro thất thoát ngân quỹ.*
- *Quan trọng hơn cả, cuối quý, cuối năm, Ban Tài chính lấy đâu ra số liệu tức thì để lập Sổ Quỹ Tiền Mặt minh bạch báo cáo trước Đại hội hội viên và giải trình nộp lên Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)?*

*Chính vì nhìn thấy trước lỗ hổng vận hành chí mạng đó, **team phát triển kỹ thuật ViConnect đã CHỦ ĐỘNG ĐỀ XUẤT, THIẾT KẾ VÀ TÍCH HỢP TRỌN BỘ PHÂN HỆ QUẢN LÝ THU - CHI KHÉP KÍN** vào hệ thống:*
- **Tích hợp cổng thanh toán VietQR Napas 24/7**: Gạch nợ tự động sau đúng 1 giây.
- **Chu trình quản trị dòng tiền sự kiện 4 bước minh bạch**: Lập dự toán -> Thu tiền bán vé & tài trợ -> Tạm ứng kinh phí cho Ban Sự kiện -> Hoàn ứng tiền thừa & Quyết toán thực tế.
- **Tự động biên soạn Sổ Quỹ Tiền Mặt và Sổ Tiền Gửi Ngân Hàng chuẩn Thông tư 200/2014/TT-BTC (Mẫu S07-DN / S03a-DNN)**: Có công thức tự động, đọc số tiền bằng chữ tiếng Việt và xuất file Excel/PDF hoàn hảo để trình nộp HanoiBA bất kỳ lúc nào!”*

---

#### 2.4. Live Demo thực tế Mobile App & Web CRM
*“Và bây giờ, em xin phép được mời các anh chị cùng hướng mắt lên màn hình lớn để chúng ta trực tiếp trải nghiệm giải pháp này hoạt động trên điện thoại thật và máy tính thật:*

1. **Trải nghiệm Mobile App Hội viên CEO 1983 (Chiếu điện thoại thật):**
   - **Thẻ Hội Viên VIP mạ vàng**: Mang mã số M1983 duy nhất, nhận diện Deep Cobalt Navy & Warm Amber Gold sang trọng.
   - **Danh thiếp thông minh kép & Dynamic QR vCard 1 chạm**: Quét camera lưu ngay vào danh bạ điện thoại mà **HOÀN TOÀN KHÔNG CẦN CÀI APP**!
   - **Company Profile 2 trang**: Giới thiệu năng lực doanh nghiệp sắc nét.
   - **Danh bạ 11 ngành nghề & Đặt lịch hẹn B2B 1-on-1**: Đồng bộ lịch Google/Apple Calendar.
   - **Sàn Marketplace & Bảng Deal Cung – Cầu**: Giao dịch nội khối độc quyền.
   - **Ví vé điện tử QR E-Ticket**: Soát vé dưới 1 giây, hỗ trợ Offline Cache chống mất mạng.

2. **Trải nghiệm Web CRM Quản trị tháp chỉ huy (Chiếu máy tính thật):**
   - **Executive Dashboard 360 độ**: Theo dõi nhịp đập CLB, hội viên, sự kiện, dòng tiền thời gian thực.
   - **Quy trình thẩm định hội viên 3 bước nghiêm ngặt**: Cấp mã thẻ tự động, lưu trữ số hóa.
   - **Ma trận phân quyền RBAC cho 6 Ban chuyên môn**: Đúng người, đúng việc, bảo mật phân cấp.
   - **Sổ Quỹ Thu Chi Thông tư 200/2014/TT-BTC**: Bấm nút xuất Excel tải ngay mẫu S07-DN có công thức tính toán tự động.”*

---

#### 2.5. Bộ công cụ vận hành thực tế ngoài yêu cầu ban đầu
> **Khẳng định năng lực kỹ thuật ViConnect:** Đây là các tính năng nằm ngoài BRD gốc, do ViConnect chủ động xây dựng để giải phóng sức lao động 365 ngày cho BĐH.

*“Chưa dừng lại ở đó, xuất phát từ góc nhìn của người làm công nghệ thực chiến, ViConnect còn chủ động kiến tạo thêm Bộ công cụ vận hành hàng ngày:*
1. **Bảng giao việc Kanban phân cấp**: Chủ tịch, Tổng thư ký và các Trưởng ban giao việc rõ người, rõ hạn chót, theo dõi tiến độ trực quan.
2. **Quản trị cuộc họp & Điểm danh QR động (Sapphire Hub)**: Mã QR đổi sau mỗi 30 giây chống chụp ảnh gửi ra ngoài điểm danh hộ, đính kèm tài liệu họp số.
3. **Kho tài liệu số tập trung (Knowledge Hub)**: Lưu trữ Điều lệ CLB, Quy chế tài chính, Hợp đồng mẫu, Kỷ yếu để hội viên tra cứu tức thì.
4. **Đàm thoại VoIP nội bộ mã hóa & Không gian mạng xã hội doanh nhân Moments B2B văn minh.**

*Tất cả những phân hệ này khẳng định: **ViConnect không phải đơn vị gia công làm theo đơn hàng bề nổi, mà chúng em là Người Bạn Đồng Hành Công Nghệ Chiến Lược**, cùng xây dựng giải pháp trọn vẹn nhất cho CEO 1983!”*

---

### Phần 3: Phiên Nhận Xét & Chất Vấn Kỹ Thuật 120 Phút (09:45 - 11:45)
*“Đúng theo kế hoạch thời gian đã cam kết, bây giờ là 09h45. Chúng em xin phép được khép lại phần báo cáo trình diễn sản phẩm để bước sang giai đoạn quan trọng nhất: **PHIÊN NHẬN XÉT, CHẤT VẤN KỸ THUẬT VÀ ĐỐI THOẠI TRỰC TIẾP TRONG 120 PHÚT**.*

*Chúng em dành trọn vẹn 2 tiếng đồng hồ quý báu này để lắng nghe từng ý kiến đóng góp, từng câu hỏi chất vấn, thậm chí là những điểm các anh chị chưa hài lòng về giao diện hay quy trình vận hành. Đội ngũ kỹ thuật ViConnect đã mở sẵn Biểu Mẫu Tiếp Nhận Ý Kiến trên màn hình lớn. Từng câu hỏi của anh Chủ tịch và các Trưởng Ban chuyên môn sẽ được chúng em lắng nghe, ghi chép trung thực, giải trình ngay tại chỗ và thống nhất phân loại mức độ ưu tiên P0, P1, P2 để xử lý.*

*Sau đây, em xin trân trọng kính mời anh Chủ tịch, chị Tổng Thư ký và các anh chị Trưởng Ban chuyên môn bắt đầu phiên thảo luận ạ!”*

---

### Phần 4: Tổng Kết Chốt Scope Freeze & Bế Mạc Đúng 12:00 (11:45 - 12:00)
*“Đồng hồ hiện tại đã điểm 11h45. Trải qua đúng 2 tiếng thảo luận vô cùng sôi nổi, thẳng thắn và trách nhiệm, chúng ta đã tiếp nhận và thống nhất phương án xử lý cho toàn bộ các ý kiến đóng góp.*

*Bây giờ, em xin phép đại diện hai bên được trình bày BẢNG MA TRẬN CHỐT CHỨC NĂNG HỆ THỐNG (SCOPE FREEZE MATRIX):*
- **Danh mục 30 chức năng cốt lõi**: Đã hoàn thành 100%, kết nối trực tiếp database PostgreSQL thật, đạt nghiệm thu 100%. Hôm nay, hai bên chính thức ký kết Đóng Băng Phạm Vi Phát Triển (Scope Freeze).
- **Cam kết hoàn tất chỉnh sửa minor**: ViConnect cam kết xử lý triệt để trong vòng 48 giờ.
- **Cam kết gửi văn bản chính thức**: Biên bản cuộc họp gửi trong 24h; Văn bản Kế hoạch hành động gửi trong 48h; tổ chức đào tạo tập huấn chuyển giao công nghệ vào đầu tuần tới.

*Đúng 12h00 trưa! Thay mặt toàn thể ban lãnh đạo và đội ngũ kỹ sư ViConnect & ViOne, em xin được cúi đầu cảm ơn sâu sắc nhất tới anh Chủ tịch, Ban Thường Trực và các anh chị Trưởng Ban. Kính chúc CLB Doanh Nhân CEO 1983 ngày càng gắn kết, thịnh vượng và vươn xa!”*

---

## 3. PHỤ LỤC: CẨM NANG 10 TÌNH HUỐNG ĐỐI ĐÁP THỰC CHIẾN CHO DIỄN GIẢ
*(Xem chi tiết trong file Word \`document/KICH_BAN_LOI_NOI_HOC_THUOC_THUYET_TRINH_CEO1983_MOI.docx\`)*
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
