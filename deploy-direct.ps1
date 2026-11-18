param(
    [string]$ServerIp = "14.225.217.232",
    [string]$ServerUser = "root"
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " CAP NHAT BAN BUILD MOI LEN VPS 14.225.217.232" -ForegroundColor Green
Write-Host " May chu: $ServerUser@$ServerIp" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Dam bao file nen moi nhat duoc tao tu .output va dist hien tai
Write-Host ">>> [FE] Dang nen Frontend bundle moi nhat (.output)..." -ForegroundColor Yellow
Remove-Item -Path "fe-output.tar.gz" -Force -ErrorAction SilentlyContinue
Push-Location apps/ceo1983_app_fe
tar -czf ../../fe-output.tar.gz .output
Pop-Location

Write-Host ">>> [BE] Dang nen Backend dist moi nhat (dist)..." -ForegroundColor Yellow
Remove-Item -Path "be-dist.tar.gz" -Force -ErrorAction SilentlyContinue
Push-Location apps/ceo1983_app_be
tar -czf ../../be-dist.tar.gz dist
Pop-Location

# 2. Upload file sang VPS
Write-Host "`n>>> [1/2] Dang tai ban build sang may chu $ServerIp..." -ForegroundColor Yellow
Write-Host "(Neu terminal yeu cau mat khau, hay nhap mat khau root cua VPS $ServerIp)" -ForegroundColor DarkGray
scp fe-output.tar.gz be-dist.tar.gz "${ServerUser}@${ServerIp}:/root/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[LOI] Tai file len VPS that bai. Vui long kiem tra lai ket noi hoac mat khau." -ForegroundColor Red
    exit 1
}

# 3. Kich hoat cap nhat tren VPS
Write-Host "`n>>> [2/2] Dang nap ma nguon vao cac Container va khoi dong lai..." -ForegroundColor Yellow

$remoteScript = @'
set -e
echo ">>> [1/4] Giai nen bundle tren may chu..."
tar -xzf /root/fe-output.tar.gz -C /root/
tar -xzf /root/be-dist.tar.gz -C /root/

echo ">>> [2/4] Nap Frontend vao container Mobile va CRM..."
docker cp /root/.output/. ceo1983-frontend-prod:/app/apps/ceo1983_app_fe/.output/ 2>/dev/null || true
docker cp /root/.output/. crm-frontend-prod:/app/apps/ceo1983_app_fe/.output/ 2>/dev/null || true

echo ">>> [3/4] Nap Backend vao container..."
docker cp /root/dist/. ceo1983-backend-prod:/app/apps/ceo1983_app_be/dist/ 2>/dev/null || true
docker cp /root/dist/. crm-backend-prod:/app/apps/ceo1983_app_be/dist/ 2>/dev/null || true

echo ">>> [4/4] Khoi dong lai cac container..."
docker restart ceo1983-frontend-prod crm-frontend-prod ceo1983-backend-prod crm-backend-prod 2>/dev/null || true

echo ">>> Don dep tep tam..."
rm -rf /root/.output /root/dist /root/fe-output.tar.gz /root/be-dist.tar.gz

echo "=========================================================="
echo " CAP NHAT THANH CONG GIAO DIEN VA TINH NANG MOI NHAT!"
echo " - Mobile Subdomain : https://ceo1983.viconnect.vn"
echo " - Web CRM Subdomain: https://crm.ceo1983.viconnect.vn"
echo "=========================================================="
'@

$remoteScript | ssh "${ServerUser}@${ServerIp}" "bash -s"
