const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/vione_app?sslmode=disable'
});

async function main() {
  try {
    const execMembers = await pool.query(`
      SELECT id, code, name, email, phone, executive_role, department, company_name, user_id
      FROM members 
      WHERE (executive_role IS NOT NULL AND executive_role != '')
         OR (department IS NOT NULL AND department != '')
      ORDER BY code ASC
    `);
    console.log('--- ALL EXEC / DEPT MEMBERS IN DB ---');
    console.table(execMembers.rows);

    const allMembers = await pool.query(`
      SELECT code, name, email, executive_role, department, company_name
      FROM members
      WHERE name ILIKE '%Thắng%' OR name ILIKE '%Tuấn%' OR name ILIKE '%Việt%' OR name ILIKE '%Long%' OR executive_role ILIKE '%chủ tịch%' OR code IN ('M1983-000', 'M1983-001', 'M1983-002', 'M1983-003', 'M1983-004', 'M1983-005', 'M1983-006')
      ORDER BY code ASC
    `);
    console.log('--- FOUND LEADERS BY NAME OR CODE ---');
    console.table(allMembers.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
