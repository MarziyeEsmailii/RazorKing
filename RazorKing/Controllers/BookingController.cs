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