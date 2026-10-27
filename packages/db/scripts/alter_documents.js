const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Altering documents table to add folder_id, drive_url, is_folder...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE public.documents
      ADD COLUMN IF NOT EXISTS folder_id TEXT,
      ADD COLUMN IF NOT EXISTS drive_url TEXT,
      ADD COLUMN IF NOT EXISTS is_folder BOOLEAN DEFAULT FALSE;
    `);
    console.log('Altered documents table successfully!');
  } catch (err) {
    console.error('Error altering documents:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
