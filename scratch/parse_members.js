const ExcelJS = require('exceljs');
const path = require('path');

const COMMITTEES = [
  "Ban Thư Ký & Điều Phối",
  "Ban Xúc Tiến Thương Mại & Đầu Tư B2B",
  "Ban Phát Triển Hội Viên & Thẩm Định",
  "Ban Truyền Thông & Sự Kiện",
  "Ban Tài Chính & Pháp Chế",
  "Ban Đào Tạo & Chuyển Đổi Số"
];

async function parseMembers() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path.join(__dirname, '../document/CEO1983_Thành viên_Ban dieu hanh.xlsx'));
  const ws = workbook.worksheets[0];

  const members = [];
  let otherIdx = 0;

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header
    const vals = row.values;
    // Row 2: [null, 1, "Lê Thị Dung", null, "2022-08-18...", "Chủ tịch", "0988870888", "Ledung22183@gmail.com", ...]
    const stt = vals[1];
    const name = String(vals[2] || '').trim();
    if (!name) return;

    // Col 3 is Người giới thiệu - SKIP / OMIT per user requirement
    const joinedAt = vals[4] instanceof Date ? vals[4].toISOString().slice(0, 10) : String(vals[4] || '').slice(0, 10);
    const rawRole = String(vals[5] || '').trim();
    const phone = String(vals[6] || '').trim().replace(/\s+/g, '');
    const email = String(vals[7] || '').trim().toLowerCase();
    const birthday = vals[8] instanceof Date ? vals[8].toISOString().slice(0, 10) : String(vals[8] || '').slice(0, 10);
    const company = String(vals[9] || '').trim();
    const title = String(vals[10] || '').trim() || 'CEO';
    const industry = String(vals[11] || '').trim();
    const address = String(vals[12] || '').trim();

    let department = "Ban Quản Trị";
    let executiveRole = rawRole;
    let isBQT = false;

    if (rawRole.toLowerCase().includes('chủ tịch') || rawRole.toLowerCase().includes('phó chủ tịch')) {
      department = "Ban Quản Trị";
      executiveRole = rawRole.toLowerCase().includes('chủ tịch') && !rawRole.toLowerCase().includes('phó') ? "Chủ tịch CLB" : "Phó Chủ tịch CLB";
      isBQT = true;
    } else {
      // Randomly/evenly assign to remaining committees
      department = COMMITTEES[otherIdx % COMMITTEES.length];
      const subRoles = ["Trưởng Ban", "Phó Ban", "Ủy Viên BCH", "Thành Viên"];
      executiveRole = subRoles[otherIdx % subRoles.length];
      otherIdx++;
    }

    const code = `M1983-${String(stt).padStart(3, '0')}`;

    members.push({
      stt,
      code,
      name,
      phone,
      email,
      joinedAt,
      birthday,
      company,
      title,
      industry,
      address,
      department,
      executiveRole,
      isBQT
    });
  });

  return members;
}

if (require.main === module) {
  parseMembers().then(list => {
    console.log(`Parsed ${list.length} members:`);
    list.forEach(m => {
      console.log(`[${m.code}] ${m.name} (${m.isBQT ? '★ BQT' : m.department}) - ${m.company} - ${m.phone} - ${m.email}`);
    });
  });
}

module.exports = { parseMembers, COMMITTEES };
