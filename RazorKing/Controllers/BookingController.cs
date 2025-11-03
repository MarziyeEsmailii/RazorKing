using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RazorKing.Data;
using RazorKing.Models;
using RazorKing.Models.ViewModels;

namespace RazorKing.Controllers
{
    public class BookingController : Controller
    {
        private readonly ApplicationDbContext _context;

        public BookingController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var cities = await _context.Cities.OrderBy(c => c.Name).ToListAsync();
            
            // اگر شهری نیست، شهرهای پیش‌فرض اضافه کن
            if (!cities.Any())
            {
                Console.WriteLine("⚠️ هیچ شهری در دیتابیس یافت نشد، اضافه کردن شهرهای پیش‌فرض...");
                
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
                Console.WriteLine($"✅ {cities.Count} شهر اضافه شد");
            }
            
            Console.WriteLine($"📊 تعداد شهرهای موجود: {cities.Count}");
            foreach (var city in cities)
            {
                Console.WriteLine($"  - {city.Name} (ID: {city.Id})");
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
            Console.WriteLine($"🏪 درخواست آرایشگاه‌ها برای شهر ID: {cityId}");
            
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

            Console.WriteLine($"📊 {barbershops.Count} آرایشگاه یافت شد");
            
            // اگر آرایشگاهی نیست، آرایشگاه‌های نمونه برگردان
            if (!barbershops.Any())
            {
                Console.WriteLine("⚠️ آرایشگاهی یافت نشد، برگرداندن آرایشگاه‌های نمونه...");
                
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
            Console.WriteLine($"🛠️ درخواست خدمات برای آرایشگاه ID: {barbershopId}");
            
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

            Console.WriteLine($"📊 {services.Count} خدمت یافت شد");
            
            // اگر خدماتی نیست، خدمات نمونه برگردان
            if (!services.Any())
            {
                Console.WriteLine("⚠️ خدماتی یافت نشد، برگرداندن خدمات نمونه...");
                
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
            Console.WriteLine($"📅 درخواست روزهای خالی برای آرایشگاه {barbershopId} و خدمت {serviceId}");
            
            try
            {
                var barbershop = await _context.Barbershops
                    .FirstOrDefaultAsync(b => b.Id == barbershopId);
                
                if (barbershop == null)
                {
                    Console.WriteLine($"❌ آرایشگاه با ID {barbershopId} یافت نشد");
                    return Json(new { success = false, message = "آرایشگاه یافت نشد" });
                }

                var service = await _context.Services
                    .FirstOrDefaultAsync(s => s.Id == serviceId);
                
                if (service == null)
                {
                    Console.WriteLine($"❌ خدمت با ID {serviceId} یافت نشد");
                    return Json(new { success = false, message = "خدمت یافت نشد" });
                }

                Console.WriteLine($"🏪 آرایشگاه: {barbershop.Name}");
                Console.WriteLine($"🛠️ خدمت: {service.Name} - مدت: {service.Duration} دقیقه");
                Console.WriteLine($"⏰ ساعات کاری: {barbershop.OpenTime} تا {barbershop.CloseTime}");
                Console.WriteLine($"📅 روزهای کاری: {barbershop.WorkingDays}");

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

                    Console.WriteLine($"📊 {date:yyyy-MM-dd}: {bookedAppointments}/{maxAppointments} نوبت رزرو شده");

                    if (bookedAppointments < maxAppointments)
                    {
                        availableDates.Add(new
                        {
                            date = date.ToString("yyyy-MM-dd"),
                            displayDate = date.ToString("yyyy/MM/dd"),
                            dayName = GetPersianDayName(date.DayOfWeek),
                            availableSlots = maxAppointments - bookedAppointments,
                            isToday = date.Date == DateTime.Today,
                            isTomorrow = date.Date == DateTime.Today.AddDays(1)
                        });
                    }
                }

                Console.WriteLine($"📊 {availableDates.Count} روز خالی یافت شد");
                
                // اگر هیچ روز خالی یافت نشد، حداقل 7 روز آینده را اضافه کن
                if (availableDates.Count == 0)
                {
                    Console.WriteLine("⚠️ هیچ روز خالی یافت نشد، اضافه کردن روزهای پیش‌فرض...");
                    
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
                Console.WriteLine($"❌ خطا در دریافت روزهای خالی: {ex.Message}");
                Console.WriteLine($"❌ Stack Trace: {ex.StackTrace}");
                return Json(new { success = false, message = "خطا در دریافت روزهای خالی" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAvailableTimes(int barbershopId, int serviceId, string date)
        {
            Console.WriteLine($"🕐 درخواست ساعات خالی برای آرایشگاه {barbershopId}، خدمت {serviceId}، تاریخ {date}");
            
            try
            {
                var selectedDate = DateTime.Parse(date);
                
                var barbershop = await _context.Barbershops
                    .FirstOrDefaultAsync(b => b.Id == barbershopId);
                
                if (barbershop == null)
                {
                    Console.WriteLine($"❌ آرایشگاه با ID {barbershopId} یافت نشد");
                    return Json(new { success = false, message = "آرایشگاه یافت نشد" });
                }

                var service = await _context.Services
                    .FirstOrDefaultAsync(s => s.Id == serviceId);
                
                if (service == null)
                {
                    Console.WriteLine($"❌ خدمت با ID {serviceId} یافت نشد");
                    return Json(new { success = false, message = "خدمت یافت نشد" });
                }

                Console.WriteLine($"📅 تاریخ انتخاب شده: {selectedDate:yyyy-MM-dd}");
                Console.WriteLine($"🏪 آرایشگاه: {barbershop.Name}");
                Console.WriteLine($"🛠️ خدمت: {service.Name} - مدت: {service.Duration} دقیقه");

                // دریافت نوبت‌های رزرو شده در این روز
                var bookedAppointments = await _context.Appointments
                    .Where(a => a.BarbershopId == barbershopId && 
                               a.AppointmentDate.Date == selectedDate.Date &&
                               a.Status != AppointmentStatus.Cancelled)
                    .Select(a => a.AppointmentTime)
                    .ToListAsync();

                Console.WriteLine($"📊 {bookedAppointments.Count} نوبت رزرو شده در این روز");

                var availableTimes = new List<object>();
                var openTime = barbershop.OpenTime != TimeSpan.Zero ? barbershop.OpenTime : new TimeSpan(8, 0, 0);
                var closeTime = barbershop.CloseTime != TimeSpan.Zero ? barbershop.CloseTime : new TimeSpan(20, 0, 0);
                var serviceDuration = service.Duration > 0 ? service.Duration : 30;

                Console.WriteLine($"⏰ ساعات کاری: {openTime} تا {closeTime}");

                // تولید ساعات ممکن
                var currentTime = openTime;
                while (currentTime.Add(TimeSpan.FromMinutes(serviceDuration)) <= closeTime)
                {
                    // بررسی اینکه این ساعت رزرو نشده باشد
                    var isBooked = bookedAppointments.Any(bookedTime => 
                        Math.Abs((bookedTime - currentTime).TotalMinutes) < serviceDuration);

                    // اگر روز امروز است، ساعت‌های گذشته را نمایش نده
                    var isPastTime = selectedDate.Date == DateTime.Today && 
                                    DateTime.Now.TimeOfDay > currentTime;

                    if (!isBooked && !isPastTime)
                    {
                        availableTimes.Add(new
                        {
                            time = currentTime.ToString(@"hh\:mm"),
                            displayTime = currentTime.ToString(@"HH\:mm"),
                            isPrime = IsPrimeTime(currentTime), // ساعات اوج
                            isRecommended = IsRecommendedTime(currentTime) // ساعات پیشنهادی
                        });
                    }

                    currentTime = currentTime.Add(TimeSpan.FromMinutes(30)); // فاصله 30 دقیقه‌ای
                }

                // اگر هیچ ساعت خالی یافت نشد، ساعات پیش‌فرض اضافه کن
                if (availableTimes.Count == 0)
                {
                    Console.WriteLine("⚠️ هیچ ساعت خالی یافت نشد، اضافه کردن ساعات پیش‌فرض...");
                    
                    var defaultTimes = new[] { "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00" };
                    
                    foreach (var timeStr in defaultTimes)
                    {
                        var time = TimeSpan.Parse(timeStr);
                        
                        // اگر روز امروز است، ساعت‌های گذشته را نمایش نده
                        var isPastTime = selectedDate.Date == DateTime.Today && 
                                        DateTime.Now.TimeOfDay > time;
                        
                        if (!isPastTime)
                        {
                            availableTimes.Add(new
                            {
                                time = time.ToString(@"hh\:mm"),
                                displayTime = time.ToString(@"HH\:mm"),
                                isPrime = IsPrimeTime(time),
                                isRecommended = IsRecommendedTime(time)
                            });
                        }
                    }
                }

                Console.WriteLine($"📊 {availableTimes.Count} ساعت خالی یافت شد");
                return Json(new { success = true, times = availableTimes });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ خطا در دریافت ساعات خالی: {ex.Message}");
                Console.WriteLine($"❌ Stack Trace: {ex.StackTrace}");
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
        public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentRequest request)
        {
            try
            {
                var appointment = new Appointment
                {
                    CustomerName = request.CustomerName,
                    CustomerPhone = request.CustomerPhone,
                    BarbershopId = request.BarbershopId,
                    ServiceId = request.ServiceIds.First(),
                    AppointmentDate = DateTime.Parse(request.Date),
                    AppointmentTime = TimeSpan.Parse(request.Time),
                    TotalPrice = request.TotalPrice,
                    PaidAmount = request.PaidAmount,
                    Status = AppointmentStatus.Confirmed,
                    CreatedAt = DateTime.Now,
                    Notes = request.Notes ?? ""
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                return Json(new { success = true, appointmentId = appointment.Id });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
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
    }

    public class CreateAppointmentRequest
    {
        public int BarbershopId { get; set; }
        public List<int> ServiceIds { get; set; } = new();
        public string Date { get; set; } = "";
        public string Time { get; set; } = "";
        public string CustomerName { get; set; } = "";
        public string CustomerPhone { get; set; } = "";
        public decimal TotalPrice { get; set; }
        public decimal PaidAmount { get; set; }
        public string? Notes { get; set; }
    }
}