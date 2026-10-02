const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@113.20.107.184:6432/ceo1983_project?sslmode=disable' });

async function run() {
  await c.connect();
  const invs = (await c.query('SELECT status, year, count(*), sum(amount) FROM public.invoices GROUP BY status, year')).rows;
  console.log('Invoices by status & year:', invs);

  // Check some unpaid or overdue invoices
  const unpaid = (await c.query("SELECT count(*) FROM public.invoices WHERE status != 'paid'")).rows[0];
  console.log('Unpaid invoices count:', unpaid.count);

  await c.end();
}
run().catch(console.error);
