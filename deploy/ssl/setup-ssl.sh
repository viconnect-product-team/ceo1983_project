#!/bin/bash
set -e

cd /root/ssl-proxy

# 1. Mở các cổng trên UFW nếu có UFW
if command -v ufw >/dev/null 2>&1; then
    echo "[UFW] Mở cổng 80, 443, 5443, 5444 trên tường lửa Ubuntu..."
    ufw allow 80/tcp >/dev/null 2>&1 || true
    ufw allow 443/tcp >/dev/null 2>&1 || true
    ufw allow 5443/tcp >/dev/null 2>&1 || true
    ufw allow 5444/tcp >/dev/null 2>&1 || true
    ufw reload >/dev/null 2>&1 || true
fi

# 2. Mở cổng trên iptables
iptables -I INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || true
iptables -I INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || true
iptables -I INPUT -p tcp --dport 5443 -j ACCEPT 2>/dev/null || true
iptables -I INPUT -p tcp --dport 5444 -j ACCEPT 2>/dev/null || true

# 3. Chuẩn hóa tệp tin cấu hình (xóa bỏ \r nếu có)
sed -i 's/\r$//' nginx.conf docker-compose.ssl.yml 2>/dev/null || true

# 4. Khởi động lại container Nginx Proxy
echo "[Docker] Đảm bảo mạng ceo1983-network và khởi tạo container ceo1983-ssl-proxy..."
docker network create ceo1983-network 2>/dev/null || true
docker compose -f docker-compose.ssl.yml config --quiet
docker compose -f docker-compose.ssl.yml up -d --no-deps --force-recreate ssl-reverse-proxy

# 5. Đợi 2s để Nginx worker process ổn định
sleep 2

# 6. Kiểm tra trạng thái và logs
echo "--- TRẠNG THÁI NGINX SSL PROXY CONTAINER ---"
docker ps -a --filter name=ceo1983-ssl-proxy --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'

echo "--- NHẬT KÝ NGINX (LOGS) ---"
docker logs --tail 15 ceo1983-ssl-proxy 2>&1 || true

# Tạm ngắt exit on error để các lệnh kiểm thử curl không làm fail script deploy
set +e

# 7. Tự động đồng bộ và cấu hình Nginx chính (Host Nginx) trên Ubuntu VPS
if command -v nginx >/dev/null 2>&1; then
    echo "[Host Nginx] Thiết lập cấu hình Reverse Proxy cho 2 Subdomain trên máy chủ VPS..."
    mkdir -p /etc/nginx/ssl
    cp -f /root/ssl-proxy/server.crt /etc/nginx/ssl/ceo1983.crt 2>/dev/null || true
    cp -f /root/ssl-proxy/server.key /etc/nginx/ssl/ceo1983.key 2>/dev/null || true
    chmod 644 /etc/nginx/ssl/ceo1983.* 2>/dev/null || true

    SSL_CERT="/etc/nginx/ssl/ceo1983.crt"
    SSL_KEY="/etc/nginx/ssl/ceo1983.key"
    if [ -f /etc/letsencrypt/live/ceo1983.vn/fullchain.pem ]; then
        SSL_CERT="/etc/letsencrypt/live/ceo1983.vn/fullchain.pem"
        SSL_KEY="/etc/letsencrypt/live/ceo1983.vn/privkey.pem"
    elif [ -f /etc/letsencrypt/live/viconnect.vn/fullchain.pem ]; then
        SSL_CERT="/etc/letsencrypt/live/viconnect.vn/fullchain.pem"
        SSL_KEY="/etc/letsencrypt/live/viconnect.vn/privkey.pem"
    fi

    cat << EOF > /etc/nginx/conf.d/ceo1983_subdomains.conf
# =========================================================================
# REVERSE PROXY CHO 2 SUBDOMAIN CEO 1983 & CRM (TU DONG DONG BO)
# =========================================================================

map \$http_upgrade \$connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    server_name ceo1983.viconnect.vn crm.ceo1983.viconnect.vn app.ceo1983.vn crm.ceo1983.vn;
    return 301 https://\$host\$request_uri;
}

# 1. Web CRM Hiệp Hội: https://crm.ceo1983.viconnect.vn
server {
    listen 443 ssl http2;
    server_name crm.ceo1983.viconnect.vn crm.ceo1983.vn;

    ssl_certificate $SSL_CERT;
    ssl_certificate_key $SSL_KEY;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:5004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:5005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}

# 2. Mobile App CEO 1983: https://ceo1983.viconnect.vn
server {
    listen 443 ssl http2;
    server_name ceo1983.viconnect.vn app.ceo1983.vn;

    ssl_certificate $SSL_CERT;
    ssl_certificate_key $SSL_KEY;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:5003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
EOF

    # Dọn dẹp liên kết trùng lặp trong sites-enabled để không bị lỗi duplicate "map" directive
    rm -f /etc/nginx/sites-enabled/ceo1983_subdomains.conf /etc/nginx/sites-available/ceo1983_subdomains.conf 2>/dev/null || true

    # Kiểm tra tính hợp lệ trước khi reload
    if nginx -t 2>/dev/null; then
        echo "[Host Nginx] Cấu hình Nginx hợp lệ. Đang tải lại Nginx..."
        systemctl reload nginx 2>/dev/null || systemctl restart nginx 2>/dev/null || true
    else
        echo "[Host Nginx Cảnh Báo] Chi tiết kiểm tra Nginx:"
        nginx -t || true
    fi
fi

echo "--- TEST NỘI BỘ HTTP 5004 & 5002 (FRONTEND CONTAINERS) ---"
curl -s -I http://127.0.0.1:5004/ 2>&1 | head -n 5 || echo "Lỗi kết nối http 5004 (CRM Frontend)"
curl -s -I http://127.0.0.1:5002/ 2>&1 | head -n 5 || echo "Lỗi kết nối http 5002 (Mobile Frontend)"

echo "--- TEST NỘI BỘ HTTPS 443 (SUBDOMAINS) ---"
curl -k -s -I -H "Host: ceo1983.viconnect.vn" https://127.0.0.1:443/ 2>&1 | head -n 5 || echo "Lỗi kết nối https 443 ceo1983 nội bộ"
curl -k -s -I -H "Host: crm.ceo1983.viconnect.vn" https://127.0.0.1:443/ 2>&1 | head -n 5 || echo "Lỗi kết nối https 443 crm nội bộ"

echo "--- TEST NỘI BỘ HTTPS 5443 (WEB CRM & LANDING) ---"
curl -k -s -I https://127.0.0.1:5443/ 2>&1 | head -n 5 || echo "Lỗi kết nối https 5443 nội bộ"

echo "--- TEST NỘI BỘ HTTPS 5444 (APP HIỆP HỘI CEO 1983) ---"
curl -k -s -I https://127.0.0.1:5444/ 2>&1 | head -n 5 || echo "Lỗi kết nối https 5444 nội bộ"
