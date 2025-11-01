using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RazorKing.Data;
using RazorKing.Models;

namespace RazorKing.Controllers
{
    [Authorize(Roles = "Barber")]
    public class BarberController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public BarberController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> Dashboard()
        {
            var user = await _userManager.GetUserAsync(User);
            
            // آمار روزانه آرایشگر
            var today = DateTime.Today;
            var thisWeek = today.AddDays(-(int)today.DayOfWeek);
            var thisMonth = new DateTime(today.Year, today.Month, 1);

            var stats = new
            {
                TodayAppointments = await _context.Appointments
                    .CountAsync(a => a.BarberId == user.Id && 
                               a.AppointmentDate.Date == today &&
                               a.Status != AppointmentStatus.Cancelled),
                
                WeeklyAppointments = await _context.Appointments
                    .CountAsync(a => a.BarberId == user.Id && 
                               a.AppointmentDate >= thisWeek &&
                               a.Status != AppointmentStatus.Cancelled),
                
                MonthlyRevenue = await _context.Appointments
                    .Where(a => a.BarberId == user.Id && 
                           a.AppointmentDate >= thisMonth &&
                           a.Status == AppointmentStatus.Confirmed)
                    .SumAsync(a => a.TotalPrice),
                
                CompletedAppointments = await _context.Appointments
                    .CountAsync(a => a.BarberId == user.Id && 
                               a.Status == AppointmentStatus.Completed)
            };

            ViewBag.Stats = stats;
            
            // نوبت‌های امروز
            var todayAppointments = await _context.Appointments
                .Include(a => a.AppointmentServices)
                .ThenInclude(aps => aps.Service)
                .Include(a => a.Barbershop)
                .Where(a => a.BarberId == user.Id && 
                           a.AppointmentDate.Date == today)
                .OrderBy(a => a.AppointmentTime)
                .ToListAsync();

            return View(todayAppointments);
        }

        public async Task<IActionResult> Schedule()
        {
            var user = await _userManager.GetUserAsync(User);
            
            var appointments = await _context.Appointments
                .Include(a => a.AppointmentServices)
                .ThenInclude(aps => aps.Service)
                .Include(a => a.Barbershop)
                .Where(a => a.BarberId == user.Id)
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.AppointmentTime)
                .ToListAsync();

            return View(appointments);
        }

        public async Task<IActionResult> WorkingHours()
        {
            var user = await _userManager.GetUserAsync(User);
            
            // اینجا می‌توانید سیستم ساعات کاری آرایشگر را پیاده‌سازی کنید
            // فعلاً لیست آرایشگاه‌هایی که آرایشگر در آن‌ها کار می‌کند را نمایش می‌دهیم
            
            var barbershops = await _context.Barbershops
                .Where(b => b.IsActive)
                .ToListAsync();

            return View(barbershops);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateAppointmentStatus(int appointmentId, AppointmentStatus status)
        {
            var user = await _userManager.GetUserAsync(User);
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == appointmentId && a.BarberId == user.Id);

            if (appointment != null)
            {
                appointment.Status = status;
                
                if (status == AppointmentStatus.Completed)
                {
                    appointment.CompletedAt = DateTime.Now;
                }

                await _context.SaveChangesAsync();
                TempData["Success"] = "وضعیت نوبت بروزرسانی شد";
            }

            return RedirectToAction("Dashboard");
        }

        public async Task<IActionResult> AppointmentDetails(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            var appointment = await _context.Appointments
                .Include(a => a.AppointmentServices)
                .ThenInclude(aps => aps.Service)
                .Include(a => a.Barbershop)
                .FirstOrDefaultAsync(a => a.Id == id && a.BarberId == user.Id);

            if (appointment == null)
            {
                return NotFound();
            }

            return View(appointment);
        }
    }
}