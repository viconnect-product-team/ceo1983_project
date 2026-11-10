const https = require('https');

const pins = [
  '1116189088939047069',
  '1126533294319507400',
  '1116189088942752029',
  '1108378158348955419',
  '1116189088941957181'
];

async function fetchPin(id) {
  return new Promise((resolve) => {
    const url = 'https://www.pinterest.com/pin/' + id + '/';
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const ogImageMatch = data.match(/property="og:image"\s+content="([^"]+)"/) || data.match(/content="([^"]+)"\s+property="og:image"/);
        const ogTitleMatch = data.match(/property="og:title"\s+content="([^"]+)"/) || data.match(/content="([^"]+)"\s+property="og:title"/);
        const ogDescMatch = data.match(/property="og:description"\s+content="([^"]+)"/) || data.match(/content="([^"]+)"\s+property="og:description"/);
        resolve({
          id,
          title: ogTitleMatch ? ogTitleMatch[1] : null,
          image: ogImageMatch ? ogImageMatch[1] : null,
          desc: ogDescMatch ? ogDescMatch[1] : null
        });
      });
    }).on('error', (err) => resolve({ id, error: err.message }));
  });
}

(async () => {
  for (const id of pins) {
    const res = await fetchPin(id);
    console.log(JSON.stringify(res));
  }
})();

