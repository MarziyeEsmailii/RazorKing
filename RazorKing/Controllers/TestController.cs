using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RazorKing.Data;
using RazorKing.Models;

namespace RazorKing.Controllers
{
    public class TestController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public TestController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult FontTest()
        {
            return View();
        }

        public IActionResult ButtonsAndIcons()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> AdminAccess()
        {
            try
            {
                var isAuthenticated = User.Identity?.IsAuthenticated ?? false;
                var isAdmin = User.IsInRole("Admin");
                
                string userInfo = "کاربر وارد نشده";
                if (isAuthenticated)
                {
                    var user = await _userManager.GetUserAsync(User);
                    if (user != null)
                    {
                        var roles = await _userManager.GetRolesAsync(user);
                        userInfo = $"کاربر: {user.Email}, نقش‌ها: {string.Join(", ", roles)}";
                    }
                }

                var adminUsers = await _context.Users
                    .Where(u => u.Email.Contains("admin"))
                    .ToListAsync();

                ViewBag.IsAuthenticated = isAuthenticated;
                ViewBag.IsAdmin = isAdmin;
                ViewBag.UserInfo = userInfo;
                ViewBag.AdminUsers = adminUsers;

                return View();
            }
            catch (Exception ex)
            {
                ViewBag.Error = ex.Message;
                return View();
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateAdminUser()
        {
            try
            {
                var adminEmail = "admin@razorking.com";
                var existingUser = await _userManager.FindByEmailAsync(adminEmail);
                
                if (existingUser != null)
                {
                    return Json(new { success = false, message = "کاربر admin از قبل وجود دارد" });
                }

                var adminUser = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FirstName = "مدیر",
                    LastName = "سیستم",
                    EmailConfirmed = true,
                    IsActive = true
                };

                var result = await _userManager.CreateAsync(adminUser, "Admin123!");
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(adminUser, "Admin");
                    return Json(new { success = true, message = "کاربر admin با موفقیت ایجاد شد" });
                }
                else
                {
                    return Json(new { success = false, message = string.Join(", ", result.Errors.Select(e => e.Description)) });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateTestAppointment()
        {
            try
            {
                if (!User.Identity.IsAuthenticated)
                {
                    return Json(new { success = false, message = "کاربر وارد نشده است" });
                }

                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    return Json(new { success = false, message = "کاربر یافت نشد" });
                }

                Console.WriteLine($"🔍 Creating test appointment for user: {user.Email} (ID: {user.Id})");

                // پیدا کردن یا ایجاد شهر
                var city = await _context.Cities.FirstOrDefaultAsync();
                if (city == null)
                {
                    city = new City { Name = "گرگان", Province = "گلستان" };
                    _context.Cities.Add(city);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"✅ Created city: {city.Name} (ID: {city.Id})");
                }

                // پیدا کردن یا ایجاد آرایشگاه
                var barbershop = await _context.Barbershops.FirstOrDefaultAsync();
                if (barbershop == null)
                {
                    barbershop = new Barbershop
                    {
                        Name = "آرایشگاه تست",
                        Address = "گرگان، خیابان اصلی",
                        Phone = "09123456789",
                        CityId = city.Id,
                        IsActive = true,
                        OpenTime = new TimeSpan(8, 0, 0),
                        CloseTime = new TimeSpan(20, 0, 0),
                        WorkingDays = "شنبه,یکشنبه,دوشنبه,سه‌شنبه,چهارشنبه,پنج‌شنبه"
                    };
                    _context.Barbershops.Add(barbershop);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"✅ Created barbershop: {barbershop.Name} (ID: {barbershop.Id})");
                }

                // پیدا کردن یا ایجاد خدمت
                var service = await _context.Services.FirstOrDefaultAsync(s => s.BarbershopId == barbershop.Id);
                if (service == null)
                {
                    service = new Service
                    {
                        Name = "کوتاهی مو",
                        Description = "کوتاهی مو حرفه‌ای",
                        Price = 50000,
                        Duration = 30,
                        BarbershopId = barbershop.Id,
                        IsActive = true
                    };
                    _context.Services.Add(service);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"✅ Created service: {service.Name} (ID: {service.Id})");
                }

                // ایجاد نوبت تست
                var appointmentDate = DateTime.Today.AddDays(1);
                var appointmentTime = TimeSpan.FromHours(10); // ساعت 10 صبح
                var customerName = $"{user.FirstName ?? ""} {user.LastName ?? ""}".Trim();
                if (string.IsNullOrEmpty(customerName))
                {
                    customerName = "کاربر تست";
                }

                var appointment = new Appointment
                {
                    CustomerId = user.Id,
                    CustomerName = customerName,
                    CustomerPhone = user.PhoneNumber ?? "09123456789",
                    CustomerEmail = user.Email ?? "",
                    AppointmentDate = appointmentDate,
                    AppointmentTime = appointmentTime,
                    BarbershopId = barbershop.Id,
                    ServiceId = service.Id,
                    Status = AppointmentStatus.Confirmed,
                    TotalPrice = service.Price,
                    PaidAmount = 0,
                    Notes = "نوبت تست ایجاد شده توسط سیستم",
                    CreatedAt = DateTime.Now
                };

                Console.WriteLine($"🔍 About to save appointment: Customer={appointment.CustomerEmail}, Date={appointment.AppointmentDate:yyyy-MM-dd}, Time={appointment.AppointmentTime}");
                
                _context.Appointments.Add(appointment);
                
                Console.WriteLine($"🔍 Added to context, now saving...");
                await _context.SaveChangesAsync();
                
                Console.WriteLine($"✅ Created appointment: ID={appointment.Id}, Customer={appointment.CustomerEmail}, Date={appointment.AppointmentDate:yyyy-MM-dd}, Time={appointment.AppointmentTime}");

                // بررسی که نوبت واقعاً ذخیره شده
                var savedAppointment = await _context.Appointments
                    .Include(a => a.Barbershop)
                    .Include(a => a.Service)
                    .FirstOrDefaultAsync(a => a.Id == appointment.Id);

                if (savedAppointment != null)
                {
                    Console.WriteLine($"✅ Appointment verified in database: {savedAppointment.Id}");
                }
                else
                {
                    Console.WriteLine($"❌ Appointment NOT found in database after save!");
                }

                return Json(new
                {
                    success = true,
                    message = "نوبت تست با موفقیت ایجاد شد",
                    appointment = new
                    {
                        id = appointment.Id,
                        customerId = appointment.CustomerId,
                        customerEmail = appointment.CustomerEmail,
                        customerName = appointment.CustomerName,
                        date = appointment.AppointmentDate.ToString("yyyy/MM/dd"),
                        time = appointment.AppointmentTime.ToString(@"hh\\:mm"),
                        barbershop = barbershop.Name,
                        service = service.Name,
                        price = service.Price,
                        status = appointment.Status.ToString()
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error creating test appointment: {ex.Message}");
                Console.WriteLine($"❌ Inner exception: {ex.InnerException?.Message}");
                Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
                return Json(new
                {
                    success = false,
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateSimpleTestAppointment()
        {
            try
            {
                if (!User.Identity.IsAuthenticated)
                {
                    return Json(new { success = false, message = "کاربر وارد نشده است" });
                }

                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    return Json(new { success = false, message = "کاربر یافت نشد" });
                }

                // ایجاد نوبت ساده بدون وابستگی
                var appointment = new Appointment
                {
                    CustomerId = user.Id,
                    CustomerName = "تست کاربر",
                    CustomerPhone = "09123456789",
                    CustomerEmail = user.Email ?? "test@test.com",
                    AppointmentDate = new DateTime(2025, 11, 10), // تاریخ ثابت
                    AppointmentTime = new TimeSpan(10, 0, 0), // ساعت 10
                    BarbershopId = 1, // ID ثابت
                    ServiceId = 1, // ID ثابت
                    Status = AppointmentStatus.Confirmed,
                    TotalPrice = 50000,
                    PaidAmount = 0,
                    Notes = "نوبت تست ساده",
                    CreatedAt = DateTime.Now
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                return Json(new
                {
                    success = true,
                    message = "نوبت ساده با موفقیت ایجاد شد",
                    appointmentId = appointment.Id
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    error = ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
        }

        [HttpGet]
        public async Task<IActionResult> CheckAppointments()
        {
            try
            {
                var appointments = await _context.Appointments
                    .Include(a => a.Barbershop)
                    .Include(a => a.Service)
                    .OrderByDescending(a => a.CreatedAt)
                    .Take(10)
                    .Select(a => new
                    {
                        Id = a.Id,
                        CustomerName = a.CustomerName,
                        CustomerEmail = a.CustomerEmail,
                        CustomerId = a.CustomerId,
                        BarbershopName = a.Barbershop != null ? a.Barbershop.Name : "نامشخص",
                        ServiceName = a.Service != null ? a.Service.Name : "نامشخص",
                        AppointmentDate = a.AppointmentDate.ToString("yyyy-MM-dd"),
                        AppointmentTime = a.AppointmentTime.ToString(@"hh\\:mm"),
                        Status = a.Status.ToString(),
                        CreatedAt = a.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
                    })
                    .ToListAsync();

                return Json(new
                {
                    success = true,
                    count = appointments.Count,
                    appointments = appointments
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }

        [HttpGet]
        public async Task<IActionResult> CheckUserAppointments()
        {
            try
            {
                if (!User.Identity.IsAuthenticated)
                {
                    return Json(new { success = false, message = "کاربر وارد نشده است" });
                }

                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    return Json(new { success = false, message = "کاربر یافت نشد" });
                }

                // بررسی همه نوبت‌ها
                var allAppointments = await _context.Appointments
                    .Include(a => a.Barbershop)
                    .Include(a => a.Service)
                    .OrderByDescending(a => a.CreatedAt)
                    .ToListAsync();

                // بررسی نوبت‌های کاربر با شرایط مختلف
                var userAppointmentsByEmail = await _context.Appointments
                    .Include(a => a.Barbershop)
                    .Include(a => a.Service)
                    .Where(a => a.CustomerEmail.ToLower() == user.Email.ToLower())
                    .ToListAsync();

                var userAppointmentsById = await _context.Appointments
                    .Include(a => a.Barbershop)
                    .Include(a => a.Service)
                    .Where(a => a.CustomerId == user.Id)
                    .ToListAsync();

                var userAppointmentsByUserName = await _context.Appointments
                    .Include(a => a.Barbershop)
                    .Include(a => a.Service)
                    .Where(a => a.CustomerEmail.ToLower() == user.UserName.ToLower())
                    .ToListAsync();

                return Json(new
                {
                    success = true,
                    userInfo = new
                    {
                        id = user.Id,
                        email = user.Email,
                        userName = user.UserName,
                        firstName = user.FirstName,
                        lastName = user.LastName
                    },
                    totalAppointments = allAppointments.Count,
                    userAppointmentsByEmail = userAppointmentsByEmail.Count,
                    userAppointmentsById = userAppointmentsById.Count,
                    userAppointmentsByUserName = userAppointmentsByUserName.Count,
                    allAppointments = allAppointments.Take(5).Select(a => new
                    {
                        id = a.Id,
                        customerEmail = a.CustomerEmail,
                        customerId = a.CustomerId,
                        customerName = a.CustomerName,
                        barbershopName = a.Barbershop?.Name,
                        serviceName = a.Service?.Name,
                        appointmentDate = a.AppointmentDate.ToString("yyyy-MM-dd"),
                        appointmentTime = a.AppointmentTime.ToString(@"hh\\:mm"),
                        status = a.Status.ToString(),
                        createdAt = a.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
                    }).ToList(),
                    userAppointmentsByEmailDetails = userAppointmentsByEmail.Select(a => new
                    {
                        id = a.Id,
                        customerEmail = a.CustomerEmail,
                        customerId = a.CustomerId,
                        customerName = a.CustomerName,
                        barbershopName = a.Barbershop?.Name,
                        serviceName = a.Service?.Name,
                        appointmentDate = a.AppointmentDate.ToString("yyyy-MM-dd"),
                        appointmentTime = a.AppointmentTime.ToString(@"hh\\:mm"),
                        status = a.Status.ToString(),
                        createdAt = a.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }
    }
}
