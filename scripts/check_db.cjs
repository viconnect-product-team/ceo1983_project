const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/ceo1983_project?schema=public'
});

async function main() {
  await client.connect();
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
  console.log('Tables:', res.rows.map(r => r.table_name));
  
  // Find tables with user or account
  for (const t of res.rows) {
    if (t.table_name.includes('user') || t.table_name.includes('account') || t.table_name.includes('member') || t.table_name.includes('auth')) {
      const countRes = await client.query(`SELECT count(*) FROM "${t.table_name}";`);
      console.log(`Table ${t.table_name} has ${countRes.rows[0].count} rows`);
      const sample = await client.query(`SELECT * FROM "${t.table_name}" LIMIT 3;`);
      console.log(`Sample from ${t.table_name}:`, sample.rows);
    }
  }
  await client.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
