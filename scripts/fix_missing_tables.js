const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/vione_app?schema=public'
});

async function main() {
  await client.connect();
  console.log('Connected to PG');

  // 1. user_device_sessions
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.user_device_sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      device_key text,
      device_label text,
      platform text,
      browser text,
      is_standalone boolean DEFAULT false,
      first_seen_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
      last_seen_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
      revoked_at timestamp with time zone
    );
  `);
  console.log('Checked/Created public.user_device_sessions');

  // 2. business_identities
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.business_identities (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_user_id uuid,
      display_name text,
      job_title text,
      headline text,
      company_name text,
      avatar_url text,
      status text DEFAULT 'active',
      created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Checked/Created public.business_identities');

  // 3. Check products table columns
  const prodCols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'marketplace_products' OR table_name = 'products'
    ORDER BY table_name, ordinal_position;
  `);
  console.log('Products columns:');
  console.table(prodCols.rows);

  await client.query(`
    DO $$
    BEGIN
      IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seller_id uuid;
      END IF;
      IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_products') THEN
        ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS seller_id uuid;
      END IF;
    END $$;
  `);
  console.log('Checked/Added seller_id column');

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
