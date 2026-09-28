const { Client } = require('pg');
const crypto = require('crypto');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable';

async function run() {
  const c = new Client({ connectionString: DB_URL });
  await c.connect();

  const userId = '65d29757-f55e-4c4d-9280-54cd2f0358d4'; // Vũ Phạm
  const now = new Date();

  console.log('Testing share-link logic for user:', userId);

  try {
    const existingRows = await c.query('SELECT id FROM public.business_identities WHERE owner_user_id = $1::uuid LIMIT 1', [userId]);
    let identityId;
    if (existingRows.rows.length === 0) {
      identityId = crypto.randomUUID();
      console.log('Inserting new business_identity with id:', identityId);
      await c.query(
        "INSERT INTO public.business_identities (id, owner_user_id, status, created_at, updated_at) VALUES ($1::uuid, $2::uuid, 'active', $3, $4)",
        [identityId, userId, now, now]
      );
    } else {
      identityId = existingRows.rows[0].id;
      console.log('Found existing identityId:', identityId);
    }

    const links = await c.query("SELECT * FROM public.identity_share_links WHERE owner_user_id = $1::uuid AND status = 'active' ORDER BY created_at DESC LIMIT 1", [userId]);
    console.log('Links found:', links.rows);

    if (links.rows.length === 0) {
      const newLinkToken = crypto.randomBytes(32).toString('hex');
      const linkId = crypto.randomUUID();
      console.log('Inserting into identity_share_links:', { linkId, identityId, userId, newLinkToken });
      await c.query(
        "INSERT INTO public.identity_share_links (id, identity_id, owner_user_id, public_token, status, created_at) VALUES ($1::uuid, $2::uuid, $3::uuid, $4, 'active', $5)",
        [linkId, identityId, userId, newLinkToken, now]
      );
      console.log('Inserted successfully!');
    }
  } catch (err) {
    console.error('ERROR in share-link simulation:', err);
  }

  // Bây giờ test upsertMyIdentity
  console.log('\nTesting upsertMyIdentity logic...');
  try {
    const input = {
      displayName: 'Vũ Phạm',
      address: 'Số 123 Phố Trần Duy Hưng, Cầu Giấy',
      city: 'Hà Nội',
      bio: 'Tiểu sử test',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
    };

    const existingRows = await c.query('SELECT * FROM public.business_identities WHERE owner_user_id = $1::uuid LIMIT 1', [userId]);
    if (existingRows.rows.length === 0) {
      const id = crypto.randomUUID();
      await c.query(`
        INSERT INTO public.business_identities (
          id, owner_user_id, display_name, headline, job_title, company_name, bio, avatar_url,
          primary_email, primary_phone, website, linkedin_url, address, city, country_code,
          preferred_locale, status, created_at, updated_at
        ) VALUES (
          $1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'active', $17, $18
        )
      `, [id, userId, input.displayName, null, null, null, input.bio, input.avatarUrl, null, null, null, null, input.address, input.city, null, null, now, now]);
      console.log('Inserted identity successfully');
    } else {
      const existing = existingRows.rows[0];
      await c.query(`
        UPDATE public.business_identities SET
          display_name = $1,
          bio = $2,
          avatar_url = $3,
          address = $4,
          city = $5,
          updated_at = $6
        WHERE id = $7::uuid
      `, [input.displayName, input.bio, input.avatarUrl, input.address, input.city, now, existing.id]);
      console.log('Updated identity successfully');
    }

    // UPDATE user_profiles
    console.log('Testing UPDATE user_profiles...');
    const upRes = await c.query(`
      UPDATE public.user_profiles SET
        avatar_url = $1
      WHERE user_id = $2::uuid
    `, [input.avatarUrl, userId]);
    console.log('Updated user_profiles rows affected:', upRes.rowCount);
  } catch (err) {
    console.error('ERROR in upsertMyIdentity simulation:', err);
  }

  await c.end();
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
