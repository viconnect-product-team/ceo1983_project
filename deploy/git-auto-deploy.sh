#!/bin/bash
# ==============================================================================
# SCRIPT TỰ ĐỘNG CẬP NHẬT & DEPLOY SUBDOMAINS TRỰC TIẾP TỪ GIT TRÊN SERVER VPS
# Máy chủ: 14.225.217.232
# Subdomains: https://ceo1983.viconnect.vn & https://crm.ceo1983.viconnect.vn
# ==============================================================================
set -e

REPO_DIR="/root/ceo1983_project"
BRANCH="${1:-main}"

echo "=========================================================================="
echo " [GIT AUTO DEPLOY] CẬP NHẬT MÃ NGUỒN TỪ NHÁNH: $BRANCH"
echo "=========================================================================="

if [ -d "$REPO_DIR/.git" ]; then
    echo ">>> [1/5] Kéo mã nguồn mới nhất từ Git..."
    cd "$REPO_DIR"
    git fetch origin "$BRANCH"
    git reset --hard "origin/$BRANCH"
else
    echo "Thư mục $REPO_DIR chưa có git repo. Đang sử dụng các thư mục deploy hiện có."
fi

echo ">>> [2/5] Đảm bảo mạng nội bộ ceo1983-network..."
docker network create ceo1983-network 2>/dev/null || true

echo ">>> [3/5] Khởi động lại container Mobile CEO 1983 (https://ceo1983.viconnect.vn)..."
cd /root/association
docker compose -f docker-compose.yml stop 2>/dev/null || true
docker rm -f ceo1983-frontend-prod ceo1983-backend-prod 2>/dev/null || true
docker compose -f docker-compose.yml up -d --force-recreate

echo ">>> [4/5] Khởi động lại container CRM Hiệp Hội (https://crm.ceo1983.viconnect.vn)..."
cd /root/crm
docker compose -f docker-compose.yml stop 2>/dev/null || true
docker rm -f crm-frontend-prod crm-backend-prod 2>/dev/null || true
docker compose -f docker-compose.yml up -d --force-recreate

echo ">>> [5/5] Tải lại Nginx SSL Reverse Proxy..."
cd /root/ssl-proxy
bash setup-ssl.sh

echo "=========================================================================="
echo " ĐÃ CẬP NHẬT SUBDOMAINS THÀNH CÔNG!"
echo " - Mobile Subdomain : https://ceo1983.viconnect.vn"
echo " - Web CRM Subdomain: https://crm.ceo1983.viconnect.vn"
echo " - Dev Link Mobile  : http://14.225.217.232:5002 | https://14.225.217.232:5444"
echo " - Dev Link CRM     : http://14.225.217.232:5004 | https://14.225.217.232:5443"
echo "=========================================================================="
