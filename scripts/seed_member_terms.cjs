const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@113.20.107.184:6432/ceo1983_project?sslmode=disable' });

async function run() {
  await c.connect();
  const members = (await c.query('SELECT id, code FROM public.members ORDER BY code ASC')).rows;
  console.log(`Setting term_end for ${members.length} members...`);

  // Distribute into 4 renewal categories
  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    if (i < 8) {
      // Due (<= 30 days)
      await c.query("UPDATE public.members SET term_end = CURRENT_DATE + INTERVAL '18 days', renewed_at = NULL, last_reminder = CURRENT_DATE - INTERVAL '3 days', reminder_count = 1 WHERE id = $1", [m.id]);
    } else if (i < 15) {
      // Overdue (< 0 days)
      await c.query("UPDATE public.members SET term_end = CURRENT_DATE - INTERVAL '25 days', renewed_at = NULL, last_reminder = CURRENT_DATE - INTERVAL '10 days', reminder_count = 2 WHERE id = $1", [m.id]);
    } else if (i < 27) {
      // Upcoming (> 30 days)
      await c.query("UPDATE public.members SET term_end = CURRENT_DATE + INTERVAL '95 days', renewed_at = NULL, last_reminder = NULL, reminder_count = 0 WHERE id = $1", [m.id]);
    } else {
      // Renewed
      await c.query("UPDATE public.members SET term_end = CURRENT_DATE + INTERVAL '365 days', renewed_at = CURRENT_DATE - INTERVAL '5 days', new_term_end = CURRENT_DATE + INTERVAL '365 days' WHERE id = $1", [m.id]);
    }
  }

  console.log('Successfully updated term_end and renewal status for all members!');
  await c.end();
}
run().catch(console.error);
