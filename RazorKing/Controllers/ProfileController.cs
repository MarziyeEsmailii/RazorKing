using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RazorKing.Data;
using RazorKing.Models;
using RazorKing.Models.ViewModels;

namespace RazorKing.Controllers
{
    [Authorize]
    public class ProfileController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public ProfileController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return RedirectToAction("Login", "Account");
            }

            // دریافت نوبت‌های کاربر با جزئیات کامل
            var appointments = await _context.Appointments
                .Include(a => a.Barbershop)
                .ThenInclude(b => b.City)
                .Include(a => a.Service)
                .Where(a => a.CustomerEmail.ToLower() == user.Email.ToLower() || 
                           a.CustomerId == user.Id ||
                           a.CustomerEmail.ToLower() == user.UserName.ToLower())
                .OrderByDescending(a => a.AppointmentDate)
                .ThenByDescending(a => a.AppointmentTime)
                .ToListAsync();

            var now = DateTime.Now;
            var upcomingAppointments = appointments
                .Where(a => a.AppointmentDate.Add(a.AppointmentTime) > now && a.Status != AppointmentStatus.Cancelled)
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.AppointmentTime)
                .ToList();

            var pastAppointments = appointments
                .Where(a => a.AppointmentDate.Add(a.AppointmentTime) <= now || a.Status == AppointmentStatus.Cancelled)
                .OrderByDescending(a => a.AppointmentDate)
                .ThenByDescending(a => a.AppointmentTime)
                .ToList();

            var viewModel = new ProfileViewModel
            {
                User = user,
                Appointments = appointments,
                UpcomingAppointments = upcomingAppointments,
                PastAppointments = pastAppointments,
                TotalAppointments = appointments.Count,
                TotalSpent = appointments.Where(a => a.Status == AppointmentStatus.Completed).Sum(a => a.TotalPrice)
            };

            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateProfile([FromBody] ProfileUpdateViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return Json(new { success = false, message = "اطلاعات وارد شده صحیح نیست" });
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Json(new { success = false, message = "کاربر یافت نشد" });
            }

            user.FirstName = model.FirstName;
            user.LastName = model.LastName;
            user.PhoneNumber = model.PhoneNumber;

            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded)
            {
                return Json(new { success = true, message = "پروفایل با موفقیت بروزرسانی شد" });
            }

            return Json(new { success = false, message = "خطا در بروزرسانی پروفایل" });
        }

        [HttpPost]
        public async Task<IActionResult> CancelAppointment(int appointmentId)
        {
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == appointmentId);

            if (appointment == null)
            {
                return Json(new { success = false, message = "نوبت یافت نشد" });
            }

            var user = await _userManager.GetUserAsync(User);
            if (appointment.CustomerEmail.ToLower() != user?.Email.ToLower() && 
                appointment.CustomerId != user?.Id &&
                appointment.CustomerEmail.ToLower() != user?.UserName.ToLower())
            {
                return Json(new { success = false, message = "شما مجاز به لغو این نوبت نیستید" });
            }

            if (appointment.AppointmentDate.Add(appointment.AppointmentTime) <= DateTime.Now.AddHours(2))
            {
                return Json(new { success = false, message = "نوبت‌های کمتر از 2 ساعت آینده قابل لغو نیستند" });
            }

            appointment.Status = AppointmentStatus.Cancelled;
            await _context.SaveChangesAsync();

            return Json(new { success = true, message = "نوبت با موفقیت لغو شد" });
        }

        [HttpGet]
        public async Task<IActionResult> GetMyAppointments()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Json(new { success = false, message = "کاربر وارد نشده است" });
            }

            var appointments = await _context.Appointments
                .Include(a => a.Barbershop)
                .ThenInclude(b => b.City)
                .Include(a => a.Service)
                .Where(a => a.CustomerEmail.ToLower() == user.Email.ToLower() || 
                           a.CustomerId == user.Id ||
                           a.CustomerEmail.ToLower() == user.UserName.ToLower())
                .OrderByDescending(a => a.AppointmentDate)
                .ThenByDescending(a => a.AppointmentTime)
                .Select(a => new
                {
                    id = a.Id,
                    barbershopName = a.Barbershop.Name,
                    serviceName = a.Service != null ? a.Service.Name : "خدمت حذف شده",
                    appointmentDate = a.AppointmentDate.ToString("yyyy/MM/dd"),
                    appointmentTime = a.AppointmentTime.ToString(@"hh\\:mm"),
                    totalPrice = a.TotalPrice,
                    paidAmount = a.PaidAmount,
                    status = a.Status.ToString(),
                    statusText = GetStatusText(a.Status),
                    canCancel = a.AppointmentDate.Add(a.AppointmentTime) > DateTime.Now.AddHours(2) && a.Status != AppointmentStatus.Cancelled,
                    isUpcoming = a.AppointmentDate.Add(a.AppointmentTime) > DateTime.Now && a.Status != AppointmentStatus.Cancelled,
                    cityName = a.Barbershop.City != null ? a.Barbershop.City.Name : "",
                    createdAt = a.CreatedAt.ToString("yyyy/MM/dd HH:mm")
                })
                .ToListAsync();

            return Json(new
            {
                success = true,
                appointments = appointments,
                totalCount = appointments.Count,
                upcomingCount = appointments.Count(a => a.isUpcoming),
                pastCount = appointments.Count(a => !a.isUpcoming)
            });
        }

        [HttpGet]
        public async Task<IActionResult> DebugAppointments()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Json(new { success = false, message = "کاربر وارد نشده است" });
            }

            var allAppointments = await _context.Appointments
                .Include(a => a.Barbershop)
                .Include(a => a.Service)
                .ToListAsync();

            var userAppointments = allAppointments
                .Where(a => a.CustomerEmail.ToLower() == user.Email.ToLower() || 
                           a.CustomerId == user.Id ||
                           a.CustomerEmail.ToLower() == user.UserName.ToLower())
                .ToList();

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
                userAppointments = userAppointments.Count,
                allAppointmentsData = allAppointments.Select(a => new
                {
                    id = a.Id,
                    customerId = a.CustomerId,
                    customerEmail = a.CustomerEmail,
                    customerName = a.CustomerName,
                    appointmentDate = a.AppointmentDate.ToString("yyyy-MM-dd"),
                    status = a.Status.ToString()
                }).Take(20).ToList(),
                userAppointmentsData = userAppointments.Select(a => new
                {
                    id = a.Id,
                    customerId = a.CustomerId,
                    customerEmail = a.CustomerEmail,
                    customerName = a.CustomerName,
                    appointmentDate = a.AppointmentDate.ToString("yyyy-MM-dd"),
                    status = a.Status.ToString(),
                    barbershopName = a.Barbershop?.Name,
                    serviceName = a.Service?.Name
                }).ToList()
            });
        }

        [HttpPost]
        public async Task<IActionResult> RefreshAppointments()
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    return Json(new { success = false, message = "کاربر وارد نشده است" });
                }

                // Force refresh from database
                _context.ChangeTracker.Clear();

                var appointments = await _context.Appointments
                    .Include(a => a.Barbershop)
                    .ThenInclude(b => b.City)
                    .Include(a => a.Service)
                    .Where(a => a.CustomerEmail.ToLower() == user.Email.ToLower() || 
                               a.CustomerId == user.Id ||
                               a.CustomerEmail.ToLower() == user.UserName.ToLower())
                    .OrderByDescending(a => a.AppointmentDate)
                    .ThenByDescending(a => a.AppointmentTime)
                    .ToListAsync();

                var now = DateTime.Now;
                var upcomingAppointments = appointments
                    .Where(a => a.AppointmentDate.Add(a.AppointmentTime) > now && a.Status != AppointmentStatus.Cancelled)
                    .OrderBy(a => a.AppointmentDate)
                    .ThenBy(a => a.AppointmentTime)
                    .ToList();

                var pastAppointments = appointments
                    .Where(a => a.AppointmentDate.Add(a.AppointmentTime) <= now || a.Status == AppointmentStatus.Cancelled)
                    .OrderByDescending(a => a.AppointmentDate)
                    .ThenByDescending(a => a.AppointmentTime)
                    .ToList();

                return Json(new
                {
                    success = true,
                    totalAppointments = appointments.Count,
                    upcomingCount = upcomingAppointments.Count,
                    pastCount = pastAppointments.Count,
                    appointments = appointments.Select(a => new
                    {
                        id = a.Id,
                        barbershopName = a.Barbershop?.Name ?? "نامشخص",
                        serviceName = a.Service?.Name ?? "خدمت حذف شده",
                        appointmentDate = a.AppointmentDate.ToString("yyyy/MM/dd"),
                        appointmentTime = a.AppointmentTime.ToString(@"hh\:mm"),
                        totalPrice = a.TotalPrice,
                        status = a.Status.ToString(),
                        statusText = GetStatusText(a.Status),
                        canCancel = a.AppointmentDate.Add(a.AppointmentTime) > DateTime.Now.AddHours(2) && a.Status != AppointmentStatus.Cancelled,
                        isUpcoming = a.AppointmentDate.Add(a.AppointmentTime) > DateTime.Now && a.Status != AppointmentStatus.Cancelled,
                        cityName = a.Barbershop?.City?.Name ?? "",
                        createdAt = a.CreatedAt.ToString("yyyy/MM/dd HH:mm")
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "خطا در بارگذاری نوبت‌ها: " + ex.Message });
            }
        }

        private string GetStatusText(AppointmentStatus status)
        {
            return status switch
            {
                AppointmentStatus.Pending => "در انتظار تایید",
                AppointmentStatus.Confirmed => "تایید شده",
                AppointmentStatus.Completed => "انجام شده",
                AppointmentStatus.Cancelled => "لغو شده",
                _ => "نامشخص"
            };
        }
    }
}
