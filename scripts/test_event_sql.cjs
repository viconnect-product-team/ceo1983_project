const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/ceo1983_project'
});

async function run() {
  await client.connect();

  const evRes = await client.query('SELECT * FROM public.events LIMIT 1');
  const ev = evRes.rows[0];
  console.log('Testing update on event:', ev.id);

  // Let's test the exact query from try block
  try {
    const res = await client.query(`
      UPDATE public.events SET
        name = $1,
        tagline = $2,
        date = $3::date,
        location = $4,
        capacity = $5,
        type = $6,
        status = $7,
        image = $8,
        banner = $9,
        ticket_price = $10,
        fee = $11,
        description = $12,
        photo_gallery_url = $13,
        qr_scanners = $14::jsonb,
        sponsors = $15::jsonb,
        start_time = $16,
        end_time = $17,
        agenda = $18::jsonb,
        checkin_qr = $19,
        updated_at = now()
      WHERE id = $20
      RETURNING *
    `, [
      ev.name,
      ev.tagline || '',
      '2026-11-20',
      ev.location,
      ev.capacity || 50,
      ev.type || 'forum',
      ev.status || 'upcoming',
      ev.image || '',
      ev.banner || '',
      ev.ticket_price || 0,
      ev.fee || 0,
      ev.description || '',
      ev.photo_gallery_url || '',
      JSON.stringify(ev.qr_scanners || []),
      JSON.stringify(ev.sponsors || []),
      ev.start_time || '08:30',
      ev.end_time || '11:30',
      JSON.stringify(ev.agenda || []),
      ev.checkin_qr || null,
      ev.id
    ]);
    console.log('Query succeeded! Rows updated:', res.rowCount);
  } catch (err) {
    console.error('Query failed:', err);
  }

  await client.end();
}

run();

