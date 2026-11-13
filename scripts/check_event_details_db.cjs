const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?sslmode=disable';

async function main() {
  const c = new Client({ connectionString: DB_URL });
  await c.connect();

  const ev = await c.query("SELECT * FROM public.events");
  console.log('ALL EVENTS COUNT:', ev.rows.length);
  console.log('EVENT 0:\n', JSON.stringify(ev.rows[0], null, 2));

  const regs = await c.query("SELECT * FROM public.event_registrations");
  console.log('ALL REGISTRATIONS COUNT:', regs.rows.length);
  console.log('REGISTRATIONS:\n', regs.rows);

  await c.end();
}

main().catch(console.error);
