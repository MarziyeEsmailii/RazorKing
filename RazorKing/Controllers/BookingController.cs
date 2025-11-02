using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RazorKing.Data;
using RazorKing.Models;
using RazorKing.Models.ViewModels;
using System.Linq;

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
                    b.Id,
                    b.Name,
                    b.Address,
                    b.Phone,
                    b.Description,
                    b.ImageUrl,
                    ServiceCount = b.Services.Count,
                    MinPrice = b.Services.Any() ? b.Services.Min(s => s.Price) : 0,
                    MaxPrice = b.Services.Any() ? b.Services.Max(s => s.Price) : 0,
                    OpenTime = b.OpenTime.ToString(@"hh\:mm"),
                    CloseTime = b.CloseTime.ToString(@"hh\:mm")
                })
                .ToListAsync();

            return Json(barbershops);
        }

        [HttpGet]
        public async Task<IActionResult> GetServices(int barbershopId)
        {
            var services = await _context.Services
                .Where(s => s.BarbershopId == barbershopId)
                .OrderBy(s => s.Name)
                .ToListAsync();

            return Json(services);
        }

        [HttpGet]
        public async Task<IActionResult> GetAvailableTimes(int barbershopId, DateTime date, string serviceIds)
        {
            try
            {
                var selectedServiceIds = serviceIds.Split(',').Select(int.Parse).ToList();
                var services = await _context.Services
                    .Where(s => selectedServiceIds.Contains(s.Id))
                    .ToListAsync();

                var totalDuration = services.Sum(s => s.Duration);
                
                var barbershop = await _context.Barbershops.FindAsync(barbershopId);
                if (barbershop == null) return Json(new List<string>());

                // بررسی روزهای کاری آرایشگاه
                var dayOfWeek = GetPersianDayOfWeek(date.DayOfWeek);
                var workingDays = barbershop.WorkingDays.Split(',').Select(d => d.Trim()).ToList();
                
                if (!workingDays.Contains(dayOfWeek))
                {
                    return Json(new { message = "آرایشگاه در این روز تعطیل است", times = new List<string>() });
                }

                // دریافت نوبت‌های موجود در آن روز
                var existingAppointments = await _context.Appointments
                    .Include(a => a.AppointmentServices)
                    .ThenInclude(aps => aps.Service)
                    .Where(a => a.BarbershopId == barbershopId && 
                               a.AppointmentDate.Date == date.Date &&
                               (a.Status == AppointmentStatus.Confirmed || a.Status == AppointmentStatus.Pending))
                    .ToListAsync();

                // بررسی برنامه کاری خاص آرایشگران در آن روز
                var barberSchedules = await _context.BarberSchedules
                    .Where(bs => bs.BarbershopId == barbershopId && 
                                bs.Date.Date == date.Date && 
                                bs.IsAvailable)
                    .ToListAsync();

                var availableTimes = new List<TimeSpan>();
                
                // اگر برنامه خاصی برای آن روز تعریف شده، از آن استفاده کن
                if (barberSchedules.Any())
                {
                    foreach (var schedule in barberSchedules)
                    {
                        var currentTime = schedule.StartTime;
                        while (currentTime.Add(TimeSpan.FromMinutes(totalDuration)) <= schedule.EndTime)
                        {
                            if (IsTimeSlotAvailable(currentTime, totalDuration, existingAppointments, date))
                            {
                                availableTimes.Add(currentTime);
                            }
                            currentTime = currentTime.Add(TimeSpan.FromMinutes(15));
                        }
                    }
                }
                else
                {
                    // استفاده از ساعات کاری عادی آرایشگاه
                    var currentTime = barbershop.OpenTime;
                    while (currentTime.Add(TimeSpan.FromMinutes(totalDuration)) <= barbershop.CloseTime)
                    {
                        if (IsTimeSlotAvailable(currentTime, totalDuration, existingAppointments, date))
                        {
                            availableTimes.Add(currentTime);
                        }
                        currentTime = currentTime.Add(TimeSpan.FromMinutes(15));
                    }
                }

                // مرتب‌سازی و تبدیل به رشته
                var timeStrings = availableTimes
                    .Distinct()
                    .OrderBy(t => t)
                    .Select(t => t.ToString(@"hh\:mm"))
                    .ToList();

                return Json(new { times = timeStrings, message = timeStrings.Any() ? "" : "متاسفانه در این تاریخ ساعت خالی وجود ندارد" });
            }
            catch (Exception ex)
            {
                return Json(new { times = new List<string>(), message = "خطا در بارگذاری ساعات" });
            }
        }

        private bool IsTimeSlotAvailable(TimeSpan startTime, int durationMinutes, List<Appointment> existingAppointments, DateTime date)
        {
            var endTime = startTime.Add(TimeSpan.FromMinutes(durationMinutes));
            
            // بررسی تداخل با نوبت‌های موجود
            foreach (var appointment in existingAppointments)
            {
                var appointmentDuration = appointment.AppointmentServices.Sum(aps => aps.Service.Duration);
                var appointmentEndTime = appointment.AppointmentTime.Add(TimeSpan.FromMinutes(appointmentDuration));
                
                // بررسی تداخل زمانی
                if (startTime < appointmentEndTime && endTime > appointment.AppointmentTime)
                {
                    return false;
                }
            }

            // بررسی اینکه زمان در گذشته نباشد
            if (date.Date == DateTime.Today && startTime <= DateTime.Now.TimeOfDay.Add(TimeSpan.FromMinutes(30)))
            {
                return false; // حداقل 30 دقیقه از الان
            }

            return true;
        }

        private string GetPersianDayOfWeek(DayOfWeek dayOfWeek)
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
                ServiceId = services.First().Id, // Use first service as primary
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
                .Include(a => a.Service)
                .Include(a => a.AppointmentServices)
                .ThenInclude(aps => aps.Service)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appointment == null)
            {
                return NotFound();
            }

            var services = appointment.AppointmentServices.Any() 
                ? appointment.AppointmentServices.Select(aps => aps.Service).ToList()
                : new List<Service> { appointment.Service }.Where(s => s != null).ToList();

            var viewModel = new BookingConfirmationViewModel
            {
                AppointmentId = appointment.Id,
                BarbershopName = appointment.Barbershop.Name,
                BarbershopAddress = appointment.Barbershop.Address,
                BarbershopPhone = appointment.Barbershop.Phone,
                CityName = appointment.Barbershop.City?.Name ?? "",
                AppointmentDate = appointment.AppointmentDate,
                AppointmentTime = appointment.AppointmentTime,
                ServiceName = services.Any() ? string.Join(", ", services.Select(s => s.Name)) : "",
                ServicePrice = services.Sum(s => s.Price),
                CustomerName = appointment.CustomerName,
                CustomerPhone = appointment.CustomerPhone
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
                    .FirstOrDefaultAsync(b => b.Id == barbershopId && b.IsActive);

                if (barbershop == null)
                {
                    return Json(null);
                }

                return Json(new
                {
                    id = barbershop.Id,
                    name = barbershop.Name,
                    cityId = barbershop.CityId,
                    cityName = barbershop.City?.Name
                });
            }
            catch (Exception ex)
            {
                return Json(null);
            }
        }
    }
}