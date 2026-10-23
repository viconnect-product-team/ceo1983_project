const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function generateQuyetDinh() {
  const srcPath = 'C:\\Users\\vumik\\Downloads\\[UFP] 03. Quyết định.docx';
  const outPathDownloads = 'C:\\Users\\vumik\\Downloads\\[CEO1983] 03. Quyết định.docx';
  const outPathDoc = path.join(__dirname, '..', 'document', '[CEO1983] 03. Quyết định.docx');

  console.log('Reading template:', srcPath);
  const data = fs.readFileSync(srcPath);
  const zip = await JSZip.loadAsync(data);

  let xml = await zip.file('word/document.xml').async('text');

  // Replace Header Company Name
  xml = xml.replace(/CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ UNICOM/g, '[TÊN DOANH NGHIỆP / TỔ CHỨC CHỦ SỞ HỮU]');
  xml = xml.replace(/Công ty TNHH Giải pháp Công nghệ Unicom/g, '[Tên Doanh nghiệp / Tổ chức]');

  // Replace P 3: Decision Number
  xml = xml.replace(
    /<w:t>Số:<\/w:t>[\s\S]*?<w:t>\/2026\/QĐ - UNICOM<\/w:t>/g,
    '<w:t>Số: ....../2026/QĐ-......</w:t>'
  );

  // Replace P 7: Date
  xml = xml.replace(
    /<w:t xml:space="preserve">Hà Nội, ngày <\/w:t>[\s\S]*?<w:t>năm 2026<\/w:t>/g,
    '<w:t>Hà Nội, ngày ...... tháng ...... năm 2026</w:t>'
  );

  // Replace P 10: Subject title
  xml = xml.replace(
    /<w:t>Phần mềm điều hành công việc và quản lý cuộc sống cá nhân \(Uniwork for personal\)<\/w:t>/g,
    '<w:t>Hệ thống phần mềm quản trị kết nối doanh nghiệp và Ứng dụng di động CEO 1983 (CEO 1983 Platform &amp; Mobile App))</w:t>'
  );

  // Replace P 19: Điều 1 assignment
  xml = xml.replace(
    /<w:t>Giao ông<\/w:t>[\s\S]*?<w:t>“Phần mềm Hệ thống điều hành công việc và quản lý cuộc sống cá nhân \(Uniwork for personal\)”<\/w:t>/g,
    '<w:t>Giao ông/bà ............................................................ – Chức danh: ............................................................ thuộc [Tên Doanh nghiệp / Tổ chức] chịu trách nhiệm sáng tạo tác phẩm chương trình máy tính: “Hệ thống phần mềm quản trị kết nối doanh nghiệp và Ứng dụng di động CEO 1983 (CEO 1983 Platform &amp; Mobile App)”</w:t>'
  );

  // Replace P 20: intro to author info
  xml = xml.replace(/Thông tin về ông Nguyễn Tuấn Trường như sau:/g, 'Thông tin về người được giao nhiệm vụ như sau:');

  // Replace P 21: Author name
  xml = xml.replace(
    /<w:t xml:space="preserve">Họ và tên: <\/w:t>[\s\S]*?<w:t>Nguyễn Tuấn Trường<\/w:t>/g,
    '<w:t>Họ và tên: ............................................................</w:t>'
  );

  // Replace personal fields: DOB, CCCD, Issue Date, Issue Place, Address, Phone, Email
  xml = xml.replace(/27\/11\/1983/g, '....../....../..........');
  xml = xml.replace(/031083015033/g, '............................................................');
  xml = xml.replace(/26\/06\/2025/g, '....../....../..........');
  xml = xml.replace(/Nơi cấp: Bộ Công an\./g, 'Nơi cấp: ............................................................');
  xml = xml.replace(
    /<w:t>Địa chỉ:<\/w:t>[\s\S]*?<w:t xml:space="preserve"> Tổ 25, phường Định Công, quận Hoàng Mai, Thành phố Hà Nội<\/w:t>/g,
    '<w:t>Địa chỉ: ............................................................</w:t>'
  );
  xml = xml.replace(/0966\.688\.600/g, '........................................');
  xml = xml.replace(/nguyentuantruong@gmail\.com/g, '............................................................');

  // Replace Điều 2, 3, 4 pronouns
  xml = xml.replace(/Ông Tuấn Trường/g, 'người được giao nhiệm vụ');
  xml = xml.replace(/Ông Nguyễn Tuấn Trường/g, 'Người được giao nhiệm vụ');

  // Replace Điều 3 software title
  xml = xml.replace(
    /<w:t>Phần mềm điều hành công việc và quản lý cuộc sống cá nhân \(Uniwork for personal\)<\/w:t>/g,
    '<w:t>Hệ thống phần mềm quản trị kết nối doanh nghiệp và Ứng dụng di động CEO 1983 (CEO 1983 Platform &amp; Mobile App)</w:t>'
  );

  // Replace Director Signature Name
  xml = xml.replace(/NGUYỄN THỊ HỒNG NHUNG/g, '[Ký tên, đóng dấu và ghi rõ họ tên]');

  zip.file('word/document.xml', xml);
  const outBuf = await zip.generateAsync({ type: 'nodebuffer' });

  fs.writeFileSync(outPathDownloads, outBuf);
  fs.writeFileSync(outPathDoc, outBuf);
  console.log('Generated Quyết định successfully:');
  console.log('  ->', outPathDownloads);
  console.log('  ->', outPathDoc);
}

generateQuyetDinh().catch(console.error);
