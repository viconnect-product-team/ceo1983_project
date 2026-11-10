const { execSync } = require('child_process');
const fs = require('fs');

const pins = [
  '1116189088939047069',
  '1126533294319507400',
  '1116189088942752029',
  '1108378158348955419',
  '1116189088941957181'
];

for (const id of pins) {
  try {
    const cmd = `curl.exe -s -L "https://www.pinterest.com/pin/${id}/" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)"`;
    const html = execSync(cmd, { maxBuffer: 15 * 1024 * 1024 }).toString();
    
    // Extract image URL from either preload link or og:image meta tag
    let img = null;
    const preloadMatch = html.match(/id="pin-image-preload"[^>]*href="([^"]+)"/) || html.match(/href="([^"]+)"[^>]*id="pin-image-preload"/);
    if (preloadMatch) {
      img = preloadMatch[1];
    } else {
      const ogMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/) || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/);
      if (ogMatch) img = ogMatch[1];
    }
    
    let title = null;
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) title = titleMatch[1];

    let desc = null;
    const descMatch = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/) || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:description"/);
    if (descMatch) desc = descMatch[1];

    console.log(JSON.stringify({ id, title, img, desc }, null, 2));

    if (img) {
      const dest = `apps/ceo1983_app_fe/public/pinterest-pin-${id}.jpg`;
      execSync(`curl.exe -s -L "${img}" -o "${dest}"`);
      console.log(`Saved image to ${dest}`);
    }
  } catch (err) {
    console.error('Error for ' + id + ':', err.message);
  }
}
