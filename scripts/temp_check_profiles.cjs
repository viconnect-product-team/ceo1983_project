const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasources: { db: { url: 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/ceo1983_project?schema=public' } } });

async function run() {
  const profiles = await p.$queryRaw`SELECT user_id, display_name, onboarding_status, account_status FROM public.user_profiles`;
  console.log('USER PROFILES IN DB:', profiles);
  await p.$disconnect();
}
run();
