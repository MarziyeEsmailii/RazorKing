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

        public async Task<IActionResult> Index(int? cityId)
        {
            var cities = await _context.Cities.OrderBy(c => c.Name).ToListAsync();
            var viewModel = new BookingViewModel
            {
                Cities = cities,
                SelectedCityId = cityId
            };

            // If cityId is provided, pre-load barbershops
            if (cityId.HasValue)
            {
                viewModel.Barbershops = await _context.Barbershops
                    .Where(b => b.CityId == cityId.Value && b.IsActive)
                    .OrderBy(b => b.Name)
                    .ToListAsync();
            }

            return View(viewModel);
        }

        [HttpGet]
        public async Task<IActionResult> GetBarbershops(int cityId)
        {
            var barbershops = await _context.Barbershops
                .Include(b => b.Services)
                .Where(b => b.CityId == cityId && b.IsActive)
                .OrderBy(b => b.Name)
                .Select(b => new
                {
                    id = b.Id,
                    name = b.Name,
                    address = b.Address,
                    phone = b.Phone,
                    description = b.Description,
                    imagePath = b.ImageUrl,
                    serviceCount = b.Services.Count,
                    minPrice = b.Services.Any() ? b.Services.Min(s => s.Price) : 0,
                    maxPrice = b.Services.Any() ? b.Services.Max(s => s.Price) : 0,
                    openTime = b.OpenTime.ToString(@"hh\:mm"),
                    closeTime = b.CloseTime.ToString(@"hh\:mm"),
                    workingHours = $"{b.OpenTime.ToString(@"hh\:mm")} - {b.CloseTime.ToString(@"hh\:mm")}"
                })
                .ToListAsync();

            return Json(new { success = true, barbershops = barbershops });
        }

        [HttpGet]
        public async Task<IActionResult> GetServices(int barbershopId)
        {
            var services = await _context.Services
                .Where(s => s.BarbershopId == barbershopId && s.IsActive)
                .OrderBy(s => s.Name)
                .Select(s => new
                {
                    id = s.Id,
                    name = s.Name,
                    description = s.Description,
                    price = s.Price,
                    duration = s.Duration
                })
                .ToListAsync();

            return Json(new { success = true, services = services });
        }



        [HttpPost]
        public async Task<IActionResult> CreateAppointment(BookingViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("اطلاعات وارد شده صحیح نیست");
            }

            var services = await _context.Services
                .Where(s => model.SelectedServiceIds.Contains(s.Id))
                .ToListAsync();

            var totalPrice = services.Sum(s => s.Price);
            var depositAmount = totalPrice * 0.3m; // 30% deposit

            var appointment = new Appointment
            {
                CustomerName = model.CustomerName,
                CustomerPhone = model.CustomerPhone,
                AppointmentDate = model.SelectedDate!.Value,
                AppointmentTime = model.SelectedTime!.Value,
                BarbershopId = model.SelectedBarbershopId!.Value,
                TotalPrice = totalPrice,
                PaidAmount = depositAmount,
                Status = AppointmentStatus.Pending
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            // Add appointment services
            foreach (var service in services)
            {
                var appointmentService = new AppointmentService
                {
                    AppointmentId = appointment.Id,
                    ServiceId = service.Id,
                    Price = service.Price
                };
                _context.AppointmentServices.Add(appointmentService);
            }

            await _context.SaveChangesAsync();

            return Json(new { success = true, appointmentId = appointment.Id, depositAmount = depositAmount });
        }

        public async Task<IActionResult> Confirmation(int id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Barbershop)
                .ThenInclude(b => b.City)
                .Include(a => a.AppointmentServices)
                .ThenInclude(aps => aps.Service)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appointment == null)
            {
                return NotFound();
            }

            return View(appointment);
        }

        [HttpGet]
        public async Task<IActionResult> GetAvailableDates(int barbershopId)
        {
            try
            {
                var availableDates = new List<object>();
                var today = DateTime.Today;
                
                // نمایش 30 روز آینده
                for (int i = 1; i <= 30; i++)
                {
                    var date = today.AddDays(i);
                    
                    // چک کردن که روز تعطیل نباشد (جمعه)
                    if (date.DayOfWeek != DayOfWeek.Friday)
                    {
                        // چک کردن تعداد نوبت‌های رزرو شده
                        var bookedCount = await _context.Appointments
                            .CountAsync(a => a.BarbershopId == barbershopId && 
                                           a.AppointmentDate.Date == date.Date &&
                                           a.Status != AppointmentStatus.Cancelled);
                        
                        // حداکثر 20 نوبت در روز
                        var maxSlots = 20;
                        var availableSlots = maxSlots - bookedCount;
                        
                        if (availableSlots > 0)
                        {
                            availableDates.Add(new {
                                date = date.ToString("yyyy-MM-dd"),
                                display = date.ToString("yyyy/MM/dd"),
                                dayName = GetPersianDayName(date.DayOfWeek),
                                availableSlots = availableSlots,
                                isToday = date.Date == DateTime.Today,
                                isTomorrow = date.Date == DateTime.Today.AddDays(1)
                            });
                        }
                    }
                }
                
                return Json(new { success = true, dates = availableDates });
            }
            catch (Exception)
            {
                return Json(new { success = false, message = "خطا در بارگذاری تاریخ‌ها" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAvailableTimes(int barbershopId, string date)
        {
            try
            {
                if (!DateTime.TryParse(date, out var selectedDate))
                {
                    return Json(new { success = false, message = "تاریخ نامعتبر است" });
                }
                
                // دریافت نوبت‌های رزرو شده در این روز
                var existingAppointments = await _context.Appointments
                    .Where(a => a.BarbershopId == barbershopId && 
                              a.AppointmentDate.Date == selectedDate.Date &&
                              a.Status != AppointmentStatus.Cancelled)
                    .Select(a => a.AppointmentTime)
                    .ToListAsync();
                
                // تولید ساعات کاری (9 صبح تا 6 عصر، هر 30 دقیقه)
                var availableTimes = new List<object>();
                var startTime = new TimeSpan(9, 0, 0); // 9:00 صبح
                var endTime = new TimeSpan(18, 0, 0);  // 6:00 عصر
                var lunchStart = new TimeSpan(12, 0, 0); // 12:00 ظهر
                var lunchEnd = new TimeSpan(14, 0, 0);   // 2:00 عصر
                
                for (var time = startTime; time < endTime; time = time.Add(TimeSpan.FromMinutes(30)))
                {
                    // چک کردن وقت ناهار
                    if (time >= lunchStart && time < lunchEnd)
                        continue;
                    
                    // چک کردن رزرو نشده باشد
                    if (!existingAppointments.Contains(time))
                    {
                        var timeDisplay = DateTime.Today.Add(time).ToString("HH:mm");
                        var period = time.Hours < 12 ? "صبح" : "عصر";
                        
                        availableTimes.Add(new {
                            time = time.ToString(@"hh\:mm"),
                            display = timeDisplay,
                            period = period,
                            isPeak = time.Hours >= 16 && time.Hours < 18 // ساعات شلوغ
                        });
                    }
                }
                
                return Json(new { success = true, times = availableTimes });
            }
            catch (Exception)
            {
                return Json(new { success = false, message = "خطا در بارگذاری ساعات" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CalculatePrice([FromBody] CalculatePriceRequest request)
        {
            try
            {
                var barbershop = await _context.Barbershops
                    .Include(b => b.City)
                    .FirstOrDefaultAsync(b => b.Id == request.BarbershopId);
                
                if (barbershop == null)
                {
                    return Json(new { success = false, message = "آرایشگاه یافت نشد" });
                }
                
                decimal totalPrice = 0;
                var selectedServices = new List<object>();
                
                foreach (var serviceId in request.ServiceIds)
                {
                    var service = await _context.Services.FindAsync(serviceId);
                    if (service != null)
                    {
                        totalPrice += service.Price;
                        selectedServices.Add(new {
                            id = service.Id,
                            name = service.Name,
                            price = service.Price,
                            duration = service.Duration
                        });
                    }
                }
                
                var tax = totalPrice * 0.09m; // 9% مالیات
                var finalPrice = totalPrice + tax;
                var depositAmount = finalPrice * 0.3m; // 30% پیش پرداخت
                
                return Json(new {
                    success = true,
                    pricing = new {
                        basePrice = totalPrice,
                        tax = tax,
                        finalPrice = finalPrice,
                        depositAmount = depositAmount,
                        remainingAmount = finalPrice - depositAmount
                    },
                    barbershop = new {
                        id = barbershop.Id,
                        name = barbershop.Name,
                        phone = barbershop.Phone,
                        address = barbershop.Address,
                        cityName = barbershop.City?.Name
                    },
                    services = selectedServices
                });
            }
            catch (Exception)
            {
                return Json(new { success = false, message = "خطا در محاسبه قیمت" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentRequest request)
        {
            try
            {
                // تبدیل تاریخ و زمان
                if (!DateTime.TryParse(request.Date, out var appointmentDate))
                {
                    return Json(new { success = false, message = "تاریخ نامعتبر است" });
                }
                
                if (!TimeSpan.TryParse(request.Time, out var appointmentTime))
                {
                    return Json(new { success = false, message = "زمان نامعتبر است" });
                }
                
                // چک کردن در دسترس بودن زمان
                var existingAppointment = await _context.Appointments
                    .FirstOrDefaultAsync(a => a.BarbershopId == request.BarbershopId && 
                                            a.AppointmentDate.Date == appointmentDate.Date &&
                                            a.AppointmentTime == appointmentTime &&
                                            a.Status != AppointmentStatus.Cancelled);
                
                if (existingAppointment != null)
                {
                    return Json(new { success = false, message = "این زمان قبلاً رزرو شده است" });
                }
                
                // محاسبه قیمت کل
                decimal totalPrice = 0;
                foreach (var serviceId in request.ServiceIds)
                {
                    var service = await _context.Services.FindAsync(serviceId);
                    if (service != null)
                    {
                        totalPrice += service.Price;
                    }
                }
                
                var tax = totalPrice * 0.09m;
                var finalPrice = totalPrice + tax;
                
                // ایجاد نوبت جدید
                var appointment = new Appointment
                {
                    CustomerName = request.CustomerName,
                    CustomerPhone = request.CustomerPhone,
                    BarbershopId = request.BarbershopId,
                    ServiceId = request.ServiceIds.First(), // خدمت اصلی
                    AppointmentDate = appointmentDate,
                    AppointmentTime = appointmentTime,
                    TotalPrice = finalPrice,
                    PaidAmount = request.PaidAmount,
                    Status = AppointmentStatus.Confirmed,
                    CreatedAt = DateTime.Now,
                    Notes = request.Notes ?? ""
                };
                
                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();
                
                // اضافه کردن خدمات اضافی
                foreach (var serviceId in request.ServiceIds)
                {
                    var appointmentService = new AppointmentService
                    {
                        AppointmentId = appointment.Id,
                        ServiceId = serviceId,
                        Price = (await _context.Services.FindAsync(serviceId))?.Price ?? 0
                    };
                    _context.AppointmentServices.Add(appointmentService);
                }
                
                await _context.SaveChangesAsync();
                
                return Json(new { 
                    success = true, 
                    message = "نوبت با موفقیت رزرو شد",
                    appointmentId = appointment.Id,
                    appointment = new {
                        id = appointment.Id,
                        customerName = appointment.CustomerName,
                        customerPhone = appointment.CustomerPhone,
                        date = appointment.AppointmentDate.ToString("yyyy/MM/dd"),
                        time = appointment.AppointmentTime.ToString(@"hh\:mm")
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "خطا در ثبت نوبت: " + ex.Message });
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
    }

    // کلاس‌های درخواست
    public class CreateAppointmentRequest
    {
        public int BarbershopId { get; set; }
        public List<int> ServiceIds { get; set; } = new();
        public string Date { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public decimal PaidAmount { get; set; }
        public string? Notes { get; set; }
    }

    public class CalculatePriceRequest
    {
        public int BarbershopId { get; set; }
        public List<int> ServiceIds { get; set; } = new();
    }
}