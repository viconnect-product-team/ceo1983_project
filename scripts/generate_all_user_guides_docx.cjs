const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle
} = require('docx');

const DOC_DIR = path.resolve(__dirname, '../document');
const PUBLIC_DOCS_DIR = path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs');
if (!fs.existsSync(PUBLIC_DOCS_DIR)) fs.mkdirSync(PUBLIC_DOCS_DIR, { recursive: true });

function parseInlineRuns(text) {
  if (!text) return [new TextRun('')];
  const runs = [];
  // Regex to match bold **text**, code `code`, italic *text*
  const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
  const parts = text.split(regex);

  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true, font: 'Segoe UI' }));
    } else if (part.startsWith('`') && part.endsWith('`')) {
      runs.push(new TextRun({ text: part.slice(1, -1), font: 'Consolas', color: 'B91C1C' }));
    } else if (part.startsWith('*') && part.endsWith('*')) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true, font: 'Segoe UI' }));
    } else {
      runs.push(new TextRun({ text: part, font: 'Segoe UI' }));
    }
  }
  return runs.length > 0 ? runs : [new TextRun({ text, font: 'Segoe UI' })];
}

async function convertMarkdownToDocx(mdFilePath, outDocxPath, title, subtitle, docType) {
  console.log(`\n>>> ĐANG KẾT XUẤT DOCX: ${path.basename(outDocxPath)}...`);
  const mdContent = fs.readFileSync(mdFilePath, 'utf8');
  const lines = mdContent.split('\n');

  const docChildren = [];

  // 1. Cover Header Block
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: 'HIỆP HỘI DOANH NHÂN TRẺ HÀ NỘI (HANOIBA)',
          bold: true,
          size: 22, // 11pt
          color: '003B95',
          font: 'Segoe UI'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: 'CÂU LẠC BỘ DOANH NHÂN CEO 1983',
          bold: true,
          size: 24, // 12pt
          color: 'B91C1C',
          font: 'Segoe UI'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 150 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 36, // 18pt
          color: '001A4D',
          font: 'Segoe UI'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: subtitle,
          italics: true,
          size: 22,
          color: '475569',
          font: 'Segoe UI'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 500 },
      children: [
        new TextRun({
          text: '────────────────────────────────────────────────────',
          color: 'CBD5E1'
        })
      ]
    })
  );

  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Skip Markdown title if already rendered in header
    if (i < 5 && (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('*Địa chỉ'))) {
      continue;
    }

    if (!line) {
      continue;
    }

    if (line === '---') {
      docChildren.push(
        new Paragraph({
          spacing: { before: 150, after: 150 },
          children: [
            new TextRun({
              text: '────────────────────────────────────────────────────',
              color: 'E2E8F0'
            })
          ]
        })
      );
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 350, after: 150 },
          children: [
            new TextRun({
              text: line.slice(2),
              bold: true,
              size: 28, // 14pt
              color: '003B95',
              font: 'Segoe UI'
            })
          ]
        })
      );
      continue;
    }

    if (line.startsWith('## ')) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 120 },
          children: [
            new TextRun({
              text: line.slice(3),
              bold: true,
              size: 24, // 12pt
              color: 'B91C1C',
              font: 'Segoe UI'
            })
          ]
        })
      );
      continue;
    }

    if (line.startsWith('### ')) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: line.slice(4),
              bold: true,
              size: 22, // 11pt
              color: '0F172A',
              font: 'Segoe UI'
            })
          ]
        })
      );
      continue;
    }

    if (line.startsWith('#### ')) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 150, after: 80 },
          children: [
            new TextRun({
              text: line.slice(5),
              bold: true,
              size: 20, // 10pt
              color: '2563EB',
              font: 'Segoe UI'
            })
          ]
        })
      );
      continue;
    }

    // Image: ![caption](path)
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      const caption = imgMatch[1];
      let imgPath = imgMatch[2].trim();
      if (imgPath.startsWith('./') || imgPath.startsWith('../')) {
        imgPath = path.resolve(DOC_DIR, imgPath);
      }
      if (fs.existsSync(imgPath)) {
        try {
          const imgBuffer = fs.readFileSync(imgPath);
          const isMobile = docType === 'mobile' || imgPath.includes('guide_app');
          const width = isMobile ? 240 : 540;
          const height = isMobile ? 480 : 310;

          docChildren.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 180, after: 80 },
              children: [
                new ImageRun({
                  data: imgBuffer,
                  transformation: {
                    width: width,
                    height: height
                  }
                })
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 180 },
              children: [
                new TextRun({
                  text: `📌 ${caption}`,
                  italics: true,
                  size: 18, // 9pt
                  color: '64748B',
                  font: 'Segoe UI'
                })
              ]
            })
          );
        } catch (err) {
          console.error(`Lỗi chèn ảnh ${imgPath}:`, err.message);
        }
      }
      continue;
    }

    // Unordered List item
    const ulMatch = line.match(/^([*-])\s+(.+)$/);
    if (ulMatch) {
      docChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 40, after: 40 },
          children: parseInlineRuns(ulMatch[2])
        })
      );
      continue;
    }

    // Numbered List item
    const olMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (olMatch) {
      docChildren.push(
        new Paragraph({
          bullet: { level: 0 }, // Using bullet for clean display
          spacing: { before: 50, after: 50 },
          children: [
            new TextRun({ text: `${olMatch[1]}. `, bold: true, font: 'Segoe UI' }),
            ...parseInlineRuns(olMatch[2])
          ]
        })
      );
      continue;
    }

    // Regular Paragraph
    docChildren.push(
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: parseInlineRuns(line)
      })
    );
  }

  const doc = new Document({
    creator: 'ViOne / ViConnect Solutions',
    title: title,
    description: subtitle,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134, // 20mm
              right: 1134,
              bottom: 1134,
              left: 1134
            }
          }
        },
        children: docChildren
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outDocxPath, buffer);
  console.log(`✔ KẾT XUẤT THÀNH CÔNG: ${outDocxPath} (${(fs.statSync(outDocxPath).size / 1024 / 1024).toFixed(2)} MB)`);
}

