using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RazorKing.Data;

namespace RazorKing.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AdminTestController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AdminTestController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            try
            {
                var stats = new
                {
                    UsersCount = _context.Users.Count(),
                    CitiesCount = _context.Cities.Count(),
                    BarbershopsCount = _context.Barbershops.Count(),
                    ServicesCount = _context.Services.Count(),
                    AppointmentsCount = _context.Appointments.Count()
                };

                ViewBag.Stats = stats;
                ViewBag.Message = "پنل ادمین به درستی کار می‌کند!";
                return View();
            }
            catch (Exception ex)
            {
                ViewBag.Error = $"خطا: {ex.Message}";
                return View();
            }
        }
    }
}
