using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RazorKing.Data;
using RazorKing.Models;

namespace RazorKing.Controllers
{
    [Authorize(Roles = "Admin")]
    public class TestController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public TestController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> SeedTestData()
        {
            try
            {
                var seeder = new TestDataSeeder(_context, _userManager);
                await seeder.SeedTestDataAsync();
                
                TempData["Success"] = "داده‌های تستی با موفقیت ایجاد شدند!";
            }
            catch (Exception ex)
            {
                TempData["Error"] = $"خطا در ایجاد داده‌های تستی: {ex.Message}";
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> RunCrudTests()
        {
            try
            {
                var seeder = new TestDataSeeder(_context, _userManager);
                await seeder.TestCrudOperationsAsync();
                
                TempData["Success"] = "تست‌های CRUD با موفقیت انجام شدند!";
            }
            catch (Exception ex)
            {
                TempData["Error"] = $"خطا در اجرای تست‌ها: {ex.Message}";
            }

            return RedirectToAction(nameof(Index));
        }
    }
}
