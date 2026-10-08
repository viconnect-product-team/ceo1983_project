param (
    [switch]$SkipWebBuild,
    [switch]$InstallDeps,
    [switch]$EnableHttps = $true,
    [switch]$NoHttps
)

if ($NoHttps) { $EnableHttps = $false }

# Thiet lap ma hoa UTF-8 cho console de khong bi loi font tieng Viet tren PowerShell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 > $null

# =========================================================================
# LỆNH TRIỂN KHAI SIÊU TỐC CHO APP MOBILE CEO 1983 (PORT 5444)
# =========================================================================
# - Tính năng: Tối ưu 100% dành cho App Mobile CEO 1983.
# - Điểm ưu việt:
#   1. Tự động bật -FrontendOnly: Bỏ qua hoàn toàn Backend (tiết kiệm 70% thời gian & 1.5GB upload).
#   2. Nếu thư mục .output đã được build trước đó: Chạy kèm -SkipWebBuild để deploy trong ~1-2 phút.
#   3. Có cơ chế kiểm tra Docker Health Check chống treo tiến trình.
# =========================================================================

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ">>> TRIEN KHAI SIEU TOC CHO APP MOBILE CLB CEO 1983 (FRONTEND ONLY) <<<" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$bound = [System.Collections.Generic.Dictionary[string, object]]::new()
$bound["FrontendOnly"] = $true
if ($SkipWebBuild) { $bound["SkipWebBuild"] = $true }
if ($InstallDeps) { $bound["InstallDeps"] = $true }
$bound["EnableHttps"] = $EnableHttps

# Goi bo deploy voi che do FrontendOnly toi uu
& "$PSScriptRoot/deploy/ceo1983/fast-deploy.ps1" @bound

Write-Host "`n=================================================================" -ForegroundColor Green
Write-Host "TRIEN KHAI APP MOBILE CEO 1983 THANH CONG!" -ForegroundColor Green
Write-Host "1. App Mobile Live (HTTPS)           : https://14.225.217.232:5444/association" -ForegroundColor Yellow
Write-Host "2. Ten Mien PWA iOS/Android          : https://dev-app.14-225-217-232.sslip.io:5444/association" -ForegroundColor Yellow
Write-Host "(Luu y: App Mobile tren dien thoai se tu dong nhan cap nhat moi ngay lap tuc)" -ForegroundColor DarkGray
Write-Host "=================================================================" -ForegroundColor Green
