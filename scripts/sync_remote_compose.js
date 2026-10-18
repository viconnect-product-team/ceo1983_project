const { runRemote } = require('./remote_exec');
const fs = require('fs');

async function main() {
  const content = fs.readFileSync('deploy/crm/docker-compose.yml', 'utf8');
  const b64 = Buffer.from(content).toString('base64');
  const cmd = `echo "${b64}" | base64 -d > ~/crm/docker-compose.yml && cat ~/crm/docker-compose.yml`;
  const res = await runRemote(cmd);
  console.log('Result code:', res.code);
  console.log('Updated ~/crm/docker-compose.yml on server successfully!');
}

main().catch(console.error);
