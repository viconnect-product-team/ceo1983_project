const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/vione_app?sslmode=disable'
});

async function main() {
  try {
    const res = await pool.query(`SELECT email, password FROM vione_users WHERE email = 'admin@connect.vn'`);
    console.log('Password hash of admin@connect.vn:', res.rows[0].password);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
