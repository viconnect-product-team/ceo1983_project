const { Client } = require('pg');

async function migrateDb(dbName) {
  const url = `postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/${dbName}`;
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log(`=== Migrating DB: ${dbName} ===`);
    
    // members
    await client.query(`ALTER TABLE public.members ADD COLUMN IF NOT EXISTS company_logo_url text;`);
    await client.query(`ALTER TABLE public.members ADD COLUMN IF NOT EXISTS company_name text;`);
    console.log(`[${dbName}] Altered public.members (company_logo_url, company_name)`);

    // card_settings
    await client.query(`ALTER TABLE public.card_settings ADD COLUMN IF NOT EXISTS company_logo_url text;`);
    await client.query(`ALTER TABLE public.card_settings ADD COLUMN IF NOT EXISTS company_name text;`);
    console.log(`[${dbName}] Altered public.card_settings (company_logo_url, company_name)`);

    // user_profiles
    await client.query(`ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS company_logo_url text;`);
    console.log(`[${dbName}] Altered public.user_profiles (company_logo_url)`);

    // business_identities
    await client.query(`ALTER TABLE public.business_identities ADD COLUMN IF NOT EXISTS company_logo_url text;`);
    console.log(`[${dbName}] Altered public.business_identities (company_logo_url)`);

    await client.end();
    console.log(`[${dbName}] Migration successful!`);
  } catch (err) {
    console.error(`[${dbName}] Migration error:`, err.message);
  }
}

async function main() {
  await migrateDb('vione_app');
  await migrateDb('ceo1983_project');
}

main();
