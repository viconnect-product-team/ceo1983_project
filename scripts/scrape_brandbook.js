const fs = require('fs');

async function scrapePage(url, filename) {
  console.log('Fetching:', url);
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  fs.writeFileSync(filename, html, 'utf8');

  const links = [];
  const linkMatches = html.matchAll(/href=["'](https?:\/\/ceo1983\.brandbook\.vn\/[^"']*)["']/g);
  for (const match of linkMatches) {
    if (!links.includes(match[1])) links.push(match[1]);
  }

  const text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                   .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                   .replace(/<[^>]+>/g, ' ')
                   .replace(/\s+/g, ' ');

  return { links, text };
}

async function main() {
  const nenTang = await scrapePage('https://ceo1983.brandbook.vn/nen-tang-thuong-hieu/', 'scripts/brandbook_nen_tang.html');
  console.log('\n--- NEN TANG THUONG HIEU LINKS ---');
  nenTang.links.forEach(l => console.log(l));

  console.log('\n--- NEN TANG THUONG HIEU TEXT ---');
  console.log(nenTang.text.slice(0, 4000));
}

main().catch(console.error);

