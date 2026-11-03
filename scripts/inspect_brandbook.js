const fs = require('fs');

async function main() {
  const res = await fetch('https://ceo1983.brandbook.vn/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  fs.writeFileSync('scripts/brandbook_home.html', html, 'utf8');

  // Find all links
  const links = [];
  const linkMatches = html.matchAll(/href=["'](https?:\/\/ceo1983\.brandbook\.vn\/[^"']*)["']/g);
  for (const match of linkMatches) {
    if (!links.includes(match[1])) links.push(match[1]);
  }
  console.log('Internal links (' + links.length + '):');
  links.forEach(l => console.log(' - ' + l));

  // Find any text containing color/màu/bảng màu/color palette
  const textWithoutTags = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                              .replace(/<[^>]+>/g, ' ')
                              .replace(/\s+/g, ' ');

  console.log('\nText sample (first 2000 chars):');
  console.log(textWithoutTags.slice(0, 2000));
}

main().catch(console.error);

