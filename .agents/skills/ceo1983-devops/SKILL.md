---
name: ceo1983-devops
description: Kỹ năng chuyên sâu về triển khai hạ tầng, Docker Compose, Nginx Reverse Proxy, cấu hình SSL và CI/CD tách biệt độc lập giữa Web CRM Quản trị và Mobile App CEO 1983.
---

# KỸ NĂNG TRIỂN KHAI HẠ TẦNG & DEVOPS CEO 1983

Kỹ năng này chịu trách nhiệm quản trị và thực thi các thao tác cấu hình máy chủ, đóng gói Docker, thiết lập Nginx Reverse Proxy, cấp phát chứng chỉ SSL và quy trình triển khai độc lập giữa hai phân hệ CRM và Mobile App.

---

## 1. Cấu Trúc Gói Triển Khai
Hệ thống duy trì 2 thư mục triển khai độc lập tại thư mục gốc:

```
deploy/
├── ceo1983/                # Phân hệ Mobile App CEO 1983 (Port 5002)
│   ├── .env.association    # Biến môi trường chế độ Hội viên Mobile
│   ├── .env.production     # Biến môi trường production
│   ├── Dockerfile.frontend # Dockerfile tối ưu Vite multi-stage build
│   ├── docker-compose.yml  # Mapping cổng 5002:80 ra VPS
│   ├── fast-deploy.ps1     # Script triển khai nhanh qua SSH / Local
│   └── README.md
├── crm/                    # Phân hệ Web CRM Quản trị (Port 5005)
│   ├── .env.crm            # Biến môi trường chế độ CRM Quản trị
│   ├── .env.production     # Biến môi trường production
│   ├── Dockerfile.frontend # Dockerfile tối ưu Vite multi-stage build
│   ├── docker-compose.yml  # Mapping cổng 5005:80 ra VPS
│   ├── fast-deploy.ps1     # Script triển khai nhanh qua SSH / Local
│   └── README.md
├── ssl/                    # Cấu hình Nginx & Chứng chỉ SSL
│   ├── nginx.conf          # Reverse proxy mẫu cho VPS
│   └── setup-ssl.sh        # Script Certbot Let's Encrypt
└── git-auto-deploy.sh      # Webhook tự động triển khai khi có commit (phía server)
```

---

## 2. Quy Tắc Hạ Tầng Bắt Buộc
1. **Cấm xung đột cổng 80 & 443 trên VPS**:
   - Dịch vụ Nginx của hệ điều hành VPS (`systemd nginx`) nắm giữ độc quyền cổng 80 và 443.
   - Các container Docker tuyệt đối KHÔNG cấu hình `80:80` hoặc `443:443`.
2. **Quy Hoạch Cổng Container**:
   - Backend API NestJS: Port `5001`
   - Mobile App CEO 1983: Port `5002`
   - Web CRM Quản trị: Port `5005`
   - Database PostgreSQL: Port `5436` (Host `14.225.217.232`)
3. **Quy Chuẩn Đường Dẫn Tuyệt Đối**:
   - Mọi lệnh copy thư mục triển khai phải dùng cờ `-a` và đường dẫn tuyệt đối (ví dụ `cp -a /root/deploy-cache/deploy/.../.`) để bảo toàn các tệp ẩn `.env.*`.

---

## 3. Quy Trình Triển Khai Nhanh (Fast Deployment Workflow)
Khi cần triển khai cập nhật lên server:
1. Chạy `npx tsc --noEmit` ở backend và frontend để bảo đảm 0 lỗi biên dịch.
2. Nếu deploy Mobile: Sử dụng `deploy/ceo1983/fast-deploy.ps1`.
3. Nếu deploy CRM: Sử dụng `deploy/crm/fast-deploy.ps1`.
4. Kiểm tra sức khỏe container bằng `docker ps` và kiểm tra log phản hồi.
