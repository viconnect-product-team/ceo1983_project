const { PrismaClient } = require('./node_modules/.prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.vione_users.findMany({
    take: 15,
    select: { id: true, email: true, full_name: true, phone: true, role: true }
  });
  console.log('USERS IN DB:');
  console.log(JSON.stringify(users, null, 2));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
