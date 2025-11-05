using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RazorKing.Data;
using RazorKing.Models;
using RazorKing.Models.ViewModels;

namespace RazorKing.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AdminController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public AdminController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            var dashboardData = new AdminDashboardViewModel
            {
                TotalUsers = await _context.Users.CountAsync(),
                TotalBarbershops = await _context.Barbershops.CountAsync(),
                TotalAppointments = await _context.Appointments.CountAsync(),
                TotalCities = await _context.Cities.CountAsync(),
                TotalServices = await _context.Services.CountAsync(),
                PendingAppointments = await _context.Appointments.CountAsync(a => a.Status == AppointmentStatus.Pending),
                ActiveBarbershops = await _context.Barbershops.CountAsync(b => b.IsActive),
                TodayAppointments = await _context.Appointments.CountAsync(a => a.AppointmentDate.Date == DateTime.Today),
                MonthlyRevenue = await _context.Appointments
                    .Where(a => a.Status == AppointmentStatus.Completed && 
                               a.AppointmentDate.Month == DateTime.Now.Month &&
                               a.AppointmentDate.Year == DateTime.Now.Year)
                    .SumAsync(a => (decimal?)a.TotalPrice) ?? 0,
                RecentAppointments = await _context.Appointments
                    .Include(a => a.Barbershop)
                    .Include(a => a.Service)
                    .Where(a => a.Barbershop != null && a.Service != null)
                    .OrderByDescending(a => a.CreatedAt)
                    .Take(10)
                    .ToListAsync()
            };

            return View(dashboardData);
        }

        #region Users Management
        public async Task<IActionResult> Users(int page = 1, string search = "")
        {
            var query = _context.Users.AsQueryable();
            
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u => u.FirstName.Contains(search) || 
                                        u.LastName.Contains(search) || 
                                        u.Email.Contains(search));
            }

            var pageSize = 20;
            var totalUsers = await query.CountAsync();
            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var viewModel = new AdminUsersViewModel
            {
                Users = users,
                CurrentPage = page,
                TotalPages = (int)Math.Ceiling((double)totalUsers / pageSize),
                SearchTerm = search
            };

            return View(viewModel);
        }

        [HttpPost]
        public async Task<IActionResult> ToggleUserStatus(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user != null)
            {
                user.IsActive = !user.IsActive;
                await _userManager.UpdateAsync(user);
            }
            return RedirectToAction(nameof(Users));
        }

        [HttpPost]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user != null)
            {
                await _userManager.DeleteAsync(user);
            }
            return RedirectToAction(nameof(Users));
        }
        #endregion

        #region Cities Management
        public async Task<IActionResult> Cities()
        {
            var cities = await _context.Cities
                .Include(c => c.Barbershops)
                .OrderBy(c => c.Name)
                .ToListAsync();
            return View(cities);
        }

        public IActionResult CreateCity()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> CreateCity(City city)
        {
            if (ModelState.IsValid)
            {
                _context.Cities.Add(city);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Cities));
            }
            return View(city);
        }

        public async Task<IActionResult> EditCity(int id)
        {
            var city = await _context.Cities.FindAsync(id);
            if (city == null) return NotFound();
            return View(city);
        }

        [HttpPost]
        public async Task<IActionResult> EditCity(City city)
        {
            if (ModelState.IsValid)
            {
                _context.Cities.Update(city);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Cities));
            }
            return View(city);
        }

        [HttpPost]
        public async Task<IActionResult> DeleteCity(int id)
        {
            var city = await _context.Cities.FindAsync(id);
            if (city != null)
            {
                _context.Cities.Remove(city);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Cities));
        }
        #endregion
    

   #region Barbershops Management
        public async Task<IActionResult> Barbershops(int page = 1, string search = "")
        {
            var query = _context.Barbershops
                .Include(b => b.City)
                .Include(b => b.Owner)
                .AsQueryable();
            
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(b => b.Name.Contains(search) || 
                                        b.Address.Contains(search) ||
                                        b.City.Name.Contains(search));
            }

            var pageSize = 20;
            var totalBarbershops = await query.CountAsync();
            var barbershops = await query
                .OrderByDescending(b => b.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var viewModel = new AdminBarbershopsViewModel
            {
                Barbershops = barbershops,
                CurrentPage = page,
                TotalPages = (int)Math.Ceiling((double)totalBarbershops / pageSize),
                SearchTerm = search
            };

            return View(viewModel);
        }

        [HttpPost]
        public async Task<IActionResult> ToggleBarbershopStatus(int id)
        {
            var barbershop = await _context.Barbershops.FindAsync(id);
            if (barbershop != null)
            {
                barbershop.IsActive = !barbershop.IsActive;
                barbershop.UpdatedAt = DateTime.Now;
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Barbershops));
        }

        [HttpPost]
        public async Task<IActionResult> DeleteBarbershop(int id)
        {
            var barbershop = await _context.Barbershops.FindAsync(id);
            if (barbershop != null)
            {
                _context.Barbershops.Remove(barbershop);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Barbershops));
        }
        #endregion

        #region Services Management
        public async Task<IActionResult> Services(int page = 1, string search = "")
        {
            var query = _context.Services
                .Include(s => s.Barbershop)
                .ThenInclude(b => b.City)
                .AsQueryable();
            
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(s => s.Name.Contains(search) || 
                                        s.Barbershop.Name.Contains(search));
            }

            var pageSize = 20;
            var totalServices = await query.CountAsync();
            var services = await query
                .OrderByDescending(s => s.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var viewModel = new AdminServicesViewModel
            {
                Services = services,
                CurrentPage = page,
                TotalPages = (int)Math.Ceiling((double)totalServices / pageSize),
                SearchTerm = search
            };

            return View(viewModel);
        }

        [HttpPost]
        public async Task<IActionResult> ToggleServiceStatus(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service != null)
            {
                service.IsActive = !service.IsActive;
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Services));
        }

        [HttpPost]
        public async Task<IActionResult> DeleteService(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service != null)
            {
                _context.Services.Remove(service);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Services));
        }
        #endregion

        #region Appointments Management
        public async Task<IActionResult> Appointments(int page = 1, string search = "", AppointmentStatus? status = null)
        {
            var query = _context.Appointments
                .Include(a => a.Barbershop)
                .Include(a => a.Service)
                .Include(a => a.Customer)
                .AsQueryable();
            
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(a => a.CustomerName.Contains(search) || 
                                        a.CustomerPhone.Contains(search) ||
                                        a.Barbershop.Name.Contains(search));
            }

            if (status.HasValue)
            {
                query = query.Where(a => a.Status == status.Value);
            }

            var pageSize = 20;
            var totalAppointments = await query.CountAsync();
            var appointments = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var viewModel = new AdminAppointmentsViewModel
            {
                Appointments = appointments,
                CurrentPage = page,
                TotalPages = (int)Math.Ceiling((double)totalAppointments / pageSize),
                SearchTerm = search,
                SelectedStatus = status
            };

            return View(viewModel);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateAppointmentStatus(int id, AppointmentStatus status)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment != null)
            {
                appointment.Status = status;
                if (status == AppointmentStatus.Completed)
                {
                    appointment.CompletedAt = DateTime.Now;
                }
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Appointments));
        }

        [HttpPost]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment != null)
            {
                _context.Appointments.Remove(appointment);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Appointments));
        }
        #endregion

        #region Reports
        public async Task<IActionResult> Reports()
        {
            var reportsData = new AdminReportsViewModel
            {
                DailyAppointments = await GetDailyAppointmentsData(),
                MonthlyRevenue = await GetMonthlyRevenueData(),
                TopBarbershops = await GetTopBarbershopsData(),
                TopServices = await GetTopServicesData(),
                UserRegistrations = await GetUserRegistrationsData()
            };

            return View(reportsData);
        }

        private async Task<List<DailyAppointmentData>> GetDailyAppointmentsData()
        {
            var last30Days = DateTime.Now.AddDays(-30).Date;
            var appointments = await _context.Appointments
                .Where(a => a.AppointmentDate.Date >= last30Days)
                .ToListAsync();
                
            return appointments
                .GroupBy(a => a.AppointmentDate.Date)
                .Select(g => new DailyAppointmentData
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToList();
        }

        private async Task<List<MonthlyRevenueData>> GetMonthlyRevenueData()
        {
            var last12Months = DateTime.Now.AddMonths(-12).Date;
            var appointments = await _context.Appointments
                .Where(a => a.Status == AppointmentStatus.Completed && a.AppointmentDate.Date >= last12Months)
                .ToListAsync();
                
            return appointments
                .GroupBy(a => new { a.AppointmentDate.Year, a.AppointmentDate.Month })
                .Select(g => new MonthlyRevenueData
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Revenue = g.Sum(a => (decimal?)a.TotalPrice) ?? 0
                })
                .OrderBy(d => d.Year).ThenBy(d => d.Month)
                .ToList();
        }

        private async Task<List<TopBarbershopData>> GetTopBarbershopsData()
        {
            return await _context.Barbershops
                .Select(b => new TopBarbershopData
                {
                    Name = b.Name,
                    AppointmentsCount = _context.Appointments.Count(a => a.BarbershopId == b.Id),
                    Revenue = _context.Appointments
                        .Where(a => a.BarbershopId == b.Id && a.Status == AppointmentStatus.Completed)
                        .Sum(a => (decimal?)a.TotalPrice) ?? 0
                })
                .OrderByDescending(b => b.Revenue)
                .Take(10)
                .ToListAsync();
        }

        private async Task<List<TopServiceData>> GetTopServicesData()
        {
            return await _context.Services
                .Include(s => s.Barbershop)
                .Select(s => new TopServiceData
                {
                    Name = s.Name,
                    BarbershopName = s.Barbershop.Name,
                    BookingsCount = _context.Appointments.Count(a => a.ServiceId == s.Id),
                    Revenue = _context.Appointments
                        .Where(a => a.ServiceId == s.Id && a.Status == AppointmentStatus.Completed)
                        .Sum(a => (decimal?)a.TotalPrice) ?? 0
                })
                .OrderByDescending(s => s.BookingsCount)
                .Take(10)
                .ToListAsync();
        }

        private async Task<List<UserRegistrationData>> GetUserRegistrationsData()
        {
            var last12Months = DateTime.Now.AddMonths(-12).Date;
            var users = await _context.Users
                .Where(u => u.CreatedAt.Date >= last12Months)
                .ToListAsync();
                
            return users
                .GroupBy(u => new { u.CreatedAt.Year, u.CreatedAt.Month })
                .Select(g => new UserRegistrationData
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Count = g.Count()
                })
                .OrderBy(d => d.Year).ThenBy(d => d.Month)
                .ToList();
        }

        [HttpGet]
        public async Task<IActionResult> DebugAppointments()
        {
            try
            {
                var allAppointments = await _context.Appointments
                    .Include(a => a.Barbershop)
                    .Include(a => a.Service)
                    .Include(a => a.Customer)
                    .OrderByDescending(a => a.CreatedAt)
                    .ToListAsync();

                var appointmentsByStatus = allAppointments
                    .GroupBy(a => a.Status)
                    .ToDictionary(g => g.Key.ToString(), g => g.Count());

                var appointmentsByBarbershop = allAppointments
                    .Where(a => a.Barbershop != null)
                    .GroupBy(a => a.Barbershop.Name)
                    .ToDictionary(g => g.Key, g => g.Count());

                return Json(new
                {
                    success = true,
                    totalAppointments = allAppointments.Count,
                    appointmentsByStatus = appointmentsByStatus,
                    appointmentsByBarbershop = appointmentsByBarbershop,
                    recentAppointments = allAppointments.Take(20).Select(a => new
                    {
                        id = a.Id,
                        customerName = a.CustomerName,
                        customerEmail = a.CustomerEmail,
                        customerId = a.CustomerId,
                        appointmentDate = a.AppointmentDate.ToString("yyyy-MM-dd"),
                        appointmentTime = a.AppointmentTime.ToString(@"hh\:mm"),
                        status = a.Status.ToString(),
                        barbershopName = a.Barbershop?.Name ?? "نامشخص",
                        serviceName = a.Service?.Name ?? "نامشخص",
                        createdAt = a.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
                        totalPrice = a.TotalPrice
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
        #endregion
    }
}
