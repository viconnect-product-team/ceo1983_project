/**
 * BUILD_ALL_MASTER_CEO1983_DOCS.JS
 * Bộ sinh toàn diện Tài Liệu Doanh Nghiệp & Kỹ Thuật Chuẩn Quốc Tế
 * DÀNH RIÊNG CHO CLB DOANH NHÂN CEO 1983 (TRỰC THUỘC HANOIBA) - LOẠI BỎ 100% VIONE
 * Xuất bản đồng thời định dạng Word (.docx), Markdown (.md) và HTML (In ấn A4 Playbook 18)
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
  TableLayoutType,
} = require('docx');

const { BRD_DATA } = require('./data_ceo1983_brd');
const {
  SRS_METADATA,
  USER_ROLES_DATA,
  USER_JOURNEYS_DATA,
  ALL_USE_CASES_DETAILED,
} = require('./data_ceo1983_srs');

const FONT_FAMILY = 'Times New Roman';
const NAVY = '003B95';
const BLUE_ACCENT = '0084FF';
const GOLD = 'D97706';
const SLATE_DARK = '0F172A';
const SLATE_LIGHT = 'F8FAFC';
const BORDER_COLOR = 'CBD5E1';
const TOTAL_TABLE_WIDTH_DXA = 9200; // Khổ A4 tiêu chuẩn trừ lề

const BORDER_THIN = {
  top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
  left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
  right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
};

// -------------------------------------------------------------
// HELPER FUNCTIONS FOR DOCX
// -------------------------------------------------------------
function createPara(text, options = {}) {
  const lines = String(text || '').split('\n');
  const runs = [];
  lines.forEach((line, idx) => {
    runs.push(
      new TextRun({
        text: line,
        break: idx > 0 ? 1 : 0,
        font: FONT_FAMILY,
        size: options.size || 24, // 12pt
        bold: options.bold || false,
        italics: options.italics || false,
        color: options.color || '1E293B',
      })
    );
  });
  return new Paragraph({
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: options.spacing || { before: 80, after: 80, line: 276 },
    children: runs,
  });
}

function createHeading1(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 260, after: 120 },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        size: 30, // 15pt
        bold: true,
        color: NAVY,
      }),
    ],
  });
}

function createHeading2(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        size: 26, // 13pt
        bold: true,
        color: BLUE_ACCENT,
      }),
    ],
  });
}

function createHeading3(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 140, after: 60 },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        size: 24, // 12pt
        bold: true,
        color: GOLD,
      }),
    ],
  });
}

function createCallout(title, textLines, type = 'info') {
  let borderColor = BLUE_ACCENT;
  let bgColor = 'F0F7FF';
  let icon = 'ℹ️ LƯU Ý QUAN TRỌNG:';

  if (type === 'warning') {
    borderColor = GOLD;
    bgColor = 'FFFBEB';
    icon = '⚠️ CẢNH BÁO QUY TRÌNH:';
  } else if (type === 'danger') {
    borderColor = 'DC2626';
    bgColor = 'FEF2F2';
    icon = '🚫 NGHIÊM CẤM / RÀNG BUỘC CHẶT CHẼ:';
  }

  const textParas = (Array.isArray(textLines) ? textLines : [textLines]).map(
    (line) =>
      new Paragraph({
        spacing: { before: 40, after: 40, line: 260 },
        children: [
          new TextRun({
            text: line,
            font: FONT_FAMILY,
            size: 22, // 11pt
            color: '1E293B',
          }),
        ],
      })
  );

  return new Table({
    width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [TOTAL_TABLE_WIDTH_DXA],
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
            shading: { fill: bgColor, type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              left: { style: BorderStyle.SINGLE, size: 24, color: borderColor },
            },
            margins: { top: 140, bottom: 140, left: 200, right: 140 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 60 },
                children: [
                  new TextRun({
                    text: `${icon} ${title}`,
                    font: FONT_FAMILY,
                    bold: true,
                    size: 22,
                    color: borderColor,
                  }),
                ],
              }),
              ...textParas,
            ],
          }),
        ],
      }),
    ],
  });
}

function createStepParas(steps, options = {}) {
  const paras = [];
  const list = Array.isArray(steps) ? steps : String(steps || '').split('\n');

  list.forEach((step) => {
    const trimmed = String(step || '').trim();
    if (!trimmed) return;

    const stepMatch = trimmed.match(/^((?:Bước\s*\d+|Step\s*\d+|\d+[\.\)]|[-*•])(?:\s*:|\s*))\s*(.*)$/i);
    const runs = [];

    if (stepMatch) {
      runs.push(
        new TextRun({
          text: stepMatch[1].trim() + ' ',
          font: FONT_FAMILY,
          size: options.size || 22,
          bold: true,
          color: options.prefixColor || NAVY,
        })
      );
      runs.push(
        new TextRun({
          text: stepMatch[2].trim(),
          font: FONT_FAMILY,
          size: options.size || 22,
          color: options.color || '1E293B',
        })
      );
    } else {
      runs.push(
        new TextRun({
          text: trimmed,
          font: FONT_FAMILY,
          size: options.size || 22,
          color: options.color || '1E293B',
        })
      );
    }

    paras.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 50, after: 60, line: 260 },
        indent: { left: 360 },
        children: runs,
      })
    );
  });

  return paras;
}

function createTable(headers, rowsData, widths = []) {
  const sum = widths && widths.length > 0 ? widths.reduce((a, b) => a + Number(b), 0) : 0;
  const colWidthsDxa = headers.map((_, i) => {
    if (sum > 0 && widths[i] !== undefined) {
      return Math.round((Number(widths[i]) / sum) * TOTAL_TABLE_WIDTH_DXA);
    }
    return Math.round(TOTAL_TABLE_WIDTH_DXA / headers.length);
  });

  // Đảm bảo tổng chiều rộng các cột chuẩn xác 100% bằng TOTAL_TABLE_WIDTH_DXA (9200 twips)
  const allocated = colWidthsDxa.slice(0, -1).reduce((a, b) => a + b, 0);
  colWidthsDxa[colWidthsDxa.length - 1] = TOTAL_TABLE_WIDTH_DXA - allocated;

  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map((h, i) => {
      return new TableCell({
        width: { size: colWidthsDxa[i], type: WidthType.DXA },
        shading: { fill: NAVY, type: ShadingType.CLEAR },
        borders: BORDER_THIN,
        margins: { top: 120, bottom: 120, left: 140, right: 140 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: h,
                font: FONT_FAMILY,
                bold: true,
                size: 20, // 10pt
                color: 'FFFFFF',
              }),
            ],
          }),
        ],
      });
    }),
  });

  const bodyRows = rowsData.map((row, rIdx) => {
    const isEven = rIdx % 2 === 0;
    return new TableRow({
      cantSplit: true,
      children: row.map((cellText, cIdx) => {
        const textVal = cellText !== undefined && cellText !== null ? String(cellText) : '';
        const lines = textVal.split('\n');

        // MỖI BƯỚC / MỖI DÒNG LÀ MỘT PARAGRAPH ĐỘC LẬP TRONG WORD
        const cellParas = [];
        lines.forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed) return;

          const stepMatch = trimmed.match(/^((?:Bước\s*\d+|Step\s*\d+|\d+[\.\)]|[-*•])(?:\s*:|\s*))\s*(.*)$/i);
          const runs = [];

          if (stepMatch) {
            runs.push(
              new TextRun({
                text: stepMatch[1].trim() + ' ',
                font: FONT_FAMILY,
                size: 20,
                bold: true,
                color: NAVY,
              })
            );
            runs.push(
              new TextRun({
                text: stepMatch[2].trim(),
                font: FONT_FAMILY,
                size: 20,
                color: '1E293B',
              })
            );
          } else {
            runs.push(
              new TextRun({
                text: trimmed,
                font: FONT_FAMILY,
                size: 20,
                color: '1E293B',
              })
            );
          }

          cellParas.push(
            new Paragraph({
              alignment: cIdx === 0 && row.length > 3 ? AlignmentType.CENTER : AlignmentType.LEFT,
              spacing: { before: stepMatch ? 40 : 25, after: stepMatch ? 40 : 25, line: 240 },
              children: runs,
            })
          );
        });

        if (cellParas.length === 0) {
          cellParas.push(
            new Paragraph({
              alignment: cIdx === 0 && row.length > 3 ? AlignmentType.CENTER : AlignmentType.LEFT,
              spacing: { before: 20, after: 20, line: 240 },
              children: [new TextRun({ text: '', font: FONT_FAMILY, size: 20 })],
            })
          );
        }

        return new TableCell({
          width: { size: colWidthsDxa[cIdx], type: WidthType.DXA },
          shading: { fill: isEven ? 'FFFFFF' : SLATE_LIGHT, type: ShadingType.CLEAR },
          borders: BORDER_THIN,
          margins: { top: 100, bottom: 100, left: 140, right: 140 },
          children: cellParas,
        });
      }),
    });
  });

  return new Table({
    width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: colWidthsDxa,
    layout: TableLayoutType.FIXED,
    rows: [headerRow, ...bodyRows],
  });
}

function formatMdTable(headers, rows) {
  let tableMd = '| ' + headers.join(' | ') + ' |\n';
  tableMd += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
  rows.forEach((r) => {
    const cleanRow = r.map((c) =>
      String(c !== undefined && c !== null ? c : '').replace(/\n/g, '<br/>')
    );
    tableMd += '| ' + cleanRow.join(' | ') + ' |\n';
  });
  return tableMd + '\n';
}

function createCoverPage({ title, subTitle, docCode, version, date, organization, author }) {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 720, after: 120 },
      children: [
        new TextRun({
          text: organization.toUpperCase(),
          font: FONT_FAMILY,
          size: 24,
          bold: true,
          color: GOLD,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 600 },
      children: [
        new TextRun({
          text: 'TRỰC THUỘC HỘI DOANH NHÂN TRẺ HÀ NỘI (HANOIBA)',
          font: FONT_FAMILY,
          size: 20,
          bold: true,
          color: NAVY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 180 },
      children: [
        new TextRun({
          text: title,
          font: FONT_FAMILY,
          size: 36, // 18pt
          bold: true,
          color: NAVY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 800 },
      children: [
        new TextRun({
          text: subTitle,
          font: FONT_FAMILY,
          size: 24, // 12pt
          italics: true,
          color: '475569',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 120 },
      children: [
        new TextRun({
          text: `Mã Tài Liệu: ${docCode}`,
          font: FONT_FAMILY,
          size: 22,
          bold: true,
          color: SLATE_DARK,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
      children: [
        new TextRun({
          text: `Phiên Bản: ${version}`,
          font: FONT_FAMILY,
          size: 20,
          color: '64748B',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
      children: [
        new TextRun({
          text: `Ngày Phê Duyệt: ${date}`,
          font: FONT_FAMILY,
          size: 20,
          color: '64748B',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 1200 },
      children: [
        new TextRun({
          text: `Chuyên Gia Thực Hiện: ${author}`,
          font: FONT_FAMILY,
          size: 20,
          bold: true,
          color: NAVY,
        }),
      ],
    }),
  ];
}

function createHeaderFooter(docTitle) {
  const header = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 0, after: 120 },
        children: [
          new TextRun({
            text: `CLB DOANH NHÂN CEO 1983 (HANOIBA) | ${docTitle}`,
            font: FONT_FAMILY,
            size: 18,
            italics: true,
            color: '64748B',
          }),
        ],
      }),
    ],
  });

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 0 },
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
  });

  return { header, footer };
}

// =============================================================
// BUILDER 1: TÀI LIỆU YÊU CẦU NGHIỆP VỤ BRD
// =============================================================
async function buildBRD() {
  console.log('Đang khởi tạo tài liệu BRD CLB CEO 1983...');
  const { header, footer } = createHeaderFooter('Business Requirements Document (BRD)');
  const children = [];
  let md = '';

  function addMd(text) {
    md += text + '\n\n';
  }

  // Cover Page
  children.push(
    ...createCoverPage({
      title: BRD_DATA.metadata.projectTitle,
      subTitle: BRD_DATA.metadata.subTitle,
      docCode: BRD_DATA.metadata.docCode,
      version: BRD_DATA.metadata.version,
      date: BRD_DATA.metadata.date,
      organization: BRD_DATA.metadata.governingBody,
      author: BRD_DATA.metadata.author,
    })
  );

  addMd(`# ${BRD_DATA.metadata.projectTitle}`);
  addMd(`## ${BRD_DATA.metadata.subTitle}`);
  addMd(`*Mã tài liệu: ${BRD_DATA.metadata.docCode} | Phiên bản: ${BRD_DATA.metadata.version} | Ngày phê duyệt: ${BRD_DATA.metadata.date}*`);
  addMd(`*Cơ quan chủ quản: ${BRD_DATA.metadata.governingBody}*`);
  addMd(`*Chuyên gia thực hiện: ${BRD_DATA.metadata.author}*\n---`);

  // Chương 1: Bối cảnh doanh nghiệp & Thách thức
  children.push(createHeading1('CHƯƠNG 1: TỔNG QUAN & BỐI CẢNH DOANH NGHIỆP'));
  addMd('## CHƯƠNG 1: TỔNG QUAN & BỐI CẢNH DOANH NGHIỆP');

  children.push(createHeading2('1.1. Bối Cảnh Hình Thành CLB Doanh Nhân CEO 1983'));
  addMd('### 1.1. Bối Cảnh Hình Thành CLB Doanh Nhân CEO 1983');
  children.push(createPara(BRD_DATA.executiveSummary.background));
  addMd(BRD_DATA.executiveSummary.background);

  children.push(createHeading2('1.2. Thách Thức Nghiệp Vụ Thực Tế Trước Khi Số Hóa (Pain Points)'));
  addMd('### 1.2. Thách Thức Nghiệp Vụ Thực Tế Trước Khi Số Hóa (Pain Points)');

  const painTableHeaders = ['Mã', 'Vấn Đề & Thách Thức Nghiệp Vụ', 'Tác Động Thực Tế & Rủi Ro'];
  const painTableRows = BRD_DATA.executiveSummary.painPoints.map((p) => [
    p.id,
    p.title,
    p.desc,
  ]);
  children.push(createTable(painTableHeaders, painTableRows, [1000, 3200, 5000]));
  addMd(formatMdTable(painTableHeaders, painTableRows));

  children.push(createHeading2('1.3. Mục Tiêu Chiến Lược & Chỉ Số Đo Lường Hiệu Quả (Strategic KPIs)'));
  addMd('### 1.3. Mục Tiêu Chiến Lược & Chỉ Số Đo Lường Hiệu Quả (Strategic KPIs)');

  const kpiTableHeaders = ['Mã KPI', 'Mục Tiêu Chiến Lược', 'Chỉ Số Đo Lường Cụ Thể (SLA)'];
  const kpiTableRows = BRD_DATA.executiveSummary.strategicObjectives.map((k) => [
    k.id,
    k.kpi,
    k.target,
  ]);
  children.push(createTable(kpiTableHeaders, kpiTableRows, [1200, 3300, 4700]));
  addMd(formatMdTable(kpiTableHeaders, kpiTableRows));

  // Chương 2: Cơ cấu tổ chức & 6 Ban chuyên môn
  children.push(createHeading1('CHƯƠNG 2: MÔ HÌNH VẬN HÀNH & PHÂN ĐỊNH 6 CHUYÊN BAN'));
  addMd('## CHƯƠNG 2: MÔ HÌNH VẬN HÀNH & PHÂN ĐỊNH 6 CHUYÊN BAN');
  children.push(createPara(BRD_DATA.organizationalStructure.overview));
  addMd(BRD_DATA.organizationalStructure.overview);

  BRD_DATA.organizationalStructure.committees.forEach((c) => {
    children.push(createHeading2(`${c.id}: ${c.name} (${c.email})`));
    addMd(`### ${c.id}: ${c.name} (\`${c.email}\`)`);
    children.push(createPara(`Tôn chỉ & Quyền hạn: ${c.mandate}`, { italics: true }));
    addMd(`*Tôn chỉ & Quyền hạn:* ${c.mandate}`);

    const respText = c.responsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n');
    children.push(createPara(respText));
    addMd(respText);

    if (c.id === 'BAN-02') {
      children.push(
        createCallout(
          'PHÂN ĐỊNH THẨM QUYỀN TUYỆT ĐỐI GIỮA BTK VÀ BTV',
          [
            'Ban Thư Ký TUYỆT ĐỐI KHÔNG CÓ THẨM QUYỀN PHÊ DUYỆT HỘI VIÊN MỚI.',
            'Thẩm quyền này thuộc về ĐỘC QUYỀN Ban Thành Viên (BTV) hoặc Ban Quản Trị tối cao.',
            'Mọi nỗ lực can thiệp sẽ bị hệ thống API chặn đứng bằng mã lỗi HTTP 403 Forbidden.',
          ],
          'danger'
        )
      );
    }
  });

  // Chương 3: Ma trận RACI
  children.push(createHeading1('CHƯƠNG 3: MA TRẬN TRÁCH NHIỆM RACI (16 QUY TRÌNH NGHIỆP VỤ)'));
  addMd('## CHƯƠNG 3: MA TRẬN TRÁCH NHIỆM RACI (16 QUY TRÌNH NGHIỆP VỤ)');
  children.push(
    createPara(
      'Quy ước ma trận: R (Responsible - Người thực thi); A (Accountable - Người chịu trách nhiệm & phê duyệt); C (Consulted - Người tham vấn); I (Informed - Người nhận thông tin).'
    )
  );
  addMd(
    '*Quy ước ma trận: R (Responsible - Người thực thi); A (Accountable - Người chịu trách nhiệm & phê duyệt); C (Consulted - Người tham vấn); I (Informed - Người nhận thông tin).*\n'
  );

  const raciHeaders = ['Mã', 'Quy Trình Nghiệp Vụ Cốt Lõi', 'BQT', 'BTV', 'BTK', 'Tài Chính', 'Truyền Thông', 'Xúc Tiến', 'Hội Viên'];
  const raciRows = BRD_DATA.raciMatrix.processes.map((p) => [
    p.id,
    p.name,
    p.BQT,
    p.BTV,
    p.BTK,
    p.BTN_BTC,
    p.BTT,
    p.BXT,
    p.MEM,
  ]);
  children.push(createTable(raciHeaders, raciRows, [800, 3600, 600, 700, 700, 700, 700, 700, 700]));
  addMd(formatMdTable(raciHeaders, raciRows));

  // Chương 4: Đặc tả các luồng nghiệp vụ cốt lõi
  children.push(createHeading1('CHƯƠNG 4: ĐẶC TẢ CHI TIẾT CÁC QUY TRÌNH NGHIỆP VỤ CỐT LÕI'));
  addMd('## CHƯƠNG 4: ĐẶC TẢ CHI TIẾT CÁC QUY TRÌNH NGHIỆP VỤ CỐT LÕI');

  BRD_DATA.coreProcesses.forEach((proc) => {
    children.push(createHeading2(`${proc.id}: ${proc.name}`));
    addMd(`### ${proc.id}: ${proc.name}`);
    children.push(createPara(`Chủ thể tham gia: ${proc.actor}`, { bold: true, color: SLATE_DARK }));
    addMd(`**Chủ thể tham gia:** ${proc.actor}`);

    const flowHeaders = ['Bước', 'Tên Thao Tác Nghiệp Vụ', 'Mô Tả Chi Tiết Quy Trình & Tiêu Chuẩn Thực Hiện'];
    const flowRows = proc.steps.map((s) => [s.step, s.name, s.desc]);
    children.push(createTable(flowHeaders, flowRows, [800, 2600, 5800]));
    addMd(formatMdTable(flowHeaders, flowRows));
  });

  // Chương 5: Quy tắc nghiệp vụ bắt buộc
  children.push(createHeading1('CHƯƠNG 5: DANH MỤC QUY TẮC NGHIỆP VỤ BẮT BUỘC (BUSINESS RULES)'));
  addMd('## CHƯƠNG 5: DANH MỤC QUY TẮC NGHIỆP VỤ BẮT BUỘC (BUSINESS RULES)');

  const ruleHeaders = ['Mã Luật', 'Tên Quy Tắc', 'Nội Dung Quy Định Bắt Buộc & Chế Tài'];
  const ruleRows = BRD_DATA.businessRules.map((r) => [r.code, r.name, r.desc]);
  children.push(createTable(ruleHeaders, ruleRows, [1600, 2600, 5000]));
  addMd(formatMdTable(ruleHeaders, ruleRows));

  // Chương 6: Bảng phân tích hiện trạng GAP
  children.push(createHeading1('CHƯƠNG 6: BẢNG PHÂN TÍCH HIỆN TRẠNG (GAP ANALYSIS)'));
  addMd('## CHƯƠNG 6: BẢNG PHÂN TÍCH HIỆN TRẠNG (GAP ANALYSIS)');

  const gapHeaders = ['Hạng Mục Tích Hợp', 'Kỳ Vọng Thiết Kế Hoàn Chỉnh', 'Hiện Trạng Kết Nối Thực Tế', 'Giải Pháp Vận Hành Tác Nghiệp'];
  const gapRows = BRD_DATA.gapAnalysis.map((g) => [
    g.item,
    g.designedState,
    g.actualState,
    g.operationalSolution,
  ]);
  children.push(createTable(gapHeaders, gapRows, [1600, 2400, 2600, 2600]));
  addMd(formatMdTable(gapHeaders, gapRows));

  // Chương 7: Yêu cầu phi chức năng
  children.push(createHeading1('CHƯƠNG 7: YÊU CẦU PHI CHỨC NĂNG & TIÊU CHUẨN KỸ THUẬT'));
  addMd('## CHƯƠNG 7: YÊU CẦU PHI CHỨC NĂNG & TIÊU CHUẨN KỸ THUẬT');

  BRD_DATA.nonFunctionalRequirements.forEach((nfr) => {
    children.push(createHeading2(nfr.category));
    addMd(`### ${nfr.category}`);
    const nfrHeaders = ['Tiêu Chí Kỹ Thuật', 'Chỉ Số Cam Kết & Yêu Cầu Chất Lượng (SLA)'];
    const nfrRows = nfr.specs.map((s) => [s.metric, s.target]);
    children.push(createTable(nfrHeaders, nfrRows, [3500, 5700]));
    addMd(formatMdTable(nfrHeaders, nfrRows));
  });

  const doc = new Document({
    sections: [
      {
        headers: { default: header },
        footers: { default: footer },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  function safeWrite(filePath, data, isText = false) {
    try {
      if (isText) fs.writeFileSync(filePath, data, 'utf-8');
      else fs.writeFileSync(filePath, data);
      console.log(`  ✓ Đã ghi: ${path.basename(filePath)}`);
    } catch (err) {
      if (err.code === 'EBUSY') {
        console.warn(`  ⚠️ Tệp ${path.basename(filePath)} đang mở trong Word, thử ghi vào tệp thay thế...`);
        const ext = path.extname(filePath);
        const altPath = filePath.replace(ext, `_NEW${ext}`);
        try {
          if (isText) fs.writeFileSync(altPath, data, 'utf-8');
          else fs.writeFileSync(altPath, data);
          console.log(`  ✓ Đã ghi tệp thay thế: ${path.basename(altPath)}`);
        } catch (innerErr) {
          console.warn(`  ❌ Không thể ghi tệp thay thế: ${innerErr.message}`);
        }
      } else {
        console.warn(`  ❌ Lỗi khi ghi tệp ${path.basename(filePath)}: ${err.message}`);
      }
    }
  }

  // Ghi file ra docs và document
  safeWrite(path.join(__dirname, '../docs/BRD_CEO1983_YEU_CAU_NGHIEP_VU_TOAN_DIEN.docx'), buffer);
  safeWrite(path.join(__dirname, '../docs/BRD_CEO1983_YEU_CAU_NGHIEP_VU_TOAN_DIEN.md'), md, true);
  safeWrite(path.join(__dirname, '../document/BRD_CEO1983_YEU_CAU_NGHIEP_VU_TOAN_DIEN.docx'), buffer);
  safeWrite(path.join(__dirname, '../document/BRD_CEO1983_YEU_CAU_NGHIEP_VU_TOAN_DIEN.md'), md, true);

  console.log('✅ Đã xuất bản thành công BRD (DOCX + MD)!');
}

// =============================================================
// BUILDER 2: BỘ SINH TÀI LIỆU ĐẶC TẢ PHẦN MỀM SRS (IEEE 830)
// =============================================================
async function generateSrsDocument({ title, subTitle, docCode, useCases, targetFiles }) {
  const { header, footer } = createHeaderFooter(`Software Requirements Specification · ${docCode}`);
  const children = [];
  let md = '';

  function addMd(text) {
    md += text + '\n\n';
  }

  // Cover Page
  children.push(
    ...createCoverPage({
      title,
      subTitle: `${subTitle}\nTIÊU CHUẨN IEEE 830-1998 (PHÂN TÍCH MECE 100%)`,
      docCode,
      version: SRS_METADATA.version,
      date: SRS_METADATA.date,
      organization: SRS_METADATA.organization,
      author: SRS_METADATA.author,
    })
  );

  addMd(`# ${title}`);
  addMd(`## ${subTitle}`);
  addMd(`### TIÊU CHUẨN IEEE 830-1998 (PHÂN TÍCH MECE 100%)`);
  addMd(`*Mã tài liệu: ${docCode} | Phiên bản: ${SRS_METADATA.version} | Ngày phê duyệt: ${SRS_METADATA.date}*`);
  addMd(`*Cơ quan chủ quản: ${SRS_METADATA.organization}*`);
  addMd(`*Chuyên gia thực hiện: ${SRS_METADATA.author}*\n---`);

  // SECTION 1: GIỚI THIỆU CHUNG
  children.push(createHeading1('1. GIỚI THIỆU CHUNG (INTRODUCTION)'));
  addMd('## 1. GIỚI THIỆU CHUNG (INTRODUCTION)');

  children.push(createHeading2('1.1. Mục Đích Của Tài Liệu (Purpose)'));
  addMd('### 1.1. Mục Đích Của Tài Liệu (Purpose)');
  const purposeText =
    `Tài liệu Đặc tả Yêu cầu Phần mềm (Software Requirements Specification - SRS) mã hiệu [${docCode}] được biên soạn theo đúng tiêu chuẩn quốc tế IEEE 830-1998, nhằm xác định một cách đầy đủ, chính xác, không mơ hồ toàn bộ các yêu cầu chức năng, yêu cầu phi chức năng, thiết kế vai trò người dùng, hành trình trải nghiệm và các giao diện tích hợp hệ thống cho Hệ Sinh Thái Số Hóa Hiệp Hội Doanh Nhân CEO 1983 (Trực thuộc HanoiBA). Tài liệu là căn cứ pháp lý và kỹ thuật duy nhất để nghiệm thu phần mềm.`;
  children.push(createPara(purposeText));
  addMd(purposeText);

  children.push(createHeading2('1.2. Phạm Vi Tài Liệu (Document Scope)'));
  addMd('### 1.2. Phạm Vi Tài Liệu (Document Scope)');
  const scopeText =
    `Tài liệu này bao gồm đặc tả chi tiết của ${useCases.length} trường hợp sử dụng (Use Cases) tương ứng với phạm vi chức năng bàn giao, áp dụng nguyên tắc MECE (Mutually Exclusive, Collectively Exhaustive) để tuyệt đối không trùng lặp và không bỏ sót bất kỳ luồng tác nghiệp nào của Hội đồng Điều hành và Hội viên CLB Doanh Nhân CEO 1983.`;
  children.push(createPara(scopeText));
  addMd(scopeText);

  children.push(createHeading2('1.3. Định Nghĩa & Viết Tắt (Definitions & Acronyms)'));
  addMd('### 1.3. Định Nghĩa & Viết Tắt (Definitions & Acronyms)');
  const termHeaders = ['Từ Viết Tắt', 'Thuật Ngữ Tiếng Anh / Tiếng Việt', 'Định Nghĩa Chi Tiết Trong Hệ Thống'];
  const termRows = [
    ['HanoiBA', 'Hanoi Young Business Association', 'Hội Doanh Nhân Trẻ Hà Nội, cơ quan cấp trên của CLB CEO 1983.'],
    ['CLB CEO 1983', 'CEO 1983 Business Club', 'Câu lạc bộ các nhà lãnh đạo doanh nghiệp sinh năm 1983 (Quý Hợi).'],
    ['BQT', 'Board of Management', 'Ban Quản Trị CLB Doanh Nhân CEO 1983.'],
    ['BTK', 'Secretariat Committee', 'Ban Thư Ký CLB, cơ quan điều hành hành chính văn phòng.'],
    ['BTV', 'Membership Committee', 'Ban Thành Viên, cơ quan độc quyền thẩm định và duyệt kết nạp hội viên.'],
    ['BTN', 'Charity Committee', 'Ban Thiện Nguyện & An Sinh Xã Hội.'],
    ['BTT', 'Media & Event Committee', 'Ban Truyền Thông & Sự Kiện.'],
    ['BXT', 'Trade Promotion Committee', 'Ban Xúc Tiến Thương Mại & Đầu Tư.'],
    ['RBAC', 'Role-Based Access Control', 'Mô hình kiểm soát truy cập dựa trên vai trò người dùng.'],
    ['VietQR', 'Vietnam QR Payment Standard', 'Chuẩn thanh toán chuyển khoản liên ngân hàng Napas 24/7.'],
    ['NFC', 'Near Field Communication', 'Công nghệ giao tiếp trường gần tần số 13.56MHz chia sẻ danh thiếp.'],
    ['MECE', 'Mutually Exclusive, Collectively Exhaustive', 'Nguyên tắc phân tích không trùng lặp, không bỏ sót chức năng.'],
  ];
  children.push(createTable(termHeaders, termRows, [1600, 3000, 4600]));
  addMd(formatMdTable(termHeaders, termRows));

  // SECTION 2: MÔ TẢ TỔNG QUAN
  children.push(createHeading1('2. MÔ TẢ TỔNG QUAN (OVERALL DESCRIPTION)'));
  addMd('## 2. MÔ TẢ TỔNG QUAN (OVERALL DESCRIPTION)');

  children.push(createHeading2('2.1. Danh Sách User Roles & Ma Trận Phân Quyền (Roles & Permissions)'));
  addMd('### 2.1. Danh Sách User Roles & Ma Trận Phân Quyền (Roles & Permissions)');
  const roleHeaders = ['Mã Role', 'Tên Vai Trò', 'Đối Tượng Áp Dụng', 'Mô Tả Quyền Hạn Cốt Lõi'];
  const roleRows = USER_ROLES_DATA.map((r) => [r.roleCode, r.roleName, r.target, r.permissions]);
  children.push(createTable(roleHeaders, roleRows, [1200, 2400, 2400, 3200]));
  addMd(formatMdTable(roleHeaders, roleRows));

  children.push(createHeading2('2.2. Ánh Xạ Toàn Bộ Hành Trình Người Dùng (User Journeys)'));
  addMd('### 2.2. Ánh Xạ Toàn Bộ Hành Trình Người Dùng (User Journeys)');
  USER_JOURNEYS_DATA.forEach((uj) => {
    children.push(createHeading3(`${uj.journeyId}: ${uj.name}`));
    addMd(`#### ${uj.journeyId}: ${uj.name}`);
    children.push(createPara(`Đối tượng trải nghiệm: ${uj.targetRole}`, { bold: true, color: SLATE_DARK }));
    addMd(`**Đối tượng trải nghiệm:** ${uj.targetRole}`);
    children.push(...createStepParas(uj.steps));
    addMd(uj.steps.map((s) => `${s}`).join('\n\n'));
  });

  children.push(createHeading2('2.3. Môi Trường Hoạt Động Của Hệ Thống (Operating Environment)'));
  addMd('### 2.3. Môi Trường Hoạt Động Của Hệ Thống (Operating Environment)');
  const envText =
    '* Phía Máy Khách (Clients):\n' +
    '  - Trình duyệt Web Desktop: Google Chrome 90+, Apple Safari 14+, Mozilla Firefox 90+, Microsoft Edge 90+.\n' +
    '  - Thiết bị Di động (Mobile): iOS 14.0+ (Safari PWA / Mobile Safari), Android 9.0+ (Chrome / Edge PWA / Native APK).\n' +
    '* Phía Máy Chủ (Server & Infrastructure):\n' +
    '  - Hệ điều hành máy chủ: Linux Ubuntu 22.04 LTS (Containerized Docker Architecture).\n' +
    '  - Web Server & Gateway: Nginx Reverse Proxy (SSL/TLS 1.3, HTTP/2, WSS Gateway Reverse Proxy).\n' +
    '  - Runtime Engine: Node.js v18.x LTS, NestJS Framework v10.x.\n' +
    '  - Cơ sở dữ liệu: PostgreSQL v15+ kết hợp Prisma ORM (@vibe/db) và Connection Pooler PgBouncer.\n' +
    '  - Lưu trữ tệp đối tượng: MinIO S3 Compatible Object Storage.\n' +
    '  - Động cơ thời gian thực: Socket.IO Gateway Engine.';
  children.push(createPara(envText));
  addMd(envText);

  // SECTION 3: YÊU CẦU CHỨC NĂNG CHI TIẾT (FUNCTIONAL REQUIREMENTS)
  children.push(createHeading1(`3. YÊU CẦU CHỨC NĂNG CHI TIẾT (FUNCTIONAL REQUIREMENTS — ${useCases.length} USE CASES)`));
  addMd(`## 3. YÊU CẦU CHỨC NĂNG CHI TIẾT (FUNCTIONAL REQUIREMENTS — ${useCases.length} USE CASES)`);
  children.push(
    createPara(
      'Mỗi chức năng dưới đây được đặc tả theo đúng chuẩn quốc tế bao gồm 12 trường thông tin: Mã Use Case, Tên chức năng, Module, Mục tiêu, Tác nhân, Tiền điều kiện, Từ điển dữ liệu đầu vào, Luồng sự kiện chính (mỗi bước xuống dòng rõ ràng), Luồng thay thế, Luồng ngoại lệ, Hậu điều kiện, Quy tắc nghiệp vụ và Ánh xạ kỹ thuật CSDL/API.'
    )
  );
  addMd(
    '*Mỗi chức năng dưới đây được đặc tả theo đúng chuẩn quốc tế bao gồm 12 trường thông tin: Mã Use Case, Tên chức năng, Module, Mục tiêu, Tác nhân, Tiền điều kiện, Từ điển dữ liệu đầu vào, Luồng sự kiện chính (mỗi bước xuống dòng rõ ràng), Luồng thay thế, Luồng ngoại lệ, Hậu điều kiện, Quy tắc nghiệp vụ và Ánh xạ kỹ thuật CSDL/API.*\n'
  );

  useCases.forEach((uc) => {
    children.push(createHeading2(`[${uc.ucId}] ${uc.name}`));
    addMd(`### [${uc.ucId}] ${uc.name}`);

    // Bảng thông tin tổng quan Use Case
    const ucMetaHeaders = ['Thuộc Tính', 'Đặc Tả Kỹ Thuật Chi Tiết'];
    const ucMetaRows = [
      ['Mã Use Case', uc.ucId],
      ['Tên Chức Năng', uc.name],
      ['Phân Hệ / Module', uc.module],
      ['Mục Tiêu Nghiệp Vụ', uc.description],
      ['Tác Nhân (Actors)', uc.actors],
      ['Tiền Điều Kiện (Pre-conditions)', uc.preConditions],
      ['Hậu Điều Kiện (Post-conditions)', uc.postConditions],
      ['Quy Tắc Nghiệp Vụ (Business Rules)', uc.businessRules],
      ['Ánh Xạ Kỹ Thuật (Tech Mapping)', uc.techMapping],
    ];
    children.push(createTable(ucMetaHeaders, ucMetaRows, [2600, 6600]));
    addMd(formatMdTable(ucMetaHeaders, ucMetaRows));

    // Bảng dữ liệu đầu vào
    if (uc.inputs && uc.inputs.length > 0) {
      children.push(createHeading3('Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)'));
      addMd('#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)');
      const inputHeaders = ['Trường Dữ Liệu', 'Kiểu Dữ Liệu', 'Bắt Buộc', 'Quy Tắc Kiểm Tra & Định Dạng (Validation)'];
      const inputRows = uc.inputs.map((inp) => [
        inp.field,
        inp.type,
        inp.req ? 'BẮT BUỘC' : 'Tùy chọn',
        inp.val,
      ]);
      children.push(createTable(inputHeaders, inputRows, [2200, 1800, 1400, 3800]));
      addMd(formatMdTable(inputHeaders, inputRows));
    }

    // Luồng sự kiện chính (TỪNG BƯỚC XUỐNG DÒNG ĐỘC LẬP TRONG WORD)
    children.push(createHeading3('Luồng Sự Kiện Chính (Step-by-step Main Flow)'));
    addMd('#### Luồng Sự Kiện Chính (Step-by-step Main Flow)');
    children.push(...createStepParas(uc.mainFlow));
    addMd(uc.mainFlow.map((s) => `${s}`).join('\n\n'));

    // Luồng thay thế & Luồng ngoại lệ
    if (uc.alternativeFlows && uc.alternativeFlows.length > 0) {
      children.push(createHeading3('Luồng Rẽ Nhánh / Thay Thế (Alternative Flows)'));
      addMd('#### Luồng Rẽ Nhánh / Thay Thế (Alternative Flows)');
      children.push(...createStepParas(uc.alternativeFlows, { prefixColor: GOLD }));
      addMd(uc.alternativeFlows.map((s) => `${s}`).join('\n\n'));
    }

    if (uc.exceptionFlows && uc.exceptionFlows.length > 0) {
      children.push(createHeading3('Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)'));
      addMd('#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)');
      children.push(...createStepParas(uc.exceptionFlows, { prefixColor: 'DC2626', color: '991B1B' }));
      addMd(uc.exceptionFlows.map((s) => `${s}`).join('\n\n'));
    }
  });

  // SECTION 4: YÊU CẦU PHI CHỨC NĂNG
  children.push(createHeading1('4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS - ISO/IEC 25010)'));
  addMd('## 4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS - ISO/IEC 25010)');

  const nfrData = [
    {
      name: 'Hiệu Năng & Thời Gian Đáp Ứng (Performance & Latency)',
      items: [
        'Thời gian đáp ứng API thông thường: < 150ms trên 95% request.',
        'Tốc độ quét nhận diện mã QR tại Cổng Soát Vé: < 0.2s (200ms).',
        'Thời gian tải trang ban đầu (First Contentful Paint): < 1.5s trên mạng 4G.',
        'Tốc độ đẩy thông báo thời gian thực qua WebSocket: < 50ms.',
      ],
    },
    {
      name: 'Bảo Mật & Kiểm Soát Truy Cập (Security & Access Control)',
      items: [
        'Mã hóa đường truyền dữ liệu 100% bằng HTTPS TLS 1.3 và WSS.',
        'Mật khẩu người dùng được băm an toàn bằng thuật toán Bcrypt với Salt 10 vòng.',
        'Tự động khóa tài khoản tạm thời trong 15 phút nếu nhập sai mật khẩu quá 5 lần.',
        'Phân quyền theo vai trò RBAC 5 cấp bậc nghiêm ngặt kết hợp chặn cứng quyền duyệt hội viên của Ban Thư Ký.',
      ],
    },
    {
      name: 'Độ Tin Cậy & Tính Sẵn Sàng (Reliability & High Availability)',
      items: [
        'Hệ thống cam kết độ sẵn sàng hoạt động đạt tối thiểu 99.9% (Uptime).',
        'Cơ chế sao lưu dữ liệu tự động hàng ngày lúc 03:00 AM, lưu trữ phân tán 30 ngày.',
        'Thời gian phục hồi dịch vụ sau thảm họa (RTO) < 2 giờ; Mức mất mát dữ liệu (RPO) < 24 giờ.',
      ],
    },
  ];

  nfrData.forEach((n) => {
    children.push(createHeading2(n.name));
    addMd(`### ${n.name}`);
    children.push(...createStepParas(n.items));
    addMd(n.items.map((it, idx) => `${idx + 1}. ${it}`).join('\n\n'));
  });

  // SECTION 5: GIAO DIỆN HỆ THỐNG & KIẾN TRÚC DỮ LIỆU
  children.push(createHeading1('5. GIAO DIỆN HỆ THỐNG & KIẾN TRÚC DỮ LIỆU (SYSTEM INTERFACES)'));
  addMd('## 5. GIAO DIỆN HỆ THỐNG & KIẾN TRÚC DỮ LIỆU (SYSTEM INTERFACES)');

  const ifText =
    '* Quy Chuẩn Giao Diện Người Dùng (UI/UX Guidelines):\n' +
    '  - Màu sắc chủ đạo: Xanh Navy `#003B95` và Vàng Ánh Kim Amber Gold `#F59E0B`.\n' +
    '  - Tuyệt đối cấm sử dụng nút bấm màu đen thuần `#000000`.\n' +
    '  - Bảng dữ liệu hỗ trợ cuộn ngang chuẩn với Cột STT cố định bên trái và Cột Thao tác cố định bên phải.\n' +
    '* Giao Diện Phần Cứng & Thẻ Thông Minh (Hardware/NFC Interfaces):\n' +
    '  - Chip NFC tần số 13.56MHz tương thích chuẩn ISO/IEC 14443 Type A.\n' +
    '  - Chạm mặt sau thẻ vào smartphone để mở liên kết công khai `/card/:slug`.\n' +
    '* Kiến Trúc Cơ Sở Dữ Liệu PostgreSQL (Prisma ORM):\n' +
    '  - Bảng hội viên: `members` (liên kết `vione_users` qua `user_id`).\n' +
    '  - Bảng danh thiếp số: `member_business_cards` (chứa slug, branding, liên kết mạng xã hội).\n' +
    '  - Bảng sự kiện: `events`, `event_ticket_types`, `event_registrations`, `member_checkins`.\n' +
    '  - Bảng tài chính & hội phí: `invoices`, `associations`.\n' +
    '* Giao Diện Dịch Vụ Bên Ngoài (External APIs):\n' +
    '  - Cổng thanh toán VietQR Napas 24/7 (Sinh mã QR động chuyển khoản liên ngân hàng).\n' +
    '  - Dịch vụ thư điện tử SMTP Gmail Relay (`smtp.gmail.com:465`).\n' +
    '  - Dịch vụ lưu trữ đối tượng MinIO S3 Compatible Object Storage.';
  children.push(createPara(ifText));
  addMd(ifText);

  const doc = new Document({
    sections: [
      {
        headers: { default: header },
        footers: { default: footer },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  function safeWrite(filePath, data, isText = false) {
    try {
      if (isText) {
        fs.writeFileSync(filePath, data, 'utf-8');
      } else {
        fs.writeFileSync(filePath, data);
      }
      console.log(`  ✓ Đã ghi: ${path.basename(filePath)}`);
    } catch (err) {
      if (err.code === 'EBUSY') {
        console.warn(`  ⚠️ Tệp ${path.basename(filePath)} đang mở trong Word, thử ghi vào tệp thay thế...`);
        const ext = path.extname(filePath);
        const altPath = filePath.replace(ext, `_NEW${ext}`);
        try {
          if (isText) fs.writeFileSync(altPath, data, 'utf-8');
          else fs.writeFileSync(altPath, data);
          console.log(`  ✓ Đã ghi tệp thay thế: ${path.basename(altPath)}`);
        } catch (innerErr) {
          console.warn(`  ❌ Không thể ghi tệp thay thế: ${innerErr.message}`);
        }
      } else {
        console.warn(`  ❌ Lỗi khi ghi tệp ${path.basename(filePath)}: ${err.message}`);
      }
    }
  }

  // Ghi đồng thời ra các target files chỉ định
  targetFiles.forEach((f) => {
    safeWrite(f.docx, buffer);
    safeWrite(f.md, md, true);
  });
}

async function buildSRS() {
  console.log('Đang khởi tạo bộ tài liệu Đặc Tả Phần Mềm SRS IEEE 830...');

  // 1. TÀI LIỆU SRS MASTER TOÀN DIỆN (CHỨA ĐẦY ĐỦ 48 USE CASES)
  console.log('>>> [1/3] Xuất bản SRS Master Toàn Diện (48 Use Cases)...');
  await generateSrsDocument({
    title: SRS_METADATA.title,
    subTitle: SRS_METADATA.subTitle,
    docCode: SRS_METADATA.docCode,
    useCases: ALL_USE_CASES_DETAILED,
    targetFiles: [
      {
        docx: path.join(__dirname, '../docs/SRS_IEEE830_CEO1983_TOAN_DIEN.docx'),
        md: path.join(__dirname, '../docs/SRS_IEEE830_CEO1983_TOAN_DIEN.md'),
      },
      {
        docx: path.join(__dirname, '../document/SRS_IEEE830_CEO1983_TOAN_DIEN.docx'),
        md: path.join(__dirname, '../document/SRS_IEEE830_CEO1983_TOAN_DIEN.md'),
      },
      {
        docx: path.join(__dirname, '../document/SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.docx'),
        md: path.join(__dirname, '../document/SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.md'),
      },
      {
        docx: path.join(__dirname, '../docs/SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.docx'),
        md: path.join(__dirname, '../docs/SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.md'),
      },
      {
        docx: path.join(__dirname, '../docs/SRS_CEO1983_HE_THONG_TOAN_DIEN.docx'),
        md: path.join(__dirname, '../docs/SRS_CEO1983_HE_THONG_TOAN_DIEN.md'),
      },
      {
        docx: path.join(__dirname, '../document/SRS_CEO1983_HE_THONG_TOAN_DIEN.docx'),
        md: path.join(__dirname, '../document/SRS_CEO1983_HE_THONG_TOAN_DIEN.md'),
      },
    ],
  });

  // 2. TÀI LIỆU SRS_01_Web_CRM_CEO1983 (CHUYÊN BIỆT CHO PHÂN HỆ CRM & LANDING - 28 USE CASES)
  console.log('>>> [2/3] Xuất bản SRS_01_Web_CRM_CEO1983 (Cổng thông tin & CRM Quản trị)...');
  const crmUseCases = ALL_USE_CASES_DETAILED.filter(
    (uc) => uc.ucId.startsWith('UC-PUB-') || uc.ucId.startsWith('UC-CRM-')
  );
  await generateSrsDocument({
    title: 'TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) — PHÂN HỆ CỔNG THÔNG TIN & WEB CRM QUẢN TRỊ ĐIỀU HÀNH',
    subTitle: 'HỆ SINH THÁI SỐ HÓA HIỆP HỘI DOANH NHÂN CEO 1983 (HANOIBA)',
    docCode: 'SRS-01-CRM-CEO1983-2026',
    useCases: crmUseCases,
    targetFiles: [
      {
        docx: path.join(__dirname, '../docs/SRS_01_Web_CRM_CEO1983.docx'),
        md: path.join(__dirname, '../docs/SRS_01_Web_CRM_CEO1983.md'),
      },
      {
        docx: path.join(__dirname, '../document/SRS_01_Web_CRM_CEO1983.docx'),
        md: path.join(__dirname, '../document/SRS_01_Web_CRM_CEO1983.md'),
      },
    ],
  });

  // 3. TÀI LIỆU SRS_02_App_Hiep_Hoi_CEO1983 (CHUYÊN BIỆT CHO MOBILE APP HỘI VIÊN - 20 USE CASES)
  console.log('>>> [3/3] Xuất bản SRS_02_App_Hiep_Hoi_CEO1983 (Ứng dụng di động hội viên & PWA)...');
  const appUseCases = ALL_USE_CASES_DETAILED.filter((uc) => uc.ucId.startsWith('UC-APP-'));
  await generateSrsDocument({
    title: 'TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) — PHÂN HỆ ỨNG DỤNG DI ĐỘNG HỘI VIÊN & PWA',
    subTitle: 'HỆ SINH THÁI SỐ HÓA HIỆP HỘI DOANH NHÂN CEO 1983 (HANOIBA)',
    docCode: 'SRS-02-APP-CEO1983-2026',
    useCases: appUseCases,
    targetFiles: [
      {
        docx: path.join(__dirname, '../docs/SRS_02_App_Hiep_Hoi_CEO1983.docx'),
        md: path.join(__dirname, '../docs/SRS_02_App_Hiep_Hoi_CEO1983.md'),
      },
      {
        docx: path.join(__dirname, '../document/SRS_02_App_Hiep_Hoi_CEO1983.docx'),
        md: path.join(__dirname, '../document/SRS_02_App_Hiep_Hoi_CEO1983.md'),
      },
    ],
  });

  console.log('✅ Đã xuất bản thành công trọn bộ 3 tài liệu SRS (Master, CRM, Mobile App) chuẩn IEEE 830!');
}

// =============================================================
// BUILDER 3: TÀI LIỆU HƯỚNG DẪN SỬ DỤNG (HDSD) CHUẨN PLAYBOOK 18 + UNICOM
// =============================================================
async function buildHDSD() {
  console.log('Đang khởi tạo tài liệu HDSD Playbook 18 + UNICOM CLB CEO 1983...');

  // HTML Content chuẩn Playbook 18 + UNICOM in ấn A4
  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HƯỚNG DẪN SỬ DỤNG TOÀN DIỆN — CLB DOANH NHÂN CEO 1983 (HANOIBA)</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
      @top-left {
        content: "CLB DOANH NHÂN CEO 1983 — HANOIBA";
        font-family: 'Times New Roman', serif;
        font-size: 9pt;
        color: #64748b;
      }
      @top-right {
        content: "TÀI LIỆU HƯỚNG DẪN SỬ DỤNG CHUYỂN GIAO";
        font-family: 'Times New Roman', serif;
        font-size: 9pt;
        color: #64748b;
      }
      @bottom-left {
        content: "Bản quyền © 2026 CLB Doanh Nhân CEO 1983";
        font-family: 'Times New Roman', serif;
        font-size: 9pt;
        color: #64748b;
      }
      @bottom-right {
        content: "Trang " counter(page) " / " counter(pages);
        font-family: 'Times New Roman', serif;
        font-size: 9pt;
        color: #64748b;
      }
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #1e293b;
      margin: 0;
      padding: 0;
      background-color: #ffffff;
    }

    /* TRANG BÌA CHUẨN A4 297MM */
    .cover-page {
      width: 100%;
      height: 297mm;
      max-height: 297mm;
      padding: 40mm 20mm 30mm 20mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
      page-break-after: always;
      background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
      border-bottom: 3px solid #003b95;
    }

    .cover-top h3 {
      font-size: 14pt;
      color: #d97706;
      margin: 0 0 5px 0;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .cover-top h4 {
      font-size: 12pt;
      color: #003b95;
      margin: 0;
      text-transform: uppercase;
    }

    .cover-center {
      margin: auto 0;
    }

    .cover-center h1 {
      font-size: 24pt;
      color: #003b95;
      margin: 0 0 15px 0;
      line-height: 1.3;
      text-transform: uppercase;
      font-weight: bold;
    }

    .cover-center h2 {
      font-size: 14pt;
      color: #475569;
      font-weight: normal;
      font-style: italic;
      margin: 0;
    }

    .cover-bottom {
      font-size: 11pt;
      color: #475569;
      line-height: 1.6;
    }

    .cover-bottom strong {
      color: #003b95;
    }

    /* NỘI DUNG TÀI LIỆU */
    .document-body {
      padding: 0;
    }

    h1.chapter-title {
      font-size: 16pt;
      color: #003b95;
      border-bottom: 2px solid #003b95;
      padding-bottom: 5px;
      margin-top: 30px;
      margin-bottom: 15px;
      page-break-before: always;
      text-transform: uppercase;
    }

    h2.section-title {
      font-size: 13pt;
      color: #0084ff;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    h3.sub-title {
      font-size: 12pt;
      color: #d97706;
      margin-top: 15px;
      margin-bottom: 8px;
    }

    p {
      margin: 0 0 10px 0;
      text-align: justify;
    }

    /* KHUNG HỘP GHI CHÚ */
    .callout {
      padding: 12px 16px;
      margin: 15px 0;
      border-left: 4px solid #0084ff;
      background-color: #f0f7ff;
      border-radius: 0 6px 6px 0;
      font-size: 11pt;
    }

    .callout.warning {
      border-left-color: #d97706;
      background-color: #fffbeb;
    }

    .callout.danger {
      border-left-color: #dc2626;
      background-color: #fef2f2;
    }

    .callout-title {
      font-weight: bold;
      margin-bottom: 5px;
    }

    /* QUY CHUẨN ẢNH PLAYBOOK 18 */
    /* 1. Màn hình Desktop Web CRM: Chiếm full trang hoặc 90% */
    .desktop-screenshot-container {
      width: 100%;
      margin: 15px 0;
      text-align: center;
      page-break-inside: avoid;
    }

    .desktop-screenshot {
      width: 100%;
      max-width: 95%;
      height: auto;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      display: inline-block;
    }

    /* 2. Màn hình Mobile App: BẮT BUỘC đặt trong khung điện thoại tỷ lệ dọc (275px-320px) */
    .mobile-mockup-wrapper {
      width: 100%;
      margin: 15px 0;
      display: flex;
      justify-content: center;
      page-break-inside: avoid;
    }

    .phone-mockup {
      width: 290px;
      height: auto;
      background: #0f172a;
      border: 8px solid #1e293b;
      border-radius: 36px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      padding: 10px 6px;
      display: inline-block;
      text-align: center;
      position: relative;
    }

    .phone-mockup::before {
      content: "";
      display: block;
      width: 70px;
      height: 4px;
      background: #334155;
      border-radius: 2px;
      margin: 0 auto 8px auto;
    }

    .phone-mockup img {
      width: 100%;
      height: auto;
      border-radius: 24px;
      display: block;
    }

    .image-caption {
      font-size: 10pt;
      font-style: italic;
      color: #64748b;
      margin-top: 6px;
      text-align: center;
    }

    /* BẢNG BIỂU */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 10.5pt;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
    }

    th {
      background-color: #003b95;
      color: #ffffff;
      font-weight: bold;
      text-align: center;
    }

    tr:nth-child(even) {
      background-color: #f8fafc;
    }
  </style>
