using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RazorKing.Data;
using RazorKing.Models;

namespace RazorKing.Controllers
{
    [Authorize(Roles = "BarbershopOwner")]
    public class OwnerController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public OwnerController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> Dashboard()
        {
            var user = await _userManager.GetUserAsync(User);
            var barbershop = await _context.Barbershops
                .Include(b => b.City)
                .Include(b => b.Services)
                .FirstOrDefaultAsync(b => b.OwnerId == user.Id);

            if (barbershop == null)
            {
                return RedirectToAction("CreateBarbershop");
            }

            // آمار کلی
            var today = DateTime.Today;
            var thisMonth = new DateTime(today.Year, today.Month, 1);

            var stats = new
            {
                TodayAppointments = await _context.Appointments
                    .CountAsync(a => a.BarbershopId == barbershop.Id && 
                               a.AppointmentDate.Date == today &&
                               a.Status != AppointmentStatus.Cancelled),
                
                MonthlyAppointments = await _context.Appointments
                    .CountAsync(a => a.BarbershopId == barbershop.Id && 
                               a.AppointmentDate >= thisMonth &&
                               a.Status != AppointmentStatus.Cancelled),
                
                MonthlyRevenue = await _context.Appointments
                    .Where(a => a.BarbershopId == barbershop.Id && 
                           a.AppointmentDate >= thisMonth &&
                           a.Status == AppointmentStatus.Confirmed)
                    .SumAsync(a => a.TotalPrice),
                
                TotalServices = barbershop.Services.Count
            };

            ViewBag.Stats = stats;
            return View(barbershop);
        }

        public async Task<IActionResult> Appointments()
        {
            var user = await _userManager.GetUserAsync(User);
            var barbershop = await _context.Barbershops
                .FirstOrDefaultAsync(b => b.OwnerId == user.Id);

            if (barbershop == null)
            {
                return RedirectToAction("CreateBarbershop");
            }

            var appointments = await _context.Appointments
                .Include(a => a.AppointmentServices)
                .ThenInclude(aps => aps.Service)
                .Where(a => a.BarbershopId == barbershop.Id)
                .OrderByDescending(a => a.AppointmentDate)
                .ThenByDescending(a => a.AppointmentTime)
                .ToListAsync();

            return View(appointments);
        }

        public async Task<IActionResult> Services()
        {
            var user = await _userManager.GetUserAsync(User);
            var barbershop = await _context.Barbershops
                .Include(b => b.Services)
                .FirstOrDefaultAsync(b => b.OwnerId == user.Id);

            if (barbershop == null)
            {
                return RedirectToAction("CreateBarbershop");
            }

            return View(barbershop.Services);
        }

        [HttpGet]
        public async Task<IActionResult> EditBarbershop()
        {
            var user = await _userManager.GetUserAsync(User);
            var barbershop = await _context.Barbershops
                .Include(b => b.City)
                .FirstOrDefaultAsync(b => b.OwnerId == user.Id);

            if (barbershop == null)
            {
                return RedirectToAction("CreateBarbershop");
            }

            ViewBag.Cities = await _context.Cities.ToListAsync();
            return View(barbershop);
        }

        [HttpPost]
        public async Task<IActionResult> EditBarbershop(Barbershop model, IFormFile? imageFile)
        {
            var user = await _userManager.GetUserAsync(User);
            var barbershop = await _context.Barbershops
                .FirstOrDefaultAsync(b => b.OwnerId == user.Id);

            if (barbershop == null)
            {
                return NotFound();
            }

            barbershop.Name = model.Name;
            barbershop.Address = model.Address;
            barbershop.Phone = model.Phone;
            barbershop.Description = model.Description;
            barbershop.CityId = model.CityId;
            barbershop.OpenTime = model.OpenTime;
            barbershop.CloseTime = model.CloseTime;

            // آپلود تصویر
            if (imageFile != null && imageFile.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "barbershops");
                Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{barbershop.Id}_{Guid.NewGuid()}{Path.GetExtension(imageFile.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(stream);
                }

                // حذف تصویر قبلی
                if (!string.IsNullOrEmpty(barbershop.ImagePath))
                {
                    var oldImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", barbershop.ImagePath.TrimStart('/'));
                    if (System.IO.File.Exists(oldImagePath))
                    {
                        System.IO.File.Delete(oldImagePath);
                    }
                }

                barbershop.ImagePath = $"/images/barbershops/{fileName}";
            }

            await _context.SaveChangesAsync();
            TempData["Success"] = "اطلاعات آرایشگاه با موفقیت بروزرسانی شد";
            return RedirectToAction("Dashboard");
        }

        [HttpGet]
        public IActionResult CreateService()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> CreateService(Service model)
        {
            var user = await _userManager.GetUserAsync(User);
            var barbershop = await _context.Barbershops
                .FirstOrDefaultAsync(b => b.OwnerId == user.Id);

            if (barbershop == null)
            {
                return RedirectToAction("CreateBarbershop");
            }

            model.BarbershopId = barbershop.Id;
            _context.Services.Add(model);
            await _context.SaveChangesAsync();

            TempData["Success"] = "خدمت جدید با موفقیت اضافه شد";
            return RedirectToAction("Services");
        }

        [HttpPost]
        public async Task<IActionResult> DeleteService(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            var service = await _context.Services
                .Include(s => s.Barbershop)
                .FirstOrDefaultAsync(s => s.Id == id && s.Barbershop.OwnerId == user.Id);

            if (service != null)
            {
                _context.Services.Remove(service);
                await _context.SaveChangesAsync();
                TempData["Success"] = "خدمت با موفقیت حذف شد";
            }

            return RedirectToAction("Services");
        }

        public IActionResult CreateBarbershop()
        {
            return View();
        }
    }
}