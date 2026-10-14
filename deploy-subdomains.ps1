param (
    [ValidateSet("all", "mobile", "crm", "ssl")]
    [string]$Target = "all",
    [switch]$FrontendOnly,
    [switch]$BackendOnly,
    [switch]$SkipBuild,
    [switch]$SkipWebBuild,
    [switch]$InstallDeps
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 > $null

$ROOT_DIR = $PSScriptRoot
$ErrorActionPreference = "Stop"

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " HỆ THỐNG TRIỂN KHAI SUBDOMAINS CEO 1983 & CRM HIỆP HỘI" -ForegroundColor Cyan
Write-Host " 1. Mobile CEO 1983 Subdomain : https://ceo1983.viconnect.vn" -ForegroundColor Yellow
Write-Host "    -> Link Dev Test Mobile   : http://14.225.217.232:5002 | https://14.225.217.232:5444" -ForegroundColor DarkGray
Write-Host " 2. Quản Trị CRM Subdomain   : https://crm.ceo1983.viconnect.vn" -ForegroundColor Yellow
Write-Host "    -> Link Dev Test CRM      : http://14.225.217.232:5004 | https://14.225.217.232:5443" -ForegroundColor DarkGray
Write-Host " Target Mode                 : $Target" -ForegroundColor White
Write-Host "==========================================================================" -ForegroundColor Cyan

$extraArgs = @()
if ($FrontendOnly) { $extraArgs += "-FrontendOnly" }
if ($BackendOnly)  { $extraArgs += "-BackendOnly" }
if ($SkipBuild)    { $extraArgs += "-SkipBuild" }
if ($SkipWebBuild) { $extraArgs += "-SkipWebBuild" }
if ($InstallDeps)  { $extraArgs += "-InstallDeps" }

Push-Location $ROOT_DIR
try {
    # 1. Triển khai Mobile CEO 1983 (https://ceo1983.viconnect.vn)
    if ($Target -eq "all" -or $Target -eq "mobile") {
        Write-Host "`n>>> [1/3] Đang triển khai Mobile CEO 1983 (https://ceo1983.viconnect.vn)..." -ForegroundColor Green
        & "$ROOT_DIR/deploy/ceo1983/fast-deploy.ps1" @extraArgs
    }

    # 2. Triển khai CRM Platform (https://crm.ceo1983.viconnect.vn)
    if ($Target -eq "all" -or $Target -eq "crm") {
        Write-Host "`n>>> [2/3] Đang triển khai CRM Hiệp hội (https://crm.ceo1983.viconnect.vn)..." -ForegroundColor Green
        & "$ROOT_DIR/deploy/crm/fast-deploy.ps1" @extraArgs
    }

    # 3. Đồng bộ Nginx Reverse Proxy SSL (Ports 80, 443, 5443, 5444)
    if ($Target -eq "all" -or $Target -eq "ssl") {
        Write-Host "`n>>> [3/3] Đang đồng bộ Nginx Reverse Proxy & SSL Subdomains..." -ForegroundColor Green
        & "$ROOT_DIR/deploy/ssl/deploy-ssl.ps1"
    }

    Write-Host "`n==========================================================================" -ForegroundColor Green
    Write-Host " TẤT CẢ SUBDOMAIN & SERVER DEV ĐÃ ĐƯỢC CẬP NHẬT CODE MỚI THÀNH CÔNG!" -ForegroundColor Green
    Write-Host " 1. Mobile CEO 1983 Subdomain : https://ceo1983.viconnect.vn" -ForegroundColor Yellow
    Write-Host "    -> Link Dev Test Mobile   : http://14.225.217.232:5002 | https://14.225.217.232:5444" -ForegroundColor DarkGray
    Write-Host " 2. Web CRM Hiệp Hội Subdomain: https://crm.ceo1983.viconnect.vn" -ForegroundColor Yellow
    Write-Host "    -> Link Dev Test CRM      : http://14.225.217.232:5004 | https://14.225.217.232:5443" -ForegroundColor DarkGray
    Write-Host "==========================================================================" -ForegroundColor Green
} finally {
    Pop-Location
}
