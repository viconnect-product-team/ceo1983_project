const { Client } = require('pg');

async function checkDatabases() {
  const c = new Client({
    connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/postgres?sslmode=disable'
  });
  try {
    await c.connect();
    const res = await c.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
    console.log('Databases on 14.225.217.232:5436:', res.rows.map(r => r.datname));
    await c.end();

    for (const db of res.rows.map(r => r.datname)) {
      try {
        const dbClient = new Client({
          connectionString: `postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/${db}?sslmode=disable`
        });
        await dbClient.connect();
        const mCount = await dbClient.query('SELECT count(*) FROM public.members').catch(e => ({ rows: [{ count: 'N/A: ' + e.message }] }));
        const eCount = await dbClient.query('SELECT count(*) FROM public.events').catch(e => ({ rows: [{ count: 'N/A: ' + e.message }] }));
        const uCount = await dbClient.query('SELECT count(*) FROM public.vione_users').catch(e => ({ rows: [{ count: 'N/A: ' + e.message }] }));
        console.log(`DB [${db}]: members=${mCount.rows[0].count}, events=${eCount.rows[0].count}, users=${uCount.rows[0].count}`);
        await dbClient.end();
      } catch (e) {
        console.log(`DB [${db}] connect error:`, e.message);
      }
    }
  } catch (err) {
    console.error('Error connecting to postgres db:', err.message);
  }
}

checkDatabases();
