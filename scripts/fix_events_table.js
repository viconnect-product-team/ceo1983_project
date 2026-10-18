const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/vione_app?schema=public'
});

async function main() {
  await client.connect();
  console.log('Connected to PG');

  await client.query(`
    ALTER TABLE public.events 
    ADD COLUMN IF NOT EXISTS image text,
    ADD COLUMN IF NOT EXISTS banner text,
    ADD COLUMN IF NOT EXISTS description text,
    ADD COLUMN IF NOT EXISTS qr_scanners jsonb DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS sponsors jsonb DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS address text,
    ADD COLUMN IF NOT EXISTS latitude numeric,
    ADD COLUMN IF NOT EXISTS longitude numeric,
    ADD COLUMN IF NOT EXISTS map_url text;
  `);
  console.log('ALTER TABLE public.events executed successfully!');

  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'events'
    ORDER BY ordinal_position;
  `);
  console.table(res.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
