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

            // دریافت نوبت‌های کاربر
            var appointments = await _context.Appointments
                .Include(a => a.Barbershop)
                .ThenInclude(b => b.City)
                .Include(a => a.Service)
                .Where(a => a.CustomerEmail == user.Email || a.CustomerId == user.Id)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();

            var viewModel = new ProfileViewModel
            {
                User = user,
                Appointments = appointments,
                UpcomingAppointments = appointments.Where(a => a.AppointmentDate.Add(a.AppointmentTime) > DateTime.Now).ToList(),
                PastAppointments = appointments.Where(a => a.AppointmentDate.Add(a.AppointmentTime) <= DateTime.Now).ToList(),
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
            if (appointment.CustomerEmail != user?.Email && appointment.CustomerId != user?.Id)
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
    }
}