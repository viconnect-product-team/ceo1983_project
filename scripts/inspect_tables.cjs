const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/ceo1983_project'
});

async function run() {
  await client.connect();

  console.log('--- Columns in public.events ---');
  const evCols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'events'
    ORDER BY ordinal_position;
  `);
  console.log(evCols.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));

  console.log('\n--- Columns in public.marketplace_products (or products) ---');
  const prodTables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name LIKE '%product%';
  `);
  console.log('Product tables:', prodTables.rows);

  for (const t of prodTables.rows) {
    const cols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = '${t.table_name}'
      ORDER BY ordinal_position;
    `);
    console.log(`Table ${t.table_name}:`, cols.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
  }

  console.log('\n--- Columns in public.trainings ---');
  const trTables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name LIKE '%train%';
  `);
  console.log('Training tables:', trTables.rows);
  for (const t of trTables.rows) {
    const cols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = '${t.table_name}'
      ORDER BY ordinal_position;
    `);
    console.log(`Table ${t.table_name}:`, cols.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
  }

  console.log('\n--- Columns in public.documents ---');
  const docTables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name LIKE '%doc%';
  `);
  console.log('Document tables:', docTables.rows);
  for (const t of docTables.rows) {
    const cols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = '${t.table_name}'
      ORDER BY ordinal_position;
    `);
    console.log(`Table ${t.table_name}:`, cols.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
  }

  await client.end();
}

run().catch(console.error);

