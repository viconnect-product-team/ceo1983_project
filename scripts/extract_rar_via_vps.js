const fs = require('fs');
const path = require('path');
const { Client } = require('C:/Users/vumik/.gemini/antigravity-ide/brain/e663e894-eebb-440a-b4b7-9dd96c869c2b/scratch/node_modules/ssh2');

const rarLocalPath = 'C:/Users/vumik/Downloads/mau-file-excel-thu-chi-so-quy-noi-bo_024037.rar';
const remoteRarPath = '/tmp/mau_so_quy.rar';
const remoteExtractDir = '/tmp/mau_so_quy_extracted';
const localDestDir = 'C:/Users/vumik/Downloads/mau-file-excel-thu-chi-so-quy-noi-bo_024037';

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
  console.log('Connected to VPS.');

  // Step 1: Install p7zip-full if not present
  console.log('Ensuring 7z is installed on VPS...');
  await new Promise((resolve, reject) => {
    conn.exec('which 7z || apt-get update && apt-get install -y p7zip-full unrar', (err, stream) => {
      if (err) return reject(err);
      stream.on('close', resolve).on('data', d => process.stdout.write(d)).stderr.on('data', d => process.stderr.write(d));
    });
  });

  // Step 2: Upload rar via SFTP
  console.log('Uploading rar to VPS via SFTP...');
  await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const readStream = fs.createReadStream(rarLocalPath);
      const writeStream = sftp.createWriteStream(remoteRarPath);
      writeStream.on('close', () => {
        console.log('Uploaded successfully.');
        resolve();
      });
      writeStream.on('error', reject);
      readStream.pipe(writeStream);
    });
  });

  // Step 3: Extract on VPS
  console.log('Extracting archive on VPS...');
  await new Promise((resolve, reject) => {
    conn.exec(`rm -rf ${remoteExtractDir} && mkdir -p ${remoteExtractDir} && 7z x -y ${remoteRarPath} -o${remoteExtractDir}`, (err, stream) => {
      if (err) return reject(err);
      stream.on('close', resolve).on('data', d => process.stdout.write(d)).stderr.on('data', d => process.stderr.write(d));
    });
  });

  // Step 4: List extracted files
  let extractedFileList = [];
  await new Promise((resolve, reject) => {
    conn.exec(`find "${remoteExtractDir}" -type f`, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream.on('close', () => {
        extractedFileList = out.trim().split('\n').filter(Boolean);
        resolve();
      }).on('data', d => out += d.toString());
    });
  });
  console.log('Extracted files on VPS:', extractedFileList);

  // Step 5: Download extracted files to localDestDir
  if (!fs.existsSync(localDestDir)) {
    fs.mkdirSync(localDestDir, { recursive: true });
  }

  for (const remoteFile of extractedFileList) {
    const relName = path.relative(remoteExtractDir, remoteFile);
    const localTarget = path.join(localDestDir, relName);
    const localTargetDir = path.dirname(localTarget);
    if (!fs.existsSync(localTargetDir)) {
      fs.mkdirSync(localTargetDir, { recursive: true });
    }
    console.log(`Downloading ${relName} to ${localTarget}...`);
    await new Promise((resolve, reject) => {
      conn.sftp((err, sftp) => {
        if (err) return reject(err);
        const readStream = sftp.createReadStream(remoteFile);
        const writeStream = fs.createWriteStream(localTarget);
        writeStream.on('close', resolve);
        writeStream.on('error', reject);
        readStream.pipe(writeStream);
      });
    });
  }

  console.log('Done downloading all extracted files to:', localDestDir);
  conn.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
