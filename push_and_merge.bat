@echo off
chcp 65001 >nul
echo ==========================================================
echo   BẮT ĐẦU QUY TRÌNH PUSH DEV VÀ MERGE VÀO MAIN - CEO 1983
echo ==========================================================

echo.
echo [1/6] Đang thêm tất cả thay đổi (git add -A)...
git add -A
if %errorlevel% neq 0 (
    echo [LỖI] Không thể git add. Dừng quy trình!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/6] Đang commit mã nguồn vào nhánh dev...
git commit -m "feat(all): hoan tat landing web showcase, universal doc viewer, binh luan tree va sua loi app & crm"

echo.
echo [3/6] Đang đẩy code lên origin/dev...
git push origin dev
if %errorlevel% neq 0 (
    echo [LỖI] Không thể push lên origin/dev!
    pause
    exit /b %errorlevel%
)

echo.
echo [4/6] Đang chuyển sang nhánh main và kéo code mới nhất...
git checkout main
if %errorlevel% neq 0 (
    echo [LỖI] Không thể checkout sang main!
    pause
    exit /b %errorlevel%
)
git pull origin main

echo.
echo [5/6] Đang hợp nhất (merge) dev vào main và đẩy lên origin/main...
git merge dev
if %errorlevel% neq 0 (
    echo [LỖI] Xung đột (conflict) khi merge dev vào main!
    pause
    exit /b %errorlevel%
)
git push origin main
if %errorlevel% neq 0 (
    echo [LỖI] Không thể push lên origin/main!
    pause
    exit /b %errorlevel%
)

echo.
echo [6/6] Đang quay trở lại nhánh dev...
git checkout dev

echo.
echo ==========================================================
echo   HOÀN TẤT 100%! CODE ĐÃ ĐƯỢC PUSH LÊN DEV VÀ MERGE MAIN!
echo ==========================================================
pause

