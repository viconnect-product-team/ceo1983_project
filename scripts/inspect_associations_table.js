const { Client } = require('pg');

async function inspectAssociations() {
  const c = new Client({
    connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/vione_app?sslmode=disable'
  });
  try {
    await c.connect();
    const cols = await c.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'associations'
      ORDER BY ordinal_position;
    `);
    console.log('Columns in public.associations:');
    console.table(cols.rows);

    const rows = await c.query('SELECT * FROM public.associations LIMIT 5');
    console.log('Rows count:', rows.rows.length);
    console.log('Sample row:', rows.rows[0]);

    // Check members table association_id
    const memberAssocs = await c.query('SELECT DISTINCT association_id FROM public.members');
    console.log('Members association_ids:', memberAssocs.rows);

    // Check events table association_id
    const eventAssocs = await c.query('SELECT DISTINCT association_id FROM public.events');
    console.log('Events association_ids:', eventAssocs.rows);

    await c.end();
  } catch (err) {
    console.error('Inspect error:', err.message);
  }
}

inspectAssociations();
