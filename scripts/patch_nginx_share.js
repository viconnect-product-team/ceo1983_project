const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../deploy/ssl/nginx.conf');
let content = fs.readFileSync(file, 'utf8');

const shareLocationBlock = `
        # Dynamic OpenGraph & Meta preview cho Chia sẻ Mạng Xã Hội (Facebook, Zalo, Telegram)
        location /share/ {
            set $upstream_ceo_share "http://ceo1983-backend-prod:4000";
            proxy_pass $upstream_ceo_share;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
        }
`;

// Thêm vào sau location /api/ trong server block 1 (ceo1983.viconnect.vn)
const target1 = `        location /api/ {
            set $upstream_ceo_api "http://ceo1983-backend-prod:4000";
            proxy_pass $upstream_ceo_api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
        }`;

if (content.includes(target1) && !content.includes('$upstream_ceo_share')) {
  content = content.replace(target1, target1 + '\n' + shareLocationBlock);
}

// Thêm vào server block 5 (port 5445 dev test) nếu có
const target2 = `        location /api/ {
            set $upstream_ceo_backup_api "http://ceo1983-backend-prod:4000";
            proxy_pass $upstream_ceo_backup_api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
        }`;

const shareLocationBlockBackup = `
        # Dynamic OpenGraph & Meta preview cho Chia sẻ Mạng Xã Hội
        location /share/ {
            set $upstream_ceo_backup_share "http://ceo1983-backend-prod:4000";
            proxy_pass $upstream_ceo_backup_share;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
        }
`;

if (content.includes(target2) && !content.includes('$upstream_ceo_backup_share')) {
  content = content.replace(target2, target2 + '\n' + shareLocationBlockBackup);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated deploy/ssl/nginx.conf with /share/ location proxy!');

