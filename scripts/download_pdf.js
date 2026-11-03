const fs = require('fs');

async function main() {
  const fileId = '1ulep5AaGF8RWponQlD1NyXqRsceNaSHG';
  const url = 'https://drive.usercontent.google.com/download?id=' + fileId + '&export=download&authuser=0';
  console.log('Downloading PDF...');
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const buffer = await res.arrayBuffer();
  fs.writeFileSync('scripts/EVENT_VISUAL_DESIGN_CEO1983.pdf', Buffer.from(buffer));
  console.log('Saved PDF successfully, size:', buffer.byteLength);
}

main().catch(console.error);

