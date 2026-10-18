const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Client } = require('C:/Users/vumik/.gemini/antigravity-ide/brain/e663e894-eebb-440a-b4b7-9dd96c869c2b/scratch/node_modules/ssh2');

const remoteZip = '/tmp/mau_so_quy.zip';
const localZip = 'C:/Users/vumik/Downloads/mau_so_quy.zip';
const localDestDir = 'C:/Users/vumik/Downloads';

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

  console.log('Downloading zip via SFTP...');
  await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const readStream = sftp.createReadStream(remoteZip);
      const writeStream = fs.createWriteStream(localZip);
      writeStream.on('close', resolve);
      writeStream.on('error', reject);
      readStream.pipe(writeStream);
    });
  });
  conn.end();

  console.log('Zip downloaded to:', localZip);
  console.log('Extracting to:', localDestDir);
  execSync(`powershell -Command "Expand-Archive -Path '${localZip}' -DestinationPath '${localDestDir}' -Force"`);
  console.log('Extraction complete! Files in destination:');
  const targetDir = path.join(localDestDir, 'Mẫu file Excel thu chi sổ quỹ nội bộ');
  if (fs.existsSync(targetDir)) {
    console.log(fs.readdirSync(targetDir));
  } else {
    console.log('Target dir not found, checking:', localDestDir);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
