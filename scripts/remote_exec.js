const { Client } = require('C:/Users/vumik/.gemini/antigravity-ide/brain/e663e894-eebb-440a-b4b7-9dd96c869c2b/scratch/node_modules/ssh2');

function runRemote(cmd) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      conn.exec(cmd, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }
        let out = '';
        let errOut = '';
        stream.on('close', (code) => {
          conn.end();
          resolve({ code, out, errOut });
        }).on('data', d => {
          out += d.toString();
          process.stdout.write(d);
        }).stderr.on('data', d => {
          errOut += d.toString();
          process.stderr.write(d);
        });
      });
    }).on('error', reject).connect({
      host: '14.225.217.232',
      port: 22,
      username: 'root',
      password: '1T4dTddMh0tbzFwBCIlu',
    });
  });
}

async function main() {
  const cmd = process.argv[2] || `
    echo "=== DOCKER CONTAINERS ==="
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo "=== CRM BACKEND ENV ==="
    docker exec crm-backend-prod env | grep -E "DATABASE_URL|APP_SCOPE|PORT"
    echo "=== CEO1983 BACKEND ENV ==="
    docker exec ceo1983-backend-prod env | grep -E "DATABASE_URL|APP_SCOPE|PORT"
  `;
  try {
    await runRemote(cmd);
  } catch (err) {
    console.error('SSH Error:', err);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runRemote };
