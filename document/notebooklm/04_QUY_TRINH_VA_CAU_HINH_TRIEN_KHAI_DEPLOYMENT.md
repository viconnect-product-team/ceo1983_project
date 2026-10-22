# MỤC 4: QUY TRÌNH & CẤU HÌNH TRIỂN KHAI HẠ TẦNG (DEPLOYMENT SPEC)
*Tài liệu nguồn chuẩn hóa tải lên Google NotebookLM (Sổ tay: https://notebook.google.com/notebook/6ea9dec4-b8c1-4b4b-a077-d874b625bafd)*
*Phân hệ: DevOps, Triển khai Docker, Nginx Reverse Proxy, Ports & SSL*

---

## 1. SƠ ĐỒ ĐỊNH TUYẾN MẠNG & QUY HOẠCH CỔNG (PORT MATRIX)

```
                            MẠNG INTERNET (NGƯỜI DÙNG TRUY CẬP)
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
         app.ceo1983.vn             crm.ceo1983.vn             api.ceo1983.vn
      (Mobile Web Hội Viên)       (Web CRM Quản Trị)         (Backend API NestJS)
                    │                         │                         │
                    └─────────────────────────┼─────────────────────────┘
                                              ▼
                    ┌──────────────────────────────────────────────────┐
                    │      MÁY CHỦ VPS HOST (NGINX SYSTEM SERVICE)     │
                    │        - Cổng 80: Tự động Redirect sang HTTPS    │
                    │        - Cổng 443: Let's Encrypt SSL Offloading  │
                    └─────────────────────────┬────────────────────────┘
                                              │
                      REVERSE PROXY QUA LOCALHOST INTERNAL PORTS
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         ▼                                    ▼                                    ▼
┌──────────────────┐                 ┌──────────────────┐                 ┌──────────────────┐
│ CONTAINER MOBILE │                 │  CONTAINER CRM   │                 │ CONTAINER BACKEND│
│   (ceo1983)      │                 │     (crm)        │                 │     (api)        │
│ Port VPS: 5002   │                 │ Port VPS: 5005   │                 │ Port VPS: 5001   │
│ Nguồn:           │                 │ Nguồn:           │                 │ Nguồn:           │
│ deploy/ceo1983/  │                 │ deploy/crm/      │                 │ apps/ceo1983_... │
└──────────────────┘                 └──────────────────┘                 └──────────────────┘
```

---

## 2. BẢNG QUY HOẠCH CỔNG DỊCH VỤ

| Tên Dịch Vụ | Phân Hệ | Cổng Nội Bộ Container | Cổng Forward Trên VPS | Tên Miền / Domain | Thư Mục Triển Khai |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Nginx Reverse Proxy** | Toàn hệ thống | 80, 443 | **80, 443** (Nắm giữ bởi OS VPS) | Mọi subdomains | Host Nginx Config |
| **Backend API NestJS** | Core API | 3000 / 5001 | **5001** | `api.ceo1983.vn` | `apps/ceo1983_app_be` |
| **Mobile App CEO 1983**| Hội viên Mobile | 80 | **5002** | `app.ceo1983.vn` | `deploy/ceo1983/` |
| **Web CRM Quản Trị** | Admin / BĐH | 80 | **5005** | `crm.ceo1983.vn` | `deploy/crm/` |
| **Database PostgreSQL**| Core Database | 5432 | **5436** | `14.225.217.232` | Managed DB Host |

> [!CAUTION]
> **QUY TẮC SỐNG CÒN TRÁNH SẬP DỊCH VỤ VPS**:
> Cổng **80** và **443** trên máy chủ VPS do dịch vụ Nginx hệ điều hành (`systemd nginx.service`) phụ trách trực tiếp.
> Mọi tệp `docker-compose.yml` của các container phụ trợ **TUYỆT ĐỐI KHÔNG ĐƯỢC BIND CỔNG 80:80 HOẶC 443:443**.
> Chỉ bind các cổng proxy nội bộ `5001`, `5002`, `5005` hoặc các cổng test độc lập `5443`, `5444`, `5445`.

---

## 3. CẤU HÌNH TRIỂN KHAI PHÂN HỆ MOBILE APP (`deploy/ceo1983/`)

### Tệp `deploy/ceo1983/docker-compose.yml`:
```yaml
version: '3.8'

services:
  ceo1983-frontend:
    build:
      context: ../..
      dockerfile: deploy/ceo1983/Dockerfile.frontend
    container_name: ceo1983-frontend-prod
    restart: always
    ports:
      - "5002:80"
    environment:
      - NODE_ENV=production
      - VITE_APP_MODE=association
    networks:
      - ceo1983-network

networks:
  ceo1983-network:
    name: ceo1983-network
    external: true
```

### Quy Trình Deploy Mobile Nhanh:
1. Mở PowerShell tại máy phát triển hoặc server.
2. Điều hướng tới `deploy/ceo1983/`.
3. Chạy tập lệnh:
   ```powershell
   .\fast-deploy.ps1
   ```
4. Tập lệnh sẽ:
   - Kiểm tra mã nguồn và typecheck.
   - Nạp biến môi trường `.env.association`.
   - Build image Docker với `VITE_APP_MODE=association`.
   - Khởi động lại container `ceo1983-frontend-prod` trên cổng 5002.

---

## 4. CẤU HÌNH TRIỂN KHAI PHÂN HỆ WEB CRM QUẢN TRỊ (`deploy/crm/`)

### Tệp `deploy/crm/docker-compose.yml`:
```yaml
version: '3.8'

services:
  crm-frontend:
    build:
      context: ../..
      dockerfile: deploy/crm/Dockerfile.frontend
    container_name: crm-frontend-prod
    restart: always
    ports:
      - "5005:80"
    environment:
      - NODE_ENV=production
      - VITE_APP_MODE=crm
    networks:
      - ceo1983-network

networks:
  ceo1983-network:
    name: ceo1983-network
    external: true
```

### Quy Trình Deploy CRM Nhanh:
1. Mở PowerShell tại máy phát triển hoặc server.
2. Điều hướng tới `deploy/crm/`.
3. Chạy tập lệnh:
   ```powershell
   .\fast-deploy.ps1
   ```
4. Tập lệnh sẽ:
   - Nạp biến môi trường `.env.crm`.
   - Build image Docker với `VITE_APP_MODE=crm`.
   - Khởi động lại container `crm-frontend-prod` trên cổng 5005.

---

## 5. CẤU HÌNH NGINX REVERSE PROXY TRÊN MÁY CHỦ VPS (`/etc/nginx/sites-available/ceo1983.conf`)

```nginx
# 1. Reverse Proxy cho Mobile App Hội Viên
server {
    server_name app.ceo1983.vn;
    listen 80;
    return 301 https://$host$request_uri;
}

server {
    server_name app.ceo1983.vn;
    listen 443 ssl http2;

    ssl_certificate /etc/letsencrypt/live/ceo1983.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ceo1983.vn/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 2. Reverse Proxy cho Web CRM Quản Trị
server {
    server_name crm.ceo1983.vn;
    listen 80;
    return 301 https://$host$request_uri;
}

server {
    server_name crm.ceo1983.vn;
    listen 443 ssl http2;

    ssl_certificate /etc/letsencrypt/live/ceo1983.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ceo1983.vn/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 3. Reverse Proxy cho Backend NestJS API
server {
    server_name api.ceo1983.vn;
    listen 80;
    return 301 https://$host$request_uri;
}

server {
    server_name api.ceo1983.vn;
    listen 443 ssl http2;

    ssl_certificate /etc/letsencrypt/live/ceo1983.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ceo1983.vn/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Hỗ trợ WebSockets / Socket.IO
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```
