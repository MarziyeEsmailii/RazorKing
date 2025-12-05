# اسکریپت تست ساده SQLite

Write-Host "=== تست دیتابیس SQLite ===" -ForegroundColor Green
Write-Host ""

# بررسی فایل دیتابیس
if (Test-Path "RazorKing\RazorKing.db") {
    $size = (Get-Item "RazorKing\RazorKing.db").Length / 1KB
    Write-Host "فایل دیتابیس: RazorKing.db" -ForegroundColor Cyan
    Write-Host "حجم: $([math]::Round($size, 2)) KB" -ForegroundColor Cyan
} else {
    Write-Host "فایل دیتابیس یافت نشد!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "برنامه در حال اجراست: http://localhost:5204" -ForegroundColor Green
Write-Host "صفحه تست: http://localhost:5204/test" -ForegroundColor Yellow
Write-Host ""
Write-Host "اطلاعات ورود:" -ForegroundColor Cyan
Write-Host "  Email: admin@razorking.com"
Write-Host "  Password: Admin123!"
Write-Host ""
Write-Host "مراحل تست:" -ForegroundColor Yellow
Write-Host "1. وارد شوید با اطلاعات بالا"
Write-Host "2. به /test بروید"
Write-Host "3. دکمه 'ایجاد داده‌های تستی' را بزنید"
Write-Host "4. دکمه 'اجرای تست‌های CRUD' را بزنید"
Write-Host ""
