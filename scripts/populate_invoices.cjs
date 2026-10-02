const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@113.20.107.184:6432/ceo1983_project?sslmode=disable' });

async function run() {
  await c.connect();
  const members = (await c.query('SELECT id, user_id, code, name FROM public.members ORDER BY code ASC')).rows;
  console.log(`Ensuring invoices for ${members.length} members...`);

  // Update existing invoices so we have: paid, unpaid, overdue
  await c.query(`
    UPDATE public.invoices 
    SET status = 'overdue', due_date = CURRENT_DATE - INTERVAL '20 days' 
    WHERE id IN ('INV-ID-2', 'INV-ID-3')
  `);

  await c.query(`
    UPDATE public.invoices 
    SET status = 'unpaid', due_date = CURRENT_DATE + INTERVAL '15 days' 
    WHERE id IN ('INV-ID-4', 'INV-ID-5')
  `);

  // Insert invoices for members who don't have one yet
  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    const exists = await c.query('SELECT id FROM public.invoices WHERE member_id = $1 OR member_id = $2', [m.id, m.user_id ? String(m.user_id) : m.id]);
    if (exists.rows.length === 0) {
      const invId = `INV-2026-${String(i + 1).padStart(4, '0')}`;
      const invNo = `HD-2026-${String(i + 1).padStart(4, '0')}`;
      const amount = 15000000;
      let st = 'paid';
      let dueDate = '2026-12-31';
      let paidAt = '2026-06-15';
      if (i % 3 === 0) {
        st = 'unpaid';
        dueDate = '2026-10-25';
        paidAt = null;
      } else if (i % 5 === 0) {
        st = 'overdue';
        dueDate = '2026-09-15';
        paidAt = null;
      }

      await c.query(`
        INSERT INTO public.invoices (
          id, member_id, invoice_no, year, amount, due_date, paid_at, status, method, created_at, updated_at, association_id
        ) VALUES (
          $1, $2, $3, 2026, $4, $5::date, $6::date, $7, 'bank', now(), now(), 'c1983000-0000-4000-8000-000000001983'::uuid
        )
      `, [invId, m.id, invNo, amount, dueDate, paidAt, st]);
    }
  }

  const finalInvs = (await c.query('SELECT status, count(*), sum(amount) FROM public.invoices GROUP BY status')).rows;
  console.log('Final invoices by status:', finalInvs);
  await c.end();
}
run().catch(console.error);
