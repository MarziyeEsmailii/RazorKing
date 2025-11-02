using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RazorKing.Data;
using RazorKing.Models;

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

        public async Task<IActionResult> SeedBarbershops()
        {
            try
            {
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
    }
}