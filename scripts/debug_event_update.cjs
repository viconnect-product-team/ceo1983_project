const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/ceo1983_project'
});

async function run() {
  await client.connect();

  // Let's inspect an event from public.events
  const evRes = await client.query('SELECT * FROM public.events LIMIT 1');
  const ev = evRes.rows[0];
  console.log('Sample event:', ev.id, ev.name);

  // Now test updating tagline:
  try {
    await client.query('ALTER TABLE public.events ADD COLUMN IF NOT EXISTS tagline text;');
    console.log('tagline column ensured on public.events!');
  } catch (err) {
    console.error('Error adding tagline:', err.message);
  }

  // Now let's see why marketplace PATCH failed
  console.log('\n--- Checking marketplace update ---');
  const prodRes = await client.query('SELECT * FROM public.products LIMIT 1');
  console.log('Sample product:', prodRes.rows[0]?.id, prodRes.rows[0]?.custom_id);

  await client.end();
}

run().catch(console.error);

