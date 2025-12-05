# اسکریپت تست SQLite برای RazorKing

Write-Host "=== شروع تست دیتابیس SQLite ===" -ForegroundColor Green
Write-Host ""

# بررسی وجود فایل دیتابیس
$dbPath = "RazorKing\RazorKing.db"
if (Test-Path $dbPath) {
    $dbSize = (Get-Item $dbPath).Length / 1KB
    Write-Host "✓ فایل دیتابیس یافت شد: RazorKing.db" -ForegroundColor Green
    Write-Host "  حجم: $([math]::Round($dbSize, 2)) KB" -ForegroundColor Cyan
} else {
    Write-Host "✗ فایل دیتابیس یافت نشد!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== اطلاعات برنامه ===" -ForegroundColor Yellow
Write-Host "URL: http://localhost:5204" -ForegroundColor Cyan
Write-Host "صفحه تست: http://localhost:5204/test" -ForegroundColor Cyan
Write-Host "پنل ادمین: http://localhost:5204/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "اطلاعات ورود ادمین:" -ForegroundColor Yellow
Write-Host "  ایمیل: admin@razorking.com" -ForegroundColor Cyan
Write-Host "  رمز: Admin123!" -ForegroundColor Cyan
Write-Host ""

# بررسی اجرای برنامه
Write-Host "=== بررسی وضعیت برنامه ===" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5204" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✓ برنامه در حال اجراست" -ForegroundColor Green
    Write-Host "  کد وضعیت: $($response.StatusCode)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ برنامه در حال اجرا نیست!" -ForegroundColor Red
    Write-Host "  لطفاً ابتدا برنامه را با 'dotnet run' اجرا کنید" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "=== دستورالعمل تست ===" -ForegroundColor Yellow
Write-Host "1. مرورگر خود را باز کنید" -ForegroundColor White
Write-Host "2. به آدرس http://localhost:5204/Account/Login بروید" -ForegroundColor White
Write-Host "3. با اطلاعات ادمین وارد شوید" -ForegroundColor White
Write-Host "4. به آدرس http://localhost:5204/test بروید" -ForegroundColor White
Write-Host "5. دکمه 'ایجاد داده‌های تستی' را بزنید" -ForegroundColor White
Write-Host "6. دکمه 'اجرای تست‌های CRUD' را بزنید" -ForegroundColor White
Write-Host "7. نتایج را در Console بررسی کنید" -ForegroundColor White
Write-Host ""

Write-Host "=== بررسی ساختار دیتابیس ===" -ForegroundColor Yellow

# نصب SQLite CLI اگر وجود ندارد
$sqlitePath = "sqlite3.exe"
$hasSqlite = Get-Command sqlite3 -ErrorAction SilentlyContinue

if (-not $hasSqlite) {
    Write-Host "⚠ SQLite CLI نصب نیست. برای بررسی دقیق‌تر، SQLite CLI را نصب کنید." -ForegroundColor Yellow
    Write-Host "  دانلود: https://www.sqlite.org/download.html" -ForegroundColor Cyan
} else {
    Write-Host "✓ SQLite CLI یافت شد" -ForegroundColor Green
    Write-Host ""
    Write-Host "لیست جداول:" -ForegroundColor Cyan
    
    $tables = sqlite3 $dbPath ".tables"
    Write-Host $tables -ForegroundColor White
    
    Write-Host ""
    Write-Host "تعداد رکوردها:" -ForegroundColor Cyan
    
    $cityCount = sqlite3 $dbPath "SELECT COUNT(*) FROM Cities;"
    Write-Host "  شهرها: $cityCount" -ForegroundColor White
    
    $userCount = sqlite3 $dbPath "SELECT COUNT(*) FROM AspNetUsers;"
    Write-Host "  کاربران: $userCount" -ForegroundColor White
    
    $roleCount = sqlite3 $dbPath "SELECT COUNT(*) FROM AspNetRoles;"
    Write-Host "  نقش‌ها: $roleCount" -ForegroundColor White
    
    $shopCount = sqlite3 $dbPath "SELECT COUNT(*) FROM Barbershops;"
    Write-Host "  آرایشگاه‌ها: $shopCount" -ForegroundColor White
    
    $serviceCount = sqlite3 $dbPath "SELECT COUNT(*) FROM Services;"
    Write-Host "  سرویس‌ها: $serviceCount" -ForegroundColor White
    
    $appointmentCount = sqlite3 $dbPath "SELECT COUNT(*) FROM Appointments;"
    Write-Host "  نوبت‌ها: $appointmentCount" -ForegroundColor White
}

Write-Host ""
Write-Host "=== تست با موفقیت انجام شد ===" -ForegroundColor Green
Write-Host ""
