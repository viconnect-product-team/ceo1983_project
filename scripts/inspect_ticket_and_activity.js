const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/vione_app?schema=public'
});

async function main() {
  await client.connect();

  const ticketTable = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'event_ticket_types'
    ORDER BY ordinal_position;
  `);
  console.log('event_ticket_types columns:');
  console.table(ticketTable.rows);

  const actLog = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'activity_log'
    ORDER BY ordinal_position;
  `);
  console.log('activity_log columns:');
  console.table(actLog.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
