const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== 1. DATABASE COUNTS ===');
  const assocs = await prisma.$queryRawUnsafe('SELECT count(*) FROM public.associations').catch(e => e.message);
  console.log('associations count:', assocs);

  const events = await prisma.$queryRawUnsafe('SELECT count(*) FROM public.events').catch(e => e.message);
  console.log('events count:', events);

  const members = await prisma.$queryRawUnsafe('SELECT count(*) FROM public.members').catch(e => e.message);
  console.log('members count:', members);

  const users = await prisma.$queryRawUnsafe('SELECT count(*) FROM public.vione_users').catch(e => e.message);
  console.log('vione_users count:', users);

  const sampleEvents = await prisma.$queryRawUnsafe('SELECT id, name, date, association_id FROM public.events LIMIT 5').catch(e => e.message);
  console.log('sample events:', sampleEvents);

  const sampleMembers = await prisma.$queryRawUnsafe('SELECT id, code, name, email, association_id, user_id FROM public.members LIMIT 5').catch(e => e.message);
  console.log('sample members:', sampleMembers);

  console.log('\n=== 2. PROBING HTTP / HTTPS ENDPOINTS ===');
  const urls = [
    'http://14.225.217.232:5004/api/events',
    'http://14.225.217.232:5005/api/events',
    'http://14.225.217.232:5004/api/members',
    'http://14.225.217.232:5005/api/members',
    'http://14.225.217.232:5002/api/events',
    'http://14.225.217.232:5003/api/events',
    'https://14.225.217.232:5443/api/events',
    'https://14.225.217.232:5443/api/members',
  ];

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  for (const url of urls) {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      const duration = Date.now() - start;
      const text = await res.text();
      let preview = text.slice(0, 100);
      try {
        const json = JSON.parse(text);
        preview = Array.isArray(json) ? `Array length ${json.length}` : (json?.message || 'JSON object');
      } catch {}
      console.log(`[${res.status}] ${url} in ${duration}ms -> ${preview}`);
    } catch (err) {
      const duration = Date.now() - start;
      console.log(`[ERR] ${url} in ${duration}ms -> ${err.message}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
