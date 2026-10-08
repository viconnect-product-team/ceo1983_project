param (
    [switch]$SkipBuild,
    [switch]$SkipWebBuild,
    [switch]$FrontendOnly,
    [switch]$BackendOnly,
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
# Kich ban trien khai doc lap App Hiep Hoi CLB CEO 1983 (Huong 2 - Standalone Compose)
# Tach biet hoan toan khoi ViOne: Container rieng, Port 5002/5003 rieng, Compose rieng
# =========================================================================

$SERVER_IP   = "14.225.217.232"
$SERVER_USER = "root"
$REMOTE_PATH = "~/association"

$DEPLOY_DIR = $PSScriptRoot
$ROOT_DIR   = (Resolve-Path "$PSScriptRoot/../..").Path

$ErrorActionPreference = "Stop"

function Invoke-CheckedCommand {
    param(
        [Parameter(Mandatory = $true)] [string]$Description,
        [Parameter(Mandatory = $true)] [scriptblock]$Action,
        [int]$MaxRetries = 1
    )
    $attempt = 1
    while ($true) {
        & $Action
        if ($LASTEXITCODE -eq 0) {
            break
        }
        if ($attempt -lt $MaxRetries) {
            Write-Host "`n[Canh bao] Tien trinh [$Description] tam thoi chua phan hoi (ma loi $LASTEXITCODE). Tu dong thu lai sau 3s (Lan $attempt/$MaxRetries)..." -ForegroundColor Yellow
            Start-Sleep -Seconds 3
            $attempt++
        } else {
            throw "Loi: Tien trinh [$Description] that bai voi ma loi $LASTEXITCODE sau $attempt lan thu."
        }
    }
}

$buildFE = -not $BackendOnly
$buildBE = -not $FrontendOnly

Push-Location $ROOT_DIR
try {
    if (-not $SkipBuild) {
        if ($buildFE) {
            if ($SkipWebBuild) {
                Write-Host "`n[0/5] Bo qua Build Frontend (Web) cuc bo (-SkipWebBuild)..." -ForegroundColor Yellow
            } else {
                Write-Host "`n[0/5] Build Frontend Hiep Hoi (Web) cuc bo voi Scope = association_app..." -ForegroundColor Cyan
                $env:NODE_OPTIONS = "--max-old-space-size=8192"
                $env:VITE_APP_SCOPE = "association_app"
                $env:VITE_APP_NAME = "CLB Doanh Nhan CEO 1983"
                if ($EnableHttps) {
                    $env:VITE_PUBLIC_APP_URL = "https://14.225.217.232:5444"
                } else {
                    $env:VITE_PUBLIC_APP_URL = "http://14.225.217.232:5002"
                }
                $env:NEST_API_URL = "http://ceo1983-backend:4000"
                
                if ($InstallDeps -or (-not (Test-Path "node_modules"))) {
                    Invoke-CheckedCommand -Description "NPM Install" -Action { npm install }
                } else {
                    Write-Host "  -> Bo qua 'npm install' (da co node_modules). Dung -InstallDeps neu muon tai lai." -ForegroundColor DarkGray
                }

                Invoke-CheckedCommand -Description "Build Web App Hiep Hoi" -Action { npm run build --prefix apps/ceo1983_app_fe }
            }
        }

        Write-Host "`n[1/5] Kiem tra Docker Engine va khoi tao quy trinh Build Docker Images..." -ForegroundColor Cyan
        
        # Kiem tra ket noi Docker Desktop voi co che Timeout chong treo tuyet doi
        $dockerHealthy = $false
        try {
            $testProc = Start-Process docker -ArgumentList "version" -NoNewWindow -PassThru -ErrorAction SilentlyContinue
            if ($testProc.WaitForExit(6000)) {
                $dockerHealthy = $true
            } else {
                if (-not $testProc.HasExited) {
                    $testProc.Kill()
                }
            }
        } catch {
            $dockerHealthy = $false
        }

        if (-not $dockerHealthy) {
            Write-Host "`n[CANH BAO NGHIEP VU] Docker Desktop tren may cuc bo dang KHONG PHAN HOI (hoac chua bat)!" -ForegroundColor Red
            Write-Host "--------------------------------------------------------------------------------" -ForegroundColor Red
            Write-Host "-> NGUYEN NHAN TREO: Tien trinh Docker Desktop tren Windows dang bi ket pipe ket noi voi WSL2." -ForegroundColor Yellow
            Write-Host "-> KHAC PHUC NHANH:" -ForegroundColor Yellow
            Write-Host "   1. Vui long mo/khoi dong lai ung dung Docker Desktop tren Windows." -ForegroundColor White
            Write-Host "   2. Doi bieu tuong con ca voi (whale icon) o khay he thong chuyen sang mau xanh (Engine running)." -ForegroundColor White
            Write-Host "   3. Neu chi can cap nhat thay doi cho CEO 1983 Mobile, hay chay lenh toi uu:" -ForegroundColor Green
            Write-Host "      .\deploy-mobile.ps1 (hoac .\deploy-ceo1983.ps1 -FrontendOnly -SkipWebBuild)" -ForegroundColor Green
            Write-Host "--------------------------------------------------------------------------------" -ForegroundColor Red
            throw "Dung tien trinh deploy vi Docker Desktop cuc bo khong phan hoi. Vui long mo lai Docker Desktop va thu lai."
        }

        if ($buildBE) {
            Invoke-CheckedCommand -Description "Xay dung Backend Image (ceo1983-backend)" -Action {
                docker build -t ceo1983-backend:latest -f Dockerfile.backend .
            }
        }
        if ($buildFE) {
            Invoke-CheckedCommand -Description "Xay dung Frontend Image (ceo1983-frontend)" -Action {
                docker build --no-cache -t ceo1983-frontend:latest -f "$DEPLOY_DIR/Dockerfile.frontend" .
            }
        }

        function Save-And-Compress-DockerImage {
            param(
                [Parameter(Mandatory = $true)] [string]$ImageName,
                [Parameter(Mandatory = $true)] [string]$OutGzPath
            )
            $gitGzip = "C:\Program Files\Git\usr\bin\gzip.exe"
            if (-not (Test-Path $gitGzip)) {
                $found = Get-Command gzip -ErrorAction SilentlyContinue
                if ($found) { $gitGzip = $found.Source }
            }

            if (Test-Path $gitGzip) {
                Write-Host "  -> Streaming truc tiep 'docker save | gzip -1' vao $OutGzPath..." -ForegroundColor Cyan
                cmd.exe /c "docker save $ImageName | `"$gitGzip`" -1 > `"$OutGzPath`""
                if ($LASTEXITCODE -ne 0 -or (-not (Test-Path $OutGzPath))) {
                    throw "Streaming Docker save that bai cho $ImageName"
                }
            } else {
                Write-Host "  -> Nen Node Stream vao $OutGzPath..." -ForegroundColor Cyan
                $nodeCompress = 'const fs = require("fs"); const zlib = require("zlib"); const { spawn } = require("child_process"); const proc = spawn("docker", ["save", process.argv[1]], { stdio: ["ignore", "pipe", "inherit"] }); const out = fs.createWriteStream(process.argv[2]); proc.stdout.pipe(zlib.createGzip({ level: 1 })).pipe(out); proc.on("close", (code) => { if (code !== 0) process.exit(code); });'
                node -e $nodeCompress $ImageName $OutGzPath
            }
        }

        Write-Host "`n[2/5] Xuat va nen Gzip (.tar.gz) toc do cao cho Hiep Hoi..." -ForegroundColor Cyan
        if ($buildBE) {
            Invoke-CheckedCommand -Description "Xuat & Nen Backend Image (.tar.gz)" -Action {
                Save-And-Compress-DockerImage -ImageName "ceo1983-backend:latest" -OutGzPath "ceo1983-backend.tar.gz"
            }
        }
        if ($buildFE) {
            Invoke-CheckedCommand -Description "Xuat & Nen Frontend Image (.tar.gz)" -Action {
                Save-And-Compress-DockerImage -ImageName "ceo1983-frontend:latest" -OutGzPath "ceo1983-frontend.tar.gz"
            }
        }
    } else {
        Write-Host "`n[1-2/5] BO QUA quy trinh Build va dong goi (SkipBuild)..." -ForegroundColor Yellow
    }

    $SSH_OPTS = @("-o", "ConnectTimeout=30", "-o", "ServerAliveInterval=15", "-o", "ServerAliveCountMax=3")

    Write-Host "`n[3/5] Khoi tao thu muc va dong bo tep tin doc lap len may chu ha tang ($SERVER_IP)..." -ForegroundColor Cyan

    Invoke-CheckedCommand -Description "Tao thu muc ~/association tren server" -MaxRetries 3 -Action {
        ssh @SSH_OPTS "${SERVER_USER}@${SERVER_IP}" "mkdir -p $REMOTE_PATH"
    }

    # Dam bao co tep tin .env.association cuc bo
    Copy-Item "$DEPLOY_DIR/.env.production" "$DEPLOY_DIR/.env.association" -Force -ErrorAction SilentlyContinue

    $filesToUpload = @(
        (Resolve-Path "$DEPLOY_DIR/.env.production").Path,
        (Resolve-Path "$DEPLOY_DIR/.env.association").Path,
        (Resolve-Path "$DEPLOY_DIR/docker-compose.yml").Path
    )
    if (-not $SkipBuild) {
        if ($buildBE -and (Test-Path "ceo1983-backend.tar.gz")) { $filesToUpload += (Resolve-Path "ceo1983-backend.tar.gz").Path }
        if ($buildFE -and (Test-Path "ceo1983-frontend.tar.gz")) { $filesToUpload += (Resolve-Path "ceo1983-frontend.tar.gz").Path }
    }

    $scpArgs = @() + $SSH_OPTS + $filesToUpload + "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/"
    Invoke-CheckedCommand -Description "Chuyen giao tep tin qua SCP vao ~/association" -MaxRetries 3 -Action {
        scp @scpArgs
    }

    Write-Host "`n[4/5] Kich hoat Docker Compose rieng cho Hiep Hoi tu xa thong qua SSH..." -ForegroundColor Cyan

    $remoteLoadCmd = ""
    if ($buildBE -and (Test-Path "ceo1983-backend.tar.gz")) {
        $remoteLoadCmd += "docker load -i ceo1983-backend.tar.gz; rm -f ceo1983-backend.tar.gz; "
    }
    if ($buildFE -and (Test-Path "ceo1983-frontend.tar.gz")) {
        $remoteLoadCmd += "docker load -i ceo1983-frontend.tar.gz; rm -f ceo1983-frontend.tar.gz; "
    }

    $REMOTE_CMD = "cd $REMOTE_PATH; cp -f .env.production .env.association 2>/dev/null || true; touch .env.association; sed -i 's/\r//g' .env.association docker-compose.yml; docker network create vione-network 2>/dev/null || true; $remoteLoadCmd docker compose -f docker-compose.yml stop 2>/dev/null || true; docker rm -f ceo1983-frontend-prod ceo1983-backend-prod 2>/dev/null || true; docker compose -f docker-compose.yml up -d --force-recreate"

    Invoke-CheckedCommand -Description "Thuc thi cau truc container doc lap Hiep Hoi" -MaxRetries 3 -Action {
        ssh @SSH_OPTS "${SERVER_USER}@${SERVER_IP}" $REMOTE_CMD
    }

    Write-Host "`n[5/5] Don dep bo nho dem tam thoi tai may cuc bo..." -ForegroundColor Cyan
    Remove-Item ceo1983-backend.tar.gz, ceo1983-frontend.tar.gz, ceo1983-backend.tar, ceo1983-frontend.tar -ErrorAction SilentlyContinue

    if ($EnableHttps) {
        Write-Host "`n[BO SUNG] Dong bo Nginx Reverse Proxy SSL / HTTPS..." -ForegroundColor Magenta
        & "$DEPLOY_DIR/../ssl/deploy-ssl.ps1"
    }

    Write-Host "=================================================================" -ForegroundColor Green
    Write-Host "TRIEN KHAI DOC LAP APP HIEP HOI CLB CEO 1983 [HUONG 2] THANH CONG!" -ForegroundColor Green
    if ($EnableHttps) {
        Write-Host "Cong Frontend Hiep Hoi (HTTPS): https://${SERVER_IP}:5444 (hoac https://dev-app.14-225-217-232.sslip.io:5444/association)" -ForegroundColor Yellow
        Write-Host "Cong Frontend Hiep Hoi (Cong 443): https://${SERVER_IP}/association" -ForegroundColor Yellow
        Write-Host "Cong Frontend Hiep Hoi (HTTP) : http://${SERVER_IP}:5002" -ForegroundColor DarkGray
    } else {
        Write-Host "Cong Frontend Hiep Hoi : http://${SERVER_IP}:5002" -ForegroundColor Yellow
    }
    Write-Host "Cong Backend Hiep Hoi  : http://${SERVER_IP}:5003" -ForegroundColor Yellow
    Write-Host "=================================================================" -ForegroundColor Green
} finally {
    Pop-Location
}
