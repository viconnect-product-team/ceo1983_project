const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
  `;
  const names = tables.map(t => t.table_name);
  console.log('Ads/Marketplace tables:', names.filter(n => n.includes('ad') || n.includes('market') || n.includes('banner')));
  console.log('Permission/Role tables:', names.filter(n => n.includes('perm') || n.includes('role') || n.includes('matrix')));
  console.log('Notification/Message tables:', names.filter(n => n.includes('notif') || n.includes('mess') || n.includes('chat')));
}

main().catch(console.error).finally(() => prisma.$disconnect());
