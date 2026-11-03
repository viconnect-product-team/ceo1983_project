async function main() {
  const url = 'https://drive.google.com/drive/folders/1TI02JR4qvR-MO7zRnQuixeZrDgdXY-2J';
  console.log('Fetching Google Drive folder:', url);
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  const html = await res.text();
  console.log('Status:', res.status, 'Length:', html.length);
  const fs = require('fs');
  fs.writeFileSync('scripts/gdrive_folder.html', html, 'utf8');

  // Search for file names or titles in html
  const titles = html.match(/\[\"[^\"]+\.[a-zA-Z0-9]{3,4}\"/g);
  console.log('File titles found:', titles);
  
  // Search for any text like màu, theme, dark, light, brandbook, logo
  const matches = html.match(/[^"'{}\[\]\n\r]{3,80}(?:màu|theme|brand|logo|chuẩn|ceo1983)[^"'{}\[\]\n\r]{0,80}/gi);
  console.log('Keywords matches:', matches ? matches.slice(0, 30) : 'none');
}

main().catch(console.error);

