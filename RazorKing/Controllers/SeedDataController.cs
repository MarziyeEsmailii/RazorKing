using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RazorKing.Data;
using RazorKing.Models;
using RazorKing.Helpers;

namespace RazorKing.Controllers
{
    public class SeedDataController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public SeedDataController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> SeedCities()
        {
            try
            {
                Console.WriteLine("🌱 شروع Seed Cities...");
                
                // بررسی اینکه آیا شهرها وجود دارند
                var existingCities = await _context.Cities.CountAsync();
                Console.WriteLine($"📊 شهرهای موجود: {existingCities}");
                
                if (existingCities > 0)
                {
                    return Json(new { success = true, message = $"{existingCities} شهر از قبل وجود دارد" });
                }

                // اضافه کردن شهرهای استان گلستان
                var cities = new[]
                {
                    new City { Name = "گرگان", Province = "گلستان" },
                    new City { Name = "گنبد کاووس", Province = "گلستان" },
                    new City { Name = "علی آباد کتول", Province = "گلستان" },
                    new City { Name = "آق قلا", Province = "گلستان" },
                    new City { Name = "کردکوی", Province = "گلستان" },
                    new City { Name = "بندر گز", Province = "گلستان" },
                    new City { Name = "آزادشهر", Province = "گلستان" },
                    new City { Name = "رامیان", Province = "گلستان" },
                    new City { Name = "کلاله", Province = "گلستان" },
                    new City { Name = "مینودشت", Province = "گلستان" }
                };

                Console.WriteLine($"🌱 اضافه کردن {cities.Length} شهر...");
                
                _context.Cities.AddRange(cities);
                await _context.SaveChangesAsync();
                
                Console.WriteLine("✅ شهرها با موفقیت اضافه شدند");

                return Json(new { success = true, message = $"{cities.Length} شهر با موفقیت اضافه شد" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ خطا در Seed Cities: {ex.Message}");
                return Json(new { success = false, message = ex.Message });
            }
        }

        public async Task<IActionResult> SeedBarbershops()
        {
            try
            {
                // اول شهرها رو چک کن
                var citiesCount = await _context.Cities.CountAsync();
                if (citiesCount == 0)
                {
                    await SeedCities();
                }

                // اول نقش‌ها رو ایجاد کن
                await EnsureRolesExist();

                // کاربران آرایشگر ایجاد کن
                var barbers = await CreateBarbers();

                // آرایشگاه‌ها ایجاد کن
                await CreateBarbershops(barbers);

                return Json(new { success = true, message = "دیتای نمونه با موفقیت اضافه شد" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> SeedAllData()
        {
            try
            {
                Console.WriteLine("🌱 شروع Seed تمام داده‌ها...");

                // 1. شهرها
                await SeedCities();
                
                // 2. نقش‌ها
                await EnsureRolesExist();
                
                // 3. کاربران (آرایشگران و مشتریان)
                var barbers = await CreateBarbers();
                var customers = await CreateCustomers();
                
                // 4. آرایشگاه‌ها و خدمات
                var barbershops = await CreateBarbershopsWithServices(barbers);
                
                // 5. نوبت‌ها (گذشته، حال، آینده)
                await CreateAppointments(barbershops, customers);
                
                // 6. برنامه‌های کاری آرایشگران
                await CreateBarberSchedules(barbershops, barbers);
                
                // 7. روزهای مسدود
                await CreateBlockedDates(barbershops);
                
                // 8. ساعات مسدود
                await CreateBlockedTimeSlots(barbershops);
                
                // 9. اسلات‌های زمانی
                await CreateTimeSlots(barbershops);

                Console.WriteLine("✅ تمام داده‌ها با موفقیت اضافه شدند");
                return Json(new { success = true, message = "تمام داده‌های تستی با موفقیت اضافه شد" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ خطا در Seed All Data: {ex.Message}");
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> ClearAllData()
        {
            try
            {
                Console.WriteLine("🗑️ شروع پاک کردن تمام داده‌ها...");

                // حذف به ترتیب وابستگی
                _context.AppointmentServices.RemoveRange(_context.AppointmentServices);
                _context.Appointments.RemoveRange(_context.Appointments);
                _context.TimeSlots.RemoveRange(_context.TimeSlots);
                _context.BlockedTimeSlots.RemoveRange(_context.BlockedTimeSlots);
                _context.BlockedDates.RemoveRange(_context.BlockedDates);
                _context.BarberSchedules.RemoveRange(_context.BarberSchedules);
                _context.Services.RemoveRange(_context.Services);
                _context.Barbershops.RemoveRange(_context.Barbershops);
                _context.Cities.RemoveRange(_context.Cities);

                // حذف کاربران (به جز Admin)
                var usersToDelete = await _context.Users
                    .Where(u => u.Email != "admin@razorking.com")
                    .ToListAsync();
                
                foreach (var user in usersToDelete)
                {
                    await _userManager.DeleteAsync(user);
                }

                await _context.SaveChangesAsync();

                Console.WriteLine("✅ تمام داده‌ها پاک شدند");
                return Json(new { success = true, message = "تمام داده‌ها پاک شدند" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ خطا در پاک کردن داده‌ها: {ex.Message}");
                return Json(new { success = false, message = ex.Message });
            }
        }

        private async Task EnsureRolesExist()
        {
            string[] roleNames = { "Customer", "Barber" };

            foreach (var roleName in roleNames)
            {
                var roleExist = await _roleManager.RoleExistsAsync(roleName);
                if (!roleExist)
                {
                    await _roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }
        }

        private async Task<List<ApplicationUser>> CreateBarbers()
        {
            var barbers = new List<ApplicationUser>();
            var barberData = new[]
            {
                new { FirstName = "احمد", LastName = "محمدی", Email = "ahmad.mohammadi@example.com", Phone = "09111234567" },
                new { FirstName = "علی", LastName = "احمدی", Email = "ali.ahmadi@example.com", Phone = "09121234567" },
                new { FirstName = "حسن", LastName = "رضایی", Email = "hasan.rezaei@example.com", Phone = "09131234567" },
                new { FirstName = "محمد", LastName = "کریمی", Email = "mohammad.karimi@example.com", Phone = "09141234567" },
                new { FirstName = "رضا", LastName = "نوری", Email = "reza.nouri@example.com", Phone = "09151234567" },
                new { FirstName = "مهدی", LastName = "صادقی", Email = "mehdi.sadeghi@example.com", Phone = "09161234567" },
                new { FirstName = "امیر", LastName = "حسینی", Email = "amir.hosseini@example.com", Phone = "09171234567" },
                new { FirstName = "سعید", LastName = "مرادی", Email = "saeed.moradi@example.com", Phone = "09181234567" },
                new { FirstName = "فرهاد", LastName = "زارعی", Email = "farhad.zarei@example.com", Phone = "09191234567" },
                new { FirstName = "بهرام", LastName = "شریفی", Email = "bahram.sharifi@example.com", Phone = "09201234567" },
                new { FirstName = "کامران", LastName = "عباسی", Email = "kamran.abbasi@example.com", Phone = "09211234567" },
                new { FirstName = "داود", LastName = "فتحی", Email = "davood.fathi@example.com", Phone = "09221234567" },
                new { FirstName = "مسعود", LastName = "جعفری", Email = "masoud.jafari@example.com", Phone = "09231234567" },
                new { FirstName = "ناصر", LastName = "باقری", Email = "naser.bagheri@example.com", Phone = "09241234567" },
                new { FirstName = "یاسر", LastName = "طاهری", Email = "yaser.taheri@example.com", Phone = "09251234567" },
                new { FirstName = "مجید", LastName = "رحیمی", Email = "majid.rahimi@example.com", Phone = "09261234567" },
                new { FirstName = "حمید", LastName = "اکبری", Email = "hamid.akbari@example.com", Phone = "09271234567" },
                new { FirstName = "جواد", LastName = "موسوی", Email = "javad.mousavi@example.com", Phone = "09281234567" },
                new { FirstName = "فریدون", LastName = "قاسمی", Email = "fereydoun.ghasemi@example.com", Phone = "09291234567" },
                new { FirstName = "شهرام", LastName = "یوسفی", Email = "shahram.yousefi@example.com", Phone = "09301234567" }
            };

            foreach (var data in barberData)
            {
                var existingUser = await _userManager.FindByEmailAsync(data.Email);
                if (existingUser == null)
                {
                    var user = new ApplicationUser
                    {
                        UserName = data.Email,
                        Email = data.Email,
                        FirstName = data.FirstName,
                        LastName = data.LastName,
                        PhoneNumber = data.Phone,
                        EmailConfirmed = true
                    };

                    var result = await _userManager.CreateAsync(user, "Password123!");
                    if (result.Succeeded)
                    {
                        await _userManager.AddToRoleAsync(user, "Barber");
                        barbers.Add(user);
                    }
                }
                else
                {
                    barbers.Add(existingUser);
                }
            }

            return barbers;
        }

        private async Task CreateBarbershops(List<ApplicationUser> barbers)
        {
            var cities = await _context.Cities.ToListAsync();
            var barbershopNames = new[]
            {
                "آرایشگاه پریمیوم", "سالن زیبایی مردانه VIP", "آرایشگاه لوکس", "استایل مردانه", "آرایشگاه مدرن",
                "سالن آرایش حرفه‌ای", "آرایشگاه کلاسیک", "استایل پلاس", "آرایشگاه رویال", "سالن زیبایی اکسکلوسیو",
                "آرایشگاه الماس", "استایل کینگ", "آرایشگاه پلاتینیوم", "سالن مردانه شیک", "آرایشگاه گلد",
                "استایل مستر", "آرایشگاه امپریال", "سالن آرایش مدرن", "آرایشگاه اسپرت", "استایل پرو"
            };

            var descriptions = new[]
            {
                "آرایشگاه مردانه با خدمات حرفه‌ای و کیفیت بالا",
                "ارائه خدمات آرایشگری با جدیدترین تکنیک‌ها",
                "محیطی آرام و لوکس برای آقایان",
                "آرایشگاه مجهز با تجهیزات مدرن",
                "خدمات آرایشگری با کیفیت اروپایی",
                "تیم حرفه‌ای آرایشگران مجرب",
                "محیط بهداشتی و استاندارد",
                "آرایشگاه با سابقه درخشان",
                "خدمات ویژه برای آقایان شیک‌پوش",
                "آرایشگاه با امکانات کامل"
            };

            var serviceNames = new[]
            {
                "اصلاح مو", "اصلاح ریش", "شستشوی مو", "ماساژ سر", "رنگ مو",
                "کوتاهی مو", "اصلاح سبیل", "پاکسازی پوست", "ماسک مو", "استایل مو"
            };

            var random = new Random();
            int barberIndex = 0;

            foreach (var city in cities)
            {
                // هر شهر بین 5 تا 20 آرایشگاه
                int barbershopCount = random.Next(5, 21);

                for (int i = 0; i < barbershopCount && barberIndex < barbers.Count; i++)
                {
                    var barbershop = new Barbershop
                    {
                        Name = $"{barbershopNames[random.Next(barbershopNames.Length)]} {city.Name}",
                        Description = descriptions[random.Next(descriptions.Length)],
                        Address = $"خیابان {random.Next(1, 20)}, پلاک {random.Next(1, 100)}, {city.Name}",
                        Phone = $"0{random.Next(11, 99)}{random.Next(10000000, 99999999)}",
                        ImageUrl = ImageHelper.GetRandomBarbershopImage(),
                        CityId = city.Id,
                        UserId = barbers[barberIndex].Id,
                        OpenTime = new TimeSpan(8, 0, 0),
                        CloseTime = new TimeSpan(21, 0, 0),
                        WorkingDays = "شنبه,یکشنبه,دوشنبه,سه‌شنبه,چهارشنبه,پنج‌شنبه",
                        IsActive = true,
                        CreatedAt = DateTime.Now.AddDays(-random.Next(1, 365)),
                        UpdatedAt = DateTime.Now
                    };

                    _context.Barbershops.Add(barbershop);
                    await _context.SaveChangesAsync();

                    // هر آرایشگاه 3 تا 8 خدمت
                    int serviceCount = random.Next(3, 9);
                    var selectedServices = serviceNames.OrderBy(x => random.Next()).Take(serviceCount);

                    foreach (var serviceName in selectedServices)
                    {
                        var service = new Service
                        {
                            Name = serviceName,
                            Description = $"{serviceName} با کیفیت بالا و تجهیزات مدرن",
                            Price = random.Next(20000, 150000),
                            Duration = random.Next(15, 120),
                            BarbershopId = barbershop.Id,
                            IsActive = true,
                            CreatedAt = DateTime.Now
                        };

                        _context.Services.Add(service);
                    }

                    barberIndex++;
                }
            }

            await _context.SaveChangesAsync();
        }

        private async Task<List<ApplicationUser>> CreateCustomers()
        {
            Console.WriteLine("👥 ایجاد مشتریان...");
            
            var customers = new List<ApplicationUser>();
            var customerData = new[]
            {
                new { FirstName = "محمدرضا", LastName = "احمدی", Email = "mohammadreza.ahmadi@example.com", Phone = "09111111111" },
                new { FirstName = "علیرضا", LastName = "محمدی", Email = "alireza.mohammadi@example.com", Phone = "09122222222" },
                new { FirstName = "حسین", LastName = "رضایی", Email = "hossein.rezaei@example.com", Phone = "09133333333" },
                new { FirstName = "امیرحسین", LastName = "کریمی", Email = "amirhossein.karimi@example.com", Phone = "09144444444" },
                new { FirstName = "مهدی", LastName = "نوری", Email = "mehdi.nouri@example.com", Phone = "09155555555" },
                new { FirstName = "سعید", LastName = "صادقی", Email = "saeed.sadeghi@example.com", Phone = "09166666666" },
                new { FirstName = "فرهاد", LastName = "حسینی", Email = "farhad.hosseini@example.com", Phone = "09177777777" },
                new { FirstName = "بهرام", LastName = "مرادی", Email = "bahram.moradi@example.com", Phone = "09188888888" },
                new { FirstName = "کامران", LastName = "زارعی", Email = "kamran.zarei@example.com", Phone = "09199999999" },
                new { FirstName = "داود", LastName = "شریفی", Email = "davood.sharifi@example.com", Phone = "09200000000" },
                new { FirstName = "مسعود", LastName = "عباسی", Email = "masoud.abbasi@example.com", Phone = "09211111111" },
                new { FirstName = "ناصر", LastName = "فتحی", Email = "naser.fathi@example.com", Phone = "09222222222" },
                new { FirstName = "یاسر", LastName = "جعفری", Email = "yaser.jafari@example.com", Phone = "09233333333" },
                new { FirstName = "مجید", LastName = "باقری", Email = "majid.bagheri@example.com", Phone = "09244444444" },
                new { FirstName = "حمید", LastName = "طاهری", Email = "hamid.taheri@example.com", Phone = "09255555555" }
            };

            foreach (var data in customerData)
            {
                var existingUser = await _userManager.FindByEmailAsync(data.Email);
                if (existingUser == null)
                {
                    var user = new ApplicationUser
                    {
                        UserName = data.Email,
                        Email = data.Email,
                        FirstName = data.FirstName,
                        LastName = data.LastName,
                        PhoneNumber = data.Phone,
                        EmailConfirmed = true
                    };

                    var result = await _userManager.CreateAsync(user, "Password123!");
                    if (result.Succeeded)
                    {
                        await _userManager.AddToRoleAsync(user, "Customer");
                        customers.Add(user);
                    }
                }
                else
                {
                    customers.Add(existingUser);
                }
            }

            Console.WriteLine($"✅ {customers.Count} مشتری ایجاد شد");
            return customers;
        }

        private async Task<List<Barbershop>> CreateBarbershopsWithServices(List<ApplicationUser> barbers)
        {
            Console.WriteLine("🏪 ایجاد آرایشگاه‌ها و خدمات...");
            
            var cities = await _context.Cities.ToListAsync();
            var barbershops = new List<Barbershop>();
            
            var barbershopNames = new[]
            {
                "آرایشگاه پریمیوم", "سالن زیبایی مردانه VIP", "آرایشگاه لوکس", "استایل مردانه", "آرایشگاه مدرن",
                "سالن آرایش حرفه‌ای", "آرایشگاه کلاسیک", "استایل پلاس", "آرایشگاه رویال", "سالن زیبایی اکسکلوسیو",
                "آرایشگاه الماس", "استایل کینگ", "آرایشگاه پلاتینیوم", "سالن مردانه شیک", "آرایشگاه گلد",
                "استایل مستر", "آرایشگاه امپریال", "سالن آرایش مدرن", "آرایشگاه اسپرت", "استایل پرو"
            };

            var serviceTemplates = new[]
            {
                new { Name = "کوتاهی مو", Description = "کوتاهی مو با جدیدترین مدل‌ها", MinPrice = 30000, MaxPrice = 80000, MinDuration = 20, MaxDuration = 45 },
                new { Name = "اصلاح ریش", Description = "اصلاح و فرم دهی ریش", MinPrice = 20000, MaxPrice = 50000, MinDuration = 15, MaxDuration = 30 },
                new { Name = "شستشو و سشوار", Description = "شستشو و خشک کردن مو", MinPrice = 15000, MaxPrice = 35000, MinDuration = 10, MaxDuration = 20 },
                new { Name = "رنگ مو", Description = "رنگ کردن مو با رنگ‌های طبیعی", MinPrice = 60000, MaxPrice = 150000, MinDuration = 45, MaxDuration = 90 },
                new { Name = "ماساژ سر", Description = "ماساژ آرام‌بخش سر و گردن", MinPrice = 25000, MaxPrice = 60000, MinDuration = 15, MaxDuration = 30 },
                new { Name = "اصلاح سبیل", Description = "اصلاح و فرم دهی سبیل", MinPrice = 10000, MaxPrice = 25000, MinDuration = 10, MaxDuration = 15 },
                new { Name = "پاکسازی پوست", Description = "پاکسازی عمیق پوست صورت", MinPrice = 40000, MaxPrice = 100000, MinDuration = 30, MaxDuration = 60 },
                new { Name = "ماسک مو", Description = "ماسک تقویتی برای مو", MinPrice = 30000, MaxPrice = 70000, MinDuration = 20, MaxDuration = 40 },
                new { Name = "استایل مو", Description = "استایل و آرایش مو", MinPrice = 25000, MaxPrice = 60000, MinDuration = 15, MaxDuration = 30 },
                new { Name = "ترمیم مو", Description = "درمان و ترمیم موهای آسیب دیده", MinPrice = 50000, MaxPrice = 120000, MinDuration = 30, MaxDuration = 60 }
            };

            var random = new Random();
            int barberIndex = 0;

            foreach (var city in cities)
            {
                // هر شهر 3 تا 8 آرایشگاه
                int barbershopCount = Math.Min(random.Next(3, 9), barbers.Count - barberIndex);

                for (int i = 0; i < barbershopCount && barberIndex < barbers.Count; i++)
                {
                    var barbershop = new Barbershop
                    {
                        Name = $"{barbershopNames[random.Next(barbershopNames.Length)]} {city.Name}",
                        Description = $"آرایشگاه مردانه با خدمات حرفه‌ای در {city.Name}",
                        Address = $"خیابان {random.Next(1, 20)}, پلاک {random.Next(1, 100)}, {city.Name}",
                        Phone = $"0{random.Next(11, 99)}{random.Next(10000000, 99999999)}",
                        ImageUrl = ImageHelper.GetRandomBarbershopImage(),
                        CityId = city.Id,
                        UserId = barbers[barberIndex].Id,
                        OpenTime = new TimeSpan(8, 0, 0),
                        CloseTime = new TimeSpan(20, 0, 0),
                        WorkingDays = "شنبه,یکشنبه,دوشنبه,سه‌شنبه,چهارشنبه,پنج‌شنبه",
                        IsActive = true,
                        CreatedAt = DateTime.Now.AddDays(-random.Next(1, 365)),
                        UpdatedAt = DateTime.Now
                    };

                    _context.Barbershops.Add(barbershop);
                    await _context.SaveChangesAsync();
                    barbershops.Add(barbershop);

                    // هر آرایشگاه 4 تا 8 خدمت
                    int serviceCount = random.Next(4, 9);
                    var selectedServices = serviceTemplates.OrderBy(x => random.Next()).Take(serviceCount);

                    foreach (var serviceTemplate in selectedServices)
                    {
                        var service = new Service
                        {
                            Name = serviceTemplate.Name,
                            Description = serviceTemplate.Description,
                            Price = random.Next(serviceTemplate.MinPrice, serviceTemplate.MaxPrice + 1),
                            Duration = random.Next(serviceTemplate.MinDuration, serviceTemplate.MaxDuration + 1),
                            BarbershopId = barbershop.Id,
                            IsActive = random.Next(1, 11) > 1, // 90% فعال
                            CreatedAt = DateTime.Now.AddDays(-random.Next(1, 180))
                        };

                        _context.Services.Add(service);
                    }

                    barberIndex++;
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine($"✅ {barbershops.Count} آرایشگاه با خدمات ایجاد شد");
            return barbershops;
        }

        private async Task CreateAppointments(List<Barbershop> barbershops, List<ApplicationUser> customers)
        {
            Console.WriteLine("📅 ایجاد نوبت‌ها...");
            
            var random = new Random();
            var statuses = Enum.GetValues<AppointmentStatus>();
            
            foreach (var barbershop in barbershops)
            {
                var services = await _context.Services
                    .Where(s => s.BarbershopId == barbershop.Id)
                    .ToListAsync();

                if (!services.Any()) continue;

                // نوبت‌های گذشته (30 روز گذشته)
                for (int i = 0; i < random.Next(20, 50); i++)
                {
                    var pastDate = DateTime.Today.AddDays(-random.Next(1, 31));
                    var service = services[random.Next(services.Count)];
                    var customer = customers[random.Next(customers.Count)];
                    
                    var appointment = new Appointment
                    {
                        CustomerId = customer.Id,
                        CustomerName = $"{customer.FirstName} {customer.LastName}",
                        CustomerPhone = customer.PhoneNumber ?? "09000000000",
                        CustomerEmail = customer.Email ?? "",
                        AppointmentDate = pastDate,
                        AppointmentTime = new TimeSpan(random.Next(8, 20), random.Next(0, 2) * 30, 0),
                        BarbershopId = barbershop.Id,
                        ServiceId = service.Id,
                        Status = random.Next(1, 10) > 2 ? AppointmentStatus.Completed : AppointmentStatus.Cancelled,
                        TotalPrice = service.Price,
                        PaidAmount = service.Price,
                        CreatedAt = pastDate.AddDays(-random.Next(1, 7)),
                        CompletedAt = pastDate.AddHours(1),
                        Notes = random.Next(1, 5) == 1 ? "مشتری راضی بود" : null
                    };

                    _context.Appointments.Add(appointment);
                }

                // نوبت‌های آینده (30 روز آینده)
                for (int i = 0; i < random.Next(10, 25); i++)
                {
                    var futureDate = DateTime.Today.AddDays(random.Next(1, 31));
                    var service = services[random.Next(services.Count)];
                    var customer = customers[random.Next(customers.Count)];
                    
                    var appointment = new Appointment
                    {
                        CustomerId = customer.Id,
                        CustomerName = $"{customer.FirstName} {customer.LastName}",
                        CustomerPhone = customer.PhoneNumber ?? "09000000000",
                        CustomerEmail = customer.Email ?? "",
                        AppointmentDate = futureDate,
                        AppointmentTime = new TimeSpan(random.Next(8, 20), random.Next(0, 2) * 30, 0),
                        BarbershopId = barbershop.Id,
                        ServiceId = service.Id,
                        Status = random.Next(1, 10) > 1 ? AppointmentStatus.Confirmed : AppointmentStatus.Pending,
                        TotalPrice = service.Price,
                        PaidAmount = service.Price * 0.3m, // بیعانه 30%
                        CreatedAt = DateTime.Now.AddDays(-random.Next(1, 7)),
                        Notes = random.Next(1, 5) == 1 ? "مشتری VIP" : null
                    };

                    _context.Appointments.Add(appointment);
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("✅ نوبت‌ها ایجاد شدند");
        }

        private async Task CreateBarberSchedules(List<Barbershop> barbershops, List<ApplicationUser> barbers)
        {
            Console.WriteLine("📋 ایجاد برنامه‌های کاری...");
            
            var random = new Random();
            var workingDays = new[] { DayOfWeek.Saturday, DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday };

            foreach (var barbershop in barbershops)
            {
                var barber = barbers.FirstOrDefault(b => b.Id == barbershop.UserId);
                if (barber == null) continue;

                // برنامه کاری برای 60 روز آینده
                for (int i = 0; i < 60; i++)
                {
                    var date = DateTime.Today.AddDays(i);
                    
                    if (workingDays.Contains(date.DayOfWeek))
                    {
                        var schedule = new BarberSchedule
                        {
                            UserId = barber.Id,
                            BarbershopId = barbershop.Id,
                            DayOfWeek = date.DayOfWeek,
                            StartTime = barbershop.OpenTime,
                            EndTime = barbershop.CloseTime,
                            IsAvailable = random.Next(1, 20) > 1, // 95% در دسترس
                            Date = date
                        };

                        _context.BarberSchedules.Add(schedule);
                    }
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("✅ برنامه‌های کاری ایجاد شدند");
        }

        private async Task CreateBlockedDates(List<Barbershop> barbershops)
        {
            Console.WriteLine("🚫 ایجاد روزهای مسدود...");
            
            var random = new Random();
            var reasons = new[] { "تعطیلات", "مرخصی", "تعمیرات", "مناسبت خاص", "بیماری" };

            foreach (var barbershop in barbershops)
            {
                // هر آرایشگاه 2 تا 5 روز مسدود در 60 روز آینده
                int blockedDaysCount = random.Next(2, 6);
                
                for (int i = 0; i < blockedDaysCount; i++)
                {
                    var blockedDate = new BlockedDate
                    {
                        BarbershopId = barbershop.Id,
                        Date = DateTime.Today.AddDays(random.Next(1, 61)),
                        Reason = reasons[random.Next(reasons.Length)],
                        CreatedAt = DateTime.Now
                    };

                    _context.BlockedDates.Add(blockedDate);
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("✅ روزهای مسدود ایجاد شدند");
        }

        private async Task CreateBlockedTimeSlots(List<Barbershop> barbershops)
        {
            Console.WriteLine("⏰ ایجاد ساعات مسدود...");
            
            var random = new Random();
            var reasons = new[] { "استراحت", "ناهار", "جلسه", "تعمیرات", "مشتری VIP" };

            foreach (var barbershop in barbershops)
            {
                // هر آرایشگاه چند ساعت مسدود در روزهای مختلف
                for (int day = 1; day <= 30; day++)
                {
                    var date = DateTime.Today.AddDays(day);
                    
                    // احتمال 20% برای داشتن ساعت مسدود در هر روز
                    if (random.Next(1, 6) == 1)
                    {
                        var blockedTimeSlot = new BlockedTimeSlot
                        {
                            BarbershopId = barbershop.Id,
                            Date = date,
                            Time = new TimeSpan(random.Next(12, 15), 0, 0), // ساعت ناهار
                            Reason = reasons[random.Next(reasons.Length)],
                            CreatedAt = DateTime.Now
                        };

                        _context.BlockedTimeSlots.Add(blockedTimeSlot);
                    }
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("✅ ساعات مسدود ایجاد شدند");
        }

        private async Task CreateTimeSlots(List<Barbershop> barbershops)
        {
            Console.WriteLine("🕐 ایجاد اسلات‌های زمانی...");
            
            var random = new Random();

            foreach (var barbershop in barbershops)
            {
                // اسلات‌های زمانی برای 30 روز آینده
                for (int day = 1; day <= 30; day++)
                {
                    var date = DateTime.Today.AddDays(day);
                    
                    // اسلات‌های 30 دقیقه‌ای از ساعت باز تا بسته
                    var currentTime = barbershop.OpenTime;
                    
                    while (currentTime.Add(TimeSpan.FromMinutes(30)) <= barbershop.CloseTime)
                    {
                        var slotType = TimeSlotType.Available;
                        
                        // بررسی اینکه آیا این ساعت رزرو شده
                        var isBooked = await _context.Appointments
                            .AnyAsync(a => a.BarbershopId == barbershop.Id && 
                                          a.AppointmentDate.Date == date.Date && 
                                          a.AppointmentTime == currentTime);

                        if (isBooked)
                        {
                            slotType = TimeSlotType.Booked;
                        }
                        else if (random.Next(1, 20) == 1) // 5% احتمال مسدود بودن
                        {
                            slotType = TimeSlotType.Blocked;
                        }
                        else if (currentTime >= new TimeSpan(12, 0, 0) && currentTime <= new TimeSpan(13, 0, 0))
                        {
                            slotType = TimeSlotType.Break; // ساعت ناهار
                        }

                        var timeSlot = new TimeSlot
                        {
                            BarbershopId = barbershop.Id,
                            Date = date,
                            StartTime = currentTime,
                            EndTime = currentTime.Add(TimeSpan.FromMinutes(30)),
                            IsAvailable = slotType == TimeSlotType.Available,
                            IsBlocked = slotType == TimeSlotType.Blocked,
                            SlotType = slotType,
                            BlockReason = slotType == TimeSlotType.Blocked ? "نامشخص" : null,
                            CreatedAt = DateTime.Now
                        };

                        _context.TimeSlots.Add(timeSlot);
                        currentTime = currentTime.Add(TimeSpan.FromMinutes(30));
                    }
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("✅ اسلات‌های زمانی ایجاد شدند");
        }
    }
}