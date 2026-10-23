const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function generateCamDoan() {
  const srcPath = 'C:\\Users\\vumik\\Downloads\\[UFP] 02. Cam đoan.docx';
  const outPathDownloads = 'C:\\Users\\vumik\\Downloads\\[CEO1983] 02. Cam đoan.docx';
  const outPathDoc = path.join(__dirname, '..', 'document', '[CEO1983] 02. Cam đoan.docx');

  console.log('Reading template:', srcPath);
  const data = fs.readFileSync(srcPath);
  const zip = await JSZip.loadAsync(data);

  let xml = await zip.file('word/document.xml').async('text');

  // Replace Software Name
  xml = xml.replace(
    /PHẦN MỀM ĐIỀU HÀNH CÔNG VIỆC VÀ QUẢN LÝ CUỘC SỐNG CÁ NHÂN \(UNIWORK FOR PERSONAL\)/g,
    'HỆ THỐNG PHẦN MỀM QUẢN TRỊ KẾT NỐI DOANH NGHIỆP VÀ ỨNG DỤNG DI ĐỘNG CEO 1983 (CEO 1983 PLATFORM &amp; MOBILE APP)'
  );
  xml = xml.replace(
    /PHẦN MỀM <\/w:t><\/w:r><w:r><w:rPr><w:b\/><w:bCs\/><w:noProof\/><w:sz w:val="28"\/><w:szCs w:val="28"\/><w:lang w:val="vi-VN"\/><\/w:rPr><w:t xml:space="preserve">ĐIỀU HÀNH CÔNG VIỆC VÀ QUẢN LÝ CUỘC SỐNG CÁ NHÂN \(UNIWORK FOR PERSONAL\) /g,
    'HỆ THỐNG PHẦN MỀM QUẢN TRỊ KẾT NỐI DOANH NGHIỆP VÀ ỨNG DỤNG DI ĐỘNG CEO 1983 (CEO 1983 PLATFORM &amp; MOBILE APP) '
  );

  // Replace Decision details
  xml = xml.replace(
    /Quyết định giao việc số: 1109\/2026\/QĐ-<\/w:t><\/w:r><w:r><w:rPr><w:bCs\/><w:noProof\/><w:sz w:val="28"\/><w:szCs w:val="28"\/><w:lang w:val="vi-VN"\/><\/w:rPr><w:t>UNICOM<\/w:t><\/w:r><w:r w:rsidRPr="00C13577"><w:rPr><w:bCs\/><w:noProof\/><w:sz w:val="28"\/><w:szCs w:val="28"\/><w:lang w:val="vi-VN"\/><\/w:rPr><w:t xml:space="preserve"> ngày 11\/09\/2026 <\/w:t><\/w:r><w:r><w:rPr><w:bCs\/><w:noProof\/><w:sz w:val="28"\/><w:szCs w:val="28"\/><w:lang w:val="vi-VN"\/><\/w:rPr><w:t>của Công ty TNHH Giải pháp Công nghệ Unicom\./g,
    'Quyết định giao việc số: ....../2026/QĐ-...... ngày ....../....../2026 của [TÊN DOANH NGHIỆP / TỔ CHỨC CHỦ SỞ HỮU].'
  );

  // Replace Company Owner Name
  xml = xml.replace(
    /CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ UNICOM/g,
    '[TÊN DOANH NGHIỆP / TỔ CHỨC CHỦ SỞ HỮU]'
  );

  // Replace Company details (Mã số DN, địa chỉ)
  xml = xml.replace(
    /Mã số đăng ký doanh <\/w:t><\/w:r><w:r w:rsidRPr="00C13577"><w:rPr><w:i\/><w:iCs\/><w:noProof\/><w:sz w:val="28"\/><w:szCs w:val="28"\/><w:lang w:val="vi-VN"\/><\/w:rPr><w:lastRenderedPageBreak\/><w:t>nghiệp: 0110397654, địa chỉ là: Tầng 4, Số 39 HDI Homes ngõ 29 Mạc Thái Tông, Phường Yên Hòa, Thành phố Hà Nội\)/g,
    'Mã số đăng ký doanh nghiệp: ...................., địa chỉ là: ....................................................................................)'
  );

  // Replace Author name runs
  xml = xml.replace(
    /<w:t>N<\/w:t><\/w:r><w:r w:rsidRPr="000D568E"><w:rPr><w:b\/><w:noProof\/><w:sz w:val="28"\/><w:szCs w:val="28"\/><\/w:rPr><w:t>GUYỄN TUẤN TRƯỜNG<\/w:t>/g,
    '<w:t>............................................................</w:t>'
  );

  // Replace Address runs
  xml = xml.replace(
    /<w:t>Tổ 25<\/w:t>[\s\S]*?<w:t>Hà Nội<\/w:t>/g,
    '<w:t>............................................................</w:t>'
  );

  // Replace Phone runs
  xml = xml.replace(
    /<w:t>Điện thoại: 0966<\/w:t>[\s\S]*?<w:t>600<\/w:t>/g,
    '<w:t>Điện thoại: ........................................</w:t>'
  );
  // Replace DOB, CCCD, Issue date, Issuer
  xml = xml.replace(/27\/11\/1983/g, '....../....../..........');
  xml = xml.replace(/031083015033/g, '............................................................');
  xml = xml.replace(/26\/06\/2025/g, '....../....../..........');
  xml = xml.replace(/Bộ Công An/g, '............................................................');
  xml = xml.replace(/nguyentuantruong@gmail\.com/g, '............................................................');
  xml = xml.replace(/Ngày hoàn thành tác phẩm: 12\/10\/2026\./g, 'Ngày hoàn thành tác phẩm: ....../....../2026.');
  xml = xml.replace(/NGUYỄN TUẤN TRƯỜNG/g, '[Họ và tên tác giả - Tự ký và ghi rõ]');

  zip.file('word/document.xml', xml);
  const outBuf = await zip.generateAsync({ type: 'nodebuffer' });

  fs.writeFileSync(outPathDownloads, outBuf);
  fs.writeFileSync(outPathDoc, outBuf);
  console.log('Generated Cam đoan successfully:');
  console.log('  ->', outPathDownloads);
  console.log('  ->', outPathDoc);
}

generateCamDoan().catch(console.error);
