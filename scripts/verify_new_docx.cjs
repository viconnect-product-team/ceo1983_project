const fs = require('fs');
const JSZip = require('jszip');

async function verify() {
  const filePath = 'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/document/[CEO 1983] BÁO CÁO TỔNG HỢP Ý KIẾN VÀ PHƯƠNG ÁN XỬ LÝ - VICONNECT (BẢN CHUẨN ĐẦY ĐỦ).docx';
  const content = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(content);
  const docXml = await zip.file('word/document.xml').async('text');

  console.log('--- VERIFICATION REPORT ---');
  console.log('File size:', content.length);
  console.log('XML length:', docXml.length);

  // Check Sub-title date 21/10/2026
  console.log('Date 21/10/2026 exists:', docXml.includes('Căn cứ buổi họp ngày 21/10/2026'));

  // Check Section I title
  console.log('Section I exists:', docXml.includes('I. TỔNG QUAN ĐỐI SOÁT &amp; CAM KẾT TIẾN ĐỘ TỪ VICONNECT (ĐỢT 1)'));

  // Check deadline 10/11/2026
  console.log('Deadline 10/11/2026 exists:', docXml.includes('10/11/2026'));

  // Check Section II
  console.log('Section II exists:', docXml.includes('II. BẢNG CHI TIẾT Ý TƯỞNG &amp; GIẢI PHÁP CÔNG NGHỆ VIONE / VICONNECT CHO 15 Ý KIẾN HỌP'));

  // Check Table
  const trCount = (docXml.match(/<w:tr[\s>]/g) || []).length;
  console.log('Table Row count in Section II:', trCount);

  // Check Group headers
  const groups = [
    'A. GIAO DIỆN &amp; THẺ HỘI VIÊN',
    'B. XÚC TIẾN THƯƠNG MẠI',
    'C. SỰ KIỆN &amp; SINH HOẠT',
    'D. QUẢN TRỊ HỘI VIÊN &amp; BÁO CÁO (CỔNG QUẢN TRỊ CRM)',
    'E. TRANG CÁ NHÂN'
  ];
  groups.forEach(g => {
    console.log(`Group [${g}] exists:`, docXml.includes(g));
  });

  // Check all 15 items STT
  for (let i = 1; i <= 15; i++) {
    const hasStt = docXml.includes(`<w:t xml:space="preserve">${i}</w:t>`);
    console.log(`STT ${i} exists:`, hasStt);
  }

  // Check 3 Statuses
  console.log('Status [ĐÃ SẴN SÀNG] exists:', docXml.includes('ĐÃ SẴN SÀNG'));
  console.log('Status [ĐANG TRIỂN KHAI] exists:', docXml.includes('ĐANG TRIỂN KHAI'));
  console.log('Status [KẾ HOẠCH TIẾP THEO] exists:', docXml.includes('KẾ HOẠCH TIẾP THEO'));

  // Verify NO 100% in table
  const has100Percent = docXml.includes('100%');
  console.log('Contains 100% anywhere in doc:', has100Percent);

  // Check Section III
  console.log('Section III exists:', docXml.includes('III. MẪU TIN NHẮN PHẢN HỒI LẠI BAN ĐIỀU HÀNH &amp; CHỊ THÙY DUNG'));
  console.log('Message text snippet exists:', docXml.includes('Kính gửi Chị Thùy Dung, Anh Tuấn, Anh Thành, Chị Phương'));

  // Check gridCol count and widths
  const gridCols = docXml.match(/<w:gridCol w:w="(\d+)"\/>/g);
  console.log('Grid cols count:', gridCols ? gridCols.length : 0);
  console.log('Grid cols:', gridCols ? gridCols.join(', ') : 'NONE');
}

verify().catch(console.error);
