const { Client } = require('C:/Users/vumik/.gemini/antigravity-ide/brain/e663e894-eebb-440a-b4b7-9dd96c869c2b/scratch/node_modules/ssh2');

async function main() {
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect({
      host: '14.225.217.232',
      port: 22,
      username: 'root',
      password: '1T4dTddMh0tbzFwBCIlu',
    });
  });

  console.log('=== SEARCHING EVENTS ERROR IN crm-backend-prod: ===');
  await new Promise((resolve, reject) => {
    conn.exec('docker logs --tail 500 crm-backend-prod | grep -E -i "events|createEvent|insert into public.events" | tail -n 30', (err, stream) => {
      if (err) return reject(err);
      stream.on('close', resolve).on('data', d => process.stdout.write(d)).stderr.on('data', d => process.stderr.write(d));
    });
  });

  console.log('\n=== SEARCHING EVENTS ERROR IN ceo1983-backend-prod: ===');
  await new Promise((resolve, reject) => {
    conn.exec('docker logs --tail 500 ceo1983-backend-prod | grep -E -i "events|createEvent|insert into public.events" | tail -n 30', (err, stream) => {
      if (err) return reject(err);
      stream.on('close', resolve).on('data', d => process.stdout.write(d)).stderr.on('data', d => process.stderr.write(d));
    });
  });

  conn.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
