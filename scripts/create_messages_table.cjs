const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../apps/ceo1983_app_be/.env');
let dbUrl = '';
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    if (line.startsWith('DATABASE_URL=')) {
      dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
    }
  }
}
if (!dbUrl) {
  dbUrl = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?pgbouncer=true';
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: false
});

async function main() {
  console.log('Connecting to database...');
  const client = await pool.connect();
  try {
    console.log('Connected! Creating public.messages table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.messages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        from_id text NOT NULL,
        to_id text NOT NULL,
        text text NOT NULL,
        created_at timestamptz DEFAULT now(),
        read_at timestamptz,
        is_retracted boolean DEFAULT false,
        reactions jsonb DEFAULT '[]'::jsonb,
        association_id uuid DEFAULT 'c1983000-0000-4000-8000-000000001983'::uuid
      );
      CREATE INDEX IF NOT EXISTS idx_messages_from_to ON public.messages (from_id, to_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_messages_to_from ON public.messages (to_id, from_id, created_at DESC);
    `);
    console.log('Successfully created/verified public.messages table in PostgreSQL!');
    const res = await client.query('SELECT count(*) FROM public.messages');
    console.log('Current message count in public.messages:', res.rows[0].count);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
