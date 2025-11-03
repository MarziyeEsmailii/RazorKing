using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using RazorKing.Data;
using RazorKing.Models;
using RazorKing.Models.ViewModels;

namespace RazorKing.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public HomeController(ILogger<HomeController> logger, ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _logger = logger;
            _context = context;
            _userManager = userManager;
        }

        [ResponseCache(Duration = 300, VaryByHeader = "User-Agent", Location = ResponseCacheLocation.Any)]
        public async Task<IActionResult> Index()
        {
            try
            {
                Console.WriteLine("🏠 Loading Home Index...");
                
                var cities = await _context.Cities
                    .Include(c => c.Barbershops.Where(b => b.IsActive))
                    .OrderBy(c => c.Name)
                    .ToListAsync();
                
                Console.WriteLine($"📊 Cities loaded: {cities.Count}");
                
                var totalBarbershops = await _context.Barbershops.CountAsync(b => b.IsActive);
                var totalAppointments = await _context.Appointments.CountAsync();
                var totalCustomers = await _context.Appointments
                    .Select(a => a.CustomerPhone)
                    .Distinct()
                    .CountAsync();
                
                Console.WriteLine($"📊 Stats - Barbershops: {totalBarbershops}, Appointments: {totalAppointments}, Customers: {totalCustomers}");
                
                var viewModel = new HomeViewModel
                {
                    Cities = cities,
                    TotalBarbershops = totalBarbershops,
                    TotalAppointments = totalAppointments,
                    TotalCustomers = totalCustomers,
                    FeaturedBarbershops = await _context.Barbershops
                        .Include(b => b.City)
                        .Include(b => b.Services)
                        .Where(b => b.IsActive)
                        .OrderByDescending(b => b.CreatedAt)
                        .Take(6)
                        .ToListAsync(),
                    PopularServices = await _context.Services
                        .Include(s => s.Barbershop)
                        .Where(s => s.Barbershop.IsActive)
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

                // Add user profile data if authenticated
                if (User.Identity.IsAuthenticated)
                {
                    var user = await _userManager.GetUserAsync(User);
                    if (user != null)
                    {
                        var userAppointments = await _context.Appointments
                            .Include(a => a.Barbershop)
                            .ThenInclude(b => b.City)
                            .Include(a => a.Service)
                            .Where(a => a.CustomerEmail == user.Email || a.CustomerId == user.Id)
                            .OrderByDescending(a => a.AppointmentDate)
                            .ToListAsync();

                        viewModel.UserProfile = new ProfileViewModel
                        {
                            User = user,
                            Appointments = userAppointments,
                            UpcomingAppointments = userAppointments.Where(a => a.AppointmentDate.Add(a.AppointmentTime) > DateTime.Now).Take(3).ToList(),
                            PastAppointments = userAppointments.Where(a => a.AppointmentDate.Add(a.AppointmentTime) <= DateTime.Now).Take(3).ToList(),
                            TotalAppointments = userAppointments.Count,
                            TotalSpent = userAppointments.Where(a => a.Status == AppointmentStatus.Completed).Sum(a => a.TotalPrice)
                        };
                    }
                }

                return View(viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading home page data");
                
                // Return view with empty model in case of error
                var emptyModel = new HomeViewModel
                {
                    Cities = new List<City>(),
                    FeaturedBarbershops = new List<Barbershop>(),
                    PopularServices = new List<ServiceSummary>(),
                    RecentAppointments = new List<Appointment>()
                };
                
                return View(emptyModel);
            }
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
        public async Task<IActionResult> GetCityBarbershops(int cityId)
        {
            try
            {
                var barbershops = await _context.Barbershops
                    .Include(b => b.Services)
                    .Include(b => b.City)
                    .Where(b => b.CityId == cityId && b.IsActive)
                    .OrderBy(b => b.Name)
                    .Select(b => new
                    {
                        b.Id,
                        b.Name,
                        b.Address,
                        b.Phone,
                        b.Description,
                        Services = b.Services.Select(s => new
                        {
                            s.Name,
                            s.Price
                        }).ToList()
                    })
                    .ToListAsync();

                return Json(barbershops);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading barbershops for city {CityId}", cityId);
                return Json(new List<object>());
            }
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

        [HttpGet]
        public async Task<IActionResult> TestData()
        {
            try
            {
                var citiesCount = await _context.Cities.CountAsync();
                var barbershopsCount = await _context.Barbershops.CountAsync();
                var appointmentsCount = await _context.Appointments.CountAsync();
                
                var cities = await _context.Cities.Take(5).ToListAsync();
                
                return Json(new
                {
                    success = true,
                    data = new
                    {
                        citiesCount,
                        barbershopsCount,
                        appointmentsCount,
                        cities = cities.Select(c => new { c.Id, c.Name, c.Province })
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }

        [HttpGet]
        public async Task<IActionResult> City(int id)
        {
            var city = await _context.Cities
                .Include(c => c.Barbershops.Where(b => b.IsActive))
                .ThenInclude(b => b.Services.Where(s => s.IsActive))
                .FirstOrDefaultAsync(c => c.Id == id);

            if (city == null)
            {
                return NotFound();
            }

            var allServices = city.Barbershops.SelectMany(b => b.Services).ToList();

            var viewModel = new CityViewModel
            {
                City = city,
                Barbershops = city.Barbershops.OrderBy(b => b.Name).ToList(),
                TotalServices = allServices.Count,
                MinPrice = allServices.Any() ? allServices.Min(s => s.Price) : 0,
                MaxPrice = allServices.Any() ? allServices.Max(s => s.Price) : 0,
                AveragePrice = allServices.Any() ? allServices.Average(s => s.Price) : 0
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
                    .Include(b => b.Services.Where(s => s.IsActive))
                    .FirstOrDefaultAsync(b => b.Id == barbershopId && b.IsActive);

                if (barbershop == null)
                {
                    return Json(null);
                }

                var result = new
                {
                    id = barbershop.Id,
                    name = barbershop.Name,
                    description = barbershop.Description,
                    address = barbershop.Address,
                    phone = barbershop.Phone,
                    imageUrl = barbershop.ImageUrl,
                    openTime = barbershop.OpenTime.ToString(@"hh\:mm"),
                    closeTime = barbershop.CloseTime.ToString(@"hh\:mm"),
                    workingDays = barbershop.WorkingDays,
                    cityName = barbershop.City?.Name,
                    services = barbershop.Services.Select(s => new
                    {
                        id = s.Id,
                        name = s.Name,
                        description = s.Description,
                        price = s.Price,
                        duration = s.Duration
                    }).ToList()
                };

                return Json(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading barbershop details for {BarbershopId}", barbershopId);
                return Json(null);
            }
        }    }
}
