param(
    [string]$ServerIp = "14.225.217.232",
    [string]$ServerUser = "root"
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " ĐẨY BẢN BUILD MỚI NHẤT LÊN VPS (KHÔNG PHỤ THUỘC GITHUB ACTIONS)" -ForegroundColor Green
Write-Host " Máy chủ: $ServerUser@$ServerIp" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Đảm bảo file nén đã sẵn sàng
if (-not (Test-Path "fe-output.tar.gz")) {
    Write-Host ">>> Đang nén Frontend bundle..." -ForegroundColor Yellow
    Push-Location apps/ceo1983_app_fe
    tar -czf ../../fe-output.tar.gz .output
    Pop-Location
}
if (-not (Test-Path "be-dist.tar.gz")) {
    Write-Host ">>> Đang nén Backend dist..." -ForegroundColor Yellow
    Push-Location apps/ceo1983_app_be
    tar -czf ../../be-dist.tar.gz dist
    Pop-Location
}

# 2. Upload file sang VPS
Write-Host "`n>>> [1/2] Đang tải bản build sang máy chủ $ServerIp..." -ForegroundColor Yellow
Write-Host "(Nếu terminal yêu cầu mật khẩu, hãy nhập mật khẩu root của VPS $ServerIp)" -ForegroundColor DarkGray
scp fe-output.tar.gz be-dist.tar.gz "${ServerUser}@${ServerIp}:/root/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[LỖI] Tải file lên VPS thất bại. Vui lòng kiểm tra lại kết nối mạng hoặc mật khẩu." -ForegroundColor Red
    exit 1
}

# 3. Kích hoạt cập nhật trên VPS
Write-Host "`n>>> [2/2] Đang nạp mã nguồn vào các Container và khởi động lại..." -ForegroundColor Yellow
$remoteScript = @'
set -e
echo ">>> [1/4] Giải nén bundle trên máy chủ..."
tar -xzf /root/fe-output.tar.gz -C /root/
tar -xzf /root/be-dist.tar.gz -C /root/

echo ">>> [2/4] Nạp Frontend vào container Mobile và CRM..."
docker cp /root/.output/. ceo1983-frontend-prod:/app/apps/ceo1983_app_fe/.output/ 2>/dev/null || true
docker cp /root/.output/. crm-frontend-prod:/app/apps/ceo1983_app_fe/.output/ 2>/dev/null || true

echo ">>> [3/4] Nạp Backend vào container..."
docker cp /root/dist/. ceo1983-backend-prod:/app/apps/ceo1983_app_be/dist/ 2>/dev/null || true
docker cp /root/dist/. crm-backend-prod:/app/apps/ceo1983_app_be/dist/ 2>/dev/null || true

echo ">>> [4/4] Khởi động lại các container..."
docker restart ceo1983-frontend-prod crm-frontend-prod ceo1983-backend-prod crm-backend-prod 2>/dev/null || true

echo ">>> Dọn dẹp tệp tạm..."
rm -rf /root/.output /root/dist /root/fe-output.tar.gz /root/be-dist.tar.gz

echo "=========================================================="
echo " ĐÃ CẬP NHẬT THÀNH CÔNG GIAO DIỆN VÀ TÍNH NĂNG MỚI NHẤT!"
echo " - Mobile Subdomain : https://ceo1983.viconnect.vn"
echo " - Web CRM Subdomain: https://crm.ceo1983.viconnect.vn"
echo "=========================================================="
'@

ssh "${ServerUser}@${ServerIp}" $remoteScript

