@echo off
chcp 65001 >nul
echo ========================================
echo SQLite Database Test
echo ========================================
echo.

if exist "RazorKing\RazorKing.db" (
    echo [OK] Database file found: RazorKing.db
) else (
    echo [ERROR] Database file not found!
    exit /b 1
)

echo.
echo Application URL: http://localhost:5204
echo Test Page: http://localhost:5204/test
echo.
echo Login Credentials:
echo   Email: admin@razorking.com
echo   Password: Admin123!
echo.
echo Test Steps:
echo 1. Login with admin credentials
echo 2. Go to /test page
echo 3. Click "Create Test Data" button
echo 4. Click "Run CRUD Tests" button
echo 5. Check console output
echo.
echo ========================================
pause
