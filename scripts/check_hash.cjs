const bcrypt = require('bcrypt');
const hash = '$2b$10$QQnxHAPO9GDEQjLGIJpQxODqMxIy8hkCU8ay3dwrofYyYdnCtgUpG';
const candidates = [
  'admin', 'admin123', 'admin@123', 'Admin@123', 'Admin123', 'Admin@123456',
  '123456', '12345678', 'password', 'Password123', 'ceo1983', 'CEO1983', 'ceo1983@',
  'Ceo1983@2026', 'Ceo1983@2025', 'Ceo1983@123', 'viconnect', 'viconnect123',
  'connect', 'connect123', 'admin@connect.vn', 'secret', 'super-secret-jwt-key',
  'admin@ceo1983.vn', '123456aA@', 'Admin@2026', 'Admin@2025', 'Admin@2024',
  'Viconnect@123', 'Viconnect@2026', 'vumikasa', 'vumikasa6', 'vupv090120',
  '12345678aA@', '123456789', 'admin2026', 'admin2025', 'admin2024',
  '123@123', '123456@', '12345678@', 'CEO1983@2026', '123456Aa@', '123456a@',
  'HanoiBA@1983', 'Ceo1983', 'ceo1983.com', 'hanoiba'
];
for (const c of candidates) {
  if (bcrypt.compareSync(c, hash)) {
    console.log('MATCH FOUND:', c);
    process.exit(0);
  }
}
console.log('No match among candidates');
