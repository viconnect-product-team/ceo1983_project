#!/bin/bash
set -e

cd /root/ssl-proxy 2>/dev/null || cd /root

# =========================================================================
# SCRIPT THIẾT LẬP NGINX SSL REVERSE PROXY & CẤP CHỨNG CHỈ LET'S ENCRYPT
# Tên miền: crm.ceo1983.viconnect.vn & ceo1983.viconnect.vn
# Máy chủ: 14.225.217.232
# =========================================================================

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

# 4. Khởi động lại container Nginx Proxy (nội bộ port 5443/5444)
echo "[Docker] Đảm bảo mạng ceo1983-network và khởi tạo container ceo1983-ssl-proxy..."
docker network create ceo1983-network 2>/dev/null || true
if [ -f /root/ssl-proxy/docker-compose.ssl.yml ]; then
    docker compose -f /root/ssl-proxy/docker-compose.ssl.yml config --quiet 2>/dev/null || true
    docker compose -f /root/ssl-proxy/docker-compose.ssl.yml up -d --no-deps --force-recreate ssl-reverse-proxy 2>/dev/null || true
fi

# Tạm ngắt exit on error để quy trình cấp SSL luôn chạy tiếp
set +e

# 5. Cấu hình Nginx chính (Host Nginx) trên Ubuntu VPS & Cấp phát chứng chỉ Let's Encrypt
if command -v nginx >/dev/null 2>&1; then
    echo "========================================================================="
    echo "[Host Nginx] THIẾT LẬP REVERSE PROXY & SSL CA TRUSTED CHO 2 SUBDOMAIN"
    echo "========================================================================="
    
    mkdir -p /etc/nginx/ssl /var/www/certbot /root/ssl-proxy
    chmod -R 755 /var/www/certbot

    # Chuẩn bị chứng chỉ dự phòng nếu chưa có
    if [ ! -f /etc/nginx/ssl/ceo1983.crt ]; then
        if [ -f /root/ssl-proxy/server.crt ]; then
            cp -f /root/ssl-proxy/server.crt /etc/nginx/ssl/ceo1983.crt
            cp -f /root/ssl-proxy/server.key /etc/nginx/ssl/ceo1983.key
        else
            echo "[OpenSSL] Tạo chứng chỉ tạm thời..."
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout /etc/nginx/ssl/ceo1983.key -out /etc/nginx/ssl/ceo1983.crt \
                -subj "/C=VN/ST=Hanoi/L=Hanoi/O=CEO1983/CN=crm.ceo1983.viconnect.vn" 2>/dev/null || true
        fi
    fi
    chmod 644 /etc/nginx/ssl/ceo1983.* 2>/dev/null || true

    # Đảm bảo Certbot đã được cài đặt
    if ! command -v certbot >/dev/null 2>&1; then
        echo "[Certbot] Certbot chưa được cài đặt trên máy chủ. Đang tự động cài đặt..."
        export DEBIAN_FRONTEND=noninteractive
        apt-get update -y >/dev/null 2>&1 || true
        apt-get install -y certbot python3-certbot-nginx >/dev/null 2>&1 || true
    fi

    # Vô hiệu hóa default site gây xung đột port 80
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

    # BƯỚC A: Thiết lập Nginx cấu hình Port 80 hỗ trợ ACME Challenge & Check-in không lỗi
    echo "[Host Nginx] Bước A: Kích hoạt Nginx Port 80 phục vụ xác thực ACME Challenge..."
    cat << 'EOF_P80' > /etc/nginx/conf.d/ceo1983_subdomains.conf
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    server_name ceo1983.viconnect.vn crm.ceo1983.viconnect.vn app.ceo1983.vn crm.ceo1983.vn 14.225.217.232 localhost;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type "text/plain";
        allow all;
    }

    # Cho phép truy cập form checkin trực tiếp qua HTTP không chuyển hướng HTTPS
    location ^~ /checkin {
        proxy_pass http://127.0.0.1:5004;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ^~ /api/events/ {
        proxy_pass http://127.0.0.1:5005;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5005;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /assets/ {
        proxy_pass http://127.0.0.1:5004;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
EOF_P80

    if [ -d /etc/nginx/sites-available ]; then
        cp -f /etc/nginx/conf.d/ceo1983_subdomains.conf /etc/nginx/sites-available/ceo1983_subdomains.conf 2>/dev/null || true
        mkdir -p /etc/nginx/sites-enabled
        ln -sf /etc/nginx/sites-available/ceo1983_subdomains.conf /etc/nginx/sites-enabled/ 2>/dev/null || true
    fi

    # Tải lại Nginx để chuẩn bị nhận request xác thực từ Let's Encrypt
    if nginx -t 2>/dev/null; then
        systemctl reload nginx 2>/dev/null || systemctl restart nginx 2>/dev/null || true
    fi

    # BƯỚC B: Cấp phát chứng chỉ Let's Encrypt thật (CA Trusted)
    if command -v certbot >/dev/null 2>&1; then
        echo "[Certbot] Bước B: Yêu cầu Let's Encrypt cấp chứng chỉ CA Trusted cho crm.ceo1983.viconnect.vn & ceo1983.viconnect.vn..."
        
        # Thử cấp gộp cả 2 domain
        certbot certonly --webroot -w /var/www/certbot \
            -d crm.ceo1983.viconnect.vn -d ceo1983.viconnect.vn \
            --email admin@viconnect.vn --agree-tos --no-eff-email --non-interactive \
            --keep-until-expiring 2>&1 || true

        # Nếu chưa có file cert gộp, thử cấp riêng cho từng domain
        if [ ! -f /etc/letsencrypt/live/crm.ceo1983.viconnect.vn/fullchain.pem ] && [ ! -f /etc/letsencrypt/live/ceo1983.viconnect.vn/fullchain.pem ]; then
            echo "[Certbot] Cấp riêng chứng chỉ cho crm.ceo1983.viconnect.vn..."
            certbot certonly --webroot -w /var/www/certbot \
                -d crm.ceo1983.viconnect.vn \
                --email admin@viconnect.vn --agree-tos --no-eff-email --non-interactive \
                --keep-until-expiring 2>&1 || true

            echo "[Certbot] Cấp riêng chứng chỉ cho ceo1983.viconnect.vn..."
            certbot certonly --webroot -w /var/www/certbot \
                -d ceo1983.viconnect.vn \
                --email admin@viconnect.vn --agree-tos --no-eff-email --non-interactive \
                --keep-until-expiring 2>&1 || true
        fi
    fi

    # BƯỚC C: Xác định chứng chỉ SSL hợp lệ để cấu hình Nginx
    CRM_CERT="/etc/nginx/ssl/ceo1983.crt"
    CRM_KEY="/etc/nginx/ssl/ceo1983.key"
    APP_CERT="/etc/nginx/ssl/ceo1983.crt"
    APP_KEY="/etc/nginx/ssl/ceo1983.key"

    if [ -f /etc/letsencrypt/live/crm.ceo1983.viconnect.vn/fullchain.pem ]; then
        CRM_CERT="/etc/letsencrypt/live/crm.ceo1983.viconnect.vn/fullchain.pem"
        CRM_KEY="/etc/letsencrypt/live/crm.ceo1983.viconnect.vn/privkey.pem"
        echo "[SSL] ✓ Tìm thấy chứng chỉ Let's Encrypt cho CRM: $CRM_CERT"
    elif [ -f /etc/letsencrypt/live/ceo1983.viconnect.vn/fullchain.pem ]; then
        CRM_CERT="/etc/letsencrypt/live/ceo1983.viconnect.vn/fullchain.pem"
        CRM_KEY="/etc/letsencrypt/live/ceo1983.viconnect.vn/privkey.pem"
        echo "[SSL] ✓ Sử dụng chứng chỉ Let's Encrypt dùng chung cho CRM: $CRM_CERT"
    fi

    if [ -f /etc/letsencrypt/live/ceo1983.viconnect.vn/fullchain.pem ]; then
        APP_CERT="/etc/letsencrypt/live/ceo1983.viconnect.vn/fullchain.pem"
        APP_KEY="/etc/letsencrypt/live/ceo1983.viconnect.vn/privkey.pem"
        echo "[SSL] ✓ Tìm thấy chứng chỉ Let's Encrypt cho Mobile App: $APP_CERT"
    elif [ -f /etc/letsencrypt/live/crm.ceo1983.viconnect.vn/fullchain.pem ]; then
        APP_CERT="/etc/letsencrypt/live/crm.ceo1983.viconnect.vn/fullchain.pem"
        APP_KEY="/etc/letsencrypt/live/crm.ceo1983.viconnect.vn/privkey.pem"
        echo "[SSL] ✓ Sử dụng chứng chỉ Let's Encrypt dùng chung cho Mobile App: $APP_CERT"
    fi

    # BƯỚC D: Đồng bộ chứng chỉ thật sang container Docker ceo1983-ssl-proxy
    if [ "$CRM_CERT" != "/etc/nginx/ssl/ceo1983.crt" ]; then
        cp -f "$CRM_CERT" /root/ssl-proxy/server.crt 2>/dev/null || true
        cp -f "$CRM_KEY" /root/ssl-proxy/server.key 2>/dev/null || true
        docker restart ceo1983-ssl-proxy 2>/dev/null || true
    fi

    # BƯỚC E: Viết cấu hình Nginx hoàn chỉnh (Port 80 + Port 443 HTTPS cho cả 2 Subdomains)
    echo "[Host Nginx] Bước E: Cập nhật cấu hình Nginx Reverse Proxy chính thức..."
    cat << EOF > /etc/nginx/conf.d/ceo1983_subdomains.conf
map \$http_upgrade \$connection_upgrade {
    default upgrade;
    ''      close;
}

# 0. HTTP PORT 80
server {
    listen 80;
    server_name ceo1983.viconnect.vn crm.ceo1983.viconnect.vn app.ceo1983.vn crm.ceo1983.vn 14.225.217.232 localhost;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type "text/plain";
        allow all;
    }

    # Bỏ qua ép buộc HTTPS đối với form checkin để Zalo và mọi thiết bị quét QR ăn ngay
    location ^~ /checkin {
        proxy_pass http://127.0.0.1:5004;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location ^~ /api/events/ {
        proxy_pass http://127.0.0.1:5005;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5005;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /assets/ {
        proxy_pass http://127.0.0.1:5004;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

# 1. Web CRM Hiệp Hội: https://crm.ceo1983.viconnect.vn
server {
    listen 443 ssl http2;
    server_name crm.ceo1983.viconnect.vn crm.ceo1983.vn;

    ssl_certificate $CRM_CERT;
    ssl_certificate_key $CRM_KEY;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 50M;

    location = /sw.js {
        proxy_pass http://127.0.0.1:5004;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
    }

    location / {
        proxy_pass http://127.0.0.1:5004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
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
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_redirect off;
        proxy_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    location ^~ /socket.io {
        proxy_pass http://127.0.0.1:5005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_redirect off;
        proxy_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}

# 2. Mobile App CEO 1983: https://ceo1983.viconnect.vn
server {
    listen 443 ssl http2;
    server_name ceo1983.viconnect.vn app.ceo1983.vn;

    ssl_certificate $APP_CERT;
    ssl_certificate_key $APP_KEY;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 50M;

    location = /sw.js {
        proxy_pass http://127.0.0.1:5002;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
    }

    location / {
        proxy_pass http://127.0.0.1:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
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
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_redirect off;
        proxy_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    location ^~ /socket.io {
        proxy_pass http://127.0.0.1:5003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_redirect off;
        proxy_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
EOF

    # Đồng bộ sang cả conf.d và sites-enabled
    if [ -d /etc/nginx/sites-available ]; then
        cp -f /etc/nginx/conf.d/ceo1983_subdomains.conf /etc/nginx/sites-available/ceo1983_subdomains.conf 2>/dev/null || true
        mkdir -p /etc/nginx/sites-enabled
        ln -sf /etc/nginx/sites-available/ceo1983_subdomains.conf /etc/nginx/sites-enabled/ 2>/dev/null || true
        
        # Xóa bỏ các cấu hình cũ có thể gây xung đột tên miền trong sites-enabled
        for f in /etc/nginx/sites-enabled/*; do
            if [ -f "$f" ] || [ -L "$f" ]; then
                target_file=$(readlink -f "$f" 2>/dev/null || echo "$f")
                if [ "$target_file" != "/etc/nginx/conf.d/ceo1983_subdomains.conf" ] && [ "$target_file" != "/etc/nginx/sites-available/ceo1983_subdomains.conf" ]; then
                    if grep -rq "crm.ceo1983.viconnect.vn" "$f" 2>/dev/null || grep -rq "ceo1983.viconnect.vn" "$f" 2>/dev/null || [ "$(basename "$f")" = "default" ]; then
                        echo "[Host Nginx] Vô hiệu hóa cấu hình cũ gây xung đột: $f"
                        rm -f "$f" 2>/dev/null || true
                    fi
                fi
            fi
        done
    fi

    # Tự động khắc phục xung đột directive map nếu có
    if ! nginx -t 2>/dev/null; then
        echo "[Host Nginx] Tinh chỉnh map directive để tương thích cú pháp Nginx..."
        sed -i '/map \$http_upgrade/,/}/d' /etc/nginx/conf.d/ceo1983_subdomains.conf 2>/dev/null || true
        sed -i 's/\$connection_upgrade/"upgrade"/g' /etc/nginx/conf.d/ceo1983_subdomains.conf 2>/dev/null || true
        if [ -f /etc/nginx/sites-available/ceo1983_subdomains.conf ]; then
            cp -f /etc/nginx/conf.d/ceo1983_subdomains.conf /etc/nginx/sites-available/ceo1983_subdomains.conf 2>/dev/null || true
        fi
    fi

    # Kiểm tra tính hợp lệ trước khi reload
    if nginx -t 2>/dev/null; then
        echo "[Host Nginx] Cấu hình Nginx hợp lệ. Đang tải lại Nginx..."
        systemctl reload nginx 2>/dev/null || systemctl restart nginx 2>/dev/null || true
    else
        echo "[Host Nginx Cảnh Báo] Chi tiết kiểm tra Nginx:"
        nginx -t || true
    fi

    # Thiết lập Cron tự động gia hạn chứng chỉ Let's Encrypt mỗi ngày
    cat << 'CRON_EOF' > /etc/cron.d/certbot-renew
0 3 * * * root certbot renew --quiet --deploy-hook "systemctl reload nginx"
CRON_EOF
    chmod 644 /etc/cron.d/certbot-renew 2>/dev/null || true
fi

echo "========================================================================="
echo "HOÀN TẤT CẤU HÌNH NGINX & SSL!"
echo "1. Web CRM Hiệp Hội: https://crm.ceo1983.viconnect.vn"
echo "2. Mobile App CEO 1983: https://ceo1983.viconnect.vn"
echo "3. Form Check-in QR : http://crm.ceo1983.viconnect.vn/checkin/ (Bypass SSL)"
echo "========================================================================="
