const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/ceo1983_project'
});

async function run() {
  await client.connect();

  console.log('Creating enums if not exist...');
  await client.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'global_connection_status') THEN
        CREATE TYPE public.global_connection_status AS ENUM ('pending', 'accepted', 'declined', 'cancelled', 'blocked');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'global_connection_source_type') THEN
        CREATE TYPE public.global_connection_source_type AS ENUM ('manual', 'qr_scan', 'nfc', 'card_exchange', 'recommendation', 'b2b');
      END IF;
    END $$;
  `);

  console.log('Creating table public.user_connections...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.user_connections (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      requester_user_id uuid NOT NULL,
      recipient_user_id uuid NOT NULL,
      status public.global_connection_status NOT NULL DEFAULT 'pending',
      source_type public.global_connection_source_type DEFAULT 'manual',
      requested_at timestamp without time zone DEFAULT now(),
      responded_at timestamp without time zone,
      created_at timestamp without time zone DEFAULT now(),
      updated_at timestamp without time zone DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_user_conn_req ON public.user_connections (requester_user_id);
    CREATE INDEX IF NOT EXISTS idx_user_conn_rec ON public.user_connections (recipient_user_id);
    CREATE INDEX IF NOT EXISTS idx_user_conn_status ON public.user_connections (status);
  `);

  console.log('Table public.user_connections created successfully!');
  await client.end();
}

run().catch(console.error);

