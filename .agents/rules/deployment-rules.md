# QUY CHUẨN TRIỂN KHAI HẠ TẦNG & DEVOPS (DEPLOYMENT RULES)
## HỆ THỐNG CLB DOANH NHÂN CEO 1983 (HANOIBA)
*Áp dụng độc quyền cho: Triển khai Docker, Nginx VPS, CI/CD và Cấu hình máy chủ*

---

## 1. PHÂN LẬP MÔI TRƯỜNG TRIỂN KHAI ĐỘC LẬP (SEPARATE DEPLOYMENTS)
Hệ thống được cấu hình phân tách thành 2 gói triển khai Frontend riêng biệt và 1 Backend API dùng chung:

### 1. Phân hệ Mobile App CEO 1983 (`deploy/ceo1983/`):
- **Mục đích**: Triển khai ứng dụng Web Di động cho Hội viên và đóng gói PWA / Native wrapper.
- **Biến môi trường**: `deploy/ceo1983/.env.association` và `.env.production`.
- **Cấu hình Docker**: `deploy/ceo1983/docker-compose.yml`, `Dockerfile.frontend`.
- **Cổng Container ánh xạ**: Cổng nội bộ container forward ra máy chủ VPS là **5002** (`5002:80`).
- **Domain truy cập**: `app.ceo1983.vn` hoặc subdomain chỉ định cho Mobile Hội viên.
- **Tập lệnh triển khai nhanh**: `deploy/ceo1983/fast-deploy.ps1`.

### 2. Phân hệ Web CRM Quản Trị (`deploy/crm/`):
- **Mục đích**: Triển khai cổng điều hành quản trị cho Ban Điều Hành, Ban Thư Ký và Admin.
- **Biến môi trường**: `deploy/crm/.env.crm` và `.env.production`.
- **Cấu hình Docker**: `deploy/crm/docker-compose.yml`, `Dockerfile.frontend`.
- **Cổng Container ánh xạ**: Cổng nội bộ container forward ra máy chủ VPS là **5005** (`5005:80`).
- **Domain truy cập**: `crm.ceo1983.vn` hoặc subdomain chỉ định cho CRM Quản trị.
- **Tập lệnh triển khai nhanh**: `deploy/crm/fast-deploy.ps1`.

### 3. Phân hệ Backend API NestJS (`apps/ceo1983_app_be`):
- **Cổng dịch vụ**: **5001** (hoặc 3000 mapped 5001 trên VPS).
- **Cơ sở dữ liệu**: PostgreSQL 15 trên `14.225.217.232:5436` (Database: `ceo1983_project`).

---

## 2. QUY CHUẨN NGINX VPS & CHỨNG CHỈ BẢO MẬT SSL
1. **Tránh Xung Đột Cổng Nginx VPS (VPS Reverse Proxy Integrity)**:
   - Cổng **80** và **443** trên máy chủ VPS do dịch vụ Nginx của hệ điều hành (`systemd nginx.service`) phụ trách trực tiếp.
   - Nginx máy chủ tiếp nhận request SSL từ người dùng bên ngoài và Reverse Proxy vào các container qua cổng nội bộ:
     - `app.ceo1983.vn` -> Reverse Proxy vào `http://127.0.0.1:5002`
     - `crm.ceo1983.vn` -> Reverse Proxy vào `http://127.0.0.1:5005`
     - `api.ceo1983.vn` -> Reverse Proxy vào `http://127.0.0.1:5001`
   - **CẤM TUYỆT ĐỐI**: Các file `docker-compose.yml` của container phụ trợ (ví dụ `ceo1983-ssl-proxy`, v.v.) TUYỆT ĐỐI KHÔNG bind cổng `80:80` hoặc `443:443` vì sẽ gây lỗi sập dịch vụ toàn VPS (`address already in use`).
2. **Cổng Test Dev Độc Lập**:
   - Chỉ được phép bind các cổng test dev độc lập nếu cần thiết (ví dụ: `5443`, `5444`, `5445`).
3. **Chứng Chỉ SSL Let's Encrypt**:
   - Sử dụng Certbot trên hệ điều hành máy chủ VPS để tự động gia hạn SSL cho các domain chính thức.

---

## 3. QUY TRÌNH THỰC THI TRIỂN KHAI (DEPLOY WORKFLOW)
1. **Kiểm Tra Typecheck Cục Bộ Trước Khi Deploy**:
   - Trước khi chạy script deploy hoặc build Docker image, BẮT BUỘC chạy `npx tsc --noEmit` ở cả `apps/ceo1983_app_be` và `apps/ceo1983_app_fe` để đảm bảo 0 lỗi biên dịch.
2. **Bảo Toàn Tệp Ẩn và Đường Dẫn Tuyệt Đối**:
   - Mọi lệnh copy thư mục deploy trên runner hoặc remote server phải sử dụng đường dẫn tuyệt đối chuẩn (ví dụ: `cp -a /root/deploy-cache/deploy/.../.`) nhằm bảo toàn CWD và giữ đầy đủ các file ẩn `.env.*`.
3. **Giám Sát Sau Triển Khai (Post-Deploy Health Check)**:
   - Kiểm tra container status: `docker ps | grep ceo1983`.
   - Kiểm tra log container: `docker logs --tail 50 <container_name>`.
   - Kiểm tra phản hồi HTTP 200 từ các endpoint sức khỏe.
