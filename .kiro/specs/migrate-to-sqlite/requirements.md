# Requirements Document

## Introduction

این سند نیازمندی‌های تبدیل پروژه RazorKing از SQL Server به SQLite را مشخص می‌کند. هدف اصلی جایگزینی دیتابیس SQL Server با SQLite برای سادگی توسعه و استقرار است.

## Glossary

- **RazorKing System**: سیستم مدیریت آرایشگاه مبتنی بر ASP.NET Core
- **SQLite Provider**: ارائه‌دهنده Entity Framework Core برای SQLite
- **Migration Files**: فایل‌های مهاجرت Entity Framework که ساختار دیتابیس را تعریف می‌کنند
- **Connection String**: رشته اتصال که مشخصات اتصال به دیتابیس را تعریف می‌کند
- **NuGet Package**: بسته‌های کتابخانه‌ای .NET

## Requirements

### Requirement 1

**User Story:** به عنوان توسعه‌دهنده، می‌خواهم پروژه از SQLite به جای SQL Server استفاده کند تا نیازی به نصب SQL Server نداشته باشم.

#### Acceptance Criteria

1. THE RazorKing System SHALL use SQLite database provider instead of SQL Server provider
2. THE RazorKing System SHALL store database file in the application directory with name "RazorKing.db"
3. WHEN the application starts, THE RazorKing System SHALL create the SQLite database file if it does not exist
4. THE RazorKing System SHALL maintain all existing Identity and application data models without modification

### Requirement 2

**User Story:** به عنوان توسعه‌دهنده، می‌خواهم تمام پکیج‌های NuGet مورد نیاز برای SQLite نصب شوند تا پروژه بدون خطا اجرا شود.

#### Acceptance Criteria

1. THE RazorKing System SHALL include Microsoft.EntityFrameworkCore.Sqlite NuGet package version 9.0.0
2. THE RazorKing System SHALL remove Microsoft.EntityFrameworkCore.SqlServer NuGet package dependency
3. THE RazorKing System SHALL maintain all other existing NuGet packages for Identity and EF Core Tools
4. WHEN building the project, THE RazorKing System SHALL compile without package reference errors

### Requirement 3

**User Story:** به عنوان توسعه‌دهنده، می‌خواهم connection string به درستی برای SQLite پیکربندی شود تا اتصال به دیتابیس برقرار شود.

#### Acceptance Criteria

1. THE RazorKing System SHALL define SQLite connection string in appsettings.json file
2. THE RazorKing System SHALL use relative path for database file location
3. THE RazorKing System SHALL configure connection string with format "Data Source=RazorKing.db"
4. WHEN application reads configuration, THE RazorKing System SHALL load the SQLite connection string correctly

### Requirement 4

**User Story:** به عنوان توسعه‌دهنده، می‌خواهم کد برنامه برای استفاده از SQLite به‌روزرسانی شود تا از provider صحیح استفاده کند.

#### Acceptance Criteria

1. THE RazorKing System SHALL replace UseSqlServer method call with UseSqlite in Program.cs
2. THE RazorKing System SHALL maintain all existing DbContext configuration options
3. THE RazorKing System SHALL preserve all Identity configuration settings
4. WHEN DbContext is initialized, THE RazorKing System SHALL use SQLite provider

### Requirement 5

**User Story:** به عنوان توسعه‌دهنده، می‌خواهم migration های جدید برای SQLite ایجاد شوند تا ساختار دیتابیس به درستی ساخته شود.

#### Acceptance Criteria

1. THE RazorKing System SHALL remove all existing SQL Server migration files
2. THE RazorKing System SHALL generate new migration files compatible with SQLite
3. WHEN migrations are applied, THE RazorKing System SHALL create all required tables for Identity and application models
4. THE RazorKing System SHALL seed default admin user and roles after migration
