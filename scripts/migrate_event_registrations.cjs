const { Client } = require('pg');

async function migrateDb(dbName) {
  const client = new Client({
    connectionString: `postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/${dbName}`
  });

  try {
    await client.connect();
    console.log(`Connected to ${dbName}`);

    // Check if table exists
    const tableCheck = await client.query(`
      SELECT to_regclass('public.event_registrations') as tbl;
    `);
    if (!tableCheck.rows[0].tbl) {
      console.log(`Table event_registrations does not exist in ${dbName}`);
      await client.end();
      return;
    }

    console.log(`Adding columns to event_registrations in ${dbName}...`);
    await client.query(`
      ALTER TABLE public.event_registrations 
      ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'free',
      ADD COLUMN IF NOT EXISTS payment_amount numeric DEFAULT 0,
      ADD COLUMN IF NOT EXISTS lucky_number text,
      ADD COLUMN IF NOT EXISTS qr_payload text,
      ADD COLUMN IF NOT EXISTS reminder_count integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_reminded_at timestamp with time zone;
    `);
    console.log(`Successfully migrated event_registrations in ${dbName}`);

    // Also check events table columns
    const eventsTableCheck = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'events' AND table_schema = 'public';
    `);
    const cols = eventsTableCheck.rows.map(r => r.column_name);
    console.log(`Events columns in ${dbName}:`, cols);

    // If ticket_price is missing in events, maybe add it as an alias or column if needed?
    // Let's check if ticket_price is needed
    if (!cols.includes('ticket_price')) {
      console.log(`Adding ticket_price column to events in ${dbName}...`);
      await client.query(`
        ALTER TABLE public.events 
        ADD COLUMN IF NOT EXISTS ticket_price numeric DEFAULT 0;
      `);
      // sync with fee
      if (cols.includes('fee')) {
        await client.query(`
          UPDATE public.events 
          SET ticket_price = fee 
          WHERE ticket_price IS NULL OR ticket_price = 0;
        `);
      }
      console.log(`Added ticket_price to events`);
    }

    // Verify event_registrations columns
    const regCols = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'event_registrations' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    console.table(regCols.rows);

    await client.end();
  } catch (err) {
    console.error(`Error migrating ${dbName}:`, err);
    try { await client.end(); } catch (e) {}
  }
}

async function main() {
  await migrateDb('vione_app');
  await migrateDb('ceo1983_project');
}

main();
