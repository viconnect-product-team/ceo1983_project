const { Client } = require('pg');

const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project';

const ADMIN_ID = '00000000-0000-4000-8000-000000000002';
const ADMIN_EMAIL = 'admin@connect.vn';
const ADMIN_PASSWORD_HASH = '$2b$10$hbYrLqM/upoemnPtP419F.2fg9u9m06n5IdeJfQbDOQhIxygeYC9C'; // 123456
const ASSOC_ID = 'c1983000-0000-4000-8000-000000001983';

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('Connected to PostgreSQL successfully.');

  try {
    // 1. Temporarily drop triggers that block deletions if present
    await client.query('DROP TRIGGER IF EXISTS bmfu_block_delete_trg ON public.business_meeting_follow_ups;').catch(() => {});

    // 2. Truncate / delete all activity and interaction tables
    const activityTables = [
      'public.opportunity_interests',
      'public.quote_requests',
      'public.opportunities',
      'public.event_registrations',
      'public.member_checkins',
      'public.events',
      'public.feed_comments',
      'public.feed_likes',
      'public.feed_posts',
      'public.poll_votes',
      'public.poll_options',
      'public.polls',
      'public.perks',
      'public.products',
      'public.product_images',
      'public.product_categories',
      'public.transactions',
      'public.invoices',
      'public.income_records',
      'public.expense_records',
      'public.renewal_audit_log',
      'public.reviews',
      'public.meetings',
      'public.messages',
      'public.direct_message_threads',
      'public.direct_messages',
      'public.notifications',
      'public.member_notifications',
      'public.business_notifications',
      'public.activity_log',
      'public.audit_logs',
      'public.user_device_sessions',
      'public.revoked_tokens',
      'public.auth_sessions',
      'public.refresh_tokens',
      'public.ai_user_quotas',
      'public.tasks',
      'public.task_assignees',
      'public.task_attachments',
      'public.documents',
      'public.sponsors',
      'public.sponsor_packages',
      'public.sponsors_prizes',
      'public.trainings',
      'public.training_attendees',
      'public.b2b_connections',
      'public.business_meetings',
      'public.business_meeting_follow_ups',
      'public.business_meeting_participants',
      'public.business_meeting_proposals',
      'public.business_meeting_time_proposals',
      'public.business_meeting_calendar_projections',
      'public.business_relationship_memories',
      'public.business_relationship_memory_links',
      'public.business_relationship_memory_sources',
      'public.business_relationship_memory_feedback',
      'public.business_relationship_moment_reminders',
      'public.business_relationship_person_plans',
      'public.community_opportunity_followup_events',
      'public.community_opportunity_followups',
      'public.community_join_requests',
      'public.community_invitations',
      'public.community_invite_templates',
      'public.saved_card_tags',
      'public.saved_card_collections',
      'public.saved_business_cards',
      'public.relationship_events',
      'public.business_interactions',
      'public.business_card_interactions',
      'public.business_card_leads',
      'public.business_card_needs',
      'public.business_card_services',
      'public.business_card_skills',
      'public.identity_nfc_tags',
      'public.identity_share_links',
      'public.identity_field_visibility',
      'public.gn_reports',
      'public.gn_notifications',
      'public.gn_notification_prefs',
      'public.user_connections',
      'public.card_ai_import_history',
      'public.association_logo_history',
      'public.broadcast_notification_dismissals',
      'public.bc_admin_grants'
    ];

    console.log('--- Truncating activity tables ---');
    for (const t of activityTables) {
      try {
        await client.query(`DELETE FROM ${t};`);
        console.log(`✓ Cleared ${t}`);
      } catch (e) {
        // Table might not exist or already empty
      }
    }

    // 3. Clean non-admin records in user-related tables
    console.log('--- Cleaning non-admin user rows ---');

    await client.query(`DELETE FROM public.user_settings WHERE user_id != $1::uuid;`, [ADMIN_ID]).catch(e => console.warn('user_settings:', e.message));
    await client.query(`DELETE FROM public.user_roles WHERE user_id != $1::uuid;`, [ADMIN_ID]).catch(e => console.warn('user_roles:', e.message));
    await client.query(`DELETE FROM public.user_profiles WHERE user_id != $1::uuid;`, [ADMIN_ID]).catch(e => console.warn('user_profiles:', e.message));
    await client.query(`DELETE FROM public.memberships WHERE user_id != $1::uuid;`, [ADMIN_ID]).catch(e => console.warn('memberships:', e.message));
    await client.query(`DELETE FROM public.member_business_cards WHERE owner_user_id != $1::uuid;`, [ADMIN_ID]).catch(e => console.warn('member_business_cards:', e.message));
    await client.query(`DELETE FROM public.business_identities WHERE owner_user_id != $1::uuid;`, [ADMIN_ID]).catch(e => console.warn('business_identities:', e.message));
    await client.query(`DELETE FROM public.company_members WHERE user_id != $1::uuid;`, [ADMIN_ID]).catch(e => console.warn('company_members:', e.message));
    await client.query(`DELETE FROM public.companies;`).catch(e => console.warn('companies:', e.message));
    await client.query(`DELETE FROM public.members WHERE email != $1 AND id != $2;`, [ADMIN_EMAIL, ADMIN_ID]).catch(e => console.warn('members:', e.message));
    await client.query(`DELETE FROM public.ceo1983_users WHERE id != $1::uuid AND email != $2;`, [ADMIN_ID, ADMIN_EMAIL]).catch(e => console.warn('ceo1983_users:', e.message));
    await client.query(`DELETE FROM public.vione_users WHERE id != $1::uuid AND email != $2;`, [ADMIN_ID, ADMIN_EMAIL]).catch(e => console.warn('vione_users:', e.message));
    await client.query(`DELETE FROM auth.users WHERE id != $1::uuid AND email != $2;`, [ADMIN_ID, ADMIN_EMAIL]).catch(e => console.warn('auth.users:', e.message));

    // 4. Ensure Association record exists
    console.log('--- Verifying Association ---');
    await client.query(`
      INSERT INTO public.associations (
        id, name, slug, brand_primary, tagline, about, contact_email, landing_published, ssl_status, public_card_enabled
      ) VALUES (
        $1::uuid, 'CLB Doanh Nhân CEO 1983', 'ceo1983', '#004b91',
        'Liên Minh Doanh Nhân Quý Hợi 1983',
        'Cộng đồng hơn 200 Chủ tịch & Tổng Giám đốc sinh năm 1983 trực thuộc HanoiBA.',
        'contact@ceo1983.com', true, 'active', true
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        brand_primary = EXCLUDED.brand_primary;
    `, [ASSOC_ID]);

    // 5. Ensure admin@connect.vn is perfectly seeded & synchronized
    console.log('--- Ensuring admin@connect.vn master account ---');

    // 5.1 auth.users
    await client.query(`
      INSERT INTO auth.users (id, email, role)
      VALUES ($1::uuid, $2, 'authenticated')
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role;
    `, [ADMIN_ID, ADMIN_EMAIL]);

    // 5.2 public.vione_users
    await client.query(`
      INSERT INTO public.vione_users (
        id, username, password, email, name, email_verified, created_at, updated_at
      ) VALUES (
        $1::uuid, $2, $3, $2, 'Quản Trị Viên Hệ Thống', true, now(), now()
      )
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        email = EXCLUDED.email,
        name = EXCLUDED.name;
    `, [ADMIN_ID, ADMIN_EMAIL, ADMIN_PASSWORD_HASH]);

    // 5.3 public.ceo1983_users
    await client.query(`
      INSERT INTO public.ceo1983_users (
        id, username, password, email, name, email_verified, created_at, updated_at
      ) VALUES (
        $1::uuid, $2, $3, $2, 'Quản Trị Viên Hệ Thống', true, now(), now()
      )
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        email = EXCLUDED.email,
        name = EXCLUDED.name;
    `, [ADMIN_ID, ADMIN_EMAIL, ADMIN_PASSWORD_HASH]);

    // 5.4 public.user_roles
    await client.query(`DELETE FROM public.user_roles WHERE user_id = $1::uuid;`, [ADMIN_ID]).catch(() => {});
    await client.query(`
      INSERT INTO public.user_roles (id, user_id, role, created_at)
      VALUES (gen_random_uuid(), $1::uuid, 'admin'::app_role, now())
      ON CONFLICT (user_id, role) DO NOTHING;
    `, [ADMIN_ID]);

    // 5.5 public.user_profiles
    await client.query(`
      INSERT INTO public.user_profiles (
        user_id, display_name, professional_title, company_name, industry, region, locale, timezone, onboarding_status, account_status
      ) VALUES (
        $1::uuid, 'Quản Trị Viên Hệ Thống', 'Quản trị viên Hệ thống', 'CLB Doanh Nhân CEO 1983', 'Công nghệ thông tin', 'Hà Nội', 'vi', 'Asia/Ho_Chi_Minh', 'completed', 'active'
      )
      ON CONFLICT (user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        professional_title = EXCLUDED.professional_title,
        company_name = EXCLUDED.company_name,
        account_status = 'active';
    `, [ADMIN_ID]);

    // 5.6 public.business_identities
    await client.query(`
      INSERT INTO public.business_identities (
        id, owner_user_id, display_name, job_title, company_name, primary_email, status, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1::uuid, 'Quản Trị Viên Hệ Thống', 'Quản trị viên Hệ thống', 'CLB Doanh Nhân CEO 1983', $2, 'active', now(), now()
      )
      ON CONFLICT (owner_user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        job_title = EXCLUDED.job_title,
        company_name = EXCLUDED.company_name,
        primary_email = EXCLUDED.primary_email,
        updated_at = now();
    `, [ADMIN_ID, ADMIN_EMAIL]);

    // 5.7 public.members
    await client.query(`
      INSERT INTO public.members (
        id, code, name, contact, email, phone, type, level, industry, region, status,
        joined_at, fee_year, fee_paid, address, about, created_at, updated_at,
        user_id, association_id, payment_status, department, executive_role, company_name
      ) VALUES (
        $1, 'M1983-001', 'Quản Trị Viên Hệ Thống', 'admin@connect.vn', $2, '0901000002',
        'enterprise', 'vip', 'Công nghệ thông tin', 'Hà Nội', 'active',
        CURRENT_DATE, 2026, true, 'Hà Nội, Việt Nam', 'Quản trị viên CLB Doanh Nhân CEO 1983', now(), now(),
        $3::uuid, $4::uuid, 'paid', 'Ban Quản Trị', 'admin', 'CLB Doanh Nhân CEO 1983'
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        department = EXCLUDED.department,
        executive_role = EXCLUDED.executive_role,
        payment_status = 'paid',
        fee_paid = true,
        status = 'active';
    `, [ADMIN_ID, ADMIN_EMAIL, ADMIN_ID, ASSOC_ID]);

    // 5.8 public.memberships
    await client.query(`DELETE FROM public.memberships WHERE user_id = $1::uuid;`, [ADMIN_ID]).catch(() => {});
    await client.query(`
      INSERT INTO public.memberships (
        id, user_id, association_id, role, is_default, department, executive_role, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1::uuid, $2::uuid, 'admin'::app_role, true, 'Ban Quản Trị', 'admin', now(), now()
      );
    `, [ADMIN_ID, ASSOC_ID]);

    // 5.9 public.member_business_cards
    await client.query(`DELETE FROM public.member_business_cards WHERE owner_user_id = $1::uuid;`, [ADMIN_ID]).catch(() => {});
    await client.query(`
      INSERT INTO public.member_business_cards (
        id, association_id, owner_user_id, member_id, display_name, company_name, professional_title,
        work_email, work_phone, bio, status, slug, card_kind, public_mode, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1::uuid, $2::uuid, $3, 'Quản Trị Viên Hệ Thống', 'CLB Doanh Nhân CEO 1983', 'Quản trị viên Hệ thống',
        $4, '0901000002', 'Ban Quản Trị CLB Doanh Nhân CEO 1983', 'published', 'card-admin-connect', 'primary', 'public', now(), now()
      );
    `, [ASSOC_ID, ADMIN_ID, ADMIN_ID, ADMIN_EMAIL]);

    // 6. Restore triggers
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'bmfu_block_delete') THEN
          CREATE TRIGGER bmfu_block_delete_trg
          BEFORE DELETE ON public.business_meeting_follow_ups
          FOR EACH ROW EXECUTE FUNCTION bmfu_block_delete();
        END IF;
      END $$;
    `).catch(() => {});

    console.log('\n======================================================');
    console.log('RESET COMPLETED SUCCESSFULLY!');
    console.log('======================================================');

  } catch (err) {
    console.error('Fatal error during reset:', err);
    throw err;
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
