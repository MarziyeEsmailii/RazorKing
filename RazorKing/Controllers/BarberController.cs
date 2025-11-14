using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RazorKing.Data;
using RazorKing.Models;
using RazorKing.Models.ViewModels;

namespace RazorKing.Controllers
{
    [Authorize(Roles = "Barber")]
    public class BarberController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<BarberController> _logger;

        public BarberController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            ILogger<BarberController> logger)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
        }

        /// <summary>
        /// Main entry point for barbers - redirects to appropriate page based on barbershop status
        /// </summary>
        public async Task<IActionResult> Index()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction("Login", "Account");

            // Check if user has an active barbershop
            var barbershop = await _context.Barbershops
                .FirstOrDefaultAsync(b => b.UserId == user.Id && b.IsActive);

            if (barbershop == null)
            {
                // No active barbershop - redirect to create barbershop form
                TempData["InfoMessage"] = "برای شروع کار، ابتدا اطلاعات آرایشگاه خود را ثبت کنید";
                return RedirectToAction("CreateBarbershop");
            }

            // Has active barbershop - redirect to dashboard
            return RedirectToAction("Dashboard");
        }

        public async Task<IActionResult> Dashboard()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction("Login", "Account");

            // Find barber's active barbershop
            var barbershop = await _context.Barbershops
                .Include(b => b.City)
                .Include(b => b.Services)
                .Include(b => b.Appointments.Where(a => a.AppointmentDate >= DateTime.Today))
                .ThenInclude(a => a.Service)
                .FirstOrDefaultAsync(b => b.UserId == user.Id && b.IsActive);

            if (barbershop == null)
            {
                TempData["InfoMessage"] = "برای دسترسی به پنل مدیریت، ابتدا آرایشگاه خود را ثبت کنید";
                return RedirectToAction("CreateBarbershop");
            }

            var viewModel = new BarberDashboardViewModel
            {
                Barbershop = barbershop,
                TodayAppointments = barbershop.Appointments
                    .Where(a => a.AppointmentDate.Date == DateTime.Today)
                    .OrderBy(a => a.AppointmentTime)
                    .ToList(),
                UpcomingAppointments = barbershop.Appointments
                    .Where(a => a.AppointmentDate > DateTime.Today)
                    .OrderBy(a => a.AppointmentDate)
                    .ThenBy(a => a.AppointmentTime)
                    .Take(10)
                    .ToList(),
                MonthlyStats = new BarberStatsViewModel
                {
                    TotalAppointments = barbershop.Appointments.Count(a => a.AppointmentDate.Month == DateTime.Now.Month),
                    CompletedAppointments = barbershop.Appointments.Count(a => a.Status == AppointmentStatus.Completed && a.AppointmentDate.Month == DateTime.Now.Month),
                    TotalRevenue = barbershop.Appointments
                        .Where(a => a.Status == AppointmentStatus.Completed && a.AppointmentDate.Month == DateTime.Now.Month)
                        .Sum(a => a.Service?.Price ?? 0)
                }
            };

            return View(viewModel);
        }

        [HttpGet]
        public async Task<IActionResult> CreateBarbershop()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction("Login", "Account");

            // Check if user already has an active barbershop
            var existingBarbershop = await _context.Barbershops
                .FirstOrDefaultAsync(b => b.UserId == user.Id && b.IsActive);

            if (existingBarbershop != null)
            {
                TempData["InfoMessage"] = "شما قبلاً آرایشگاه فعالی ثبت کرده‌اید";
                return RedirectToAction("Dashboard");
            }

            var viewModel = new CreateBarbershopViewModel
            {
                Cities = await _context.Cities.OrderBy(c => c.Name).ToListAsync(),
                // Set default values
                OpenTime = TimeSpan.FromHours(9),
                CloseTime = TimeSpan.FromHours(21),
                WorkingDays = "شنبه,یکشنبه,دوشنبه,سه‌شنبه,چهارشنبه,پنج‌شنبه"
            };

            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateBarbershop(CreateBarbershopViewModel model, IFormFile? imageFile)
        {
            // Process working days array
            if (model.WorkingDaysArray != null && model.WorkingDaysArray.Any())
            {
                model.WorkingDays = string.Join(",", model.WorkingDaysArray);
            }
            
            if (!ModelState.IsValid)
            {
                model.Cities = await _context.Cities.OrderBy(c => c.Name).ToListAsync();
                return View(model);
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction("Login", "Account");

            // Check if user already has an active barbershop
            var existingBarbershop = await _context.Barbershops
                .FirstOrDefaultAsync(b => b.UserId == user.Id && b.IsActive);

            if (existingBarbershop != null)
            {
                TempData["InfoMessage"] = "شما قبلاً آرایشگاه فعالی ثبت کرده‌اید";
                return RedirectToAction("Dashboard");
            }

            var barbershop = new Barbershop
            {
                Name = model.Name,
                Description = model.Description,
                Address = model.Address,
                Phone = model.Phone,
                CityId = model.CityId,
                OpenTime = model.OpenTime,
                CloseTime = model.CloseTime,
                WorkingDays = model.WorkingDays,
                IsActive = true,
                UserId = user.Id,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            // Handle image upload
            if (imageFile != null && imageFile.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "barbershops");
                Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = Guid.NewGuid().ToString() + "_" + imageFile.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(fileStream);
                }

                barbershop.ImageUrl = "/uploads/barbershops/" + uniqueFileName;
            }

            try
            {
                _context.Barbershops.Add(barbershop);
                await _context.SaveChangesAsync();
                TempData["SuccessMessage"] = "🎉 تبریک! آرایشگاه شما با موفقیت ایجاد شد. اکنون می‌توانید از پنل مدیریت استفاده کنید";
                return RedirectToAction("Dashboard");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating barbershop for user {UserId}", user.Id);
                ModelState.AddModelError("", "خطا در ایجاد آرایشگاه");
                model.Cities = await _context.Cities.OrderBy(c => c.Name).ToListAsync();
                return View(model);
            }
        }

        [HttpGet]
        public async Task<IActionResult> EditBarbershop()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction("Login", "Account");

            var barbershop = await _context.Barbershops
                .Include(b => b.City)
                .Include(b => b.Services)
                .FirstOrDefaultAsync(b => b.UserId == user.Id && b.IsActive);

            if (barbershop == null)
            {
                TempData["InfoMessage"] = "برای ویرایش آرایشگاه، ابتدا آرایشگاه خود را ثبت کنید";
                return RedirectToAction("CreateBarbershop");
            }

            var viewModel = new EditBarbershopViewModel
            {
                Id = barbershop.Id,
                Name = barbershop.Name,
                Description = barbershop.Description,
                Address = barbershop.Address,
                Phone = barbershop.Phone,
                CityId = barbershop.CityId,
                OpenTime = barbershop.OpenTime,
                CloseTime = barbershop.CloseTime,
                WorkingDays = barbershop.WorkingDays,
                IsActive = barbershop.IsActive,
                Cities = await _context.Cities.OrderBy(c => c.Name).ToListAsync(),
                Services = barbershop.Services.ToList()
            };

            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> EditBarbershop(EditBarbershopViewModel model, IFormFile? imageFile)
        {
            // Process working days array
            if (model.WorkingDaysArray != null && model.WorkingDaysArray.Any())
            {
                model.WorkingDays = string.Join(",", model.WorkingDaysArray);
            }
            
            if (!ModelState.IsValid)
            {
                model.Cities = await _context.Cities.OrderBy(c => c.Name).ToListAsync();
                return View(model);
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction("Login", "Account");

            var barbershop = await _context.Barbershops
                .FirstOrDefaultAsync(b => b.Id == model.Id && b.UserId == user.Id);

            if (barbershop == null)
            {
                return NotFound();
            }

            // Update barbershop info
            barbershop.Name = model.Name;
            barbershop.Description = model.Description;
            barbershop.Address = model.Address;
            barbershop.Phone = model.Phone;
            barbershop.CityId = model.CityId;
            barbershop.OpenTime = model.OpenTime;
            barbershop.CloseTime = model.CloseTime;
            barbershop.WorkingDays = model.WorkingDays;
            barbershop.IsActive = model.IsActive;
            barbershop.UpdatedAt = DateTime.Now;

            // Handle image upload
            if (imageFile != null && imageFile.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "barbershops");
                Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = Guid.NewGuid().ToString() + "_" + imageFile.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(fileStream);
                }

                barbershop.ImageUrl = "/uploads/barbershops/" + uniqueFileName;
            }

            try
            {
                await _context.SaveChangesAsync();
                TempData["SuccessMessage"] = "اطلاعات آرایشگاه با موفقیت به‌روزرسانی شد";
                return RedirectToAction("Dashboard");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating barbershop {BarbershopId}", model.Id);
                ModelState.AddModelError("", "خطا در به‌روزرسانی اطلاعات");
                model.Cities = await _context.Cities.OrderBy(c => c.Name).ToListAsync();
                return View(model);
            }
        }

        [HttpGet]
        public async Task<IActionResult> ManageServices()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction("Login", "Account");

            var barbershop = await _context.Barbershops
                .Include(b => b.Services)
                .FirstOrDefaultAsync(b => b.UserId == user.Id && b.IsActive);

            if (barbershop == null)
            {
                TempData["InfoMessage"] = "برای مدیریت خدمات، ابتدا آرایشگاه خود را ثبت کنید";
                return RedirectToAction("CreateBarbershop");
            }

            return View(barbershop.Services.OrderBy(s => s.Name).ToList());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AddService([FromBody] AddServiceViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return Json(new { success = false, message = "اطلاعات وارد شده صحیح نیست" });
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Json(new { success = false, message = "کاربر یافت نشد" });

            var barbershop = await _context.Barbershops
                .FirstOrDefaultAsync(b => b.UserId == user.Id);

            if (barbershop == null)
            {
                return Json(new { success = false, message = "آرایشگاه یافت نشد" });
            }

            var service = new Service
            {
                Name = model.Name,
                Description = model.Description,
                Price = model.Price,
                Duration = model.Duration,
                BarbershopId = barbershop.Id,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return Json(new { success = true, message = "خدمت جدید با موفقیت اضافه شد" });
        }

        [HttpGet]
        public async Task<IActionResult> ManageSchedule()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction("Login", "Account");

            var barbershop = await _context.Barbershops
                .Include(b => b.Appointments.Where(a => a.AppointmentDate >= DateTime.Today))
                .ThenInclude(a => a.Service)
                .FirstOrDefaultAsync(b => b.UserId == user.Id);

            if (barbershop == null)
            {
                return RedirectToAction("CreateBarbershop");
            }

            var viewModel = new BarberScheduleViewModel
            {
                Barbershop = barbershop,
                WorkingDays = barbershop.WorkingDays,
                OpenTime = barbershop.OpenTime,
                CloseTime = barbershop.CloseTime,
                Appointments = barbershop.Appointments
                    .Where(a => a.AppointmentDate >= DateTime.Today && a.AppointmentDate <= DateTime.Today.AddDays(30))
                    .OrderBy(a => a.AppointmentDate)
                    .ThenBy(a => a.AppointmentTime)
                    .ToList()
            };

            return View(viewModel);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateSchedule([FromBody] UpdateScheduleViewModel model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Json(new { success = false, message = "کاربر یافت نشد" });

            var barbershop = await _context.Barbershops
                .FirstOrDefaultAsync(b => b.UserId == user.Id);

            if (barbershop == null)
            {
                return Json(new { success = false, message = "آرایشگاه یافت نشد" });
            }

            barbershop.WorkingDays = model.WorkingDays;
            barbershop.OpenTime = model.OpenTime;
            barbershop.CloseTime = model.CloseTime;
            barbershop.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Json(new { success = true, message = "برنامه کاری با موفقیت به‌روزرسانی شد" });
        }

        [HttpPost]
        public async Task<IActionResult> DeleteService(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Json(new { success = false, message = "کاربر یافت نشد" });

            var service = await _context.Services
                .Include(s => s.Barbershop)
                .FirstOrDefaultAsync(s => s.Id == id && s.Barbershop.UserId == user.Id);

            if (service == null)
            {
                return Json(new { success = false, message = "خدمت یافت نشد" });
            }

            // Check if service has appointments
            var hasAppointments = await _context.Appointments
                .AnyAsync(a => a.ServiceId == id && a.AppointmentDate >= DateTime.Today);

            if (hasAppointments)
            {
                return Json(new { success = false, message = "این خدمت دارای نوبت‌های آینده است و قابل حذف نیست" });
            }

            _context.Services.Remove(service);
            await _context.SaveChangesAsync();

            return Json(new { success = true, message = "خدمت با موفقیت حذف شد" });
        }

        [HttpPost]
        public async Task<IActionResult> UpdateService([FromBody] EditServiceViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return Json(new { success = false, message = "اطلاعات وارد شده صحیح نیست" });
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Json(new { success = false, message = "کاربر یافت نشد" });

            var service = await _context.Services
                .Include(s => s.Barbershop)
                .FirstOrDefaultAsync(s => s.Id == model.Id && s.Barbershop.UserId == user.Id);

            if (service == null)
            {
                return Json(new { success = false, message = "خدمت یافت نشد" });
            }

            service.Name = model.Name;
            service.Description = model.Description;
            service.Price = model.Price;
            service.Duration = model.Duration;
            service.IsActive = model.IsActive;

            await _context.SaveChangesAsync();

            return Json(new { success = true, message = "خدمت با موفقیت به‌روزرسانی شد" });
        }

        [HttpPost]
        public async Task<IActionResult> ChangeAppointmentStatus([FromBody] ChangeAppointmentStatusViewModel model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Json(new { success = false, message = "کاربر یافت نشد" });

            var appointment = await _context.Appointments
                .Include(a => a.Service)
                .ThenInclude(s => s.Barbershop)
                .FirstOrDefaultAsync(a => a.Id == model.AppointmentId && a.Service.Barbershop.UserId == user.Id);

            if (appointment == null)
            {
                return Json(new { success = false, message = "نوبت یافت نشد" });
            }

            appointment.Status = model.Status;
            await _context.SaveChangesAsync();

            return Json(new { success = true, message = "وضعیت نوبت با موفقیت تغییر کرد" });
        }

        [HttpGet]
        public async Task<IActionResult> GetTodayAppointments()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Json(new { success = false, message = "کاربر یافت نشد" });

            var appointments = await _context.Appointments
                .Include(a => a.Service)
                .ThenInclude(s => s.Barbershop)
                .Where(a => a.Service.Barbershop.UserId == user.Id && a.AppointmentDate.Date == DateTime.Today)
                .OrderBy(a => a.AppointmentTime)
                .Select(a => new
                {
                    id = a.Id,
                    customerName = a.CustomerName,
                    customerPhone = a.CustomerPhone,
                    serviceName = a.Service.Name,
                    servicePrice = a.Service.Price,
                    appointmentTime = a.AppointmentTime.ToString(@"hh\\:mm"),
                    status = a.Status.ToString()
                })
                .ToListAsync();

            return Json(appointments);
        }

        [HttpGet]
        public async Task<IActionResult> ManageAppointments()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction("Login", "Account");

            var barbershop = await _context.Barbershops
                .Include(b => b.Appointments.Where(a => a.AppointmentDate >= DateTime.Today))
                .ThenInclude(a => a.Service)
                .FirstOrDefaultAsync(b => b.UserId == user.Id);

            if (barbershop == null)
            {
                return RedirectToAction("CreateBarbershop");
            }

            var viewModel = new BarberScheduleViewModel
            {
                Barbershop = barbershop,
                WorkingDays = barbershop.WorkingDays,
                OpenTime = barbershop.OpenTime,
                CloseTime = barbershop.CloseTime,
                Appointments = barbershop.Appointments
                    .Where(a => a.AppointmentDate >= DateTime.Today && a.AppointmentDate <= DateTime.Today.AddDays(30))
                    .OrderBy(a => a.AppointmentDate)
                    .ThenBy(a => a.AppointmentTime)
                    .ToList()
            };

            return View(viewModel);
        }

        [HttpPost]
        public async Task<IActionResult> BlockTime([FromBody] Models.ViewModels.BlockTimeViewModel model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Json(new { success = false, message = "کاربر یافت نشد" });

            var barbershop = await _context.Barbershops
                .FirstOrDefaultAsync(b => b.UserId == user.Id);

            if (barbershop == null)
            {
                return Json(new { success = false, message = "آرایشگاه یافت نشد" });
            }

            try
            {
                // Parse times
                var startTime = TimeSpan.Parse(model.StartTime);
                var endTime = TimeSpan.Parse(model.EndTime);
                
                // Create blocked time slots (15-minute intervals)
                var currentTime = startTime;
                var blockedSlots = new List<BlockedTimeSlot>();
                
                while (currentTime < endTime)
                {
                    var blockedSlot = new BlockedTimeSlot
                    {
                        BarbershopId = barbershop.Id,
                        Date = model.Date.Date,
                        Time = currentTime,
                        Reason = model.Reason,
                        CreatedAt = DateTime.Now
                    };
                    
                    blockedSlots.Add(blockedSlot);
                    currentTime = currentTime.Add(TimeSpan.FromMinutes(15));
                }

                _context.BlockedTimeSlots.AddRange(blockedSlots);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "زمان با موفقیت مسدود شد" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error blocking time for barbershop {BarbershopId}", barbershop.Id);
                return Json(new { success = false, message = "خطا در مسدود کردن زمان" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetWeeklyAppointments(DateTime weekStart)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Json(new { success = false, message = "کاربر یافت نشد" });

            var weekEnd = weekStart.AddDays(7);
            
            var appointments = await _context.Appointments
                .Include(a => a.Service)
                .ThenInclude(s => s.Barbershop)
                .Where(a => a.Service.Barbershop.UserId == user.Id && 
                           a.AppointmentDate >= weekStart && 
                           a.AppointmentDate < weekEnd)
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.AppointmentTime)
                .Select(a => new
                {
                    id = a.Id,
                    date = a.AppointmentDate.ToString("yyyy-MM-dd"),
                    time = a.AppointmentTime.ToString(@"hh\\:mm"),
                    customerName = a.CustomerName,
                    customerPhone = a.CustomerPhone,
                    serviceName = a.Service.Name,
                    servicePrice = a.Service.Price,
                    status = a.Status.ToString()
                })
                .ToListAsync();

            return Json(appointments);
        }

        [HttpGet]
        public async Task<IActionResult> GetAvailableSlots(DateTime date)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Json(new { success = false, message = "کاربر یافت نشد" });

            var barbershop = await _context.Barbershops
                .FirstOrDefaultAsync(b => b.UserId == user.Id);

            if (barbershop == null)
            {
                return Json(new { success = false, message = "آرایشگاه یافت نشد" });
            }

            // Check if it's a working day
            var dayName = GetPersianDayName(date.DayOfWeek);
            var workingDays = barbershop.WorkingDays?.Split(',').Select(d => d.Trim()).ToList() ?? new List<string>();
            
            if (!workingDays.Contains(dayName))
            {
                return Json(new { success = false, message = "این روز جزو روزهای کاری نیست" });
            }

            // Get existing appointments
            var existingAppointments = await _context.Appointments
                .Where(a => a.BarbershopId == barbershop.Id && a.AppointmentDate.Date == date.Date)
                .Select(a => a.AppointmentTime)
                .ToListAsync();

            // Get blocked time slots
            var blockedSlots = await _context.BlockedTimeSlots
                .Where(b => b.BarbershopId == barbershop.Id && b.Date.Date == date.Date)
                .Select(b => b.Time)
                .ToListAsync();

            // Generate available slots
            var availableSlots = new List<string>();
            var currentTime = barbershop.OpenTime;
            
            while (currentTime < barbershop.CloseTime)
            {
                if (!existingAppointments.Contains(currentTime) && !blockedSlots.Contains(currentTime))
                {
                    availableSlots.Add(currentTime.ToString(@"hh\\:mm"));
                }
                currentTime = currentTime.Add(TimeSpan.FromMinutes(15));
            }

            return Json(new { success = true, slots = availableSlots });
        }

        [HttpPost]
        public async Task<IActionResult> GenerateTimeSlots([FromBody] GenerateTimeSlotsViewModel model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Json(new { success = false, message = "کاربر یافت نشد" });

            var barbershop = await _context.Barbershops
                .FirstOrDefaultAsync(b => b.UserId == user.Id);

            if (barbershop == null)
            {
                return Json(new { success = false, message = "آرایشگاه یافت نشد" });
            }

            try
            {
                var startDate = model.StartDate.Date;
                var endDate = model.EndDate.Date;
                var slotDuration = model.SlotDuration; // in minutes
                var breakDuration = model.BreakDuration; // in minutes

                var workingDays = barbershop.WorkingDays?.Split(',').Select(d => d.Trim()).ToList() ?? new List<string>();

                for (var date = startDate; date <= endDate; date = date.AddDays(1))
                {
                    var dayName = GetPersianDayName(date.DayOfWeek);
                    if (!workingDays.Contains(dayName)) continue;

                    // Remove existing time slots for this date
                    var existingSlots = await _context.Time
                        .Where(ts => ts.BarbershopId == barbershop.Id && ts.Date.Date == date.Date)
                        .ToListAsync();
                    
                    _context.Time.RemoveRange(existingSlots);

                    // Generate new time slots
                    var currentTime = barbershop.OpenTime;
                    while (currentTime.Add(TimeSpan.FromMinutes(slotDuration)) <= barbershop.CloseTime)
                    {
                        var timeSlot = new TimeSlot
                        {
                            BarbershopId = barbershop.Id,
                            Date = date,
                            StartTime = currentTime,
                            EndTime = currentTime.Add(TimeSpan.FromMinutes(slotDuration)),
                            IsAvailable = true,
                            SlotType = TimeSlotType.Available
                        };

                        _context.Time.Add(timeSlot);
                        currentTime = currentTime.Add(TimeSpan.FromMinutes(slotDuration + breakDuration));
                    }
                }

                await _context.SaveChangesAsync();
                return Json(new { success = true, message = "بازه‌های زمانی با موفقیت ایجاد شد" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating time slots for barbershop {BarbershopId}", barbershop.Id);
                return Json(new { success = false, message = "خطا در ایجاد بازه‌های زمانی" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetDayTimeSlots(DateTime date)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Json(new { success = false, message = "کاربر یافت نشد" });

            var barbershop = await _context.Barbershops
                .FirstOrDefaultAsync(b => b.UserId == user.Id);

            if (barbershop == null)
            {
                return Json(new { success = false, message = "آرایشگاه یافت نشد" });
            }

            var timeSlots = await _context.Time
                .Where(ts => ts.BarbershopId == barbershop.Id && ts.Date.Date == date.Date)
                .OrderBy(ts => ts.StartTime)
                .Select(ts => new
                {
                    id = ts.Id,
                    startTime = ts.StartTime.ToString(@"hh\\:mm"),
                    endTime = ts.EndTime.ToString(@"hh\\:mm"),
                    isAvailable = ts.IsAvailable,
                    isBlocked = ts.IsBlocked,
                    slotType = ts.SlotType.ToString(),
                    blockReason = ts.BlockReason
                })
                .ToListAsync();

            // Get appointments for this date
            var appointments = await _context.Appointments
                .Include(a => a.Service)
                .Where(a => a.BarbershopId == barbershop.Id && a.AppointmentDate.Date == date.Date)
                .Select(a => new
                {
                    id = a.Id,
                    time = a.AppointmentTime.ToString(@"hh\\:mm"),
                    customerName = a.CustomerName,
                    serviceName = a.Service.Name,
                    status = a.Status.ToString()
                })
                .ToListAsync();

            return Json(new { 
                success = true, 
                timeSlots = timeSlots,
                appointments = appointments
            });
        }

        [HttpPost]
        public async Task<IActionResult> UpdateTimeSlotAvailability([FromBody] UpdateTimeSlotViewModel model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Json(new { success = false, message = "کاربر یافت نشد" });

            var timeSlot = await _context.Time
                .Include(ts => ts.Barbershop)
                .FirstOrDefaultAsync(ts => ts.Id == model.TimeSlotId && ts.Barbershop.UserId == user.Id);

            if (timeSlot == null)
            {
                return Json(new { success = false, message = "بازه زمانی یافت نشد" });
            }

            timeSlot.IsAvailable = model.IsAvailable;
            timeSlot.IsBlocked = model.IsBlocked;
            timeSlot.BlockReason = model.BlockReason;
            timeSlot.SlotType = model.SlotType;

            await _context.SaveChangesAsync();

            return Json(new { success = true, message = "وضعیت بازه زمانی به‌روزرسانی شد" });
        }

        [HttpGet]
        public async Task<IActionResult> ManageTimeSlots(DateTime? date)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction("Login", "Account");

            var barbershop = await _context.Barbershops
                .FirstOrDefaultAsync(b => b.UserId == user.Id);

            if (barbershop == null)
            {
                return RedirectToAction("CreateBarbershop");
            }

            var selectedDate = date ?? DateTime.Today;

            var timeSlots = await _context.Time
                .Where(ts => ts.BarbershopId == barbershop.Id && ts.Date.Date == selectedDate.Date)
                .OrderBy(ts => ts.StartTime)
                .Select(ts => new TimeSlotViewModel
                {
                    Id = ts.Id,
                    StartTime = ts.StartTime,
                    EndTime = ts.EndTime,
                    IsAvailable = ts.IsAvailable,
                    IsBlocked = ts.IsBlocked,
                    BlockReason = ts.BlockReason,
                    SlotType = ts.SlotType,
                    Appointment = ts.Appointment
                })
                .ToListAsync();

            var dayAppointments = await _context.Appointments
                .Include(a => a.Service)
                .Where(a => a.BarbershopId == barbershop.Id && a.AppointmentDate.Date == selectedDate.Date)
                .OrderBy(a => a.AppointmentTime)
                .ToListAsync();

            var viewModel = new TimeSlotManagementViewModel
            {
                Barbershop = barbershop,
                SelectedDate = selectedDate,
                TimeSlots = timeSlots,
                DayAppointments = dayAppointments,
                Settings = new TimeSlotSettingsViewModel()
            };

            return View(viewModel);
        }

        [HttpPost]
        public async Task<IActionResult> AddTimeSlot([FromBody] AddTimeSlotViewModel model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Json(new { success = false, message = "کاربر یافت نشد" });

            var barbershop = await _context.Barbershops
                .FirstOrDefaultAsync(b => b.UserId == user.Id);

            if (barbershop == null)
            {
                return Json(new { success = false, message = "آرایشگاه یافت نشد" });
            }

            try
            {
                var startTime = TimeSpan.Parse(model.StartTime);
                var endTime = TimeSpan.Parse(model.EndTime);

                // Check for overlapping time slots
                var overlapping = await _context.Time
                    .AnyAsync(ts => ts.BarbershopId == barbershop.Id && 
                                   ts.Date.Date == model.Date.Date &&
                                   ((ts.StartTime < endTime && ts.EndTime > startTime)));

                if (overlapping)
                {
                    return Json(new { success = false, message = "این بازه زمانی با بازه‌های موجود تداخل دارد" });
                }

                var timeSlot = new TimeSlot
                {
                    BarbershopId = barbershop.Id,
                    Date = model.Date.Date,
                    StartTime = startTime,
                    EndTime = endTime,
                    IsAvailable = model.IsAvailable,
                    IsBlocked = model.SlotType == TimeSlotType.Blocked,
                    SlotType = model.SlotType,
                    BlockReason = model.BlockReason
                };

                _context.Time.Add(timeSlot);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "بازه زمانی با موفقیت اضافه شد" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding time slot for barbershop {BarbershopId}", barbershop.Id);
                return Json(new { success = false, message = "خطا در افزودن بازه زمانی" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> UpdateTimeSlot([FromBody] UpdateTimeSlotRequestViewModel model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Json(new { success = false, message = "کاربر یافت نشد" });

            var timeSlot = await _context.Time
                .Include(ts => ts.Barbershop)
                .FirstOrDefaultAsync(ts => ts.Id == model.Id && ts.Barbershop.UserId == user.Id);

            if (timeSlot == null)
            {
                return Json(new { success = false, message = "بازه زمانی یافت نشد" });
            }

            try
            {
                var startTime = TimeSpan.Parse(model.StartTime);
                var endTime = TimeSpan.Parse(model.EndTime);

                // Check for overlapping time slots (excluding current slot)
                var overlapping = await _context.Time
                    .AnyAsync(ts => ts.BarbershopId == timeSlot.BarbershopId && 
                                   ts.Id != model.Id &&
                                   ts.Date.Date == model.Date.Date &&
                                   ((ts.StartTime < endTime && ts.EndTime > startTime)));

                if (overlapping)
                {
                    return Json(new { success = false, message = "این بازه زمانی با بازه‌های موجود تداخل دارد" });
                }

                timeSlot.StartTime = startTime;
                timeSlot.EndTime = endTime;
                timeSlot.IsAvailable = model.IsAvailable;
                timeSlot.IsBlocked = model.SlotType == TimeSlotType.Blocked;
                timeSlot.SlotType = model.SlotType;
                timeSlot.BlockReason = model.BlockReason;

                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "بازه زمانی با موفقیت به‌روزرسانی شد" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating time slot {TimeSlotId}", model.Id);
                return Json(new { success = false, message = "خطا در به‌روزرسانی بازه زمانی" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> DeleteTimeSlot(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Json(new { success = false, message = "کاربر یافت نشد" });

            var timeSlot = await _context.Time
                .Include(ts => ts.Barbershop)
                .Include(ts => ts.Appointment)
                .FirstOrDefaultAsync(ts => ts.Id == id && ts.Barbershop.UserId == user.Id);

            if (timeSlot == null)
            {
                return Json(new { success = false, message = "بازه زمانی یافت نشد" });
            }

            // Check if time slot has an appointment
            if (timeSlot.Appointment != null)
            {
                return Json(new { success = false, message = "این بازه زمانی دارای نوبت است و قابل حذف نیست" });
            }

            try
            {
                _context.Time.Remove(timeSlot);        
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "بازه زمانی با موفقیت حذف شد" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting time slot {TimeSlotId}", id);
                return Json(new { success = false, message = "خطا در حذف بازه زمانی" });
            }
        }

        /// <summary>
        /// Helper method to get the current user's active barbershop
        /// </summary>
        private async Task<Barbershop?> GetUserActiveBarbershopAsync()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return null;

            return await _context.Barbershops
                .FirstOrDefaultAsync(b => b.UserId == user.Id && b.IsActive);
        }

        /// <summary>
        /// Helper method to check if user has active barbershop and redirect if not
        /// </summary>
        private async Task<IActionResult?> CheckBarbershopAccessAsync(string actionMessage = "برای انجام این عمل، ابتدا آرایشگاه خود را ثبت کنید")
        {
            var barbershop = await GetUserActiveBarbershopAsync();
            if (barbershop == null)
            {
                TempData["InfoMessage"] = actionMessage;
                return RedirectToAction("CreateBarbershop");
            }
            return null;
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
}
