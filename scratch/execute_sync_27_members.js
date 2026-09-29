const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { parseMembers, COMMITTEES } = require('./parse_members');

const prisma = new PrismaClient();
const ASSOC_ID = 'c1983000-0000-4000-8000-000000001983';

async function syncMembers() {
  console.log('--- STARTING SYNC 27 EXCEL MEMBERS ---');

  // 1. Add description column to public.events if missing
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE public.events ADD COLUMN IF NOT EXISTS description text;
    `);
    console.log('Checked/added description column to public.events');
  } catch (err) {
    console.warn('Could not alter public.events:', err.message);
  }

  // 2. Parse Excel file
  const excelMembers = await parseMembers();
  console.log(`Parsed ${excelMembers.length} members from Excel.`);

  const validEmails = new Set(excelMembers.map(m => m.email.toLowerCase()));
  validEmails.add('admin@connect.vn');
  validEmails.add('admin1@connect.vn');

  // Default password hash for Ceo1983@2026
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('Ceo1983@2026', salt);

  // 3. Upsert each of the 27 members into vione_users, user_profiles, memberships, and members
  for (const m of excelMembers) {
    const email = m.email.toLowerCase();
    
    // Check or create vione_users
    let user = await prisma.vione_users.findFirst({
      where: { email }
    });

    if (!user) {
      user = await prisma.vione_users.create({
        data: {
          email,
          username: email,
          name: m.name,
          password: defaultPasswordHash,
          email_verified: true,
          created_at: new Date(m.joinedAt || '2024-01-01'),
          updated_at: new Date()
        }
      });
      console.log(`Created vione_users for: ${m.name} (${email}) -> ${user.id}`);
    } else {
      user = await prisma.vione_users.update({
        where: { id: user.id },
        data: {
          name: m.name,
          updated_at: new Date()
        }
      });
    }

    const userId = user.id;

    // Upsert user_profiles
    await prisma.$executeRaw`
      INSERT INTO public.user_profiles (
        user_id, display_name, professional_title, company_name, industry, region, bio, account_status, onboarding_status, created_at, updated_at
      ) VALUES (
        ${userId}::uuid,
        ${m.name},
        ${m.executiveRole + ' - ' + m.title},
        ${m.company},
        ${m.industry},
        'Miền Bắc',
        ${'Hội viên CLB Doanh Nhân CEO 1983 · ' + m.company},
        'active',
        'completed',
        now(),
        now()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        display_name = ${m.name},
        professional_title = ${m.executiveRole + ' - ' + m.title},
        company_name = ${m.company},
        industry = ${m.industry},
        account_status = 'active',
        updated_at = now()
    `;

    // Upsert memberships
    const memberRole = m.isBQT ? 'admin' : 'member';
    await prisma.$executeRaw`
      INSERT INTO public.memberships (
        id, user_id, association_id, role, department, executive_role, is_default, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        ${userId}::uuid,
        ${ASSOC_ID}::uuid,
        ${memberRole}::app_role,
        ${m.department},
        ${m.executiveRole},
        true,
        now(),
        now()
      )
      ON CONFLICT (user_id, association_id) DO UPDATE SET
        role = ${memberRole}::app_role,
        department = ${m.department},
        executive_role = ${m.executiveRole},
        updated_at = now()
    `;

    // Upsert public.members (Primary key is id text)
    // Check if member already exists by email or code or user_id
    const existingMember = await prisma.members.findFirst({
      where: {
        OR: [
          { email },
          { code: m.code },
          { user_id: userId }
        ]
      }
    });

    const memberId = existingMember ? existingMember.id : userId;

    await prisma.$executeRaw`
      INSERT INTO public.members (
        id, code, name, contact, email, phone, type, level, industry, region, status, joined_at, fee_year, fee_paid,
        address, about, user_id, association_id, department, executive_role, company_name, created_at, updated_at
      ) VALUES (
        ${memberId},
        ${m.code},
        ${m.name},
        ${m.name},
        ${email},
        ${m.phone},
        'company',
        'vip',
        ${m.industry},
        'Miền Bắc',
        'active',
        ${m.joinedAt || '2024-01-01'}::date,
        2026,
        true,
        ${m.address},
        ${m.company + ' · ' + m.title + ' · ' + m.industry},
        ${userId}::uuid,
        ${ASSOC_ID}::uuid,
        ${m.department},
        ${m.executiveRole},
        ${m.company},
        now(),
        now()
      )
      ON CONFLICT (id) DO UPDATE SET
        code = ${m.code},
        name = ${m.name},
        contact = ${m.name},
        email = ${email},
        phone = ${m.phone},
        type = 'company',
        level = 'vip',
        industry = ${m.industry},
        status = 'active',
        joined_at = ${m.joinedAt || '2024-01-01'}::date,
        address = ${m.address},
        about = ${m.company + ' · ' + m.title + ' · ' + m.industry},
        user_id = ${userId}::uuid,
        association_id = ${ASSOC_ID}::uuid,
        department = ${m.department},
        executive_role = ${m.executiveRole},
        company_name = ${m.company},
        updated_at = now()
    `;

    console.log(`Synced [${m.code}] ${m.name} -> ${m.department} (${m.executiveRole})`);
  }

  // 4. Clean up any fake dummy member rows not in validEmails
  console.log('\nCleaning up unlisted/dummy accounts from public.members...');
  const allCurrentMembers = await prisma.members.findMany();
  let deletedCount = 0;
  for (const cur of allCurrentMembers) {
    const curEmail = (cur.email || '').toLowerCase().trim();
    if (!validEmails.has(curEmail) && curEmail !== 'admin@connect.vn' && curEmail !== 'admin1@connect.vn') {
      console.log(`Removing unlisted member: ${cur.id} | ${cur.code} | ${cur.name} | ${cur.email}`);
      await prisma.$executeRaw`DELETE FROM public.members WHERE id = ${cur.id}`;
      deletedCount++;
    }
  }
  console.log(`Cleaned up ${deletedCount} unlisted member records.`);

  // 5. Clean up unlisted memberships
  const allMemberships = await prisma.$queryRaw`
    SELECT m.id, m.user_id, u.email 
    FROM public.memberships m
    LEFT JOIN public.vione_users u ON u.id = m.user_id
  `;
  for (const mb of allMemberships) {
    const mbEmail = (mb.email || '').toLowerCase().trim();
    if (!validEmails.has(mbEmail) && mbEmail !== 'admin@connect.vn' && mbEmail !== 'admin1@connect.vn') {
      console.log(`Removing unlisted membership: ${mb.id} for user ${mbEmail}`);
      await prisma.$executeRaw`DELETE FROM public.memberships WHERE id = ${mb.id}::uuid`;
    }
  }

  console.log('\n--- VERIFICATION OF REMAINING MEMBERS IN DB ---');
  const finalMembers = await prisma.members.findMany({ orderBy: { code: 'asc' } });
  console.log(`Total remaining members in public.members: ${finalMembers.length}`);
  finalMembers.forEach(m => {
    console.log(`[${m.code}] ${m.name} | ${m.department} | ${m.executive_role} | ${m.company_name} | ${m.email} | ${m.phone}`);
  });

  console.log('--- SYNC FINISHED SUCCESSFULLY ---');
}

syncMembers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
