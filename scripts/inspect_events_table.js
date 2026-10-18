const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/vione_app?schema=public'
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'events'
    ORDER BY ordinal_position;
  `);
  console.log('Columns of events table:');
  console.table(res.rows);

  const sample = await client.query(`SELECT * FROM public.events ORDER BY created_at DESC LIMIT 2;`);
  console.log('Sample rows in events:');
  console.log(sample.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
