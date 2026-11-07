const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/ceo1983_project'
});

async function run() {
  await client.connect();

  console.log('Ensuring columns unit, currency on public.products...');
  await client.query(`
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit text;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS currency text DEFAULT 'VND';
  `);
  console.log('Columns ensured!');

  await client.end();
}

run().catch(console.error);