async function main() {
  console.log('=== BẮT ĐẦU KẾT XUẤT TRỌN BỘ FILE WORD (.DOCX) HDSD CEO 1983 ===');

  // 1. Docx Web CRM
  const crmDocx = path.join(DOC_DIR, 'HUONG_DAN_SU_DUNG_WEB_CRM_CEO1983.docx');
  await convertMarkdownToDocx(
    path.join(DOC_DIR, 'HUONG_DAN_SU_DUNG_WEB_CRM_CHI_TIET.md'),
    crmDocx,
    'HƯỚNG DẪN SỬ DỤNG CỔNG QUẢN TRỊ WEB CRM',
    'Hệ Thống Điều Hành & Phân Quyền Doanh Nhân CLB CEO 1983 (23 Functional Nodes)',
    'crm'
  );

  // 2. Docx Mobile App
  const appDocx = path.join(DOC_DIR, 'HUONG_DAN_SU_DUNG_APP_MOBILE_CEO1983.docx');
  await convertMarkdownToDocx(
    path.join(DOC_DIR, 'HUONG_DAN_SU_DUNG_APP_MOBILE_CHI_TIET.md'),
    appDocx,
    'HƯỚNG DẪN SỬ DỤNG ỨNG DỤNG DI ĐỘNG HỘI VIÊN',
    'Hệ Thống Giao Thương B2B & Sinh Hoạt Hiệp Hội CLB CEO 1983 (17 Functional Nodes)',
    'mobile'
  );

  // 3. Đồng bộ vào public/docs/ để có thể tải trực tiếp
  const crmPublic = path.join(PUBLIC_DOCS_DIR, 'HUONG_DAN_SU_DUNG_WEB_CRM_CEO1983.docx');
  const appPublic = path.join(PUBLIC_DOCS_DIR, 'HUONG_DAN_SU_DUNG_APP_MOBILE_CEO1983.docx');
  fs.copyFileSync(crmDocx, crmPublic);
  fs.copyFileSync(appDocx, appPublic);
  console.log(`✔ Đồng bộ: ${crmPublic}`);
  console.log(`✔ Đồng bộ: ${appPublic}`);

  console.log('\n=== HOÀN TẤT KẾT XUẤT TOÀN BỘ FILE WORD (.DOCX) CHUẨN MICROSOFT WORD ===');
}

main().catch(console.error);

