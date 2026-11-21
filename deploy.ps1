param (
    [Parameter(Position = 0)]
    [string]$Message = "fix(deploy): update deployment and sync subdomains",
    [switch]$DevOnly,
    [switch]$Direct
)

# Thiet lap ma hoa UTF-8 de hien thi tieng Viet mượt mà tren PowerShell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 > $null

Write-Host "`n==========================================================================" -ForegroundColor Cyan
Write-Host " 🚀 CEO 1983 AUTO DEPLOY SCRIPT (POWERSHELL)" -ForegroundColor Yellow
Write-Host " Quy trình: Commit -> Push DEV -> Merge MAIN -> Push MAIN (CI/CD)" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

$currentBranch = (git branch --show-current).Trim()
Write-Host ">>> [1/6] Nhánh hiện tại: [$currentBranch]" -ForegroundColor Green

if ($currentBranch -ne "dev") {
    Write-Host ">>> Đang chuyển về nhánh dev..." -ForegroundColor Yellow
    git checkout dev
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Không thể chuyển về nhánh dev. Vui lòng kiểm tra lại git branch!" -ForegroundColor Red
        exit 1
    }
}

# 1. Kiem tra va commit cac thay doi tren dev
Write-Host "`n>>> [2/6] Kiểm tra thay đổi và commit trên nhánh DEV..." -ForegroundColor Green
git add -A
$status = (git status -s)
if ($status) {
    Write-Host ">>> Các tệp đã thay đổi:" -ForegroundColor Gray
    Write-Host $status -ForegroundColor DarkGray
    git commit -m "$Message"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Lỗi khi thực hiện git commit!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✔ Đã commit thành công với thông điệp: '$Message'" -ForegroundColor Green
} else {
    Write-Host "✔ Không có thay đổi mới cần commit. Tiếp tục quy trình đồng bộ..." -ForegroundColor Yellow
}

# 2. Push len origin dev
Write-Host "`n>>> [3/6] Đang đẩy (push) mã nguồn lên nhánh DEV (origin dev)..." -ForegroundColor Green
git push origin dev
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Push lên nhánh dev thất bại. Vui lòng kiểm tra kết nối mạng hoặc xung đột Git!" -ForegroundColor Red
    exit 1
}
Write-Host "✔ Đã đẩy thành công lên nhánh dev!" -ForegroundColor Green

if ($DevOnly) {
    Write-Host "`n✔ Hoàn tất push nhánh DEV (-DevOnly). Đã dừng theo yêu cầu." -ForegroundColor Cyan
    exit 0
}

# 3. Chuyen sang main va pull moi nhat
Write-Host "`n>>> [4/6] Chuyển sang nhánh MAIN và cập nhật mới nhất..." -ForegroundColor Green
git checkout main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Không thể chuyển sang nhánh main!" -ForegroundColor Red
    git checkout dev
    exit 1
}

git pull origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Cảnh báo: git pull main có vấn đề hoặc main đã cập nhật." -ForegroundColor Yellow
}

# 4. Merge dev vao main
Write-Host "`n>>> [5/6] Tiến hành hợp nhất (merge) nhánh DEV vào MAIN..." -ForegroundColor Green
git merge dev -m "Merge branch 'dev' into main - $Message"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Xảy ra xung đột (conflict) khi merge dev vào main!" -ForegroundColor Red
    Write-Host "Vui lòng xử lý conflict rồi commit lại." -ForegroundColor Yellow
    exit 1
}
Write-Host "✔ Đã merge nhánh dev vào main thành công!" -ForegroundColor Green

# 5. Push len origin main de kich hoat GitHub Actions
Write-Host "`n>>> [6/6] Đang đẩy (push) lên nhánh MAIN để kích hoạt GitHub Actions Deploy..." -ForegroundColor Green
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Push lên nhánh main thất bại!" -ForegroundColor Red
    git checkout dev
    exit 1
}
Write-Host "✔ ĐÃ PUSH LÊN MAIN THÀNH CÔNG! GITHUB ACTIONS ĐANG CHẠY DEPLOY!" -ForegroundColor Green

# 6. Quay lai nhanh dev de tiep tuc lam viec
git checkout dev > $null 2>&1
Write-Host "`n>>> Đã tự động chuyển về lại nhánh DEV để bạn tiếp tục làm việc." -ForegroundColor Cyan

Write-Host "`n==========================================================================" -ForegroundColor Green
Write-Host " 🎉 QUY TRÌNH DEPLOY ĐÃ ĐƯỢC KÍCH HOẠT THÀNH CÔNG!" -ForegroundColor Yellow
Write-Host " 1. Theo dõi tiến trình GitHub Actions tại:" -ForegroundColor Cyan
Write-Host "    👉 https://github.com/viconnect-product-team/ceo1983_project/actions" -ForegroundColor White
Write-Host " 2. Subdomains sẽ tự động cập nhật sau khi build xong:" -ForegroundColor Cyan
Write-Host "    - Mobile App: https://ceo1983.viconnect.vn" -ForegroundColor White
Write-Host "    - Web CRM   : https://crm.ceo1983.viconnect.vn" -ForegroundColor White
Write-Host "==========================================================================`n" -ForegroundColor Green
