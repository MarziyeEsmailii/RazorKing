using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using RazorKing.Data;
using RazorKing.Models;
using RazorKing.Models.ViewModels;

namespace RazorKing.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public HomeController(ILogger<HomeController> logger, ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _logger = logger;
            _context = context;
            _userManager = userManager;
        }

        [ResponseCache(Duration = 300, VaryByHeader = "User-Agent", Location = ResponseCacheLocation.Any)]
        public async Task<IActionResult> Index()
        {
            try
            {
                Console.WriteLine("🏠 Loading Home Index...");
                
                var cities = await _context.Cities
                    .Include(c => c.Barbershops.Where(b => b.IsActive))
                    .OrderBy(c => c.Name)
                    .ToListAsync();
                
                Console.WriteLine($"📊 Cities loaded: {cities.Count}");
                
                var totalBarbershops = await _context.Barbershops.CountAsync(b => b.IsActive);
                var totalAppointments = await _context.Appointments.CountAsync();
                var totalCustomers = await _context.Appointments
                    .Select(a => a.CustomerPhone)
                    .Distinct()
                    .CountAsync();
                
                Console.WriteLine($"📊 Stats - Barbershops: {totalBarbershops}, Appointments: {totalAppointments}, Customers: {totalCustomers}");
                
                var viewModel = new HomeViewModel
                {
                    Cities = cities,
                    TotalBarbershops = totalBarbershops,
                    TotalAppointments = totalAppointments,
                    TotalCustomers = totalCustomers,
                    FeaturedBarbershops = await _context.Barbershops
                        .Include(b => b.City)
                        .Include(b => b.Services)
                        .Where(b => b.IsActive)
                        .OrderByDescending(b => b.CreatedAt)
                        .Take(6)
                        .ToListAsync(),
                    PopularServices = await _context.Services
                        .Include(s => s.Barbershop)
                        .Where(s => s.Barbershop.IsActive)
                        .GroupBy(s => s.Name)
                        .Select(g => new ServiceSummary
                        {
                            Name = g.Key,
                            Count = g.Count(),
                            AveragePrice = g.Average(s => s.Price),
                            MinPrice = g.Min(s => s.Price),
                            MaxPrice = g.Max(s => s.Price)
                        })
                        .OrderByDescending(s => s.Count)
                        .Take(4)
                        .ToListAsync(),
                    RecentAppointments = await _context.Appointments
                        .Include(a => a.Barbershop)
                        .ThenInclude(b => b.City)
                        .Include(a => a.Service)
                        .Where(a => a.Barbershop != null)
                        .OrderByDescending(a => a.CreatedAt)
                        .Take(10)
                        .ToListAsync()
                };

                // Add user profile data if authenticated
                if (User.Identity.IsAuthenticated)
                {
                    var user = await _userManager.GetUserAsync(User);
                    if (user != null)
                    {
                        var userAppointments = await _context.Appointments
                            .Include(a => a.Barbershop)
                            .ThenInclude(b => b.City)
                            .Include(a => a.Service)
                            .Where(a => a.CustomerEmail.ToLower() == user.Email.ToLower() || 
                                       a.CustomerId == user.Id ||
                                       a.CustomerEmail.ToLower() == user.UserName.ToLower())
                            .OrderByDescending(a => a.AppointmentDate)
                            .ThenByDescending(a => a.AppointmentTime)
                            .ToListAsync();

                        Console.WriteLine($"🔍 Debug - User: {user.Email}, UserName: {user.UserName}, ID: {user.Id}");
                        Console.WriteLine($"🔍 Debug - Found appointments: {userAppointments.Count}");
                        foreach (var apt in userAppointments)
                        {
                            Console.WriteLine($"📅 Appointment: {apt.Id}, CustomerEmail: {apt.CustomerEmail}, CustomerId: {apt.CustomerId}, Date: {apt.AppointmentDate}, Status: {apt.Status}");
                        }

                        viewModel.UserProfile = new ProfileViewModel
                        {
                            User = user,
                            Appointments = userAppointments,
                            UpcomingAppointments = userAppointments.Where(a => a.AppointmentDate.Add(a.AppointmentTime) > DateTime.Now).Take(3).ToList(),
                            PastAppointments = userAppointments.Where(a => a.AppointmentDate.Add(a.AppointmentTime) <= DateTime.Now).Take(3).ToList(),
                            TotalAppointments = userAppointments.Count,
                            TotalSpent = userAppointments.Where(a => a.Status == AppointmentStatus.Completed).Sum(a => a.TotalPrice)
                        };
                    }
                }

                return View(viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading home page data");
                
                // Return view with empty model in case of error
                var emptyModel = new HomeViewModel
                {
                    Cities = new List<City>(),
                    FeaturedBarbershops = new List<Barbershop>(),
                    PopularServices = new List<ServiceSummary>(),
                    RecentAppointments = new List<Appointment>()
                };
                
                return View(emptyModel);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetCityStats()
        {
            var cityStats = await _context.Cities
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    BarbershopCount = c.Barbershops.Count(b => b.IsActive),
                    AppointmentCount = c.Barbershops.SelectMany(b => b.Appointments).Count(),
                    ServiceCount = c.Barbershops.SelectMany(b => b.Services).Count()
                })
                .ToListAsync();

            return Json(cityStats);
        }

        [HttpGet]
        public async Task<IActionResult> GetCityBarbershops(int cityId)
        {
            try
            {
                var barbershops = await _context.Barbershops
                    .Include(b => b.Services)
                    .Include(b => b.City)
                    .Where(b => b.CityId == cityId && b.IsActive)
                    .OrderBy(b => b.Name)
                    .Select(b => new
                    {
                        b.Id,
                        b.Name,
                        b.Address,
                        b.Phone,
                        b.Description,
                        Services = b.Services.Select(s => new
                        {
                            s.Name,
                            s.Price
                        }).ToList()
                    })
                    .ToListAsync();

                return Json(barbershops);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading barbershops for city {CityId}", cityId);
                return Json(new List<object>());
            }
        }

        [HttpGet]
        public async Task<IActionResult> SearchBarbershops(string query, int? cityId)
        {
            var barbershopsQuery = _context.Barbershops
                .Include(b => b.City)
                .Include(b => b.Services)
                .Where(b => b.IsActive);

            if (!string.IsNullOrEmpty(query))
            {
                barbershopsQuery = barbershopsQuery.Where(b => 
                    b.Name.Contains(query) || 
                    b.Description.Contains(query) ||
                    b.Address.Contains(query));
            }

            if (cityId.HasValue)
            {
                barbershopsQuery = barbershopsQuery.Where(b => b.CityId == cityId.Value);
            }

            var barbershops = await barbershopsQuery
                .OrderBy(b => b.Name)
                .Take(10)
                .Select(b => new
                {
                    b.Id,
                    b.Name,
                    b.Address,
                    b.Phone,
                    b.Description,
                    City = b.City.Name,
                    ServiceCount = b.Services.Count,
                    MinPrice = b.Services.Any() ? b.Services.Min(s => s.Price) : 0,
                    MaxPrice = b.Services.Any() ? b.Services.Max(s => s.Price) : 0
                })
                .ToListAsync();

            return Json(barbershops);
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        [HttpGet]
        public async Task<IActionResult> TestData()
        {
            try
            {
                var citiesCount = await _context.Cities.CountAsync();
                var barbershopsCount = await _context.Barbershops.CountAsync();
                var appointmentsCount = await _context.Appointments.CountAsync();
                
                var cities = await _context.Cities.Take(5).ToListAsync();
                
                return Json(new
                {
                    success = true,
                    data = new
                    {
                        citiesCount,
                        barbershopsCount,
                        appointmentsCount,
                        cities = cities.Select(c => new { c.Id, c.Name, c.Province })
                    }
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

                var allAppointments = await _context.Appointments
                    .Include(a => a.Barbershop)
                    .Include(a => a.Service)
                    .ToListAsync();

                var userAppointments = await _context.Appointments
                    .Include(a => a.Barbershop)
                    .Include(a => a.Service)
                    .Where(a => a.CustomerEmail == user.Email || a.CustomerId == user.Id)
                    .ToListAsync();

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        userEmail = user.Email,
                        userId = user.Id,
                        totalAppointments = allAppointments.Count,
                        userAppointments = userAppointments.Count,
                        appointments = userAppointments.Select(a => new
                        {
                            id = a.Id,
                            customerEmail = a.CustomerEmail,
                            customerId = a.CustomerId,
                            customerName = a.CustomerName,
                            appointmentDate = a.AppointmentDate.ToString("yyyy-MM-dd"),
                            appointmentTime = a.AppointmentTime.ToString(@"hh\\:mm"),
                            status = a.Status.ToString(),
                            barbershopName = a.Barbershop?.Name,
                            serviceName = a.Service?.Name
                        }).ToList(),
                        allAppointments = allAppointments.Select(a => new
                        {
                            id = a.Id,
                            customerEmail = a.CustomerEmail,
                            customerId = a.CustomerId,
                            customerName = a.CustomerName,
                            status = a.Status.ToString(),
                            appointmentDate = a.AppointmentDate.ToString("yyyy-MM-dd"),
                            barbershopName = a.Barbershop?.Name,
                            serviceName = a.Service?.Name
                        }).Take(20).ToList()
                    }
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
        public async Task<IActionResult> DebugAllAppointments()
        {
            try
            {
                var allAppointments = await _context.Appointments
                    .Include(a => a.Barbershop)
                    .Include(a => a.Service)
                    .OrderByDescending(a => a.CreatedAt)
                    .ToListAsync();

                var appointmentsByStatus = allAppointments
                    .GroupBy(a => a.Status)
                    .ToDictionary(g => g.Key.ToString(), g => g.Count());

                return Json(new
                {
                    success = true,
                    totalAppointments = allAppointments.Count,
                    appointmentsByStatus = appointmentsByStatus,
                    recentAppointments = allAppointments.Take(10).Select(a => new
                    {
                        id = a.Id,
                        customerName = a.CustomerName,
                        customerEmail = a.CustomerEmail,
                        customerId = a.CustomerId,
                        appointmentDate = a.AppointmentDate.ToString("yyyy-MM-dd"),
                        appointmentTime = a.AppointmentTime.ToString(@"hh\:mm"),
                        status = a.Status.ToString(),
                        barbershopName = a.Barbershop?.Name ?? "نامشخص",
                        serviceName = a.Service?.Name ?? "نامشخص",
                        createdAt = a.CreatedAt.ToString("yyyy-MM-dd HH:mm")
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
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
                var appointment = new Appointment
                {
                    CustomerId = user.Id,
                    CustomerName = $"{user.FirstName} {user.LastName}".Trim(),
                    CustomerPhone = user.PhoneNumber ?? "09123456789",
                    CustomerEmail = user.Email ?? "",
                    AppointmentDate = DateTime.Today.AddDays(1), // فردا
                    AppointmentTime = new TimeSpan(10, 0, 0), // ساعت 10 صبح
                    BarbershopId = barbershop.Id,
                    ServiceId = service.Id,
                    Status = AppointmentStatus.Confirmed,
                    TotalPrice = service.Price,
                    Notes = "نوبت تست ایجاد شده توسط سیستم",
                    CreatedAt = DateTime.Now
                };

                _context.Appointments.Add(appointment);
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
                Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
                return Json(new
                {
                    success = false,
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpGet]
        public async Task<IActionResult> City(int id)
        {
            var city = await _context.Cities
                .Include(c => c.Barbershops.Where(b => b.IsActive))
                .ThenInclude(b => b.Services.Where(s => s.IsActive))
                .FirstOrDefaultAsync(c => c.Id == id);

            if (city == null)
            {
                return NotFound();
            }

            var allServices = city.Barbershops.SelectMany(b => b.Services).ToList();

            var viewModel = new CityViewModel
            {
                City = city,
                Barbershops = city.Barbershops.OrderBy(b => b.Name).ToList(),
                TotalServices = allServices.Count,
                MinPrice = allServices.Any() ? allServices.Min(s => s.Price) : 0,
                MaxPrice = allServices.Any() ? allServices.Max(s => s.Price) : 0,
                AveragePrice = allServices.Any() ? allServices.Average(s => s.Price) : 0
            };

            return View(viewModel);
        }

        [HttpGet]
        public async Task<IActionResult> GetBarbershopDetails(int barbershopId)
        {
            try
            {
                var barbershop = await _context.Barbershops
                    .Include(b => b.City)
                    .Include(b => b.Services.Where(s => s.IsActive))
                    .FirstOrDefaultAsync(b => b.Id == barbershopId && b.IsActive);

                if (barbershop == null)
                {
                    return Json(null);
                }

                var result = new
                {
                    id = barbershop.Id,
                    name = barbershop.Name,
                    description = barbershop.Description,
                    address = barbershop.Address,
                    phone = barbershop.Phone,
                    imageUrl = barbershop.ImageUrl,
                    openTime = barbershop.OpenTime.ToString(@"hh\:mm"),
                    closeTime = barbershop.CloseTime.ToString(@"hh\:mm"),
                    workingDays = barbershop.WorkingDays,
                    cityName = barbershop.City?.Name,
                    services = barbershop.Services.Select(s => new
                    {
                        id = s.Id,
                        name = s.Name,
                        description = s.Description,
                        price = s.Price,
                        duration = s.Duration
                    }).ToList()
                };

                return Json(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading barbershop details for {BarbershopId}", barbershopId);
                return Json(null);
            }
        }    }
}
