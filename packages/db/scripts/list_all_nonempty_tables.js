const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project' });

async function listAll() {
  await client.connect();

  const tables = await client.query(`
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema IN ('public', 'auth') AND table_type = 'BASE TABLE'
    ORDER BY table_schema, table_name;
  `);

  console.log('Total tables:', tables.rowCount);
  const rows = [];
  for (const r of tables.rows) {
    try {
      const c = await client.query(`SELECT COUNT(*) FROM "${r.table_schema}"."${r.table_name}"`);
      const count = parseInt(c.rows[0].count, 10);
      if (count > 0) {
        rows.push({ schema: r.table_schema, table: r.table_name, count });
      }
    } catch (e) {
      // ignore
    }
  }
  console.table(rows);
  await client.end();
}

listAll().catch(console.error);
