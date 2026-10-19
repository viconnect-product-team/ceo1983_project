const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({
  datasources: { db: { url: 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/ceo1983_project?schema=public' } }
});

async function run() {
  try {
    const res = await p.$executeRaw`
      UPDATE public.user_profiles
      SET onboarding_status = 'completed'::public.onboarding_status, updated_at = now()
      WHERE user_id = '00000000-0000-4000-8000-000000000002'::uuid
    `;
    console.log('ExecuteRaw result with ::public.onboarding_status:', res);
  } catch (err) {
    console.error('ERROR with ::public.onboarding_status:', err.message);
  }

  await p.$disconnect();
}
run().catch(console.error);
