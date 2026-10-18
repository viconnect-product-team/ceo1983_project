const { Client } = require('pg');

async function inspectEvents() {
  const c = new Client({
    connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/vione_app?sslmode=disable'
  });
  try {
    await c.connect();
    const cols = await c.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'events'
      ORDER BY ordinal_position;
    `);
    console.log('Columns in public.events:');
    console.table(cols.rows);

    const rows = await c.query('SELECT * FROM public.events');
    console.log('Events in vione_app (count):', rows.rows.length);
    console.log('Events data:', rows.rows);

    // Also copy events to ceo1983_project if ceo1983_project has 0 events
    const c2 = new Client({
      connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/ceo1983_project?sslmode=disable'
    });
    await c2.connect();
    const c2Count = await c2.query('SELECT count(*) FROM public.events');
    console.log('Events in ceo1983_project:', c2Count.rows[0].count);

    if (parseInt(c2Count.rows[0].count) === 0 && rows.rows.length > 0) {
      console.log('Syncing events into ceo1983_project...');
      for (const ev of rows.rows) {
        const keys = Object.keys(ev);
        const values = Object.values(ev);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const colNames = keys.map(k => `"${k}"`).join(', ');
        await c2.query(`INSERT INTO public.events (${colNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`, values);
      }
      console.log('Events synced successfully into ceo1983_project!');
    }
    await c2.end();
    await c.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

inspectEvents();
