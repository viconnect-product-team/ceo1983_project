const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/vione_app?sslmode=disable'
});

async function main() {
  try {
    const roles = await pool.query(`
      SELECT ur.user_id, u.email, u.name, ur.role
      FROM public.user_roles ur
      LEFT JOIN public.vione_users u ON u.id = ur.user_id
    `);
    console.log('--- PUBLIC.USER_ROLES ---');
    console.table(roles.rows);

    const memberships = await pool.query(`
      SELECT m.user_id, u.email, m.role, m.executive_role, m.department
      FROM public.memberships m
      LEFT JOIN public.vione_users u ON u.id = m.user_id
    `);
    console.log('--- PUBLIC.MEMBERSHIPS ---');
    console.table(memberships.rows);

    const vUsers = await pool.query(`
      SELECT id, email, username, name, password
      FROM public.vione_users
    `);
    console.log('--- PUBLIC.VIONE_USERS ---');
    console.table(vUsers.rows.map(u => ({ id: u.id, email: u.email, username: u.username, name: u.name, hash: u.password?.slice(0, 15) })));

    const members = await pool.query(`
      SELECT id, code, name, email, phone, executive_role, department, company_name, user_id
      FROM public.members
    `);
    console.log('--- PUBLIC.MEMBERS ---');
    console.table(members.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
