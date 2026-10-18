const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/vione_app?sslmode=disable'
});

async function main() {
  try {
    const r = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'memberships'
      ORDER BY ordinal_position
    `);
    console.table(r.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
