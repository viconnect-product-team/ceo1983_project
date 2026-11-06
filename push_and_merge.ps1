# ==============================================================================
# SCRIPT TỰ ĐỘNG COMMIT, PUSH DEV VÀ MERGE VÀO MAIN (CEO 1983 PROJECT)
# ==============================================================================
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  BẮT ĐẦU QUY TRÌNH PUSH DEV VÀ MERGE VÀO MAIN - CEO 1983" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Thêm tất cả thay đổi
Write-Host "`n[1/6] Dang them tat ca file thay doi (git add -A)..." -ForegroundColor Green
git add -A
if ($LASTEXITCODE -ne 0) {
    Write-Host "Loi khi git add. Dung quy trinh!" -ForegroundColor Red
    exit 1
}

# 2. Commit code vao dev
Write-Host "`n[2/6] Dang commit ma nguon vao nhanh dev..." -ForegroundColor Green
git commit -m "feat(all): hoan tat landing web showcase, universal doc viewer, binh luan tree va sua loi app & crm"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Luu y: Co the khong co thay doi moi de commit, tiep tuc quy trinh..." -ForegroundColor Yellow
}

# 3. Push len origin dev
Write-Host "`n[3/6] Dang day code len origin/dev..." -ForegroundColor Green
git push origin dev
if ($LASTEXITCODE -ne 0) {
    Write-Host "Loi khi push len origin/dev!" -ForegroundColor Red
    exit 1
}

# 4. Checkout sang main va pull moi nhat
Write-Host "`n[4/6] Dang chuyen sang nhanh main va keo code moi nhat..." -ForegroundColor Green
git checkout main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Loi khi checkout sang main!" -ForegroundColor Red
    exit 1
}
git pull origin main

# 5. Merge dev vao main va push len origin main
Write-Host "`n[5/6] Dang hop nhat (merge) dev vao main va push len origin/main..." -ForegroundColor Green
git merge dev
if ($LASTEXITCODE -ne 0) {
    Write-Host "Xung dot (conflict) khi merge dev vao main! Vui long kiem tra." -ForegroundColor Red
    exit 1
}
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Loi khi push len origin/main!" -ForegroundColor Red
    exit 1
}

# 6. Quay tro lai dev
Write-Host "`n[6/6] Dang quay tro lai nhanh dev..." -ForegroundColor Green
git checkout dev

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  HOAN TAT 100%! CODE DA DUOC PUSH LEN DEV VA MERGE MAIN!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

