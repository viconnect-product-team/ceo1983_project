const { Client } = require('pg');

async function check() {
  for (const db of ['vione_app', 'ceo1983_project']) {
    console.log(`\n=== Checking DB: ${db} ===`);
    const c = new Client({
      connectionString: `postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/${db}?sslmode=disable`
    });
    await c.connect();
    
    const users = await c.query('SELECT id, email, username FROM public.vione_users LIMIT 10');
    console.log('Users in ' + db + ':', users.rows);

    const members = await c.query('SELECT id, code, name, email, association_id, user_id FROM public.members LIMIT 10');
    console.log('Members in ' + db + ':', members.rows);

    const events = await c.query('SELECT id, name, association_id FROM public.events LIMIT 10');
    console.log('Events in ' + db + ':', events.rows);

    await c.end();
  }
}

check();
