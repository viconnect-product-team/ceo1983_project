const https = require('https');

https.get('https://crt.sh/?q=%25ubos.vn&output=json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const names = new Set();
      json.forEach(item => {
        if (item.name_value) {
          item.name_value.split('\n').forEach(n => names.add(n.trim()));
        }
      });
      console.log('Subdomains found:', Array.from(names).filter(n => n.includes('ubos.vn')));
    } catch (e) {
      console.error(e.message);
    }
  });
}).on('error', err => console.error(err.message));
