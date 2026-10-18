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

  await new Promise((resolve, reject) => {
    conn.exec('docker ps -a --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}\t{{.Status}}"', (err, stream) => {
      if (err) return reject(err);
      stream.on('close', resolve).on('data', d => process.stdout.write(d)).stderr.on('data', d => process.stderr.write(d));
    });
  });

  console.log('\n--- PM2 list: ---');
  await new Promise((resolve, reject) => {
    conn.exec('pm2 list || which pm2', (err, stream) => {
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
