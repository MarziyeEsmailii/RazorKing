using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using RazorKing.Data;
using RazorKing.Models;
using RazorKing.Models.ViewModels;

namespace RazorKing.Controllers
{
    public class BookingController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<BookingController> _logger;

        public BookingController(
            ApplicationDbContext context, 
            UserManager<ApplicationUser> userManager,
            ILogger<BookingController> logger)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
        }

        public async Task<IActionResult> Index()
        {
            var cities = await _context.Cities.OrderBy(c => c.Name).ToListAsync();

            // اگر شهری نیست، شهرهای پیش‌فرض اضافه کن
            if (!cities.Any())
            {
                var defaultCities = new List<City>
                {
                    new City { Name = "گرگان", Province = "گلستان" },
                    new City { Name = "گنبد کاووس", Province = "گلستان" },
                    new City { Name = "علی آباد کتول", Province = "گلستان" },
                    new City { Name = "آق قلا", Province = "گلستان" },
                    new City { Name = "کردکوی", Province = "گلستان" }
                };

                _context.Cities.AddRange(defaultCities);
                await _context.SaveChangesAsync();

                cities = await _context.Cities.OrderBy(c => c.Name).ToListAsync();
            }

            // اضافه کردن اطلاعات کاربر به ViewBag برای کاربران وارد شده
            if (User.Identity?.IsAuthenticated == true)
            {
                var user = await _userManager.GetUserAsync(User);
                if (user != null)
                {
                    ViewBag.UserName = $"{user.FirstName} {user.LastName}".Trim();
                    ViewBag.UserPhone = user.PhoneNumber;
                    ViewBag.UserEmail = user.Email;
                }
            }

            var viewModel = new BookingViewModel
            {
                Cities = cities
            };
            return View(viewModel);
        }

        [HttpGet]
        public async Task<IActionResult> GetBarbershops(int cityId)
        {
            var barbershops = await _context.Barbershops
                .Where(b => b.CityId == cityId && b.IsActive)
                .OrderBy(b => b.Name)
                .Select(b => new {
                    id = b.Id,
                    name = b.Name,
                    address = b.Address,
                    phone = b.Phone,
                    description = b.Description
                })
                .ToListAsync();

            // اگر آرایشگاهی نیست، آرایشگاه‌های نمونه برگردان
            if (!barbershops.Any())
            {
                var sampleBarbershops = new[]
                {
                    new {
                        id = 1,
                        name = "آرایشگاه مردانه VIP",
                        address = "خیابان اصلی، کوچه 5",
                        phone = "09123456789",
                        description = "آرایشگاه مدرن با امکانات کامل"
                    },
                    new {
                        id = 2,
                        name = "آرایشگاه کلاسیک",
                        address = "میدان مرکزی، پلاک 15",
                        phone = "09987654321",
                        description = "آرایشگاه سنتی با تجربه 20 ساله"
                    },
                    new {
                        id = 3,
                        name = "آرایشگاه مدرن استایل",
                        address = "خیابان امام، جنب بانک ملی",
                        phone = "09111222333",
                        description = "جدیدترین مدل‌های مو و ریش"
                    }
                };

                return Json(sampleBarbershops);
            }

            return Json(barbershops);
        }

        [HttpGet]
        public async Task<IActionResult> GetServices(int barbershopId)
        {
            var services = await _context.Services
                .Where(s => s.BarbershopId == barbershopId && s.IsActive)
                .OrderBy(s => s.Name)
                .Select(s => new {
                    id = s.Id,
                    name = s.Name,
                    description = s.Description,
                    price = s.Price,
                    duration = s.Duration
                })
                .ToListAsync();

            // اگر خدماتی نیست، خدمات نمونه برگردان
            if (!services.Any())
            {
                var sampleServices = new[]
                {
                    new {
                        id = 1,
                        name = "کوتاهی مو",
                        description = "کوتاهی مو با جدیدترین مدل‌ها",
                        price = 50000m,
                        duration = 30
                    },
                    new {
                        id = 2,
                        name = "اصلاح ریش",
                        description = "اصلاح و فرم دهی ریش",
                        price = 30000m,
                        duration = 20
                    },
                    new {
                        id = 3,
                        name = "شستشو و سشوار",
                        description = "شستشو و خشک کردن مو",
                        price = 25000m,
                        duration = 15
                    },
                    new {
                        id = 4,
                        name = "رنگ مو",
                        description = "رنگ کردن مو با رنگ‌های طبیعی",
                        price = 80000m,
                        duration = 60
                    }
                };

                return Json(sampleServices);
            }

            return Json(services);
        }

        [HttpGet]
        public async Task<IActionResult> GetAvailableDates(int barbershopId, int serviceId)
        {
            try
            {
                var barbershop = await _context.Barbershops
                    .FirstOrDefaultAsync(b => b.Id == barbershopId);

                if (barbershop == null)
                {
                    return Json(new { success = false, message = "آرایشگاه یافت نشد" });
                }

                var service = await _context.Services
                    .FirstOrDefaultAsync(s => s.Id == serviceId);

                if (service == null)
                {
                    return Json(new { success = false, message = "خدمت یافت نشد" });
                }

                var availableDates = new List<object>();
                var startDate = DateTime.Today;
                var endDate = startDate.AddDays(30); // نمایش 30 روز آینده

                // تعریف روزهای کاری پیش‌فرض (شنبه تا پنج‌شنبه)
                var defaultWorkingDays = new List<int> { 6, 0, 1, 2, 3, 4 }; // Saturday to Thursday

                for (var date = startDate; date <= endDate; date = date.AddDays(1))
                {
                    // بررسی روزهای کاری آرایشگاه
                    var dayOfWeek = (int)date.DayOfWeek;

                    // استفاده از روزهای کاری پیش‌فرض اگر تنظیم نشده باشد
                    var isWorkingDay = defaultWorkingDays.Contains(dayOfWeek);

                    // اگر روزهای کاری تنظیم شده، از آن استفاده کن
                    if (!string.IsNullOrEmpty(barbershop.WorkingDays))
                    {
                        var persianDayName = GetPersianDayName(date.DayOfWeek);
                        isWorkingDay = barbershop.WorkingDays.Contains(persianDayName);
                    }

                    if (!isWorkingDay)
                        continue;

                    // بررسی تعداد نوبت‌های رزرو شده در این روز
                    var bookedAppointments = await _context.Appointments
                        .Where(a => a.BarbershopId == barbershopId &&
                                   a.AppointmentDate.Date == date.Date &&
                                   a.Status != AppointmentStatus.Cancelled)
                        .CountAsync();

                    // محاسبه ظرفیت روزانه (بر اساس ساعات کاری و مدت زمان خدمت)
                    var openTime = barbershop.OpenTime != TimeSpan.Zero ? barbershop.OpenTime : new TimeSpan(8, 0, 0);
                    var closeTime = barbershop.CloseTime != TimeSpan.Zero ? barbershop.CloseTime : new TimeSpan(20, 0, 0);
                    var serviceDuration = service.Duration > 0 ? service.Duration : 30;

                    var totalMinutes = (int)(closeTime - openTime).TotalMinutes;
                    var maxAppointments = Math.Max(1, totalMinutes / serviceDuration);

                    // فقط روزهایی که حداقل یک نوبت آزاد دارند را نمایش بده
                    var availableSlots = maxAppointments - bookedAppointments;
                    if (availableSlots > 0)
                    {
                        availableDates.Add(new
                        {
                            date = date.ToString("yyyy-MM-dd"),
                            displayDate = date.ToString("yyyy/MM/dd"),
                            dayName = GetPersianDayName(date.DayOfWeek),
                            availableSlots = availableSlots,
                            isToday = date.Date == DateTime.Today,
                            isTomorrow = date.Date == DateTime.Today.AddDays(1),
                            isAvailable = true // همیشه آزاد چون فیلتر شده‌اند
                        });
                    }
                }

                // اگر هیچ روز خالی یافت نشد، حداقل 7 روز آینده را اضافه کن
                if (availableDates.Count == 0)
                {

                    for (var i = 0; i < 7; i++)
                    {
                        var date = DateTime.Today.AddDays(i);
                        var dayOfWeek = (int)date.DayOfWeek;

                        // فقط روزهای شنبه تا پنج‌شنبه
                        if (dayOfWeek != 5) // نه جمعه
                        {
                            availableDates.Add(new
                            {
                                date = date.ToString("yyyy-MM-dd"),
                                displayDate = date.ToString("yyyy/MM/dd"),
                                dayName = GetPersianDayName(date.DayOfWeek),
                                availableSlots = 10, // ظرفیت پیش‌فرض
                                isToday = date.Date == DateTime.Today,
                                isTomorrow = date.Date == DateTime.Today.AddDays(1)
                            });
                        }
                    }
                }

                return Json(new { success = true, dates = availableDates });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available dates for barbershop {BarbershopId} and service {ServiceId}", barbershopId, serviceId);
                return Json(new { success = false, message = "خطا در دریافت روزهای خالی" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAvailableTimes(int barbershopId, int serviceId, string date)
        {
            try
            {
                var selectedDate = DateTime.Parse(date);

                var barbershop = await _context.Barbershops
                    .FirstOrDefaultAsync(b => b.Id == barbershopId);

                if (barbershop == null)
                {
                    return Json(new { success = false, message = "آرایشگاه یافت نشد" });
                }

                var service = await _context.Services
                    .FirstOrDefaultAsync(s => s.Id == serviceId);

                if (service == null)
                {
                    return Json(new { success = false, message = "خدمت یافت نشد" });
                }

                // دریافت نوبت‌های رزرو شده در این روز
                var bookedAppointments = await _context.Appointments
                    .Where(a => a.BarbershopId == barbershopId &&
                               a.AppointmentDate.Date == selectedDate.Date &&
                               a.Status != AppointmentStatus.Cancelled)
                    .Select(a => a.AppointmentTime)
                    .ToListAsync();

                var availableTimes = new List<object>();
                var openTime = barbershop.OpenTime != TimeSpan.Zero ? barbershop.OpenTime : new TimeSpan(8, 0, 0);
                var closeTime = barbershop.CloseTime != TimeSpan.Zero ? barbershop.CloseTime : new TimeSpan(20, 0, 0);
                var serviceDuration = service.Duration > 0 ? service.Duration : 30;

                // تولید ساعات ممکن - فقط ساعات آزاد
                var currentTime = openTime;
                while (currentTime.Add(TimeSpan.FromMinutes(serviceDuration)) <= closeTime)
                {
                    // بررسی اینکه این ساعت رزرو نشده باشد
                    var isBooked = bookedAppointments.Any(bookedTime =>
                        Math.Abs((bookedTime - currentTime).TotalMinutes) < serviceDuration);

                    // اگر روز امروز است، ساعت‌های گذشته را نمایش نده
                    var isPastTime = selectedDate.Date == DateTime.Today &&
                                    DateTime.Now.TimeOfDay > currentTime;

                    // فقط ساعات آزاد و غیرگذشته را اضافه کن
                    if (!isBooked && !isPastTime)
                    {
                        availableTimes.Add(new
                        {
                            time = currentTime.ToString(@"hh\\:mm"),
                            displayTime = currentTime.ToString(@"hh\\:mm"),
                            isPrime = IsPrimeTime(currentTime), // ساعات اوج
                            isRecommended = IsRecommendedTime(currentTime), // ساعات پیشنهادی
                            isAvailable = true // همیشه آزاد چون فیلتر شده‌اند
                        });
                    }

                    currentTime = currentTime.Add(TimeSpan.FromMinutes(30)); // فاصله 30 دقیقه‌ای
                }

                return Json(new { success = true, times = availableTimes });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available times for barbershop {BarbershopId} on {Date}", barbershopId, date);
                return Json(new { success = false, message = "خطا در دریافت ساعات خالی" });
            }
        }

        private string GetPersianDayName(DayOfWeek dayOfWeek)
        {
            return dayOfWeek switch
            {
                DayOfWeek.Saturday => "شنبه",
                DayOfWeek.Sunday => "یکشنبه",
                DayOfWeek.Monday => "دوشنبه",
                DayOfWeek.Tuesday => "سه‌شنبه",
                DayOfWeek.Wednesday => "چهارشنبه",
                DayOfWeek.Thursday => "پنج‌شنبه",
                DayOfWeek.Friday => "جمعه",
                _ => ""
            };
        }

        private bool IsPrimeTime(TimeSpan time)
        {
            // ساعات اوج: 16:00 تا 20:00
            return time >= TimeSpan.FromHours(16) && time <= TimeSpan.FromHours(20);
        }

        private bool IsRecommendedTime(TimeSpan time)
        {
            // ساعات پیشنهادی: 10:00 تا 14:00
            return time >= TimeSpan.FromHours(10) && time <= TimeSpan.FromHours(14);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentRequest request)
        {
            try
            {
                // Validate request
                if (request == null)
                {
                    _logger.LogWarning("CreateAppointment called with null request");
                    return Json(new { success = false, message = "درخواست نامعتبر است" });
                }

                if (string.IsNullOrWhiteSpace(request.CustomerName) || 
                    string.IsNullOrWhiteSpace(request.CustomerPhone) ||
                    !request.ServiceIds.Any())
                {
                    _logger.LogWarning("CreateAppointment called with invalid data");
                    return Json(new { success = false, message = "اطلاعات ناقص است" });
                }

                // اجبار به ثبت نام برای کاربران غیرعضو
                if (User.Identity?.IsAuthenticated != true)
                {
                    return Json(new { 
                        success = false, 
                        requiresLogin = true,
                        message = "برای تکمیل رزرو باید وارد حساب کاربری خود شوید یا ثبت نام کنید" 
                    });
                }

                // Verify barbershop exists
                var barbershop = await _context.Barbershops
                    .FirstOrDefaultAsync(b => b.Id == request.BarbershopId && b.IsActive);
                
                if (barbershop == null)
                {
                    _logger.LogWarning("Barbershop {BarbershopId} not found", request.BarbershopId);
                    return Json(new { success = false, message = "آرایشگاه یافت نشد" });
                }

                // Verify service exists
                var service = await _context.Services
                    .FirstOrDefaultAsync(s => s.Id == request.ServiceIds.First() && s.IsActive);
                
                if (service == null)
                {
                    _logger.LogWarning("Service {ServiceId} not found", request.ServiceIds.First());
                    return Json(new { success = false, message = "خدمت یافت نشد" });
                }

                // Get current user (must be authenticated at this point)
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    return Json(new { 
                        success = false, 
                        requiresLogin = true,
                        message = "لطفاً مجدداً وارد حساب کاربری خود شوید" 
                    });
                }

                string customerId = user.Id;
                string customerEmail = user.Email ?? "";

                // Use user's info if not provided in request
                if (string.IsNullOrEmpty(request.CustomerName))
                {
                    request.CustomerName = $"{user.FirstName} {user.LastName}".Trim();
                }
                if (string.IsNullOrEmpty(request.CustomerPhone))
                {
                    request.CustomerPhone = user.PhoneNumber ?? "";
                }

                // Parse and validate date/time
                if (!DateTime.TryParse(request.Date, out var appointmentDate))
                {
                    return Json(new { success = false, message = "تاریخ نامعتبر است" });
                }

                if (!TimeSpan.TryParse(request.Time, out var appointmentTime))
                {
                    return Json(new { success = false, message = "ساعت نامعتبر است" });
                }

                // Check if time slot is still available
                var existingAppointment = await _context.Appointments
                    .AnyAsync(a => a.BarbershopId == request.BarbershopId &&
                                  a.AppointmentDate.Date == appointmentDate.Date &&
                                  a.AppointmentTime == appointmentTime &&
                                  a.Status != AppointmentStatus.Cancelled);

                if (existingAppointment)
                {
                    return Json(new { success = false, message = "این ساعت قبلاً رزرو شده است" });
                }

                var appointment = new Appointment
                {
                    CustomerId = customerId,
                    CustomerName = request.CustomerName.Trim(),
                    CustomerPhone = request.CustomerPhone.Trim(),
                    CustomerEmail = customerEmail,
                    BarbershopId = request.BarbershopId,
                    ServiceId = request.ServiceIds.First(),
                    AppointmentDate = appointmentDate,
                    AppointmentTime = appointmentTime,
                    TotalPrice = request.TotalPrice,
                    PaidAmount = request.PaidAmount,
                    Status = AppointmentStatus.Confirmed,
                    CreatedAt = DateTime.Now,
                    Notes = request.Notes?.Trim() ?? ""
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                _logger.LogInformation("New appointment created - ID: {AppointmentId}, Customer: {CustomerName}, Date: {Date}, Time: {Time}", 
                    appointment.Id, appointment.CustomerName, appointment.AppointmentDate.ToString("yyyy-MM-dd"), appointment.AppointmentTime);

                if (!string.IsNullOrEmpty(customerId))
                {
                    _logger.LogInformation("Appointment linked to user {UserId} ({Email})", customerId, customerEmail);
                }

                return Json(new { success = true, appointmentId = appointment.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating appointment");
                return Json(new { success = false, message = "خطا در ایجاد نوبت" });
            }
        }

        public async Task<IActionResult> Confirmation(int id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Barbershop)
                .ThenInclude(b => b.City)
                .Include(a => a.Service)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appointment == null)
                return NotFound();

            return View(appointment);
        }

        // Debug endpoint to check appointments
        [HttpGet]
        public async Task<IActionResult> DebugAppointments()
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
                        CustomerPhone = a.CustomerPhone,
                        CustomerEmail = a.CustomerEmail,
                        CustomerId = a.CustomerId,
                        BarbershopName = a.Barbershop.Name,
                        ServiceName = a.Service.Name,
                        AppointmentDate = a.AppointmentDate.ToString("yyyy-MM-dd"),
                        AppointmentTime = a.AppointmentTime.ToString(@"hh\\:mm"),
                        Status = a.Status.ToString(),
                        CreatedAt = a.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
                    })
                    .ToListAsync();

                return Json(new {
                    success = true,
                    count = appointments.Count,
                    appointments = appointments
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DebugAppointments");
                return Json(new { success = false, message = "خطا در دریافت اطلاعات" });
            }
        }

        // Check user authentication status for booking
        [HttpGet]
        public IActionResult CheckAuthStatus()
        {
            try
            {
                var isAuthenticated = User.Identity?.IsAuthenticated == true;
                
                if (isAuthenticated)
                {
                    var user = _userManager.GetUserAsync(User).Result;
                    if (user != null)
                    {
                        return Json(new
                        {
                            success = true,
                            isAuthenticated = true,
                            user = new
                            {
                                id = user.Id,
                                email = user.Email,
                                firstName = user.FirstName,
                                lastName = user.LastName,
                                phoneNumber = user.PhoneNumber,
                                fullName = $"{user.FirstName} {user.LastName}".Trim()
                            }
                        });
                    }
                }
                
                return Json(new
                {
                    success = true,
                    isAuthenticated = false,
                    message = "کاربر وارد نشده است"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking auth status");
                return Json(new
                {
                    success = false,
                    isAuthenticated = false,
                    message = "خطا در بررسی وضعیت کاربر"
                });
            }
        }

        // Debug endpoint to check user appointments
        [HttpGet]
        public async Task<IActionResult> DebugUserAppointments()
        {
            try
            {
                if (!User.Identity?.IsAuthenticated == true)
                {
                    return Json(new { success = false, message = "کاربر وارد نشده است" });
                }

                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    return Json(new { success = false, message = "کاربر یافت نشد" });
                }

                var appointments = await _context.Appointments
                    .Include(a => a.Barbershop)
                    .Include(a => a.Service)
                    .Where(a => a.CustomerEmail == user.Email || a.CustomerId == user.Id)
                    .OrderByDescending(a => a.CreatedAt)
                    .Select(a => new
                    {
                        Id = a.Id,
                        CustomerName = a.CustomerName,
                        CustomerPhone = a.CustomerPhone,
                        CustomerEmail = a.CustomerEmail,
                        CustomerId = a.CustomerId,
                        BarbershopName = a.Barbershop.Name,
                        ServiceName = a.Service.Name,
                        AppointmentDate = a.AppointmentDate.ToString("yyyy-MM-dd"),
                        AppointmentTime = a.AppointmentTime.ToString(@"hh\\:mm"),
                        Status = a.Status.ToString(),
                        CreatedAt = a.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
                    })
                    .ToListAsync();

                return Json(new {
                    success = true,
                    userId = user.Id,
                    userEmail = user.Email,
                    count = appointments.Count,
                    appointments = appointments
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DebugUserAppointments");
                return Json(new { success = false, message = "خطا در دریافت اطلاعات کاربر" });
            }
        }

        // Debug endpoint to check barbershop working hours
        [HttpGet]
        public async Task<IActionResult> DebugBarbershopHours()
        {
            try
            {
                var barbershops = await _context.Barbershops
                    .Include(b => b.City)
                    .Where(b => b.IsActive)
                    .OrderBy(b => b.Name)
                    .Select(b => new
                    {
                        Id = b.Id,
                        Name = b.Name,
                        CityName = b.City.Name,
                        OpenTime = b.OpenTime.ToString(@"hh\\:mm"),
                        CloseTime = b.CloseTime.ToString(@"hh\\:mm"),
                        WorkingDays = b.WorkingDays,
                        IsActive = b.IsActive
                    })
                    .ToListAsync();

                return Json(new {
                    success = true,
                    count = barbershops.Count,
                    barbershops = barbershops
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DebugBarbershopHours");
                return Json(new { success = false, message = "خطا در دریافت ساعات کاری آرایشگاه‌ها" });
            }
        }

        // Debug endpoint to test available times for specific barbershop
        [HttpGet]
        public async Task<IActionResult> TestAvailableTimes(int barbershopId, int serviceId, string date = "")
        {
            try
            {
                if (string.IsNullOrEmpty(date))
                {
                    date = DateTime.Today.AddDays(1).ToString("yyyy-MM-dd"); // فردا تا مطمئن باشیم ساعات گذشته نیست
                }

                var barbershop = await _context.Barbershops
                    .FirstOrDefaultAsync(b => b.Id == barbershopId);

                var service = await _context.Services
                    .FirstOrDefaultAsync(s => s.Id == serviceId);

                if (barbershop == null || service == null)
                {
                    return Json(new { 
                        success = false, 
                        message = "آرایشگاه یا خدمت یافت نشد",
                        barbershopFound = barbershop != null,
                        serviceFound = service != null
                    });
                }

                // مستقیماً منطق GetAvailableTimes رو اجرا کن
                var selectedDate = DateTime.Parse(date);
                var bookedAppointments = await _context.Appointments
                    .Where(a => a.BarbershopId == barbershopId &&
                               a.AppointmentDate.Date == selectedDate.Date &&
                               a.Status != AppointmentStatus.Cancelled)
                    .Select(a => a.AppointmentTime)
                    .ToListAsync();

                var availableTimes = new List<object>();
                var openTime = barbershop.OpenTime != TimeSpan.Zero ? barbershop.OpenTime : new TimeSpan(8, 0, 0);
                var closeTime = barbershop.CloseTime != TimeSpan.Zero ? barbershop.CloseTime : new TimeSpan(20, 0, 0);
                var serviceDuration = service.Duration > 0 ? service.Duration : 30;

                var currentTime = openTime;
                while (currentTime.Add(TimeSpan.FromMinutes(serviceDuration)) <= closeTime)
                {
                    var isBooked = bookedAppointments.Any(bookedTime =>
                        Math.Abs((bookedTime - currentTime).TotalMinutes) < serviceDuration);

                    if (!isBooked)
                    {
                        availableTimes.Add(new
                        {
                            time = currentTime.ToString(@"hh\\:mm"),
                            displayTime = currentTime.ToString(@"hh\\:mm"),
                            isPrime = IsPrimeTime(currentTime),
                            isRecommended = IsRecommendedTime(currentTime)
                        });
                    }

                    currentTime = currentTime.Add(TimeSpan.FromMinutes(30));
                }
                
                return Json(new {
                    success = true,
                    barbershop = new {
                        Id = barbershop.Id,
                        Name = barbershop.Name,
                        OpenTime = barbershop.OpenTime.ToString(@"hh\\:mm"),
                        CloseTime = barbershop.CloseTime.ToString(@"hh\\:mm")
                    },
                    service = new {
                        Id = service.Id,
                        Name = service.Name,
                        Duration = service.Duration
                    },
                    testDate = date,
                    bookedAppointmentsCount = bookedAppointments.Count,
                    availableTimesCount = availableTimes.Count,
                    availableTimes = availableTimes
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in TestAvailableTimes");
                return Json(new { success = false, message = "خطا در تست ساعات خالی", error = ex.Message });
            }
        }
    }

    // Request/Response Models
    public class CreateAppointmentRequest
    {
        public int BarbershopId { get; set; }
        public List<int> ServiceIds { get; set; } = new();
        public string Date { get; set; } = "";
        public string Time { get; set; } = "";
        public string CustomerName { get; set; } = "";
        public string CustomerPhone { get; set; } = "";
        public string CustomerEmail { get; set; } = "";
        public decimal TotalPrice { get; set; }
        public decimal PaidAmount { get; set; }
        public string? Notes { get; set; }
    }
}
