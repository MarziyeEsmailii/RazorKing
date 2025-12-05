using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RazorKing.Data;
using RazorKing.Models;

namespace RazorKing
{
    public class TestDataSeeder
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public TestDataSeeder(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task SeedTestDataAsync()
        {
            Console.WriteLine("=== شروع ایجاد داده‌های تستی کامل ===");

            // 1. ایجاد کاربران تستی (آرایشگران و مشتریان)
            var barberUsers = await CreateTestBarbersAsync();
            var customerUsers = await CreateTestCustomersAsync();
            
            // 2. ایجاد آرایشگاه‌های تستی
            var barbershops = await CreateTestBarbershopsAsync(barberUsers);
            
            // 3. ایجاد سرویس‌های تستی برای هر آرایشگاه
            var allServices = new List<Service>();
            foreach (var shop in barbershops)
            {
                var services = await CreateTestServicesAsync(shop.Id);
                allServices.AddRange(services);
            }
            
            // 4. ایجاد نوبت‌های تستی
            await CreateTestAppointmentsAsync(barbershops, allServices, customerUsers);
            
            // 5. ایجاد برنامه کاری آرایشگران
            await CreateTestBarberSchedulesAsync(barberUsers, barbershops);
            
            // 6. ایجاد تاریخ‌های مسدود
            await CreateTestBlockedDatesAsync(barbershops);
            
            // 7. ایجاد ساعات مسدود
            await CreateTestBlockedTimeSlotsAsync(barbershops);
            
            // 8. ایجاد بازه‌های زمانی
            await CreateTestTimeSlotsAsync(barbershops);

            Console.WriteLine("=== داده‌های تستی کامل با موفقیت ایجاد شدند ===");
        }

        private async Task<List<ApplicationUser>> CreateTestBarbersAsync()
        {
            var barbers = new List<ApplicationUser>();
            var barberData = new[]
            {
                new { Email = "barber1@test.com", FirstName = "علی", LastName = "محمدی", Phone = "09123456789" },
                new { Email = "barber2@test.com", FirstName = "رضا", LastName = "احمدی", Phone = "09124567890" },
                new { Email = "barber3@test.com", FirstName = "حسین", LastName = "کریمی", Phone = "09125678901" }
            };

            foreach (var data in barberData)
            {
                var existingUser = await _userManager.FindByEmailAsync(data.Email);
                
                if (existingUser != null)
                {
                    Console.WriteLine($"✓ آرایشگر قبلاً ایجاد شده: {data.Email}");
                    barbers.Add(existingUser);
                    continue;
                }

                var barberUser = new ApplicationUser
                {
                    UserName = data.Email,
                    Email = data.Email,
                    FirstName = data.FirstName,
                    LastName = data.LastName,
                    EmailConfirmed = true,
                    IsActive = true,
                    PhoneNumber = data.Phone
                };

                var result = await _userManager.CreateAsync(barberUser, "Barber123!");
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(barberUser, "Barber");
                    Console.WriteLine($"✓ آرایشگر ایجاد شد: {data.FirstName} {data.LastName}");
                    barbers.Add(barberUser);
                }
            }

            return barbers;
        }

        private async Task<List<ApplicationUser>> CreateTestCustomersAsync()
        {
            var customers = new List<ApplicationUser>();
            var customerData = new[]
            {
                new { Email = "customer1@test.com", FirstName = "محمد", LastName = "رضایی", Phone = "09131111111" },
                new { Email = "customer2@test.com", FirstName = "احمد", LastName = "حسینی", Phone = "09132222222" },
                new { Email = "customer3@test.com", FirstName = "مهدی", LastName = "نوری", Phone = "09133333333" }
            };

            foreach (var data in customerData)
            {
                var existingUser = await _userManager.FindByEmailAsync(data.Email);
                
                if (existingUser != null)
                {
                    Console.WriteLine($"✓ مشتری قبلاً ایجاد شده: {data.Email}");
                    customers.Add(existingUser);
                    continue;
                }

                var customerUser = new ApplicationUser
                {
                    UserName = data.Email,
                    Email = data.Email,
                    FirstName = data.FirstName,
                    LastName = data.LastName,
                    EmailConfirmed = true,
                    IsActive = true,
                    PhoneNumber = data.Phone
                };

                var result = await _userManager.CreateAsync(customerUser, "Customer123!");
                if (result.Succeeded)
                {
                    Console.WriteLine($"✓ مشتری ایجاد شد: {data.FirstName} {data.LastName}");
                    customers.Add(customerUser);
                }
            }

            return customers;
        }

