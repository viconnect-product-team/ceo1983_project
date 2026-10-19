const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasources: { db: { url: 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/ceo1983_project?schema=public' } } });

async function run() {
  console.log('1. Adding must_change_password column if not exists...');
  await p.$executeRawUnsafe('ALTER TABLE public.vione_users ADD COLUMN IF NOT EXISTS must_change_password boolean DEFAULT false');
  await p.$executeRawUnsafe('ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS must_change_password boolean DEFAULT false');
  console.log('Columns added successfully');

  // Let's inspect test members to delete
  const dummyEmails = [
    'ceo.member1@ceo1983.com',
    'ceo.member2@ceo1983.com',
    'ceo.member3@ceo1983.com',
    'ceo.member4@ceo1983.com',
    'ceo.member5@ceo1983.com',
    'hvu139255@gmail.com'
  ];

  console.log('2. Finding users to delete...');
  const usersToDelete = await p.$queryRaw`
    SELECT id, email, username FROM public.vione_users WHERE email IN (${dummyEmails[0]}, ${dummyEmails[1]}, ${dummyEmails[2]}, ${dummyEmails[3]}, ${dummyEmails[4]}, ${dummyEmails[5]})
  `;
  console.log('Users to delete:', usersToDelete);

  for (const u of usersToDelete) {
    console.log(`Cleaning up user ${u.email} (${u.id})...`);
    // Delete from memberships
    await p.$executeRawUnsafe('DELETE FROM public.memberships WHERE user_id = $1::uuid', u.id).catch(e => console.warn('memberships err:', e.message));
    // Delete from user_profiles
    await p.$executeRawUnsafe('DELETE FROM public.user_profiles WHERE user_id = $1::uuid', u.id).catch(e => console.warn('user_profiles err:', e.message));
    // Delete from notifications
    await p.$executeRawUnsafe('DELETE FROM public.notifications WHERE user_id = $1::uuid', u.id).catch(e => console.warn('notifications err:', e.message));
    // Delete from members
    await p.$executeRawUnsafe('DELETE FROM public.members WHERE user_id = $1::uuid OR email = $2', u.id, u.email).catch(e => console.warn('members err:', e.message));
    // Delete from auth.users
    await p.$executeRawUnsafe('DELETE FROM auth.users WHERE id = $1::uuid OR email = $2', u.id, u.email).catch(e => console.warn('auth.users err:', e.message));
    // Delete from vione_users
    await p.$executeRawUnsafe('DELETE FROM public.vione_users WHERE id = $1::uuid', u.id).catch(e => console.warn('vione_users err:', e.message));
  }

  // Also check if any member with id MBMVEMH36Z or test member exists
  await p.$executeRawUnsafe('DELETE FROM public.members WHERE id = $1 OR email = $2', 'MBMVEMH36Z', 'hvu139255@gmail.com').catch(() => {});

  // Check remaining members
  const remainingMembers = await p.$queryRaw`SELECT id, name, code, email, executive_role, department FROM public.members ORDER BY code ASC`;
  console.log('\n--- REMAINING OFFICIAL MEMBERS ---');
  console.log(remainingMembers);

  await p.$disconnect();
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
