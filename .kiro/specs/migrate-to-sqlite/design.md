# Design Document

## Overview

این سند طراحی مهاجرت پروژه RazorKing از SQL Server به SQLite را شرح می‌دهد. SQLite یک دیتابیس سبک و فایل-محور است که نیازی به سرور جداگانه ندارد و برای توسعه و استقرار ساده‌تر مناسب است.

## Architecture

### Current Architecture
- ASP.NET Core 9.0 با Entity Framework Core
- SQL Server به عنوان دیتابیس
- ASP.NET Core Identity برای احراز هویت
- DbContext با 9 DbSet برای مدل‌های مختلف

### Target Architecture
- همان معماری ASP.NET Core 9.0
- SQLite به عنوان دیتابیس (فایل محلی)
- حفظ تمام قابلیت‌های Identity
- بدون تغییر در مدل‌های داده یا DbContext

## Components and Interfaces

### 1. NuGet Package Changes

**حذف:**
- `Microsoft.EntityFrameworkCore.SqlServer` (9.0.0)

**اضافه:**
- `Microsoft.EntityFrameworkCore.Sqlite` (9.0.0)

**حفظ:**
- `Microsoft.EntityFrameworkCore.Tools` (9.0.0)
- `Microsoft.EntityFrameworkCore.Design` (9.0.0)
- `Microsoft.AspNetCore.Identity.EntityFrameworkCore` (9.0.0)
- `Microsoft.AspNetCore.Identity.UI` (9.0.0)

### 2. Configuration Changes

**appsettings.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=RazorKing.db"
  }
}
```

**appsettings.Development.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=RazorKing.db"
  }
}
```

### 3. Program.cs Changes

**قبل:**
```csharp
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
```

**بعد:**
```csharp
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
```

### 4. Migration Strategy

**مراحل:**
1. حذف پوشه `Migrations` موجود
2. ایجاد migration اولیه جدید برای SQLite
3. اعمال migration به دیتابیس SQLite
4. تست seed data (شهرها، ادمین، نقش‌ها)

## Data Models

### تغییرات مورد نیاز در مدل‌ها

**هیچ تغییری در مدل‌های داده لازم نیست.** SQLite از تمام انواع داده‌ای که در پروژه استفاده شده پشتیبانی می‌کند:

- `string` → TEXT
- `int` → INTEGER
- `DateTime` → TEXT (ISO8601)
- `decimal` → REAL (با HasPrecision)
- `bool` → INTEGER (0/1)

### سازگاری با Identity

ASP.NET Core Identity به طور کامل با SQLite سازگار است. تمام جداول Identity شامل:
- AspNetUsers
- AspNetRoles
- AspNetUserRoles
- AspNetUserClaims
- AspNetUserLogins
- AspNetUserTokens
- AspNetRoleClaims

به درستی در SQLite ایجاد می‌شوند.

### Decimal Precision

SQLite از `HasPrecision` پشتیبانی نمی‌کند اما مقادیر decimal را به صورت REAL ذخیره می‌کند. کد موجود:

```csharp
modelBuilder.Entity<Service>()
    .Property(s => s.Price)
    .HasPrecision(18, 2);
```

در SQLite بدون خطا اجرا می‌شود اما precision در سطح دیتابیس اعمال نمی‌شود. این مشکلی ایجاد نمی‌کند چون:
- .NET همچنان مقادیر را به صورت `decimal` نگه می‌دارد
- دقت در لایه اپلیکیشن حفظ می‌شود

## Error Handling

### مشکلات احتمالی و راه‌حل‌ها

**1. Migration Conflicts:**
- **مشکل:** Migration های قدیمی SQL Server با SQLite سازگار نیستند
- **راه‌حل:** حذف کامل پوشه Migrations و ایجاد migration جدید

**2. Database File Permissions:**
- **مشکل:** عدم دسترسی به ایجاد فایل دیتابیس
- **راه‌حل:** اطمینان از دسترسی نوشتن در دایرکتوری پروژه

**3. Connection String Issues:**
- **مشکل:** مسیر نادرست فایل دیتابیس
- **راه‌حل:** استفاده از مسیر نسبی `Data Source=RazorKing.db`

**4. Seed Data Failures:**
- **مشکل:** خطا در ایجاد ادمین یا نقش‌ها
- **راه‌حل:** بررسی لاگ‌ها و اطمینان از اجرای migration

## Testing Strategy

### 1. Unit Testing
- تست اتصال به دیتابیس SQLite
- تست ایجاد DbContext با SQLite provider
- تست خواندن connection string

### 2. Integration Testing
- تست اجرای migration ها
- تست seed data (شهرها، ادمین)
- تست عملیات CRUD روی هر entity
- تست Identity (ثبت‌نام، ورود، نقش‌ها)

### 3. Manual Testing
- اجرای برنامه و بررسی ایجاد فایل RazorKing.db
- ورود با حساب ادمین پیش‌فرض
- ایجاد آرایشگاه، سرویس، نوبت
- بررسی روابط بین جداول

### 4. Validation Steps
```bash
# بررسی نصب پکیج‌ها
dotnet list package

# ایجاد migration جدید
dotnet ef migrations add InitialCreate --project RazorKing

# اعمال migration
dotnet ef database update --project RazorKing

# اجرای برنامه
dotnet run --project RazorKing
```

## Implementation Notes

### مزایای SQLite
- نیازی به نصب SQL Server نیست
- فایل دیتابیس قابل حمل است
- مناسب برای توسعه و تست
- سرعت بالا برای عملیات محلی

### محدودیت‌های SQLite
- مناسب برای تعداد کاربران محدود (< 100 همزمان)
- عدم پشتیبانی از برخی ویژگی‌های پیشرفته SQL Server
- فقط یک نویسنده همزمان

### توصیه برای Production
اگر برنامه در محیط production با تعداد کاربر بالا استفاده می‌شود، توصیه می‌شود از PostgreSQL یا SQL Server استفاده شود. اما برای توسعه و استقرار‌های کوچک، SQLite کاملاً مناسب است.
