# 💈 RazorKing - سیستم مدیریت نوبت‌دهی آرایشگاه‌ها

<div dir="rtl">

## 📋 فهرست مطالب
- [درباره پروژه](#-درباره-پروژه)
- [تکنولوژی‌ها و فریمورک‌ها](#-تکنولوژیها-و-فریمورکها)
- [معماری پروژه](#-معماری-پروژه)
- [ساختار پروژه](#-ساختار-پروژه)
- [مدل‌های داده](#-مدلهای-داده)
- [ویژگی‌های اصلی](#-ویژگیهای-اصلی)
- [پیش‌نیازها](#-پیشنیازها)
- [نصب و راه‌اندازی](#-نصب-و-راهاندازی)
- [تنظیمات پایگاه داده](#-تنظیمات-پایگاه-داده)
- [نقش‌های کاربری](#-نقشهای-کاربری)
- [API Endpoints](#-api-endpoints)
- [اسکرین‌شات‌ها](#-اسکرینشاتها)
- [مشارکت در پروژه](#-مشارکت-در-پروژه)
- [لایسنس](#-لایسنس)

---

## 🎯 درباره پروژه

**RazorKing** یک سیستم جامع و حرفه‌ای برای مدیریت نوبت‌دهی آرایشگاه‌ها است که با استفاده از ASP.NET Core 9.0 و معماری MVC توسعه یافته است. این سیستم امکان مدیریت کامل آرایشگاه‌ها، خدمات، نوبت‌ها و کاربران را فراهم می‌کند.

### 🌟 ویژگی‌های برجسته
- ✅ سیستم احراز هویت و مجوزدهی پیشرفته با ASP.NET Core Identity
- ✅ پنل مدیریت قدرتمند با داشبورد تحلیلی
- ✅ سیستم رزرو نوبت آنلاین با تقویم هوشمند
- ✅ مدیریت چند آرایشگاه و چند شهر
- ✅ سیستم مدیریت خدمات و قیمت‌گذاری
- ✅ مدیریت ساعات کاری و روزهای تعطیل
- ✅ پروفایل کاربری با تاریخچه نوبت‌ها
- ✅ گزارش‌گیری و آمار پیشرفته
- ✅ رابط کاربری فارسی و واکنش‌گرا (Responsive)
- ✅ پشتیبانی از تاریخ شمسی

### 🎨 طراحی و UX
- رابط کاربری مدرن و کاربرپسند
- طراحی واکنش‌گرا برای موبایل، تبلت و دسکتاپ
- استفاده از Bootstrap 5 برای UI Components
- انیمیشن‌های روان و تجربه کاربری عالی

---

## 🛠 تکنولوژی‌ها و فریمورک‌ها

### Backend
- **Framework**: ASP.NET Core 9.0 (MVC Pattern)
- **Language**: C# 12
- **ORM**: Entity Framework Core 9.0
- **Database**: SQL Server
- **Authentication**: ASP.NET Core Identity
- **Authorization**: Role-Based Access Control (RBAC)

### Frontend
- **View Engine**: Razor Pages
- **CSS Framework**: Bootstrap 5
- **JavaScript**: Vanilla JS + jQuery
- **Icons**: Font Awesome / Bootstrap Icons

### Architecture & Patterns
- **Pattern**: Model-View-Controller (MVC)
- **Architecture**: Layered Architecture
- **Data Access**: Repository Pattern (via EF Core)
- **Dependency Injection**: Built-in ASP.NET Core DI Container


---

## 🏗 معماری پروژه

پروژه RazorKing بر اساس معماری **MVC (Model-View-Controller)** طراحی شده است:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Views   │  │Controllers│  │ViewModels│              │
│  │ (Razor)  │◄─┤  (Logic) │◄─┤  (DTOs)  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Business Logic Layer                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Controllers & Service Logic              │   │
│  │  - BookingController (رزرو نوبت)                │   │
│  │  - AdminController (مدیریت سیستم)               │   │
│  │  - AccountController (احراز هویت)               │   │
│  │  - ProfileController (پروفایل کاربری)          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Access Layer                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │      ApplicationDbContext (EF Core)              │   │
│  │  - DbSet<Barbershop>                             │   │
│  │  - DbSet<Appointment>                            │   │
│  │  - DbSet<Service>                                │   │
│  │  - DbSet<ApplicationUser>                        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                      Database Layer                      │
│              SQL Server (RazorKingDb)                    │
└─────────────────────────────────────────────────────────┘
```

### 🔑 اصول معماری
1. **Separation of Concerns**: جداسازی منطق کسب‌وکار، داده و نمایش
2. **Dependency Injection**: استفاده از DI برای مدیریت وابستگی‌ها
3. **Single Responsibility**: هر کلاس یک مسئولیت واحد دارد
4. **Code Reusability**: استفاده مجدد از کدها با ViewModels و Helpers


---

## 📁 ساختار پروژه

```
RazorKing/
│
├── 📂 Controllers/              # کنترلرهای MVC
│   ├── AccountController.cs    # مدیریت احراز هویت (ورود/ثبت‌نام/خروج)
│   ├── AdminController.cs      # پنل مدیریت (CRUD عملیات)
│   ├── BarberController.cs     # مدیریت آرایشگران
│   ├── BookingController.cs    # سیستم رزرو نوبت
│   ├── HomeController.cs       # صفحه اصلی و جستجو
│   ├── ProfileController.cs    # پروفایل کاربری
│   └── SetupController.cs      # راه‌اندازی اولیه سیستم
│
├── 📂 Models/                   # مدل‌های داده
│   ├── ApplicationUser.cs      # مدل کاربر (Identity)
│   ├── Appointment.cs          # مدل نوبت
│   ├── Barbershop.cs           # مدل آرایشگاه
│   ├── Service.cs              # مدل خدمات
│   ├── City.cs                 # مدل شهر
│   ├── BarberSchedule.cs       # برنامه زمانی آرایشگران
│   ├── BlockedDate.cs          # روزهای تعطیل
│   ├── BlockedTimeSlot.cs      # ساعات بلوک شده
│   ├── TimeSlot.cs             # بازه‌های زمانی
│   └── 📂 ViewModels/          # مدل‌های نمایش
│       ├── BookingViewModel.cs
│       ├── AdminViewModels.cs
│       ├── ProfileViewModel.cs
│       └── HomeViewModel.cs
│
├── 📂 Views/                    # نماهای Razor
│   ├── 📂 Home/                # صفحات اصلی
│   ├── 📂 Account/             # صفحات احراز هویت
│   ├── 📂 Admin/               # پنل مدیریت
│   ├── 📂 Booking/             # صفحات رزرو
│   ├── 📂 Profile/             # پروفایل کاربری
│   └── 📂 Shared/              # قالب‌های مشترک
│       ├── _Layout.cshtml      # قالب اصلی
│       └── _LoginPartial.cshtml
│
├── 📂 Data/                     # لایه دسترسی به داده
│   └── ApplicationDbContext.cs # Context پایگاه داده
│
├── 📂 Migrations/               # مایگریشن‌های EF Core
│   ├── 20251031170100_InitialCreate.cs
│   ├── 20251104223717_AddPanelAdmin.cs
│   └── ...
│
├── 📂 Helpers/                  # کلاس‌های کمکی
│   ├── ImageHelper.cs          # مدیریت تصاویر
│   └── PersianDateHelper.cs    # تبدیل تاریخ شمسی
│
├── 📂 wwwroot/                  # فایل‌های استاتیک
│   ├── 📂 css/                 # استایل‌ها
│   ├── 📂 js/                  # اسکریپت‌ها
│   ├── 📂 images/              # تصاویر
│   └── 📂 lib/                 # کتابخانه‌های Frontend
│
├── Program.cs                   # نقطه ورود برنامه
├── appsettings.json            # تنظیمات برنامه
└── RazorKing.csproj            # فایل پروژه
```


---

## 🗄 مدل‌های داده

### 1️⃣ ApplicationUser (کاربر)
مدل کاربر که از `IdentityUser` ارث‌بری می‌کند:
```csharp
public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; }           // نام
    public string LastName { get; set; }            // نام خانوادگی
    public DateTime CreatedAt { get; set; }         // تاریخ ثبت‌نام
    public bool IsActive { get; set; }              // وضعیت فعال/غیرفعال
    
    // روابط
    public List<Barbershop> OwnedBarbershops { get; set; }      // آرایشگاه‌های متعلق به کاربر
    public List<Appointment> CustomerAppointments { get; set; }  // نوبت‌های مشتری
    public List<BarberSchedule> BarberSchedules { get; set; }   // برنامه کاری آرایشگر
}
```

### 2️⃣ Barbershop (آرایشگاه)
```csharp
public class Barbershop
{
    public int Id { get; set; }
    public string Name { get; set; }                // نام آرایشگاه
    public string Address { get; set; }             // آدرس
    public string Phone { get; set; }               // تلفن
    public string Description { get; set; }         // توضیحات
    public string ImageUrl { get; set; }            // تصویر
    public int CityId { get; set; }                 // شهر
    public string UserId { get; set; }              // مالک
    public TimeSpan OpenTime { get; set; }          // ساعت باز شدن
    public TimeSpan CloseTime { get; set; }         // ساعت بسته شدن
    public string WorkingDays { get; set; }         // روزهای کاری
    public bool IsActive { get; set; }              // وضعیت فعال
    
    // روابط
    public City City { get; set; }
    public ApplicationUser Owner { get; set; }
    public List<Service> Services { get; set; }
    public List<Appointment> Appointments { get; set; }
}
```

### 3️⃣ Service (خدمات)
```csharp
public class Service
{
    public int Id { get; set; }
    public string Name { get; set; }                // نام خدمت (مثلاً: کوتاهی مو)
    public string Description { get; set; }         // توضیحات
    public decimal Price { get; set; }              // قیمت (تومان)
    public int Duration { get; set; }               // مدت زمان (دقیقه)
    public bool IsActive { get; set; }              // وضعیت فعال
    public int BarbershopId { get; set; }           // آرایشگاه مربوطه
    
    // روابط
    public Barbershop Barbershop { get; set; }
    public List<Appointment> Appointments { get; set; }
}
```

### 4️⃣ Appointment (نوبت)
```csharp
public class Appointment
{
    public int Id { get; set; }
    public string CustomerId { get; set; }          // شناسه کاربر
    public string CustomerName { get; set; }        // نام مشتری
    public string CustomerPhone { get; set; }       // تلفن مشتری
    public string CustomerEmail { get; set; }       // ایمیل مشتری
    public DateTime AppointmentDate { get; set; }   // تاریخ نوبت
    public TimeSpan AppointmentTime { get; set; }   // ساعت نوبت
    public int BarbershopId { get; set; }           // آرایشگاه
    public int ServiceId { get; set; }              // خدمت
    public AppointmentStatus Status { get; set; }   // وضعیت نوبت
    public decimal TotalPrice { get; set; }         // مبلغ کل
    public decimal PaidAmount { get; set; }         // مبلغ پرداخت شده
    public DateTime CreatedAt { get; set; }         // تاریخ ایجاد
    public DateTime? CompletedAt { get; set; }      // تاریخ تکمیل
    public string Notes { get; set; }               // یادداشت‌ها
    
    // روابط
    public ApplicationUser Customer { get; set; }
    public Barbershop Barbershop { get; set; }
    public Service Service { get; set; }
}

// وضعیت‌های نوبت
public enum AppointmentStatus
{
    Pending,      // در انتظار تایید
    Confirmed,    // تایید شده
    Completed,    // انجام شده
    Cancelled     // لغو شده
}
```

### 5️⃣ City (شهر)
```csharp
public class City
{
    public int Id { get; set; }
    public string Name { get; set; }                // نام شهر
    public string Province { get; set; }            // استان
    
    // روابط
    public List<Barbershop> Barbershops { get; set; }
}
```

### 6️⃣ BarberSchedule (برنامه زمانی آرایشگر)
```csharp
public class BarberSchedule
{
    public int Id { get; set; }
    public string UserId { get; set; }              // آرایشگر
    public int BarbershopId { get; set; }           // آرایشگاه
    public DayOfWeek DayOfWeek { get; set; }        // روز هفته
    public TimeSpan StartTime { get; set; }         // ساعت شروع
    public TimeSpan EndTime { get; set; }           // ساعت پایان
    public bool IsAvailable { get; set; }           // در دسترس بودن
    public DateTime Date { get; set; }              // تاریخ
}
```

### 7️⃣ BlockedDate (روزهای تعطیل)
```csharp
public class BlockedDate
{
    public int Id { get; set; }
    public int BarbershopId { get; set; }           // آرایشگاه
    public DateTime Date { get; set; }              // تاریخ تعطیلی
    public string Reason { get; set; }              // دلیل تعطیلی
    
    // روابط
    public Barbershop Barbershop { get; set; }
}
```

### 8️⃣ TimeSlot (بازه زمانی)
```csharp
public class TimeSlot
{
    public int Id { get; set; }
    public int BarbershopId { get; set; }           // آرایشگاه
    public DateTime Date { get; set; }              // تاریخ
    public TimeSpan StartTime { get; set; }         // ساعت شروع
    public TimeSpan EndTime { get; set; }           // ساعت پایان
    public bool IsAvailable { get; set; }           // در دسترس بودن
    public bool IsBlocked { get; set; }             // بلوک شده
    public TimeSlotType SlotType { get; set; }      // نوع بازه
}
```


---

## ✨ ویژگی‌های اصلی

### 🔐 سیستم احراز هویت و مجوزدهی
- ثبت‌نام و ورود کاربران با ASP.NET Core Identity
- بازیابی رمز عبور از طریق ایمیل
- مدیریت نقش‌های کاربری (Admin, Barber, Customer)
- محافظت از صفحات با Authorization Attributes
- نشست‌های امن با Cookie Authentication

### 👤 پنل کاربری
- **پروفایل شخصی**: مشاهده و ویرایش اطلاعات کاربری
- **تاریخچه نوبت‌ها**: مشاهده نوبت‌های گذشته و آینده
- **مدیریت نوبت‌ها**: لغو یا تغییر نوبت‌ها
- **آمار شخصی**: تعداد نوبت‌ها و مبلغ کل خرج شده

### 🏪 مدیریت آرایشگاه‌ها
- ثبت و ویرایش اطلاعات آرایشگاه
- آپلود تصویر آرایشگاه
- تنظیم ساعات کاری و روزهای تعطیل
- مدیریت خدمات و قیمت‌گذاری
- فعال/غیرفعال کردن آرایشگاه

### 📅 سیستم رزرو نوبت
- **انتخاب شهر و آرایشگاه**: جستجو و فیلتر آرایشگاه‌ها
- **انتخاب خدمت**: مشاهده لیست خدمات و قیمت‌ها
- **تقویم هوشمند**: نمایش روزهای خالی و پر
- **انتخاب ساعت**: نمایش ساعات در دسترس
- **تایید نوبت**: ثبت نهایی با اطلاعات کامل
- **اعلان‌ها**: ارسال پیامک/ایمیل تایید نوبت

### 🎛 پنل مدیریت (Admin Panel)
#### داشبورد
- نمایش آمار کلی سیستم (کاربران، آرایشگاه‌ها، نوبت‌ها)
- نمودارهای تحلیلی (نوبت‌های روزانه، درآمد ماهانه)
- نوبت‌های امروز و در انتظار تایید
- فعالیت‌های اخیر سیستم

#### مدیریت کاربران
- مشاهده لیست تمام کاربران
- جستجو و فیلتر کاربران
- فعال/غیرفعال کردن حساب کاربری
- تغییر نقش کاربران
- حذف کاربران

#### مدیریت آرایشگاه‌ها
- مشاهده و ویرایش آرایشگاه‌ها
- تایید یا رد آرایشگاه‌های جدید
- مدیریت خدمات هر آرایشگاه
- مشاهده آمار هر آرایشگاه

#### مدیریت نوبت‌ها
- مشاهده تمام نوبت‌ها
- فیلتر بر اساس وضعیت (تایید شده، انجام شده، لغو شده)
- تغییر وضعیت نوبت‌ها
- حذف نوبت‌ها
- صادرات گزارش‌ها

#### گزارش‌گیری
- گزارش نوبت‌های روزانه/ماهانه
- گزارش درآمد
- گزارش محبوب‌ترین خدمات
- گزارش فعال‌ترین آرایشگاه‌ها
- نمودارهای تحلیلی

### 🔍 جستجو و فیلتر
- جستجوی آرایشگاه بر اساس نام، آدرس، شهر
- فیلتر بر اساس خدمات ارائه شده
- مرتب‌سازی بر اساس قیمت، امتیاز، محبوبیت
- نمایش آرایشگاه‌های نزدیک (با استفاده از موقعیت جغرافیایی)

### 📊 آمار و گزارش‌ها
- تعداد کل کاربران، آرایشگاه‌ها، نوبت‌ها
- نوبت‌های امروز و این ماه
- درآمد ماهانه و سالانه
- نمودار رشد کاربران
- نمودار نوبت‌های روزانه
- محبوب‌ترین خدمات و آرایشگاه‌ها

### 🛡 امنیت
- رمزنگاری رمز عبور با Identity Password Hasher
- محافظت در برابر CSRF با Anti-Forgery Tokens
- اعتبارسنجی ورودی‌ها (Input Validation)
- محدودیت تعداد درخواست‌ها (Rate Limiting)
- لاگ‌گیری از فعالیت‌های مهم


---

## 📋 پیش‌نیازها

قبل از نصب و اجرای پروژه، موارد زیر را نصب کنید:

### نرم‌افزارهای مورد نیاز
- **.NET 9.0 SDK** یا بالاتر
  - دانلود از: https://dotnet.microsoft.com/download
  - بررسی نسخه: `dotnet --version`

- **SQL Server 2019** یا بالاتر
  - SQL Server Express (رایگان): https://www.microsoft.com/sql-server/sql-server-downloads
  - یا SQL Server Developer Edition
  - یا SQL Server LocalDB

- **Visual Studio 2022** (پیشنهادی) یا **VS Code**
  - Visual Studio 2022 Community (رایگان): https://visualstudio.microsoft.com/
  - با Workload: ASP.NET and web development

### ابزارهای اختیاری
- **SQL Server Management Studio (SSMS)**: برای مدیریت پایگاه داده
- **Postman**: برای تست API ها
- **Git**: برای مدیریت نسخه

---

## 🚀 نصب و راه‌اندازی

### 1️⃣ دانلود پروژه
```bash
# کلون کردن ریپازیتوری
git clone https://github.com/yourusername/RazorKing.git

# ورود به پوشه پروژه
cd RazorKing
```

### 2️⃣ بازیابی پکیج‌ها
```bash
# بازیابی NuGet Packages
dotnet restore
```

### 3️⃣ تنظیم Connection String
فایل `appsettings.json` را باز کنید و Connection String را ویرایش کنید:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=RazorKingDb;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true;Encrypt=false"
  }
}
```

**نکات مهم:**
- `Server=.` یا `Server=localhost` برای SQL Server محلی
- `Server=(localdb)\\mssqllocaldb` برای LocalDB
- برای SQL Server روی شبکه: `Server=YOUR_SERVER_NAME;Database=RazorKingDb;User Id=sa;Password=YOUR_PASSWORD;`

### 4️⃣ ایجاد پایگاه داده
```bash
# اعمال مایگریشن‌ها و ایجاد دیتابیس
dotnet ef database update

# یا در Package Manager Console در Visual Studio:
Update-Database
```

### 5️⃣ اجرای پروژه
```bash
# اجرای پروژه
dotnet run

# یا در Visual Studio: F5 یا Ctrl+F5
```

پروژه روی آدرس زیر اجرا می‌شود:
- **HTTP**: http://localhost:5000
- **HTTPS**: https://localhost:5001

### 6️⃣ ورود به پنل مدیریت
پس از اجرای پروژه، یک کاربر Admin به صورت خودکار ایجاد می‌شود:

```
ایمیل: admin@razorking.com
رمز عبور: Admin123!
```

**⚠️ هشدار امنیتی**: حتماً رمز عبور پیش‌فرض را تغییر دهید!

---

## 🗄 تنظیمات پایگاه داده

### ساختار دیتابیس
پروژه از **Entity Framework Core Code-First** استفاده می‌کند. جداول اصلی:

```
📊 RazorKingDb
├── AspNetUsers              (کاربران - Identity)
├── AspNetRoles              (نقش‌ها - Identity)
├── AspNetUserRoles          (نقش‌های کاربران)
├── Cities                   (شهرها)
├── Barbershops              (آرایشگاه‌ها)
├── Services                 (خدمات)
├── Appointments             (نوبت‌ها)
├── AppointmentServices      (خدمات هر نوبت)
├── BarberSchedules          (برنامه زمانی آرایشگران)
├── BlockedDates             (روزهای تعطیل)
├── BlockedTimeSlots         (ساعات بلوک شده)
└── Time                     (بازه‌های زمانی)
```

### مایگریشن‌ها
لیست مایگریشن‌های موجود:
```bash
# مشاهده لیست مایگریشن‌ها
dotnet ef migrations list
```

مایگریشن‌های اصلی:
- `InitialCreate`: ایجاد جداول اولیه
- `Update_FieldInDataBase`: به‌روزرسانی فیلدها
- `AddBarberIdAndCompletedAtToAppointment`: اضافه کردن فیلدهای آرایشگر
- `AddPanelAdmin`: اضافه کردن پنل مدیریت
- `UpdateTableNameTime`: به‌روزرسانی جدول زمان

### ایجاد مایگریشن جدید
```bash
# ایجاد مایگریشن جدید
dotnet ef migrations add YourMigrationName

# اعمال مایگریشن
dotnet ef database update

# بازگشت به مایگریشن قبلی
dotnet ef database update PreviousMigrationName

# حذف آخرین مایگریشن
dotnet ef migrations remove
```

### Seed Data (داده‌های اولیه)
پروژه به صورت خودکار داده‌های زیر را ایجاد می‌کند:

**شهرهای استان گلستان:**
- گرگان
- گنبد کاووس
- علی آباد کتول
- آق قلا
- بندر گز
- کردکوی
- آزادشهر
- رامیان
- مینودشت
- کلاله

**نقش‌های کاربری:**
- Admin (مدیر سیستم)
- Barber (آرایشگر)
- Customer (مشتری - پیش‌فرض)

**کاربر مدیر:**
- ایمیل: admin@razorking.com
- رمز: Admin123!


---

## 👥 نقش‌های کاربری

### 🔴 Admin (مدیر سیستم)
**دسترسی‌ها:**
- ✅ دسترسی کامل به پنل مدیریت
- ✅ مدیریت کاربران (ایجاد، ویرایش، حذف، تغییر نقش)
- ✅ مدیریت آرایشگاه‌ها (تایید، رد، ویرایش، حذف)
- ✅ مدیریت شهرها (ایجاد، ویرایش، حذف)
- ✅ مدیریت خدمات (ایجاد، ویرایش، حذف)
- ✅ مدیریت نوبت‌ها (مشاهده، تغییر وضعیت، حذف)
- ✅ مشاهده گزارش‌ها و آمار کامل
- ✅ تنظیمات سیستم

**صفحات اختصاصی:**
- `/Admin/Index` - داشبورد مدیریت
- `/Admin/Users` - مدیریت کاربران
- `/Admin/Barbershops` - مدیریت آرایشگاه‌ها
- `/Admin/Services` - مدیریت خدمات
- `/Admin/Appointments` - مدیریت نوبت‌ها
- `/Admin/Cities` - مدیریت شهرها
- `/Admin/Reports` - گزارش‌ها

### 🟡 Barber (آرایشگر / صاحب آرایشگاه)
**دسترسی‌ها:**
- ✅ مدیریت آرایشگاه خود
- ✅ مدیریت خدمات آرایشگاه
- ✅ مشاهده و مدیریت نوبت‌های آرایشگاه
- ✅ تنظیم ساعات کاری و روزهای تعطیل
- ✅ مشاهده آمار و گزارش آرایشگاه
- ✅ تایید یا لغو نوبت‌ها
- ❌ دسترسی به پنل مدیریت کل سیستم

**صفحات اختصاصی:**
- `/Barber/Dashboard` - داشبورد آرایشگر
- `/Barber/Appointments` - نوبت‌های آرایشگاه
- `/Barber/Services` - مدیریت خدمات
- `/Barber/Schedule` - برنامه زمانی

### 🟢 Customer (مشتری)
**دسترسی‌ها:**
- ✅ رزرو نوبت آنلاین
- ✅ مشاهده تاریخچه نوبت‌های خود
- ✅ لغو نوبت‌های آینده
- ✅ ویرایش پروفایل شخصی
- ✅ جستجوی آرایشگاه‌ها و خدمات
- ❌ دسترسی به پنل مدیریت
- ❌ مشاهده نوبت‌های سایر کاربران

**صفحات اختصاصی:**
- `/Profile/Index` - پروفایل کاربری
- `/Profile/Appointments` - نوبت‌های من
- `/Booking/Index` - رزرو نوبت جدید

---

## 🔌 API Endpoints

### Authentication APIs
```http
POST   /Account/Register          # ثبت‌نام کاربر جدید
POST   /Account/Login             # ورود به سیستم
POST   /Account/Logout            # خروج از سیستم
POST   /Account/ForgotPassword    # فراموشی رمز عبور
POST   /Account/ResetPassword     # بازنشانی رمز عبور
```

### Booking APIs
```http
GET    /Booking/Index                              # صفحه رزرو نوبت
GET    /Booking/GetBarbershops?cityId={id}        # دریافت آرایشگاه‌های یک شهر
GET    /Booking/GetServices?barbershopId={id}     # دریافت خدمات یک آرایشگاه
GET    /Booking/GetAvailableDates?barbershopId={id}&serviceId={id}  # روزهای خالی
GET    /Booking/GetAvailableTimes?barbershopId={id}&serviceId={id}&date={date}  # ساعات خالی
POST   /Booking/CreateAppointment                 # ایجاد نوبت جدید
GET    /Booking/Confirmation/{id}                 # صفحه تایید نوبت
GET    /Booking/CheckAuthStatus                   # بررسی وضعیت احراز هویت
```

### Home APIs
```http
GET    /Home/Index                                # صفحه اصلی
GET    /Home/GetCityStats                         # آمار شهرها
GET    /Home/GetCityBarbershops?cityId={id}      # آرایشگاه‌های یک شهر
GET    /Home/SearchBarbershops?query={q}&cityId={id}  # جستجوی آرایشگاه
GET    /Home/City/{id}                            # صفحه شهر
GET    /Home/GetBarbershopDetails?barbershopId={id}   # جزئیات آرایشگاه
```

### Profile APIs
```http
GET    /Profile/Index                             # پروفایل کاربری
GET    /Profile/Appointments                      # نوبت‌های کاربر
POST   /Profile/CancelAppointment/{id}           # لغو نوبت
POST   /Profile/UpdateProfile                     # به‌روزرسانی پروفایل
```

### Admin APIs
```http
GET    /Admin/Index                               # داشبورد مدیریت
GET    /Admin/Users                               # لیست کاربران
POST   /Admin/ToggleUserStatus                    # فعال/غیرفعال کردن کاربر
POST   /Admin/DeleteUser                          # حذف کاربر

GET    /Admin/Barbershops                         # لیست آرایشگاه‌ها
POST   /Admin/ToggleBarbershopStatus             # فعال/غیرفعال کردن آرایشگاه
POST   /Admin/DeleteBarbershop                    # حذف آرایشگاه

GET    /Admin/Services                            # لیست خدمات
POST   /Admin/ToggleServiceStatus                # فعال/غیرفعال کردن خدمت
POST   /Admin/DeleteService                       # حذف خدمت

GET    /Admin/Appointments                        # لیست نوبت‌ها
POST   /Admin/UpdateAppointmentStatus            # تغییر وضعیت نوبت
POST   /Admin/DeleteAppointment                   # حذف نوبت

GET    /Admin/Cities                              # لیست شهرها
POST   /Admin/CreateCity                          # ایجاد شهر جدید
POST   /Admin/EditCity                            # ویرایش شهر
POST   /Admin/DeleteCity                          # حذف شهر

GET    /Admin/Reports                             # گزارش‌ها و آمار
```

### Debug APIs (فقط در محیط Development)
```http
GET    /Home/TestData                             # تست داده‌ها
GET    /Home/CheckUserAppointments                # بررسی نوبت‌های کاربر
GET    /Home/DebugAllAppointments                 # دیباگ تمام نوبت‌ها
POST   /Home/CreateTestAppointment                # ایجاد نوبت تستی
GET    /Booking/DebugAppointments                 # دیباگ نوبت‌ها
GET    /Booking/DebugUserAppointments             # دیباگ نوبت‌های کاربر
GET    /Booking/DebugBarbershopHours              # دیباگ ساعات کاری
GET    /Admin/DebugAppointments                   # دیباگ نوبت‌ها (ادمین)
```

---

## 🎨 اسکرین‌شات‌ها

### صفحه اصلی
صفحه اصلی با نمایش شهرها، آرایشگاه‌های برتر و آمار سیستم

### پنل مدیریت
داشبورد مدیریت با نمودارها و آمار کامل سیستم

### صفحه رزرو نوبت
فرآیند رزرو نوبت با انتخاب شهر، آرایشگاه، خدمت، تاریخ و ساعت

### پروفایل کاربری
نمایش اطلاعات کاربر و تاریخچه نوبت‌ها

---

## 🔧 تنظیمات پیشرفته

### تنظیمات Identity
در فایل `Program.cs` می‌توانید تنظیمات Identity را شخصی‌سازی کنید:

```csharp
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options => {
    // تنظیمات رمز عبور
    options.Password.RequireDigit = true;           // نیاز به عدد
    options.Password.RequiredLength = 6;            // حداقل طول
    options.Password.RequireNonAlphanumeric = false; // نیاز به کاراکتر خاص
    options.Password.RequireUppercase = false;      // نیاز به حرف بزرگ
    options.Password.RequireLowercase = false;      // نیاز به حرف کوچک
    
    // تنظیمات ورود
    options.SignIn.RequireConfirmedAccount = false; // نیاز به تایید ایمیل
    
    // تنظیمات قفل شدن حساب
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
})
```

### تنظیمات Cookie
```csharp
builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Account/Login";           // مسیر ورود
    options.LogoutPath = "/Account/Logout";         // مسیر خروج
    options.AccessDeniedPath = "/Account/AccessDenied"; // مسیر عدم دسترسی
    options.ExpireTimeSpan = TimeSpan.FromDays(30); // مدت اعتبار کوکی
    options.SlidingExpiration = true;               // تمدید خودکار
});
```

### تنظیمات Connection String
برای محیط‌های مختلف می‌توانید Connection String های متفاوت تعریف کنید:

**appsettings.Development.json** (محیط توسعه):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=RazorKingDb_Dev;Trusted_Connection=true;TrustServerCertificate=true"
  }
}
```

**appsettings.Production.json** (محیط تولید):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_PRODUCTION_SERVER;Database=RazorKingDb;User Id=YOUR_USER;Password=YOUR_PASSWORD;Encrypt=true"
  }
}
```

### فعال‌سازی HTTPS
برای اجبار استفاده از HTTPS در محیط تولید:

```csharp
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
    app.UseHttpsRedirection();
}
```

---

## 🐛 عیب‌یابی (Troubleshooting)

### مشکل: خطای اتصال به دیتابیس
**راه‌حل:**
1. مطمئن شوید SQL Server در حال اجرا است
2. Connection String را بررسی کنید
3. دسترسی کاربر به دیتابیس را چک کنید
```bash
# تست اتصال
dotnet ef database update
```

### مشکل: خطای مایگریشن
**راه‌حل:**
```bash
# حذف دیتابیس و ایجاد مجدد
dotnet ef database drop
dotnet ef database update

# یا حذف آخرین مایگریشن
dotnet ef migrations remove
```

### مشکل: خطای 404 برای فایل‌های استاتیک
**راه‌حل:**
مطمئن شوید `app.UseStaticFiles()` در `Program.cs` فراخوانی شده است.

### مشکل: خطای Authorization
**راه‌حل:**
1. مطمئن شوید `app.UseAuthentication()` قبل از `app.UseAuthorization()` قرار دارد
2. نقش کاربر را بررسی کنید
3. کوکی‌های مرورگر را پاک کنید

### مشکل: خطای CORS
**راه‌حل:**
اگر از API خارجی استفاده می‌کنید، CORS را فعال کنید:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder.AllowAnyOrigin()
                         .AllowAnyMethod()
                         .AllowAnyHeader());
});

app.UseCors("AllowAll");
```

---

## 📚 مستندات اضافی

### ساختار کنترلرها

#### HomeController
مسئول صفحه اصلی، جستجو و نمایش اطلاعات عمومی
- `Index()`: صفحه اصلی با آمار و آرایشگاه‌های برتر
- `City(int id)`: صفحه شهر با لیست آرایشگاه‌ها
- `SearchBarbershops()`: جستجوی آرایشگاه‌ها
- `GetCityStats()`: دریافت آمار شهرها

#### BookingController
مسئول فرآیند رزرو نوبت
- `Index()`: صفحه شروع رزرو
- `GetBarbershops(int cityId)`: دریافت آرایشگاه‌های یک شهر
- `GetServices(int barbershopId)`: دریافت خدمات
- `GetAvailableDates()`: دریافت روزهای خالی
- `GetAvailableTimes()`: دریافت ساعات خالی
- `CreateAppointment()`: ثبت نوبت جدید
- `Confirmation(int id)`: صفحه تایید نوبت

#### AdminController
مسئول پنل مدیریت
- `Index()`: داشبورد مدیریت
- `Users()`: مدیریت کاربران
- `Barbershops()`: مدیریت آرایشگاه‌ها
- `Services()`: مدیریت خدمات
- `Appointments()`: مدیریت نوبت‌ها
- `Cities()`: مدیریت شهرها
- `Reports()`: گزارش‌ها و آمار

#### AccountController
مسئول احراز هویت
- `Register()`: ثبت‌نام کاربر جدید
- `Login()`: ورود به سیستم
- `Logout()`: خروج از سیستم
- `ForgotPassword()`: فراموشی رمز عبور
- `ResetPassword()`: بازنشانی رمز عبور

#### ProfileController
مسئول پروفایل کاربری
- `Index()`: نمایش پروفایل
- `Appointments()`: نوبت‌های کاربر
- `Edit()`: ویرایش پروفایل
- `CancelAppointment(int id)`: لغو نوبت

### ViewModels

#### BookingViewModel
```csharp
public class BookingViewModel
{
    public List<City> Cities { get; set; }
    public int? SelectedCityId { get; set; }
    public int? SelectedBarbershopId { get; set; }
    public int? SelectedServiceId { get; set; }
}
```

#### AdminDashboardViewModel
```csharp
public class AdminDashboardViewModel
{
    public int TotalUsers { get; set; }
    public int TotalBarbershops { get; set; }
    public int TotalAppointments { get; set; }
    public int TotalCities { get; set; }
    public int TotalServices { get; set; }
    public int PendingAppointments { get; set; }
    public int ActiveBarbershops { get; set; }
    public int TodayAppointments { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public List<Appointment> RecentAppointments { get; set; }
}
```

#### ProfileViewModel
```csharp
public class ProfileViewModel
{
    public ApplicationUser User { get; set; }
    public List<Appointment> Appointments { get; set; }
    public List<Appointment> UpcomingAppointments { get; set; }
    public List<Appointment> PastAppointments { get; set; }
    public int TotalAppointments { get; set; }
    public decimal TotalSpent { get; set; }
}
```

---

## 🚀 استقرار (Deployment)

### استقرار روی IIS

#### 1. نصب پیش‌نیازها
- نصب .NET 9.0 Hosting Bundle
- فعال‌سازی IIS و ASP.NET Core Module

#### 2. Publish پروژه
```bash
dotnet publish -c Release -o ./publish
```

#### 3. تنظیمات IIS
1. ایجاد Application Pool جدید با .NET CLR Version = No Managed Code
2. ایجاد Website جدید و انتخاب پوشه publish
3. تنظیم Connection String در appsettings.json

#### 4. تنظیمات web.config
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" />
    </handlers>
    <aspNetCore processPath="dotnet" 
                arguments=".\RazorKing.dll" 
                stdoutLogEnabled="true" 
                stdoutLogFile=".\logs\stdout" />
  </system.webServer>
</configuration>
```

### استقرار روی Azure

#### 1. ایجاد Azure App Service
```bash
az webapp create --resource-group MyResourceGroup --plan MyPlan --name razorking-app
```

#### 2. تنظیم Connection String
در Azure Portal > Configuration > Connection Strings

#### 3. Deploy
```bash
az webapp deployment source config-zip --resource-group MyResourceGroup --name razorking-app --src publish.zip
```

### استقرار با Docker

#### Dockerfile
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["RazorKing.csproj", "./"]
RUN dotnet restore "RazorKing.csproj"
COPY . .
RUN dotnet build "RazorKing.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "RazorKing.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "RazorKing.dll"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "5000:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Server=db;Database=RazorKingDb;User=sa;Password=YourPassword123!
    depends_on:
      - db
  
  db:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourPassword123!
    ports:
      - "1433:1433"
```

---

## 🧪 تست

### اجرای تست‌ها
```bash
# اجرای تمام تست‌ها
dotnet test

# اجرای تست‌ها با Coverage
dotnet test /p:CollectCoverage=true
```

### تست API ها با Postman

#### ثبت‌نام کاربر
```http
POST /Account/Register
Content-Type: application/json

{
  "firstName": "علی",
  "lastName": "احمدی",
  "email": "ali@example.com",
  "password": "Pass123!",
  "confirmPassword": "Pass123!",
  "phoneNumber": "09123456789"
}
```

#### ورود به سیستم
```http
POST /Account/Login
Content-Type: application/json

{
  "email": "ali@example.com",
  "password": "Pass123!",
  "rememberMe": true
}
```

#### ایجاد نوبت
```http
POST /Booking/CreateAppointment
Content-Type: application/json

{
  "barbershopId": 1,
  "serviceIds": [1],
  "date": "2024-12-01",
  "time": "10:00",
  "customerName": "علی احمدی",
  "customerPhone": "09123456789",
  "customerEmail": "ali@example.com",
  "totalPrice": 50000,
  "notes": "لطفاً دقیق باشید"
}
```

---

## 📊 بهینه‌سازی عملکرد

### کش کردن (Caching)
```csharp
// Response Caching
builder.Services.AddResponseCaching();

// در کنترلر
[ResponseCache(Duration = 300, VaryByHeader = "User-Agent")]
public async Task<IActionResult> Index()
{
    // ...
}
```

### استفاده از AsNoTracking
برای کوئری‌هایی که فقط خواندنی هستند:
```csharp
var barbershops = await _context.Barbershops
    .AsNoTracking()
    .Include(b => b.City)
    .ToListAsync();
```

### Pagination
```csharp
public async Task<IActionResult> Barbershops(int page = 1, int pageSize = 20)
{
    var barbershops = await _context.Barbershops
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();
    
    return View(barbershops);
}
```

### استفاده از Select برای Projection
```csharp
var services = await _context.Services
    .Select(s => new {
        s.Id,
        s.Name,
        s.Price
    })
    .ToListAsync();
```

---

## 🔐 امنیت

### محافظت در برابر SQL Injection
Entity Framework Core به صورت خودکار از Parameterized Queries استفاده می‌کند.

### محافظت در برابر XSS
Razor به صورت خودکار HTML را Encode می‌کند. برای نمایش HTML خام:
```razor
@Html.Raw(Model.Description) // فقط برای محتوای امن
```

### محافظت در برابر CSRF
```razor
<form method="post">
    @Html.AntiForgeryToken()
    <!-- فرم -->
</form>
```

در کنترلر:
```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public async Task<IActionResult> Create(Model model)
{
    // ...
}
```

### رمزنگاری رمز عبور
ASP.NET Core Identity به صورت خودکار رمز عبور را با الگوریتم PBKDF2 رمزنگاری می‌کند.

### HTTPS
```csharp
builder.Services.AddHttpsRedirection(options =>
{
    options.RedirectStatusCode = StatusCodes.Status307TemporaryRedirect;
    options.HttpsPort = 443;
});
```

---

## 📝 لاگ‌گیری (Logging)

### تنظیمات Logging در appsettings.json
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  }
}
```

### استفاده از Logger در کنترلر
```csharp
public class BookingController : Controller
{
    private readonly ILogger<BookingController> _logger;
    
    public BookingController(ILogger<BookingController> logger)
    {
        _logger = logger;
    }
    
    public IActionResult Index()
    {
        _logger.LogInformation("Booking page accessed");
        // ...
    }
}
```

### سطوح Log
- `LogTrace`: اطلاعات بسیار جزئی
- `LogDebug`: اطلاعات دیباگ
- `LogInformation`: اطلاعات عمومی
- `LogWarning`: هشدارها
- `LogError`: خطاها
- `LogCritical`: خطاهای بحرانی

---

## 🤝 مشارکت در پروژه

ما از مشارکت شما استقبال می‌کنیم! برای مشارکت:

### 1. Fork کردن پروژه
```bash
git clone https://github.com/yourusername/RazorKing.git
```

### 2. ایجاد Branch جدید
```bash
git checkout -b feature/AmazingFeature
```

### 3. Commit کردن تغییرات
```bash
git commit -m "Add some AmazingFeature"
```

### 4. Push کردن به Branch
```bash
git push origin feature/AmazingFeature
```

### 5. ایجاد Pull Request
از طریق GitHub یک Pull Request ایجاد کنید.

### راهنمای مشارکت
- کد تمیز و خوانا بنویسید
- از اصول SOLID پیروی کنید
- کامنت‌های مناسب اضافه کنید
- تست‌های لازم را بنویسید
- مستندات را به‌روز کنید

---

## 📞 پشتیبانی و تماس

- **ایمیل**: support@razorking.com
- **وبسایت**: https://razorking.com
- **GitHub Issues**: https://github.com/yourusername/RazorKing/issues
- **تلگرام**: @RazorKingSupport

---

## 📄 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است. برای اطلاعات بیشتر فایل [LICENSE](LICENSE) را مطالعه کنید.

```
MIT License

Copyright (c) 2024 RazorKing

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 تشکر و قدردانی

از تمام کسانی که در توسعه این پروژه مشارکت داشته‌اند، تشکر می‌کنیم:

- تیم توسعه ASP.NET Core
- جامعه Entity Framework Core
- تمام مشارکت‌کنندگان و کاربران

---

## 🗺 نقشه راه (Roadmap)

### نسخه 2.0 (در دست توسعه)
- [ ] سیستم پرداخت آنلاین
- [ ] ارسال پیامک و ایمیل خودکار
- [ ] سیستم امتیازدهی و نظرات
- [ ] اپلیکیشن موبایل (React Native)
- [ ] پنل آرایشگر پیشرفته
- [ ] سیستم تخفیف و کوپن
- [ ] گزارش‌گیری پیشرفته با نمودارها
- [ ] پشتیبانی از چند زبان
- [ ] یکپارچه‌سازی با تقویم Google

### نسخه 3.0 (آینده)
- [ ] هوش مصنوعی برای پیشنهاد ساعت بهینه
- [ ] سیستم وفاداری مشتریان
- [ ] پنل تحلیلی پیشرفته
- [ ] API عمومی برای توسعه‌دهندگان
- [ ] سیستم چت آنلاین
- [ ] یکپارچه‌سازی با شبکه‌های اجتماعی

---

## 📚 منابع مفید

### مستندات
- [ASP.NET Core Documentation](https://docs.microsoft.com/aspnet/core)
- [Entity Framework Core Documentation](https://docs.microsoft.com/ef/core)
- [ASP.NET Core Identity Documentation](https://docs.microsoft.com/aspnet/core/security/authentication/identity)

### آموزش‌ها
- [Microsoft Learn - ASP.NET Core](https://learn.microsoft.com/aspnet/core)
- [Pluralsight - ASP.NET Core Path](https://www.pluralsight.com/paths/aspnet-core)
- [YouTube - Kudvenkat ASP.NET Core](https://www.youtube.com/playlist?list=PL6n9fhu94yhVkdrusLaQsfERmL_Jh4XmU)

### ابزارها
- [Visual Studio 2022](https://visualstudio.microsoft.com/)
- [SQL Server Management Studio](https://docs.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms)
- [Postman](https://www.postman.com/)
- [Git](https://git-scm.com/)

---

## ❓ سوالات متداول (FAQ)

### چگونه رمز عبور ادمین را تغییر دهم؟
پس از ورود با حساب ادمین، به پروفایل خود بروید و رمز عبور را تغییر دهید.

### چگونه آرایشگاه جدید اضافه کنم؟
از پنل مدیریت > آرایشگاه‌ها > ایجاد آرایشگاه جدید استفاده کنید.

### چگونه شهر جدید اضافه کنم؟
از پنل مدیریت > شهرها > ایجاد شهر جدید استفاده کنید.

### آیا می‌توانم از دیتابیس دیگری غیر از SQL Server استفاده کنم؟
بله، می‌توانید از PostgreSQL، MySQL یا SQLite استفاده کنید. فقط کافی است پکیج مربوطه را نصب و Connection String را تغییر دهید.

### چگونه می‌توانم تم سایت را تغییر دهم؟
فایل‌های CSS در پوشه `wwwroot/css` قرار دارند. می‌توانید آن‌ها را ویرایش کنید.

### آیا پشتیبانی از تاریخ شمسی وجود دارد؟
بله، سیستم از تاریخ شمسی پشتیبانی می‌کند. می‌توانید در Helper ها تنظیمات را تغییر دهید.

---

<div align="center">

### ⭐ اگر این پروژه برایتان مفید بود، لطفاً یک ستاره بدهید!

**ساخته شده با ❤️ توسط تیم RazorKing**

[🏠 صفحه اصلی](https://razorking.com) • 
[📖 مستندات](https://docs.razorking.com) • 
[🐛 گزارش باگ](https://github.com/yourusername/RazorKing/issues) • 
[💡 درخواست ویژگی](https://github.com/yourusername/RazorKing/issues/new)

---

**نسخه فعلی**: 1.0.0  
**آخرین به‌روزرسانی**: نوامبر 2024  
**وضعیت**: 🟢 فعال و در حال توسعه

</div>

</div>
