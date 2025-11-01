using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RazorKing.Data;
using RazorKing.Models;
using RazorKing.Models.ViewModels;

namespace RazorKing.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _context;

        public HomeController(ILogger<HomeController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var viewModel = new HomeViewModel
            {
                Cities = await _context.Cities.OrderBy(c => c.Name).ToListAsync(),
                TotalBarbershops = await _context.Barbershops.CountAsync(),
                TotalAppointments = await _context.Appointments.CountAsync(),
                TotalCustomers = await _context.Appointments.Select(a => a.CustomerPhone).Distinct().CountAsync(),
                FeaturedBarbershops = await _context.Barbershops
                    .Include(b => b.City)
                    .Include(b => b.Services)
                    .Where(b => b.IsActive)
                    .OrderByDescending(b => b.CreatedAt)
                    .Take(6)
                    .ToListAsync(),
                PopularServices = await _context.Services
                    .Include(s => s.Barbershop)
                    .GroupBy(s => s.Name)
                    .Select(g => new ServiceSummary
                    {
                        Name = g.Key,
                        Count = g.Count(),
                        AveragePrice = g.Average(s => s.Price),
                        MinPrice = g.Min(s => s.Price),
                        MaxPrice = g.Max(s => s.Price)
                    })
                    .OrderByDescending(s => s.Count)
                    .Take(4)
                    .ToListAsync(),
                RecentAppointments = await _context.Appointments
                    .Include(a => a.Barbershop)
                    .ThenInclude(b => b.City)
                    .Where(a => a.Status == AppointmentStatus.Confirmed)
                    .OrderByDescending(a => a.CreatedAt)
                    .Take(5)
                    .ToListAsync()
            };

            return View(viewModel);
        }

        [HttpGet]
        public async Task<IActionResult> GetCityStats()
        {
            var cityStats = await _context.Cities
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    BarbershopCount = c.Barbershops.Count(b => b.IsActive),
                    AppointmentCount = c.Barbershops.SelectMany(b => b.Appointments).Count(),
                    ServiceCount = c.Barbershops.SelectMany(b => b.Services).Count()
                })
                .ToListAsync();

            return Json(cityStats);
        }

        [HttpGet]
        public async Task<IActionResult> SearchBarbershops(string query, int? cityId)
        {
            var barbershopsQuery = _context.Barbershops
                .Include(b => b.City)
                .Include(b => b.Services)
                .Where(b => b.IsActive);

            if (!string.IsNullOrEmpty(query))
            {
                barbershopsQuery = barbershopsQuery.Where(b => 
                    b.Name.Contains(query) || 
                    b.Description.Contains(query) ||
                    b.Address.Contains(query));
            }

            if (cityId.HasValue)
            {
                barbershopsQuery = barbershopsQuery.Where(b => b.CityId == cityId.Value);
            }

            var barbershops = await barbershopsQuery
                .OrderBy(b => b.Name)
                .Take(10)
                .Select(b => new
                {
                    b.Id,
                    b.Name,
                    b.Address,
                    b.Phone,
                    b.Description,
                    City = b.City.Name,
                    ServiceCount = b.Services.Count,
                    MinPrice = b.Services.Any() ? b.Services.Min(s => s.Price) : 0,
                    MaxPrice = b.Services.Any() ? b.Services.Max(s => s.Price) : 0
                })
                .ToListAsync();

            return Json(barbershops);
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
