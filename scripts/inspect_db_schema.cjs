const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?pgbouncer=true"
  });
  await client.connect();

  const users = await client.query('SELECT id, username, email, password FROM vione_users');
  console.log(users.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
