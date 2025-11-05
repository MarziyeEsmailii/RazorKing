using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RazorKing.Data;

namespace RazorKing.Controllers
{
    public class DatabaseController : Controller
    {
        private readonly ApplicationDbContext _context;

        public DatabaseController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Status()
        {
            try
            {
                var status = new
                {
                    DatabaseConnected = await _context.Database.CanConnectAsync(),
                    Tables = new
                    {
                        Cities = await _context.Cities.CountAsync(),
                        Barbershops = await _context.Barbershops.CountAsync(),
                        Services = await _context.Services.CountAsync(),
                        Appointments = await _context.Appointments.CountAsync(),
                        Users = await _context.Users.CountAsync(),
                        AppointmentServices = await _context.AppointmentServices.CountAsync(),
                        BarberSchedules = await _context.BarberSchedules.CountAsync()
                    },
                    SampleData = new
                    {
                        FirstCity = await _context.Cities.FirstOrDefaultAsync(),
                        FirstBarbershop = await _context.Barbershops
                            .Include(b => b.City)
                            .FirstOrDefaultAsync(),
                        FirstService = await _context.Services
                            .Include(s => s.Barbershop)
                            .FirstOrDefaultAsync()
                    }
                };

                return Json(status);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    Error = ex.Message,
                    DatabaseConnected = false
                });
            }
        }

        public async Task<IActionResult> TestQueries()
        {
            try
            {
                var results = new
                {
                    CitiesWithBarbershops = await _context.Cities
                        .Include(c => c.Barbershops)
                        .Select(c => new
                        {
                            c.Name,
                            BarbershopCount = c.Barbershops.Count
                        })
                        .ToListAsync(),
                    
                    BarbershopsWithServices = await _context.Barbershops
                        .Include(b => b.Services)
                        .Include(b => b.City)
                        .Select(b => new
                        {
                            b.Name,
                            City = b.City.Name,
                            ServiceCount = b.Services.Count,
                            Services = b.Services.Select(s => new { s.Name, s.Price }).ToList()
                        })
                        .ToListAsync(),
                    
                    ServicePriceRanges = await _context.Services
                        .GroupBy(s => s.Name)
                        .Select(g => new
                        {
                            ServiceName = g.Key,
                            Count = g.Count(),
                            MinPrice = g.Min(s => s.Price),
                            MaxPrice = g.Max(s => s.Price),
                            AvgPrice = g.Average(s => s.Price)
                        })
                        .ToListAsync()
                };

                return Json(results);
            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }
        }
    }
}
