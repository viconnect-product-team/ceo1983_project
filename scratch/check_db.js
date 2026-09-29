const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const members = await prisma.members.findMany();
  console.log('Total members in DB:', members.length);
  for (const m of members) {
    console.log(`- ${m.id} | ${m.code} | ${m.name} | ${m.email} | ${m.phone} | ${m.level} | ${m.industry}`);
  }

  const users = await prisma.vione_users.findMany();
  console.log('\nTotal vione_users in DB:', users.length);
  for (const u of users) {
    console.log(`- ${u.id} | ${u.email} | ${u.username}`);
  }
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
