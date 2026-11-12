const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?pgbouncer=true',
  ssl: false
});
async function run() {
  await client.connect();
  await client.query(`
    ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS phone text DEFAULT '';
    ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS member_id text DEFAULT '';
    ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS ticket_code text DEFAULT '';
  `);
  console.log('Columns added successfully to event_registrations!');
  await client.end();
}
run().catch(console.error);
