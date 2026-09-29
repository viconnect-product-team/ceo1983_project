const { parseMembers } = require('./parse_members');
const fs = require('fs');
const path = require('path');

async function generateMembersData() {
  const list = await parseMembers();
  const membersCode = list.map(m => {
    return `  {
    id: "${m.code}",
    code: "${m.code}",
    name: "${m.name.replace(/"/g, '\\"')}",
    contact: "${m.name.replace(/"/g, '\\"')}",
    email: "${m.email}",
    phone: "${m.phone}",
    type: "company",
    level: "vip",
    industry: "${m.industry.replace(/"/g, '\\"')}",
    region: "region.north",
    status: "active",
    joinedAt: "${m.joinedAt || '2024-01-01'}T00:00:00Z",
    feeYear: 2026,
    feePaid: true,
    address: "${m.address.replace(/"/g, '\\"')}",
    website: "https://ceo1983.vn",
    about: "${m.company.replace(/"/g, '\\"')} · ${m.title.replace(/"/g, '\\"')} · ${m.industry.replace(/"/g, '\\"')}",
    department: "${m.department}",
    executiveRole: "${m.executiveRole}",
  }`;
  }).join(',\n');

  console.log(`Generated ${list.length} items`);
  fs.writeFileSync(path.join(__dirname, 'generated_members.ts'), membersCode, 'utf8');
}

generateMembersData().catch(console.error);
