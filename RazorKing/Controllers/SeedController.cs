using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RazorKing.Data;
using RazorKing.Models;

namespace RazorKing.Controllers
{
    public class SeedController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public SeedController(ApplicationDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<IActionResult> SeedData()
        {
            try
            {
                // Create roles if they don't exist
                await EnsureRolesExist();

                // Create sample users
                var users = await CreateSampleUsers();

                // Create barbershops
                var barbershops = await CreateBarbershops(users);

                // Create services
                await CreateServices(barbershops);

                // Create sample appointments
                await CreateSampleAppointments(barbershops, users);

                return Json(new { 
                    success = true,
                    message = "داده‌های تست با موفقیت وارد شدند",
                    usersCount = users.Count,
                    barbershopsCount = barbershops.Count,
                    servicesCount = await _context.Services.CountAsync(),
                    appointmentsCount = await _context.Appointments.CountAsync()
                });
            }
            catch (Exception ex)
            {
                return Json(new { 
                    success = false,
                    message = "خطا در وارد کردن داده‌ها: " + ex.Message 
                });
            }
        }

        private async Task EnsureRolesExist()
        {
            string[] roles = { "Customer", "BarbershopOwner", "Barber" };

            foreach (string role in roles)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                {
                    await _roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }

        private async Task<List<ApplicationUser>> CreateSampleUsers()
        {
            var users = new List<ApplicationUser>();

            // Create barbershop owners
            var owners = new[]
            {
                new { Email = "owner1@razorking.com", FirstName = "احمد", LastName = "محمدی", Phone = "09123456789" },
                new { Email = "owner2@razorking.com", FirstName = "علی", LastName = "احمدی", Phone = "09123456790" },
                new { Email = "owner3@razorking.com", FirstName = "حسن", LastName = "رضایی", Phone = "09123456791" },
                new { Email = "owner4@razorking.com", FirstName = "مهدی", LastName = "کریمی", Phone = "09123456792" },
                new { Email = "owner5@razorking.com", FirstName = "رضا", LastName = "نوری", Phone = "09123456793" }
            };

            foreach (var ownerData in owners)
            {
                var existingUser = await _userManager.FindByEmailAsync(ownerData.Email);
                if (existingUser == null)
                {
                    var user = new ApplicationUser
                    {
                        UserName = ownerData.Email,
                        Email = ownerData.Email,
                        FirstName = ownerData.FirstName,
                        LastName = ownerData.LastName,
                        PhoneNumber = ownerData.Phone,
                        Role = UserRole.BarbershopOwner,
                        EmailConfirmed = true
                    };

                    var result = await _userManager.CreateAsync(user, "Password123!");
                    if (result.Succeeded)
                    {
                        await _userManager.AddToRoleAsync(user, "BarbershopOwner");
                        users.Add(user);
                    }
                }
            }

            // Create barbers
            var barbers = new[]
            {
                new { Email = "barber1@razorking.com", FirstName = "محمد", LastName = "حسینی", Phone = "09123456794" },
                new { Email = "barber2@razorking.com", FirstName = "سعید", LastName = "موسوی", Phone = "09123456795" },
                new { Email = "barber3@razorking.com", FirstName = "امیر", LastName = "صادقی", Phone = "09123456796" },
                new { Email = "barber4@razorking.com", FirstName = "فرهاد", LastName = "جعفری", Phone = "09123456797" },
                new { Email = "barber5@razorking.com", FirstName = "بهرام", LastName = "عباسی", Phone = "09123456798" }
            };

            foreach (var barberData in barbers)
            {
                var existingUser = await _userManager.FindByEmailAsync(barberData.Email);
                if (existingUser == null)
                {
                    var user = new ApplicationUser
                    {
                        UserName = barberData.Email,
                        Email = barberData.Email,
                        FirstName = barberData.FirstName,
                        LastName = barberData.LastName,
                        PhoneNumber = barberData.Phone,
                        Role = UserRole.Barber,
                        EmailConfirmed = true
                    };

                    var result = await _userManager.CreateAsync(user, "Password123!");
                    if (result.Succeeded)
                    {
                        await _userManager.AddToRoleAsync(user, "Barber");
                        users.Add(user);
                    }
                }
            }

            // Create customers
            var customers = new[]
            {
                new { Email = "customer1@gmail.com", FirstName = "کاوه", LastName = "شریفی", Phone = "09123456799" },
                new { Email = "customer2@gmail.com", FirstName = "داریوش", LastName = "فرهادی", Phone = "09123456800" },
                new { Email = "customer3@gmail.com", FirstName = "آرش", LastName = "قاسمی", Phone = "09123456801" },
                new { Email = "customer4@gmail.com", FirstName = "پویا", LastName = "رستمی", Phone = "09123456802" },
                new { Email = "customer5@gmail.com", FirstName = "سامان", LastName = "طاهری", Phone = "09123456803" },
                new { Email = "customer6@gmail.com", FirstName = "بابک", LastName = "نجفی", Phone = "09123456804" },
                new { Email = "customer7@gmail.com", FirstName = "فرزاد", LastName = "حیدری", Phone = "09123456805" },
                new { Email = "customer8@gmail.com", FirstName = "مسعود", LastName = "باقری", Phone = "09123456806" },
                new { Email = "customer9@gmail.com", FirstName = "شهرام", LastName = "یوسفی", Phone = "09123456807" },
                new { Email = "customer10@gmail.com", FirstName = "ایمان", LastName = "زارعی", Phone = "09123456808" }
            };

            foreach (var customerData in customers)
            {
                var existingUser = await _userManager.FindByEmailAsync(customerData.Email);
                if (existingUser == null)
                {
                    var user = new ApplicationUser
                    {
                        UserName = customerData.Email,
                        Email = customerData.Email,
                        FirstName = customerData.FirstName,
                        LastName = customerData.LastName,
                        PhoneNumber = customerData.Phone,
                        Role = UserRole.Customer,
                        EmailConfirmed = true
                    };

                    var result = await _userManager.CreateAsync(user, "Password123!");
                    if (result.Succeeded)
                    {
                        await _userManager.AddToRoleAsync(user, "Customer");
                        users.Add(user);
                    }
                }
            }

            return users;
        }

        private async Task<List<Barbershop>> CreateBarbershops(List<ApplicationUser> users)
        {
            var owners = users.Where(u => u.Role == UserRole.BarbershopOwner).ToList();
            var barbershops = new List<Barbershop>();

            var barbershopData = new[]
            {
                new { Name = "آرایشگاه مردانه VIP", Address = "گرگان، خیابان امام خمینی، پلاک 123", Phone = "017-32345678", Description = "آرایشگاه مردانه لوکس با خدمات حرفه‌ای و امکانات مدرن", CityId = 1, OpenTime = new TimeSpan(8, 0, 0), CloseTime = new TimeSpan(20, 0, 0) },
                new { Name = "سالن زیبایی مردانه پارس", Address = "گرگان، خیابان ولیعصر، پلاک 456", Phone = "017-32567890", Description = "بهترین خدمات آرایشگری مردانه در گرگان با کادر مجرب", CityId = 1, OpenTime = new TimeSpan(9, 0, 0), CloseTime = new TimeSpan(21, 0, 0) },
                new { Name = "آرایشگاه مدرن استایل", Address = "گرگان، خیابان شهید بهشتی، پلاک 789", Phone = "017-32789012", Description = "آرایشگاه مردانه با جدیدترین تکنیک‌ها و استایل‌های روز", CityId = 1, OpenTime = new TimeSpan(8, 30, 0), CloseTime = new TimeSpan(19, 30, 0) },
                new { Name = "آرایشگاه مردانه گنبد", Address = "گنبد کاووس، خیابان اصلی، پلاک 100", Phone = "017-32111222", Description = "آرایشگاه مردانه معتبر در گنبد کاووس", CityId = 2, OpenTime = new TimeSpan(8, 0, 0), CloseTime = new TimeSpan(20, 0, 0) },
                new { Name = "سالن زیبایی آق قلا", Address = "آق قلا، خیابان مرکزی، پلاک 200", Phone = "017-32333444", Description = "بهترین آرایشگاه مردانه آق قلا با خدمات کامل", CityId = 4, OpenTime = new TimeSpan(9, 0, 0), CloseTime = new TimeSpan(21, 0, 0) },
                new { Name = "آرایشگاه کلاسیک علی آباد", Address = "علی آباد کتول، خیابان شهدا، پلاک 50", Phone = "017-32555666", Description = "آرایشگاه سنتی و مدرن در علی آباد کتول", CityId = 3, OpenTime = new TimeSpan(8, 0, 0), CloseTime = new TimeSpan(19, 0, 0) },
                new { Name = "سالن مردانه کردکوی", Address = "کردکوی، خیابان امام، پلاک 75", Phone = "017-32777888", Description = "آرایشگاه مردانه با تجربه در کردکوی", CityId = 5, OpenTime = new TimeSpan(8, 30, 0), CloseTime = new TimeSpan(20, 30, 0) },
                new { Name = "آرایشگاه لوکس گرگان", Address = "گرگان، خیابان طالقانی، پلاک 321", Phone = "017-32999000", Description = "آرایشگاه لوکس با بالاترین کیفیت خدمات", CityId = 1, OpenTime = new TimeSpan(10, 0, 0), CloseTime = new TimeSpan(22, 0, 0) },
                new { Name = "استایل مدرن گنبد", Address = "گنبد کاووس، خیابان فردوسی، پلاک 150", Phone = "017-32121314", Description = "آرایشگاه مدرن با استایل‌های جدید", CityId = 2, OpenTime = new TimeSpan(9, 30, 0), CloseTime = new TimeSpan(21, 30, 0) },
                new { Name = "آرایشگاه پرستیژ", Address = "گرگان، خیابان کشاورز، پلاک 654", Phone = "017-32151617", Description = "آرایشگاه پرستیژ با خدمات ویژه", CityId = 1, OpenTime = new TimeSpan(8, 0, 0), CloseTime = new TimeSpan(20, 0, 0) }
            };

            for (int i = 0; i < barbershopData.Length && i < owners.Count; i++)
            {
                var data = barbershopData[i];
                var barbershop = new Barbershop
                {
                    Name = data.Name,
                    Address = data.Address,
                    Phone = data.Phone,
                    Description = data.Description,
                    CityId = data.CityId,
                    OwnerId = owners[i].Id,
                    OpenTime = data.OpenTime,
                    CloseTime = data.CloseTime,
                    IsActive = true,
                    CreatedAt = DateTime.Now.AddDays(-new Random().Next(1, 30))
                };

                barbershops.Add(barbershop);
            }

            _context.Barbershops.AddRange(barbershops);
            await _context.SaveChangesAsync();
            return barbershops;
        }

        private async Task CreateServices(List<Barbershop> barbershops)
        {
            var services = new List<Service>();
            var random = new Random();

            var serviceTemplates = new[]
            {
                new { Name = "کوتاهی مو کلاسیک", Description = "کوتاهی مو با قیچی و ماشین اصلاح", BasePrice = 50000, Duration = 30 },
                new { Name = "فید و لاین", Description = "کوتاهی مدرن با فید و طراحی لاین", BasePrice = 80000, Duration = 45 },
                new { Name = "اصلاح صورت", Description = "اصلاح ریش و سبیل با تیغ", BasePrice = 40000, Duration = 20 },
                new { Name = "رنگ مو", Description = "رنگ‌آمیزی مو با بهترین محصولات", BasePrice = 120000, Duration = 60 },
                new { Name = "ماساژ صورت", Description = "ماساژ آرام‌بخش صورت و سر", BasePrice = 60000, Duration = 25 },
                new { Name = "پکیج کامل", Description = "کوتاهی + اصلاح + ماساژ", BasePrice = 130000, Duration = 75 },
                new { Name = "کوتاهی مو مدرن", Description = "کوتاهی با جدیدترین استایل‌ها", BasePrice = 70000, Duration = 40 },
                new { Name = "اصلاح کامل", Description = "اصلاح صورت و گردن", BasePrice = 50000, Duration = 30 },
                new { Name = "شستشوی مو", Description = "شستشو و خشک کردن مو", BasePrice = 25000, Duration = 15 },
                new { Name = "استایل مو", Description = "استایل دادن و ژل زدن", BasePrice = 35000, Duration = 20 },
                new { Name = "ماساژ سر", Description = "ماساژ آرام‌بخش پوست سر", BasePrice = 45000, Duration = 20 },
                new { Name = "پکیج VIP", Description = "تمام خدمات + نوشیدنی", BasePrice = 200000, Duration = 90 }
            };

            foreach (var barbershop in barbershops)
            {
                // هر آرایشگاه 6 تا 10 خدمت داشته باشد
                var serviceCount = random.Next(6, 11);
                var selectedServices = serviceTemplates.OrderBy(x => random.Next()).Take(serviceCount);

                foreach (var template in selectedServices)
                {
                    // قیمت‌ها را با تغییرات کمی متنوع کنیم
                    var priceVariation = random.Next(-10000, 15000);
                    var durationVariation = random.Next(-5, 10);

                    services.Add(new Service
                    {
                        Name = template.Name,
                        Description = template.Description,
                        Price = Math.Max(15000, template.BasePrice + priceVariation),
                        DurationMinutes = Math.Max(10, template.Duration + durationVariation),
                        BarbershopId = barbershop.Id
                    });
                }
            }

            _context.Services.AddRange(services);
            await _context.SaveChangesAsync();
        }

        private async Task CreateSampleAppointments(List<Barbershop> barbershops, List<ApplicationUser> users)
        {
            var customers = users.Where(u => u.Role == UserRole.Customer).ToList();
            var barbers = users.Where(u => u.Role == UserRole.Barber).ToList();
            var appointments = new List<Appointment>();
            var random = new Random();

            var statuses = new[] { AppointmentStatus.Pending, AppointmentStatus.Confirmed, AppointmentStatus.Completed, AppointmentStatus.Cancelled };

            // ایجاد 50 نوبت تصادفی
            for (int i = 0; i < 50; i++)
            {
                var barbershop = barbershops[random.Next(barbershops.Count)];
                var customer = customers[random.Next(customers.Count)];
                var barber = barbers.Count > 0 ? barbers[random.Next(barbers.Count)] : null;

                // تاریخ تصادفی در 30 روز گذشته تا 30 روز آینده
                var appointmentDate = DateTime.Today.AddDays(random.Next(-30, 31));
                
                // ساعت تصادفی بین ساعات کاری
                var workingHours = (int)(barbershop.CloseTime - barbershop.OpenTime).TotalHours;
                var randomHour = random.Next(workingHours);
                var appointmentTime = barbershop.OpenTime.Add(TimeSpan.FromHours(randomHour));

                var status = statuses[random.Next(statuses.Length)];

                var appointment = new Appointment
                {
                    CustomerId = customer.Id,
                    CustomerName = $"{customer.FirstName} {customer.LastName}",
                    CustomerPhone = customer.PhoneNumber ?? "09123456789",
                    AppointmentDate = appointmentDate,
                    AppointmentTime = appointmentTime,
                    BarbershopId = barbershop.Id,
                    BarberId = barber?.Id,
                    Status = status,
                    TotalPrice = random.Next(30000, 200000),
                    PaidAmount = 0,
                    CreatedAt = DateTime.Now.AddDays(-random.Next(1, 60))
                };

                // اگر نوبت تکمیل شده، مبلغ پرداختی و تاریخ تکمیل را تنظیم کن
                if (status == AppointmentStatus.Completed)
                {
                    appointment.PaidAmount = appointment.TotalPrice;
                    appointment.CompletedAt = appointmentDate.Add(appointmentTime).AddMinutes(random.Next(30, 90));
                }
                else if (status == AppointmentStatus.Confirmed)
                {
                    appointment.PaidAmount = appointment.TotalPrice * 0.3m; // بیعانه 30%
                }

                appointments.Add(appointment);
            }

            _context.Appointments.AddRange(appointments);
            await _context.SaveChangesAsync();

            // ایجاد AppointmentServices برای هر نوبت
            var appointmentServices = new List<AppointmentService>();
            var allServices = await _context.Services.ToListAsync();

            foreach (var appointment in appointments)
            {
                var barbershopServices = allServices.Where(s => s.BarbershopId == appointment.BarbershopId).ToList();
                if (barbershopServices.Any())
                {
                    // هر نوبت 1 تا 3 خدمت داشته باشد
                    var serviceCount = random.Next(1, 4);
                    var selectedServices = barbershopServices.OrderBy(x => random.Next()).Take(serviceCount);

                    foreach (var service in selectedServices)
                    {
                        appointmentServices.Add(new AppointmentService
                        {
                            AppointmentId = appointment.Id,
                            ServiceId = service.Id
                        });
                    }
                }
            }

            _context.AppointmentServices.AddRange(appointmentServices);
            await _context.SaveChangesAsync();
        }
    }
}