</head>
<body>

  <!-- TRANG BÌA CHUẨN A4 297MM -->
  <div class="cover-page">
    <div class="cover-top">
      <h3>CÂU LẠC BỘ DOANH NHÂN CEO 1983</h3>
      <h4>TRỰC THUỘC HỘI DOANH NHÂN TRẺ HÀ NỘI (HANOIBA)</h4>
    </div>

    <div class="cover-center">
      <h1>HƯỚNG DẪN SỬ DỤNG & ĐÀO TẠO CHUYỂN GIAO VẬN HÀNH</h1>
      <h2>Hệ Sinh Thái Số Hóa Quản Trị Hiệp Hội & Ứng Dụng Doanh Nhân CEO 1983</h2>
      <p style="text-align:center; color:#64748b; margin-top:20px; font-size:11pt;">
        Chuẩn Mực Vận Hành 6 Ban Chuyên Môn & 500+ Hội Viên Chính Danh
      </p>
    </div>

    <div class="cover-bottom">
      <p>
        <strong>Mã Tài Liệu:</strong> HDSD-CEO1983-MASTER-V5.0<br>
        <strong>Phiên Bản:</strong> Version 5.0 (Master Production Release)<br>
        <strong>Đơn Vị Thực Hiện:</strong> Ban Công Nghệ Chuyển Đổi Số & ViConnect Platform<br>
        <strong>Ngày Ban Hành:</strong> 04/10/2026
      </p>
    </div>
  </div>

  <div class="document-body">

    <!-- CHƯƠNG 1 -->
    <h1 class="chapter-title">CHƯƠNG 1: TỔNG QUAN HỆ THỐNG & CƠ CẤU 6 CHUYÊN BAN</h1>
    <p>Hệ sinh thái công nghệ của CLB Doanh Nhân CEO 1983 (trực thuộc HanoiBA) được thiết kế đồng bộ nhằm phục vụ hơn 500+ doanh nhân tuổi Quý Hợi 1983. Hệ thống vận hành theo ma trận phân quyền 5 cấp bậc nghiêm ngặt kết hợp phân công tác nghiệp theo 6 Ban chuyên môn:</p>
    
    <table>
      <thead>
        <tr>
          <th>STT</th>
          <th>Ban Chuyên Môn</th>
          <th>Tài Khoản Điều Hành</th>
          <th>Phạm Vi Quản Trị Cốt Lõi</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align:center;">1</td>
          <td><strong>Ban Quản Trị (BQT)</strong></td>
          <td><code>admin@connect.vn</code></td>
          <td>Lãnh đạo tối cao, phê duyệt ngân sách, sự kiện và phân quyền hệ thống.</td>
        </tr>
        <tr>
          <td style="text-align:center;">2</td>
          <td><strong>Ban Thư Ký (BTK)</strong></td>
          <td><code>ceo.tongthuky@ceo1983.com</code></td>
          <td>Triệu tập họp, phòng họp Sapphire Hub, biên bản. <em>Tuyệt đối không duyệt hội viên.</em></td>
        </tr>
        <tr>
          <td style="text-align:center;">3</td>
          <td><strong>Ban Thành Viên (BTV)</strong></td>
          <td><code>ceo.thanhvien@ceo1983.com</code></td>
          <td><strong>Độc quyền tiếp nhận, thẩm định và phê duyệt kết nạp hội viên mới.</strong></td>
        </tr>
        <tr>
          <td style="text-align:center;">4</td>
          <td><strong>Ban Thiện Nguyện (BTN)</strong></td>
          <td><code>ceo.thiennguyen@ceo1983.com</code></td>
          <td>Điều hành Quỹ an sinh xã hội, sổ quỹ chi tiêu 3 cấp, sao kê minh bạch.</td>
        </tr>
        <tr>
          <td style="text-align:center;">5</td>
          <td><strong>Ban Truyền Thông (BTT)</strong></td>
          <td><code>ceo.truyenthong@ceo1983.com</code></td>
          <td>Quản trị bảng tin, soát vé an ninh QR Gate (&lt; 0.2s) và Vòng quay Lucky Draw.</td>
        </tr>
        <tr>
          <td style="text-align:center;">6</td>
          <td><strong>Ban Xúc Tiến (BXT)</strong></td>
          <td><code>ceo.xuctien@ceo1983.com</code></td>
          <td>Kiểm duyệt Sàn B2B có trợ giá nội bộ và điều phối cơ hội Cung - Cầu 1-on-1.</td>
        </tr>
      </tbody>
    </table>

    <div class="callout danger">
      <div class="callout-title">🚫 LƯU Ý PHÂN QUYỀN ĐẶC BIỆT:</div>
      Ban Thư Ký TUYỆT ĐỐI KHÔNG CÓ THẨM QUYỀN PHÊ DUYỆT HỘI VIÊN MỚI. Thẩm quyền này thuộc về ĐỘC QUYỀN Ban Thành Viên (BTV) hoặc Ban Quản Trị tối cao. Mọi can thiệp sẽ bị hệ thống API chặn đứng bằng mã lỗi HTTP 403 Forbidden.
    </div>

    <!-- CHƯƠNG 2 -->
    <h1 class="chapter-title">CHƯƠNG 2: HƯỚNG DẪN QUẢN TRỊ TRÊN CỔNG WEB CRM</h1>
    <h2 class="section-title">2.1. Đăng Nhập Cổng Quản Trị Trung Tâm</h2>
    <p><strong>Bước 1:</strong> Mở trình duyệt máy tính, truy cập Cổng Quản trị CRM tại địa chỉ: <code>https://14.225.217.232:5443</code>.</p>
    <p><strong>Bước 2:</strong> Nhập thông tin tài khoản chuyên ban (Ví dụ: <code>ceo.thanhvien@ceo1983.com</code>) và Mật khẩu.</p>
    <p><strong>Bước 3:</strong> Nhấn nút "Đăng Nhập". Hệ thống chuyển hướng vào Bàn làm việc Dashboard trung tâm.</p>

    <div class="desktop-screenshot-container">
      <img class="desktop-screenshot" src="images/03_crm_login_page.png" alt="Màn hình Đăng nhập Cổng Quản Trị Web CRM" />
      <div class="image-caption">Hình 2.1: Màn hình Đăng nhập Cổng Quản Trị Web CRM CLB CEO 1983</div>
    </div>

    <h2 class="section-title">2.2. Thẩm Định & Phê Duyệt Hội Viên Mới (Độc Quyền Ban Thành Viên)</h2>
    <p><strong>Bước 1:</strong> Cán bộ BTV mở màn hình "Quản Lý Hội Viên" (<code>/members</code>) và chọn tab "Chờ Thẩm Định".</p>
    <p><strong>Bước 2:</strong> Bấm vào hồ sơ ứng viên để mở Ngăn kéo chi tiết (Drawer). Kiểm tra năm sinh (bắt buộc 1983), MST và uy tín doanh nghiệp.</p>
    <p><strong>Bước 3:</strong> Nhấn nút "Phê Duyệt Kết Nạp". Hệ thống tự động cấp mã định danh <code>CEO-83xxx</code> và gửi email mật khẩu đến hội viên.</p>

    <div class="desktop-screenshot-container">
      <img class="desktop-screenshot" src="images/04_crm_members_management.png" alt="Quản lý hồ sơ hội viên và phê duyệt kết nạp trên CRM" />
      <div class="image-caption">Hình 2.2: Bảng Quản trị Danh bạ Hội viên 360 độ và Ngăn kéo Thẩm định của Ban Thành Viên</div>
    </div>

    <h2 class="section-title">2.3. Vận Hành Cổng An Ninh Soát Vé Gate Check-in QR (&lt; 0.2s)</h2>
    <p><strong>Bước 1:</strong> Ban Truyền Thông mở màn hình Soát vé an ninh (<code>/checkin</code>) tại sảnh sự kiện Gala.</p>
    <p><strong>Bước 2:</strong> Hướng camera về phía mã QR trên điện thoại của đại biểu.</p>
    <p><strong>Bước 3:</strong> Màn hình xanh lục hợp lệ trong 0.2s kèm số bàn VIP; nếu quét lại lần 2 màn hình báo đỏ rực cảnh báo gian lận trùng vé.</p>

    <div class="desktop-screenshot-container">
      <img class="desktop-screenshot" src="images/12_crm_events_list.png" alt="Quản trị sự kiện Gala và Cổng Soát Vé QR Gate" />
      <div class="image-caption">Hình 2.3: Giao diện Quản lý Sự kiện Gala và Soát vé an ninh thời gian thực</div>
    </div>

    <!-- CHƯƠNG 3 -->
    <h1 class="chapter-title">CHƯƠNG 3: HƯỚNG DẪN HỘI VIÊN SỬ DỤNG MOBILE APP</h1>
    <h2 class="section-title">3.1. Đăng Nhập & Bắt Buộc Đổi Mật Khẩu Lần Đầu</h2>
    <p>Hội viên mở ứng dụng trên điện thoại, đăng nhập bằng Email/SĐT và mật khẩu khởi tạo. Hệ thống bắt buộc đổi mật khẩu cá nhân mới trước khi vào màn hình chính.</p>

    <div class="mobile-mockup-wrapper">
      <div class="phone-mockup">
        <img src="images/06_app_login_screen.png" alt="Màn hình Đăng nhập Mobile App CEO 1983" />
        <div class="image-caption">Hình 3.1: Màn hình Đăng nhập Mobile App Hội viên</div>
      </div>
    </div>

    <h2 class="section-title">3.2. Sử Dụng Thẻ VIP 3D Titanium & Chạm NFC</h2>
    <p>Hội viên mở mục "Thẻ VIP", chạm để lật 180 độ 3D. Khi gặp đối tác, chạm mặt sau thẻ vào điện thoại đối tác để mở trang công khai <code>/card/:slug</code> và bấm "Lưu Danh Bạ" xuất file vCard (.vcf) đồng bộ trong 1 giây.</p>

    <div class="mobile-mockup-wrapper">
      <div class="phone-mockup">
        <img src="images/09_app_vip_card.png" alt="Thẻ Hội Viên VIP 3D Titanium" />
        <div class="image-caption">Hình 3.2: Thẻ Hội Viên VIP 3D Titanium hiệu ứng lật 180 độ</div>
      </div>
    </div>

    <h2 class="section-title">3.3. Thanh Toán Hội Phí Thường Niên Qua VietQR Napas 24/7</h2>
    <p>Hội viên mở mục "Hội Phí", nhấn "Thanh Toán VietQR". Mở app ngân hàng quét mã chuyển tiền nhanh 5.000.000 VNĐ. Kế toán đối soát sao kê và duyệt gạch nợ trên CRM gia hạn thẻ +365 ngày.</p>

    <div class="mobile-mockup-wrapper">
      <div class="phone-mockup">
        <img src="images/08_app_vietqr_payment_modal.png" alt="Mã VietQR động Napas 24/7" />
        <div class="image-caption">Hình 3.3: Mã VietQR động nộp hội phí thường niên Napas 24/7</div>
      </div>
    </div>

    <h2 class="section-title">3.4. Vé Sự Kiện Điện Tử E-Ticket QR Check-in</h2>
    <p>Hội viên mở mục "Vé Của Tôi" để xuất trình mã QR khổ lớn tại Cổng an ninh đón tiếp. Mã vé được lưu trữ offline, kèm số bốc thăm may mắn (#LUCKY-xxxx).</p>

    <div class="mobile-mockup-wrapper">
      <div class="phone-mockup">
        <img src="images/14_app_event_checkin_pass.png" alt="Vé điện tử E-Ticket QR" />
        <div class="image-caption">Hình 3.4: Vé Sự kiện điện tử E-Ticket QR độc bản</div>
      </div>
    </div>

    <h2 class="section-title">3.5. Biểu Quyết Đại Hội Trực Tuyến 1 Người 1 Phiếu</h2>
    <p>Khi phiên biểu quyết mở, hội viên vào mục "Biểu Quyết" (<code>/association/voting</code>), chọn phương án và bấm "Xác Nhận". Kết quả cập nhật trực tiếp lên màn hình lớn đại hội trong 1 giây.</p>

    <div class="mobile-mockup-wrapper">
      <div class="phone-mockup">
        <img src="images/15_app_live_voting.png" alt="Biểu quyết đại hội trực tuyến" />
        <div class="image-caption">Hình 3.5: Giao diện Biểu quyết Đại hội điện tử trực tuyến</div>
      </div>
    </div>

    <h2 class="section-title">3.6. Giao Thương Sàn B2B & Bảng Tin Cơ Hội Cung - Cầu</h2>
    <p>Hội viên đăng bán sản phẩm trợ giá nội bộ (chiết khấu &gt;= 5%) và đăng tin tìm đối tác Cung - Cầu 1-on-1 có bảo chứng của câu lạc bộ.</p>

    <div class="mobile-mockup-wrapper">
      <div class="phone-mockup">
        <img src="images/16_app_products_ecommerce_grid.png" alt="Sàn Thương Mại Doanh Nhân B2B" />
        <div class="image-caption">Hình 3.6: Sàn Thương Mại Doanh Nhân B2B CEO 1983</div>
      </div>
    </div>

  </div>
</body>
</html>`;

  // Lưu file HTML HDSD
  fs.writeFileSync(path.join(__dirname, '../docs/HDSD_CEO1983_TOAN_DIEN_PRO.html'), htmlContent, 'utf-8');
  fs.writeFileSync(
    path.join(__dirname, '../apps/ceo1983_app_fe/public/docs/HDSD_CEO1983_TOAN_DIEN_PRO.html'),
    htmlContent,
    'utf-8'
  );

  // Sinh bản Markdown của HDSD
  let hdsdMd = '# TÀI LIỆU HƯỚNG DẪN SỬ DỤNG & ĐÀO TẠO CHUYỂN GIAO VẬN HÀNH\n';
  hdsdMd += '## HỆ SINH THÁI SỐ HÓA & QUẢN TRỊ HIỆP HỘI DOANH NHÂN CEO 1983 (HANOIBA)\n';
  hdsdMd += '*Phiên bản: Version 5.0 (Master Release) | Ngày ban hành: 04/10/2026*\n\n';
  hdsdMd += '### QUY CHUẨN TRÌNH BÀY HÌNH ẢNH PLAYBOOK 18:\n';
  hdsdMd += '- **Màn hình Web CRM Desktop:** Hiển thị toàn cảnh chiều ngang, góc bo 8px, viền xám mềm mại.\n';
  hdsdMd += '- **Màn hình Mobile App Hội Viên:** BẮT BUỘC đặt trong khung điện thoại `.phone-mockup` chiều rộng 275px-320px, bo góc cong 28px-36px, viền kim loại sang trọng, không kéo giãn ảnh dọc thành hình chữ nhật ngang!\n\n';
  hdsdMd += '*(Xem chi tiết tài liệu in ấn PDF tại tệp HTML: [HDSD_CEO1983_TOAN_DIEN_PRO.html](HDSD_CEO1983_TOAN_DIEN_PRO.html))*\n';

  fs.writeFileSync(path.join(__dirname, '../docs/tai-lieu-huong-dan-su-dung.md'), hdsdMd, 'utf-8');

  console.log('✅ Đã xuất bản thành công HDSD Playbook 18 + UNICOM (HTML + MD)!');
}

// =============================================================
// MAIN EXECUTION FUNCTION
// =============================================================
async function main() {
  console.log('================================================================');
  console.log('BẮT ĐẦU XUẤT BẢN TOÀN BỘ BỘ TÀI LIỆU MASTER CLB DOANH NHÂN CEO 1983');
  console.log('TIÊU CHUẨN: CHUYÊN GIA SENIOR BA & ARCHITECT 15 NĂM KINH NGHIỆM');
  console.log('LOẠI BỎ TOÀN BỘ VIONE — TẬP TRUNG 100% VÀO DỰ ÁN CEO 1983');
  console.log('================================================================');

  await buildBRD();
  await buildSRS();
  await buildHDSD();

  console.log('================================================================');
  console.log('🎉 TẤT CẢ CÁC TÀI LIỆU ĐÃ ĐƯỢC XUẤT BẢN THÀNH CÔNG VỚI ĐỘ SÂU CHI TIẾT CAO NHẤT!');
  console.log('================================================================');
}

main().catch((err) => {
  console.error('❌ Lỗi khi xuất bản tài liệu:', err);
  process.exit(1);
});
