const { PrismaClient } = require('@vibe/db');
const prisma = new PrismaClient();

async function check() {
  try {
    const cols = await prisma.$queryRawUnsafe(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('app_settings', 'user_roles')
      ORDER BY table_name, ordinal_position;
    `);
    console.log('COLUMNS:', cols);

    const appSettings = await prisma.$queryRawUnsafe(`SELECT * FROM app_settings LIMIT 5;`);
    console.log('APP SETTINGS ROWS:', appSettings);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