        private async Task<List<Barbershop>> CreateTestBarbershopsAsync(List<ApplicationUser> barberUsers)
        {
            var barbershops = new List<Barbershop>();
            var shopData = new[]
            {
                new { Name = "آرایشگاه پارسیان", Address = "گرگان، خیابان ولیعصر، پلاک 123", Phone = "01732223344", CityId = 1, Description = "بهترین آرایشگاه گرگان با خدمات عالی" },
                new { Name = "آرایشگاه مدرن", Address = "گنبد کاووس، میدان شهدا، پلاک 45", Phone = "01732334455", CityId = 2, Description = "آرایشگاه مدرن با تجهیزات روز دنیا" },
                new { Name = "آرایشگاه رویال", Address = "گرگان، خیابان امام خمینی، پلاک 67", Phone = "01732445566", CityId = 1, Description = "آرایشگاه لوکس با کادر حرفه‌ای" }
            };

            for (int i = 0; i < shopData.Length && i < barberUsers.Count; i++)
            {
                var data = shopData[i];
                var existingShop = await _context.Barbershops
                    .FirstOrDefaultAsync(b => b.Name == data.Name);

                if (existingShop != null)
                {
                    Console.WriteLine($"✓ آرایشگاه قبلاً ایجاد شده: {existingShop.Name}");
                    barbershops.Add(existingShop);
                    continue;
                }

                var barbershop = new Barbershop
                {
                    Name = data.Name,
                    Address = data.Address,
                    Phone = data.Phone,
                    Description = data.Description,
                    CityId = data.CityId,
                    UserId = barberUsers[i].Id,
                    OpenTime = new TimeSpan(9, 0, 0),
                    CloseTime = new TimeSpan(21, 0, 0),
                    WorkingDays = "شنبه,یکشنبه,دوشنبه,سه‌شنبه,چهارشنبه,پنجشنبه",
                    IsActive = true,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                _context.Barbershops.Add(barbershop);
                await _context.SaveChangesAsync();
                Console.WriteLine($"✓ آرایشگاه ایجاد شد: {barbershop.Name} (ID: {barbershop.Id})");
                barbershops.Add(barbershop);
            }

            return barbershops;
        }

        private async Task<List<Service>> CreateTestServicesAsync(int barbershopId)
        {
            var existingServices = await _context.Services
                .Where(s => s.BarbershopId == barbershopId)
                .ToListAsync();

            if (existingServices.Any())
            {
                Console.WriteLine($"✓ سرویس‌ها قبلاً ایجاد شده برای آرایشگاه {barbershopId}: {existingServices.Count} سرویس");
                return existingServices;
            }

            var services = new List<Service>
            {
                new Service
                {
                    Name = "اصلاح مو",
                    Description = "اصلاح مو با بهترین تجهیزات و استایل‌های روز",
                    Price = 50000,
                    Duration = 30,
                    IsActive = true,
                    CreatedAt = DateTime.Now,
                    BarbershopId = barbershopId
                },
                new Service
                {
                    Name = "اصلاح صورت",
                    Description = "اصلاح صورت و ریش با تیغ و ماشین",
                    Price = 30000,
                    Duration = 20,
                    IsActive = true,
                    CreatedAt = DateTime.Now,
                    BarbershopId = barbershopId
                },
                new Service
                {
                    Name = "رنگ مو",
                    Description = "رنگ مو با مواد اصل و بدون آسیب",
                    Price = 150000,
                    Duration = 60,
                    IsActive = true,
                    CreatedAt = DateTime.Now,
                    BarbershopId = barbershopId
                },
                new Service
                {
                    Name = "کوتاهی مو کودک",
                    Description = "اصلاح مو ویژه کودکان با صبر و حوصله",
                    Price = 40000,
                    Duration = 25,
                    IsActive = true,
                    CreatedAt = DateTime.Now,
                    BarbershopId = barbershopId
                },
                new Service
                {
                    Name = "ماساژ سر و صورت",
                    Description = "ماساژ آرامش‌بخش سر و صورت",
                    Price = 35000,
                    Duration = 15,
                    IsActive = true,
                    CreatedAt = DateTime.Now,
                    BarbershopId = barbershopId
                },
                new Service
                {
                    Name = "اصلاح کامل",
                    Description = "اصلاح مو + صورت + ماساژ",
                    Price = 100000,
                    Duration = 60,
                    IsActive = true,
                    CreatedAt = DateTime.Now,
                    BarbershopId = barbershopId
                }
            };

            _context.Services.AddRange(services);
            await _context.SaveChangesAsync();
            Console.WriteLine($"✓ {services.Count} سرویس ایجاد شد برای آرایشگاه {barbershopId}");

            return services;
        }

        private async Task CreateTestAppointmentsAsync(List<Barbershop> barbershops, List<Service> services, List<ApplicationUser> customers)
        {
            var appointmentCount = 0;
            var statuses = new[] { AppointmentStatus.Pending, AppointmentStatus.Confirmed, AppointmentStatus.Completed, AppointmentStatus.Cancelled };
            
            for (int i = 0; i < 10; i++)
            {
                var shop = barbershops[i % barbershops.Count];
                var shopServices = services.Where(s => s.BarbershopId == shop.Id).ToList();
                if (!shopServices.Any()) continue;

                var service = shopServices[i % shopServices.Count];
                var customer = customers[i % customers.Count];
                var status = statuses[i % statuses.Length];

                var appointment = new Appointment
                {
                    CustomerId = customer.Id,
                    CustomerName = $"{customer.FirstName} {customer.LastName}",
                    CustomerPhone = customer.PhoneNumber ?? "09100000000",
                    CustomerEmail = customer.Email ?? "test@test.com",
                    AppointmentDate = DateTime.Now.AddDays(i - 2).Date,
                    AppointmentTime = new TimeSpan(9 + (i % 10), 0, 0),
                    BarbershopId = shop.Id,
                    ServiceId = service.Id,
                    Status = status,
                    TotalPrice = service.Price,
                    PaidAmount = status == AppointmentStatus.Completed ? service.Price : 0,
                    CreatedAt = DateTime.Now.AddDays(-i),
                    CompletedAt = status == AppointmentStatus.Completed ? DateTime.Now.AddDays(i - 2) : null,
                    Notes = $"نوبت تستی شماره {i + 1}"
                };

                _context.Appointments.Add(appointment);
                appointmentCount++;
            }

            await _context.SaveChangesAsync();
            Console.WriteLine($"✓ {appointmentCount} نوبت ایجاد شد");
        }

        private async Task CreateTestBarberSchedulesAsync(List<ApplicationUser> barbers, List<Barbershop> barbershops)
        {
            var scheduleCount = 0;
            var daysOfWeek = new[] { DayOfWeek.Saturday, DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday };

            foreach (var barber in barbers)
            {
                var shop = barbershops.FirstOrDefault(b => b.UserId == barber.Id);
                if (shop == null) continue;

                foreach (var day in daysOfWeek)
                {
                    var existingSchedule = await _context.BarberSchedules
                        .FirstOrDefaultAsync(bs => bs.UserId == barber.Id && bs.BarbershopId == shop.Id && bs.DayOfWeek == day);

                    if (existingSchedule != null) continue;

                    var schedule = new BarberSchedule
                    {
                        UserId = barber.Id,
                        BarbershopId = shop.Id,
                        DayOfWeek = day,
                        StartTime = new TimeSpan(9, 0, 0),
                        EndTime = new TimeSpan(18, 0, 0),
                        IsAvailable = true,
                        Date = DateTime.Now.Date.AddDays((int)day - (int)DateTime.Now.DayOfWeek)
                    };

                    _context.BarberSchedules.Add(schedule);
                    scheduleCount++;
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine($"✓ {scheduleCount} برنامه کاری ایجاد شد");
        }

        private async Task CreateTestBlockedDatesAsync(List<Barbershop> barbershops)
        {
            var blockedCount = 0;

            foreach (var shop in barbershops)
            {
                var existingBlocked = await _context.BlockedDates
                    .FirstOrDefaultAsync(bd => bd.BarbershopId == shop.Id);

                if (existingBlocked != null) continue;

                // تعطیلی آخر هفته
                var blockedDate = new BlockedDate
                {
                    BarbershopId = shop.Id,
                    Date = DateTime.Now.AddDays(7).Date, // جمعه آینده
                    Reason = "تعطیلی آخر هفته",
                    CreatedAt = DateTime.Now
                };

                _context.BlockedDates.Add(blockedDate);
                blockedCount++;
            }

            await _context.SaveChangesAsync();
            Console.WriteLine($"✓ {blockedCount} تاریخ مسدود ایجاد شد");
        }

        private async Task CreateTestBlockedTimeSlotsAsync(List<Barbershop> barbershops)
        {
            var blockedCount = 0;

            foreach (var shop in barbershops)
            {
                var existingBlocked = await _context.BlockedTimeSlots
                    .FirstOrDefaultAsync(bts => bts.BarbershopId == shop.Id);

                if (existingBlocked != null) continue;

                // ساعت ناهار مسدود
                var blockedSlot = new BlockedTimeSlot
                {
                    BarbershopId = shop.Id,
                    Date = DateTime.Now.AddDays(1).Date,
                    Time = new TimeSpan(13, 0, 0),
                    Reason = "استراحت ناهار",
                    CreatedAt = DateTime.Now
                };

                _context.BlockedTimeSlots.Add(blockedSlot);
                blockedCount++;
            }

            await _context.SaveChangesAsync();
            Console.WriteLine($"✓ {blockedCount} ساعت مسدود ایجاد شد");
        }

        private async Task CreateTestTimeSlotsAsync(List<Barbershop> barbershops)
        {
            var slotCount = 0;

            foreach (var shop in barbershops)
            {
                var existingSlots = await _context.Time
                    .Where(ts => ts.BarbershopId == shop.Id)
                    .ToListAsync();

                if (existingSlots.Any()) continue;

                // ایجاد بازه‌های زمانی برای فردا
                var tomorrow = DateTime.Now.AddDays(1).Date;
                for (int hour = 9; hour < 18; hour++)
                {
                    var timeSlot = new TimeSlot
                    {
                        BarbershopId = shop.Id,
                        Date = tomorrow,
                        StartTime = new TimeSpan(hour, 0, 0),
                        EndTime = new TimeSpan(hour, 30, 0),
                        IsAvailable = hour != 13, // ساعت 13 مسدود (ناهار)
                        IsBlocked = hour == 13,
                        BlockReason = hour == 13 ? "استراحت ناهار" : null,
                        SlotType = 0,
                        CreatedAt = DateTime.Now
                    };

                    _context.Time.Add(timeSlot);
                    slotCount++;
                }
            }

            await _context.SaveChangesAsync();
            Console.WriteLine($"✓ {slotCount} بازه زمانی ایجاد شد");
        }

        public async Task TestCrudOperationsAsync()
        {
            Console.WriteLine("\n=== شروع تست عملیات CRUD ===");

            await TestReadOperationsAsync();
            await TestUpdateOperationsAsync();
            await TestDeleteOperationsAsync();

            Console.WriteLine("=== تست عملیات CRUD با موفقیت انجام شد ===\n");
        }

        private async Task TestReadOperationsAsync()
        {
            Console.WriteLine("\n--- تست عملیات خواندن (READ) ---");

            // خواندن شهرها
            var cities = await _context.Cities.ToListAsync();
            Console.WriteLine($"✓ تعداد شهرها: {cities.Count}");

            // خواندن آرایشگاه‌ها
            var barbershops = await _context.Barbershops.Include(b => b.City).ToListAsync();
            Console.WriteLine($"✓ تعداد آرایشگاه‌ها: {barbershops.Count}");
            foreach (var shop in barbershops)
            {
                Console.WriteLine($"  - {shop.Name} در {shop.City.Name}");
            }

            // خواندن سرویس‌ها
            var services = await _context.Services.Include(s => s.Barbershop).ToListAsync();
            Console.WriteLine($"✓ تعداد سرویس‌ها: {services.Count}");
            foreach (var service in services)
            {
                Console.WriteLine($"  - {service.Name}: {service.Price:N0} تومان");
            }

            // خواندن نوبت‌ها
            var appointments = await _context.Appointments
                .Include(a => a.Barbershop)
                .Include(a => a.Service)
                .ToListAsync();
            Console.WriteLine($"✓ تعداد نوبت‌ها: {appointments.Count}");
        }

        private async Task TestUpdateOperationsAsync()
        {
            Console.WriteLine("\n--- تست عملیات به‌روزرسانی (UPDATE) ---");

            // به‌روزرسانی آرایشگاه
            var barbershop = await _context.Barbershops.FirstOrDefaultAsync();
            if (barbershop != null)
            {
                var oldPhone = barbershop.Phone;
                barbershop.Phone = "01732229999";
                barbershop.UpdatedAt = DateTime.Now;
                await _context.SaveChangesAsync();
                Console.WriteLine($"✓ شماره تلفن آرایشگاه به‌روز شد: {oldPhone} -> {barbershop.Phone}");
            }

            // به‌روزرسانی سرویس
            var service = await _context.Services.FirstOrDefaultAsync();
            if (service != null)
            {
                var oldPrice = service.Price;
                service.Price = 55000;
                await _context.SaveChangesAsync();
                Console.WriteLine($"✓ قیمت سرویس به‌روز شد: {oldPrice:N0} -> {service.Price:N0} تومان");
            }

            // به‌روزرسانی نوبت
            var appointment = await _context.Appointments.FirstOrDefaultAsync();
            if (appointment != null)
            {
                var oldStatus = appointment.Status;
                appointment.Status = AppointmentStatus.Confirmed;
                await _context.SaveChangesAsync();
                Console.WriteLine($"✓ وضعیت نوبت به‌روز شد: {oldStatus} -> {appointment.Status}");
            }
        }

        private async Task TestDeleteOperationsAsync()
        {
            Console.WriteLine("\n--- تست عملیات حذف (DELETE) ---");

            // ایجاد یک سرویس موقت برای حذف
            var tempService = new Service
            {
                Name = "سرویس موقت",
                Description = "برای تست حذف",
                Price = 10000,
                Duration = 10,
                IsActive = true,
                CreatedAt = DateTime.Now,
                BarbershopId = (await _context.Barbershops.FirstAsync()).Id
            };

            _context.Services.Add(tempService);
            await _context.SaveChangesAsync();
            var tempServiceId = tempService.Id;
            Console.WriteLine($"✓ سرویس موقت ایجاد شد (ID: {tempServiceId})");

            // حذف سرویس موقت
            _context.Services.Remove(tempService);
            await _context.SaveChangesAsync();
            
            var deletedService = await _context.Services.FindAsync(tempServiceId);
            if (deletedService == null)
            {
                Console.WriteLine($"✓ سرویس موقت با موفقیت حذف شد");
            }
            else
            {
                Console.WriteLine($"✗ خطا در حذف سرویس");
            }
        }
    }
}
