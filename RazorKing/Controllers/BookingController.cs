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
                    b.Id,
                    b.Name,
                    b.Address,
                    b.Phone,
                    b.Description,
                    b.ImagePath,
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

                var totalDuration = services.Sum(s => s.DurationMinutes);
                
                var barbershop = await _context.Barbershops.FindAsync(barbershopId);
                if (barbershop == null) return Json(new List<string>());

                // دریافت نوبت‌های موجود در آن روز
                var existingAppointments = await _context.Appointments
                    .Include(a => a.AppointmentServices)
                    .ThenInclude(aps => aps.Service)
                    .Where(a => a.BarbershopId == barbershopId && 
                               a.AppointmentDate.Date == date.Date &&
                               (a.Status == AppointmentStatus.Confirmed || a.Status == AppointmentStatus.Pending))
                    .ToListAsync();

                var availableTimes = new List<TimeSpan>();
                var currentTime = barbershop.OpenTime;

                // بررسی هر 15 دقیقه یک بار
                while (currentTime.Add(TimeSpan.FromMinutes(totalDuration)) <= barbershop.CloseTime)
                {
                    var endTime = currentTime.Add(TimeSpan.FromMinutes(totalDuration));
                    
                    // بررسی تداخل با نوبت‌های موجود
                    bool isAvailable = true;
                    
                    foreach (var appointment in existingAppointments)
                    {
                        var appointmentDuration = appointment.AppointmentServices.Sum(aps => aps.Service.DurationMinutes);
                        var appointmentEndTime = appointment.AppointmentTime.Add(TimeSpan.FromMinutes(appointmentDuration));
                        
                        // بررسی تداخل زمانی
                        if ((currentTime < appointmentEndTime && endTime > appointment.AppointmentTime))
                        {
                            isAvailable = false;
                            break;
                        }
                    }

                    // بررسی اینکه زمان در گذشته نباشد
                    if (date.Date == DateTime.Today && currentTime <= DateTime.Now.TimeOfDay)
                    {
                        isAvailable = false;
                    }

                    if (isAvailable)
                    {
                        availableTimes.Add(currentTime);
                    }

                    currentTime = currentTime.Add(TimeSpan.FromMinutes(15)); // 15-minute intervals
                }

                var timeStrings = availableTimes.Select(t => t.ToString(@"hh\:mm")).ToList();
                return Json(timeStrings);
            }
            catch (Exception)
            {
                return Json(new List<string>());
            }
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
    }
}